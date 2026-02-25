import { PARA_COLORS, INBOX_COLOR } from '@/constants/para'
import type { ParaType } from '@/types/enums'
import type { SimNode } from '../types/graph.types'

export function getNodeColor(paraType: ParaType | null): string {
  if (!paraType) return INBOX_COLOR
  return PARA_COLORS[paraType]
}

export function nodeRadius(connectionCount: number, maxConnections: number): number {
  if (maxConnections <= 0) return 6
  const ratio = Math.sqrt(connectionCount / Math.max(maxConnections, 1))
  return 4 + ratio * 12
}

export function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, radius: number,
  color: string,
  options: { hovered?: boolean; selected?: boolean; dimmed?: boolean; orphan?: boolean },
): void {
  const opacity = options.dimmed ? 0.3 : options.hovered ? 1.0 : 0.8
  const glowOpacity = options.hovered ? 0.4 : 0.2

  // Glow
  ctx.beginPath()
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2)
  ctx.fillStyle = hexToRgba(color, glowOpacity * opacity)
  ctx.fill()

  // Node circle
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  if (options.orphan) {
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = hexToRgba(color, opacity)
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.setLineDash([])
  } else {
    ctx.fillStyle = hexToRgba(color, opacity)
    ctx.fill()
  }

  // Selection ring
  if (options.selected) {
    ctx.beginPath()
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
    ctx.strokeStyle = '#8A7D84'
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

export function drawEdge(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  options: { dashed?: boolean; highlighted?: boolean; color?: string },
): void {
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2 - 20

  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.quadraticCurveTo(midX, midY, x2, y2)

  if (options.dashed) ctx.setLineDash([4, 4])
  ctx.strokeStyle = options.highlighted
    ? hexToRgba(options.color ?? '#564A52', 0.8)
    : 'rgba(86, 74, 82, 0.3)'
  ctx.lineWidth = options.highlighted ? 1.5 : 1
  ctx.stroke()
  if (options.dashed) ctx.setLineDash([])
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  options: { opacity?: number; color?: string },
): void {
  ctx.font = '500 11px "Geist", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = hexToRgba(options.color ?? '#8A7D84', options.opacity ?? 1)
  ctx.fillText(text, x, y, 100)
}

export function hitTest(
  mouseX: number, mouseY: number, nodes: SimNode[], radiusFn: (n: SimNode) => number,
): SimNode | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i]!
    const r = radiusFn(n)
    const dx = mouseX - n.x
    const dy = mouseY - n.y
    if (dx * dx + dy * dy <= r * r) return n
  }
  return null
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
