"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  pulsePhase: number
}

export function NeuralNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const nodesRef = useRef<Node[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createNodes = () => {
      const nodeCount = Math.floor((canvas.width * canvas.height) / 15000)
      nodesRef.current = []

      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    const drawNode = (node: Node, time: number) => {
      const pulse = Math.sin(time * 0.002 + node.pulsePhase) * 0.3 + 0.7
      const finalOpacity = node.opacity * pulse

      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(156, 163, 175, ${finalOpacity})`
      ctx.fill()

      // Add a subtle glow effect
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius * pulse * 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(156, 163, 175, ${finalOpacity * 0.1})`
      ctx.fill()
    }

    const drawConnection = (node1: Node, node2: Node, distance: number, maxDistance: number, time: number) => {
      const opacity = (1 - distance / maxDistance) * 0.3
      const wave = Math.sin(time * 0.001 + distance * 0.01) * 0.5 + 0.5
      const finalOpacity = opacity * wave

      ctx.beginPath()
      ctx.moveTo(node1.x, node1.y)
      ctx.lineTo(node2.x, node2.y)
      ctx.strokeStyle = `rgba(156, 163, 175, ${finalOpacity})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    const updateNode = (node: Node) => {
      node.x += node.vx
      node.y += node.vy

      // Bounce off edges
      if (node.x <= 0 || node.x >= canvas.width) {
        node.vx *= -1
        node.x = Math.max(0, Math.min(canvas.width, node.x))
      }
      if (node.y <= 0 || node.y >= canvas.height) {
        node.vy *= -1
        node.y = Math.max(0, Math.min(canvas.height, node.y))
      }

      // Add some randomness to movement
      node.vx += (Math.random() - 0.5) * 0.02
      node.vy += (Math.random() - 0.5) * 0.02

      // Limit velocity
      const maxVelocity = 1
      node.vx = Math.max(-maxVelocity, Math.min(maxVelocity, node.vx))
      node.vy = Math.max(-maxVelocity, Math.min(maxVelocity, node.vy))
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current
      const maxConnectionDistance = 120

      // Update and draw nodes
      nodes.forEach((node) => {
        updateNode(node)
        drawNode(node, time)
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxConnectionDistance) {
            drawConnection(nodes[i], nodes[j], distance, maxConnectionDistance, time)
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      resizeCanvas()
      createNodes()
    }

    // Initialize
    resizeCanvas()
    createNodes()
    animate(0)

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)" }}
    />
  )
}
