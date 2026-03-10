'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HugeiconsIcon } from '@hugeicons/react';
import { FolderUploadIcon } from '@hugeicons/core-free-icons';
import { useTransfer } from '@/hooks/use-transfer';
import { useAppStore } from '@/lib/stores/app-store';
import { processDataTransfer } from '@/lib/utils/zip';

export function GlobalDropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const { shareFiles } = useTransfer();
  const view = useAppStore((s) => s.view);

  useEffect(() => {
    // Only allow global drop if we are currently on the home view (not already transferring)
    if (view !== 'home') return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer!.dropEffect = 'copy';
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Only set to false if leaving the window, not child elements
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!e.dataTransfer) return;
      const files = await processDataTransfer(e.dataTransfer);
      if (files.length > 0) {
        // Automatically start sharing the dropped files
        shareFiles(files);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [shareFiles, view]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md"
        >
          {/* Animated dashed border */}
          <div className="absolute inset-6 rounded-3xl border-4 border-dashed border-primary/50 animate-pulse bg-primary/5 pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="flex flex-col items-center gap-6 pointer-events-none"
          >
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-primary/20 border-2 border-primary/50 shadow-[0_0_50px_rgba(var(--primary),0.3)]">
              <HugeiconsIcon icon={FolderUploadIcon} className="w-16 h-16 text-primary" />
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full border border-primary animate-ping opacity-50" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-widest uppercase text-foreground">
                Drop to Share
              </h2>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                Release files to instantly begin transmission
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
