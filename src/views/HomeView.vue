<template>
  <div class="p-4">

    <div class="mb-4 flex items-center gap-2">
      <button
        :class="['px-2 py-1 border rounded', currentTool === 'brush' ? 'bg-blue-200' : 'bg-white']"
        @click="currentTool = 'brush'"
      >Brush</button>
      <button
        :class="['px-2 py-1 border rounded', currentTool === 'eraser' ? 'bg-blue-200' : 'bg-white']"
        @click="currentTool = 'eraser'"
      >Eraser</button>
      <button
        class="px-2 py-1 border rounded bg-green-100"
        @click="exportImage"
      >Export</button>
      <input type="color" v-model="currentColor" class="ml-4" />
    </div>

    <canvas
      ref="canvasRef"
      class="border"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const canvasRef = ref(null)

const cols = 32
const rows = 32
const pixelSize = 16

let ctx = null


const grid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => null)
)

const currentTool = ref("brush")



let isDrawing = false
let currentColor = ref("#000000")
let lastCell = null

onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = cols * pixelSize
  canvas.height = rows * pixelSize

  ctx = canvas.getContext("2d")
  draw()
})

function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x]

      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(
          x * pixelSize,
          y * pixelSize,
          pixelSize,
          pixelSize
        )
      }

      // grid lines
      ctx.strokeStyle = "#eee"
      ctx.strokeRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize
      )
    }
  }
}

function getCellFromMouse(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / pixelSize)
  const y = Math.floor((e.clientY - rect.top) / pixelSize)

  return { x, y }
}



function paintCell({ x, y }) {
  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    if (currentTool.value === "brush") {
      grid[y][x] = currentColor.value
    } else if (currentTool.value === "eraser") {
      grid[y][x] = null
    }
  }
}

function drawLine(from, to) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(from.x + (dx * i) / steps)
    const y = Math.round(from.y + (dy * i) / steps)
    paintCell({ x, y })
  }
}



function handleMouseDown(e) {
  isDrawing = true
  const cell = getCellFromMouse(e)
  lastCell = cell
  paintCell(cell)
  draw()
}



function handleMouseMove(e) {
  if (!isDrawing) return
  const cell = getCellFromMouse(e)
  if (lastCell) {
    drawLine(lastCell, cell)
  }
  lastCell = cell
  draw()
}



function handleMouseUp() {
  isDrawing = false
  lastCell = null
}

function exportImage() {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = cols
  exportCanvas.height = rows
  const exportCtx = exportCanvas.getContext('2d')
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x]
      if (color) {
        exportCtx.fillStyle = color
        exportCtx.fillRect(x, y, 1, 1)
      }
    }
  }
  const dataUrl = exportCanvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = 'pixeltrace.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
</script>