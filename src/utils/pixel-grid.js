export const GRID_EDGE_SIZE = 12

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

export function getGridBounds(gridOffsetX, gridOffsetY, cols, rows, pixelSize) {
  return {
    left: gridOffsetX,
    top: gridOffsetY,
    right: gridOffsetX + cols * pixelSize,
    bottom: gridOffsetY + rows * pixelSize
  }
}

export function clampGridOffset(
  offsetX,
  offsetY,
  canvasWidth,
  canvasHeight,
  gridWidth,
  gridHeight
) {
  const minX = Math.min(0, canvasWidth - gridWidth)
  const maxX = Math.max(0, canvasWidth - gridWidth)
  const minY = Math.min(0, canvasHeight - gridHeight)
  const maxY = Math.max(0, canvasHeight - gridHeight)

  return {
    x: Math.min(Math.max(offsetX, minX), maxX),
    y: Math.min(Math.max(offsetY, minY), maxY)
  }
}

export function isOnGridEdge(mouseX, mouseY, bounds, edgeSize) {
  const withinOuterBounds =
    mouseX >= bounds.left - edgeSize &&
    mouseX <= bounds.right + edgeSize &&
    mouseY >= bounds.top - edgeSize &&
    mouseY <= bounds.bottom + edgeSize

  const withinGridBounds =
    mouseX >= bounds.left &&
    mouseX <= bounds.right &&
    mouseY >= bounds.top &&
    mouseY <= bounds.bottom

  return withinOuterBounds && !withinGridBounds
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
