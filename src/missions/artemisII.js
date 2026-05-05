// src/missions/artemisII.js

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { SimulationSettings } from '../systems/simulationSettings.js'
import { ArtemisHUD } from '../ui/artemisHUD.js'

const EARTH_R = 1
const MOON_ORBIT_R = 3.5
const LEO_R = EARTH_R + 0.55 // Low Earth Orbit
const MOON_FIXED_POS = new THREE.Vector3(MOON_ORBIT_R, 0, 0)
const CAM_LERP = 0.028

// Phases
const PHASES = [
    { id: 'launch', label: 'LAUNCH', subtitle: 'SLS lifts off from LC-39B', duration: 380 },
    { id: 'parking_orbit', label: 'PARKING ORBIT', subtitle: 'Crew confirms systems nominal', duration: 300 },
    { id: 'tli', label: 'TRANS-LUNAR INJECTION', subtitle: 'ICPS burns for 22 minutes', duration: 360 },
    { id: 'coast', label: 'TRANSLUNAR COAST', subtitle: '3 days, 18 hours to the Moon', duration: 480 },
    { id: 'flyby', label: 'LUNAR FLYBY', subtitle: 'Closest approach: 8,900 km', duration: 400 },
    { id: 'return', label: 'FREE RETURN', subtitle: "Moon's gravity slings Orion home", duration: 360 },
    { id: 'reentry', label: 'RE-ENTRY', subtitle: 'Orion hits atmosphere at 11 km/s', duration: 300 },
    { id: 'splashdown', label: 'SPLASHDOWN', subtitle: 'Pacific Ocean recovery — Mission Complete', duration: 300 },
]

// Phase segment mapping to trajectory curves
//  curveA — launch + parking_orbit + TLI  (points always >= LEO_R from the origin)
//  curveB — coast + flyby + return + reentry + splashdown
const PHASE_CURVE = {
    launch: { curve: 'A', range: [0.00, 0.30] },
    parking_orbit: { curve: 'A', range: [0.30, 0.65] },
    tli: { curve: 'A', range: [0.65, 1.00] },
    coast: { curve: 'B', range: [0.00, 0.38] },
    flyby: { curve: 'B', range: [0.38, 0.52] },
    return: { curve: 'B', range: [0.52, 0.78] },
    reentry: { curve: 'B', range: [0.78, 0.93] },
    splashdown: { curve: 'B', range: [0.93, 1.00] },
}

// Helpers

function loadArtemisModel() {
    return new Promise((resolve) => {
        const loader = new GLTFLoader()
        const draco  = new DRACOLoader()
        draco.setDecoderPath('/draco/')
        loader.setDRACOLoader(draco)

        loader.load(
            '/models/artemis.glb',
            (gltf) => {
                const model = gltf.scene
                const box = new THREE.Box3().setFromObject(model)
                const size = box.getSize(new THREE.Vector3()).length()
                model.scale.setScalar(0.12 / size)
                box.setFromObject(model)
                model.position.sub(box.getCenter(new THREE.Vector3()))
                model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
                resolve(model)
            },
            undefined,
            () => {
                console.warn('[ArtemisII] artemis.glb no encontrado — usando placeholder')
                const g = new THREE.Group()
                g.add(new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.035, 0.18, 16),
                    new THREE.MeshStandardMaterial({ color: 0xc8b89a, metalness: 0.4, roughness: 0.5 })
                ))
                resolve(g)
            }
        )
    })
}

