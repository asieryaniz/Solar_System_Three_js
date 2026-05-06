// src/ui/artemisHUD.js
// Artemis II mission HUD
// Changes from previous version:
//   1. Phase banner moved to bottom (bottom: 80px) instead of centre
//   2. MET shows real Artemis II mission time (10 d 2 h 30 m), days+hours only,
//      advancing proportionally through the simulation phases
//   3. Left panel replaced with real mission data (crew + mission profile)

const HUD_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500&display=swap');

    #artemis-hud {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 200;
        font-family: 'Exo 2', Arial, sans-serif;
    }

    #artemis-hud::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(200, 169, 110, 0.012) 3px,
            rgba(200, 169, 110, 0.012) 4px
        );
        pointer-events: none;
    }

    /* Corner brackets */
    .hud-corner {
        position: absolute;
        width: 36px; height: 36px;
        border-color: rgba(200, 169, 110, 0.45);
        border-style: solid; border-width: 0;
    }
    .hud-corner.tl { top:16px; left:16px;   border-top-width:2px;    border-left-width:2px; }
    .hud-corner.tr { top:16px; right:16px;  border-top-width:2px;    border-right-width:2px; }
    .hud-corner.bl { bottom:16px; left:16px;  border-bottom-width:2px; border-left-width:2px; }
    .hud-corner.br { bottom:16px; right:16px; border-bottom-width:2px; border-right-width:2px; }

    #hud-flash {
        position: absolute; inset: 0;
        background: rgba(200,169,110,0);
        pointer-events: none;
        transition: background 0.1s ease;
    }

    /* Top bar */
    #hud-top {
        position: absolute; top:20px; left:0; right:0;
        display: flex; justify-content: center; align-items: center; gap:16px;
    }
    #hud-mission-id {
        font-family: 'Orbitron', sans-serif;
        font-size: 11px; font-weight: 700; letter-spacing: 5px;
        color: #c8a96e;
        text-shadow: 0 0 10px rgba(200,169,110,0.55);
        animation: hud-breathe 3s ease-in-out infinite;
    }
    .hud-top-sep { width:1px; height:12px; background: rgba(200,169,110,0.3); }
    #hud-timestamp {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px; letter-spacing: 2px; color: #c8bca8;
    }
    #hud-top-line {
        position: absolute; top:44px; left:0; right:0; height:1px;
        background: linear-gradient(90deg, transparent, rgba(200,169,110,0.25), transparent);
    }

    /* MET top right */
    #hud-met {
        position: absolute; top:52px; right:20px; text-align:right;
    }
    #hud-met-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px; letter-spacing: 3px; color: rgba(200,169,110,0.5);
        margin-bottom: 3px; text-transform: uppercase;
    }
    #hud-met-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 17px; font-weight: 700; letter-spacing: 2px;
        color: #c8a96e;
        text-shadow: 0 0 12px rgba(200,169,110,0.45);
    }

    /* Panel izquierdo: vertically centred */
    #hud-left {
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        display: flex; flex-direction: column; gap: 18px;
    }

    /* Crew block */
    #hud-crew-block {}
    .hud-block-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px; letter-spacing: 2.5px; text-transform: uppercase;
        color: rgba(200,169,110,0.55);
        margin-bottom: 7px;
    }
    .hud-crew-row {
        display: flex; align-items: center; gap: 8px;
        margin-bottom: 5px;
    }
    .hud-crew-dot {
        width: 4px; height: 4px; border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 5px rgba(200,169,110,0.6);
        flex-shrink: 0;
    }
    .hud-crew-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 7.5px; letter-spacing: 1.5px; color: #c8bca8;
    }
    .hud-crew-role {
        font-size: 7px; letter-spacing: 1px;
        color: rgba(200,169,110,0.45);
    }

    /* Mission data block */
    #hud-mission-data {}
    .hud-data-row {
        display: flex; align-items: baseline; gap: 8px;
        margin-bottom: 6px;
    }
    .hud-data-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 7.5px; letter-spacing: 1.8px; text-transform: uppercase;
        color: rgba(200,169,110,0.5);
        width: 82px; flex-shrink: 0;
    }
    .hud-data-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 11px; color: #e8dcc8;
        text-shadow: 0 0 6px rgba(200,169,110,0.25);
    }

    /* Phase list (right) */
    #hud-phases {
        position: absolute; right:20px; top:50%; transform:translateY(-50%);
        display: flex; flex-direction: column; gap: 7px; align-items: flex-end;
    }
    .hud-phase-item {
        display: flex; align-items: center; gap: 9px;
        opacity: 0.28; transition: opacity 0.4s ease;
    }
    .hud-phase-item.done   { opacity: 0.5; }
    .hud-phase-item.active { opacity: 1; }
    .hud-phase-dot {
        width:6px; height:6px; border-radius:50%;
        background: rgba(200,169,110,0.25);
        border: 1px solid rgba(200,169,110,0.3);
        flex-shrink: 0;
        transition: background 0.4s, box-shadow 0.4s;
    }
    .hud-phase-item.done .hud-phase-dot {
        background: rgba(200,169,110,0.65); border-color: #c8a96e;
    }
    .hud-phase-item.active .hud-phase-dot {
        background: #c8a96e; border-color: #c8a96e;
        box-shadow: 0 0 8px rgba(200,169,110,0.8);
        animation: hud-pulse 1.3s ease-in-out infinite;
    }
    .hud-phase-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px; letter-spacing: 1.8px; text-transform: uppercase;
        color: #c8bca8; transition: color 0.3s;
    }
    .hud-phase-item.active .hud-phase-name { color: #e8dcc8; }

    /* Phase banner */
    #hud-phase-banner {
        position: absolute;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        pointer-events: none;
        min-width: 400px;
    }
    #hud-phase-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 20px; font-weight: 900; letter-spacing: 7px;
        text-transform: uppercase; color: #f5ede0;
        text-shadow: 0 0 24px rgba(200,169,110,0.7), 0 0 50px rgba(200,169,110,0.2);
        opacity: 0; transform: translateY(6px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    #hud-phase-label.visible { opacity: 1; transform: translateY(0); }
    #hud-phase-sub {
        font-family: 'Exo 2', sans-serif;
        font-size: 10px; letter-spacing: 3px; color: #c8bca8;
        margin-top: 6px; opacity: 0;
        transition: opacity 0.5s ease 0.2s;
    }
    #hud-phase-sub.visible { opacity: 1; }

    /* Phase progress bar */
    #hud-progress-wrap {
        position: absolute; bottom: 62px; left:50%; transform:translateX(-50%);
        width: 240px; text-align: center;
    }
    #hud-progress-track {
        width:100%; height:2px;
        background: rgba(200,169,110,0.15); border-radius:1px; overflow:hidden;
    }
    #hud-progress-fill {
        height:100%;
        background: linear-gradient(90deg, #c8a96e, #e8dcc8);
        box-shadow: 0 0 8px rgba(200,169,110,0.7);
        width:0%; transition: width 0.25s linear; border-radius:1px;
    }

    /* Exit button */
    #hud-exit-btn {
        position: absolute; bottom:20px; right:20px;
        pointer-events: all; cursor: pointer;
        padding: 9px 14px;
        background: transparent;
        border: 1px solid rgba(200,100,80,0.35); border-radius: 8px;
        color: rgba(220,130,110,0.85);
        font-family: 'Orbitron', sans-serif;
        font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
        transition: all 0.2s;
    }
    #hud-exit-btn:hover {
        background: rgba(200,100,80,0.12);
        border-color: rgba(200,100,80,0.65);
        color: #e08070;
    }

    /* Animations */
    @keyframes hud-breathe { 0%,100%{opacity:1} 50%{opacity:0.65} }
    @keyframes hud-pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.45);opacity:0.7} }
