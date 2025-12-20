import * as THREE from 'three'
import Sizes from './Sizes.js'
import Time from '../Utils/Time.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from '../World/World.js'
import Resources from '../Utils/Resources.js'
import Input from './Input.js'
import Debug from '../Utils/Debug.js'

let instance = null

export default class Experience {
    constructor(canvas) {
        // Singleton
        if (instance) {
            return instance
        }
        instance = this

        // Global access
        window.experience = this

        // Options
        this.canvas = canvas

        // Setup
        this.debug = new Debug()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        const sources = [
            {
                name: 'idle',
                type: 'gltfModel',
                path: 'models/idle.glb'
            },
            {
                name: 'run',
                type: 'gltfModel',
                path: 'models/run.glb'
            },
            {
                name: 'dance',
                type: 'gltfModel',
                path: 'models/dance.glb'
            },
            {
                name: 'city',
                type: 'gltfModel',
                path: 'models/city.glb'
            },
            {
                name: 'npcModel',
                type: 'gltfModel',
                path: 'models/avatar.glb'
            },
            {
                name: 'posterModel',
                type: 'gltfModel',
                path: 'models/poster.glb'
            },
            {
                name: 'sittingNpcModel',
                type: 'fbxModel',
                path: 'models/sitting_idle.fbx'
            }
        ]

        this.resources = new Resources(sources)
        this.input = new Input()
        this.camera = new Camera()
        this.renderer = new Renderer()
        this.world = new World()

        // Sizes resize event
        this.sizes.on('resize', () => {
            this.resize()
        })

        // Time tick event
        this.time.on('tick', () => {
            this.update()
        })

        // Loading State
        this.loadingProgress = 0
        this.currentProgress = 0
        this.isLoadingComplete = false

        // Listen for progress to update the loading bar
        this.resources.on('progress', (ratio) => {
            this.loadingProgress = ratio
        })

        // Listen for resources ready logic
        this.resources.on('ready', () => {
            // Just mark as ready, visual transition is handled in update loop
            this.loadingProgress = 1


        })

        // Setup Enter Button
        const enterBtn = document.getElementById('enter-button')
        if (enterBtn) {
            enterBtn.addEventListener('click', () => {
                const loadingOverlay = document.querySelector('.loading-overlay')
                if (loadingOverlay) {
                    loadingOverlay.classList.add('ended')
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none'
                    }, 1500)

                    // Optional: Try to start music if paused (Browser policy might allow now)
                    const bgMusic = document.getElementById('bg-music')
                    if (bgMusic && bgMusic.paused) {
                        // User interaction occurred, we can try hints or just let them use the toggle
                    }
                }
            })
        }
    }

    resize() {
        this.camera.resize()
        this.renderer.resize()
    }

    update() {
        this.camera.update()
        this.world.update()
        this.renderer.update()

        // --- Loading Screen Logic ---
        if (!this.isLoadingComplete) {
            // Interpolate progress (Slower visual update)
            if (this.currentProgress < this.loadingProgress) {
                this.currentProgress += (this.loadingProgress - this.currentProgress) * 0.03
                if (this.currentProgress > 0.999) this.currentProgress = 1
            }

            const progressFill = document.getElementById('progress-bar')
            const progressText = document.getElementById('progress-percentage')

            if (progressFill) progressFill.style.width = `${this.currentProgress * 100}%`
            if (progressText) progressText.innerText = `${Math.round(this.currentProgress * 100)}%`

            // Check Completion
            if (this.currentProgress === 1) {
                this.isLoadingComplete = true

                // Show Enter Button
                const progressContainer = document.querySelector('.progress-container')
                const enterBtn = document.getElementById('enter-button')
                const loadingText = document.querySelector('.loading-text')

                if (progressContainer) progressContainer.style.display = 'none'
                if (progressText) progressText.style.display = 'none'
                if (loadingText) loadingText.innerText = 'Şehir Hazır!'
                if (enterBtn) enterBtn.classList.remove('hidden')
            }
        }
    }
}
