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
        this.panel.style.background = 'rgba(0,0,0,0.7)'
        this.panel.style.color = 'white'
        this.panel.style.fontFamily = 'Arial'
        this.panel.style.borderRadius = '10px'
        this.panel.style.display = 'none'
        this.panel.style.minWidth = '150px'
    
        document.body.appendChild(this.panel)
    }
  
    showPlanet(planet) {
        this.panel.style.display = 'block'
    
        this.panel.innerHTML = `
            <h3>${planet.name}</h3>
            <p>Distance: ${planet.mesh.position.x}</p>
            <button id="exit-btn">Exit</button>
        `

        document.getElementById('exit-btn').onclick = () => {
            if (this.onExit) {
                this.onExit()
            }
          }
    }
  
    hide() {
        this.panel.style.display = 'none'
    }
  }