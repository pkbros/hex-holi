import { useState, useCallback } from 'react'
import { randomHex, generateOptions } from '../utils/colors'

interface GameState {
  currentHex: string
  options: string[]
  currentStreak: number
  bestStreak: number
  totalCorrect: number
  answered: boolean
  lastAnswer: 'correct' | 'incorrect' | null
}

function createRound(prev?: Partial<GameState>): GameState {
  const hex = randomHex()
  return {
    currentHex: hex,
    options: generateOptions(hex, 3),
    currentStreak: prev?.currentStreak ?? 0,
    bestStreak: prev?.bestStreak ?? parseInt(localStorage.getItem('hexholi-best') || '0', 10),
    totalCorrect: prev?.totalCorrect ?? 0,
    answered: false,
    lastAnswer: null,
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => createRound())

  const answer = useCallback((selectedHex: string) => {
    setState(prev => {
      if (prev.answered) return prev
      const isCorrect = selectedHex.toUpperCase() === prev.currentHex.toUpperCase()
      if (isCorrect) {
        const newStreak = prev.currentStreak + 1
        const newBest = Math.max(prev.bestStreak, newStreak)
        localStorage.setItem('hexholi-best', String(newBest))
        return {
          ...prev,
          currentStreak: newStreak,
          bestStreak: newBest,
          totalCorrect: prev.totalCorrect + 1,
          answered: true,
          lastAnswer: 'correct' as const,
        }
      }
      return {
        ...prev,
        currentStreak: 0,
        answered: true,
        lastAnswer: 'incorrect' as const,
      }
    })
  }, [])

  const nextRound = useCallback(() => {
    setState(prev =>
      createRound({
        currentStreak: prev.currentStreak,
        bestStreak: prev.bestStreak,
        totalCorrect: prev.totalCorrect,
      }),
    )
  }, [])

  return { ...state, answer, nextRound }
}
