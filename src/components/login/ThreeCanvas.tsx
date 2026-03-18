'use client'

import { useEffect, useRef } from 'react'

/**
 * ThreeCanvas — lightweight Three.js particle constellation background.
 *
 * Design: ~160 floating green particles with harmonic drift + connecting
 * lines between nearby pairs. Camera moves gently with the mouse.
 *
 * Performance: BufferGeometry (no per-frame object creation), squared-distance
 * check (no Math.sqrt), page-visibility pause, reduced-motion skip.
 * Pixel ratio clamped to 1.5 to limit GPU work.
 */
export function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Respect user preference and skip on low-power hint
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let animId = 0

    // Dynamically import Three.js — keeps it out of the server bundle
    import('three').then((THREE) => {
      if (cancelled || !containerRef.current) return

      const el = containerRef.current
      const W = el.clientWidth
      const H = el.clientHeight

      // ── Scene ──────────────────────────────────────────────────
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000)
      camera.position.z = 60

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      el.appendChild(renderer.domElement)

      // ── Particles ──────────────────────────────────────────────
      const COUNT = 160
      // Store each particle's rest position + harmonic parameters
      const restX    = new Float32Array(COUNT)
      const restY    = new Float32Array(COUNT)
      const restZ    = new Float32Array(COUNT)
      const phase    = new Float32Array(COUNT)
      const speed    = new Float32Array(COUNT)
      const amp      = new Float32Array(COUNT)

      for (let i = 0; i < COUNT; i++) {
        restX[i] = (Math.random() - 0.5) * 90
        restY[i] = (Math.random() - 0.5) * 65
        restZ[i] = (Math.random() - 0.5) * 30 - 8
        phase[i] = Math.random() * Math.PI * 2
        speed[i] = 0.25 + Math.random() * 0.4
        amp[i]   = 1.2 + Math.random() * 1.8
      }

      const positions = new Float32Array(COUNT * 3)
      const ptGeo = new THREE.BufferGeometry()
      ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const ptMat = new THREE.PointsMaterial({
        color: 0x4ade80,
        size: 0.45,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      })
      scene.add(new THREE.Points(ptGeo, ptMat))

      // ── Connection lines ───────────────────────────────────────
      // Pre-allocate enough for ~400 connections per frame
      const MAX_SEGS = 450
      const lineBuf = new Float32Array(MAX_SEGS * 6)
      const lineGeo = new THREE.BufferGeometry()
      lineGeo.setAttribute('position', new THREE.BufferAttribute(lineBuf, 3))
      lineGeo.setDrawRange(0, 0)

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.09,
      })
      scene.add(new THREE.LineSegments(lineGeo, lineMat))

      // Squared distance threshold for line connections
      const LINK_DIST_SQ = 20 * 20

      // ── Mouse parallax ─────────────────────────────────────────
      let targetCamX = 0
      let targetCamY = 0
      let camX = 0
      let camY = 0

      const onMouse = (e: MouseEvent) => {
        targetCamX = (e.clientX / window.innerWidth  - 0.5) *  9
        targetCamY = (e.clientY / window.innerHeight - 0.5) * -6
      }
      window.addEventListener('mousemove', onMouse)

      // ── Animation loop ─────────────────────────────────────────
      let t = 0

      const tick = () => {
        animId = requestAnimationFrame(tick)
        t += 0.007

        // Smooth camera follow (lerp)
        camX += (targetCamX - camX) * 0.035
        camY += (targetCamY - camY) * 0.035
        camera.position.x = camX
        camera.position.y = camY

        // Update particle positions — harmonic oscillation around rest pos
        const pos = ptGeo.attributes.position.array as Float32Array
        for (let i = 0; i < COUNT; i++) {
          const s = speed[i]
          const a = amp[i]
          const ph = phase[i]
          pos[i * 3]     = restX[i] + Math.sin(t * s + ph) * a
          pos[i * 3 + 1] = restY[i] + Math.cos(t * s + ph * 1.4) * a
          pos[i * 3 + 2] = restZ[i]
        }
        ptGeo.attributes.position.needsUpdate = true

        // Rebuild connection line segments
        const lp = lineGeo.attributes.position.array as Float32Array
        let segCount = 0

        for (let i = 0; i < COUNT && segCount < MAX_SEGS; i++) {
          const ax = pos[i * 3], ay = pos[i * 3 + 1], az = pos[i * 3 + 2]
          for (let j = i + 1; j < COUNT && segCount < MAX_SEGS; j++) {
            const dx = ax - pos[j * 3]
            const dy = ay - pos[j * 3 + 1]
            const dz = az - pos[j * 3 + 2]
            // Squared distance — avoids expensive sqrt
            if (dx * dx + dy * dy + dz * dz < LINK_DIST_SQ) {
              const base = segCount * 6
              lp[base]     = ax;          lp[base + 1] = ay;          lp[base + 2] = az
              lp[base + 3] = pos[j * 3]; lp[base + 4] = pos[j * 3 + 1]; lp[base + 5] = pos[j * 3 + 2]
              segCount++
            }
          }
        }
        lineGeo.setDrawRange(0, segCount * 2)
        lineGeo.attributes.position.needsUpdate = true

        renderer.render(scene, camera)
      }
      tick()

      // ── Resize ─────────────────────────────────────────────────
      const onResize = () => {
        const w = el.clientWidth
        const h = el.clientHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      // ── Visibility pause ───────────────────────────────────────
      const onVisibility = () => {
        if (document.hidden) cancelAnimationFrame(animId)
        else tick()
      }
      document.addEventListener('visibilitychange', onVisibility)

      // ── Cleanup ────────────────────────────────────────────────
      ;(el as any).__threeCleanup = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('resize', onResize)
        document.removeEventListener('visibilitychange', onVisibility)
        ptGeo.dispose()
        lineGeo.dispose()
        ptMat.dispose()
        lineMat.dispose()
        renderer.dispose()
        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
      }
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(animId)
      const el = containerRef.current
      if (el && (el as any).__threeCleanup) {
        ;(el as any).__threeCleanup()
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
