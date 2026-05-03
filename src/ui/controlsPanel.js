// src/ui/controlsPanel.js

import { SimulationSettings } from '../systems/simulationSettings.js'

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@300;400;500&display=swap');

    .sp-panel {
        position: absolute;
        bottom: 20px;
        left: 20px;
        padding: 20px;
        background: rgba(15, 12, 6, 0.88);
        border: 1px solid rgba(200, 169, 110, 0.2);
        border-radius: 14px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        color: #e8dcc8;
        font-family: 'Exo 2', Arial, sans-serif;
        min-width: 220px;
        max-width: 250px;
        overflow: hidden;
        z-index: 100;
    }

    .sp-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 169, 110, 0.65), transparent);
        pointer-events: none;
    }

    .sp-panel-title {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #c8a96e;
        margin: 0 0 16px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sp-panel-title::before {
        content: '';
        width: 6px; height: 6px;
        border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.6);
        flex-shrink: 0;
    }

    .sp-section-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        color: #c8a96e;
        margin: 0 0 10px;
    }

    .sp-divider {
        height: 1px;
        background: linear-gradient(90deg, rgba(200, 169, 110, 0.18), transparent);
        margin: 14px 0;
    }

    .sp-toggle-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px 0;
        cursor: pointer;
        user-select: none;
    }

    .sp-toggle-row:hover .sp-toggle-label { color: #ffffff; }

    .sp-toggle-track {
        width: 32px; height: 16px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(200, 169, 110, 0.18);
        position: relative;
        transition: all 0.3s;
        flex-shrink: 0;
    }

    .sp-toggle-track.on {
        background: rgba(200, 169, 110, 0.22);
        border-color: #c8a96e;
    }

    .sp-toggle-knob {
        width: 10px; height: 10px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.35);
        position: absolute;
        top: 2px; left: 2px;
        transition: all 0.3s;
    }

    .sp-toggle-track.on .sp-toggle-knob {
        left: 18px;
        background: #c8a96e;
        box-shadow: 0 0 6px rgba(200, 169, 110, 0.7);
    }

    .sp-toggle-label {
        font-size: 12.5px;
        color: #c8bca8;
        transition: color 0.2s;
    }

    .sp-slider-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .sp-slider-header span {
        font-size: 12px;
        color: #c8bca8;
    }

    .sp-slider-value {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 13px;
        color: #c8a96e;
    }

    .sp-range {
        -webkit-appearance: none;
        width: 100%;
        height: 3px;
        border-radius: 2px;
        background: rgba(200, 169, 110, 0.22);
        outline: none;
        cursor: pointer;
        margin-bottom: 14px;
    }

    .sp-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px; height: 14px;
        border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.6);
        cursor: pointer;
        transition: transform 0.15s;
    }

    .sp-range::-webkit-slider-thumb:hover { transform: scale(1.2); }

    .sp-range::-moz-range-thumb {
        width: 14px; height: 14px;
        border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.6);
        border: none;
        cursor: pointer;
    }

    .sp-sat-btn {
        display: block;
        width: 100%;
        margin-bottom: 6px;
        padding: 7px 12px;
        background: transparent;
        border: 1px solid rgba(200, 169, 110, 0.25);
        border-radius: 8px;
        color: #c8bca8;
        font-family: 'Exo 2', Arial, sans-serif;
        font-size: 12px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s;
        letter-spacing: 0.5px;
    }

    .sp-sat-btn:hover {
        background: rgba(200, 169, 110, 0.1);
        border-color: #c8a96e;
        color: #e8dcc8;
    }

    .sp-btn-launch {
        display: block;
        width: 100%;
        padding: 9px 14px;
        background: rgba(200, 169, 110, 0.12);
        border: 1px solid rgba(200, 169, 110, 0.45);
        border-radius: 8px;
        color: #e0c98a;
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
        text-align: center;
    }

    .sp-btn-launch:hover {
        background: rgba(200, 169, 110, 0.2);
        box-shadow: 0 0 16px rgba(200, 169, 110, 0.12);
        color: #f0d9a0;
    }

    .sp-btn-abort {
        display: block;
        width: 100%;
        padding: 9px 14px;
        background: transparent;
        border: 1px solid rgba(200, 100, 80, 0.35);
        border-radius: 8px;
        color: rgba(220, 130, 110, 0.85);
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
    }

    .sp-btn-abort:hover {
        background: rgba(200, 100, 80, 0.12);
        border-color: rgba(200, 100, 80, 0.65);
        color: #e08070;
    }