// Create the flame plume effect of the rocket
function makePlume(scene, color = 0xff8c00, count = 200) {
    const positions = new Float32Array(count * 3)
    const velocities = Array.from({ length: count }, () =>
        new THREE.Vector3(
            (Math.random() - 0.5) * 0.003,
            -(Math.random() * 0.014 + 0.004),
            (Math.random() - 0.5) * 0.003
        )
    )
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 0.02
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.02
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
        color, size: 0.016, transparent: true, opacity: 0.88,
        blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    })
    const points = new THREE.Points(geo, mat)
    points.visible = false
    scene.add(points)
    return {
        points,
        show() { points.visible = true  },
        hide() { points.visible = false },
        update(origin) {
            for (let i = 0; i < count; i++) {
                positions[i * 3] += velocities[i].x
                positions[i * 3 + 1] += velocities[i].y
                positions[i * 3 + 2] += velocities[i].z
                if (positions[i * 3 + 1] - origin.y < -0.4) {
                    positions[i * 3] = origin.x + (Math.random() - 0.5) * 0.015
                    positions[i * 3 + 1] = origin.y
                    positions[i * 3 + 2] = origin.z + (Math.random() - 0.5) * 0.015
                    velocities[i].set(
                        (Math.random() - 0.5) * 0.003,
                        -(Math.random() * 0.012 + 0.003),
                        (Math.random() - 0.5) * 0.003
                    )
                }
            }
            geo.attributes.position.needsUpdate = true
        },
        dispose() { scene.remove(points); geo.dispose(); mat.dispose() }
    }
}


function buildFullTrajectory(scene) {
    const MX = MOON_ORBIT_R

    // Curve A: launch → LEO → TLI

    // The orbit LEO is approximated with 8 points on the circumference of radius LEO_R.
    const ptA = (angle) => new THREE.Vector3(
        Math.sin(angle) * LEO_R,
        Math.cos(angle) * LEO_R,
        0
    )
    const waypointsA = [
        // Launch: climbs vertically from the surface
        new THREE.Vector3(0, EARTH_R, 0),
        new THREE.Vector3(0, EARTH_R + 0.15, 0),
        new THREE.Vector3(0, EARTH_R + 0.35, 0),
        new THREE.Vector3(0, LEO_R, 0),   // LEO north — angle 0°

        // Parking orbit: travels through the hole LEO at constant radius, changing angle from 0 to 360°
        ptA(Math.PI * 0.25), // 45°
        ptA(Math.PI * 0.5), // 90° - LEO east
        ptA(Math.PI * 0.75), // 135°
        ptA(Math.PI), // 180° - LEO south
        ptA(Math.PI * 1.25), // 225°
        ptA(Math.PI * 1.5), // 270° - LEO west
        ptA(Math.PI * 1.75), // 315°
        new THREE.Vector3(0, LEO_R, 0), // 360° - returns to LEO north

        // TLI: goes from LEO towards the Moon
        new THREE.Vector3(0.3, LEO_R + 0.2,  0.1),
        new THREE.Vector3(0.8, 2.0, 0.2),
        new THREE.Vector3(1.6, 2.8, 0.2),
        new THREE.Vector3(2.5, 2.8, 0.15),
        new THREE.Vector3(3.2, 2.2, 0.1), // final TLI
    ]

    //  Curve B: coast → flyby → return → reentry → splashdown
    // Starts from the last point of curve A (final TLI)
    const waypointsB = [
        // Coast: plane torwards the Moon
        new THREE.Vector3(3.2, 2.2, 0.1),
        new THREE.Vector3(MX - 0.8, 1.8, 0.05),
        new THREE.Vector3(MX - 0.4, 1.0, 0.0),
        new THREE.Vector3(MX - 0.2, 0.5, 0.0),

        // Flyby: goes over the Moon
        new THREE.Vector3(MX - 0.1, 0.38, 0.0),
        new THREE.Vector3(MX, 0.36, 0.0),
        new THREE.Vector3(MX + 0.15, 0.38, -0.08),
        new THREE.Vector3(MX + 0.4, 0.5, -0.25),

        // Return: goes back from the Moon towards Earth
        new THREE.Vector3(MX + 0.3, -0.3, -0.4),
        new THREE.Vector3(3.0, -1.2, -0.4),
        new THREE.Vector3(2.0, -2.0, -0.3),
        new THREE.Vector3(1.0, -2.2, -0.15),
        new THREE.Vector3(0.3, -1.8, -0.05),

        // Reentry: dives towards Earth
        new THREE.Vector3(0.15, -(EARTH_R + 0.4), 0.03),
        new THREE.Vector3(0.06, -(EARTH_R + 0.08), 0.01),

        // Splashdown: final point in the ocean
        new THREE.Vector3(0.05, -EARTH_R, 0.0),
    ]

    // Construct and draw curve A
    const curveA = new THREE.CatmullRomCurve3(waypointsA)
    const ptsA = curveA.getPoints(300)
    const geoA = new THREE.BufferGeometry().setFromPoints(ptsA)

    // Construct and draw curve B
    const curveB = new THREE.CatmullRomCurve3(waypointsB)
    const ptsB = curveB.getPoints(500)
    const geoB = new THREE.BufferGeometry().setFromPoints(ptsB)

    const mat = new THREE.LineDashedMaterial({
        color: 0xc8a96e, dashSize: 0.1, gapSize: 0.07,
        transparent: true, opacity: 0.45,
    })

    const lineA = new THREE.Line(geoA, mat.clone())
    lineA.computeLineDistances()
    scene.add(lineA)

    const lineB = new THREE.Line(geoB, mat.clone())
    lineB.computeLineDistances()
    scene.add(lineB)

    return {
        curveA, curveB, lineA, lineB,
        getPointA(t) { return curveA.getPoint(Math.max(0, Math.min(1, t))) },
        getPointB(t) { return curveB.getPoint(Math.max(0, Math.min(1, t))) },
        dispose() {
            scene.remove(lineA); geoA.dispose()
            scene.remove(lineB); geoB.dispose()
            mat.dispose()
        }
    }
}


