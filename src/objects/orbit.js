// src/objects/orbit.js

import * as THREE from 'three'

import { SimulationSettings } from '../systems/simulationSettings.js'

export class Orbit {
    constructor({
      radius = 5,
      segments = 128,
      color = 0xffffff,
      tilt = 0,
      eccentricity = 0
    }) {

      this.radius = radius
      this.eccentricity = eccentricity
      this.isMoonOrbit = false

      const points = []

      for (let i = 0; i <= segments; i++) {

        const angle = (i / segments) * Math.PI * 2

        const a = radius * (1 + eccentricity)
        const b = radius * (1 - eccentricity)

        const x = Math.cos(angle) * a
        const z = Math.sin(angle) * b

        points.push(new THREE.Vector3(x, 0, z))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)

      const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.25
      })

      this.line = new THREE.LineLoop(geometry, material)
      this.line.rotation.z = tilt
      this.line.visible = true

    }

    addToObject(object) {
      object.add(this.line)
    }

    addToScene(scene) {
      scene.add(this.line)
    }

    update() {
      if (this.isMoonOrbit) {
          this.line.visible = SimulationSettings.showMoonOrbits
      } else {
          this.line.visible = SimulationSettings.showPlanetOrbits
      }
  }
}