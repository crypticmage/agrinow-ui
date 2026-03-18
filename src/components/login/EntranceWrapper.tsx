'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Wraps the login page content in a smooth upward-fade entrance animation.
 * Must be a client component since framer-motion requires the browser.
 */
export function EntranceWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
