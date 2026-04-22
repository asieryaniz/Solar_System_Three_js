// src/objects/artificialSatellite.js

import * as THREE from 'three'
import { SimulationSettings } from '../systems/simulationSettings.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export class ArtificialSatellite {
    constructor({
        name = 'satellite',
        model,
        size = 0.01,
        distance = 2,
        orbitSpeed = 0.05,
        inclination = 0,
        
    }) {
        this.name = name
        this.distance = distance
        this.orbitSpeed = orbitSpeed
        this.inclination = inclination
        this.size = size
        this.model = model

        this.angle = 0
        this.loaded = false

        // Orbital pivot with inclination
        this.pivot = new THREE.Object3D()
        this.pivot.rotation.z = inclination

        // Container for the satellite model
        this.container = new THREE.Object3D()
        this.pivot.add(this.container)

        // Load the satellite model
        const loader = new GLTFLoader()

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('/draco/') 
        loader.setDRACOLoader(dracoLoader)

        loader.load(this.model, (gltf) => {

            const satellite = gltf.scene

            // Scale the model
            satellite.scale.set(size, size, size)

            this.container.add(satellite)

            this.loaded = true
        })
    }

    addToPlanet(planet) {
        planet.pivot.add(this.pivot)
    }

    update() {

        if (!SimulationSettings.showSatellites) {
            this.pivot.visible = false
            return
        }

        this.pivot.visible = true

        if (SimulationSettings.pause) return

        this.angle += this.orbitSpeed

        const x = Math.cos(this.angle) * this.distance
        const z = Math.sin(this.angle) * this.distance

        this.pivot.position.set(x, 0, z)

    }
}