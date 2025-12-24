import * as THREE from 'three'
import Experience from '../Core/Experience.js'

export default class Player {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.input = this.experience.input
        this.camera = this.experience.camera

        this.setGeometry()
        this.setCamera()



        // Debug (Temporary for Development)
        if (this.experience.debug.active) {
            this.debugFolder = this.experience.debug.ui.addFolder('Tools')
        }
    }

    setGeometry() {
        this.model = this.resources.items.idle.scene
        this.model.scale.set(1, 1, 1) // Adjust scale
        this.scene.add(this.model)

        this.model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        // Animations
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        // Actions
        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.resources.items.idle.animations[0])
        this.animation.actions.run = this.animation.mixer.clipAction(this.resources.items.run.animations[0])
        this.animation.actions.dance = this.animation.mixer.clipAction(this.resources.items.dance.animations[0])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Initialize other actions
        this.animation.actions.run.play()
        this.animation.actions.run.enabled = false
        this.animation.actions.run.setEffectiveTimeScale(1.3)

        this.animation.actions.dance.play()
        this.animation.actions.dance.enabled = false

        this.mesh = this.model
        this.mesh.position.set(-7.2864552749245055, -3.9893983135116287, -62.26303966168708)

        // Interaction
        this.canMove = true
        this.isDancing = false

        // Listen for dance
        this.input.on('dance', () => {
            const isMoving = this.input.move.x !== 0 || this.input.move.y !== 0
            if (!isMoving) {
                this.isDancing = !this.isDancing
            }
        })

    }



    setCamera() {
        // Fixed Camera Offset (180 degrees)
        this.cameraOffset = new THREE.Vector3(0, 5.5, -10)
    }

    update() {
        const speedMultiplier = 0.005 * this.time.delta

        // Safety Check
        if (this.experience.world.environment) {
            const cityModel = this.experience.world.environment.city // Using 'city' based on Environment.js

            if (!cityModel) {
                // If model not loaded, skip complex update or return
                // But we want to allow movement even if model is not there for testing
            }
        }

        // Movement Logic
        if (!this.canMove) return

        let moving = false
        const direction = new THREE.Vector3()

        // Movement
        if (this.input.move.x !== 0 || this.input.move.y !== 0) {
            moving = true
            this.isDancing = false // Cancel dance on move

            // 1. Get Camera Direction (Forward)
            const cameraDirection = new THREE.Vector3()
            this.camera.instance.getWorldDirection(cameraDirection)
            cameraDirection.y = 0 // Flatten to XZ plane
            cameraDirection.normalize()

            // 2. Get Camera Right Vector
            const cameraRight = new THREE.Vector3()
            cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0))

            // 3. Map Input to Vectors
            direction.addScaledVector(cameraRight, this.input.move.x)
            direction.addScaledVector(cameraDirection, -this.input.move.y) // Invert Y because Input Forward is -1

            direction.normalize() // Consistent speed
            direction.multiplyScalar(speedMultiplier)

            // Collision & Boundary Logic
            let blocked = false

            // 1. Wall Collision (Smart Raycast)
            if (this.experience.world.environment && this.experience.world.environment.city) {
                if (!this.raycaster) this.raycaster = new THREE.Raycaster()

                // Ray origin: Waist/Knee height (0.5) to catch fences but avoid ground bumps
                const rayOrigin = this.mesh.position.clone().add(new THREE.Vector3(0, 0.5, 0))
                const rayDirection = direction.clone().normalize()

                this.raycaster.set(rayOrigin, rayDirection)
                this.raycaster.far = 1.0

                const intersectObjects = this.experience.world.environment.city.children
                const intersects = this.raycaster.intersectObjects(intersectObjects, true)

                if (intersects.length > 0) {
                    // Smart Filter: Check Surface Normal
                    const hitNormal = intersects[0].face.normal;

                    // If normal.y > 0.5, it's a floor or slope -> ALLOW
                    // If normal.y <= 0.5, it's a wall or tree -> BLOCK
                    if (hitNormal.y <= 0.5) {
                        blocked = true
                    } else {
                        // It matches a floor, ensure we are NOT blocked based on this hit
                        // blocked = false; // already false by default, but essentially: do nothing
                    }
                }
            } // End of Collision Check

            // 2. World Boundary Check
            const nextPosition = this.mesh.position.clone().add(direction)


            // Apply Position if not blocked
            if (!blocked) {
                this.mesh.position.add(direction)

                // Map Boundaries
                const BOUNDS = { minX: -26.96, maxX: 26.54, minZ: -103.54, maxZ: 14.89 }
                this.mesh.position.x = Math.min(Math.max(this.mesh.position.x, BOUNDS.minX), BOUNDS.maxX)
                this.mesh.position.z = Math.min(Math.max(this.mesh.position.z, BOUNDS.minZ), BOUNDS.maxZ)
            }

            // Rotation (Smooth LookAt)
            const targetPosition = this.mesh.position.clone().add(direction)
            const targetQuaternion = new THREE.Quaternion()
            const rotationMatrix = new THREE.Matrix4()
            rotationMatrix.lookAt(targetPosition, this.mesh.position, this.mesh.up)
            targetQuaternion.setFromRotationMatrix(rotationMatrix)

            this.mesh.quaternion.slerp(targetQuaternion, 0.1)
        }

        // Raycaster for Ground Detection
        if (this.experience.world.environment && this.experience.world.environment.city) {
            const rayOrigin = new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 2, this.mesh.position.z)
            const rayDirection = new THREE.Vector3(0, -1, 0)

            if (!this.raycaster) this.raycaster = new THREE.Raycaster()

            this.raycaster.far = 10
            this.raycaster.set(rayOrigin, rayDirection)

            const intersectObjects = [this.experience.world.environment.city]
            const intersects = this.raycaster.intersectObjects(intersectObjects, true)

            if (intersects.length > 0) {
                // Find the first intersection that is below the ray origin
                // Since we cast down, usually the first one is the ground
                const targetY = intersects[0].point.y
                // Smooth transition (Lerp)
                this.mesh.position.y = THREE.MathUtils.lerp(this.mesh.position.y, targetY, 0.2)
            } else {
                // No Ground Detected (Void/Sky)
                // If we moved into a void, revert the movement immediately
                if (moving) {
                    this.mesh.position.sub(direction)
                }
            }
        }

        // Animation State Machine
        if (this.animation.mixer) {
            let newAction = this.animation.actions.idle

            if (moving) {
                newAction = this.animation.actions.run
            }
            else if (this.isDancing) {
                newAction = this.animation.actions.dance
            }

            if (this.animation.actions.current !== newAction) {
                const oldAction = this.animation.actions.current
                this.animation.actions.current = newAction

                // Reset new action if not running
                if (!this.animation.actions.current.enabled) {
                    this.animation.actions.current.enabled = true
                    this.animation.actions.current.time = 0
                    this.animation.actions.current.setEffectiveTimeScale(1)
                    this.animation.actions.current.setEffectiveWeight(1)
                }

                // Crossfade
                newAction.reset()
                newAction.play()
                if (oldAction) oldAction.crossFadeTo(newAction, 0.2)
            }

            this.animation.mixer.update(this.time.delta * 0.001)
        }

        // Camera Follow
        const cameraOffset = new THREE.Vector3(0, 3.75, -8.75)
        this.camera.instance.position.copy(this.mesh.position).add(cameraOffset)
        this.camera.instance.lookAt(this.mesh.position.x, this.mesh.position.y + 1, this.mesh.position.z)

        // 4. Sun Shadow Follow
        const sunLight = this.experience.world.environment?.sunLight
        const sunOffset = this.experience.world.environment?.sunOffset

        if (sunLight) {
            if (sunOffset) {
                sunLight.position.x = this.mesh.position.x + sunOffset.x
                sunLight.position.y = this.mesh.position.y + sunOffset.y
                sunLight.position.z = this.mesh.position.z + sunOffset.z
            } else {
                // Fallback
                sunLight.position.x = this.mesh.position.x + 50
                sunLight.position.z = this.mesh.position.z - 50
            }
            sunLight.target.position.copy(this.mesh.position)
            sunLight.target.updateMatrixWorld()
        }
    }
}
