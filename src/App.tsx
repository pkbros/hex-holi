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

  // Auto-advance to next round
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
      if (soundEnabled) {
        playSplatSound()
        setTimeout(() => playCorrectSound(), 100)
      }
      try {
        navigator.vibrate?.(200)
      } catch {
        /* not supported */
      }
    } else {
      setShaking(true)
      setGreyWash(true)
      if (soundEnabled) playWrongSound()
      try {
        navigator.vibrate?.([100, 50, 100])
      } catch {
        /* not supported */
      }
      setTimeout(() => {
        setShaking(false)
        setGreyWash(false)
      }, 600)
    }
  }

  const handleBrag = () => {
    const coverage = calculateCoverage()
    const msg = generateBragMessage(game.bestStreak, coverage)
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleClean = () => {
    if (
      window.confirm(
        '🧹 Are you sure? This will clear your Holi progress!\nAll those beautiful splashes will be washed away...',
      )
    ) {
      clearStains()
    }
  }

  const rgb = hexToRgb(game.currentHex)
  const rank = getRank(game.bestStreak)

  return (
    <>
      {/* Splash Canvas */}
      <canvas ref={canvasRef} id="splat-canvas" />

      {/* Game UI */}
      <div
        className={`game-ui min-h-screen flex flex-col items-center justify-center p-4 transition-[filter] duration-300 ${shaking ? 'screen-shake' : ''} ${greyWash ? 'grey-wash' : ''}`}
      >
        {/* Score Bar */}
        <div className="fixed top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Streak
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {game.currentStreak}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSoundEnabled(s => !s)}
              className="bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2 text-white text-xl hover:bg-black/80 transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>

          <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 text-white text-right">
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              Best
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {game.bestStreak}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* EduLinkUp Branded Header */}
          <a
            href="https://edulinkup.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center mb-3 opacity-70 hover:opacity-100 transition-opacity"
          >
            <EduLinkUpLogo className="h-6" />
          </a>

          {/* Title */}
          <h1 className="text-center text-white text-lg font-bold mb-1 opacity-60">
            🎨 Hex-Holi: The Splash Challenge
          </h1>
          <p className="text-center text-gray-600 text-xs mb-6">
            {rank.emoji} {rank.title}
          </p>

          {/* Hex Code Display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={game.currentHex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div
                className="text-5xl md:text-6xl font-mono font-bold text-white tracking-wider select-none"
                style={{
                  textShadow: `0 0 30px ${game.currentHex}40, 0 0 60px ${game.currentHex}20`,
                }}
              >
                {game.currentHex}
              </div>
              <div className="text-gray-500 text-sm mt-2">
                What color is this?
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Color Options — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {game.options.map((hex, i) => {
              const isSelected =
                selectedHex?.toUpperCase() === hex.toUpperCase()
              const isCorrect =
                hex.toUpperCase() === game.currentHex.toUpperCase()
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
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-4xl"
                      style={{
                        textShadow:
                          '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
                      }}
                    >
                      ✓
                    </motion.span>
                  )}
                  {showWrong && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-4xl"
                      style={{
                        textShadow:
                          '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)',
                      }}
                    >
                      ✗
                    </motion.span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Hint Panel */}
          <div className="mb-4">
            <button
              onClick={() => setShowHint(h => !h)}
              className="w-full text-center text-gray-400 hover:text-white text-sm py-2 transition-colors cursor-pointer"
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
                  className="overflow-hidden"
                >
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 space-y-3">
                    <p className="text-gray-400 text-xs">
                      Higher values = More pigment
                    </p>
                    {(
                      [
                        { label: 'Red', value: rgb.r, color: '#ef4444' },
                        { label: 'Green', value: rgb.g, color: '#22c55e' },
                        { label: 'Blue', value: rgb.b, color: '#3b82f6' },
                      ] as const
                    ).map(ch => (
                      <div key={ch.label} className="flex items-center gap-3">
                        <span className="text-white text-sm w-14 shrink-0">
                          {ch.label}
                        </span>
                        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${(ch.value / 255) * 100}%`,
                            }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: ch.color }}
                          />
                        </div>
                        <span className="text-white text-sm w-24 text-right tabular-nums shrink-0">
                          {ch.value}{' '}
                          <span className="text-gray-500">
                            ({describeChannel(ch.value)})
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={handleBrag}
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              📱 Brag on WhatsApp
            </button>
            <button
              onClick={handleClean}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              🧹 Clean Screen
            </button>
          </div>

          {/* Session stats */}
          <div className="text-center mt-4 text-gray-600 text-xs">
            {game.totalCorrect} colors identified this session
          </div>

          {/* EduLinkUp Footer Banner */}
          <div className="mt-8 pt-4 border-t border-white/5">
            <a
              href="https://edulinkup.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 py-3 px-4 rounded-xl bg-indigo-950/30 hover:bg-indigo-950/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-xs">Built with 💜 by</span>
                <EduLinkUpLogo className="h-4" />
              </div>
              <p className="text-gray-600 text-[10px] group-hover:text-gray-400 transition-colors">
                Learn. Connect. Grow Together. — Free courses in Engineering, Medical & more
              </p>
            </a>
          </div>
        </motion.div>

        {/* Fixed bottom-right watermark */}
        <a
          href="https://edulinkup.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-3 right-3 z-20 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 opacity-50 hover:opacity-100 transition-opacity"
        >
          <span className="text-gray-400 text-[10px]">Powered by</span>
          <EduLinkUpLogo className="h-3" />
        </a>
      </div>
    </>
  )
}

export default App
