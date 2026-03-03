'use client';

import { useCallback, useRef } from 'react';
import { useTransferStore } from '@/lib/stores/transfer-store';
import { signaling } from '@/lib/webrtc/signaling';
import { downloadBlob } from '@/lib/webrtc/file-chunker';

export function useRelay() {
  const { updateProgress, setStatus, addReceivedFile, setErrorDetails } = useTransferStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  const startRelayTransfer = useCallback(
    async (sessionId: string, files: File[]) => {
      console.log('[Relay] Starting free server relay for session:', sessionId);
      setStatus('transferring');

      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      let totalBytesSent = 0;
      const startTime = Date.now();

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const CHUNK_SIZE = 512 * 1024; // 512KB for relay
          let offset = 0;

          while (offset < file.size) {
            const slice = file.slice(offset, offset + CHUNK_SIZE);
            const buffer = await slice.arrayBuffer();
            
            // Convert to base64 for WS transport
            const base64 = btoa(
              new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            signaling.send({
              type: 'file-chunk',
              sessionId,
              data: base64,
            });

            offset += buffer.byteLength;
            totalBytesSent += buffer.byteLength;

            const elapsed = (Date.now() - startTime) / 1000;
            const speed = elapsed > 0 ? totalBytesSent / elapsed : 0;
            const remaining = totalSize - totalBytesSent;
            const eta = speed > 0 ? remaining / speed : 0;

            updateProgress({
              bytesTransferred: totalBytesSent,
              totalBytes: totalSize,
              speed,
              eta,
              currentFile: file.name,
              fileIndex: i,
              totalFiles: files.length,
            });

            // Small delay to prevent overwhelming the server
            await new Promise((resolve) => setTimeout(resolve, 50));
          }

          signaling.send({
            type: 'file-chunk-end',
            sessionId,
          });
        }

        signaling.send({
          type: 'transfer-complete',
          sessionId,
        });

        setStatus('complete');
      } catch (error) {
        console.error('[Relay] Transfer failed:', error);
        setStatus('error');
        setErrorDetails(error instanceof Error ? error.message : 'Relay transfer failed', { code: 'RELAY_FAILED' });
      }
    },
    [setStatus, updateProgress, setErrorDetails]
  );

  const receiveRelayTransfer = useCallback(
    (sessionId: string, filesInfo: any[]) => {
      console.log('[Relay] Receiving free server relay for session:', sessionId);
      setStatus('transferring');

      const totalSize = filesInfo.reduce((sum, f) => sum + f.size, 0);
      let totalBytesReceived = 0;
      let currentFileIndex = 0;
      let receivedChunks: ArrayBuffer[] = [];
      const startTime = Date.now();

      const url = `/api/transfer/${sessionId}/download`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.addEventListener('chunk', (event: any) => {
        const base64 = event.data;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const chunk = bytes.buffer;
        receivedChunks.push(chunk);
        totalBytesReceived += chunk.byteLength;

        const currentFile = filesInfo[currentFileIndex];
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = elapsed > 0 ? totalBytesReceived / elapsed : 0;
        const remaining = totalSize - totalBytesReceived;
        const eta = speed > 0 ? remaining / speed : 0;

        updateProgress({
          bytesTransferred: totalBytesReceived,
          totalBytes: totalSize,
          speed,
          eta,
          currentFile: currentFile?.name || 'Unknown',
          fileIndex: currentFileIndex,
          totalFiles: filesInfo.length,
        });
      });

      es.addEventListener('end', () => {
        const currentFile = filesInfo[currentFileIndex];
        if (currentFile) {
          const blob = new Blob(receivedChunks, { type: currentFile.type });
          addReceivedFile({ blob, name: currentFile.name, type: currentFile.type });
          downloadBlob(blob, currentFile.name);
        }

        currentFileIndex++;
        receivedChunks = [];

        if (currentFileIndex >= filesInfo.length) {
          setStatus('complete');
          es.close();
        }
      });

      es.onerror = (err) => {
        if (useTransferStore.getState().status === 'complete') return;
        console.error('[Relay] SSE error:', err);
        setStatus('error');
        setErrorDetails('Relay connection lost', { code: 'RELAY_ERROR' });
        es.close();
      };
    },
    [setStatus, updateProgress, addReceivedFile, setErrorDetails]
  );

  const cleanupRelay = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { startRelayTransfer, receiveRelayTransfer, cleanupRelay };
}