// Principal clase
export class ArtemisII {
    constructor(solarSystem) {
        this.solarSystem = solarSystem

        this.scene = null
        this.camera = null

        // We reuse the objects of the solar system
        this._earthMesh = null
        this._moonMesh = null

        this.spacecraft = null
        this.plume = null
        this.plume2 = null
        this.trajectory = null
        this.hud = null
        this._lights = []

        this._orbitAngle = 0
        this.phaseIndex = 0
        this.phaseFrame = 0
        this.totalFrame = 0

        this._camPos = new THREE.Vector3()
        this._camTarget = new THREE.Vector3()

        this._savedBackground = null
        this._hiddenSceneObjects = []
    }


    start(scene, camera) {
        this.scene = scene
        this.camera = camera

        SimulationSettings.missionMode = true

        // Ocult the control panel
        const panel = document.querySelector('.sp-panel')
        if (panel) panel.style.display = 'none'

        // Ocult all the objects of the solar system
        this._hiddenSceneObjects = []
        scene.children.forEach(child => {
            if (child.isLight) return
            this._hiddenSceneObjects.push({ obj: child, wasVisible: child.visible })
            child.visible = false
        })

        // Black background
        this._savedBackground = scene.background
        scene.background = new THREE.Color(0x00000a)

        // Ilumination
        const sunLight = new THREE.DirectionalLight(0xfff4e0, 3.5)
        sunLight.position.set(60, 20, 10)
        scene.add(sunLight)
        this._lights.push(sunLight)

        const ambient = new THREE.AmbientLight(0x112244, 1.6)
        scene.add(ambient)
        this._lights.push(ambient)

        // Rehuse the Earth from the solar system
        const earthPlanet = this.solarSystem.objects.find(o => o.name === 'Earth')
        if (earthPlanet) {
            this._earthMesh = earthPlanet.mesh
            this._savedEarthPivotPos = earthPlanet.pivot.position.clone()
            earthPlanet.pivot.position.set(0, 0, 0)
            earthPlanet.pivot.visible = true
            earthPlanet.pivot.traverse(child => { child.visible = true })
            this._earthPlanetRef = earthPlanet
        }

        // Rehuse the moon from the solar system
        const moonSat = this.solarSystem.objects.find(o => o.name === 'Moon')
        if (moonSat) {
            this._moonSatRef = moonSat
            this._moonOrigParent = moonSat.pivot.parent
            scene.add(moonSat.pivot)
            moonSat.pivot.position.copy(MOON_FIXED_POS)
            moonSat.mesh.position.set(0, 0, 0)
            moonSat.pivot.visible = true
            moonSat.mesh.visible = true
        }

        // Fire plumes
        this.plume = makePlume(scene, 0xff6600, 200)
        this.plume2 = makePlume(scene, 0xffcc44, 90)

        // Load the model
        this.spacecraft = new THREE.Group()
        scene.add(this.spacecraft)
        loadArtemisModel().then(model => {
            scene.remove(this.spacecraft)
            this.spacecraft = model
            scene.add(this.spacecraft)
        })

        // Trajectory curves
        this.trajectory = buildFullTrajectory(scene)

        // HUD
        this.hud = new ArtemisHUD(() => window.dispatchEvent(new CustomEvent('artemis:stop')))
        this.hud.show()

        // Camera
        this._camPos.set(0, 1.2, 3.2)
        this._camTarget.set(0, 0, 0)
        camera.position.copy(this._camPos)
        camera.lookAt(this._camTarget)
        if (camera._controls) {
            camera._controls.target.set(0, 0, 0)
            camera._controls.update()
        }

        // Reset the mission state
        this._orbitAngle = 0
        this.phaseIndex = 0
        this.phaseFrame = 0
        this.totalFrame = 0
        this._missionEnded = false
        this._applyPhase()
    }

 

