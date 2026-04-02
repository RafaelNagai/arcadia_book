import { useScroll, useTransform, type MotionValue } from 'framer-motion'

export function useParallaxLayer(speed: number): MotionValue<string> {
  const { scrollY } = useScroll()
  return useTransform(scrollY, [0, 800], ['0px', `${speed * -800}px`])
}
