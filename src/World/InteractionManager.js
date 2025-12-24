import * as THREE from 'three'
import Experience from '../Core/Experience.js'

export default class InteractionManager {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.player = this.experience.world.player
        this.input = this.experience.input

        // Dialogue Data
        // Dialogue Data
        this.npcDialogue = {
            // 1. AÇILIŞ (Giriş)
            start: {
                text: "Selam! 👋 Yiğit'in oyunlaştırılmış portföyüne hoş geldin. Seni hangi rüzgar attı buraya?",
                choices: [
                    { label: "Burası tam olarak neresi?", next: "location_info" },
                    { label: "Yiğit kim? Ondan bahset.", next: "identity_info" },
                    { label: "Projelerini nerede görebilirim?", next: "projects_hint" },
                    { label: "Sadece geziyorum, sağ ol.", next: "end" }
                ]
            },

            // 2. MEKAN BİLGİSİ (Mevcut)
            location_info: {
                text: "Burası Yiğit'in portfolyosu ama sıkıcı sayfalar yerine yaşayan bir şehir. Vizyonunu ve yeteneklerini burada 3D olarak deneyimleyebilirsin.",
                choices: [
                    { label: "Anladım. Peki Yiğit kim?", next: "identity_info" },
                    { label: "Ana menüye dön.", next: "start" }
                ]
            },

            // 3. KİMLİK (Yiğit Hakkında)
            identity_info: {
                text: "Yiğit buranın kurucusu. 22 yaşında ama birkaç aya 23 olur. 😄 Bu sene mezun oluyor. Son zamanlarda kendini 'Vibe Coding'e kaptırdı. Yani kodları sadece yazmıyor, onları bir akış içinde hissederek geliştiriyor. Burayı da kendini tanıtmak için sıfırdan kurdu.",
                choices: [
                    { label: "Vibe Coding mi? Havalıymış. Projeleri nerede?", next: "projects_hint" },
                    { label: "Teşekkürler, geri dön.", next: "start" }
                ]
            },

            // 4. PROJE YERİ TARİFİ (Stadın Arkası)
            projects_hint: {
                text: "Projeler için biraz yürümen gerekecek. Stadın hemen arkasındaki ağaçlardan birine bir poster astı. Tüm işlerini orada sergiliyor.",
                choices: [
                    { label: "Bana yolu gösterir misin? (Navigasyon Başlat)", next: "end", action: "startPath" },
                    { label: "Tarif için sağ ol, ben bulurum.", next: "end" }
                ]
            },

            // 5. POSTER İNCELEME
            poster_view: {
                speaker: "Proje Posteri",
                type: "project_list",
                text: "(Poster İnceleniyor...)\n\n📜 YİĞİT'İN PROJELERİ",
                footer: "\nEğer onu daha detaylı tanımak isterseniz stadın içindeki adamla konuşabilirsiniz.",
                projects: [
                    {
                        name: "1. Oyunlaştırılmış Portfoy Dünyası (Three.js)",
                        githubLink: "https://github.com/ygt212/yigits-gamified-portfolio"
                    },
                    {
                        name: "2. Yapay Zeka Destekli Veri Madenciliği Sistemi",
                        githubLink: "https://github.com/ygt212/ai-powered-data-mining-agent"
                    },
                    { name: "3. Öğrenci - Hoca Atama Algoritması (Matematiksel Model)" },
                    { name: "4. TÜBİTAK Kadın Cinayetleri Veri Madenciliği [Üzerinde Çalışılıyor...]" }
                ],
                choices: [
                    { label: "İncelemeyi Bitir", next: "end" }
                ]
            },

            // --- NEYMAR (OTURAN NPC) ---
            sitting_neymar: {
                npcName: "Neymar da Silva Santos", // İsim güncellemesi için
                text: "Selamlar! 🤙 Maçtan sonra biraz kafa dinlemeye geldim. Yiğit'in kurduğu bu dünya gerçekten klas hareketlerle dolu.",
                choices: [
                    { label: "Bu dünya nasıl kuruldu?", next: "tech_explain" },
                    { label: "Yiğit ile iletişime geçmek istiyorum.", next: "contact_links" },
                    { label: "İyi dinlenmeler.", next: "end" }
                ]
            },
            tech_explain: {
                npcName: "Neymar da Silva Santos",
                text: "Tam bir oyun kurucu vizyonu! ⚽\nBu evren Three.js ve WebGL teknolojileriyle sıfırdan kodlandı. Blender'da modeller hazırlandı, JavaScript ile fizik ve etkileşimler eklendi. Yani gördüğün her pikselde Yiğit'in o meşhur 'Vibe Coding' imzası var.",
                choices: [
                    { label: "Çok iyi. Peki ona nasıl ulaşırım?", next: "contact_links" },
                    { label: "Anladım, sağ ol.", next: "end" }
                ]
            },
            contact_links: {
                npcName: "Neymar da Silva Santos",
                text: "Ona ulaşmak için en iyi kanallar burada. Pası sana atıyorum, golü sen at! 👇",
                choices: [
                    { label: "GitHub (Kodlarım) 💻", action: "openGithub", next: "end" },
                    { label: "LinkedIn", action: "openLinkedin", next: "end" },
                    { label: "Instagram", action: "openInstagram", next: "end" },
                    { label: "Vazgeçtim.", next: "end" }
                ]
            }
        }

