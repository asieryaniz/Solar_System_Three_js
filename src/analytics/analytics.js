// src/analytics/analytics.js

export class Analytics {

    constructor() {
        this._sessionId  = this._generateId()
        this._sessionStart = Date.now()
        this._events = []

        // Slider debounce timers — avoid flooding CSV with every tick
        this._sliderTimers = {}

        // Record the session start event immediately
        this._record('session', 'start', { sessionId: this._sessionId })

        // Record session end on page unload
        window.addEventListener('beforeunload', () => {
            this._record('session', 'end', {
                sessionId:   this._sessionId,
                durationSec: Math.round((Date.now() - this._sessionStart) / 1000)
            })
            // Persist to localStorage so nothing is lost even if the download
            // dialog doesn't fire in time
            this._persistToLocalStorage()
        })
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /** User clicked on a planet */
    trackPlanetClick(planetName) {
        this._record('planet', 'click', { target: planetName })
    }

    /** User clicked on an artificial satellite button or its 3-D model */
    trackSatelliteClick(satelliteName) {
        this._record('satellite', 'click', { target: satelliteName })
    }

    /** A visibility toggle was changed */
    trackToggle(toggleId, value) {
        this._record('ui_toggle', 'change', { toggle: toggleId, value: value ? 'on' : 'off' })
    }

    /**
     * A slider value changed.
     * Debounced by 600 ms so rapid dragging produces one event per gesture.
     */
    trackSlider(sliderId, value) {
        clearTimeout(this._sliderTimers[sliderId])
        this._sliderTimers[sliderId] = setTimeout(() => {
            this._record('ui_slider', 'change', { slider: sliderId, value: String(value) })
        }, 600)
    }

    /** Mission started */
    trackMissionStart(missionName) {
        this._record('mission', 'start', { mission: missionName })
    }

    /** Mission stopped (user abort or natural end) */
    trackMissionStop(missionName, reason = 'user_abort') {
        this._record('mission', 'stop', { mission: missionName, reason })
    }

    /** Camera was reset to default view */
    trackCameraReset() {
        this._record('navigation', 'camera_reset', {})
    }

    // ── CSV export ────────────────────────────────────────────────────────────

    /**
     * Builds and triggers a CSV download with all recorded events.
     * Columns: timestamp_iso, session_id, elapsed_sec, category, action, key1, value1, key2, value2
     */
    downloadCSV() {
        const header = [
            'timestamp_iso',
            'session_id',
            'elapsed_sec',
            'category',
            'action',
            'detail_key_1',
            'detail_value_1',
            'detail_key_2',
            'detail_value_2'
        ]

        const rows = this._events.map(ev => {
            const keys   = Object.keys(ev.details)
            const vals   = Object.values(ev.details)
            return [
                ev.timestampISO,
                ev.sessionId,
                ev.elapsedSec,
                ev.category,
                ev.action,
                keys[0]  || '',
                vals[0]  || '',
                keys[1]  || '',
                vals[1]  || ''
            ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
        })

        const csv  = [header.join(','), ...rows].join('\r\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url  = URL.createObjectURL(blob)
        const date = new Date().toISOString().slice(0, 10)

        const a      = document.createElement('a')
        a.href       = url
        a.download   = `solar_system_analytics_${date}.csv`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    /** Returns a snapshot of all events (read-only copy) */
    getEvents() {
        return [...this._events]
    }

    /** Total number of events recorded */
    get eventCount() {
        return this._events.length
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _record(category, action, details = {}) {
        const now = Date.now()
        this._events.push({
            timestampISO: new Date(now).toISOString(),
            sessionId:    this._sessionId,
            elapsedSec:   Math.round((now - this._sessionStart) / 1000),
            category,
            action,
            details
        })
    }

    _generateId() {
        return 'sess_' + Math.random().toString(36).slice(2, 10).toUpperCase()
    }

    _persistToLocalStorage() {
        try {
            const key  = `solar_analytics_${this._sessionId}`
            localStorage.setItem(key, JSON.stringify(this._events))
        } catch {
            // localStorage may be unavailable — silently ignore
        }
    }
}

// Singleton — import and use anywhere in the app
export const analytics = new Analytics()