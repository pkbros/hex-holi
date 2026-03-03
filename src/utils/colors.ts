export function randomHex(): string {
  const hex = Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')
  return `#${hex.toUpperCase()}`
}

export interface RGB {
  r: number
  g: number
  b: number
}

export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))
  return `#${[r, g, b]
    .map(v => clamp(v).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`
}

function colorDistance(a: RGB, b: RGB): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

function randomOffset(): number {
  const offset = 40 + Math.floor(Math.random() * 60)
  return Math.random() < 0.5 ? -offset : offset
}

export function generateOptions(correctHex: string, count = 3): string[] {
  const correct = hexToRgb(correctHex)
  const distractors: string[] = []
  const needed = count - 1
  let attempts = 0

  while (distractors.length < needed && attempts < 300) {
    attempts++
    const r = Math.max(0, Math.min(255, Math.round(correct.r + randomOffset())))
    const g = Math.max(0, Math.min(255, Math.round(correct.g + randomOffset())))
    const b = Math.max(0, Math.min(255, Math.round(correct.b + randomOffset())))
    const hex = rgbToHex(r, g, b)
    const candidate: RGB = { r, g, b }

    if (
      hex.toUpperCase() !== correctHex.toUpperCase() &&
      colorDistance(correct, candidate) > 60 &&
      distractors.every(d => colorDistance(hexToRgb(d), candidate) > 50)
    ) {
      distractors.push(hex)
    }
  }

  // Fallback
  while (distractors.length < needed) {
    distractors.push(randomHex())
  }

  const options = [...distractors]
  const insertIdx = Math.floor(Math.random() * count)
  options.splice(insertIdx, 0, correctHex)
  return options
}

export function describeChannel(value: number): string {
  if (value === 0) return 'None'
  if (value <= 63) return 'Low'
  if (value <= 127) return 'Mid'
  if (value <= 191) return 'High'
  if (value < 255) return 'V.High'
  return 'Max'
}
