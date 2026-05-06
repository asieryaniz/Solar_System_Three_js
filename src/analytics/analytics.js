// src/analytics/analytics.js
//
// Every session is stored as one record in localStorage under the key "solar_db_sessions".  The record contains:
//
//   sessionId        – unique identifier  (sess_XXXXXXXX)
//   role             – user role from sessionStorage ('student' | 'researcher'
//                      | 'enthusiast' | 'admin' | 'unknown')
//   startISO         – ISO timestamp of session start
//   endISO           – ISO timestamp of session end (filled on beforeunload)
//   durationSec      – total session length in seconds
//   userAgent        – browser user-agent string
//   language         – navigator.language
//   screenW/H        – screen resolution
//   events           – array of individual interaction events (see _record)
//   summary          – aggregated counters (filled on session end)
//

const DB_KEY = 'solar_db_sessions' // localStorage key that holds ALL sessions
const MAX_SESSIONS = 500 // cap to avoid hitting storage limits

export class Analytics {

    constructor() {
        this._sessionId = this._generateId()
        this._sessionStart = Date.now()
        this._events = []

        // Slider debounce timers - avoid flooding with every tick
        this._sliderTimers = {}

        // Read role saved by index.html via sessionStorage
        this._role = sessionStorage.getItem('userRole') || 'unknown'

        // Device / browser metadata (collected once)
        this._meta = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenW: screen.width,
            screenH: screen.height,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
        }

        // Record session-start event
        this._record('session', 'start', {
            sessionId: this._sessionId,
            role: this._role
        })

