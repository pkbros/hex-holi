const RANKS = [
  { min: 30, title: 'Principal Color Architect', emoji: '🏆' },
  { min: 20, title: 'Staff Color Scientist', emoji: '🔬' },
  { min: 15, title: 'Lead Chromatic Engineer', emoji: '⚡' },
  { min: 10, title: 'Senior Spectrum Analyst', emoji: '🎯' },
  { min: 6, title: 'Mid-Level Palette Painter', emoji: '🎨' },
  { min: 3, title: 'Junior Hue Handler', emoji: '🌈' },
  { min: 0, title: 'Color Curious Intern', emoji: '👶' },
] as const

export function getRank(streak: number) {
  const rank = RANKS.find(r => streak >= r.min) ?? RANKS[RANKS.length - 1]
  return { title: rank.title, emoji: rank.emoji }
}

export function generateBragMessage(bestStreak: number, coverage: number): string {
  const { title, emoji } = getRank(bestStreak)
  return [
    '🎨 Hex-Holi: The Splash Challenge 🎨',
    'by EduLinkUp (edulinkup.dev)',
    '',
    `I just hit a ${bestStreak}-color streak without a single miss!`,
    '',
    `🎖️ Rank: ${emoji} ${title}`,
    `💦 My screen is currently ${coverage}% covered in digital Gulaal.`,
    '',
    `Can you decode the Hex? Play here: ${window.location.href}`,
    '',
    '📚 Learn coding, crack exams & more at https://edulinkup.dev',
  ].join('\n')
}
