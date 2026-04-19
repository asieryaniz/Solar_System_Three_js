// src/systems/CameraController.js

import * as THREE from 'three'

export class CameraController {
    constructor(camera, controls) {
        this.camera = camera
        this.controls = controls

        this.initialPosition = camera.position.clone()
        this.initialTarget = controls.target.clone()

        this.targetPosition = new THREE.Vector3()
        this.currentLookAt = new THREE.Vector3()
        this.targetLookAt = new THREE.Vector3()

        this.isMoving = false

        this.followTarget = null
        this.offset = new THREE.Vector3(3, 2, 3)
    }

    focusOn(object) {
        this.followTarget = object
        this.isMoving = false
    }

    clearFocus() {
        this.followTarget = null
    }

    resetView() {
        this.followTarget = null
      
        this.targetPosition.copy(this.initialPosition)
        this.targetLookAt.copy(this.initialTarget)
      
        this.isMoving = true
    }

    update() {

        // Follow target
        if (this.followTarget) {
            const worldPosition = new THREE.Vector3()
            this.followTarget.mesh.getWorldPosition(worldPosition)
        
            const desiredPosition = worldPosition.clone().add(this.offset)
        
            this.camera.position.lerp(desiredPosition, 0.05)
            this.controls.target.lerp(worldPosition, 0.05)
            this.controls.update()
        
            return
        }
      
        // Smoothly move back to initial position when no target
        if (this.isMoving) {
            this.camera.position.lerp(this.targetPosition, 0.05)
            this.controls.target.lerp(this.targetLookAt, 0.05)
            this.controls.update()
        
            const distance = this.camera.position.distanceTo(this.targetPosition)
        
            if (distance < 0.01) {
                this.isMoving = false
            }
        }
      }
}