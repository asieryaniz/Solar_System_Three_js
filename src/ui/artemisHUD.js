// src/ui/artemisHUD.js
// Cinematic heads-up display for the Artemis II mission simulation

const HUD_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Exo+2:wght@300;400;500&display=swap');

    /* ── Reset & Root ──────────────────────────────── */
    #artemis-hud * { box-sizing: border-box; margin: 0; padding: 0; }

    #artemis-hud {
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 200;
        font-family: 'Exo 2', sans-serif;
    }

    /* ── Scanline overlay ──────────────────────────── */
    #artemis-hud::before {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,255,200,0.012) 3px,
            rgba(0,255,200,0.012) 4px
        );
        pointer-events: none;
    }

    /* ── Corner brackets ───────────────────────────── */
    .hud-corner {
        position: absolute;
        width: 38px;
        height: 38px;
        border-color: rgba(78, 205, 196, 0.55);
        border-style: solid;
        border-width: 0;
    }
    .hud-corner.tl { top: 18px; left: 18px; border-top-width: 2px; border-left-width: 2px; }
    .hud-corner.tr { top: 18px; right: 18px; border-top-width: 2px; border-right-width: 2px; }
    .hud-corner.bl { bottom: 18px; left: 18px; border-bottom-width: 2px; border-left-width: 2px; }
    .hud-corner.br { bottom: 18px; right: 18px; border-bottom-width: 2px; border-right-width: 2px; }

    /* ── Top bar ───────────────────────────────────── */
    #hud-top {
        position: absolute;
        top: 22px;
        left: 0; right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 18px;
    }

    #hud-mission-id {
        font-family: 'Orbitron', sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 5px;
        color: #4ecdc4;
        text-shadow: 0 0 12px rgba(78, 205, 196, 0.7);
        animation: hud-blink-soft 3s ease-in-out infinite;
    }

    .hud-separator {
        width: 1px; height: 14px;
        background: rgba(78, 205, 196, 0.35);
    }

    #hud-timestamp {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        letter-spacing: 2px;
        color: rgba(200, 230, 228, 0.6);
    }

    /* ── Phase banner (centre) ─────────────────────── */
    #hud-phase-wrap {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        pointer-events: none;
        transition: opacity 0.6s ease;
    }

    #hud-phase-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 26px;
        font-weight: 900;
        letter-spacing: 8px;
        color: #ffffff;
        text-shadow: 0 0 30px rgba(78, 205, 196, 0.8), 0 0 60px rgba(78, 205, 196, 0.3);
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    #hud-phase-label.visible {
        opacity: 1;
        transform: translateY(0);
    }

    #hud-phase-sub {
        font-size: 13px;
        letter-spacing: 3px;
        color: rgba(200, 230, 228, 0.75);
        margin-top: 8px;
        opacity: 0;
        transition: opacity 0.5s ease 0.2s;
    }

    #hud-phase-sub.visible { opacity: 1; }

    /* ── Phase progress bar ────────────────────────── */
    #hud-progress-bar {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 280px;
        height: 2px;
        background: rgba(78, 205, 196, 0.15);
        margin-top: 18px;
        border-radius: 1px;
        overflow: hidden;
    }

    #hud-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4ecdc4, #a8dadc);
        box-shadow: 0 0 8px rgba(78, 205, 196, 0.8);
        width: 0%;
        transition: width 0.3s linear;
        border-radius: 1px;
    }

    /* ── Left panel ────────────────────────────────── */
    #hud-left {
        position: absolute;
        left: 28px;
        bottom: 38px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .hud-data-row {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .hud-data-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px;
        letter-spacing: 2px;
        color: rgba(78, 205, 196, 0.6);
        text-transform: uppercase;
        width: 72px;
    }

    .hud-data-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 13px;
        color: #e8f7f6;
        text-shadow: 0 0 8px rgba(78, 205, 196, 0.4);
    }

    .hud-data-unit {
        font-size: 9px;
        color: rgba(78, 205, 196, 0.5);
        letter-spacing: 1px;
    }

    /* ── Right panel — phase list ──────────────────── */
    #hud-right {
        position: absolute;
        right: 28px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 6px;
        align-items: flex-end;
    }

    .hud-phase-item {
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0.3;
        transition: opacity 0.4s ease;
    }

    .hud-phase-item.done { opacity: 0.55; }

    .hud-phase-item.active {
        opacity: 1;
    }

    .hud-phase-dot {
        width: 6px; height: 6px;
        border-radius: 50%;
        background: rgba(78, 205, 196, 0.3);
        flex-shrink: 0;
        transition: background 0.4s, box-shadow 0.4s;
    }

    .hud-phase-item.done .hud-phase-dot {
        background: rgba(78, 205, 196, 0.7);
    }

    .hud-phase-item.active .hud-phase-dot {
        background: #4ecdc4;
        box-shadow: 0 0 8px rgba(78, 205, 196, 0.9);
        animation: hud-pulse 1.2s ease-in-out infinite;
    }

    .hud-phase-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px;
        letter-spacing: 1.8px;
        color: rgba(200, 230, 228, 0.7);
        text-transform: uppercase;
        transition: color 0.4s;
    }

    .hud-phase-item.active .hud-phase-name { color: #ffffff; }

    /* ── Mission Elapsed Time ──────────────────────── */
    #hud-met {
        position: absolute;
        top: 55px;
        right: 28px;
        text-align: right;
    }

    #hud-met-label {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px;
        letter-spacing: 3px;
        color: rgba(78, 205, 196, 0.55);
        margin-bottom: 3px;
    }

    #hud-met-value {
        font-family: 'Orbitron', sans-serif;
        font-size: 18px;
        font-weight: 700;
        color: #4ecdc4;
        letter-spacing: 3px;
        text-shadow: 0 0 14px rgba(78, 205, 196, 0.5);
    }

    /* ── Logo area top-left ────────────────────────── */
    #hud-logo {
        position: absolute;
        top: 55px;
        left: 28px;
    }

    #hud-logo-text {
        font-family: 'Orbitron', sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 4px;
        color: rgba(200, 169, 110, 0.75);
        text-transform: uppercase;
    }

    #hud-logo-sub {
        font-size: 8px;
        letter-spacing: 2px;
        color: rgba(200, 169, 110, 0.4);
        margin-top: 2px;
    }

    /* ── Crew status ───────────────────────────────── */
    #hud-crew {
        position: absolute;
        top: 100px;
        left: 28px;
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    .hud-crew-member {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 9px;
    }

    .hud-crew-dot {
        width: 5px; height: 5px;
        border-radius: 50%;
        background: #4ecdc4;
        box-shadow: 0 0 5px rgba(78, 205, 196, 0.6);
        flex-shrink: 0;
    }

    .hud-crew-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 8px;
        letter-spacing: 1.5px;
        color: rgba(200, 230, 228, 0.65);
    }

    .hud-crew-role {
        font-size: 7.5px;
        color: rgba(78, 205, 196, 0.45);
        letter-spacing: 1px;
    }

    /* ── Animations ────────────────────────────────── */
    @keyframes hud-blink-soft {
        0%, 100% { opacity: 1; }
        50%       { opacity: 0.65; }
    }

    @keyframes hud-pulse {
        0%, 100% { transform: scale(1);   opacity: 1; }
        50%       { transform: scale(1.4); opacity: 0.7; }
    }

    /* ── Phase flash overlay ───────────────────────── */
    #hud-flash {
        position: absolute;
        inset: 0;
        background: rgba(78, 205, 196, 0);
        pointer-events: none;
        transition: background 0.08s ease;
    }
