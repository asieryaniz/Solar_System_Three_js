// src/controls/controls.js

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function createControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement)

    // Limit zoom distance
    controls.minDistance = 5
    controls.maxDistance = 100

    // Smooth movement
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // Zoom settings
    controls.enableZoom = true

    // Limit vertical rotation
    controls.maxPolarAngle = Math.PI

    return controls
}