import { getDocumentViewUrl } from '@/lib/services/document-service';
import type { LegalDocument } from '@/types/document';

/**
 * Downloads and prints a decrypted document in-memory using an invisible iframe.
 */
export async function executePrintDocument(
  doc: LegalDocument,
  onComplete?: () => void
): Promise<void> {
  try {
    const viewUrl = getDocumentViewUrl(doc.id);
    const res = await fetch(viewUrl);
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || 'Falha ao carregar arquivo para impressão.');
    }
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Create an invisible iframe for seamless in-browser printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = blobUrl;

    const cleanup = () => {
      onComplete?.();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    };

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.open(blobUrl, '_blank');
      }
      cleanup();
    };

    iframe.onerror = () => {
      window.open(blobUrl, '_blank');
      cleanup();
    };

    document.body.appendChild(iframe);
  } catch (err: any) {
    onComplete?.();
    throw new Error(err?.message || 'Falha ao imprimir documento.');
  }
}
