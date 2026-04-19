// src/objects/Sun.js

import * as THREE from 'three'

import { loadTexture } from '../utils/textureLoader.js'

export class Sun {
    constructor({
        size = 2,
        color = 0xffff00,
        lightIntensity = 800,
        lightDistance = 3000
    } = {}) {

        // Geometry & material (visible sun)
        const geometry = new THREE.SphereGeometry(size, 32, 32)
        const material = new THREE.MeshBasicMaterial({
            map: loadTexture('/textures/sun.jpg')
        })

        this.mesh = new THREE.Mesh(geometry, material)

        // Light emitted by the sun
        this.light = new THREE.PointLight(color, lightIntensity, lightDistance)
        this.mesh.add(this.light)
        this.light.position.set(0, 0, 0)
    }

    // Add sun to scene
    addToScene(scene) {
        scene.add(this.mesh)
        scene.add(this.light)
    }

    update() {
        // Slow rotation for visual effect
        this.mesh.rotation.y += 0.002
    }
}