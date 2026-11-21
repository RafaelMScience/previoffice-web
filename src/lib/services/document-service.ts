import type { LegalDocument, DocumentCategory } from '@/types/document';
import { compressDocumentImage } from '@/lib/utils/image-compressor';
import { dedupeRequest, invalidateCache } from '../cache/request-cache.ts';

/**
 * Client-facing service for managing end-to-end encrypted documents.
 */

export async function fetchClientDocuments(
  clientId: string,
  page: number = 1,
  limit: number = 20
): Promise<LegalDocument[]> {
  return dedupeRequest(`documents:list:${clientId}:${page}:${limit}`, async () => {
    const response = await fetch(
      `/api/documents?clientId=${encodeURIComponent(clientId)}&page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Erro ao carregar documentos do cofre.');
    }

    const data = await response.json();
    return data.documents || [];
  }, { ttlMs: 15000 });
}

export async function uploadClientDocument(params: {
  file: File;
  clientId: string;
  displayName: string;
  category: DocumentCategory;
  attendanceId?: string;
}): Promise<LegalDocument> {
  const { file, clientId, displayName, category, attendanceId } = params;

  // 1. Auto-compress image documents to high-clarity WebP before encryption
  let fileToUpload = file;
  if (file.type.startsWith('image/')) {
    fileToUpload = await compressDocumentImage(file);
  }

  // 2. Prepare FormData
  const formData = new FormData();
  formData.append('file', fileToUpload);
  formData.append('clientId', clientId);
  formData.append('displayName', displayName);
  formData.append('category', category);
  if (attendanceId) {
    formData.append('attendanceId', attendanceId);
  }

  // 3. Post to encrypted upload endpoint
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao fazer upload do documento criptografado.');
  }

  const data = await response.json();
  invalidateCache(`documents:list:${clientId}`);
  return data.document;
}

export async function deleteClientDocument(
  documentId: string
): Promise<{ success: boolean; deletedByName: string; displayName: string }> {
  const response = await fetch(`/api/documents/${encodeURIComponent(documentId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao excluir documento.');
  }

  const result = await response.json();
  invalidateCache('documents:list:');
  return result;
}

export function getDocumentViewUrl(documentId: string): string {
  return `/api/documents/${encodeURIComponent(documentId)}/view`;
}

export function getDocumentDownloadUrl(documentId: string): string {
  return `/api/documents/${encodeURIComponent(documentId)}/download`;
}
