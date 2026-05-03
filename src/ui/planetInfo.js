// src/ui/PlanetInfoUI.js

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@300;400;500&display=swap');

    .sp-info-panel {
        position: absolute;
        top: 20px;
        right: 20px;
        padding: 20px;
        background: rgba(15, 12, 6, 0.88);
        border: 1px solid rgba(200, 169, 110, 0.2);
        border-radius: 14px;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        color: #e8dcc8;
        font-family: 'Exo 2', Arial, sans-serif;
        display: none;
        min-width: 230px;
        max-width: 270px;
        overflow: hidden;
        z-index: 100;
        animation: sp-fadein 0.25s ease;
    }

    @keyframes sp-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .sp-info-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 169, 110, 0.65), transparent);
        pointer-events: none;
    }

    .sp-planet-name {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 20px;
        font-weight: 700;
        color: #e8dcc8;
        letter-spacing: 2px;
        margin: 0 0 4px;
    }

    .sp-planet-type {
        font-size: 10px;
        color: #c8a96e;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        margin-bottom: 12px;
    }

    .sp-info-divider {
        height: 1px;
        background: linear-gradient(90deg, rgba(200, 169, 110, 0.22), transparent);
        margin: 10px 0 14px;
    }

    .sp-info-desc {
        font-size: 12.5px;
        color: #6b6050;
        line-height: 1.65;
        margin: 0 0 14px;
    }

    .sp-stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
    }

    .sp-stat-cell {
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(200, 169, 110, 0.13);
        border-radius: 8px;
        padding: 8px 10px;
    }

    .sp-stat-label {
        font-size: 9px;
        color: #5a5040;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        margin-bottom: 3px;
    }

    .sp-stat-value {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 12px;
        color: #e8dcc8;
    }

    .sp-distance-row {
        font-size: 11.5px;
        color: #6b6050;
        padding: 8px 10px;
        background: rgba(200, 169, 110, 0.06);
        border: 1px solid rgba(200, 169, 110, 0.15);
        border-radius: 8px;
        margin-bottom: 14px;
        line-height: 1.5;
    }

    .sp-distance-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        letter-spacing: 1.5px;
        color: #c8a96e;
        display: block;
        margin-bottom: 2px;
        text-transform: uppercase;
    }

    .sp-btn-exit {
        width: 100%;
        padding: 9px;
        background: transparent;
        border: 1px solid rgba(200, 100, 80, 0.28);
        border-radius: 8px;
        color: rgba(200, 100, 80, 0.6);
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.2s;
    }

    .sp-btn-exit:hover {
        background: rgba(200, 100, 80, 0.1);
        border-color: rgba(200, 100, 80, 0.55);
        color: #c86450;
    }
`

export class PlanetInfoUI {
    constructor() {
        this.injectStyles()
        this.createPanel()
    }

    injectStyles() {
        if (document.getElementById('sp-planet-info-styles')) return
        const style = document.createElement('style')
        style.id = 'sp-planet-info-styles'
        style.textContent = STYLES
        document.head.appendChild(style)
    }

    createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'sp-info-panel'
        document.body.appendChild(this.panel)
    }

    showPlanet(planet) {
        const info = planet.info || {}

        this.panel.style.display = 'block'

        this.panel.innerHTML = `
            <h2 class="sp-planet-name">${planet.name}</h2>
            <div class="sp-planet-type">${info.type || 'Planet'}</div>

            <div class="sp-info-divider"></div>

            <p class="sp-info-desc">
                ${info.description || 'No description available.'}
            </p>

            <div class="sp-stats-grid">
                <div class="sp-stat-cell">
                    <div class="sp-stat-label">Radius</div>
                    <div class="sp-stat-value">${info.radius || '—'}</div>
                </div>
                <div class="sp-stat-cell">
                    <div class="sp-stat-label">Moons</div>
                    <div class="sp-stat-value">${info.moons ?? '—'}</div>
                </div>
                <div class="sp-stat-cell">
                    <div class="sp-stat-label">Day</div>
                    <div class="sp-stat-value">${info.day || '—'}</div>
                </div>
                <div class="sp-stat-cell">
                    <div class="sp-stat-label">Year</div>
                    <div class="sp-stat-value">${info.year || '—'}</div>
                </div>
            </div>

            <div class="sp-distance-row">
                <span class="sp-distance-label">Distance from Sun</span>
                ${info.sunDistance || '—'}
            </div>

            <button class="sp-btn-exit" id="exit-btn">✕ &nbsp;Close</button>
        `

        document.getElementById('exit-btn').onclick = (e) => {
            e.stopPropagation()
            if (this.onExit) this.onExit()
        }
    }

    hide() {
        this.panel.style.display = 'none'
    }
}