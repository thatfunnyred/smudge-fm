async function saveAudioToLocalStorage(audioUrl: string, storageKey: string) {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob(); 
    const reader = new FileReader();
    reader.onloadend = function () {
        const base64String = reader.result;
      
        if(typeof base64String != 'string') return;

        //save audio
        localStorage.setItem(storageKey, base64String);
    };
    
    reader.readAsDataURL(blob); 
  } catch (error) {
    console.error("Error saving audio file:", error);
  }
}

function fetchAudioFromLocalStorage(storageKey: string) {
  const base64Audio = localStorage.getItem(storageKey);
  
  if (!base64Audio) {
    console.log("No audio found in localStorage.");
    return;
  }

  return base64Audio;
}

function lerp(a: number, b: number, i: number) {
  return a + (b - a) * i;
}

export {saveAudioToLocalStorage, fetchAudioFromLocalStorage, lerp}