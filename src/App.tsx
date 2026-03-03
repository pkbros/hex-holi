import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from './hooks/useGame'
import { useSplatCanvas } from './hooks/useSplatCanvas'
import { hexToRgb, describeChannel } from './utils/colors'
import { generateBragMessage, getRank } from './utils/ranks'
import { updateFavicon } from './utils/favicon'
import { playSplatSound, playCorrectSound, playWrongSound } from './utils/sounds'
import { EduLinkUpLogo } from './components/EduLinkUpLogo'

function App() {
  const game = useGame()
  const { canvasRef, burst, clearStains, calculateCoverage } = useSplatCanvas()

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [shaking, setShaking] = useState(false)
  const [greyWash, setGreyWash] = useState(false)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)

  useEffect(() => {
    if (!game.answered) return
    const delay = game.lastAnswer === 'correct' ? 1400 : 1800
    const t = setTimeout(() => {
      game.nextRound()
      setSelectedHex(null)
    }, delay)
    return () => clearTimeout(t)
  }, [game.answered, game.lastAnswer, game.nextRound])

  const handleAnswer = (hex: string) => {
    if (game.answered) return
    setSelectedHex(hex)
    const isCorrect = hex.toUpperCase() === game.currentHex.toUpperCase()
    game.answer(hex)
    if (isCorrect) {
      burst(game.currentHex)
      updateFavicon(game.currentHex)
      if (soundEnabled) { playSplatSound(); setTimeout(() => playCorrectSound(), 100) }
      try { navigator.vibrate?.(200) } catch { /* */ }
    } else {
      setShaking(true); setGreyWash(true)
      if (soundEnabled) playWrongSound()
      try { navigator.vibrate?.([100, 50, 100]) } catch { /* */ }
      setTimeout(() => { setShaking(false); setGreyWash(false) }, 600)
    }
  }

  const handleBrag = () => {
    const coverage = calculateCoverage()
    const msg = generateBragMessage(game.bestStreak, coverage)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleClean = () => {
    if (window.confirm('🧹 Are you sure? This will clear your Holi progress!\nAll those beautiful splashes will be washed away...')) {
      clearStains()
    }
  }

  const rgb = hexToRgb(game.currentHex)
  const rank = getRank(game.bestStreak)

  const channels = [
    { label: 'R', value: rgb.r, color: '#ef4444' },
    { label: 'G', value: rgb.g, color: '#22c55e' },
    { label: 'B', value: rgb.b, color: '#3b82f6' },
  ] as const

  return (
    <>
      <canvas ref={canvasRef} id="splat-canvas" />

      <div className={`game-ui h-screen flex flex-col lg:flex-row overflow-hidden transition-[filter] duration-300 ${shaking ? 'screen-shake' : ''} ${greyWash ? 'grey-wash' : ''}`}>

        {/* ===== LEFT HALF: THE GAME ===== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 relative min-h-0">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-base hover:bg-black/60 transition-colors cursor-pointer z-20"
            title={soundEnabled ? 'Mute' : 'Unmute'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <div className="w-full max-w-xs mx-auto flex flex-col items-center">
            <h1 className="text-white text-sm lg:text-base font-bold opacity-60 mb-3">
              🎨 Hex-Holi: The Splash Challenge
            </h1>

            {/* ── RGB Bars as the Question ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={game.currentHex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full bg-black/50 backdrop-blur-sm rounded-xl p-4 mb-5"
              >
                <p className="text-gray-400 text-[11px] mb-3 text-center">
                  🎯 Identify this color from its RGB mix
                </p>
                <div className="space-y-2.5">
                  {channels.map(ch => (
                    <div key={ch.label} className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold w-4 shrink-0">{ch.label}</span>
                      <div className="flex-1 h-4 bg-gray-800/80 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(ch.value / 255) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: ch.color }}
                        />
                      </div>
                      <span className="text-white text-xs w-16 text-right tabular-nums shrink-0">
                        {ch.value} <span className="text-gray-500 text-[10px]">({describeChannel(ch.value)})</span>
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-[9px] mt-2 text-center">Higher values = More pigment</p>
              </motion.div>
            </AnimatePresence>

            {/* ── 3 Color Options (horizontal) ── */}
            <div className="grid grid-cols-3 gap-2.5 w-full mb-4">
              {game.options.map((hex, i) => {
                const isSelected = selectedHex?.toUpperCase() === hex.toUpperCase()
                const isCorrect = hex.toUpperCase() === game.currentHex.toUpperCase()
                const showCorrect = game.answered && isCorrect
                const showWrong = game.answered && isSelected && !isCorrect
                let border = 'border-white/10'
                if (showCorrect) border = 'border-green-400 shadow-green-400/30 shadow-lg'
                if (showWrong) border = 'border-red-400 shadow-red-400/30 shadow-lg'

                return (
                  <motion.button
                    key={`${game.currentHex}-${i}`}
                    whileHover={!game.answered ? { scale: 1.06 } : {}}
                    whileTap={!game.answered ? { scale: 0.94 } : {}}
                    onClick={() => handleAnswer(hex)}
                    disabled={game.answered}
                    className={`aspect-square rounded-2xl border-3 ${border} transition-all duration-300 cursor-pointer disabled:cursor-default flex items-center justify-center`}
                    style={{ backgroundColor: hex }}
                  >
                    {showCorrect && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>✓</motion.span>
                    )}
                    {showWrong && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>✗</motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            <p className="text-gray-600 text-[10px]">Pick the color that matches the RGB bars above</p>
          </div>
        </div>

        {/* ===== RIGHT HALF: STATS + EDULINKUP ===== */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-6 relative min-h-0 border-l border-white/5">

          <div className="w-full max-w-xs mx-auto flex flex-col h-full justify-between py-2">

            {/* EduLinkUp branding */}
            <a
              href="https://edulinkup.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group mb-4"
            >
              <img
                src="/edulinkup-logo.png"
                alt="EduLinkUp"
                className="h-9 w-9 rounded-md object-contain"
              />
              <div>
                <EduLinkUpLogo size="md" />
                <p className="text-[10px] mt-0.5 group-hover:text-amber-400 transition-colors"
                   style={{ color: '#8B7535', fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                  Learn. Connect. <span style={{ color: '#D4A017' }}>Grow Together.</span>
                </p>
              </div>
            </a>

            {/* Score cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <div className="text-amber-500/50 text-[9px] uppercase tracking-wider">Streak</div>
                <div className="text-xl font-bold text-white tabular-nums">{game.currentStreak}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <div className="text-amber-500/50 text-[9px] uppercase tracking-wider">Best</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: '#D4A017' }}>{game.bestStreak}</div>
              </div>
              <div className="bg-black/40 backdrop-blur-sm rounded-xl p-2.5 text-center">
                <div className="text-amber-500/50 text-[9px] uppercase tracking-wider">Total</div>
                <div className="text-xl font-bold text-white tabular-nums">{game.totalCorrect}</div>
              </div>
            </div>

            {/* Rank */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3 mb-4">
              <span className="text-2xl">{rank.emoji}</span>
              <div className="flex-1">
                <div className="text-white text-sm font-semibold">{rank.title}</div>
                <div className="text-[10px]" style={{ color: '#8B7535' }}>
                  {game.bestStreak < 3 ? 'Get a 3-streak to rank up!' :
                   game.bestStreak < 6 ? 'Reach 6 for next rank!' :
                   game.bestStreak < 10 ? 'Reach 10 for next rank!' :
                   game.bestStreak < 15 ? 'Reach 15 for next rank!' :
                   game.bestStreak < 20 ? 'Reach 20 for next rank!' :
                   game.bestStreak < 30 ? 'Reach 30 for the top!' :
                   'You are the ultimate Color Architect!'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleBrag}
                className="w-full bg-green-700/70 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                📱 Share Your Highscore
              </button>
              <button
                onClick={handleClean}
                className="w-full bg-black/30 hover:bg-black/50 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                style={{ color: '#8B7535' }}
              >
                🧹 Clean Screen
              </button>
            </div>

            {/* About */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-3">
              <p className="text-gray-400 text-[11px] leading-relaxed mb-2">
                Your gateway to <strong className="text-gray-300">quality education</strong> in Engineering, Medical, Board Exams & Government Exam preparation.
              </p>
              <div className="flex gap-4 justify-center text-[10px]">
                <span><strong style={{ color: '#D4A017' }}>1.5K+</strong> <span className="text-gray-500">Learners</span></span>
                <span><strong style={{ color: '#D4A017' }}>10+</strong> <span className="text-gray-500">Courses</span></span>
                <span><strong style={{ color: '#D4A017' }}>94%</strong> <span className="text-gray-500">Success</span></span>
              </div>
            </div>

            {/* Footer: CTA + socials */}
            <div className="flex flex-col items-center gap-2">
              <a
                href="https://edulinkup.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:opacity-90"
                style={{ backgroundColor: '#D4A017', color: '#1a1206' }}
              >
                🌐 Visit edulinkup.dev
              </a>
              <div className="flex gap-4">
                {[
                  { href: 'http://www.youtube.com/@EduLinkUp', icon: '▶️', label: 'YouTube' },
                  { href: 'https://github.com/EduLinkUp', icon: '💻', label: 'GitHub' },
                  { href: 'https://www.linkedin.com/company/edulinkup', icon: '💼', label: 'LinkedIn' },
                  { href: 'https://www.instagram.com/edulinkup.dev', icon: '📸', label: 'Instagram' },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                     className="text-gray-600 hover:text-amber-400 text-xs transition-colors">{s.icon}</a>
                ))}
              </div>
              <p className="text-gray-700 text-[8px]">© 2026 EduLinkUp. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
