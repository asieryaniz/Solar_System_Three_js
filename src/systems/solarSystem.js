// src/systems/SolarSystem.js

import { Sun } from '../objects/sun.js'
import { Planet } from '../objects/planet.js'
import { Orbit } from '../objects/orbit.js'
import { InteractionSystem } from './interactionSystem.js'
import { PlanetInfoUI } from '../ui/planetInfo.js'
import { PLANETS } from '../data/planets.js'
import { Satellite } from '../objects/satellite.js'
import { SATELLITES } from '../data/satellites.js'
import { ArtificialSatellite } from '../objects/artificialSatellite.js'
import { ARTIFICIAL_SATELLITES } from '../data/artificialSatellites.js'

export class SolarSystem {
    constructor(scene, camera) {
        this.scene = scene
        this.objects = []
        this.ui = new PlanetInfoUI()
        this.init(camera)
    }
  
    init(camera) {

        this.orbits = []

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

            // Add Moons (natural satellites)
            const satellites = SATELLITES[planet.name]

            if (satellites) {
                for (const satData of satellites) {
                    const satellite = new Satellite(satData)

                    satellite.addToPlanet(planet)
                    this.objects.push(satellite)
                    
                    // Moon orbit
                    const orbit = new Orbit({
                        radius: satData.distance,
                        tilt: satData.tilt || 0,
                        eccentricity: satData.eccentricity || 0,
                        color: 0xaaaaaa
                    })
                    orbit.isMoonOrbit = true 
                    
                    orbit.addToObject(planet.pivot)
                    this.orbits.push(orbit)
                }
            }

            // Add Artificial Satellites
            const artificials = ARTIFICIAL_SATELLITES[planet.name]

            if (artificials) {
                for (const satData of artificials) {
                    const sat = new ArtificialSatellite(satData)

                    sat.addToPlanet(planet)
                    this.objects.push(sat)
                }
            }

            // Planet orbit
            const orbit = new Orbit({
                radius: planetData.distance,
                tilt: planetData.tilt || 0,
                eccentricity: planetData.eccentricity || 0
            })
            orbit.isMoonOrbit = false

            orbit.addToScene(this.scene)
            this.orbits.push(orbit)
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
        // Update all objects in the solar system
        for (const obj of this.objects) {
            if (obj.update) obj.update()
        }

        // Update orbits separately to ensure they are drawn correctly
        for (const orbit of this.orbits) {
            if (orbit.update) orbit.update()
        }
      
        // Update interaction system
        if (this.interaction) {
            this.interaction.update()
        }
    }
}