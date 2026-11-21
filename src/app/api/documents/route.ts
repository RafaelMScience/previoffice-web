import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import {
  sanitizePagination,
  buildPaginationMeta,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from '@/lib/utils/pagination';
import type { LegalDocument, DocumentCategory } from '@/types/document';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId é obrigatório.' }, { status: 400 });
    }

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
        { error: 'Não autenticado. Faça login para acessar os documentos.' },
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

    // 3. Sanitize pagination parameters (default 20, max 100)
    const paginationParams = sanitizePagination(
      searchParams.get('page'),
      searchParams.get('limit'),
      DEFAULT_PAGE_LIMIT,
      MAX_PAGE_LIMIT
    );

    // 4. Query active documents with exact count and strict range in a single PostgREST call
    const { data: rows, count: totalCount, error } = await (adminClient.from('documents') as any)
      .select('*', { count: 'exact' })
      .eq('client_id', clientId)
      .eq('tenant_id', profile.tenant_id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(paginationParams.from, paginationParams.to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const documents: LegalDocument[] = (rows || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      clientId: row.client_id,
      attendanceId: row.attendance_id || undefined,
      originalName: row.original_name,
      displayName: row.display_name,
      category: row.category as DocumentCategory,
      mimeType: row.mime_type,
      extension: row.extension,
      sizeBytes: row.size_bytes,
      storagePath: row.storage_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at || undefined,
      deletedByName: row.deleted_by_name || undefined,
      deletedByUserId: row.deleted_by_user_id || undefined,
    }));

    const pagination = buildPaginationMeta(
      totalCount || 0,
      paginationParams.page,
      paginationParams.limit
    );

    return NextResponse.json({ documents, pagination });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Erro interno.' }, { status: 500 });
  }
}