        // Interaction Points
        this.points = [
            {
                position: new THREE.Vector3(-2.42, -3.09, -49.81),
                label: "Konuşmak için [E] bas",
                action: () => {
                    this.startDialogue('start')
                }
            },
            {
                position: new THREE.Vector3(-14.07, -4.21, -10.85),
                label: "Posteri İncele [E]",
                action: () => {
                    this.startDialogue('poster_view')
                }
            },
            {
                position: new THREE.Vector3(-1.340, -3.830, -24.650),
                label: "Konuşmak için [E] bas",
                action: () => {
                    this.startDialogue('sitting_neymar')
                }
            }
        ]

        this.interactionPoints = []
        this.interactionPoints = []
        this.activePoint = null
        this.currentInteractionAction = null // For touch support

        this.setUI()
        this.createInteractionPoints()

        // Interaction Event
        this.input.on('interact', () => {
            if (this.activePoint) {
                this.activePoint.data.action()
            }
        })
    }

    setUI() {
        this.ui = {
            panel: document.getElementById('interaction-panel'),
            label: document.getElementById('interaction-label'),
            // Dialogue UI
            dialogueContainer: document.getElementById('dialogue-container'),
            npcName: document.getElementById('npc-name'),
            npcText: document.getElementById('npc-text'),
            optionsGrid: document.getElementById('dialogue-options'),
            closeBtn: document.getElementById('close-dialogue')
        }

        // Dialogue Close Event
        if (this.ui.closeBtn) {
            this.ui.closeBtn.addEventListener('click', () => {
                this.closeDialogue()
            })
        }

        // --- Touch/Click Support for Mobile Bubble ---
        if (this.ui.panel) {
            this.ui.panel.addEventListener('click', (e) => {
                if (this.currentInteractionAction) {
                    this.currentInteractionAction()
                }
            })

            this.ui.panel.addEventListener('touchstart', (e) => {
                e.preventDefault() // Prevent zoom/delay
                if (this.currentInteractionAction) {
                    this.currentInteractionAction()
                }
            }, { passive: false })
        }
    }

    startDialogue(key) {
        if (key === 'end') {
            this.closeDialogue()
            return
        }

        const data = this.npcDialogue[key]
        if (!data) return

        // Show UI
        this.ui.dialogueContainer.classList.remove('hidden')

        // Set Name (Default or Custom)
        const nameEl = document.getElementById('npc-name');
        if (data.npcName) {
            nameEl.innerText = data.npcName;
        } else if (data.speaker) {
            nameEl.innerText = data.speaker;
        } else {
            nameEl.innerText = "Rehber"; // Default name
        }

        // Clear Options (Wait for typing or render immediately)
        this.ui.optionsGrid.innerHTML = ''

        // --- Custom Render for Projects ---
        if (data.type === 'project_list' && data.projects) {
            // 1. Önce Daktilo Efekti ile metni yaz
            this.typeWriter(data.text, () => {
                // 2. Daktilo bitince burası çalışır: Projeleri Hazırla
                const projectsContainer = document.createElement('div')
                projectsContainer.style.marginTop = '15px'
                projectsContainer.style.opacity = '0'
                projectsContainer.style.transition = 'opacity 0.8s ease-in'

                // Render Projects and Button (Turkish)
                data.projects.forEach(proj => {
                    const item = document.createElement('div')
                    item.style.marginBottom = '12px'
                    item.innerText = proj.name

                    if (proj.githubLink) {
                        const btn = document.createElement('a')
                        btn.href = proj.githubLink
                        btn.target = '_blank'
                        btn.innerText = ' Github Üzerinden İncele 🔗'
                        // Button Styles
                        btn.style.display = 'inline-block'
                        btn.style.marginLeft = '10px'
                        btn.style.fontSize = '0.8rem'
                        btn.style.color = '#00ffcc'
                        btn.style.textDecoration = 'none'
                        btn.style.border = '1px solid #00ffcc'
                        btn.style.padding = '2px 8px'
                        btn.style.borderRadius = '12px'
                        btn.style.pointerEvents = 'auto'
                        btn.style.cursor = 'pointer'
                        btn.style.transition = 'all 0.3s'

                        // Hover effect
                        btn.onmouseover = () => {
                            btn.style.background = 'rgba(0, 255, 204, 0.1)'
                        }
                        btn.onmouseout = () => {
                            btn.style.background = 'transparent'
                        }

                        item.appendChild(btn)
                    }
                    projectsContainer.appendChild(item)
                })

                // Render Footer inside container if exists
                if (data.footer) {
                    const footer = document.createElement('div')
                    footer.innerText = data.footer
                    footer.style.marginTop = '15px'
                    footer.style.fontSize = '0.9em'
                    footer.style.color = '#ccc'
                    projectsContainer.appendChild(footer)
                }

                // Append to DOM
                this.ui.npcText.appendChild(projectsContainer)

                // Trigger Fade-In
                requestAnimationFrame(() => {
                    projectsContainer.style.opacity = '1'
                })

                // Show choices
                this.createChoiceButtons(data.choices)
            })

        } else {
            // Standard Typewriter
            this.typeWriter(data.text, () => {
                this.createChoiceButtons(data.choices)
            })
        }

        // Disable movement while talking
        if (this.player) this.player.canMove = false
    }

    createChoiceButtons(choices) {
        choices.forEach(choice => {
            const btn = document.createElement('button')
            btn.className = 'dialogue-btn'
            btn.innerText = choice.label
            btn.addEventListener('click', () => {
                if (choice.action === "startPath") {
                    this.createNavigationPath()
                }
                if (choice.action === 'openLinkedin') {
                    window.open('https://www.linkedin.com/in/talha-yi%C4%9Fit-y%C4%B1ld%C4%B1r%C4%B1m-9aa84a27a/', '_blank');
                }
                if (choice.action === 'openInstagram') {
                    window.open('https://www.instagram.com/yigityyildirm/', '_blank');
                }
                if (choice.action === 'openGithub') {
                    window.open("https://github.com/ygt212", "_blank");
                }
                this.startDialogue(choice.next)
            })
            this.ui.optionsGrid.appendChild(btn)
        })
    }

    typeWriter(text, callback) {
        const element = this.ui.npcText
        element.innerHTML = ""
        let i = 0

        // Clear old interval
        if (this.typingInterval) clearInterval(this.typingInterval)

        this.typingInterval = setInterval(() => {
            element.innerHTML += text.charAt(i)
            i++
            if (i > text.length - 1) {
                clearInterval(this.typingInterval)
                if (callback) callback()
            }
        }, 30) // Typing speed (ms)
    }

    closeDialogue() {
        if (this.typingInterval) clearInterval(this.typingInterval)
        this.ui.dialogueContainer.classList.add('hidden')
        if (this.player) this.player.canMove = true
    }

    createNavigationPath() {
        // Clear existing line
        if (this.navLine) {
            this.scene.remove(this.navLine)
            this.navLine.geometry.dispose()
            this.navLine.material.dispose()
        }

        this.navTarget = new THREE.Vector3(-14.07, -4.21, -10.85)

        // Initial Geometry (will be updated in loop)
        const start = this.player.mesh.position.clone()
        start.y = -3.5
        const end = this.navTarget.clone()
        end.y = -3.5

        const path = new THREE.LineCurve3(start, end)
        // Reduced radius to 0.05, low segments for performance
        const geometry = new THREE.TubeGeometry(path, 1, 0.05, 4, false)
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })

        this.navLine = new THREE.Mesh(geometry, material)
        this.scene.add(this.navLine)
    }

    createInteractionPoints() {
        this.points.forEach(point => {
            const mesh = new THREE.Object3D()
            mesh.position.copy(point.position)
            this.scene.add(mesh)

            this.interactionPoints.push({
                mesh: mesh,
                data: point
            })
        })
    }

    update() {
        if (!this.player) return

        let foundActive = false
        const playerPos = this.player.mesh.position

        // Navigation Path Logic
        if (this.navLine && this.navTarget) {
            // 1. Dynamic Update: Recreate geometry to follow player
            this.navLine.geometry.dispose()

            const start = playerPos.clone()
            start.y = -3.5
            const end = this.navTarget.clone()
            end.y = -3.5

            const path = new THREE.LineCurve3(start, end)
            // Rebuild geometry (cheap for simple line)
            this.navLine.geometry = new THREE.TubeGeometry(path, 1, 0.05, 4, false)

            // 2. Check arrival
            if (playerPos.distanceTo(this.navTarget) < 3) {
                this.scene.remove(this.navLine)
                this.navLine.geometry.dispose()
                this.navLine.material.dispose()
                this.navLine = null
            }
        }

        for (const point of this.interactionPoints) {
            const distance = playerPos.distanceTo(point.mesh.position)

            // Check distance (Increased to 3 for better accessibility)
            if (distance < 3) {
                this.activePoint = point
                foundActive = true

                // Update Label
                if (this.ui.label.innerText !== point.data.label) {
                    this.ui.label.innerText = point.data.label
                }
                break // Only interact with one at a time
            }
        }

        if (foundActive) {
            this.ui.panel.classList.add('visible')
            // Set action for touch support
            this.currentInteractionAction = () => {
                if (this.activePoint) this.activePoint.data.action()
            }
        } else {
            this.activePoint = null
            this.currentInteractionAction = null
            this.ui.panel.classList.remove('visible')
        }
    }
}
