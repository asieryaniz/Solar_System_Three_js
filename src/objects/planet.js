// src/objects/Planet.js

import * as THREE from 'three'

import { loadTexture } from '../utils/textureLoader.js'
import { SimulationSettings } from '../systems/simulationSettings.js'

export class Planet {
    constructor({
        name = 'planet',
        size = 1,
        color = 0xffffff,
        distance = 5,
        orbitSpeed = 0.01,
        rotationSpeed = 0.01,
        texture,
        info,
        tilt,
        eccentricity
    }) 
    {
        this.name = name
        this.orbitSpeed = orbitSpeed
        this.rotationSpeed = rotationSpeed
        this.info = info || {}
        this.distance = distance
        this.tilt = tilt || 0
        this.eccentricity = eccentricity || 0
        this.orbitPosition = new THREE.Vector3()
        

        // Geometry and material
        const geometry = new THREE.SphereGeometry(size, 32, 32)

        let material

        // Use textures for the distinct planets
        if (texture) {
            material = new THREE.MeshStandardMaterial({ map: loadTexture(texture) })
        } 
        else {
            material = new THREE.MeshStandardMaterial({ color })
        }

        this.mesh = new THREE.Mesh(geometry, material)
        this.mesh.userData.parent = this

        // Saturn ring (only if planet is Saturn)
        if (this.name === 'Saturn') {

            const ringGeometry = new THREE.RingGeometry(1.8, 3, 64)

            const ringTexture = new THREE.TextureLoader().load('/textures/saturn_ring.png')

            const ringMaterial = new THREE.MeshBasicMaterial({
                map: ringTexture,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 1
            })

            this.ring = new THREE.Mesh(ringGeometry, ringMaterial)
            this.ring.rotation.x = Math.PI / 2.2
            this.mesh.add(this.ring)
        }

        // Pivot for orbit
        this.pivot = new THREE.Object3D()

        // Position planet away from center
        // this.mesh.position.x = distance

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
        // this.hitbox.position.x = distance

        this.pivot.add(this.hitbox)

        this.hitbox.userData.parent = this

        // Track whether we've frozen the orbit position
        this._orbitFrozen = false
  }

    // Add planet system to scene
    addToScene(scene) {
        scene.add(this.pivot)
    }

    // Update method (used by loop system)
    update() {
        if (SimulationSettings.pause) return

        if (SimulationSettings.missionMode) {
            // Freeze orbital position on first missionMode frame
            if (!this._orbitFrozen) {
                this._frozenPivotPos = this.pivot.position.clone()
                this._orbitFrozen = true
            }
            // Keep pivot locked — only allow self-rotation
            this.pivot.position.copy(this._frozenPivotPos)
            this.mesh.rotation.y += this.rotationSpeed * SimulationSettings.timeScale
            return
        }
 
        // Normal mode: unfreeze if we were frozen
        this._orbitFrozen = false
        
        // Orbit
        this.angle = (this.angle || 0) + this.orbitSpeed * SimulationSettings.timeScale

        const a = this.distance * (1 + (this.eccentricity || 0))
        const b = this.distance * (1 - (this.eccentricity || 0))

        const x = Math.cos(this.angle) * a
        const z = Math.sin(this.angle) * b

        this.orbitPosition.set(x, 0, z)

        this.orbitPosition.applyAxisAngle(
            new THREE.Vector3(0, 0, 1),
            this.tilt
        )

        this.pivot.position.copy(this.orbitPosition)

        // Self rotation
        this.mesh.rotation.y += this.rotationSpeed
    }
}