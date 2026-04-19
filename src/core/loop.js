// src/core/loop.js

export function createLoop(renderer, scene, camera) {
    const updatables = []
  
    function add(object) {
        updatables.push(object)
    }
  
    function start() {
        renderer.setAnimationLoop(() => {
            // Update all registered objects
            for (const obj of updatables) {
                if (obj.update) {
                    obj.update()
                }
            }
  
            renderer.render(scene, camera)
        })
    }
  
    return { start, add }
}