// src/missions/artemisII.js

import * as THREE from 'three'
import { SimulationSettings } from '../systems/simulationSettings.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

// ─────────────────────────────────────────────
//  TUNING — adjust these if visuals are off
// ─────────────────────────────────────────────

// Scale applied to the .glb model
const MODEL_SCALE = 0.02

// After loading, we auto-detect the model's "up" axis from its bounding box.
// If the rocket still looks wrong, override here with one of:
//   null        → use auto-detection (default)
//   'posY'      → nose already points +Y
//   'negY'      → nose points -Y
//   'posZ'      → nose points +Z  (try this first if auto fails)
//   'negZ'      → nose points -Z
//   'posX'      → nose points +X
//   'negX'      → nose points -X
const FORCE_MODEL_AXIS = null

// How far below the model origin the engine nozzle is, in MODEL-LOCAL units
// (before scale). Increase this if fire appears too high.
const NOZZLE_LOCAL_Y = -50   // model units (will be multiplied by MODEL_SCALE)

// ─────────────────────────────────────────────
//  Altitude constants (scene units)
// ─────────────────────────────────────────────

const LEO_ALT   = 2.8
const LUNAR_ALT = 1.2

// ─────────────────────────────────────────────
//  Phase config
// ─────────────────────────────────────────────

const PHASE_ORDER = ['launch', 'earth-orbit', 'tli', 'lunar-orbit', 'return', 'splashdown']

const PHASE_DURATION = {
    launch:        700,
    'earth-orbit': 900,
    tli:           1000,
    'lunar-orbit': 1000,
    return:        1000,
    splashdown:    500
}

const PHASE_LABELS = {
    'launch':       '🚀  Phase 1 – Launch',
    'earth-orbit':  '🌍  Phase 2 – Earth Orbit (LEO)',
    'tli':          '🔥  Phase 3 – Trans-Lunar Injection',
    'lunar-orbit':  '🌕  Phase 4 – Lunar Orbit (DRO)',
    'return':       '↩️   Phase 5 – Return to Earth',
    'splashdown':   '🌊  Phase 6 – Re-entry & Splashdown'
}

// Camera offset and lerp speed per phase
const CAM_RIGS = {
    launch:        { offset: new THREE.Vector3(3,  0.5, 1.5), lerpSpeed: 0.06 },
    'earth-orbit': { offset: new THREE.Vector3(4,  1.5, 4),   lerpSpeed: 0.04 },
    tli:           { offset: new THREE.Vector3(5,  2,   5),   lerpSpeed: 0.025 },
    'lunar-orbit': { offset: new THREE.Vector3(3,  1,   3),   lerpSpeed: 0.04 },
    return:        { offset: new THREE.Vector3(4,  1.5, 4),   lerpSpeed: 0.03 },
    splashdown:    { offset: new THREE.Vector3(1.5,4,   1.5), lerpSpeed: 0.05 }
}

// Frames for smooth blends at phase transitions
const QUAT_BLEND_TICKS = 120
const CAM_BLEND_TICKS  = 150

// ─────────────────────────────────────────────
//  Math helpers
// ─────────────────────────────────────────────

function bezier3(p0, p1, p2, p3, t) {
    const mt = 1 - t
    return p0.clone().multiplyScalar(mt * mt * mt)
        .add(p1.clone().multiplyScalar(3 * mt * mt * t))
        .add(p2.clone().multiplyScalar(3 * mt * t * t))
        .add(p3.clone().multiplyScalar(t * t * t))
}

function smoothstep(t) {
    t = Math.max(0, Math.min(1, t))
    return t * t * (3 - 2 * t)
}

