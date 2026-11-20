import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { encryptBuffer } from '@/lib/security/encryption';
import type { LegalDocument, DocumentCategory } from '@/types/document';

export async function POST(request: NextRequest) {
  try {
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
        { error: 'Não autenticado. Faça login para fazer upload de documentos.' },
        { status: 401 }
      );
    }

    // 2. Fetch tenant_id and profile
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('id, tenant_id, full_name')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!profile?.tenant_id) {
      return NextResponse.json(
        { error: 'Perfil do usuário não encontrado ou sem escritório associado.' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const clientId = formData.get('clientId') as string | null;
    const displayName = (formData.get('displayName') as string | null)?.trim();
    const category = (formData.get('category') as DocumentCategory | null) || 'OTHER';
    const attendanceId = (formData.get('attendanceId') as string | null)?.trim() || null;

    if (!file || !clientId || !displayName) {
      return NextResponse.json(
        { error: 'Arquivo, cliente e nome de exibição são obrigatórios.' },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        { error: 'O arquivo enviado está vazio.' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB max
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'O tamanho do arquivo excede o limite máximo permitido de 25 MB.' },
        { status: 400 }
      );
    }

    // 3. Verify client belongs to this tenant
    const { data: clientRecord } = await (adminClient.from('clients') as any)
      .select('id')
      .eq('id', clientId)
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle();

    if (!clientRecord) {
      return NextResponse.json(
        { error: 'Cliente não encontrado ou não pertence a este escritório.' },
        { status: 404 }
      );
    }

    // 4. Read raw file buffer and encrypt using AES-256-GCM
    const fileArrayBuffer = await file.arrayBuffer();
    const rawBuffer = Buffer.from(fileArrayBuffer);
    const encryptedBuffer = encryptBuffer(rawBuffer);

    // 5. Generate secure storage path (.apdoc = PreviOffice Encrypted Document)
    const fileExt = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.toLowerCase()}`
      : '.pdf';
    const documentId = crypto.randomUUID();
    const storagePath = `${profile.tenant_id}/${clientId}/${documentId}.apdoc`;

    // 6. Upload encrypted ciphertext to client-documents bucket
    const { error: uploadError } = await adminClient.storage
      .from('client-documents')
      .upload(storagePath, encryptedBuffer, {
        contentType: 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Erro ao armazenar arquivo criptografado: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 7. Insert document metadata into public.documents
    const insertPayload = {
      id: documentId,
      tenant_id: profile.tenant_id,
      client_id: clientId,
      attendance_id: attendanceId || null,
      original_name: file.name,
      display_name: displayName,
      category,
      mime_type: file.type || 'application/octet-stream',
      extension: fileExt,
      size_bytes: file.size,
      storage_path: storagePath,
    };

    const { data: newRow, error: insertError } = await (adminClient.from('documents') as any)
      .insert(insertPayload)
      .select()
      .single();

    if (insertError) {
      // Cleanup uploaded blob on failure
      await adminClient.storage.from('client-documents').remove([storagePath]);
      return NextResponse.json(
        { error: `Erro ao registrar documento no banco: ${insertError.message}` },
        { status: 500 }
      );
    }

    const createdDoc: LegalDocument = {
      id: newRow.id,
      tenantId: newRow.tenant_id,
      clientId: newRow.client_id,
      attendanceId: newRow.attendance_id || undefined,
      originalName: newRow.original_name,
      displayName: newRow.display_name,
      category: newRow.category as DocumentCategory,
      mimeType: newRow.mime_type,
      extension: newRow.extension,
      sizeBytes: newRow.size_bytes,
      storagePath: newRow.storage_path,
      createdAt: newRow.created_at,
      updatedAt: newRow.updated_at,
    };

    return NextResponse.json({ document: createdDoc }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno no upload.' }, { status: 500 });
  }
}
