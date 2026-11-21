'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Move,
  Camera,
  Loader2,
} from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onClose: () => void;
  onCropComplete: (croppedFile: File, previewUrl: string) => void;
}

export function AvatarCropModal({
  isOpen,
  imageSrc,
  fileName = 'avatar.webp',
  onClose,
  onCropComplete,
}: AvatarCropModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset transforms whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsProcessing(false);
    }
  }, [isOpen, imageSrc]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Unified Pointer Events for mouse, touch, and stylus with PointerCapture
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      setIsDragging(false);
    }
  };

  // Keyboard navigation for accessibility (a11y)
  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    const STEP = 8;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setPosition((p) => ({ ...p, y: p.y - STEP }));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setPosition((p) => ({ ...p, y: p.y + STEP }));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setPosition((p) => ({ ...p, x: p.x - STEP }));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setPosition((p) => ({ ...p, x: p.x + STEP }));
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  // Canvas Crop & Export to WebP 256x256
  const handleConfirmCrop = async () => {
    if (!imageRef.current || !containerRef.current) return;

    try {
      setIsProcessing(true);

      const targetSize = 256;
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Não foi possível inicializar contexto do Canvas.');
      }

      const img = imageRef.current;
      const containerRect = containerRef.current.getBoundingClientRect();

      // Mask size in UI is 240px
      const maskSize = 240;
      const scaleFactor = targetSize / maskSize;

      // Apply zoom & position scaled to the 256px output canvas
      const adjustedX = position.x * scaleFactor;
      const adjustedY = position.y * scaleFactor;

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      // Fit aspect ratio inside the container initial display
      const initialFit = Math.min(
        containerRect.width / imgWidth,
        containerRect.height / imgHeight
      );

      const drawWidth = imgWidth * initialFit * zoom * scaleFactor;
      const drawHeight = imgHeight * initialFit * zoom * scaleFactor;

      ctx.save();
      // Translate to canvas center combined with user screen-space pan offset
      ctx.translate(targetSize / 2 + adjustedX, targetSize / 2 + adjustedY);

      // Rotate around the transformed center point
      ctx.rotate((rotation * Math.PI) / 180);

      // Draw the image centered at (0, 0)
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      // Convert Canvas to WebP blob with high quality and small payload (~25-45KB)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            alert('Falha ao processar recorte de imagem.');
            setIsProcessing(false);
            return;
          }

          const cleanFileName = fileName.replace(/\.[^/.]+$/, '') + '.webp';
          const croppedFile = new File([blob], cleanFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });

          const previewUrl = URL.createObjectURL(blob);
          onCropComplete(croppedFile, previewUrl);
          setIsProcessing(false);
          onClose();
        },
        'image/webp',
        0.9
      );
    } catch (err: any) {
      console.error('Error during canvas crop:', err);
      alert(`Erro ao enquadrar imagem: ${err?.message || 'Erro inesperado'}`);
      setIsProcessing(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#0B192E] text-white rounded-2xl shadow-2xl border border-white/10 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#C89543]" />
            <h3 id="crop-title" className="text-sm font-bold text-white tracking-wide">
              Ajustar Foto de Perfil
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar janela de recorte"
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions banner */}
        <div className="bg-[#142642] px-4 py-2 text-[11px] text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-[#C89543]" />
            Arraste para enquadrar ou use as setas do teclado
          </span>
          <span className="text-[10px] font-mono text-[#C89543] font-semibold">
            256×256 px • WebP
          </span>
        </div>

        {/* Cropper Viewport Container (300x300) */}
        <div className="p-4 flex flex-col items-center justify-center bg-slate-950/60">
          <div
            ref={containerRef}
            tabIndex={0}
            role="region"
            aria-label="Área interativa de enquadramento da foto. Arraste com o ponteiro ou use as setas do teclado para reposicionar a imagem."
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleContainerKeyDown}
            className={`relative w-[300px] h-[300px] overflow-hidden rounded-xl bg-slate-900 select-none touch-none outline-none focus:ring-2 focus:ring-[#C89543] ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Image Layer */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                transformOrigin: 'center center',
              }}
            >
              <img
                ref={imageRef}
                src={imageSrc}
                crossOrigin="anonymous"
                alt="Enquadramento do avatar"
                className="max-w-none max-h-none select-none pointer-events-none"
                draggable={false}
                style={{
                  maxWidth: '300px',
                  maxHeight: '300px',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* Circular Dark Cutout Mask Overlay (SVG) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 300 300"
            >
              <defs>
                <mask id="avatar-crop-mask">
                  {/* Fill entire background with white */}
                  <rect width="300" height="300" fill="white" />
                  {/* Cut out center circle with black */}
                  <circle cx="150" cy="150" r="120" fill="black" />
                </mask>
              </defs>
              {/* Dimmed backdrop outside the circle */}
              <rect
                width="300"
                height="300"
                fill="rgba(5, 12, 24, 0.72)"
                mask="url(#avatar-crop-mask)"
              />
              {/* Golden circular outline */}
              <circle
                cx="150"
                cy="150"
                r="120"
                fill="none"
                stroke="#C89543"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="opacity-90"
              />
            </svg>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-4 bg-[#0B192E] border-t border-white/10 space-y-3.5">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.2).toFixed(1))))}
              aria-label="Diminuir zoom"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              aria-label="Controle de Zoom do Avatar"
              className="flex-1 accent-[#C89543] bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
            />

            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
              aria-label="Aumentar zoom"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Tools & Preset Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleRotate}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 flex items-center gap-1 transition-colors"
                title="Girar 90 graus"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#C89543]" />
                <span className="hidden sm:inline">Girar</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 flex items-center gap-1 transition-colors"
                title="Restaurar padrão"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Resetar</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C89543] hover:bg-[#d6a555] text-[#0B192E] flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Recortando...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Aplicar Enquadramento</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
