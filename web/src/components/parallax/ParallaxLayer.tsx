import { motion } from 'framer-motion'
import { useParallaxLayer } from '@/hooks/useParallax'
import type { ReactNode } from 'react'

interface ParallaxLayerProps {
  speed: number
  zIndex?: number
  children: ReactNode
  className?: string
}

export function ParallaxLayer({ speed, zIndex = 0, children, className = '' }: ParallaxLayerProps) {
  const y = useParallaxLayer(speed)

  return (
    <motion.div
      style={{ y, zIndex }}
      className={`absolute inset-0 ${className}`}
    >
      {children}
    </motion.div>
  )
}
