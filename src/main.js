// src/main.js

import * as THREE from 'three'

import { createScene } from './core/scene.js'
import { createCamera } from './core/camera.js'
import { createRenderer } from './core/renderer.js'
import { createLoop } from './core/loop.js'

import { createControls } from './controls/controls.js'
import { SolarSystem } from './systems/solarSystem.js'
import { CameraController } from './systems/cameraController.js'
import { ControlsPanel } from './ui/controlsPanel.js'

const scene = createScene()
const camera = createCamera()
const renderer = createRenderer()

const loop = createLoop(renderer, scene, camera)

// Add UI controls panel
const controlsPanel = new ControlsPanel()

// Camera controls
const controls = createControls(camera, renderer)
loop.add({
  update: () => controls.update()
})

// Zoom to the planet
const cameraController = new CameraController(camera, controls)
loop.add(cameraController)

// Solar System
const solarSystem = new SolarSystem(scene, camera)
solarSystem.cameraController = cameraController
loop.add(solarSystem)

// Add ambient light for basic illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 3)
scene.add(ambientLight)

// Start the app
loop.start()