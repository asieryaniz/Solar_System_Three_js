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
import { SimulationSettings } from './systems/simulationSettings.js'

import { MissionSystem } from './systems/missionSystem.js'
import { ArtemisII } from './missions/artemisII.js'

import { analytics } from './analytics/analytics.js'

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
const ambientLight = new THREE.AmbientLight(0xffffff, SimulationSettings.ambientIntensity)
scene.add(ambientLight)
loop.add({
  update: () => {
      ambientLight.intensity = SimulationSettings.ambientIntensity
  }
})

// Pass satellite data to the controls panel
controlsPanel.setSatellites(
  solarSystem.artificialSatellites,
  (sat) => {
      solarSystem.onSatelliteSelect(sat)
  }
)

// Mission system
const missionSystem = new MissionSystem(scene, camera)
loop.add(missionSystem)

const artemis = new ArtemisII(solarSystem)

document.getElementById('start-artemis').onclick = () => {
  cameraController.isMoving    = false
  cameraController.followTarget = null
  controls.enabled = false
  missionSystem.start(artemis)
  analytics.trackMissionStart('Artemis II')
}

document.getElementById('stop-mission').onclick = () => {
  missionSystem.stop()
  cameraController.resetView()
  analytics.trackMissionStop('Artemis II', 'user_abort')
}

window.addEventListener('artemis:stop', () => {
  missionSystem.stop()
  // Reset OrbitControls target back to solar system origin and restore view
  controls.target.set(0, 0, 0)
  controls.enabled = true
  cameraController.resetView()
  analytics.trackCameraReset()
  
})

// Start the app
loop.start()