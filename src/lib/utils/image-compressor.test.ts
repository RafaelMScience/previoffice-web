import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  compressClientImage,
  compressAvatarPhoto,
  compressDocumentImage,
} from './image-compressor.ts';

describe('Image Compressor Utility', () => {
  it('should return non-image files unchanged without modification', async () => {
    const textBlob = new Blob(['sample pdf content'], { type: 'application/pdf' });
    const fakePdfFile = new File([textBlob], 'documento.pdf', { type: 'application/pdf' });

    const result = await compressClientImage(fakePdfFile);
    assert.strictEqual(result.name, 'documento.pdf');
    assert.strictEqual(result.type, 'application/pdf');
  });

  it('compressAvatarPhoto should return non-image files unchanged', async () => {
    const docBlob = new Blob(['word content'], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const fakeDoc = new File([docBlob], 'contrato.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const result = await compressAvatarPhoto(fakeDoc);
    assert.strictEqual(result.name, 'contrato.docx');
  });

  it('compressDocumentImage should return non-image files unchanged', async () => {
    const cnisBlob = new Blob(['cnis data'], { type: 'application/pdf' });
    const fakeCnis = new File([cnisBlob], 'extrato_cnis.pdf', { type: 'application/pdf' });

    const result = await compressDocumentImage(fakeCnis);
    assert.strictEqual(result.name, 'extrato_cnis.pdf');
    assert.strictEqual(result.type, 'application/pdf');
  });

  it('should gracefully handle SSR environment without window/document', async () => {
    const imgBlob = new Blob(['fake image bytes'], { type: 'image/png' });
    const fakeImg = new File([imgBlob], 'foto_rg.png', { type: 'image/png' });

    // In Node.js environment where document/canvas is undefined, it resolves gracefully
    const result = await compressClientImage(fakeImg);
    assert.ok(result);
    assert.strictEqual(result.name, 'foto_rg.png');
  });
});
