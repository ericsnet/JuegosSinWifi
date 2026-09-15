/**
 * Web Audio API Sound Synthesizer
 * 100% offline - No external audio files needed!
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = false;
        this.sfxVolume = 0.5;
        this.musicVolume = 0.25;
        this.musicInterval = null;
        this.musicStep = 0;
        
        // Load saved preferences
        const savedSfx = localStorage.getItem('jsw_sfx_enabled');
        if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
        const savedMusic = localStorage.getItem('jsw_music_enabled');
        if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';

        // Initialize audio context on first interaction
        const initAudio = () => {
            this.ensureContext();
            window.removeEventListener('click', initAudio);
            window.removeEventListener('keydown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };
        window.addEventListener('click', initAudio, { once: true });
        window.addEventListener('keydown', initAudio, { once: true });
        window.addEventListener('touchstart', initAudio, { once: true });
    }

    ensureContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSfx(enabled) {
        this.sfxEnabled = enabled;
        localStorage.setItem('jsw_sfx_enabled', enabled);
    }

    setMusic(enabled) {
        this.musicEnabled = enabled;
        localStorage.setItem('jsw_music_enabled', enabled);
        if (enabled) {
            this.startMusic();
        } else {
            this.stopMusic();
        }
    }

    toggleSfx() {
        this.setSfx(!this.sfxEnabled);
        return this.sfxEnabled;
    }

    toggleMusic() {
        this.setMusic(!this.musicEnabled);
        return this.musicEnabled;
    }

    playTone(freq, type = 'sine', duration = 0.1, gain = 0.3, slideTo = null) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo !== null) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
            }

            const masterGain = gain * this.sfxVolume;
            gainNode.gain.setValueAtTime(masterGain, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    play(name) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        switch (name) {
            case 'click':
            case 'tap':
                this.playTone(800, 'sine', 0.04, 0.15, 400);
                break;
            case 'select':
                this.playTone(440, 'triangle', 0.08, 0.2, 880);
                break;
            case 'move':
                this.playTone(320, 'sine', 0.05, 0.12, 420);
                break;
            case 'jump':
                this.playTone(250, 'square', 0.12, 0.25, 650);
                break;
            case 'laser':
            case 'shoot':
                this.playTone(900, 'sawtooth', 0.1, 0.25, 120);
                break;
            case 'hit':
                this.playNoise(0.08, 0.3);
                this.playTone(180, 'square', 0.08, 0.2, 60);
                break;
            case 'explosion':
                this.playNoise(0.3, 0.5);
                this.playTone(140, 'sawtooth', 0.25, 0.3, 30);
                break;
            case 'score':
            case 'point':
                this.playTone(523.25, 'sine', 0.08, 0.2); // C5
                setTimeout(() => this.playTone(659.25, 'sine', 0.12, 0.2), 60); // E5
                break;
            case 'powerup':
                [440, 554, 659, 880].forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'triangle', 0.08, 0.2), i * 50);
                });
                break;
            case 'clear':
            case 'line':
                [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'square', 0.1, 0.25), i * 40);
                });
                break;
            case 'card':
            case 'flip':
                this.playTone(600, 'sine', 0.06, 0.2, 900);
                break;
            case 'match':
                this.playTone(587.33, 'triangle', 0.1, 0.25);
                setTimeout(() => this.playTone(880, 'triangle', 0.15, 0.3), 80);
                break;
            case 'win':
            case 'victory':
                const winMelody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
                winMelody.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'triangle', 0.18, 0.35), i * 90);
                });
                break;
            case 'gameover':
            case 'lose':
                const loseMelody = [440, 415, 392, 349];
                loseMelody.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'sawtooth', 0.2, 0.3), i * 110);
                });
                break;
            case 'combo':
                this.playTone(600, 'sine', 0.08, 0.25, 1200);
                break;
            case 'flag':
                this.playTone(700, 'sine', 0.05, 0.15, 900);
                break;
            default:
                this.playTone(440, 'sine', 0.05, 0.1);
        }
    }

    playNoise(duration = 0.2, gain = 0.3) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const bufferSize = this.ctx.sampleRate * duration;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + duration);

            const gainNode = this.ctx.createGain();
            gainNode.gain.setValueAtTime(gain * this.sfxVolume, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            noise.start();
            noise.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn('Noise error:', e);
        }
    }

    startMusic() {
        if (!this.musicEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        if (this.musicInterval) clearInterval(this.musicInterval);

        // Ambient chiptune 8-bar arpeggio pattern
        const notes = [
            261.63, 329.63, 392.00, 523.25, // C - E - G - C
            293.66, 349.23, 440.00, 587.33, // D - F - A - D
            329.63, 392.00, 493.88, 659.25, // E - G - B - E
            261.63, 349.23, 392.00, 523.25  // C - F - G - C
        ];

        this.musicStep = 0;
        this.musicInterval = setInterval(() => {
            if (!this.musicEnabled) {
                this.stopMusic();
                return;
            }
            const freq = notes[this.musicStep % notes.length];
            this.playMusicNote(freq);
            this.musicStep++;
        }, 220);
    }

    playMusicNote(freq) {
        if (!this.musicEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            const masterGain = 0.08 * this.musicVolume;
            gainNode.gain.setValueAtTime(masterGain, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);

            osc.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) {
            // ignore
        }
    }

    stopMusic() {
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global instance
window.sound = new SoundEngine();
