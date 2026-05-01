export class MissionSystem {
    constructor(scene, camera) {
        this.scene = scene
        this.camera = camera
        this.activeMission = null
    }

    start(mission) {
        this.activeMission = mission
        this.activeMission.start(this.scene, this.camera)
    }

    stop() {
        if (!this.activeMission) return
        this.activeMission.end(this.scene)
        this.activeMission = null
    }

    update() {
        if (this.activeMission) {
            this.activeMission.update()
        }
    }
}