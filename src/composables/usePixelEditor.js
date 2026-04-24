import { ref } from "vue"
import { exportPixelGridToDataUrl } from "../utils/canvas-renderer.js"
import {
  GRID_EDGE_SIZE,
  clampGridOffset,
  createPixelGrid,
  getCellsOnLine,
  getGridBounds,
  isCellInsideGrid,
  isOnGridEdge
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
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)
  const isDraggingGrid = ref(false)

  let isDrawing = false
  let lastCell = null
  let dragStartX = 0
  let dragStartY = 0
  let initialOffsetX = 0
  let initialOffsetY = 0
  let hasInitializedGridPosition = false
  let backgroundLoadToken = 0

  const gridWidth = cols * pixelSize
  const gridHeight = rows * pixelSize

  function setGridOffset(offsetX, offsetY) {
    if (canvasWidth.value <= 0 || canvasHeight.value <= 0) {
      gridOffsetX.value = offsetX
      gridOffsetY.value = offsetY
      return
    }

    const clamped = clampGridOffset(
      offsetX,
      offsetY,
      canvasWidth.value,
      canvasHeight.value,
      gridWidth,
      gridHeight
    )

    gridOffsetX.value = clamped.x
    gridOffsetY.value = clamped.y
  }

  function handleCanvasResize({ width, height }) {
    canvasWidth.value = width
    canvasHeight.value = height

    if (!hasInitializedGridPosition) {
      setGridOffset((width - gridWidth) / 2, (height - gridHeight) / 2)
      hasInitializedGridPosition = true
      return
    }

    setGridOffset(gridOffsetX.value, gridOffsetY.value)
  }

  function updateGridDragPosition(mouseX, mouseY) {
    setGridOffset(
      initialOffsetX + (mouseX - dragStartX),
      initialOffsetY + (mouseY - dragStartY)
    )
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

  function handleCellDown(payload = {}) {
    const { cell, mouseX, mouseY } = payload
    if (!cell) {
      return
    }

    const bounds = getGridBounds(
      gridOffsetX.value,
      gridOffsetY.value,
      cols,
      rows,
      pixelSize
    )

    if (isOnGridEdge(mouseX, mouseY, bounds, GRID_EDGE_SIZE)) {
      isDraggingGrid.value = true
      dragStartX = mouseX
      dragStartY = mouseY
      initialOffsetX = gridOffsetX.value
      initialOffsetY = gridOffsetY.value
      isDrawing = false
      lastCell = null
      return
    }

    isDrawing = true
    lastCell = cell
    paintCell(cell)
  }

  function handleCellMove(payload = {}) {
    const { cell, mouseX, mouseY } = payload

    if (isDraggingGrid.value) {
      updateGridDragPosition(mouseX, mouseY)
      return
    }

    if (!isDrawing) {
      return
    }

    if (!cell) {
      return
    }

    const cells = lastCell ? getCellsOnLine(lastCell, cell) : [cell]
    cells.forEach(paintCell)
    lastCell = cell
  }

  function handlePointerUp() {
    isDraggingGrid.value = false
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
    isDraggingGrid,
    handleCanvasResize,
    handleCellDown,
    handleCellMove,
    handlePointerUp,
    handleBackgroundImageChange,
    exportImage
  }
}