function easeInOutCubic(t) {
    t = Math.max(0, Math.min(1, t))
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Build a quaternion that rotates the ship so its local +Y points along worldDir.
 * This is the canonical "nose direction" convention used throughout this file.
 */
function quatLookUp(worldDir) {
    const up = worldDir.clone().normalize()
    // Pick an arbitrary "forward" that is not parallel to up
    let fwd = new THREE.Vector3(0, 0, 1)
    if (Math.abs(up.dot(fwd)) > 0.99) fwd = new THREE.Vector3(1, 0, 0)
    const right = new THREE.Vector3().crossVectors(fwd, up).normalize()
    const back  = new THREE.Vector3().crossVectors(up, right)
    const m = new THREE.Matrix4().makeBasis(right, up, back)
    return new THREE.Quaternion().setFromRotationMatrix(m)
}

// ─────────────────────────────────────────────
//  Trail
// ─────────────────────────────────────────────

class ShipTrail {
    constructor(scene, maxPoints = 2000) {
        this.maxPoints = maxPoints
        this.positions = []
        const geo = new THREE.BufferGeometry()
        this._buf = new Float32Array(maxPoints * 3)
        geo.setAttribute('position', new THREE.BufferAttribute(this._buf, 3))
        geo.setDrawRange(0, 0)
        this.line = new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: 0x88ccff, transparent: true, opacity: 0.55
        }))
        this.line.frustumCulled = false
        scene.add(this.line)
    }

    add(pos) {
        this.positions.push(pos.clone())
        if (this.positions.length > this.maxPoints) this.positions.shift()
        const len = this.positions.length
        for (let i = 0; i < len; i++) {
            this._buf[i * 3]     = this.positions[i].x
            this._buf[i * 3 + 1] = this.positions[i].y
            this._buf[i * 3 + 2] = this.positions[i].z
        }
        this.line.geometry.attributes.position.needsUpdate = true
        this.line.geometry.setDrawRange(0, len)
    }

    dispose(scene) {
        scene.remove(this.line)
        this.line.geometry.dispose()
        this.line.material.dispose()
    }
}

// ─────────────────────────────────────────────
//  ArtemisII
// ─────────────────────────────────────────────

export class ArtemisII {

    constructor(solarSystem) {
        this.solarSystem = solarSystem
    }

    // ── Lifecycle ──────────────────────────────

    start(scene, camera) {
        this.scene  = scene
        this.camera = camera

        SimulationSettings.missionMode = true
        SimulationSettings.timeScale   = 0.03

        this.earth = this.solarSystem.objects.find(o => o.name === 'Earth')
        this.moon  = this.solarSystem.objects.find(o => o.name === 'Moon')

        this.tick      = 0
        this.totalTick = 0

        // Quaternion slerp state
        this._quatFrom      = new THREE.Quaternion()
        this._quatTo        = new THREE.Quaternion()
        this._quatBlendTick = QUAT_BLEND_TICKS  // "done"

        // Camera blend state
        this._camOffsetFrom = null
        this._camBlendTick  = CAM_BLEND_TICKS   // "done"

        // The root group lives in world space
        this.shipGroup = new THREE.Object3D()
        this.shipGroup.name = 'ArtemisII'
        scene.add(this.shipGroup)

        // orientNode: its LOCAL +Y axis = rocket nose direction.
        // The model is loaded inside this node with a correction rotation
        // so that whatever axis the .glb uses, after correction the nose is +Y.
        this.orientNode = new THREE.Object3D()
        this.shipGroup.add(this.orientNode)

        // effectsNode: sprites live here, scaled to match the model
        // It is a child of orientNode so effects inherit orientation.
        this.effectsNode = new THREE.Object3D()
        this.orientNode.add(this.effectsNode)

        this._loadModel()
        this._buildEffects()

        this.trail = new ShipTrail(scene)
        this._buildUI()

        // Initial position: directly above Earth along world +Y
        const ep  = this._earthPos()
        const er  = this._earthRadius()
        this._launchDir = new THREE.Vector3(0, 1, 0)  // world "up" at launch site
        this.shipGroup.position.copy(ep).addScaledVector(this._launchDir, er + 0.05)
        this.shipGroup.quaternion.copy(quatLookUp(this._launchDir))

        this._initPhase('launch')
    }

