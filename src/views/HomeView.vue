<template>
  <div class="p-4 h-screen flex flex-col">
    <div class="mb-4 flex items-center gap-2 shrink-0">
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
    <div class="flex-1 min-h-0">
      <canvas
        ref="canvasRef"
        class="border w-full h-full block"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"

const canvasRef = ref(null)

const cols = 32
const rows = 32
const pixelSize = 16


let ctx = null
let gridOffsetX = 0
let gridOffsetY = 0


const grid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => null)
)

const currentTool = ref("brush")



let isDrawing = false
let currentColor = ref("#000000")
let lastCell = null


function resizeCanvas() {
  const canvas = canvasRef.value
    const parent = canvas.parentElement
    const rect = parent.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  gridOffsetX = (canvas.width - cols * pixelSize) / 2
  gridOffsetY = (canvas.height - rows * pixelSize) / 2
  ctx = canvas.getContext("2d")
  draw()
}

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})


function draw() {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const color = grid[y][x]
      const px = gridOffsetX + x * pixelSize
      const py = gridOffsetY + y * pixelSize
      if (color) {
        ctx.fillStyle = color
        ctx.fillRect(
          px,
          py,
          pixelSize,
          pixelSize
        )
      }
      ctx.strokeStyle = "#eee"
      ctx.strokeRect(
        px,
        py,
        pixelSize,
        pixelSize
      )
    }
  }
}


function getCellFromMouse(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left - gridOffsetX) / pixelSize)
  const y = Math.floor((e.clientY - rect.top - gridOffsetY) / pixelSize)
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