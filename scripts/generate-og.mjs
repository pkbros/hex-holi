import sharp from 'sharp';

const width = 1200;
const height = 630;

const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0a0a0a"/>
    </radialGradient>
    <filter id="blur1" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8"/>
    </filter>
    <filter id="blur2" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bg)"/>

  <!-- Large splash circles (Holi colors) -->
  <circle cx="120" cy="100" r="130" fill="#FF6B9D" opacity="0.45" filter="url(#blur1)"/>
  <circle cx="350" cy="500" r="150" fill="#FFD93D" opacity="0.4" filter="url(#blur1)"/>
  <circle cx="950" cy="120" r="120" fill="#00D2FF" opacity="0.35" filter="url(#blur1)"/>
  <circle cx="1080" cy="520" r="140" fill="#A855F7" opacity="0.4" filter="url(#blur1)"/>
  <circle cx="600" cy="80" r="90" fill="#22C55E" opacity="0.3" filter="url(#blur1)"/>
  <circle cx="180" cy="540" r="100" fill="#EF4444" opacity="0.35" filter="url(#blur1)"/>
  <circle cx="780" cy="550" r="110" fill="#F97316" opacity="0.35" filter="url(#blur1)"/>
  <circle cx="1120" cy="180" r="80" fill="#EC4899" opacity="0.4" filter="url(#blur1)"/>

  <!-- Medium accent splashes -->
  <circle cx="450" cy="230" r="70" fill="#06B6D4" opacity="0.35" filter="url(#blur2)"/>
  <circle cx="880" cy="380" r="85" fill="#84CC16" opacity="0.3" filter="url(#blur2)"/>
  <circle cx="250" cy="300" r="55" fill="#FBBF24" opacity="0.45" filter="url(#blur2)"/>
  <circle cx="700" cy="160" r="50" fill="#F43F5E" opacity="0.4" filter="url(#blur2)"/>

  <!-- Small crisp splashes -->
  <circle cx="100" cy="320" r="28" fill="#FBBF24" opacity="0.55"/>
  <circle cx="520" cy="570" r="32" fill="#8B5CF6" opacity="0.5"/>
  <circle cx="730" cy="70" r="22" fill="#F43F5E" opacity="0.55"/>
  <circle cx="1020" cy="370" r="38" fill="#10B981" opacity="0.45"/>
  <circle cx="380" cy="90" r="24" fill="#3B82F6" opacity="0.5"/>
  <circle cx="850" cy="510" r="18" fill="#EC4899" opacity="0.6"/>
  <circle cx="1150" cy="350" r="15" fill="#FFD93D" opacity="0.6"/>
  <circle cx="50" cy="450" r="20" fill="#22C55E" opacity="0.5"/>

  <!-- Title -->
  <text x="600" y="240" text-anchor="middle" fill="white" font-family="Georgia, 'Times New Roman', serif" font-size="80" font-weight="bold" opacity="0.95">
    Hex-Holi
  </text>
  <text x="600" y="310" text-anchor="middle" fill="white" font-family="Georgia, 'Times New Roman', serif" font-size="38" opacity="0.7" letter-spacing="2">
    The Splash Challenge
  </text>

  <!-- Tagline -->
  <text x="600" y="390" text-anchor="middle" fill="#D4A017" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-style="italic" opacity="0.85">
    Match RGB colors. Build streaks. Splash your screen!
  </text>

  <!-- Divider line -->
  <line x1="400" y1="430" x2="800" y2="430" stroke="#D4A017" stroke-width="1" opacity="0.3"/>

  <!-- EduLinkUp branding -->
  <text x="600" y="490" text-anchor="middle" fill="#C8922A" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="bold">
    by EduLinkUp
  </text>
  <text x="600" y="535" text-anchor="middle" fill="#8B7535" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-style="italic">
    Learn. Connect. Grow Together.
  </text>

  <!-- URL -->
  <text x="600" y="590" text-anchor="middle" fill="#555" font-family="Georgia, 'Times New Roman', serif" font-size="18">
    edulinkup.dev
  </text>
</svg>`;

await sharp(Buffer.from(svg))
  .png({ quality: 90 })
  .toFile('public/og-image.png');

console.log('✅ OG image generated: public/og-image.png (1200×630)');
