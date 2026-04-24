<template>
  <div class="mb-4 flex items-center gap-2 shrink-0">
    <button
      type="button"
      :class="toolButtonClass('brush')"
      @click="emit('update:currentTool', 'brush')"
    >
      Brush
    </button>
    <button
      type="button"
      :class="toolButtonClass('eraser')"
      @click="emit('update:currentTool', 'eraser')"
    >
      Eraser
    </button>
    <button
      type="button"
      class="px-2 py-1 border rounded bg-green-100"
      @click="emit('export')"
    >
      Export
    </button>
    <input
      type="color"
      class="ml-4"
      :value="currentColor"
      @input="handleColorInput"
    />
    <input
      type="file"
      accept="image/*"
      class="ml-2"
      @change="handleBackgroundImageChange"
    />
    <input
      type="range"
      min="0"
      max="1"
      step="0.01"
      class="ml-2"
      :value="backgroundOpacity"
      @input="handleBackgroundOpacityInput"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  currentTool: {
    type: String,
    required: true
  },
  currentColor: {
    type: String,
    required: true
  },
  backgroundOpacity: {
    type: Number,
    required: true
  }
})

const emit = defineEmits([
  "update:currentTool",
  "update:currentColor",
  "update:backgroundOpacity",
  "export",
  "background-image-change"
])

function toolButtonClass(tool) {
  return [
    "px-2 py-1 border rounded",
    props.currentTool === tool ? "bg-blue-200" : "bg-white"
  ]
}

function handleColorInput(event) {
  emit("update:currentColor", event.target.value)
}

function handleBackgroundOpacityInput(event) {
  emit("update:backgroundOpacity", Number(event.target.value))
}

function handleBackgroundImageChange(event) {
  const file = event.target.files && event.target.files[0] ? event.target.files[0] : null
  emit("background-image-change", file)
  event.target.value = ""
}
</script>
