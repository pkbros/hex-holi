import { useRef, useCallback, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  life: number
  maxLife: number
}

interface Stain {
  x: number
  y: number
  color: string
  alpha: number
  blobs: { dx: number; dy: number; r: number }[]
}

export function useSplatCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stainsRef = useRef<Stain[]>([])
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef(0)
  const coverageRef = useRef(new Set<string>())

  const getSize = useCallback(() => {
    const c = canvasRef.current
    return c ? { w: c.width, h: c.height } : { w: 0, h: 0 }
  }, [])

  const calculateCoverage = useCallback((): number => {
    const { w, h } = getSize()
    if (!w || !h) return 0
    const cell = 20
    const total = Math.floor(w / cell) * Math.floor(h / cell)
    return total
      ? Math.min(100, Math.round((coverageRef.current.size / total) * 100))
      : 0
  }, [getSize])

  const markCoverage = useCallback((x: number, y: number, r: number) => {
    const cell = 20
    for (let cx = Math.floor((x - r) / cell); cx <= Math.floor((x + r) / cell); cx++) {
      for (let cy = Math.floor((y - r) / cell); cy <= Math.floor((y + r) / cell); cy++) {
        coverageRef.current.add(`${cx},${cy}`)
      }
    }
  }, [])

  const burst = useCallback(
    (color: string) => {
      const { w, h } = getSize()
      const mx = w / 2
      const my = h / 2
      const count = 120

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = 3 + Math.random() * 12
        particlesRef.current.push({
          x: mx + (Math.random() - 0.5) * 40,
          y: my + (Math.random() - 0.5) * 40,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 3 + Math.random() * 8,
          color,
          life: 50 + Math.floor(Math.random() * 40),
          maxLife: 90,
        })
      }
    },
    [getSize],
  )

  const clearStains = useCallback(() => {
    stainsRef.current = []
    coverageRef.current.clear()
  }, [])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw persistent stains
      for (const s of stainsRef.current) {
        ctx.globalAlpha = s.alpha
        ctx.fillStyle = s.color
        for (const b of s.blobs) {
          ctx.beginPath()
          ctx.arc(s.x + b.dx, s.y + b.dy, b.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Update & draw active particles
      const alive: Particle[] = []
      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.15 // gravity
        p.vx *= 0.98 // friction
        p.vy *= 0.98
        p.life--

        if (p.life <= 0) {
          // Convert dead particle into a permanent stain
          const blobs = Array.from(
            { length: 3 + Math.floor(Math.random() * 4) },
            () => ({
              dx: (Math.random() - 0.5) * p.radius * 2,
              dy: (Math.random() - 0.5) * p.radius * 2,
              r: p.radius * (0.4 + Math.random() * 0.8),
            }),
          )
          stainsRef.current.push({
            x: p.x,
            y: p.y,
            color: p.color,
            alpha: 0.25 + Math.random() * 0.3,
            blobs,
          })
          markCoverage(p.x, p.y, p.radius * 2)
        } else {
          ctx.globalAlpha = p.life / p.maxLife
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fill()
          alive.push(p)
        }
      }
      ctx.globalAlpha = 1
      particlesRef.current = alive

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [markCoverage])

  return { canvasRef, burst, clearStains, calculateCoverage }
}
