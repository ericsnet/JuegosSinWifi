/**
 * Web Audio API Sound Synthesizer
 * 100% offline - Smooth, polyphonic arcade synthesizers
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.sfxEnabled = true;
        this.musicEnabled = false;
        this.sfxVolume = 0.45;
        this.musicVolume = 0.2;
        this.musicInterval = null;
        this.musicStep = 0;
        
        // Load saved preferences
        const savedSfx = localStorage.getItem('jsw_sfx_enabled');
        if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
        const savedMusic = localStorage.getItem('jsw_music_enabled');
        if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';

        // Unlock AudioContext on first user interaction
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

    playTone(freq, type = 'sine', duration = 0.1, gain = 0.25, slideTo = null) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(3000, this.ctx.currentTime);

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            if (slideTo !== null) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(10, slideTo), this.ctx.currentTime + duration);
            }

            const masterGain = gain * this.sfxVolume;
            gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(masterGain, this.ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration + 0.02);
        } catch (e) {
            // ignore
        }
    }

    play(name) {
        if (!this.sfxEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        switch (name) {
            case 'click':
            case 'tap':
                this.playTone(720, 'sine', 0.05, 0.15, 360);
                break;
            case 'select':
                this.playTone(520, 'triangle', 0.07, 0.18, 780);
                break;
            case 'move':
                this.playTone(340, 'sine', 0.04, 0.12, 440);
                break;
            case 'jump':
                this.playTone(280, 'triangle', 0.12, 0.22, 600);
                break;
            case 'laser':
            case 'shoot':
                this.playTone(850, 'sawtooth', 0.09, 0.18, 140);
                break;
            case 'hit':
                this.playNoise(0.07, 0.2);
                this.playTone(160, 'triangle', 0.08, 0.18, 50);
                break;
            case 'explosion':
                this.playNoise(0.25, 0.35);
                this.playTone(120, 'sawtooth', 0.2, 0.25, 30);
                break;
            case 'score':
            case 'point':
                this.playTone(523.25, 'sine', 0.08, 0.18);
                setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.2), 50);
                break;
            case 'powerup':
                [440, 554.37, 659.25, 880].forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'triangle', 0.08, 0.2), i * 45);
                });
                break;
            case 'clear':
            case 'line':
                [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'triangle', 0.1, 0.22), i * 35);
                });
                break;
            case 'card':
            case 'flip':
                this.playTone(580, 'sine', 0.06, 0.18, 880);
                break;
            case 'match':
                this.playTone(587.33, 'triangle', 0.09, 0.22);
                setTimeout(() => this.playTone(880, 'triangle', 0.14, 0.25), 70);
                break;
            case 'win':
            case 'victory':
                const winMelody = [523.25, 659.25, 783.99, 1046.50, 880, 1046.50];
                winMelody.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'triangle', 0.15, 0.28), i * 85);
                });
                break;
            case 'gameover':
            case 'lose':
                const loseMelody = [440, 415.30, 392, 349.23];
                loseMelody.forEach((f, i) => {
                    setTimeout(() => this.playTone(f, 'sawtooth', 0.18, 0.22), i * 100);
                });
                break;
            case 'combo':
                this.playTone(587.33, 'sine', 0.08, 0.22, 1174.66);
                break;
            case 'flag':
                this.playTone(680, 'sine', 0.05, 0.15, 850);
                break;
            default:
                this.playTone(440, 'sine', 0.05, 0.1);
        }
    }

    playNoise(duration = 0.2, gain = 0.25) {
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
            filter.frequency.setValueAtTime(800, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + duration);

            const gainNode = this.ctx.createGain();
            gainNode.gain.setValueAtTime(gain * this.sfxVolume, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            noise.start();
            noise.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // ignore
        }
    }

    startMusic() {
        if (!this.musicEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        if (this.musicInterval) clearInterval(this.musicInterval);

        // Chill Lofi synth arpeggio progression
        const notes = [
            261.63, 329.63, 392.00, 523.25,
            293.66, 349.23, 440.00, 587.33,
            329.63, 392.00, 493.88, 659.25,
            261.63, 349.23, 392.00, 523.25
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
        }, 240);
    }

    playMusicNote(freq) {
        if (!this.musicEnabled) return;
        this.ensureContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            const masterGain = 0.07 * this.musicVolume;
            gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(masterGain, this.ctx.currentTime + 0.03);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.28);

            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.3);
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
