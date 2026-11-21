import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { decryptBuffer } from '@/lib/security/encryption';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const adminClient = createAdminClient();

    // 1. Caller Authentication
    let callerUser: any = null;
    try {
      const serverClient = await createClientServer();
      const { data } = await serverClient.auth.getUser();
      callerUser = data?.user || null;
    } catch {
      // Ignored if called without cookie context
    }

    if (!callerUser) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data } = await adminClient.auth.getUser(token);
        callerUser = data?.user || null;
      }
    }

    if (!callerUser) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para visualizar o documento.' },
        { status: 401 }
      );
    }

    // 2. Fetch tenant_id
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('tenant_id')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!profile?.tenant_id) {
      return NextResponse.json(
        { error: 'Perfil do usuário não encontrado ou sem escritório associado.' },
        { status: 403 }
      );
    }

    // 3. Fetch document record
    const { data: doc, error: docError } = await (adminClient.from('documents') as any)
      .select('*')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Documento não encontrado ou já foi excluído.' },
        { status: 404 }
      );
    }

    // 4. Download encrypted ciphertext from Supabase Storage
    const { data: encryptedBlob, error: downloadError } = await adminClient.storage
      .from('client-documents')
      .download(doc.storage_path);

    if (downloadError || !encryptedBlob) {
      return NextResponse.json(
        { error: `Erro ao baixar documento do cofre: ${downloadError?.message || 'Arquivo não encontrado'}` },
        { status: 500 }
      );
    }

    const encryptedArrayBuffer = await encryptedBlob.arrayBuffer();
    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);

    // 5. Decrypt in memory with AES-256-GCM
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    if (!decryptedBuffer || decryptedBuffer.length === 0) {
      return NextResponse.json(
        { error: 'Falha na descriptografia do documento. Chave de proteção não corresponde.' },
        { status: 500 }
      );
    }

    // 6. Return decrypted stream with inline disposition for viewing / printing
    return new NextResponse(new Uint8Array(decryptedBuffer), {
      status: 200,
      headers: {
        'Content-Type': doc.mime_type || 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(doc.original_name)}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Length': decryptedBuffer.length.toString(),
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "default-src 'self'; frame-ancestors 'self';",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno.' }, { status: 500 });
  }
}
