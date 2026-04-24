import { ref } from "vue"
import { exportPixelGridToDataUrl } from "../utils/canvas-renderer.js"
import {
  createPixelGrid,
  getCellsOnLine,
  isCellInsideGrid
} from "../utils/pixel-grid.js"
import { loadImageFromFile } from "../utils/image-loader.js"

const cols = 32
const rows = 32
const pixelSize = 16

export function usePixelEditor() {
  const grid = ref(createPixelGrid(cols, rows))
  const currentTool = ref("brush")
  const currentColor = ref("#000000")
  const backgroundOpacity = ref(0.5)
  const backgroundImage = ref(null)
  const gridOffsetX = ref(0)
  const gridOffsetY = ref(0)

  let isDrawing = false
  let lastCell = null
  let backgroundLoadToken = 0

  function handleCanvasResize({ width, height }) {
    gridOffsetX.value = (width - cols * pixelSize) / 2
    gridOffsetY.value = (height - rows * pixelSize) / 2
  }

  function paintCell(cell) {
    if (!isCellInsideGrid(cell, cols, rows)) {
      return
    }

    if (currentTool.value === "brush") {
      grid.value[cell.y][cell.x] = currentColor.value
    } else if (currentTool.value === "eraser") {
      grid.value[cell.y][cell.x] = null
    }
  }

  function handleCellDown(cell) {
    isDrawing = true
    lastCell = cell
    paintCell(cell)
  }

  function handleCellMove(cell) {
    if (!isDrawing) {
      return
    }

    const cells = lastCell ? getCellsOnLine(lastCell, cell) : [cell]
    cells.forEach(paintCell)
    lastCell = cell
  }

  function handlePointerUp() {
    isDrawing = false
    lastCell = null
  }

  async function handleBackgroundImageChange(file) {
    const requestToken = ++backgroundLoadToken

    if (!file) {
      backgroundImage.value = null
      return
    }

    try {
      const image = await loadImageFromFile(file)
      if (requestToken === backgroundLoadToken) {
        backgroundImage.value = image
      }
    } catch {
      if (requestToken === backgroundLoadToken) {
        backgroundImage.value = null
      }
    }
  }

  function exportImage() {
    const dataUrl = exportPixelGridToDataUrl(grid.value, cols, rows)
    if (!dataUrl) {
      return
    }

    const a = document.createElement("a")
    a.href = dataUrl
    a.download = "pixeltrace.png"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return {
    cols,
    rows,
    pixelSize,
    grid,
    currentTool,
    currentColor,
    backgroundOpacity,
    backgroundImage,
    gridOffsetX,
    gridOffsetY,
    handleCanvasResize,
    handleCellDown,
    handleCellMove,
    handlePointerUp,
    handleBackgroundImageChange,
    exportImage
  }
}
