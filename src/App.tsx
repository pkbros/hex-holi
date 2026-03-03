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

  const [showHint, setShowHint] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [shaking, setShaking] = useState(false)
  const [greyWash, setGreyWash] = useState(false)
  const [selectedHex, setSelectedHex] = useState<string | null>(null)

  useEffect(() => {
    if (!game.answered) return
    const delay = game.lastAnswer === 'correct' ? 1500 : 2000
    const t = setTimeout(() => {
      game.nextRound()
      setSelectedHex(null)
      setShowHint(false)
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

  return (
    <>
      <canvas ref={canvasRef} id="splat-canvas" />

      {/* ——— Split layout: game left, sidebar right ——— */}
      <div className={`game-ui h-screen flex flex-col lg:flex-row overflow-hidden transition-[filter] duration-300 ${shaking ? 'screen-shake' : ''} ${greyWash ? 'grey-wash' : ''}`}>

        {/* ============ LEFT: GAME AREA ============ */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 relative min-h-0">
          {/* Sound toggle floating */}
          <button
            onClick={() => setSoundEnabled(s => !s)}
            className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-white text-lg hover:bg-black/70 transition-colors cursor-pointer z-20"
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <motion.div
            className="w-full max-w-sm mx-auto flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-white text-base lg:text-lg font-bold mb-1 opacity-70">
              🎨 Hex-Holi: The Splash Challenge
            </h1>

            {/* Hex Code */}
            <AnimatePresence mode="wait">
              <motion.div
                key={game.currentHex}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="text-center my-4 lg:my-6"
              >
                <div
                  className="text-4xl lg:text-5xl font-mono font-bold text-white tracking-wider select-none"
                  style={{ textShadow: `0 0 30px ${game.currentHex}40, 0 0 60px ${game.currentHex}20` }}
                >
                  {game.currentHex}
                </div>
                <div className="text-gray-500 text-xs mt-1">What color is this?</div>
              </motion.div>
            </AnimatePresence>

            {/* 2×2 Color Options */}
            <div className="grid grid-cols-2 gap-2 lg:gap-3 w-full max-w-xs mb-4">
              {game.options.map((hex, i) => {
                const isSelected = selectedHex?.toUpperCase() === hex.toUpperCase()
                const isCorrect = hex.toUpperCase() === game.currentHex.toUpperCase()
                const showCorrect = game.answered && isCorrect
                const showWrong = game.answered && isSelected && !isCorrect
                let border = 'border-white/10'
                if (showCorrect) border = 'border-green-400'
                if (showWrong) border = 'border-red-400'

                return (
                  <motion.button
                    key={`${game.currentHex}-${i}`}
                    whileHover={!game.answered ? { scale: 1.05 } : {}}
                    whileTap={!game.answered ? { scale: 0.95 } : {}}
                    onClick={() => handleAnswer(hex)}
                    disabled={game.answered}
                    className={`aspect-square rounded-2xl border-4 ${border} transition-all duration-300 cursor-pointer disabled:cursor-default shadow-lg hover:shadow-xl flex items-center justify-center`}
                    style={{ backgroundColor: hex }}
                  >
                    {showCorrect && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>✓</motion.span>
                    )}
                    {showWrong && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl" style={{ textShadow: '0 0 10px rgba(0,0,0,0.8)' }}>✗</motion.span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Hint toggle */}
            <button
              onClick={() => setShowHint(h => !h)}
              className="text-gray-400 hover:text-white text-xs py-1 transition-colors cursor-pointer"
            >
              {showHint ? '🙈 Hide the Logic' : '👀 Peek at the Logic'}
            </button>

            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden w-full max-w-xs mt-2"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3 space-y-2">
                    <p className="text-gray-400 text-[10px]">Higher values = More pigment</p>
                    {([
                      { label: 'Red', value: rgb.r, color: '#ef4444' },
                      { label: 'Green', value: rgb.g, color: '#22c55e' },
                      { label: 'Blue', value: rgb.b, color: '#3b82f6' },
                    ] as const).map(ch => (
                      <div key={ch.label} className="flex items-center gap-2">
                        <span className="text-white text-xs w-10 shrink-0">{ch.label}</span>
                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(ch.value / 255) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: ch.color }}
                          />
                        </div>
                        <span className="text-white text-[11px] w-20 text-right tabular-nums shrink-0">
                          {ch.value} <span className="text-gray-500">({describeChannel(ch.value)})</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* ============ RIGHT: SIDEBAR ============ */}
        <div className="w-full lg:w-80 xl:w-96 shrink-0 bg-[#1a1206]/80 backdrop-blur-md border-l border-amber-900/30 flex flex-col h-screen overflow-y-auto">

          {/* EduLinkUp Logo + Branding */}
          <div className="p-5 pb-3 border-b border-amber-900/20">
            <a
              href="https://edulinkup.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 group"
            >
              <img
                src="/edulinkup-logo.png"
                alt="EduLinkUp"
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div>
                <EduLinkUpLogo className="h-5" />
                <p className="text-amber-700 text-[10px] mt-0.5 group-hover:text-amber-500 transition-colors">
                  Learn. Connect. Grow Together.
                </p>
              </div>
            </a>
          </div>

          {/* Scores */}
          <div className="p-5 pb-3 border-b border-amber-900/20">
            <h2 className="text-amber-500/60 text-[10px] uppercase tracking-widest font-semibold mb-3">Score</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <div className="text-amber-400/50 text-[10px] uppercase tracking-wider">Streak</div>
                <div className="text-2xl font-bold text-white tabular-nums mt-1">{game.currentStreak}</div>
              </div>
              <div className="bg-black/30 rounded-xl p-3 text-center">
                <div className="text-amber-400/50 text-[10px] uppercase tracking-wider">Best</div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums mt-1">{game.bestStreak}</div>
              </div>
            </div>
            <div className="text-center mt-2 text-gray-500 text-[11px]">
              {game.totalCorrect} colors identified this session
            </div>
          </div>

          {/* Rank */}
          <div className="p-5 pb-3 border-b border-amber-900/20">
            <h2 className="text-amber-500/60 text-[10px] uppercase tracking-widest font-semibold mb-2">Rank</h2>
            <div className="flex items-center gap-3 bg-black/30 rounded-xl p-3">
              <span className="text-2xl">{rank.emoji}</span>
              <div>
                <div className="text-white text-sm font-semibold">{rank.title}</div>
                <div className="text-amber-600 text-[10px]">
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
          </div>

          {/* Actions */}
          <div className="p-5 pb-3 border-b border-amber-900/20 space-y-2">
            <h2 className="text-amber-500/60 text-[10px] uppercase tracking-widest font-semibold mb-2">Actions</h2>
            <button
              onClick={handleBrag}
              className="w-full bg-green-700/80 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              📱 Brag on WhatsApp
            </button>
            <button
              onClick={handleClean}
              className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-300/70 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              🧹 Clean Screen
            </button>
          </div>

          {/* About EduLinkUp — fills remaining space */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-amber-500/60 text-[10px] uppercase tracking-widest font-semibold mb-3">About EduLinkUp</h2>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Your gateway to quality education in Engineering, Medical, Board Exams & Government Exam preparation.
              </p>
              <div className="space-y-1.5">
                {[
                  { label: '1.5K+', desc: 'Active Learners' },
                  { label: '10+', desc: 'Free Courses' },
                  { label: '94%', desc: 'Success Rate' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-bold w-10">{s.label}</span>
                    <span className="text-gray-500 text-xs">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://edulinkup.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block w-full text-center bg-amber-700/40 hover:bg-amber-700/60 text-amber-300 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              🌐 Visit edulinkup.dev
            </a>

            <div className="mt-3 flex justify-center gap-4">
              {[
                { href: 'http://www.youtube.com/@EduLinkUp', icon: '▶️', label: 'YouTube' },
                { href: 'https://github.com/EduLinkUp', icon: '💻', label: 'GitHub' },
                { href: 'https://www.linkedin.com/company/edulinkup', icon: '💼', label: 'LinkedIn' },
                { href: 'https://www.instagram.com/edulinkup.dev', icon: '📸', label: 'Instagram' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="text-gray-600 hover:text-amber-400 text-sm transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <p className="text-center text-gray-700 text-[9px] mt-3">
              © 2026 EduLinkUp. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
