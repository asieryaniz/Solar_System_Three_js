// src/ui/controlsPanel.js

import { SimulationSettings } from '../systems/simulationSettings.js'

export class ControlsPanel {
    constructor() {
        this.createPanel()
    }

    createPanel() {
        this.panel = document.createElement('div')

        this.panel.style.position = 'absolute'
        this.panel.style.bottom = '20px'
        this.panel.style.left = '20px'
        this.panel.style.padding = '15px'
        this.panel.style.background = 'rgba(0,0,0,0.6)'
        this.panel.style.border = '1px solid rgba(255,255,255,0.1)'
        this.panel.style.borderRadius = '10px'
        this.panel.style.color = 'white'
        this.panel.style.fontFamily = 'Arial'
        this.panel.style.minWidth = '200px'

        this.panel.innerHTML = `
            <h3 style="margin-top:0;">Controls</h3>

            <label>
                <input type="checkbox" id="toggle-moons" checked />
                Moons
            </label><br/>

            <label>
                <input type="checkbox" id="toggle-satellites" checked />
                Artificial Satellites
            </label><br/>

            <label>
                <input type="checkbox" id="toggle-planet-orbits" checked />
                Planet Orbits
            </label><br/>

            <label>
                <input type="checkbox" id="toggle-moon-orbits" checked />
                Moon Orbits
            </label><br/>

            <label>
                <input type="checkbox" id="toggle-pause" />
                Pause Simulation
            </label>

            <br/><br/>

            <label>
                Simulation Speed
            </label><br/>

            <input 
                type="range" 
                id="time-scale" 
                min="0" 
                max="5" 
                step="0.1" 
                value="1"
            />

            <span id="time-scale-value">1x</span>
        `

        document.body.appendChild(this.panel)

        this.bindEvents()
    }

    bindEvents() {
        document.getElementById('toggle-planet-orbits').onchange = (e) => {
            SimulationSettings.showPlanetOrbits = e.target.checked
        }

        document.getElementById('toggle-moon-orbits').onchange = (e) => {
            SimulationSettings.showMoonOrbits = e.target.checked
        }

        document.getElementById('toggle-moons').onchange = (e) => {
            SimulationSettings.showMoons = e.target.checked
        }

        document.getElementById('toggle-pause').onchange = (e) => {
            SimulationSettings.pause = e.target.checked
        }

        document.getElementById('toggle-satellites').onchange = (e) => {
            SimulationSettings.showSatellites = e.target.checked
        }

        const slider = document.getElementById('time-scale')
        const valueLabel = document.getElementById('time-scale-value')

        slider.oninput = (e) => {
            const value = parseFloat(e.target.value)
            SimulationSettings.timeScale = value
            valueLabel.innerText = value.toFixed(1) + 'x'
        }
    }
}