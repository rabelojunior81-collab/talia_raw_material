class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Gemini requires 16kHz PCM 16-bit signed integer format.
    // We buffer samples to send efficient chunks to the main thread/websocket.
    this.bufferSize = 4096; 
    this.buffer = new Int16Array(this.bufferSize);
    this.offset = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input.length) return true;

    const channelData = input[0]; // Mono audio

    for (let i = 0; i < channelData.length; i++) {
      // Convert Float32 (-1.0 to 1.0) to Int16 (-32768 to 32767)
      const s = Math.max(-1, Math.min(1, channelData[i]));
      this.buffer[this.offset] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      this.offset++;

      // When buffer is full, send to main thread
      if (this.offset >= this.bufferSize) {
        this.port.postMessage(this.buffer);
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);