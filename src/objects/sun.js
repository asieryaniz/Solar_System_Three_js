// src/objects/Sun.js

import * as THREE from 'three'

import { loadTexture } from '../utils/textureLoader.js'
import { SimulationSettings } from '../systems/simulationSettings.js'

export class Sun {
    constructor({
        size = 2,
        color = 0xffffff,
        lightIntensity = 200,
        lightDistance = 0
    } = {}) {

        // Geometry & material (visible sun)
        const geometry = new THREE.SphereGeometry(size, 32, 32)
        const material = new THREE.MeshBasicMaterial({
            map: loadTexture('/textures/sun.jpg'),
            emissive: 0xffffaa,
            emissiveIntensity: 3
        })

        this.mesh = new THREE.Mesh(geometry, material)

        // Light emitted by the sun
        this.light = new THREE.PointLight(color, lightIntensity, lightDistance)
        this.light.decay = 1.5
        this.mesh.add(this.light)
        this.light.position.set(0, 0, 0)
    }

    // Add sun to scene
    addToScene(scene) {
        scene.add(this.mesh)
        scene.add(this.light)
    }

    update() {
        if (SimulationSettings.pause) return
        
        // Slow rotation for visual effect
        this.mesh.rotation.y += 0.002
    }
}