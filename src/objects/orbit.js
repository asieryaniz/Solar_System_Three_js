// src/objects/Orbit.js

import * as THREE from 'three'

export class Orbit {
    constructor({
        radius = 5,
        segments = 100,
        color = 0xffffff
  }) {
    const curve = new THREE.EllipseCurve(
        0, 0,              // center
        radius, radius,    // xRadius, yRadius
        0, 2 * Math.PI     // full circle
    )

    const points = curve.getPoints(segments)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const material = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5
    })

    this.line = new THREE.LineLoop(geometry, material)

    // Rotate to lie flat (XZ plane)
    this.line.rotation.x = Math.PI / 2
  }

  addToScene(scene) {
    scene.add(this.line)
  }
}