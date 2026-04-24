export function createPixelGrid(cols, rows) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => null)
  )
}

export function isCellInsideGrid(cell, cols, rows) {
  return (
    cell.x >= 0 &&
    cell.x < cols &&
    cell.y >= 0 &&
    cell.y < rows
  )
}

export function getCellFromPoint(point, gridOffsetX, gridOffsetY, pixelSize) {
  return {
    x: Math.floor((point.x - gridOffsetX) / pixelSize),
    y: Math.floor((point.y - gridOffsetY) / pixelSize)
  }
}

export function getCellsOnLine(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const steps = Math.max(Math.abs(dx), Math.abs(dy))

  if (steps === 0) {
    return [{ x: from.x, y: from.y }]
  }

  const cells = []

  for (let i = 0; i <= steps; i++) {
    const x = Math.round(from.x + (dx * i) / steps)
    const y = Math.round(from.y + (dy * i) / steps)
    cells.push({ x, y })
  }

  return cells
}
