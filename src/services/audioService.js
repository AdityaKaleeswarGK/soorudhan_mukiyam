// Audio recording service
export class AudioRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;
      this.audioChunks = [];

      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw error;
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
        }

        // Convert blob to base64 for storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result;
          resolve(base64Audio);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

// Play audio from base64 string
export const playAudio = (base64Audio, onEnd) => {
  const audio = new Audio(base64Audio);
  
  if (onEnd) {
    audio.onended = onEnd;
  }
  
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });
  
  return audio;
};

// Stop audio playback
export const stopAudio = (audio) => {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
};

