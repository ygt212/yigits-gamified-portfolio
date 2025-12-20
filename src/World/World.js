import * as THREE from 'three'
import Experience from '../Core/Experience.js'
import Environment from './Environment.js'
import Player from './Player.js'
import InteractionManager from './InteractionManager.js'

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Mixers array for animations
        this.mixers = []

        // Wait for resources
        this.resources.on('ready', () => {
            // Setup
            this.environment = new Environment()
            this.player = new Player()
            this.createNPC()
            this.createSittingNPC()
            this.createPoster()
            this.interactionManager = new InteractionManager()
        })
    }

    createNPC() {
        const resource = this.resources.items.npcModel
        this.npc = resource.scene

        this.npc.scale.set(1, 1, 1)
        this.npc.position.set(-2.42, -3.99, -49.81)
        this.npc.rotation.y = Math.PI // Face the player (approx)

        this.npc.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.npc)

        // NPC Animation
        if (resource.animations && resource.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(this.npc)
            const action = mixer.clipAction(resource.animations[0])
            action.play()
            this.mixers.push(mixer)
        }
    }

    createPoster() {
        const resource = this.resources.items.posterModel
        this.poster = resource.scene

        this.poster.scale.set(0.15, 0.15, 0.15)
        this.poster.position.set(-14.130, -2.700, -10.000)
        this.poster.rotation.y = 6.283

        this.poster.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.poster)
    }

    createSittingNPC() {
        const resource = this.resources.items.sittingNpcModel
        this.sittingNPC = resource.scene || resource

        this.sittingNPC.scale.set(12.5, 12.5, 12.5)
        this.sittingNPC.position.set(-1.340, -3.830, -24.650)
        // Default Rotation 
        this.sittingNPC.rotation.y = 3.142

        this.sittingNPC.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.sittingNPC)

        // Sitting NPC Animation
        if (resource.animations && resource.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(this.sittingNPC)
            const action = mixer.clipAction(resource.animations[0])
            action.play()
            this.mixers.push(mixer)
        }
    }

    update() {
        if (this.player)
            this.player.update()

        if (this.interactionManager)
            this.interactionManager.update()

        // Update all mixers
        if (this.mixers) {
            this.mixers.forEach(mixer => mixer.update(this.experience.time.delta * 0.001))
        }
    }

}