        // Persist everything on page unload
        window.addEventListener('beforeunload', () => {
            this._record('session', 'end', {
                sessionId: this._sessionId,
                durationSec: Math.round((Date.now() - this._sessionStart) / 1000)
            })
            this._commitSessionToDB()
        })
    }

    // Public tracking API

    trackPlanetClick(planetName) {
        this._record('planet', 'click', { target: planetName })
    }

    trackSatelliteClick(satelliteName) {
        this._record('satellite', 'click', { target: satelliteName })
    }

    trackToggle(toggleId, value) {
        this._record('ui_toggle', 'change', {
            toggle: toggleId,
            value:  value ? 'on' : 'off'
        })
    }

    // Debounced - rapid slider drags produce one event per gesture (600 ms)
    trackSlider(sliderId, value) {
        clearTimeout(this._sliderTimers[sliderId])
        this._sliderTimers[sliderId] = setTimeout(() => {
            this._record('ui_slider', 'change', {
                slider: sliderId,
                value:  String(value)
            })
        }, 600)
    }

    trackMissionStart(missionName) {
        this._record('mission', 'start', { mission: missionName })
    }

    trackMissionStop(missionName, reason = 'user_abort') {
        this._record('mission', 'stop', { mission: missionName, reason })
    }

    trackCameraReset() {
        this._record('navigation', 'camera_reset', {})
    }

    // Read-only helpers (used by admin dashboard)

    // All events recorded in the CURRENT session
    getEvents() {
        return [...this._events]
    }

    get eventCount() {
        return this._events.length
    }

    // Returns every session ever stored in the localStorage DB. Each entry is the full session object (see schema at top of file).
    // Safe to call from admin.html even without an active simulation session.
    static getAllSessions() {
        try {
            const raw = localStorage.getItem(DB_KEY)
            return raw ? JSON.parse(raw) : []
        } catch {
            return []
        }
    }

    // Clears the entire historical DB.  Use with caution (admin only).
    static clearAllSessions() {
        try { localStorage.removeItem(DB_KEY) } catch { }
    }

    // Exports ALL historical sessions as a flat CSV. Each row = one event, enriched with session-level fields.
    // Columns:
    //      session_id, role, session_start_iso, screen, language, timezone,
    //      timestamp_iso, elapsed_sec, category, action,
    //      detail_key_1, detail_value_1, detail_key_2, detail_value_2
    static downloadAllSessionsCSV() {
        const sessions = Analytics.getAllSessions()
        if (!sessions.length) {
            alert('No session data recorded yet.')
            return
        }

        const header = [
            'session_id', 'role', 'session_start_iso',
            'screen', 'language', 'timezone',
            'timestamp_iso', 'elapsed_sec',
            'category', 'action',
            'detail_key_1', 'detail_value_1',
            'detail_key_2', 'detail_value_2'
        ]

        const rows = []
        for (const s of sessions) {
            const screen = `${s.screenW}x${s.screenH}`
            for (const ev of (s.events || [])) {
                const keys = Object.keys(ev.details || {})
                const vals = Object.values(ev.details || {})
                rows.push([
                    s.sessionId,
                    s.role,
                    s.startISO,
                    screen,
                    s.language,
                    s.timezone,
                    ev.timestampISO,
                    ev.elapsedSec,
                    ev.category,
                    ev.action,
                    keys[0] || '', vals[0] || '',
                    keys[1] || '', vals[1] || ''
                ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
            }
        }

        const csv = [header.join(','), ...rows].join('\r\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const date = new Date().toISOString().slice(0, 10)

        const a = document.createElement('a')
        a.href = url
        a.download = `solar_analytics_all_sessions_${date}.csv`
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Private
    _record(category, action, details = {}) {
        const now = Date.now()
        this._events.push({
            timestampISO: new Date(now).toISOString(),
            elapsedSec: Math.round((now - this._sessionStart) / 1000),
            category,
            action,
            details
        })
    }


    // Builds the complete session record and appends it to the localStorage DB. Called once, on beforeunload.
    _commitSessionToDB() {
        const endTime = Date.now()
        const durationSec = Math.round((endTime - this._sessionStart) / 1000)

        // Aggregate summary
        const summary = {
            totalEvents: this._events.length,
            durationSec,
            planetClicks: this._events.filter(e => e.category === 'planet').length,
            satelliteClicks:this._events.filter(e => e.category === 'satellite').length,
            missionStarts: this._events.filter(e => e.category === 'mission' && e.action === 'start').length,
            missionStops: this._events.filter(e => e.category === 'mission' && e.action === 'stop').length,
            cameraResets: this._events.filter(e => e.category === 'navigation').length,
            toggleChanges: this._events.filter(e => e.category === 'ui_toggle').length,
            sliderChanges: this._events.filter(e => e.category === 'ui_slider').length,
            // Which planets were clicked
            planetsVisited: [...new Set(
                this._events
                    .filter(e => e.category === 'planet')
                    .map(e => e.details?.target)
                    .filter(Boolean)
            )],
            // Which satellites were clicked
            satellitesViewed: [...new Set(
                this._events
                    .filter(e => e.category === 'satellite')
                    .map(e => e.details?.target)
                    .filter(Boolean)
            )],
            // Missions that were started
            missionsRun: [...new Set(
                this._events
                    .filter(e => e.category === 'mission' && e.action === 'start')
                    .map(e => e.details?.mission)
                    .filter(Boolean)
            )]
        }

        const sessionRecord = {
            sessionId: this._sessionId,
            role: this._role,
            startISO: new Date(this._sessionStart).toISOString(),
            endISO: new Date(endTime).toISOString(),
            durationSec,
            ...this._meta,
            events: this._events,
            summary
        }

        try {
            const existing = Analytics.getAllSessions()
            existing.push(sessionRecord)

            // Trim to MAX_SESSIONS (keep the most recent ones)
            const trimmed = existing.length > MAX_SESSIONS
                ? existing.slice(existing.length - MAX_SESSIONS)
                : existing

            localStorage.setItem(DB_KEY, JSON.stringify(trimmed))
        } catch (err) {
            // Storage quota exceeded or unavailable — silently ignore
            console.warn('[Analytics] Could not persist session:', err)
        }
    }

    _generateId() {
        return 'sess_' + Math.random().toString(36).slice(2, 10).toUpperCase()
    }
}

// Singleton for use throughout the simulation app
export const analytics = new Analytics()