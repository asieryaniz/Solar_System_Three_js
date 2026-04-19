// src/systems/InteractionSystem.js

import * as THREE from 'three'

export class InteractionSystem {
    constructor(camera, scene, objects) {
        this.camera = camera
        this.scene = scene
        this.objects = objects
        
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        
        this.selectedObject = null
        
        this.init()
    }
    
    init() {
        window.addEventListener('click', (event) => this.onClick(event))
    }
    
    onClick(event) {
        // Normalize mouse coordinates (-1 to +1)
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        // Raycast
        this.raycaster.setFromCamera(this.mouse, this.camera)

        // Collect all meshes
        const meshes = this.objects.map(obj => obj.hitbox || obj.mesh).filter(Boolean)

        const intersects = this.raycaster.intersectObjects(meshes, true)

        if (intersects.length > 0) {
            const selected = intersects[0].object.userData.parent

            if (selected) {
                this.select(selected)
            }
        }
    }

    select(object) {
        this.selectedObject = object
      
        console.log('Selected:', object.name)
      
        // Show UI
        if (this.onSelect) {
            this.onSelect(object)
        }
      }

    update() {
        // future hover effects
    }
}