    update() {
        if (!this.shipGroup) return

        this.tick++
        this.totalTick++

        if (this._quatBlendTick < QUAT_BLEND_TICKS) this._quatBlendTick++
        if (this._camBlendTick  < CAM_BLEND_TICKS)  this._camBlendTick++

        const fn = `_phase_${this.phase.replace(/-/g, '_')}`
        if (this[fn]) this[fn]()

        // Apply ongoing quaternion slerp (overrides phase handler's setQuaternion)
        this._tickQuatBlend()

        this.trail.add(this.shipGroup.position)
        this._updateCamera()

        if (this.tick >= PHASE_DURATION[this.phase]) this._nextPhase()
    }

    end() {
        SimulationSettings.missionMode = false
        SimulationSettings.timeScale   = 1
        if (this.trail) this.trail.dispose(this.scene)
        if (this.shipGroup?.parent) this.shipGroup.parent.remove(this.shipGroup)
        this.shipGroup = null
        this._removeUI()
    }

    // ── Model loading ─────────────────────────

    _loadModel() {
        const loader = new GLTFLoader()
        const draco  = new DRACOLoader()
        draco.setDecoderPath('/draco/')
        loader.setDRACOLoader(draco)

        loader.load('/models/artemis.glb', (gltf) => {
            const model = gltf.scene
            model.scale.setScalar(MODEL_SCALE)

            // Detect or force the model's nose axis
            const axis = FORCE_MODEL_AXIS ?? this._detectNoseAxis(model)
            console.log(`[ArtemisII] model nose axis detected: ${axis}`)

            // Apply correction so nose ends up at local +Y of orientNode
            this._applyAxisCorrection(model, axis)

            this.orientNode.add(model)

            // Now that we know the model's corrected size, reposition the
            // effectsNode nozzle offset in world-model units
            this._repositionEffects(axis)
        })
    }

    /**
     * Detect which axis the model's longest dimension aligns with.
     * The tallest axis is assumed to be the nose-to-tail direction.
     */
    _detectNoseAxis(model) {
        const box = new THREE.Box3().setFromObject(model)
        const size = new THREE.Vector3()
        box.getSize(size)
        console.log(`[ArtemisII] model size: x=${size.x.toFixed(2)} y=${size.y.toFixed(2)} z=${size.z.toFixed(2)}`)

        // The longest axis is the rocket's main axis.
        // We also check the bounding box center to determine which end is "up".
        if (size.y >= size.x && size.y >= size.z) return 'posY'
        if (size.z >= size.x && size.z >= size.y) return 'posZ'
        return 'posX'
    }

    /**
     * Rotate the model inside orientNode so its nose points toward local +Y.
     */
    _applyAxisCorrection(model, axis) {
        switch (axis) {
            case 'posY': model.rotation.set(0, 0, 0);                   break  // already correct
            case 'negY': model.rotation.set(Math.PI, 0, 0);             break
            case 'posZ': model.rotation.set(-Math.PI / 2, 0, 0);        break
            case 'negZ': model.rotation.set( Math.PI / 2, 0, 0);        break
            case 'posX': model.rotation.set(0, 0, -Math.PI / 2);        break
            case 'negX': model.rotation.set(0, 0,  Math.PI / 2);        break
            default:     model.rotation.set(-Math.PI / 2, 0, 0);        break
        }
    }

    /**
     * Move the effectsNode (fire+smoke) to the engine nozzle.
     * After correction, the nozzle is always at -Y of orientNode.
     * We express the offset in scene units: NOZZLE_LOCAL_Y * MODEL_SCALE.
     */
    _repositionEffects(axis) {
        const nozzleY = NOZZLE_LOCAL_Y * MODEL_SCALE
        this.effectsNode.position.set(0, nozzleY, 0)
    }

    // ── Effects ───────────────────────────────

