'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  Sliders,
  Sparkles,
  Camera,
  Upload,
  Check,
  X,
  Undo2,
  Image as ImageIcon,
} from 'lucide-react';
import { PhotoEditState } from '@/types';

interface PhotoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  onSave: (editedImageUrl: string) => void;
}

const DEFAULT_STATE: PhotoEditState = {
  zoom: 1,
  rotation: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  filter: 'none',
};

const FILTERS = [
  { id: 'none', label: 'Original', class: '' },
  { id: 'fresh', label: 'Fresh Milk', filterStr: 'brightness(1.08) contrast(1.05) saturate(1.15)' },
  { id: 'vibrant', label: 'Vibrant', filterStr: 'saturate(1.4) contrast(1.1)' },
  { id: 'warm', label: 'Golden Ghee', filterStr: 'sepia(0.2) saturate(1.25) brightness(1.05)' },
  { id: 'cool', label: 'Crisp Cool', filterStr: 'hue-rotate(15deg) brightness(1.05)' },
  { id: 'bw', label: 'Classic B&W', filterStr: 'grayscale(1)' },
];

export default function PhotoEditorModal({
  isOpen,
  onClose,
  initialImageUrl,
  onSave,
}: PhotoEditorModalProps) {
  const [imageSrc, setImageSrc] = useState<string>(initialImageUrl || '');
  const [edits, setEdits] = useState<PhotoEditState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<'adjust' | 'filters' | 'transform'>('adjust');
  const [cameraActive, setCameraActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (initialImageUrl) {
      setImageSrc(initialImageUrl);
      setEdits(DEFAULT_STATE);
    }
  }, [initialImageUrl, isOpen]);

  // Handle file select (Gallery or Desktop file picker)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
          setEdits(DEFAULT_STATE);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Rotate 90 deg clockwise
  const handleRotate = () => {
    setEdits((prev) => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }));
  };

  // Generate filtered canvas export
  const handleApplyAndExport = async () => {
    if (!imageSrc) return;
    setSaving(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageSrc;
      });

      // Handle rotation dimensions
      const isSideways = edits.rotation === 90 || edits.rotation === 270;
      canvas.width = isSideways ? img.height : img.width;
      canvas.height = isSideways ? img.width : img.height;

      if (!ctx) return;

      // Apply CSS-like filters on 2D context
      let filterChain = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturation}%)`;
      const selectedFilterObj = FILTERS.find((f) => f.id === edits.filter);
      if (selectedFilterObj && selectedFilterObj.filterStr) {
        filterChain += ` ${selectedFilterObj.filterStr}`;
      }
      ctx.filter = filterChain;

      // Translate & Rotate
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((edits.rotation * Math.PI) / 180);

      // Zoom scale
      const zoom = edits.zoom;
      ctx.scale(zoom, zoom);

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      const exportedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // Upload to server
      try {
        const blob = await (await fetch(exportedDataUrl)).blob();
        const formData = new FormData();
        formData.append('file', blob, 'product-photo.jpg');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          onSave(data.url);
        } else {
          onSave(exportedDataUrl);
        }
      } catch (err) {
        onSave(exportedDataUrl);
      }

      onClose();
    } catch (err) {
      console.error('Error processing edited image:', err);
      // Fallback
      onSave(imageSrc);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Compute CSS filter preview
  const previewFilter = `brightness(${edits.brightness}%) contrast(${edits.contrast}%) saturate(${edits.saturation}%)`;
  const selectedFilterObj = FILTERS.find((f) => f.id === edits.filter);
  const extraFilter = selectedFilterObj?.filterStr || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-emerald-50/30 to-green-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                Product Photo Studio
              </h3>
              <p className="text-[11px] text-gray-500">
                Snap, crop, zoom, and enhance Hatsun & Arogya packs easily
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          {/* Main Photo Preview Screen */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] bg-neutral-900 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200 shadow-inner group">
            {imageSrc ? (
              <div
                className="w-full h-full flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{
                  transform: `rotate(${edits.rotation}deg) scale(${edits.zoom})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={previewImageRef}
                  src={imageSrc}
                  alt="Product to edit"
                  crossOrigin="anonymous"
                  className="max-w-full max-h-full object-contain pointer-events-none select-none"
                  style={{
                    filter: `${previewFilter} ${extraFilter}`,
                  }}
                />
              </div>
            ) : (
              <div className="text-center p-6 text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-emerald-400" />
                <p className="text-sm font-medium text-gray-300">No Photo Selected</p>
                <p className="text-xs text-gray-500 mt-1">Take a camera photo or pick from gallery</p>
              </div>
            )}

            {/* Quick overlay controls */}
            {imageSrc && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/20">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/20 transition"
                  title="Rotate 90 degrees"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEdits((p) => ({ ...p, zoom: Math.max(0.8, p.zoom - 0.2) }))}
                  className="p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/20 transition"
                  title="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-white/80 font-mono px-1">
                  {Math.round(edits.zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setEdits((p) => ({ ...p, zoom: Math.min(2.5, p.zoom + 0.2) }))}
                  className="p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/20 transition"
                  title="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEdits(DEFAULT_STATE)}
                  className="p-1.5 text-white/70 hover:text-amber-300 rounded-full hover:bg-white/20 transition ml-1"
                  title="Reset all adjustments"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Source Options: Camera or Gallery */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-blue-800 text-xs sm:text-sm font-semibold transition"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Camera (Take Photo)</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs sm:text-sm font-semibold transition"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Gallery / Files</span>
            </button>

            {/* Hidden native inputs for mobile phone camera & file picker */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Sub-tabs for Editing */}
          {imageSrc && (
            <div className="space-y-3 pt-1">
              <div className="flex border-b border-gray-100 gap-4 text-xs font-semibold text-gray-500">
                <button
                  type="button"
                  onClick={() => setActiveTab('adjust')}
                  className={`pb-2 transition ${
                    activeTab === 'adjust'
                      ? 'border-b-2 border-emerald-500 text-emerald-700 font-bold'
                      : 'hover:text-gray-800'
                  }`}
                >
                  Adjustments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('filters')}
                  className={`pb-2 transition ${
                    activeTab === 'filters'
                      ? 'border-b-2 border-emerald-500 text-emerald-700 font-bold'
                      : 'hover:text-gray-800'
                  }`}
                >
                  Dairy Filters
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transform')}
                  className={`pb-2 transition ${
                    activeTab === 'transform'
                      ? 'border-b-2 border-emerald-500 text-emerald-700 font-bold'
                      : 'hover:text-gray-800'
                  }`}
                >
                  Zoom & Rotation
                </button>
              </div>

              {/* Adjust Tab */}
              {activeTab === 'adjust' && (
                <div className="space-y-3 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sun className="w-3.5 h-3.5 text-amber-500" /> Brightness
                      </span>
                      <span>{edits.brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={edits.brightness}
                      onChange={(e) =>
                        setEdits({ ...edits, brightness: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                      <span className="flex items-center gap-1.5">
                        <Contrast className="w-3.5 h-3.5 text-blue-500" /> Contrast
                      </span>
                      <span>{edits.contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={edits.contrast}
                      onChange={(e) =>
                        setEdits({ ...edits, contrast: Number(e.target.value) })
                      }
                      className="w-full accent-blue-500 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 font-medium mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="w-3.5 h-3.5 text-emerald-500" /> Color Pop (Saturation)
                      </span>
                      <span>{edits.saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={edits.saturation}
                      onChange={(e) =>
                        setEdits({ ...edits, saturation: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Filters Tab */}
              {activeTab === 'filters' && (
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEdits({ ...edits, filter: f.id as any })}
                      className={`p-2 rounded-xl text-center border transition ${
                        edits.filter === f.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-sm'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="w-full h-8 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-lg mb-1 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                        {f.id === 'none' ? 'Raw' : f.label.split(' ')[0]}
                      </div>
                      <span className="text-[11px] leading-tight block truncate">
                        {f.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Transform Tab */}
              {activeTab === 'transform' && (
                <div className="flex items-center justify-around p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <button
                    type="button"
                    onClick={handleRotate}
                    className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-emerald-600"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <RotateCw className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span>Rotate 90°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdits((p) => ({ ...p, zoom: 1 }))}
                    className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-emerald-600"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center font-bold text-xs text-blue-600">
                      1:1
                    </div>
                    <span>Fit Screen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEdits((p) => ({ ...p, zoom: 1.3 }))}
                    className="flex flex-col items-center gap-1 text-xs font-medium text-gray-700 hover:text-emerald-600"
                  >
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <ZoomIn className="w-5 h-5 text-amber-600" />
                    </div>
                    <span>Close Up</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-200/70 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!imageSrc || saving}
            onClick={handleApplyAndExport}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition"
          >
            {saving ? (
              <span>Saving Photo...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save to Product</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

