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
        eccentricity = 0,
        type = 'orbit'
    }) {
        this.name = name
        this.distance = distance
        this.orbitSpeed = orbitSpeed
        this.inclination = inclination
        this.eccentricity = eccentricity
        this.size = size
        this.model = model
        this.angle = 0
        this.loaded = false
        this.type = type || 'orbit'
        this.direction = new THREE.Vector3(1, 0.1, 0.2)
        this.parentPlanet = null
        this.escapeDistance = distance
        this.escapeAngle = Math.random() * Math.PI * 2
        this.escapeSpeed = 0.002
        this.escapeCurve = 0.0005
        this.info = arguments[0].info || {}

        // Orbital pivot with inclination
        this.pivot = new THREE.Object3D()
        this.pivot.rotation.z = inclination

        // Container for the satellite model
        this.container = new THREE.Object3D()
        this.pivot.add(this.container)
        this.container.userData.parent = this

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
        this.parentPlanet = planet
        planet.pivot.add(this.pivot)
    }

    update() {

        if (!SimulationSettings.showSatellites) {
            this.pivot.visible = false
            return
        }

        // Hide in mission mode
        if (SimulationSettings.missionMode) {
            this.pivot && (this.pivot.visible = false)
            this.line && (this.line.visible = false)
            return
        }

        this.pivot.visible = true

        if (SimulationSettings.pause) return

        this.angle += this.orbitSpeed * SimulationSettings.timeScale

        // Scape orbit (Voyager)
        if (this.type === 'escape') {

            this.escapeDistance += this.escapeSpeed * SimulationSettings.timeScale
            this.escapeAngle += this.escapeCurve * SimulationSettings.timeScale

            const dir = new THREE.Vector3(1, 0, 0)
            
            const drift = new THREE.Vector3(
                Math.cos(this.escapeAngle) * 0.3,
                0,
                Math.sin(this.escapeAngle) * 0.3
            )
        
            const finalPos = dir
                .clone()
                .multiplyScalar(this.escapeDistance)
                .add(drift)
        
            this.pivot.position.copy(finalPos)
        
            return
        }

        // Solar orbit (Parker)
        if (this.type === 'solarOrbit') {

            const a = this.distance * (1 + this.eccentricity)
            const b = this.distance * (1 - this.eccentricity)

            const x = Math.cos(this.angle) * a
            const z = Math.sin(this.angle) * b

            this.pivot.position.set(x, 0, z)
            return
        }

        // Lagrange (James Webb)
        if (this.type === 'lagrange') {

            const earthPos = this.parentPlanet.pivot.position

            const offset = new THREE.Vector3(
                Math.cos(this.angle) * this.distance,
                0,
                Math.sin(this.angle) * this.distance
            )

            this.pivot.position.copy(earthPos).add(offset)
            return
        }

        // Normal orbit
        if (this.type === 'orbit') {
            
            const x = Math.cos(this.angle) * this.distance
            const z = Math.sin(this.angle) * this.distance

            this.pivot.position.set(x, 0, z)
        }

    }
}