    end(scene) {
        SimulationSettings.missionMode = false

        const panel = document.querySelector('.sp-panel')
        if (panel) panel.style.display = ''

        // Restart Earth position
        if (this._earthPlanetRef && this._savedEarthPivotPos) {
            this._earthPlanetRef.pivot.position.copy(this._savedEarthPivotPos)
        }

        // Restart Moon position
        if (this._moonSatRef && this._moonOrigParent) {
            this._moonOrigParent.add(this._moonSatRef.pivot)
            this._moonSatRef.pivot.position.set(0, 0, 0)
        }

        // Restart visibility of all the objects in the scene
        this._hiddenSceneObjects.forEach(({ obj, wasVisible }) => {
            obj.visible = wasVisible
        })
        this._hiddenSceneObjects = []

        if (this._savedBackground) scene.background = this._savedBackground

        this._lights.forEach(l => scene.remove(l))
        this._lights = []

        this.plume?.dispose()
        this.plume2?.dispose()
        this.trajectory?.dispose()

        if (this.spacecraft) {
            scene.remove(this.spacecraft)
            this.spacecraft.traverse(c => {
                if (c.isMesh) { c.geometry.dispose(); c.material.dispose() }
            })
            this.spacecraft = null
        }

        this.hud?.hide()
        this.hud = null
    }

