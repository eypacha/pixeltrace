<template>
  <div class="p-4 h-screen flex flex-col">
    <Toolbar
      v-model:currentTool="currentTool"
      v-model:currentColor="currentColor"
      v-model:backgroundOpacity="backgroundOpacity"
      @export="exportImage"
      @background-image-change="handleBackgroundImageChange"
    />
    <div class="flex-1 min-h-0">
      <Canvas
        :grid="grid"
        :cols="cols"
        :rows="rows"
        :pixel-size="pixelSize"
        :grid-offset-x="gridOffsetX"
        :grid-offset-y="gridOffsetY"
        :background-image="backgroundImage"
        :background-opacity="backgroundOpacity"
        @resize="handleCanvasResize"
        @cell-down="handleCellDown"
        @cell-move="handleCellMove"
        @pointer-up="handlePointerUp"
      />
    </div>
  </div>
</template>

<script setup>
import Canvas from "../components/editor/Canvas.vue"
import Toolbar from "../components/editor/Toolbar.vue"
import { usePixelEditor } from "../composables/usePixelEditor.js"

const {
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
} = usePixelEditor()
</script>