`

const CREW = [
    { name: 'R. WISEMAN',  role: 'CDR' },
    { name: 'V. GLOVER',   role: 'PLT' },
    { name: 'C. KOCH',     role: 'MS1' },
    { name: 'J. REID',     role: 'MS2' }
]

export class ArtemisHUD {
    constructor() {
        this._startTime = Date.now()
        this._frame     = 0
        this._phaseEl   = null
        this._subEl     = null
        this._lastPhase = null

        this._injectStyles()
        this._buildDOM()
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
            <!-- corners -->
            <div class="hud-corner tl"></div>
            <div class="hud-corner tr"></div>
            <div class="hud-corner bl"></div>
            <div class="hud-corner br"></div>

            <!-- flash overlay -->
            <div id="hud-flash"></div>

            <!-- top bar -->
            <div id="hud-top">
                <div id="hud-mission-id">ARTEMIS&nbsp;II</div>
                <div class="hud-separator"></div>
                <div id="hud-timestamp">T+00:00:00</div>
            </div>

            <!-- MET -->
            <div id="hud-met">
                <div id="hud-met-label">MET</div>
                <div id="hud-met-value">00:00:00</div>
            </div>

            <!-- Logo -->
            <div id="hud-logo">
                <div id="hud-logo-text">NASA&nbsp;·&nbsp;ESA</div>
                <div id="hud-logo-sub">Crewed Lunar Flyby</div>
            </div>

            <!-- Crew -->
            <div id="hud-crew">
                ${CREW.map(c => `
                    <div class="hud-crew-member">
                        <div class="hud-crew-dot"></div>
                        <div class="hud-crew-name">${c.name}</div>
                        <div class="hud-crew-role">${c.role}</div>
                    </div>
                `).join('')}
            </div>

            <!-- Telemetry left -->
            <div id="hud-left">
                <div class="hud-data-row">
                    <div class="hud-data-label">Velocity</div>
                    <div class="hud-data-value" id="hud-vel">—</div>
                    <div class="hud-data-unit">km/s</div>
                </div>
                <div class="hud-data-row">
                    <div class="hud-data-label">Altitude</div>
                    <div class="hud-data-value" id="hud-alt">—</div>
                    <div class="hud-data-unit">km</div>
                </div>
                <div class="hud-data-row">
                    <div class="hud-data-label">Range</div>
                    <div class="hud-data-value" id="hud-range">—</div>
                    <div class="hud-data-unit">km</div>
                </div>
                <div class="hud-data-row">
                    <div class="hud-data-label">Signal</div>
                    <div class="hud-data-value" id="hud-signal">DSN</div>
                    <div class="hud-data-unit">·&nbsp;LOCK</div>
                </div>
            </div>

            <!-- Right phase list -->
            <div id="hud-right"></div>

            <!-- Centre phase banner -->
            <div id="hud-phase-wrap">
                <div id="hud-phase-label"></div>
                <div id="hud-phase-sub"></div>
                <div id="hud-progress-bar">
                    <div id="hud-progress-fill"></div>
                </div>
            </div>
        `

        document.body.appendChild(this.root)

        this._phaseEl    = this.root.querySelector('#hud-phase-label')
        this._subEl      = this.root.querySelector('#hud-phase-sub')
        this._progressEl = this.root.querySelector('#hud-progress-fill')
        this._metEl      = this.root.querySelector('#hud-met-value')
        this._tsEl       = this.root.querySelector('#hud-timestamp')
        this._velEl      = this.root.querySelector('#hud-vel')
        this._altEl      = this.root.querySelector('#hud-alt')
        this._rangeEl    = this.root.querySelector('#hud-range')
        this._rightEl    = this.root.querySelector('#hud-right')
        this._flashEl    = this.root.querySelector('#hud-flash')
    }

    show() {
        this.root.style.display = 'block'
        this._startTime = Date.now()
    }

    hide() {
        this.root?.remove()
    }

    update(phase, t, phaseIndex, totalPhases) {
        this._frame++

        // ── MET ──────────────────────────────────────────────────────────────
        const elapsed = Math.floor((Date.now() - this._startTime) / 1000)
        const hh = String(Math.floor(elapsed / 3600)).padStart(2, '0')
        const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0')
        const ss = String(elapsed % 60).padStart(2, '0')
        const metStr = `${hh}:${mm}:${ss}`
        if (this._metEl) this._metEl.textContent = metStr
        if (this._tsEl)  this._tsEl.textContent  = `T+${metStr}`

        // ── Phase banner ─────────────────────────────────────────────────────
        if (phase.id !== this._lastPhase) {
            this._lastPhase = phase.id

            // Flash
            if (this._flashEl) {
                this._flashEl.style.background = 'rgba(78,205,196,0.08)'
                setTimeout(() => { if (this._flashEl) this._flashEl.style.background = 'rgba(78,205,196,0)' }, 300)
            }

            // Animate phase label
            if (this._phaseEl) {
                this._phaseEl.classList.remove('visible')
                this._subEl.classList.remove('visible')
                setTimeout(() => {
                    if (!this._phaseEl) return
                    this._phaseEl.textContent = phase.label
                    this._subEl.textContent   = phase.subtitle
                    this._phaseEl.classList.add('visible')
                    this._subEl.classList.add('visible')
                }, 120)

                // Auto-hide label after 3.5 s
                clearTimeout(this._hideTimer)
                this._hideTimer = setTimeout(() => {
                    if (!this._phaseEl) return
                    this._phaseEl.classList.remove('visible')
                    this._subEl.classList.remove('visible')
                }, 3800)
            }

            // Rebuild right panel
            this._buildPhaseList(phaseIndex, totalPhases)
        }

        // Progress bar
        if (this._progressEl) this._progressEl.style.width = (t * 100).toFixed(1) + '%'

        // ── Simulated telemetry ───────────────────────────────────────────────
        const telemetry = this._getTelemetry(phase.id, t)
        if (this._velEl)   this._velEl.textContent   = telemetry.vel
        if (this._altEl)   this._altEl.textContent   = telemetry.alt
        if (this._rangeEl) this._rangeEl.textContent = telemetry.range
    }

    _buildPhaseList(activeIndex, total) {
        if (!this._rightEl) return
        // Only show phases (max 8 entries)
        const PHASES = [
            'LAUNCH', 'PARKING ORBIT', 'TLI', 'COAST',
            'LUNAR FLYBY', 'FREE RETURN', 'RE-ENTRY', 'SPLASHDOWN'
        ]
        this._rightEl.innerHTML = PHASES.map((name, i) => {
            const cls = i < activeIndex ? 'done' : i === activeIndex ? 'active' : ''
            return `
                <div class="hud-phase-item ${cls}">
                    <div class="hud-phase-name">${name}</div>
                    <div class="hud-phase-dot"></div>
                </div>
            `
        }).join('')
    }

    _getTelemetry(phaseId, t) {
        // Plausible numbers that animate through the mission
        const lerp = (a, b, tt) => (a + (b - a) * tt).toFixed(1)
        const lerpInt = (a, b, tt) => Math.round(a + (b - a) * tt).toLocaleString()

        switch (phaseId) {
            case 'launch':
                return { vel: lerp(0.4, 7.8, t),      alt: lerpInt(0, 185, t),           range: lerpInt(0, 200, t) }
            case 'parking_orbit':
                return { vel: '7.8',                   alt: '185',                         range: lerpInt(200, 500, t) }
            case 'tli':
                return { vel: lerp(7.8, 10.8, t),      alt: lerpInt(185, 1200, t),         range: lerpInt(500, 8000, t) }
            case 'coast':
                return { vel: lerp(10.4, 1.0, t),      alt: lerpInt(1200, 360000, t),      range: lerpInt(8000, 380000, t) }
            case 'flyby':
                return { vel: lerp(1.0, 2.4, t),       alt: lerpInt(360000, 8900, t),      range: lerpInt(380000, 8900, t) }
            case 'return':
                return { vel: lerp(2.4, 10.8, t),      alt: lerpInt(8900, 50000, t),       range: lerpInt(8900, 350000, t) }
            case 'reentry':
                return { vel: lerp(11.0, 0.15, t),     alt: lerpInt(120, 0, t),            range: lerpInt(350000, 2, t) }
            case 'splashdown':
                return { vel: '0.0',                   alt: '0',                           range: '0' }
            default:
                return { vel: '—', alt: '—', range: '—' }
        }
    }
}