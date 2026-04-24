<template>
  <div class="p-4">
    <div class="mb-4">
      <input type="color" v-model="currentColor" />
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

// estado de la grilla
const grid = Array.from({ length: rows }, () =>
  Array.from({ length: cols }, () => null)
)

let isDrawing = false
let currentColor = "#000000"

// --- INIT ---
onMounted(() => {
  const canvas = canvasRef.value
  canvas.width = cols * pixelSize
  canvas.height = rows * pixelSize

  ctx = canvas.getContext("2d")
  draw()
})

// --- DRAW ---
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

// --- INPUT ---
function getCellFromMouse(e) {
  const rect = canvasRef.value.getBoundingClientRect()
  const x = Math.floor((e.clientX - rect.left) / pixelSize)
  const y = Math.floor((e.clientY - rect.top) / pixelSize)

  return { x, y }
}

function paint(e) {
  const { x, y } = getCellFromMouse(e)

  if (x >= 0 && x < cols && y >= 0 && y < rows) {
    grid[y][x] = currentColor
    draw()
  }
}

function handleMouseDown(e) {
  isDrawing = true
  paint(e)
}

function handleMouseMove(e) {
  if (!isDrawing) return
  paint(e)
}

function handleMouseUp() {
  isDrawing = false
}
</script>