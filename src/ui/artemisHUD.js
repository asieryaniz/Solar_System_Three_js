// src/ui/artemisHUD.js

const HUD_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500&display=swap');

    /* Root */
    #artemis-hud {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 200;
        font-family: 'Exo 2', Arial, sans-serif;
    }

    /* Subtle scanlines */
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

    /* Corner brackets (matches panel style) */
    .hud-corner {
        position: absolute;
        width: 36px;
        height: 36px;
        border-color: rgba(200, 169, 110, 0.45);
        border-style: solid;
        border-width: 0;
    }
    .hud-corner.tl { top: 16px; left: 16px; border-top-width: 2px; border-left-width: 2px; }
    .hud-corner.tr { top: 16px; right: 16px; border-top-width: 2px; border-right-width: 2px; }
    .hud-corner.bl { bottom: 16px; left: 16px; border-bottom-width: 2px; border-left-width: 2px; }
    .hud-corner.br { bottom: 16px; right: 16px; border-bottom-width: 2px; border-right-width: 2px; }

    /* Top centre bar */
    #hud-top {
        position: absolute;
        top: 20px;
        left: 0; right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
    }

    #hud-mission-id {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 5px;
        text-transform: uppercase;
        color: #c8a96e;
        text-shadow: 0 0 10px rgba(200, 169, 110, 0.55);
        animation: hud-breathe 3s ease-in-out infinite;
    }

    .hud-top-sep {
        width: 1px; height: 12px;
        background: rgba(200, 169, 110, 0.3);
    }

    #hud-timestamp {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 10px;
        letter-spacing: 2px;
        color: #c8bca8;
    }

    /* MET — top right */
    #hud-met {
        position: absolute;
        top: 52px;
        right: 20px;
        text-align: right;
    }
    #hud-met-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 8px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: rgba(200, 169, 110, 0.5);
        margin-bottom: 3px;
    }
    #hud-met-value {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 19px;
        font-weight: 700;
        letter-spacing: 3px;
        color: #c8a96e;
        text-shadow: 0 0 12px rgba(200, 169, 110, 0.45);
    }

    /* Logo — top left */
    #hud-logo {
        position: absolute;
        top: 52px;
        left: 20px;
    }
    #hud-logo-title {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 3.5px;
        color: #c8a96e;
        text-transform: uppercase;
    }
    #hud-logo-sub {
        font-size: 8px;
        letter-spacing: 2px;
        color: rgba(200, 169, 110, 0.4);
        margin-top: 2px;
    }

    /* Crew — below logo */
    #hud-crew {
        position: absolute;
        top: 100px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .hud-crew-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .hud-crew-dot {
        width: 4px; height: 4px;
        border-radius: 50%;
        background: #c8a96e;
        box-shadow: 0 0 5px rgba(200, 169, 110, 0.6);
        flex-shrink: 0;
    }
    .hud-crew-name {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 7.5px;
        letter-spacing: 1.5px;
        color: #c8bca8;
    }
    .hud-crew-role {
        font-size: 7px;
        letter-spacing: 1px;
        color: rgba(200, 169, 110, 0.45);
    }

    /* Telemetry panel — bottom left */
    #hud-telem {
        position: absolute;
        bottom: 36px;
        left: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .hud-telem-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .hud-telem-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 8px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: rgba(200, 169, 110, 0.55);
        width: 68px;
    }
    .hud-telem-value {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 13px;
        color: #e8dcc8;
        text-shadow: 0 0 6px rgba(200, 169, 110, 0.3);
    }
    .hud-telem-unit {
        font-size: 9px;
        color: rgba(200, 169, 110, 0.45);
        letter-spacing: 1px;
    }

    /* Phase list — right side */
    #hud-phases {
        position: absolute;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 7px;
        align-items: flex-end;
    }
    .hud-phase-item {
        display: flex;
        align-items: center;
        gap: 9px;
        opacity: 0.28;
        transition: opacity 0.4s ease;
    }
    .hud-phase-item.done   { opacity: 0.5; }
    .hud-phase-item.active { opacity: 1; }

    .hud-phase-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(200, 169, 110, 0.25);
        border: 1px solid rgba(200, 169, 110, 0.3);
        flex-shrink: 0;
        transition: background 0.4s, box-shadow 0.4s;
    }
    .hud-phase-item.done .hud-phase-dot {
        background: rgba(200, 169, 110, 0.65);
        border-color: #c8a96e;
    }
    .hud-phase-item.active .hud-phase-dot {
        background: #c8a96e;
        border-color: #c8a96e;
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.8);
        animation: hud-pulse 1.3s ease-in-out infinite;
    }
    .hud-phase-name {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 8px;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        color: #c8bca8;
        transition: color 0.3s;
    }
    .hud-phase-item.active .hud-phase-name { color: #e8dcc8; }

    /* Centre phase banner */
    #hud-phase-banner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
    }
    #hud-phase-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 24px;
        font-weight: 900;
        letter-spacing: 7px;
        text-transform: uppercase;
        color: #f5ede0;
        text-shadow: 0 0 28px rgba(200, 169, 110, 0.7), 0 0 60px rgba(200, 169, 110, 0.25);
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }
    #hud-phase-label.visible {
        opacity: 1;
        transform: translateY(0);
    }
    #hud-phase-sub {
        font-family: 'Exo 2', Arial, sans-serif;
        font-size: 11px;
        letter-spacing: 3px;
        color: #c8bca8;
        margin-top: 8px;
        opacity: 0;
        transition: opacity 0.5s ease 0.2s;
    }
    #hud-phase-sub.visible { opacity: 1; }

    /* Progress bar — below phase banner */
    #hud-progress-wrap {
        position: absolute;
        bottom: 36px;
        left: 50%;
        transform: translateX(-50%);
        width: 260px;
        text-align: center;
    }
    #hud-progress-track {
        width: 100%;
        height: 2px;
        background: rgba(200, 169, 110, 0.15);
        border-radius: 1px;
        overflow: hidden;
    }
    #hud-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #c8a96e, #e8dcc8);
        box-shadow: 0 0 8px rgba(200, 169, 110, 0.7);
        width: 0%;
        transition: width 0.25s linear;
        border-radius: 1px;
    }
    #hud-progress-label {
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 7px;
        letter-spacing: 2px;
        color: rgba(200, 169, 110, 0.45);
        margin-top: 5px;
        text-transform: uppercase;
    }

    /* Exit button — pointer-events ON */
    #hud-exit-btn {
        position: absolute;
        bottom: 36px;
        right: 20px;
        pointer-events: all;
        cursor: pointer;

        padding: 9px 14px;
        background: transparent;
        border: 1px solid rgba(200, 100, 80, 0.35);
        border-radius: 8px;
        color: rgba(220, 130, 110, 0.85);
        font-family: 'Orbitron', Arial, sans-serif;
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        transition: all 0.2s;
    }
    #hud-exit-btn:hover {
        background: rgba(200, 100, 80, 0.12);
        border-color: rgba(200, 100, 80, 0.65);
        color: #e08070;
    }

    /* Top divider line */
    #hud-top-line {
        position: absolute;
        top: 44px;
        left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200, 169, 110, 0.25), transparent);
    }

    /* Animations */
    @keyframes hud-breathe {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.65; }
    }
    @keyframes hud-pulse {
        0%, 100% { transform: scale(1);    opacity: 1; }
        50%       { transform: scale(1.45); opacity: 0.7; }
    }

    /* Phase flash overlay */
    #hud-flash {
        position: absolute;
        inset: 0;
        background: rgba(200, 169, 110, 0);
        pointer-events: none;
        transition: background 0.1s ease;
    }
