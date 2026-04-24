export function drawPixelEditorCanvas(ctx, options) {
  const {
    grid,
    cols,
    rows,
    pixelSize,
    gridOffsetX,
    gridOffsetY,
    backgroundImage,
    backgroundOpacity
  } = options

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  if (backgroundImage) {
    const scale = Math.min(
      ctx.canvas.width / backgroundImage.width,
      ctx.canvas.height / backgroundImage.height
    )
    const drawWidth = backgroundImage.width * scale
    const drawHeight = backgroundImage.height * scale
    const drawX = (ctx.canvas.width - drawWidth) / 2
    const drawY = (ctx.canvas.height - drawHeight) / 2

    ctx.save()
    ctx.globalAlpha = backgroundOpacity
    ctx.drawImage(backgroundImage, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()
  }

  const gridWidth = cols * pixelSize
  const gridHeight = rows * pixelSize

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x]
      const px = gridOffsetX + x * pixelSize
      const py = gridOffsetY + y * pixelSize

      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(px, py, pixelSize, pixelSize)
      }

      ctx.strokeStyle = "#eee"
      ctx.strokeRect(px, py, pixelSize, pixelSize)
    }
  }

  ctx.strokeStyle = "rgba(0, 0, 0, 0.32)"
  ctx.strokeRect(gridOffsetX, gridOffsetY, gridWidth, gridHeight)
}

export function exportPixelGridToDataUrl(grid, cols, rows) {
  const exportCanvas = document.createElement("canvas")
  exportCanvas.width = cols
  exportCanvas.height = rows

  const exportCtx = exportCanvas.getContext("2d")
  if (!exportCtx) {
    return ""
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x]

      if (color) {
        exportCtx.fillStyle = color
        exportCtx.fillRect(x, y, 1, 1)
      }
    }
  }

  return exportCanvas.toDataURL("image/png")
}
