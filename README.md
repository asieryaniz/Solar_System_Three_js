# Solar System Simulator

An interactive 3D web application that replicates the solar system using Three.js. Explore planets, moons and artificial satellites in real time, simulate the Artemis II space mission, and track user behavior through a session analytics system.

---

## Features

### Solar System Exploration
- All **8 planets** with real textures, elliptic orbits and accurate eccentricity values
- **Saturn's ring system** with texture
- **12 natural satellites** (Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan, Titania, Triton and more)
- **5 artificial satellites** with real 3D GLTF models: ISS, Hubble, James Webb Space Telescope, Parker Solar Probe and Voyager 1
- Free camera navigation — zoom, rotate, and click any object to focus and read its scientific info panel

### Simulation Configuration
- Toggle visibility of moons, planet orbits, moon orbits and artificial satellites
- Pause / resume the simulation
- Adjust **time scale** (0× to 5×)
- Control **ambient light intensity**

### Artemis II Mission Simulator
- Full simulation of NASA's Artemis II mission across **8 phases**: Launch → Parking Orbit → Trans-Lunar Injection → Translunar Coast → Lunar Flyby → Free Return → Re-entry → Splashdown
- Real crew data, mission profile and Mission Elapsed Time (MET)
- Dual Catmull-Rom trajectory curves
- Particle system for rocket plume (active during Launch, TLI and Re-entry)
- Full mission HUD with phase progress bar and phase list

### Analytics & User Profiles
- Profile selection on entry: **Student**, **Researcher**, **Enthusiast** or **Administrator**
- Tracks clicks on planets and satellites, slider changes, mission events and camera resets
- Session data exported as **CSV**
- Administrator profile redirects to a dedicated backend dashboard

---

## Project Structure

```
src/
├── main.js                        # Entry point — wires everything together
│
├── core/
│   ├── scene.js                   # Three.js scene + space background cubemap
│   ├── camera.js                  # Perspective camera setup
│   ├── renderer.js                # WebGL renderer (ACES tone mapping)
│   └── loop.js                    # Animation loop
│
├── controls/
│   └── controls.js                # OrbitControls configuration
│
├── systems/
│   ├── solarSystem.js             # Builds and updates the full solar system
│   ├── simulationSettings.js      # Global shared state (singleton)
│   ├── cameraController.js        # Focus / follow / reset camera logic
│   ├── interactionSystem.js       # Raycasting — click detection on objects
│   └── missionSystem.js           # Starts and stops missions
│
├── objects/
│   ├── sun.js                     # Sun mesh + point light
│   ├── planet.js                  # Planet mesh, pivot, hitbox, orbit logic
│   ├── satellite.js               # Natural satellite (moon) logic
│   ├── artificialSatellite.js     # Artificial satellite — GLTF loader + orbit types
│   └── orbit.js                   # Elliptic orbit line rendering
│
├── missions/
│   └── artemisII.js               # Full Artemis II simulation (phases, trajectory, HUD)
│
├── ui/
│   ├── controlsPanel.js           # Left-side control panel
│   ├── planetInfo.js              # Planet info panel (shown on click)
│   ├── satelliteInfo.js           # Satellite info panel
│   └── artemisHUD.js              # Mission HUD overlay
│
├── data/
│   ├── planets.js                 # Planet definitions (size, distance, texture, info…)
│   ├── satellites.js              # Natural satellite definitions
│   └── artificialSatellites.js    # Artificial satellite definitions + info
│
├── analytics/
│   └── analytics.js               # Event tracking, CSV export, localStorage persistence
│
└── utils/
    └── textureLoader.js           # Shared Three.js TextureLoader instance

public/
├── index.html                     # Profile selection page (entry point)
├── simulator.html                 # Main simulator page
├── admin.html                     # Administrator backend dashboard
├── textures/                      # Planet, moon and space textures
│   ├── space/                     # Cubemap (6 images) for space background
│   └── moons/                     # Moon textures
├── models/                        # GLTF/GLB 3D models
│   ├── iss.glb
│   ├── hubble.glb
│   ├── james_web.glb
│   ├── parker.glb
│   ├── voyager.glb
│   └── artemis.glb
├── images/                        # Satellite info panel images
└── draco/                         # DRACO decoder (for compressed GLTF models)
```

---

## Tech Stack

| Tool | Role |
|---|---|
| [Three.js](https://threejs.org/) | 3D engine — WebGL rendering, geometries, lights, textures, GLTF loading |
| [Vite](https://vitejs.dev/) | Dev server and production bundler |
| [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) | Free camera navigation with damping |
| [DRACO](https://google.github.io/draco/) | Geometry compression for 3D satellite models |
| Vanilla JS (ES6+) | Application logic — modular class-based architecture |
| CSS / HTML | UI panels, HUD, glassmorphism effects, Orbitron typography |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/solar-system-simulator.git
cd solar-system-simulator

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Opens a local server at `http://localhost:5173`. Changes hot-reload automatically.

### Production Build

```bash
npm run build
```

Output goes to the `dist/` folder, ready to deploy to any static hosting (Netlify, Vercel, GitHub Pages, etc.).

### Preview Production Build Locally

```bash
npm run preview
```

---

## How to Use

1. **Open the app** — you land on the profile selection screen
2. **Select your profile** — Student, Researcher or Enthusiast to enter the simulator; Administrator to access the backend dashboard
3. **Explore the solar system** — drag to rotate, scroll to zoom, click any planet or satellite to focus on it and read its info panel
4. **Use the control panel** (bottom left) to toggle visibility, adjust speed, pause the simulation or select artificial satellites
5. **Launch Artemis II** from the control panel to start the mission simulation
6. **Abort the mission** at any time using the button in the HUD to return to free exploration

---

## User Profiles

| Profile | Access | Description |
|---|---|---|
| 🎓 Student | Simulator | Guided interactive experience |
| 🔭 Researcher | Simulator | Orbital data and technical parameters |
| 🪐 Enthusiast | Simulator | Free exploration |
| ⚙️ Administrator | Backend dashboard | Session analytics and usage data |

---

## Analytics System

Every session records the following events:

| Category | Action | Details |
|---|---|---|
| `session` | `start` / `end` | Session ID, duration |
| `planet` | `click` | Planet name |
| `satellite` | `click` | Satellite name |
| `ui_toggle` | `change` | Toggle ID, on/off |
| `ui_slider` | `change` | Slider ID, value (debounced 600ms) |
| `mission` | `start` / `stop` | Mission name, reason |
| `navigation` | `camera_reset` | — |

Session data is persisted to `localStorage` on page unload and can be exported as CSV from the administrator dashboard.

> **Note:** The current implementation stores data locally in the browser. Data does not accumulate across different users or devices. A real backend with persistent database is planned as future work.

---

## Artemis II Mission Phases

| Phase | Description |
|---|---|
| Launch | SLS lifts off from LC-39B |
| Parking Orbit | Crew confirms systems nominal |
| Trans-Lunar Injection | ICPS burns for 22 minutes |
| Translunar Coast | 3 days, 18 hours to the Moon |
| Lunar Flyby | Closest approach: 8,900 km |
| Free Return | Moon's gravity slings Orion home |
| Re-entry | Orion hits atmosphere at 11 km/s |
| Splashdown | Pacific Ocean recovery |

---

## Future Work

- **Real backend** with persistent database — accumulate session data across all users
- **More missions** — Perseverance rover, DART impact, future Artemis missions
- **WebXR / VR mode** — immersive exploration with a headset
- **Profile-tailored experience** — guided tours for students, raw orbital data for researchers

---

## License

MIT License — feel free to use, modify and distribute.