`

// Artemis II real crew
const CREW = [
    {name: 'R. WISEMAN', role: 'CDR — NASA' },
    {name: 'V. GLOVER', role: 'PLT — NASA' },
    {name: 'C. KOCH', role: 'MS1 — NASA' },
    {name: 'J. HANSEN', role: 'MS2 — CSA'  },
]

// Real Artemis II mission profile data
const MISSION_DATA = [
    {label: 'Launch', value: '16 Nov 2024'},
    {label: 'Vehicle', value: 'SLS Block 1'},
    {label: 'Capsule', value: 'Orion EM-2'},
    {label: 'Duration', value: '10 d  2 h  30 m'},
    {label: 'Max dist.', value: '8,889 km (Moon)'},
    {label: 'Max speed', value: '39,429 km/h'},
    {label: 'Splashdown', value: 'Pacific Ocean'},
]

const PHASE_NAMES = [
    'LAUNCH', 'PARKING ORBIT', 'TLI', 'COAST',
    'LUNAR FLYBY', 'FREE RETURN', 'RE-ENTRY', 'SPLASHDOWN',
]

// Real mission duration in seconds: 10d 2h 30m = 878,400 s
const REAL_MISSION_DURATION_S = 10 * 86400 + 2 * 3600 + 30 * 60

export class ArtemisHUD {
    constructor(onExit) {
        this._onExit = onExit
        this._lastPhase = null
        this._hideTimer = null

        // Mission time advances proportionally through simulation phases
        this._simStartTime = Date.now() // sim start timestamp
        this._simTotalFrames = 0 // se actualiza en cada update

        this._injectStyles()
        this._buildDOM()
    }

    show() {
        this.root.style.display = 'block'
        this._simStartTime = Date.now()
    }

    hide() {
        clearTimeout(this._hideTimer)
        this.root?.remove()
        this.root = null
    }

    // phaseIndex and totalPhases are used to calculate global progress (0→1)
    update(phase, t, phaseIndex, totalPhases) {

        // MET proportional to real mission duration
        // global progress = (completed phases + current phase t) / total phases
        const globalProgress = (phaseIndex + t) / totalPhases
        const realElapsedS   = Math.round(globalProgress * REAL_MISSION_DURATION_S)

        const dd = Math.floor(realElapsedS / 86400)
        const hh = Math.floor((realElapsedS % 86400) / 3600)

        const metStr = `${String(dd).padStart(2,'0')}d `
                     + `${String(hh).padStart(2,'0')}h`

        this._el('hud-met-value').textContent = metStr

        // Banner de fase
        if (phase.id !== this._lastPhase) {
            this._lastPhase = phase.id

            const flash = this._el('hud-flash')
            flash.style.background = 'rgba(200,169,110,0.07)'
            setTimeout(() => { if (flash) flash.style.background = 'rgba(200,169,110,0)' }, 280)

            const labelEl = this._el('hud-phase-label')
            const subEl = this._el('hud-phase-sub')
            labelEl.classList.remove('visible')
            subEl.classList.remove('visible')
            setTimeout(() => {
                if (!this.root) return
                labelEl.textContent = phase.label
                subEl.textContent = phase.subtitle
                labelEl.classList.add('visible')
                subEl.classList.add('visible')
            }, 120)

            clearTimeout(this._hideTimer)
            this._hideTimer = setTimeout(() => {
                if (!this.root) return
                labelEl.classList.remove('visible')
                subEl.classList.remove('visible')
            }, 3800)

            this._buildPhaseList(phaseIndex)
        }

        // Phase progress bar
        this._el('hud-progress-fill').style.width = (t * 100).toFixed(1) + '%'
    }

    _injectStyles() {
        if (document.getElementById('artemis-hud-styles')) return
        const s = document.createElement('style')
        s.id = 'artemis-hud-styles'
        s.textContent = HUD_STYLES
        document.head.appendChild(s)
    }

    _buildDOM() {
        this.root = document.createElement('div')
        this.root.id = 'artemis-hud'
        this.root.style.display = 'none'

        this.root.innerHTML = `
            <div class="hud-corner tl"></div>
            <div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div>
            <div class="hud-corner br"></div>
            <div id="hud-flash"></div>

            <!-- Top bar: mission title only -->
            <div id="hud-top">
                <div id="hud-mission-id">ARTEMIS&nbsp;II</div>
            </div>
            <div id="hud-top-line"></div>

            <!-- MET top right -->
            <div id="hud-met">
                <div id="hud-met-label">Mission Elapsed Time</div>
                <div id="hud-met-value">00d 00h</div>
            </div>

            <!-- Left panel: crew + mission data -->
            <div id="hud-left">
                <div id="hud-crew-block">
                    <div class="hud-block-title">Crew</div>
                    ${CREW.map(c => `
                        <div class="hud-crew-row">
                            <div class="hud-crew-dot"></div>
                            <div class="hud-crew-name">${c.name}</div>
                            <div class="hud-crew-role">${c.role}</div>
                        </div>
                    `).join('')}
                </div>

                <div id="hud-mission-data">
                    <div class="hud-block-title">Mission Profile</div>
                    ${MISSION_DATA.map(d => `
                        <div class="hud-data-row">
                            <div class="hud-data-label">${d.label}</div>
                            <div class="hud-data-value">${d.value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Phase list (right) -->
            <div id="hud-phases"></div>

            <!-- Phase banner (bottom) -->
            <div id="hud-phase-banner">
                <div id="hud-phase-label"></div>
                <div id="hud-phase-sub"></div>
            </div>

            <!-- Phase progress bar -->
            <div id="hud-progress-wrap">
                <div id="hud-progress-track">
                    <div id="hud-progress-fill"></div>
                </div>
            </div>

            <!-- Exit button -->
            <button id="hud-exit-btn">✕ &nbsp;Abort Mission</button>
        `

        document.body.appendChild(this.root)
        this.root.querySelector('#hud-exit-btn').addEventListener('click', () => {
            if (this._onExit) this._onExit()
        })
        this._buildPhaseList(0)
    }

    _buildPhaseList(activeIndex) {
        const container = this._el('hud-phases')
        if (!container) return
        container.innerHTML = PHASE_NAMES.map((name, i) => {
            const cls = i < activeIndex  ? 'hud-phase-item done'
                      : i === activeIndex ? 'hud-phase-item active'
                      : 'hud-phase-item'
            return `<div class="${cls}">
                        <div class="hud-phase-name">${name}</div>
                        <div class="hud-phase-dot"></div>
                    </div>`
        }).join('')
    }

    _el(id) { return this.root?.querySelector(`#${id}`) }
}