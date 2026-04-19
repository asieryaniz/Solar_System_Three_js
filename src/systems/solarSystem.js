// src/systems/SolarSystem.js

import { Sun } from '../objects/sun.js'
import { Planet } from '../objects/planet.js'
import { Orbit } from '../objects/orbit.js'
import { InteractionSystem } from './interactionSystem.js'
import { PlanetInfoUI } from '../ui/planetInfo.js'
import { PLANETS } from '../data/planets.js'

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

        // Planets
        for (const planetData of PLANETS) {
            const planet = new Planet(planetData)
            planet.addToScene(this.scene)
            this.objects.push(planet)

            // Orbit
            const orbit = new Orbit({
                radius: planetData.distance,
                tilt: planetData.tilt || 0,
                eccentricity: planetData.eccentricity || 0
            })
            orbit.addToScene(this.scene)
        }

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
            // Prevent click-through when exiting UI
            if (this.interaction) {
                this.interaction.ignoreNextClick = true
            }

            // Reset camera view
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