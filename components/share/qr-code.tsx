'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';

interface QRCodeDisplayProps {
  value: string;
}

export function QRCodeDisplay({ value }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!value) return;

    QRCode.toDataURL(value, {
      width: 256,
      margin: 1,
      color: {
        dark: '#ffffff',
        light: '#00000000', // transparent background
      },
      errorCorrectionLevel: 'H',
    }).then(setQrDataUrl);
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative rounded-3xl border border-primary/30 bg-background/80 backdrop-blur-md p-5 shadow-[0_0_40px_rgba(var(--primary),0.2)]">
        {/* Glow behind QR */}
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-3xl" />
        
        {/* Glowing corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-xl" />

        <div className="relative z-10 bg-black/40 p-2 rounded-xl backdrop-blur-md border border-white/10">
          {qrDataUrl ? (
            <Image 
              src={qrDataUrl} 
              alt="QR Code" 
              width={180} 
              height={180} 
              className="rounded-lg select-none pointer-events-none"
              unoptimized
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] font-mono text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Scan to Receive Files
        </span>
      </div>
    </div>
  );
}