    _buildEffects() {
        const tl = new THREE.TextureLoader()

        const fireMat = new THREE.SpriteMaterial({
            map:         tl.load('/textures/fire.jpg'),
            transparent: true,
            depthWrite:  false,
            blending:    THREE.AdditiveBlending
        })
        this.fire = new THREE.Sprite(fireMat)
        // Base scale in scene units — small since effectsNode is already at nozzle
        this.fire.scale.set(0.15, 0.4, 1)
        this.fire.position.set(0, -0.1, 0)  // tiny extra offset below nozzle
        this.effectsNode.add(this.fire)

        this.smokeMat = new THREE.SpriteMaterial({
            map:         tl.load('/textures/smoke.png'),
            transparent: true,
            opacity:     0.5,
            depthWrite:  false
        })
        this.smokePool = []
        this._fireOn   = true
    }

    _spawnSmoke() {
        const s = new THREE.Sprite(this.smokeMat.clone())
        s.scale.set(0.12, 0.12, 0.12)
        s.position.set(
            (Math.random() - 0.5) * 0.08,
            -0.15,
            (Math.random() - 0.5) * 0.08
        )
        this.effectsNode.add(s)
        this.smokePool.push({ sprite: s, life: 1.0 })
    }

    _updateSmoke() {
        for (let i = this.smokePool.length - 1; i >= 0; i--) {
            const p = this.smokePool[i]
            p.life -= 0.018
            p.sprite.position.y -= 0.012
            p.sprite.material.opacity = Math.max(0, p.life * 0.45)
            p.sprite.scale.multiplyScalar(1.012)
            if (p.life <= 0) {
                this.effectsNode.remove(p.sprite)
                this.smokePool.splice(i, 1)
            }
        }
    }

    _setFire(on) {
        this._fireOn = on
        this.fire.visible = on
    }

    _animateFire(sx = 0.15, sy = 0.4) {
        if (!this._fireOn) return
        const j = 1 + Math.sin(this.totalTick * 0.7) * 0.15
        this.fire.scale.set(sx * j, sy * j, 1)
        this.fire.position.x = (Math.random() - 0.5) * 0.015
        this.fire.position.z = (Math.random() - 0.5) * 0.015
    }

    // ── Quaternion blend ──────────────────────

    /**
     * Start a smooth rotation toward a target direction.
     * The target direction is computed NOW and stored as a quaternion.
     * Phase handlers must call this at tick===1 (after position is set)
     * OR we call it from _initPhase with a pre-computed direction.
     */
    _beginRotateTo(worldDir) {
        this._quatFrom.copy(this.shipGroup.quaternion)
        this._quatTo.copy(quatLookUp(worldDir))
        this._quatBlendTick = 0
    }

    _tickQuatBlend() {
        if (this._quatBlendTick >= QUAT_BLEND_TICKS) return
        const t = easeInOutCubic(this._quatBlendTick / QUAT_BLEND_TICKS)
        this.shipGroup.quaternion.slerpQuaternions(this._quatFrom, this._quatTo, t)
    }

    // ── Phase management ──────────────────────

    _initPhase(name) {
        // Save camera offset for blending
        this._camOffsetFrom = CAM_RIGS[this.phase]?.offset.clone() ?? null
        this._camBlendTick  = 0

        this.phase          = name
        this.tick           = 0
        this._phaseStartPos = this.shipGroup.position.clone()

        this._updateUI(name)
        console.log(`[ArtemisII] → ${name}`)
    }

    _nextPhase() {
        const idx = PHASE_ORDER.indexOf(this.phase)
        if (idx < PHASE_ORDER.length - 1) {
            this._initPhase(PHASE_ORDER[idx + 1])
        } else {
            this._missionComplete()
        }
    }

    // ─────────────────────────────────────────────
    //  Phase handlers
    // ─────────────────────────────────────────────