`

export class ControlsPanel {
    constructor() {
        this.injectStyles()
        this.createPanel()
    }

    injectStyles() {
        if (document.getElementById('sp-controls-styles')) return
        const style = document.createElement('style')
        style.id = 'sp-controls-styles'
        style.textContent = STYLES
        document.head.appendChild(style)
    }

    createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'sp-panel'

        this.panel.innerHTML = `
            <h3 class="sp-panel-title">Controls</h3>

            <div class="sp-section-label">Visibility</div>

            <label class="sp-toggle-row" id="row-moons">
                <div class="sp-toggle-track on" id="track-moons">
                    <div class="sp-toggle-knob"></div>
                </div>
                <span class="sp-toggle-label">Moons</span>
            </label>

            <label class="sp-toggle-row" id="row-satellites">
                <div class="sp-toggle-track on" id="track-satellites">
                    <div class="sp-toggle-knob"></div>
                </div>
                <span class="sp-toggle-label">Artificial Satellites</span>
            </label>

            <label class="sp-toggle-row" id="row-planet-orbits">
                <div class="sp-toggle-track on" id="track-planet-orbits">
                    <div class="sp-toggle-knob"></div>
                </div>
                <span class="sp-toggle-label">Planet Orbits</span>
            </label>

            <label class="sp-toggle-row" id="row-moon-orbits">
                <div class="sp-toggle-track on" id="track-moon-orbits">
                    <div class="sp-toggle-knob"></div>
                </div>
                <span class="sp-toggle-label">Moon Orbits</span>
            </label>

            <div class="sp-divider"></div>

            <div class="sp-section-label">Simulation</div>

            <label class="sp-toggle-row" id="row-pause">
                <div class="sp-toggle-track" id="track-pause">
                    <div class="sp-toggle-knob"></div>
                </div>
                <span class="sp-toggle-label">Pause Simulation</span>
            </label>

            <div style="margin-top:14px;">
                <div class="sp-slider-header">
                    <span>Speed</span>
                    <span class="sp-slider-value" id="time-scale-value">1.0×</span>
                </div>
                <input
                    class="sp-range"
                    type="range"
                    id="time-scale"
                    min="0"
                    max="5"
                    step="0.1"
                    value="1"
                />
            </div>

            <div style="margin-top:14px;">
                <div class="sp-slider-header">
                    <span>Ambient illumination</span>
                    <span class="sp-slider-value" id="ambient-light-value">1.0×</span>
                </div>
                <input
                    class="sp-range"
                    type="range"
                    id="ambient-light"
                    min="0"
                    max="5"
                    step="0.1"
                    value="3"
                />
            </div>

            <div class="sp-divider"></div>

            <div class="sp-section-label">Satellites</div>
            <div id="satellite-list"></div>

            <div class="sp-divider"></div>

            <div class="sp-section-label">Missions</div>

            <button class="sp-btn-launch" id="start-artemis">⬡ &nbsp;Launch Artemis II</button>
            <button class="sp-btn-abort" id="stop-mission">✕ &nbsp;Abort Mission</button>
        `

        document.body.appendChild(this.panel)
        this.bindEvents()
    }

    bindEvents() {
        this._bindToggle('track-planet-orbits', 'row-planet-orbits', true, (v) => {
            SimulationSettings.showPlanetOrbits = v
        })
        this._bindToggle('track-moon-orbits', 'row-moon-orbits', true, (v) => {
            SimulationSettings.showMoonOrbits = v
        })
        this._bindToggle('track-moons', 'row-moons', true, (v) => {
            SimulationSettings.showMoons = v
        })
        this._bindToggle('track-satellites', 'row-satellites', true, (v) => {
            SimulationSettings.showSatellites = v
        })
        this._bindToggle('track-pause', 'row-pause', false, (v) => {
            SimulationSettings.pause = v
        })

        const slider = document.getElementById('time-scale')
        const valueLabel = document.getElementById('time-scale-value')

        slider.oninput = (e) => {
            const value = parseFloat(e.target.value)
            SimulationSettings.timeScale = value
            valueLabel.innerText = value.toFixed(1) + '×'
        }

        const ambientSlider = document.getElementById('ambient-light')
        const ambientLabel = document.getElementById('ambient-light-value')

        ambientSlider.oninput = (e) => {
            const value = parseFloat(e.target.value)
            SimulationSettings.ambientIntensity = value
            ambientLabel.innerText = value.toFixed(1)
        }
    }

    _bindToggle(trackId, rowId, initialState, onChange) {
        const track = document.getElementById(trackId)
        const row = document.getElementById(rowId)
        let state = initialState

        row.addEventListener('click', () => {
            state = !state
            track.classList.toggle('on', state)
            onChange(state)
        })
    }

    setSatellites(satellites, onClick) {
        const container = document.getElementById('satellite-list')
        container.innerHTML = ''

        satellites.forEach(sat => {
            const btn = document.createElement('button')
            btn.className = 'sp-sat-btn'
            btn.innerText = sat.name

            btn.onclick = () => {
                console.log('Clicked satellite:', sat)
                onClick(sat)
            }

            container.appendChild(btn)
        })
    }
}