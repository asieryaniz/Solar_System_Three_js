// src/systems/SolarSystem.js

import { Sun } from '../objects/sun.js'
import { Planet } from '../objects/planet.js'
import { Orbit } from '../objects/orbit.js'
import { InteractionSystem } from './interactionSystem.js'
import { PlanetInfoUI } from '../ui/planetInfo.js'

export class SolarSystem {
    constructor(scene, camera) {
        this.scene = scene
        this.objects = []
        this.ui = new PlanetInfoUI()
        this.init(camera)
    }
  
    init(camera) {

        // Sun
        const sun = new Sun({
            size: 2,
            lightIntensity: 5
        })

        sun.addToScene(this.scene)
        this.objects.push(sun)

        // Earth
        const earthOrbit = new Orbit({ radius: 8 })
        earthOrbit.addToScene(this.scene)

        const earth = new Planet({
            name: 'Earth',
            size: 1,
            color: 0x0000ff,
            distance: 8,
            orbitSpeed: 0.01,
            rotationSpeed: 0.002
        })

        earth.addToScene(this.scene)
        this.objects.push(earth)

        // Mars
        const marsOrbit = new Orbit({ radius: 12 })
        marsOrbit.addToScene(this.scene)

        const mars = new Planet({
            name: 'Mars',
            size: 0.6,
            color: 0xff0000,
            distance: 12,
            orbitSpeed: 0.008,
            rotationSpeed: 0.008
        })

        mars.addToScene(this.scene)
        this.objects.push(mars)

        // Interaction system
        this.interaction = new InteractionSystem(
            camera,
            this.scene,
            this.objects
        )
          
        this.interaction.onSelect = (planet) => {
            this.ui.showPlanet(planet)

            if (this.cameraController) {
                this.cameraController.focusOn(planet)
            }
        }

        this.ui.onExit = () => {
            if (this.cameraController) {
                this.cameraController.resetView()
            }
          
            this.ui.hide()
        }
    }

    // Called by loop
    update() {
        for (const obj of this.objects) {
            if (obj.update) obj.update()
        }
      
        if (this.interaction) {
            this.interaction.update()
        }
    }
}