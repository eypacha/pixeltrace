<template>
  <div ref="containerRef" class="h-full w-full">
    <canvas
      ref="canvasRef"
      class="border w-full h-full block"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handlePointerUp"
      @mouseleave="handlePointerUp"
    />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import { drawPixelEditorCanvas } from "../../utils/canvas-renderer.js"
import { getCellFromPoint } from "../../utils/pixel-grid.js"

const props = defineProps({
  grid: {
    type: Array,
    required: true
  },
  cols: {
    type: Number,
    required: true
  },
  rows: {
    type: Number,
    required: true
  },
  pixelSize: {
    type: Number,
    required: true
  },
  gridOffsetX: {
    type: Number,
    required: true
  },
  gridOffsetY: {
    type: Number,
    required: true
  },
  backgroundImage: {
    type: Object,
    default: null
  },
  backgroundOpacity: {
    type: Number,
    required: true
  }
})

const emit = defineEmits([
  "resize",
  "cell-down",
  "cell-move",
  "pointer-up"
])

const canvasRef = ref(null)
const containerRef = ref(null)

let resizeObserver = null
let isPointerDown = false

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }

  drawPixelEditorCanvas(ctx, {
    grid: props.grid,
    cols: props.cols,
    rows: props.rows,
    pixelSize: props.pixelSize,
    gridOffsetX: props.gridOffsetX,
    gridOffsetY: props.gridOffsetY,
    backgroundImage: props.backgroundImage,
    backgroundOpacity: props.backgroundOpacity
  })
}

function syncCanvasSize() {
  const canvas = canvasRef.value
  const container = containerRef.value
  if (!canvas || !container) {
    return
  }

  const rect = container.getBoundingClientRect()
  const width = Math.round(rect.width)
  const height = Math.round(rect.height)

  if (canvas.width !== width) {
    canvas.width = width
  }

  if (canvas.height !== height) {
    canvas.height = height
  }

  emit("resize", { width, height })
}

function getCellFromMouse(event) {
  const canvas = canvasRef.value
  if (!canvas) {
    return null
  }

  const rect = canvas.getBoundingClientRect()
  return getCellFromPoint(
    {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    },
    props.gridOffsetX,
    props.gridOffsetY,
    props.pixelSize
  )
}

function handleMouseDown(event) {
  isPointerDown = true
  const cell = getCellFromMouse(event)
  if (cell) {
    emit("cell-down", cell)
  }
}

function handleMouseMove(event) {
  if (!isPointerDown) {
    return
  }

  const cell = getCellFromMouse(event)
  if (cell) {
    emit("cell-move", cell)
  }
}

function handlePointerUp() {
  if (!isPointerDown) {
    return
  }

  isPointerDown = false
  emit("pointer-up")
}

watch(
  () => [
    props.grid,
    props.cols,
    props.rows,
    props.pixelSize,
    props.gridOffsetX,
    props.gridOffsetY,
    props.backgroundImage,
    props.backgroundOpacity
  ],
  drawCanvas,
  { deep: true, immediate: true }
)

onMounted(() => {
  syncCanvasSize()

  if (typeof ResizeObserver !== "undefined" && containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      syncCanvasSize()
    })
    resizeObserver.observe(containerRef.value)
  } else {
    window.addEventListener("resize", syncCanvasSize)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  } else {
    window.removeEventListener("resize", syncCanvasSize)
  }
})
</script>
