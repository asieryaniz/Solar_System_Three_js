// src/core/camera.js

import * as THREE from 'three'

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        75, // field of view
        window.innerWidth / window.innerHeight, // aspect ratio
        0.1, // near clipping plane
        1000 // far clipping plane
    )

    // Initial position
    camera.position.set(0, 10, 30)

    return camera
}