`

const CREW = [
    { name: 'R. WISEMAN', role: 'CDR'},
    { name: 'V. GLOVER', role: 'PLT'},
    { name: 'C. KOCH', role: 'MS1'},
    { name: 'J. REID', role: 'MS2'},
]

const PHASE_NAMES = [
    'LAUNCH', 'PARKING ORBIT', 'TLI', 'COAST',
    'LUNAR FLYBY', 'FREE RETURN', 'RE-ENTRY', 'SPLASHDOWN',
]

export class ArtemisHUD {
    /**
     * @param {Function} onExit  — callback fired when the user clicks "Abort Mission"
     */
    constructor(onExit) {
        this._onExit = onExit
        this._startTime = Date.now()
        this._lastPhase = null
        this._hideTimer = null

        this._injectStyles()
        this._buildDOM()
    }

    // Lifecycle

    show() {
        this.root.style.display = 'block'
        this._startTime = Date.now()
    }

    hide() {
        clearTimeout(this._hideTimer)
        this.root?.remove()
        this.root = null
    }

    // Per-frame update

    update(phase, t, phaseIndex, totalPhases) {
        // MET
        const elapsed = Math.floor((Date.now() - this._startTime) / 1000)
        const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0')
        const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
        const ss = String(elapsed % 60).padStart(2, '0')
        const met = `${hh}:${mm}:${ss}`

        this._el('hud-met-value').textContent = met
        this._el('hud-timestamp').textContent = `T+${met}`

        // Phase banner - show on transition, auto-hide after 3.8 s
        if (phase.id !== this._lastPhase) {
            this._lastPhase = phase.id

            // Flash
            const flash = this._el('hud-flash')
            flash.style.background = 'rgba(200,169,110,0.07)'
            setTimeout(() => { if (flash) flash.style.background = 'rgba(200,169,110,0)' }, 280)

            // Animate label
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

            // Rebuild phase list
            this._buildPhaseList(phaseIndex)
        }

        // Progress bar
        this._el('hud-progress-fill').style.width = (t * 100).toFixed(1) + '%'

        // Telemetry
        const tel = this._telemetry(phase.id, t)
        this._el('hud-vel').textContent = tel.vel
        this._el('hud-alt').textContent = tel.alt
        this._el('hud-range').textContent = tel.range
    }

    // Private
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
            <!-- Corners -->
            <div class="hud-corner tl"></div>
            <div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div>
            <div class="hud-corner br"></div>

            <!-- Flash overlay -->
            <div id="hud-flash"></div>

            <!-- Top bar -->
            <div id="hud-top">
                <div id="hud-mission-id">ARTEMIS&nbsp;II</div>
                <div class="hud-top-sep"></div>
                <div id="hud-timestamp">T+00:00:00</div>
            </div>
            <div id="hud-top-line"></div>

            <!-- MET -->
            <div id="hud-met">
                <div id="hud-met-label">Mission Elapsed Time</div>
                <div id="hud-met-value">00:00:00</div>
            </div>

            <!-- Logo -->
            <div id="hud-logo">
                <div id="hud-logo-title">NASA · ESA</div>
                <div id="hud-logo-sub">Crewed Lunar Flyby · 2025</div>
            </div>

            <!-- Crew -->
            <div id="hud-crew">
                ${CREW.map(c => `
                    <div class="hud-crew-row">
                        <div class="hud-crew-dot"></div>
                        <div class="hud-crew-name">${c.name}</div>
                        <div class="hud-crew-role">${c.role}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Telemetry -->
            <div id="hud-telem">
                <div class="hud-telem-row">
                    <div class="hud-telem-label">Velocity</div>
                    <div class="hud-telem-value" id="hud-vel">—</div>
                    <div class="hud-telem-unit">km/s</div>
                </div>
                <div class="hud-telem-row">
                    <div class="hud-telem-label">Altitude</div>
                    <div class="hud-telem-value" id="hud-alt">—</div>
                    <div class="hud-telem-unit">km</div>
                </div>
                <div class="hud-telem-row">
                    <div class="hud-telem-label">Range</div>
                    <div class="hud-telem-value" id="hud-range">—</div>
                    <div class="hud-telem-unit">km</div>
                </div>
                <div class="hud-telem-row">
                    <div class="hud-telem-label">DSN</div>
                    <div class="hud-telem-value">LOCK</div>
                    <div class="hud-telem-unit">·&nbsp;3 stations</div>
                </div>
            </div>

            <!-- Phase list -->
            <div id="hud-phases"></div>

            <!-- Centre banner -->
            <div id="hud-phase-banner">
                <div id="hud-phase-label"></div>
                <div id="hud-phase-sub"></div>
            </div>

            <!-- Progress bar -->
            <div id="hud-progress-wrap">
                <div id="hud-progress-track">
                    <div id="hud-progress-fill"></div>
                </div>
                <div id="hud-progress-label">Phase progress</div>
            </div>

            <!-- Exit button (pointer-events enabled) -->
            <button id="hud-exit-btn">✕ &nbsp;Abort Mission</button>
        `

        document.body.appendChild(this.root)

        // Wire exit button
        this.root.querySelector('#hud-exit-btn').addEventListener('click', () => {
            if (this._onExit) this._onExit()
        })

        this._buildPhaseList(0)
    }

    _buildPhaseList(activeIndex) {
        const container = this._el('hud-phases')
        if (!container) return
        container.innerHTML = PHASE_NAMES.map((name, i) => {
            const cls = i < activeIndex ? 'hud-phase-item done'
                      : i === activeIndex ? 'hud-phase-item active'
                      : 'hud-phase-item'
            return `
                <div class="${cls}">
                    <div class="hud-phase-name">${name}</div>
                    <div class="hud-phase-dot"></div>
                </div>
            `
        }).join('')
    }

    _el(id) {
        return this.root?.querySelector(`#${id}`)
    }

    // Simulated telemetry values that evolve plausibly through each phase
    _telemetry(phaseId, t) {
        const li = (a, b) => (a + (b - a) * t).toFixed(1)
        const li2 = (a, b) => Math.round(a + (b - a) * t).toLocaleString()
        switch (phaseId) {
            case 'launch': return { vel: li(0.4, 7.8), alt: li2(0, 185), range: li2(0, 200) }
            case 'parking_orbit': return { vel: '7.8', alt: '185', range: li2(200, 500) }
            case 'tli': return { vel: li(7.8, 10.8), alt: li2(185, 1200), range: li2(500, 8000) }
            case 'coast': return { vel: li(10.4, 0.9), alt: li2(1200, 360000), range: li2(8000, 380000) }
            case 'flyby': return { vel: li(0.9, 2.4), alt: li2(360000, 8900), range: li2(380000, 8900) }
            case 'return': return { vel: li(2.4, 10.8), alt: li2(8900, 50000), range: li2(8900, 350000) }
            case 'reentry': return { vel: li(11.0, 0.15), alt: li2(120, 0), range: li2(350000, 2) }
            case 'splashdown': return { vel: '0.0', alt: '0', range: '0' }
            default: return { vel: '—', alt: '—', range: '—' }
        }
    }
}