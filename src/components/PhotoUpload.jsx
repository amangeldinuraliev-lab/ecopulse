import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Camera, Loader2, X } from 'lucide-react';

export default function PhotoUpload({ label, value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange(file_url);
    setBusy(false);
  };

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400 mb-2">{label}</div>
      <div
        onClick={() => !value && inputRef.current?.click()}
        className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-dashed border-teal-900/15 bg-white grid place-items-center cursor-pointer transition-all hover:border-teal-500/50">
        {value ? (
          <>
            <Image src={value} className="absolute inset-0 w-full h-full" />
            <button type="button" onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white grid place-items-center backdrop-blur">
              <X className="w-4 h-4" />
            </button>
          </>
        ) : busy ? (
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
        ) : (
          <div className="text-center text-slate-400">
            <Camera className="w-7 h-7 mx-auto mb-2 text-teal-600/70" />
            <div className="text-sm">Фото таңдау</div>
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={pick} />
    </div>
  );
}