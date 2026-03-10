import JSZip from 'jszip';

/**
 * Recursively reads a FileSystemEntry and adds its contents to a JSZip instance.
 */
async function addEntryToZip(entry: any, zip: JSZip, path = '') {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      entry.file(resolve, reject);
    });
    zip.file(path + file.name, file);
  } else if (entry.isDirectory) {
    const dirReader = entry.createReader();
    const newPath = path + entry.name + '/';
    
    const entries = await new Promise<any[]>((resolve, reject) => {
      dirReader.readEntries(resolve, reject);
    });
    
    for (const childEntry of entries) {
      await addEntryToZip(childEntry, zip, newPath);
    }
  }
}

/**
 * Checks if a DataTransfer object contains directories.
 * If yes, it processes them, zips the directories together with any loose files,
 * and returns an array of Files containing the zip. If no directories, returns the files as is.
 */
export async function processDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items);
  let hasDirectory = false;
  
  // Check for directories
  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry && entry.isDirectory) {
      hasDirectory = true;
      break;
    }
  }

  if (!hasDirectory) {
    // Standard file drop
    return Array.from(dataTransfer.files);
  }

  // Has directories, need to zip
  const zip = new JSZip();
  let fileCount = 0;

  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (entry) {
      await addEntryToZip(entry, zip);
      fileCount++;
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const folderName = items.length === 1 && items[0].webkitGetAsEntry()?.name 
    ? items[0].webkitGetAsEntry()!.name 
    : 'Archive';
    
  const zipFile = new File([zipBlob], `${folderName}.zip`, { type: 'application/zip' });
  return [zipFile];
}
