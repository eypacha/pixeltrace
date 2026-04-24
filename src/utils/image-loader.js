export function loadImageFromFile(file) {
  if (!file) {
    return Promise.resolve(null)
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Unable to load image"))
    }

    image.src = url
  })
}