    _phase_launch() {
        const t  = this.tick / PHASE_DURATION['launch']
        const st = easeInOutCubic(t)

        const ep = this._earthPos()
        const er = this._earthRadius()

        // Rise along the fixed launch direction (world +Y)
        const radial   = this._launchDir            // (0,1,0)
        const prograde = new THREE.Vector3(1, 0, 0)  // eastward for gravity turn

        const alt   = THREE.MathUtils.lerp(er + 0.05, er + LEO_ALT, st)
        const drift = st * st * 0.8   // horizontal drift, quadratic — slow at first

        this.shipGroup.position
            .copy(ep)
            .addScaledVector(radial,   alt)
            .addScaledVector(prograde, drift)

        // Gradually tilt the nose from straight up toward prograde
        // as altitude increases — classic gravity turn
        const tiltFraction = st * st  // 0 at launch, 1 at LEO entry
        const noseDir = radial.clone()
            .lerp(prograde, tiltFraction * 0.55)
            .normalize()

        // On the very first tick, start the rotation blend toward noseDir.
        // On subsequent ticks, track noseDir with a slow continuous slerp.
        if (this.tick === 1) {
            this._beginRotateTo(noseDir)
        } else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
            const targetQ = quatLookUp(noseDir)
            this.shipGroup.quaternion.slerp(targetQ, 0.02)
        }

        // Scale: rocket appears small far away, grows as camera zooms in.
        // During launch the camera is relatively close, so keep scale ~1.
        const visualScale = THREE.MathUtils.lerp(0.7, 1.0, st)
        this.orientNode.scale.setScalar(visualScale)

