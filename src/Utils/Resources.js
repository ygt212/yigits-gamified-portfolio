import EventEmitter from './EventEmitter.js'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        // Sources to load
        this.sources = sources

        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0

        this.setLoaders()

        // If nothing to load, trigger ready immediately
        if (this.toLoad === 0) {
            setTimeout(() => {
                this.trigger('ready')
            }, 100)
        } else {
            this.startLoading()
        }
    }

    setLoaders() {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.fbxLoader = new FBXLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
    }

    startLoading() {
        for (const source of this.sources) {
            if (source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if (source.type === 'fbxModel') {
                this.loaders.fbxLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file

        // 🗑️ MEMORY FIX: Release raw parser data to free up RAM
        if (file.parser) {
            file.parser = null
        }
        this.loaded++

        // --- PROGRESS EVENT ---
        const ratio = this.loaded / this.toLoad
        this.trigger('progress', [ratio])

        if (this.loaded === this.toLoad) {
            this.trigger('ready')
        }
    }
}
