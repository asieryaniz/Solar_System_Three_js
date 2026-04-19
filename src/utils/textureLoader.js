// src/utils/textureLoader.js

import * as THREE from 'three'

const loader = new THREE.TextureLoader()

export function loadTexture(path) {
    return loader.load(path)
}