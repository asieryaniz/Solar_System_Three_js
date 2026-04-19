// src/ui/PlanetInfoUI.js

export class PlanetInfoUI {
    constructor() {
        this.createPanel()
    }
  
    createPanel() {
        this.panel = document.createElement('div')
        
        this.panel.style.position = 'absolute'
        this.panel.style.top = '20px'
        this.panel.style.right = '20px'
        this.panel.style.padding = '15px'
        this.panel.style.border = '1px solid rgba(255,255,255,0.1)'
        this.panel.style.color = 'white'
        this.panel.style.fontFamily = 'Arial'
        this.panel.style.borderRadius = '10px'
        this.panel.style.display = 'none'
        this.panel.style.minWidth = '220px'
        this.panel.style.maxWidth = '260px'
    
        document.body.appendChild(this.panel)
    }
  
    showPlanet(planet) {
        const info = planet.info || {}
      
        this.panel.style.display = 'block'
      
        this.panel.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:10px;">
            
            <h2 style="margin:0; font-size:22px;">
              ${planet.name}
            </h2>
      
            <div style="height:2px; background:rgba(255,255,255,0.2);"></div>
      
            <p style="margin:0; font-size:14px; opacity:0.8;">
              ${info.description || 'No description available'}
            </p>
      
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:13px;">
              <div><strong>Radius:</strong><br>${info.radius || '-'}</div>
              <div><strong>Moons:</strong><br>${info.moons ?? '-'}</div>
              <div><strong>Day:</strong><br>${info.day || '-'}</div>
              <div><strong>Year:</strong><br>${info.year || '-'}</div>
            </div>
      
            <div style="margin-top:10px; font-size:12px; opacity:0.6;">
              Distance from sun: ${planet.mesh.position.x}
            </div>
      
            <button id="exit-btn" style="
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
      
        document.getElementById('exit-btn').onclick = (e) => {
            e.stopPropagation() // Prevent click from propagating to scene

            if (this.onExit) {
                this.onExit()
            }
        }
    }
  
    hide() {
        this.panel.style.display = 'none'
    }
  }