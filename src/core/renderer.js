// src/core/renderer.js

import * as THREE from 'three'

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Use ACES Filmic tone mapping for better color grading and dynamic range
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.5

  // Better visuals
  renderer.setPixelRatio(window.devicePixelRatio)

  document.body.appendChild(renderer.domElement)

  return renderer
}