export const RANKS = [
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
  const { title } = getRank(bestStreak)

  const holiLines = [
    'Holi hai! Colors are flying everywhere!',
    'This Holi, I\'m decoding colors like a pro!',
    'Bura na mano, Holi hai! And I\'m nailing these colors!',
    'Rang barse! My screen is dripping in digital Gulaal!',
    'Happy Holi! Come splash some colors with me!',
  ]
  const holiLine = holiLines[Math.floor(Math.random() * holiLines.length)]

  return [
    `*Hex-Holi: The Splash Challenge*`,
    `_by EduLinkUp_`,
    '',
    holiLine,
    '',
    `*${bestStreak}* color streak without a miss!`,
    `Rank: *${title}*`,
    `Screen: *${coverage}%* covered in Gulaal`,
    '',
    `Can you beat my score?`,
    `${window.location.href}`,
    '',
    `_Happy Holi from EduLinkUp!_`,
    `https://edulinkup.dev`,
  ].join('\n')
}
