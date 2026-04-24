<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from "vue"

const wheelOptions = { passive: false, capture: true }
const keyOptions = { capture: true }

function blockPageZoom(event) {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
  }
}

function blockZoomShortcuts(event) {
  if (!(event.ctrlKey || event.metaKey)) return

  const key = event.key
  if (key === "+" || key === "-" || key === "0" || key === "=") {
    event.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener("wheel", blockPageZoom, wheelOptions)
  window.addEventListener("keydown", blockZoomShortcuts, keyOptions)
})

onBeforeUnmount(() => {
  window.removeEventListener("wheel", blockPageZoom, wheelOptions)
  window.removeEventListener("keydown", blockZoomShortcuts, keyOptions)
})
</script>
