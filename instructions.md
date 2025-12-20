# PROJE TANIMI: 3D Gamified Portfolio (Three.js & Vanilla JS)

## 1. PROJE ÖZETİ
Web tabanlı, oyunlaştırılmış bir portfolyo sitesi geliştirilecektir. Kullanıcı, 3. şahıs kamera açısıyla (Top-down/Isometric) bir 3D karakteri kontrol edecek, haritadaki belirli "Experience Points" (Deneyim Noktaları) ile etkileşime girerek projeleri, hakkımda bilgisini ve iletişim detaylarını görüntüleyebilecektir.

## 2. TEKNOLOJİ STACK'İ
- **Core:** HTML5, CSS3, Modern Vanilla JavaScript (ES6+ Module yapısı).
- **3D Engine:** Three.js (Güncel sürüm).
- **Build Tool:** Vite (Development server ve asset yönetimi için).
- **Model Formatı:** GLTF/GLB.
- **Physics/Collision:** Basit bounding-box (AABB) veya Distance-based collision (Ağır fizik motorları kullanılmayacak).
- **Animations:** GSAP (Kamera geçişleri ve UI animasyonları için) + Three.js AnimationMixer.

## 3. GÖRSEL STİL VE ATMOSFER (Referans Görsellere Göre)
- **Tema:** Cyberpunk-Lite / Pastel Low-Poly.
- **Renk Paleti:** Neon pembeler, yumuşak maviler, pastel morlar.
- **Lighting:** Ambient Light + Directional Light (Gölge veren) + Point Lights (Etkileşim noktalarında).
- **Post-Processing:** UnrealBloomPass kullanılarak "rüya gibi" (dreamy) ve parlak bir görüntü elde edilecek.

## 4. TEMEL MEKANİKLER

### A. Karakter Kontrolcüsü (Character Controller)
- **Input:** WASD veya Yön Tuşları.
- **Hareket:** Karakter basılan yöne dönmeli (smooth rotation) ve ilerlemeli.
- **Animasyon State:** 'Idle' (Durma) ve 'Run' (Koşma) arasında yumuşak geçiş (crossFade).
- **Kamera:** Karakteri belirli bir offset ile yumuşakça takip etmeli (Lerp interpolation).

### B. Etkileşim Sistemi (Interaction System)
- Haritada `TriggerZone` sınıfı ile belirlenmiş noktalar olacak (Örn: Hakkımda, Projeler, İletişim).
- **Görsel İpucu:** Bu noktaların zemininde parlayan bir halka veya üzerinde süzülen 3D ikon/yazı olacak.
- **Mekanik:** Karakter trigger alanına girdiğinde (Distance Check < 1.5 birim):
  1. Ekranda "Press SPACE to interact" uyarısı çıkar.
  2. Kullanıcı SPACE'e basarsa: Karakter kontrolü kilitlenir, HTML Overlay (Modal) açılır.
  3. Modal kapatılınca (ESC veya X butonu): Kontrol tekrar karaktere geçer.

### C. Çevre (Environment)
- Zemin (PlaneGeometry).
- Sınırlar (Karakterin harita dışına çıkmasını engelleyen görünmez duvarlar).
- Dekoratif objeler (Ağaçlar, kayalar, bilgisayar masaları - Low Poly).

## 5. KOD MİMARİSİ (Modüler Yapı Şarttır)
Kod tek bir dosyada olmamalı. Aşağıdaki sınıf yapısı kullanılmalı:

- `/src`
  - `main.js` (Entry point, Loop başlatıcı)
  - `/Core`
    - `Experience.js` (Singleton, tüm sahneyi yöneten ana sınıf)
    - `Camera.js`
    - `Renderer.js`
    - `Loop.js` (Time ve RequestAnimationFrame yönetimi)
    - `Resources.js` (Asset loading yönetimi - Loading Screen burada olacak)
    - `Input.js` (Klavye dinleyicileri)
  - `/World`
    - `World.js` (Sahne kurulumu)
    - `Environment.js` (Işıklar ve dekorlar)
    - `Player.js` (Karakter modeli, animasyonları ve fiziği)
    - `InteractionPoints.js` (Etkileşim noktalarının yönetimi)
  - `/Utils`
    - `EventEmitter.js` (Olay tabanlı iletişim için)

## 6. ÖNEMLİ KURALLAR
1. **Responsive:** Canvas, pencere boyutu değiştiğinde (`resize` event) bozulmamalı.
2. **Performance:** `requestAnimationFrame` içinde ağır hesaplamalar yapılmamalı. Geometriler mümkün olduğunca `instancedMesh` ile kullanılmalı veya optimize edilmeli.
3. **Loading:** Tüm 3D modeller yüklenmeden sahne açılmamalı, basit bir HTML loading bar eklenmeli.
4. **Kod Kalitesi:** Her fonksiyonun ne yaptığına dair kısa yorumlar eklenmeli.