import EventEmitter from '../Utils/EventEmitter.js'
// import nipplejs from 'nipplejs' // Using CDN

export default class Input extends EventEmitter {
    constructor() {
        super()

        // Device Detection
        this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0

        // Setup
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            interact: false,
            dance: false
        }

        // Output Vector (x, y) - Normalized -1 to 1
        this.move = { x: 0, y: 0 }

        // Listeners
        window.addEventListener('keydown', (event) => {
            this.handleKey(event.code, true)
        })

        window.addEventListener('keyup', (event) => {
            this.handleKey(event.code, false)
        })

        if (this.isMobile) {
            this.initJoystick()
        }
        this.initInteractButton()
        this.initDanceButton()
    }

    handleKey(code, pressed) {
        switch (code) {
            case 'ArrowUp':
            case 'KeyW':
                this.keys.forward = pressed
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = pressed
                break
            case 'ArrowDown':
            case 'KeyS':
                this.keys.backward = pressed
                break
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = pressed
                break
            case 'Space':
            case 'KeyE':
                this.keys.interact = pressed
                if (pressed) this.trigger('interact')
                break
            case 'KeyM':
                this.keys.dance = pressed
                if (pressed) this.trigger('dance')
                break
        }
        this.updateMoveVector()
    }

    updateMoveVector() {
        // Basic keyboard vector
        this.move.x = 0
        this.move.y = 0

        if (this.keys.left) this.move.x -= 1
        if (this.keys.right) this.move.x += 1
        if (this.keys.forward) this.move.y -= 1 // Forward in 3D is usually -Z
        if (this.keys.backward) this.move.y += 1
    }

    initJoystick() {
        // @ts-ignore
        if (typeof nipplejs === 'undefined') return

        const zone = document.getElementById('joystick-zone')
        if (zone) zone.style.display = 'block'

        this.joystick = nipplejs.create({
            zone: zone,
            mode: 'static',
            position: { left: '50%', top: '50%' },
            color: 'white'
        })

        this.joystick.on('move', (evt, data) => {
            if (data && data.vector) {
                // Determine direction based on vector
                // Threshold 0.3 to avoid accidental movement
                this.keys.forward = data.vector.y > 0.3
                this.keys.backward = data.vector.y < -0.3
                this.keys.right = data.vector.x > 0.3
                this.keys.left = data.vector.x < -0.3

                this.updateMoveVector()
            }
        })

        this.joystick.on('end', () => {
            this.keys.forward = false
            this.keys.backward = false
            this.keys.right = false
            this.keys.left = false

            this.updateMoveVector()
        })
    }

    initInteractButton() {
        const btn = document.getElementById('interact-button')
        // Touch events for responsiveness
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault() // prevent mouse emulation
            this.keys.interact = true
            this.trigger('interact')
        })
        btn.addEventListener('touchend', (e) => {
            e.preventDefault()
            this.keys.interact = false
        })

        // Mouse fallback for testing mobile view on desktop
        btn.addEventListener('mousedown', () => {
            this.keys.interact = true
            this.trigger('interact')
        })
        btn.addEventListener('mouseup', () => {
            this.keys.interact = false
        })
    }

    initDanceButton() {
        const btn = document.getElementById('dance-btn')
        if (!btn) return

        btn.addEventListener('touchstart', (e) => {
            e.preventDefault()
            this.trigger('dance')
        }, { passive: false })

        btn.addEventListener('click', (e) => {
            e.preventDefault()
            this.trigger('dance')
        })
    }
}
