// src/ui/satelliteInfo.js

export class SatelliteInfoUI {
    constructor() {
        this.createPanel()
    }

    createPanel() {
        this.panel = document.createElement('div')

        this.panel.style.position = 'absolute'
        this.panel.style.top = '20px'
        this.panel.style.right = '20px'
        this.panel.style.padding = '15px'
        this.panel.style.background = 'rgba(0,0,0,0.6)'
        this.panel.style.border = '1px solid rgba(255,255,255,0.1)'
        this.panel.style.color = 'white'
        this.panel.style.fontFamily = 'Arial'
        this.panel.style.borderRadius = '10px'
        this.panel.style.display = 'none'
        this.panel.style.minWidth = '240px'
        this.panel.style.maxWidth = '280px'

        document.body.appendChild(this.panel)
    }

    showSatellite(sat) {
        const info = sat.info || {}

        this.panel.style.display = 'block'

        this.panel.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px;">
                
                <h2 style="margin:0; font-size:20px;">
                    ${info.title || sat.name}
                </h2>

                <div style="height:2px; background:rgba(255,255,255,0.2);"></div>

                ${info.image ? `
                    <img 
                        src="${info.image}" 
                        style="
                            width:100%;
                            border-radius:8px;
                            object-fit:cover;
                            max-height:140px;
                        "
                    />
                ` : ''}

                <p style="margin:0; font-size:14px; opacity:0.85;">
                    ${info.description || 'No description available'}
                </p>

                <div style="font-size:13px; display:flex; flex-direction:column; gap:5px;">
                    ${
                        info.details
                        ? info.details.map(d => `<div>• ${d}</div>`).join('')
                        : '<div>No additional data</div>'
                    }
                </div>

                <button id="exit-sat-btn" style="
                    margin-top:10px;
                    padding:8px;
                    border:none;
                    border-radius:6px;
                    background:#ff4d4d;
                    color:white;
                    cursor:pointer;
                ">
                    Exit
                </button>

            </div>
        `

        document.getElementById('exit-sat-btn').onclick = (e) => {
            e.stopPropagation()

            if (this.onExit) {
                this.onExit()
            }
        }
    }

    hide() {
        this.panel.style.display = 'none'
    }
}