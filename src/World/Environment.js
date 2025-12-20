import * as THREE from 'three'
import Experience from '../Core/Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.setSunLight()
        this.setCity()
        this.setEnvironment()
    }

    setSunLight() {
        // Daylight Sun
        this.sunLight = new THREE.DirectionalLight('#fffacd', 3) // LemonChiffon (warm white)
        this.sunLight.castShadow = true

        // High Quality Shadows
        this.sunLight.shadow.mapSize.set(2048, 2048)
        this.sunLight.shadow.normalBias = 0.05

        // Frustum Customization to cover scene
        this.sunLight.shadow.camera.far = 200
        this.sunLight.shadow.camera.left = -20
        this.sunLight.shadow.camera.right = 20
        this.sunLight.shadow.camera.top = 20
        this.sunLight.shadow.camera.bottom = -20

        // Position: Sun position
        this.sunLight.position.set(-50, 100, 35)
        this.scene.add(this.sunLight)

        // Bright Ambient Light for Day
        this.ambientLight = new THREE.AmbientLight('#ffffff', 0.9)
        this.scene.add(this.ambientLight)

        // Fixed Offset for Shadow Following (Player.js reads this)
        this.sunOffset = { x: 50, y: 100, z: -35 }
    }

    setCity() {
        this.city = this.resources.items.city.scene
        this.city.position.set(0, -1, 0)

        this.city.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
            }
        })

        this.scene.add(this.city)


    }

    setEnvironment() {
        // Sky Blue Background and Fog
        const skyColor = '#87CEEB'
        this.scene.background = new THREE.Color(skyColor)
        this.scene.fog = new THREE.Fog(skyColor, 10, 50)
    }
}
