
const DB_NAME = "AudioDatabase";
const STORE_NAME = "audioFiles";
const DB_VERSION = 1;

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveAudioToLocalStorage(
  audioUrl: string,
  storageKey: string
): Promise<void> {
  try {
    const response = await fetch(audioUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.status}`);
    }

    const blob = await response.blob();

    const db = await openAudioDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put(blob, storageKey);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };

      transaction.onabort = () => {
        db.close();
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Error saving audio file:", error);
    throw error;
  }
}

async function fetchAudioFromLocalStorage(
  storageKey: string
): Promise<string | null> {
  const db = await openAudioDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(storageKey);

    request.onsuccess = () => {
      const blob = request.result as Blob | undefined;

      db.close();

      if (!blob) {
        resolve(null);
        return;
      }

      resolve(URL.createObjectURL(blob));
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function AudioExistsInLocalStorage(
  storageKey: string
): Promise<boolean> {
  const db = await openAudioDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).count(storageKey);

    request.onsuccess = () => {
      db.close();
      resolve(request.result > 0);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

async function deleteAudioFromLocalStorage(
  storageKey: string
): Promise<void> {
  const db = await openAudioDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).delete(storageKey);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

function lerp(a: number, b: number, i: number) {
  return a + (b - a) * i;
}

function removeExtension(filename: string) {
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename;
  return filename.substring(0, lastDotIndex);
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

async function delay(seconds: number) {
  return new Promise(res => setTimeout(res, seconds * 1000));
}

export {
  saveAudioToLocalStorage,
  fetchAudioFromLocalStorage,
  AudioExistsInLocalStorage,
  deleteAudioFromLocalStorage,
  removeExtension,
  formatDuration,
  lerp,
  delay
};
