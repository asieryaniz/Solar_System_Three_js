// src/objects/Planet.js

import * as THREE from 'three'

import { loadTexture } from '../utils/textureLoader.js'

export class Planet {
    constructor({
        name = 'planet',
        size = 1,
        color = 0xffffff,
        distance = 5,
        orbitSpeed = 0.01,
        rotationSpeed = 0.01
    }) 
    {
        this.name = name
        this.orbitSpeed = orbitSpeed
        this.rotationSpeed = rotationSpeed

        // Geometry and material
        const geometry = new THREE.SphereGeometry(size, 32, 32)

        let material

        // Use textures for the distinct planets
        if (name === 'Earth') {
            material = new THREE.MeshStandardMaterial({
                map: loadTexture('/textures/earth.jpg')
            })
        }
        else if (name === 'Mars') {
            material = new THREE.MeshStandardMaterial({
                map: loadTexture('/textures/mars.jpeg')
            })
        }
        else {
            material = new THREE.MeshStandardMaterial({ color })
        }

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.userData.parent = this

        // Pivot for orbit
        this.pivot = new THREE.Object3D()

        // Position planet away from center
        this.mesh.position.x = distance

        // Build hierarchy
        this.pivot.add(this.mesh)

        // Hitbox (invisible larger sphere for interaction)
        const hitGeometry = new THREE.SphereGeometry(size * 2.2, 16, 16)
        const hitMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            visible: false
        })

        this.hitbox = new THREE.Mesh(hitGeometry, hitMaterial)
        this.hitbox.position.x = distance

        this.pivot.add(this.hitbox)

        this.hitbox.userData.parent = this
  }

    // Add planet system to scene
    addToScene(scene) {
        scene.add(this.pivot)
    }

    // Update method (used by loop system)
    update() {
        // Orbit around center
        this.pivot.rotation.y += this.orbitSpeed

        // Self rotation
        this.mesh.rotation.y += this.rotationSpeed
    }
}