    update() {
        if (!this.scene || this._missionEnded) return

        this.totalFrame++
        this.phaseFrame++

        const phase = PHASES[this.phaseIndex]
        const t     = Math.min(this.phaseFrame / phase.duration, 1)

        // Advance phase if time is up
        if (this.phaseFrame >= phase.duration) {
            if (this.phaseIndex < PHASES.length - 1) {
                this.phaseIndex++
                this.phaseFrame = 0
                this._applyPhase()
            } else {
                // End of the mission
                if (!this._missionEnded) {
                    this._missionEnded = true
                    setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('artemis:stop'))
                    }, 1500)
                }
                return
            }
        }

        // Earth rotation
        if (this._earthMesh) this._earthMesh.rotation.y += 0.0005

        // Phases logic
        switch (phase.id) {
            case 'launch': this._updateLaunch(t); break
            case 'parking_orbit': this._updateParkingOrbit(t); break
            case 'tli': this._updateTLI(t); break
            case 'coast': this._updateCoast(t); break
            case 'flyby': this._updateFlyby(t); break
            case 'return': this._updateReturn(t); break
            case 'reentry': this._updateReentry(t); break
            case 'splashdown': this._updateSplashdown(t); break
        }

        this.hud?.update(PHASES[this.phaseIndex], t, this.phaseIndex, PHASES.length)

        this.camera.position.lerp(this._camPos, CAM_LERP)
        this.camera.lookAt(this._camTarget)
    }

    // Phase transition
    _applyPhase() {
        const id = PHASES[this.phaseIndex].id
        const plumeOn = ['launch', 'tli', 'reentry'].includes(id)
        plumeOn ? this.plume.show()  : this.plume.hide()
        plumeOn ? this.plume2.show() : this.plume2.hide()
    }

    // Curve helpers
    _curvePoint(phaseId, t) {
        const { curve, range: [a, b] } = PHASE_CURVE[phaseId]
        const globalT = a + (b - a) * this._ease(t)
        return curve === 'A'
            ? this.trajectory.getPointA(globalT)
            : this.trajectory.getPointB(globalT)
    }

    _curvePointNext(phaseId, t, delta = 0.012) {
        const { curve, range: [a, b] } = PHASE_CURVE[phaseId]
        const globalT = Math.min(a + (b - a) * this._ease(t) + delta, 1)
        return curve === 'A'
            ? this.trajectory.getPointA(globalT)
            : this.trajectory.getPointB(globalT)
    }

    // Phase updates
    _updateLaunch(t) {
        const pt = this._curvePoint('launch', t)
        const ptNext = this._curvePointNext('launch', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)

        this.plume.update(pt)
        this.plume2.update(pt)

        this._camPos.set(0.3 + t * 0.1, EARTH_R + 0.04 + t * 0.5, 1.0 - t * 0.15)
        this._camTarget.copy(pt)
    }

    _updateParkingOrbit(t) {
        const pt = this._curvePoint('parking_orbit', t)
        const ptNext = this._curvePointNext('parking_orbit', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)

        const e = this._ease(Math.min(t * 2, 1))
        this._camPos.set(
            THREE.MathUtils.lerp(0.5, 0, e),
            THREE.MathUtils.lerp(1.8, 3.0, e),
            THREE.MathUtils.lerp(1.5, 3.2, e)
        )
        this._camTarget.set(0, 0, 0)
    }

    _updateTLI(t) {
        const pt = this._curvePoint('tli', t)
        const ptNext = this._curvePointNext('tli', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)

        this.plume.update(pt)
        this.plume2.update(pt)

        const pull = THREE.MathUtils.lerp(2.5, 5.5, this._ease(t))
        this._camPos.set(-pull * 0.25, pull * 0.35, pull * 0.8)
        this._camTarget.set(0, 0, 0)
    }

    _updateCoast(t) {
        const pt = this._curvePoint('coast', t)
        const ptNext = this._curvePointNext('coast', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)
        this.spacecraft.rotateZ(0.002)

        this._camPos.set(-4, 3, 5.5)
        this._camTarget.set(0, 0, 0)
    }

    _updateFlyby(t) {
        const pt = this._curvePoint('flyby', t)
        const ptNext = this._curvePointNext('flyby', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)

        const moonPos = MOON_FIXED_POS
        const toMoon = moonPos.clone().sub(pt).normalize()
        const offset = toMoon.clone().multiplyScalar(-0.5)
        offset.y += 0.15

        this._camPos.copy(pt).add(offset)
        this._camTarget.copy(moonPos)
    }

    _updateReturn(t) {
        const pt = this._curvePoint('return', t)
        const ptNext = this._curvePointNext('return', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(ptNext)
        this.spacecraft.rotateZ(0.002)

        this._camPos.set(4.5, 3.5, -3)
        this._camTarget.set(0, 0, 0)
    }

    _updateReentry(t) {
        const pt = this._curvePoint('reentry', t)

        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(new THREE.Vector3(0, 0, 0))

        this.plume.update(pt)
        this.plume2.update(pt)

        const intensity = Math.sin(t * Math.PI) * 1.8
        this.spacecraft.traverse(child => {
            if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setRGB(intensity * 0.9, intensity * 0.18, 0)
                child.material.emissiveIntensity = intensity
            }
        })

        const away = pt.clone().normalize().negate().multiplyScalar(0.25).add(pt)
        away.y += 0.08
        this._camPos.copy(away)
        this._camTarget.set(0, 0, 0)
    }

    _updateSplashdown(t) {
        const pt = this._curvePoint('splashdown', t)
        this.spacecraft.position.copy(pt)
        this.spacecraft.lookAt(new THREE.Vector3(0, 0, 0))

        this.spacecraft.traverse(child => {
            if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setScalar(0)
                child.material.emissiveIntensity = 0
            }
        })

        this.spacecraft.position.y += Math.sin(this.totalFrame * 0.04) * 0.003

        const angle = this.totalFrame * 0.005
        const base = pt.clone().normalize().multiplyScalar(EARTH_R + 0.015)
        this._camPos.set(
            base.x + Math.cos(angle) * 0.22,
            base.y + 0.12,
            base.z + Math.sin(angle) * 0.22
        )
        this._camTarget.copy(base)
    }

    // Easing function for smoother transitions
    _ease(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }
}