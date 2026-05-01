import * as THREE from 'three'
import { SimulationSettings } from '../systems/simulationSettings.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

export class ArtemisII {

    constructor(solarSystem) {
        this.solarSystem = solarSystem
    }

    start(scene, camera) {
        this.scene = scene
        this.camera = camera
        this.time = 0
        SimulationSettings.missionMode = true
        SimulationSettings.timeScale = 0.05
        this.earth = this.solarSystem.objects.find(
            obj => obj.name === 'Earth'
        )

        // Parameters for the mission phases
        this.phase = 'launch'
        this.velocity = 0
        this.acceleration = 0.00025
        this.maxVelocity = 0.002

        // Load the Artemis II model
        const loader = new GLTFLoader()
        const draco = new DRACOLoader()
        draco.setDecoderPath('/draco/')
        loader.setDRACOLoader(draco)

        this.ship = new THREE.Object3D()

        loader.load('/models/artemis.glb', (gltf) => {

            this.model = gltf.scene

            this.model.scale.set(0.02, 0.02, 0.02)

            // Orientación vertical (muy importante)
            this.model.rotation.x = Math.PI / 2

            this.ship.add(this.model)
        })

        // Initial position just above Earth
        this.ship.position.set(0, 1.2, 0)

        // Add fire effect
        const textureLoader = new THREE.TextureLoader()

        this.fireTexture = textureLoader.load('/textures/fire.jpg')

        const fireMaterial = new THREE.SpriteMaterial({
            map: this.fireTexture,
            transparent: true,
            depthWrite: false
        })

        this.fire = new THREE.Sprite(fireMaterial)

        // Scale to make it look like a flame
        this.fire.scale.set(0.5, 1.5, 1)

        // Position it at the base of the rocket
        this.fire.position.set(0, -0.8, 0)

        this.ship.add(this.fire)

        // Smoke particles effect
        this.smokeParticles = []

        const smokeTexture = textureLoader.load('/textures/smoke.png')

        this.smokeMaterial = new THREE.SpriteMaterial({
            map: smokeTexture,
            transparent: true,
            opacity: 0.5,
            depthWrite: false
        })

        this.earth.pivot.add(this.ship)
    }

    update() {

        this.time += 0.01
    
        // Phase 1: Launch
        if (this.phase === 'launch') {

            // Progressive acceleration
            this.velocity += this.acceleration
        
            // Limit max velocity
            if (this.velocity > this.maxVelocity) {
                this.velocity = this.maxVelocity
            }
        
            // Vertical movement
            this.ship.position.y += this.velocity
        
            // Gravity turn
            const tiltStart = 1.5
            const tiltEnd = 6
        
            if (this.ship.position.y > tiltStart) {
                const t = Math.min(
                    (this.ship.position.y - tiltStart) / (tiltEnd - tiltStart),
                    1
                )
        
                this.ship.rotation.z = -t * 0.5
            }
        
            // Small drift to simulate atmospheric effects
            const drift = this.velocity * 0.3
            this.ship.position.x += drift
        
            // Transition to orbit phase
            if (this.ship.position.y > 2) {
                this.phase = 'orbit'
                this.orbitAngle = 0
            }

            // Flame animation
            const scale = 1 + Math.sin(this.time * 20) * 0.2
            this.fire.scale.set(0.5 * scale, 1.5 * scale, 1)

            // Slight random movement to make it look more dynamic
            this.fire.position.x = (Math.random() - 0.5) * 0.05
            this.fire.position.z = (Math.random() - 0.5) * 0.05

            // Generate smoke particles with a certain probability
            if (Math.random() < 0.6) {

                const smoke = new THREE.Sprite(this.smokeMaterial.clone())

                smoke.scale.set(0.5, 0.5, 0.5)

                // Position it at the base of the rocket with some random offset
                smoke.position.set(
                    (Math.random() - 0.5) * 0.3,
                    -1,
                    (Math.random() - 0.5) * 0.3
                )

                this.ship.add(smoke)

                this.smokeParticles.push({
                    sprite: smoke,
                    life: 1
                })
            }

            // Update smoke particles
            this.smokeParticles.forEach((p, i) => {

                p.life -= 0.01

                p.sprite.position.y -= 0.02

                p.sprite.material.opacity = p.life

                p.sprite.scale.multiplyScalar(1.01)

                if (p.life <= 0) {
                    this.ship.remove(p.sprite)
                    this.smokeParticles.splice(i, 1)
                }
            })
        }

        // Phase 2: Orbit
        if (this.phase === 'orbit') {

            this.orbitAngle += 0.02
    
            const r = 5
    
            const x = Math.cos(this.orbitAngle) * r
            const z = Math.sin(this.orbitAngle) * r
    
            this.ship.position.set(x, 0, z)
    
            this.ship.lookAt(0, 0, 0)
        }

        // Camera follows the ship
        const target = new THREE.Vector3()
        this.ship.getWorldPosition(target)

        const camPos = target.clone().add(new THREE.Vector3(2, 2, 2))

        this.camera.position.lerp(camPos, 0.05)
        this.camera.lookAt(target)
    }

    end(scene) {
        SimulationSettings.missionMode = false
        if (this.ship && this.ship.parent) {
            this.ship.parent.remove(this.ship)
        }
    
        this.ship = null

        SimulationSettings.timeScale = 1
    }
}