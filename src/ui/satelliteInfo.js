// src/ui/satelliteInfo.js

const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Exo+2:wght@300;400;500&display=swap');

    .sp-sat-panel {
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
        min-width: 240px;
        max-width: 280px;
        overflow: hidden;
        z-index: 100;
        animation: sp-sat-fadein 0.25s ease;
    }

    @keyframes sp-sat-fadein {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    .sp-sat-panel::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 169, 110, 0.65), transparent);
        pointer-events: none;
    }

    .sp-sat-eyebrow {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #f5ede0;
        margin: 0 0 10px;
        display: flex;
        align-items: center;
        gap: 7px;
    }

    .sp-sat-eyebrow::before {
        content: '';
        width: 5px; height: 5px;
        border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 7px rgba(200, 169, 110, 0.6);
        flex-shrink: 0;
    }

    .sp-sat-name {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 15px;
        font-weight: 700;
        color: #e8dcc8;
        letter-spacing: 1px;
        margin: 0 0 3px;
        line-height: 1.3;
    }

    .sp-sat-subtitle {
        font-size: 10px;
        color: #c8a96e;
        letter-spacing: 2px;
        text-transform: uppercase;
        margin-bottom: 12px;
    }

    .sp-sat-divider {
        height: 1px;
        background: linear-gradient(90deg, rgba(200, 169, 110, 0.2), transparent);
        margin: 10px 0 14px;
    }

    .sp-sat-img {
        width: 100%;
        border-radius: 8px;
        object-fit: cover;
        max-height: 130px;
        margin-bottom: 12px;
        border: 1px solid rgba(200, 169, 110, 0.18);
        display: block;
    }

    .sp-sat-desc {
        font-size: 12.5px;
        color: #f5ede0;
        line-height: 1.65;
        margin: 0 0 14px;
    }

    .sp-sat-details {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-bottom: 14px;
    }

    .sp-sat-detail-row {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 12px;
        color: #f5ede0;
        padding: 6px 0;
        border-bottom: 1px solid rgba(200, 169, 110, 0.08);
        transition: color 0.15s;
    }

    .sp-sat-detail-row:last-child { border-bottom: none; }

    .sp-sat-detail-row::before {
        content: '';
        width: 4px; height: 4px;
        border-radius: 50%;
        background: #c8a96e;
        opacity: 0.5;
        flex-shrink: 0;
    }

    .sp-sat-btn-exit {
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

    .sp-sat-btn-exit:hover {
        background: rgba(200, 100, 80, 0.1);
        border-color: rgba(200, 100, 80, 0.55);
        color: #c86450;
    }
`

export class SatelliteInfoUI {
    constructor() {
        this.injectStyles()
        this.createPanel()
    }

    injectStyles() {
        if (document.getElementById('sp-sat-info-styles')) return
        const style = document.createElement('style')
        style.id = 'sp-sat-info-styles'
        style.textContent = STYLES
        document.head.appendChild(style)
    }

    createPanel() {
        this.panel = document.createElement('div')
        this.panel.className = 'sp-sat-panel'
        document.body.appendChild(this.panel)
    }

    showSatellite(sat) {
        const info = sat.info || {}

        this.panel.style.display = 'block'

        this.panel.innerHTML = `
            <div class="sp-sat-eyebrow">Satellite</div>

            <h2 class="sp-sat-name">${info.title || sat.name}</h2>
            <div class="sp-sat-subtitle">${info.subtitle || 'Artificial Satellite'}</div>

            <div class="sp-sat-divider"></div>

            ${info.image ? `
                <img
                    src="${info.image}"
                    class="sp-sat-img"
                    alt="${info.title || sat.name}"
                />
            ` : ''}

            <p class="sp-sat-desc">
                ${info.description || 'No description available.'}
            </p>

            ${info.details && info.details.length ? `
                <div class="sp-sat-details">
                    ${info.details.map(d => `
                        <div class="sp-sat-detail-row">${d}</div>
                    `).join('')}
                </div>
            ` : ''}

            <button class="sp-sat-btn-exit" id="exit-sat-btn">✕ &nbsp;Close</button>
        `

        document.getElementById('exit-sat-btn').onclick = (e) => {
            e.stopPropagation()
            if (this.onExit) this.onExit()
        }
    }

    hide() {
        this.panel.style.display = 'none'
    }
}