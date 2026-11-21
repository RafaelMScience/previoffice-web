import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
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
        { error: 'Não autenticado. Faça login para excluir o documento.' },
        { status: 401 }
      );
    }

    // 2. Fetch operator profile
    const { data: profile } = await (adminClient.from('profiles') as any)
      .select('id, tenant_id, full_name, email')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!profile?.tenant_id) {
      return NextResponse.json(
        { error: 'Perfil do usuário não encontrado ou sem escritório associado.' },
        { status: 403 }
      );
    }

    // 3. Find document to verify ownership and ensure not already deleted
    const { data: doc, error: docError } = await (adminClient.from('documents') as any)
      .select('id, display_name, storage_path')
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (docError || !doc) {
      return NextResponse.json(
        { error: 'Documento não encontrado ou já foi excluído anteriormente.' },
        { status: 404 }
      );
    }

    const operatorName = profile.full_name || profile.email || 'Operador Autorizado';
    const deletedTimestamp = new Date().toISOString();

    // 4. Soft-delete document and record audit of who deleted it
    const { error: updateError } = await (adminClient.from('documents') as any)
      .update({
        deleted_at: deletedTimestamp,
        deleted_by_name: operatorName,
        deleted_by_user_id: profile.id,
      })
      .eq('id', id)
      .eq('tenant_id', profile.tenant_id);

    if (updateError) {
      return NextResponse.json(
        { error: `Erro ao excluir documento: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id,
      displayName: doc.display_name,
      deletedAt: deletedTimestamp,
      deletedByName: operatorName,
      message: `Documento "${doc.display_name}" excluído com sucesso por ${operatorName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno.' }, { status: 500 });
  }
}
