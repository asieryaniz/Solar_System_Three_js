import * as THREE from 'three'
import { loadTexture } from '../utils/textureLoader.js'
import { SimulationSettings } from '../systems/simulationSettings.js'

export class Satellite {
    constructor({
        name = 'satellite',
        size = 0.2,
        distance = 2,
        orbitSpeed = 0.02,
        rotationSpeed = 0.01,
        texture,
        tilt = 0,
        eccentricity = 0,
        tidalLock = false
    }) {
        
        this.name = name
        this.distance = distance
        this.orbitSpeed = orbitSpeed
        this.rotationSpeed = rotationSpeed

        this.tilt = tilt
        this.eccentricity = eccentricity
        this.tidalLock = tidalLock

        this.orbitPosition = new THREE.Vector3()
        this.tiltAxis = new THREE.Vector3(0, 0, 1)
        this.angle = 0

        const geometry = new THREE.SphereGeometry(size, 32, 32)

        const material = new THREE.MeshStandardMaterial({ map: loadTexture(texture) })

        this.mesh = new THREE.Mesh(geometry, material)

        // Pivot (orbit around planet)
        this.pivot = new THREE.Object3D()
        this.pivot.add(this.mesh)

    }

    addToPlanet(planet) {
        planet.pivot.add(this.pivot)
    }

    update() {
        if (!SimulationSettings.showMoons) {
            this.mesh.visible = false
            return
        }
    
        this.mesh.visible = true
    
        if (SimulationSettings.pause) return
        
        this.angle += this.orbitSpeed * SimulationSettings.timeScale
    
        const a = this.distance * (1 + this.eccentricity)
        const b = this.distance * (1 - this.eccentricity)
    
        const x = Math.cos(this.angle) * a
        const z = Math.sin(this.angle) * b
    
        this.orbitPosition.set(x, 0, z)
    
        // Apply orbital tilt
        this.orbitPosition.applyAxisAngle(this.tiltAxis, this.tilt)
    
        this.mesh.position.copy(this.orbitPosition)

        // Rotate satellite on its own axis
        if (this.tidalLock) {
            this.mesh.lookAt(0, 0, 0) // always face parent planet
        } else {
            this.mesh.rotation.y += this.rotationSpeed
        }
    }
}