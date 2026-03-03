let ctx: AudioContext | null = null

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

export function playSplatSound(): void {
  try {
    const a = ac()
    const dur = 0.15
    const bufSize = Math.floor(a.sampleRate * dur)
    const buf = a.createBuffer(1, bufSize, a.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize)
    }
    const src = a.createBufferSource()
    src.buffer = buf
    const lp = a.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 800
    const g = a.createGain()
    g.gain.setValueAtTime(0.3, a.currentTime)
    g.gain.exponentialRampToValueAtTime(0.01, a.currentTime + dur)
    src.connect(lp).connect(g).connect(a.destination)
    src.start()
  } catch {
    // silent fail on browsers that block audio
  }
}

export function playCorrectSound(): void {
  try {
    const a = ac()
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(523, a.currentTime)
    o.frequency.setValueAtTime(659, a.currentTime + 0.1)
    o.frequency.setValueAtTime(784, a.currentTime + 0.2)
    g.gain.setValueAtTime(0.15, a.currentTime)
    g.gain.exponentialRampToValueAtTime(0.01, a.currentTime + 0.35)
    o.connect(g).connect(a.destination)
    o.start()
    o.stop(a.currentTime + 0.35)
  } catch {
    // silent fail
  }
}

export function playWrongSound(): void {
  try {
    const a = ac()
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(200, a.currentTime)
    o.frequency.linearRampToValueAtTime(100, a.currentTime + 0.3)
    g.gain.setValueAtTime(0.12, a.currentTime)
    g.gain.exponentialRampToValueAtTime(0.01, a.currentTime + 0.3)
    o.connect(g).connect(a.destination)
    o.start()
    o.stop(a.currentTime + 0.3)
  } catch {
    // silent fail
  }
}
