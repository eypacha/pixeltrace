<template>
  <div ref="containerRef" class="h-full w-full">
    <canvas
      ref="canvasRef"
      :style="{ cursor }"
      class="border w-full h-full block"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handlePointerUp"
      @mouseleave="handleMouseLeave"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { drawPixelEditorCanvas } from "../../utils/canvas-renderer.js"
import {
  GRID_EDGE_SIZE,
  getCellFromPoint,
  getGridBounds,
  isOnGridEdge
} from "../../utils/pixel-grid.js"

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
  isDraggingGrid: {
    type: Boolean,
    default: false
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
const hoverMouseX = ref(null)
const hoverMouseY = ref(null)
const isPointerDown = ref(false)
const isPointerDownOnGridEdge = ref(false)

let resizeObserver = null

const cursor = computed(() => {
  const bounds = getGridBounds(
    props.gridOffsetX,
    props.gridOffsetY,
    props.cols,
    props.rows,
    props.pixelSize
  )

  const onGridEdge =
    hoverMouseX.value !== null &&
    hoverMouseY.value !== null &&
    isOnGridEdge(hoverMouseX.value, hoverMouseY.value, bounds, GRID_EDGE_SIZE)

  if (props.isDraggingGrid || (isPointerDown.value && isPointerDownOnGridEdge.value)) {
    return "grabbing"
  }

  if (!onGridEdge) {
    return "default"
  }

  return "grab"
})

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

function getPointerPosition(event) {
  const canvas = canvasRef.value
  if (!canvas) {
    return { mouseX: 0, mouseY: 0 }
  }

  const rect = canvas.getBoundingClientRect()
  return {
    mouseX: event.clientX - rect.left,
    mouseY: event.clientY - rect.top
  }
}

function createPointerPayload(event) {
  const { mouseX, mouseY } = getPointerPosition(event)
  return {
    mouseX,
    mouseY,
    cell: getCellFromPoint(
      { x: mouseX, y: mouseY },
      props.gridOffsetX,
      props.gridOffsetY,
      props.pixelSize
    )
  }
}

function handleMouseDown(event) {
  isPointerDown.value = true
  const payload = createPointerPayload(event)
  hoverMouseX.value = payload.mouseX
  hoverMouseY.value = payload.mouseY
  const bounds = getGridBounds(
    props.gridOffsetX,
    props.gridOffsetY,
    props.cols,
    props.rows,
    props.pixelSize
  )
  isPointerDownOnGridEdge.value = isOnGridEdge(
    payload.mouseX,
    payload.mouseY,
    bounds,
    GRID_EDGE_SIZE
  )
  emit("cell-down", payload)
}

function handleMouseMove(event) {
  const payload = createPointerPayload(event)
  hoverMouseX.value = payload.mouseX
  hoverMouseY.value = payload.mouseY

  if (!isPointerDown.value) {
    return
  }

  emit("cell-move", payload)
}

function handlePointerUp() {
  isPointerDown.value = false
  isPointerDownOnGridEdge.value = false
  emit("pointer-up")
}

function handleMouseLeave() {
  isPointerDown.value = false
  isPointerDownOnGridEdge.value = false
  hoverMouseX.value = null
  hoverMouseY.value = null
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