        this._animateFire()
        if (Math.random() < 0.65) this._spawnSmoke()
        this._updateSmoke()
    }

    _phase_earth_orbit() {
        const t       = this.tick / PHASE_DURATION['earth-orbit']
        const blendIn = smoothstep(Math.min(t / 0.25, 1))  // 25% blend-in

        const ep = this._earthPos()
        const er = this._earthRadius()
        const r  = er + LEO_ALT

        // Orbit in XZ plane, starting near where the gravity turn left off
        const baseAngle = 0.2
        const angle = baseAngle + t * Math.PI * 4

        const targetPos = new THREE.Vector3(
            ep.x + Math.cos(angle) * r,
            ep.y + Math.sin(angle) * 0.15,
            ep.z + Math.sin(angle) * r
        )

        this.shipGroup.position.lerpVectors(this._phaseStartPos, targetPos, blendIn)
        if (blendIn >= 1) this.shipGroup.position.copy(targetPos)

        // Tangent to the orbit circle
        const tangent = new THREE.Vector3(
            -Math.sin(angle),
             0,
             Math.cos(angle)
        ).normalize()

        if (this.tick === 1) this._beginRotateTo(tangent)
        else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
            this.shipGroup.quaternion.slerp(quatLookUp(tangent), 0.025)
        }

        this.orientNode.scale.setScalar(1)

        this._setFire(t < 0.06)
        if (t < 0.06) this._animateFire()
        this._updateSmoke()
    }

    _phase_tli() {
        const t  = this.tick / PHASE_DURATION['tli']
        const st = easeInOutCubic(t)

        const ep = this._earthPos()
        const mp = this._moonPos()
        const mr = this._moonRadius()

        const p0 = this._phaseStartPos.clone()
        // Target: approach Moon from the direction we're coming from
        const approachDir = p0.clone().sub(mp).normalize()
        const p3 = mp.clone().addScaledVector(approachDir, mr + LUNAR_ALT)

        // Arc bulges away from Earth
        const mid  = p0.clone().lerp(p3, 0.5)
        const away = mid.clone().sub(ep).normalize().multiplyScalar(10)
        const p1   = p0.clone().lerp(mid, 0.5).add(away)
        const p2   = p3.clone().lerp(mid, 0.5).add(away)

        const pos = bezier3(p0, p1, p2, p3, st)
        this.shipGroup.position.copy(pos)

        if (st < 0.995) {
            const ahead   = bezier3(p0, p1, p2, p3, Math.min(st + 0.006, 1))
            const tangent = ahead.clone().sub(pos).normalize()
            if (this.tick === 1) this._beginRotateTo(tangent)
            else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
                this.shipGroup.quaternion.slerp(quatLookUp(tangent), 0.03)
            }
        }

        this.orientNode.scale.setScalar(1)
        this._setFire(t < 0.18)
        if (t < 0.18) this._animateFire(0.2, 0.6)
    }

    _phase_lunar_orbit() {
        const t       = this.tick / PHASE_DURATION['lunar-orbit']
        const blendIn = smoothstep(Math.min(t / 0.20, 1))

        const mp = this._moonPos()
        const mr = this._moonRadius()
        const r  = mr + LUNAR_ALT

        const angle = t * Math.PI * 4

        const targetPos = new THREE.Vector3(
            mp.x + Math.cos(angle) * r,
            mp.y + Math.sin(angle) * 0.1,
            mp.z + Math.sin(angle) * r
        )

        this.shipGroup.position.lerpVectors(this._phaseStartPos, targetPos, blendIn)
        if (blendIn >= 1) this.shipGroup.position.copy(targetPos)

        const tangent = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).normalize()
        if (this.tick === 1) this._beginRotateTo(tangent)
        else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
            this.shipGroup.quaternion.slerp(quatLookUp(tangent), 0.025)
        }

        this.orientNode.scale.setScalar(1)
        this._setFire(false)
        this._updateSmoke()
    }

    _phase_return() {
        const t  = this.tick / PHASE_DURATION['return']
        const st = easeInOutCubic(t)

        const ep = this._earthPos()
        const er = this._earthRadius()

        const p0 = this._phaseStartPos.clone()
        // End point: just above Earth atmosphere, NOT inside the planet
        const approachDir = p0.clone().sub(ep).normalize()
        const p3 = ep.clone().addScaledVector(approachDir, er + 0.38)

        const mid = p0.clone().lerp(p3, 0.5)
        const dip = new THREE.Vector3(0, -5, 0)
        const p1  = p0.clone().lerp(mid, 0.45).add(dip.clone().multiplyScalar(0.4))
        const p2  = p3.clone().lerp(mid, 0.45).add(dip.clone().multiplyScalar(0.4))

        const pos = bezier3(p0, p1, p2, p3, st)
        this.shipGroup.position.copy(pos)

        if (st < 0.995) {
            const ahead   = bezier3(p0, p1, p2, p3, Math.min(st + 0.006, 1))
            const tangent = ahead.clone().sub(pos).normalize()
            if (this.tick === 1) this._beginRotateTo(tangent)
            else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
                this.shipGroup.quaternion.slerp(quatLookUp(tangent), 0.03)
            }
        }

        this.orientNode.scale.setScalar(1)
        this._setFire(t < 0.14)
        if (t < 0.14) this._animateFire(0.2, 0.55)
    }

    _phase_splashdown() {
        const t  = this.tick / PHASE_DURATION['splashdown']
        const st = easeInOutCubic(t)

        const ep  = this._earthPos()
        const er  = this._earthRadius()

        // Radial direction from Earth centre toward where return phase ended
        const radial = this._phaseStartPos.clone().sub(ep).normalize()

        // Exponential deceleration (parachute)
        const altStart  = er + 0.38
        const altEnd    = er + 0.01
        const altFactor = 1 - Math.pow(st, 0.35)
        const alt       = altEnd + (altStart - altEnd) * altFactor

        // Pendulum sway, fading to zero at landing
        const swayAmp = 0.10 * (1 - st)
        const swayA   = Math.sin(t * Math.PI * 8) * swayAmp
        const swayB   = Math.cos(t * Math.PI * 5) * swayAmp * 0.6

        const right   = new THREE.Vector3().crossVectors(radial, new THREE.Vector3(0, 0, 1)).normalize()
        const forward = new THREE.Vector3().crossVectors(right, radial).normalize()

        this.shipGroup.position
            .copy(ep)
            .addScaledVector(radial,   alt)
            .addScaledVector(right,    swayA)
            .addScaledVector(forward,  swayB)

        // Nose points toward Earth during re-entry (heat shield forward)
        const noseDown = radial.clone().negate()
        if (this.tick === 1) this._beginRotateTo(noseDown)
        else if (this._quatBlendTick >= QUAT_BLEND_TICKS) {
            this.shipGroup.quaternion.slerp(quatLookUp(noseDown), 0.04)
        }

        // Rocket appears to grow as camera zooms in during descent
        const visualScale = THREE.MathUtils.lerp(1.0, 1.6, st)
        this.orientNode.scale.setScalar(visualScale)

        // Re-entry heating: peaks at 30%, fades after
        const heat = t < 0.3
            ? smoothstep(t / 0.3)
            : smoothstep(1 - (t - 0.3) / 0.7)

        this._setFire(heat > 0.05)
        if (this._fireOn) {
            // Fire spreads around capsule during heating, shrinks as it cools
            this._animateFire(0.3 + heat * 0.5, 0.2 + heat * 0.4)
            this.fire.position.set(0, heat * 0.1, 0)  // shifts upward as it wraps
        }
    }

    // ── Camera ────────────────────────────────

    _updateCamera() {
        const rig    = CAM_RIGS[this.phase]
        const target = this.shipGroup.position.clone()

        let offset = rig.offset.clone()
        if (this._camOffsetFrom && this._camBlendTick < CAM_BLEND_TICKS) {
            const blend = easeInOutCubic(this._camBlendTick / CAM_BLEND_TICKS)
            offset = this._camOffsetFrom.clone().lerp(rig.offset, blend)
        }

        this.camera.position.lerp(target.clone().add(offset), rig.lerpSpeed)
        this.camera.lookAt(target)
    }

    // ── World-space helpers ────────────────────

    _earthPos()    { const v = new THREE.Vector3(); this.earth.mesh.getWorldPosition(v); return v }
    _moonPos()     { const v = new THREE.Vector3(); this.moon.mesh.getWorldPosition(v);  return v }
    _earthRadius() { return this.earth.mesh.geometry.parameters.radius ?? 1 }
    _moonRadius()  { return this.moon.mesh.geometry.parameters.radius  ?? 0.27 }

    // ── Mission complete ───────────────────────

    _missionComplete() {
        console.log('[ArtemisII] 🎉 Mission complete!')
        if (this._uiLabel) this._uiLabel.textContent = '✅  Artemis II – Mission Complete'
        setTimeout(() => { if (this.shipGroup) this.end() }, 4000)
    }

    // ── HUD ───────────────────────────────────

    _buildUI() {
        const hud = document.createElement('div')
        hud.id = 'artemis-hud'
        Object.assign(hud.style, {
            position:      'absolute',
            top:           '20px',
            left:          '50%',
            transform:     'translateX(-50%)',
            padding:       '10px 26px',
            background:    'rgba(0,0,0,0.65)',
            border:        '1px solid rgba(255,255,255,0.15)',
            borderRadius:  '30px',
            color:         '#fff',
            fontFamily:    'Arial, sans-serif',
            fontSize:      '15px',
            fontWeight:    'bold',
            letterSpacing: '0.03em',
            pointerEvents: 'none',
            zIndex:        '999'
        })
        this._uiLabel = document.createElement('span')
        hud.appendChild(this._uiLabel)
        document.body.appendChild(hud)
        this._hud = hud
    }

    _updateUI(phase) {
        if (this._uiLabel) this._uiLabel.textContent = PHASE_LABELS[phase] ?? phase
    }

    _removeUI() {
        this._hud?.remove()
        this._hud = this._uiLabel = null
    }
}