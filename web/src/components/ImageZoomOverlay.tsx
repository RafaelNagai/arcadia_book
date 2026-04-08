import { motion, AnimatePresence } from 'framer-motion'

/**
 * Shared full-screen image zoom overlay.
 * Render at the root of the page (outside any transform container).
 * Pass `src={null}` or omit to keep it closed.
 */
export function ImageZoomOverlay({
  src,
  onClose,
}: {
  src: string | null
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          key="zoom-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
          }}
          onClick={onClose}
        >
          <motion.img
            key={src}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            src={src}
            alt=""
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 6,
              boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
            }}
            onClick={e => e.stopPropagation()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
