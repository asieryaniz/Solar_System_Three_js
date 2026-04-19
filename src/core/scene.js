// src/core/scene.js

import * as THREE from 'three'

export function createScene() {
    const scene = new THREE.Scene()

    const loader = new THREE.CubeTextureLoader()

    // Load space background textures (6 images for the cube)
    const spaceTexture = loader.load([
        '/textures/space/1.jpg',
        '/textures/space/2.jpg',
        '/textures/space/3.jpg',
        '/textures/space/4.jpg',
        '/textures/space/5.jpg',
        '/textures/space/6.jpg'
    ])

    scene.background = spaceTexture

    return scene
}