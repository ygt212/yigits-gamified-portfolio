import Experience from './Core/Experience.js'
import './style.css'

const experience = new Experience(document.querySelector('canvas.webgl'))

// --- MUSIC SYSTEM ---
const musicBtn = document.getElementById('music-toggle');
const musicIcon = document.getElementById('music-icon');
const musicText = document.querySelector('.music-text');
const bgMusic = document.getElementById('bg-music');

// Ayarlar
bgMusic.volume = 0.15; // %15 Ses Seviyesi

let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        // Durdur
        bgMusic.pause();
        // UI Güncelleme
        musicIcon.innerText = '🔇';
        musicText.innerText = 'Müziği Aç';
        musicBtn.classList.remove('playing');
        isPlaying = false;
    } else {
        // Oynat
        // Optimistic UI Update: Hemen güncelle, hata olursa geri al
        musicIcon.innerText = '🔊';
        musicText.innerText = 'Müziği Kapat';
        musicBtn.classList.add('playing');
        isPlaying = true;

        bgMusic.play().catch(error => {
            console.error('Müzik çalma hatası:', error);
            // Hata durumunda UI'ı geri al
            musicIcon.innerText = '🔇';
            musicText.innerText = 'Müziği Aç';
            musicBtn.classList.remove('playing');
            isPlaying = false;
        });
    }
});

// Başlangıç Durumu Garantiye Al
musicIcon.innerText = '🔇';
musicText.innerText = 'Müziği Aç';

// İPUCU: Tarayıcılar otomatik ses çalmayı engellediği için,
// kullanıcı sayfada herhangi bir yere ilk tıkladığında müziği başlatmayı deneyebiliriz (Opsiyonel):
window.addEventListener('click', () => {
    if (!isPlaying && bgMusic.paused) {
        // Otomatik başlatma kapalı, sadece kullanıcı butona basınca çalışsın.
    }
}, { once: true });
