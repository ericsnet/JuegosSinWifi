/**
 * El Ahorcado Pro (Hangman)
 */
window.HangmanGame = class {
    constructor(container) {
        this.container = container;
        this.wordsData = {
            videojuegos: [
                'MINECRAFT', 'CYBERPUNK', 'ZELDA', 'PACMAN', 'TETRIS', 'MARIO', 'SONIC',
                'DOOM', 'WITCHER', 'PORTAL', 'SKYRIM', 'FORTNITE', 'ROBLOX', 'POKEMON',
                'ELDEN RING', 'METROID', 'ASSASSIN', 'HALF LIFE', 'DARK SOULS'
            ],
            paises: [
                'ESPANA', 'MEXICO', 'ARGENTINA', 'COLOMBIA', 'JAPON', 'FRANCIA', 'BRASIL',
                'ALEMANIA', 'ITALIA', 'EGIPTO', 'CANADA', 'AUSTRALIA', 'PORTUGAL', 'CHILE',
                'PERU', 'NORUEGA', 'SUECIA', 'GRECIA', 'COREA', 'ISLANDIA'
            ],
            cine: [
                'MATRIX', 'AVATAR', 'STAR WARS', 'HARRY POTTER', 'GLADIATOR', 'INCEPTION',
                'TITANIC', 'INTERSTELLAR', 'BATMAN', 'AVENGERS', 'JURASSIC PARK', 'TERMINATOR',
                'PULP FICTION', 'EL PADRINO', 'CASABLANCA', 'ALIEN', 'BLADE RUNNER'
            ],
            ciencia: [
                'UNIVERSO', 'ALGORITMO', 'GRAVEDAD', 'GALAXIA', 'SATELITE', 'TELESCOPIO',
                'CUANTICO', 'CIBERNETICA', 'ROBOTICA', 'MOLECULA', 'SUPERNOVA', 'ASTEROIDE',
                'FUSION', 'GENOMA', 'NEBULOSA', 'DINAMICA', 'RELATIVIDAD'
            ],
            animales: [
                'CAMALEON', 'LEOPARDO', 'ORNITORRINCO', 'DELFIN', 'HALCON', 'CANGURO',
                'PANTERA', 'COCODRILO', 'PINGUINO', 'GORILA', 'ELEFANTE', 'TIGRE',
                'AGUILA', 'JIRAFA', 'LOBO', 'GUEPARDO', 'FLAMENCO'
            ]
        };

        this.currentCategory = 'videojuegos';
        this.secretWord = '';
        this.guessedLetters = new Set();
        this.mistakes = 0;
        this.maxMistakes = 6;
        this.streak = 0;
        this.isGameOver = false;
        this.won = false;
        this.highScore = window.storage.getScore('hangman');

        this.onKey = (e) => {
            const letter = e.key.toUpperCase();
            if (/^[A-ZÑ]$/.test(letter)) {
                this.guessLetter(letter);
            }
        };
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper hangman-game">
                <div class="hangman-top-bar">
                    <label>Categoría:</label>
                    <select id="hangman-category-select" class="form-select">
                        <option value="videojuegos">🎮 Videojuegos</option>
                        <option value="paises">🌍 Países</option>
                        <option value="cine">🎬 Cine y Películas</option>
                        <option value="ciencia">🚀 Ciencia y Espacio</option>
                        <option value="animales">🦁 Animales</option>
                    </select>
                </div>

                <div class="game-hud hangman-hud">
                    <div class="hud-item"><span class="hud-label">RACHA</span><span id="hangman-streak" class="hud-val">🔥 0</span></div>
                    <div class="hud-item"><span class="hud-label">FALLOS</span><span id="hangman-mistakes" class="hud-val">0 / 6</span></div>
                    <button class="btn btn-sm btn-tool" id="hangman-hint-btn">💡 Pista (-1 intento)</button>
                </div>

                <div class="hangman-display-area">
                    <div class="hangman-canvas-box">
                        <canvas id="hangman-canvas" width="220" height="220"></canvas>
                    </div>
                    <div class="hangman-word-box">
                        <div id="hangman-word-letters" class="hangman-word"></div>
                        <div id="hangman-status-msg" class="hangman-hint-text">Adivina las letras de la palabra</div>
                    </div>
                </div>

                <div class="hangman-keyboard" id="hangman-keyboard"></div>

                <div id="hangman-overlay" class="game-overlay hidden">
                    <div class="overlay-card">
                        <h2 id="hangman-overlay-title">¡Victoria!</h2>
                        <p id="hangman-overlay-msg"></p>
                        <button class="btn btn-primary" id="hangman-overlay-restart">Siguiente Palabra</button>
                    </div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('hangman-canvas');
        this.ctx = this.canvas.getContext('2d');

        const catSelect = this.container.querySelector('#hangman-category-select');
        catSelect.onchange = (e) => {
            this.currentCategory = e.target.value;
            this.streak = 0;
            this.start();
        };

        this.container.querySelector('#hangman-hint-btn').onclick = () => this.useHint();
        this.container.querySelector('#hangman-overlay-restart').onclick = () => this.start();

        window.addEventListener('keydown', this.onKey);
        this.renderKeyboard();
        this.start();
    }

    start() {
        const pool = this.wordsData[this.currentCategory];
        this.secretWord = pool[Math.floor(Math.random() * pool.length)];
        this.guessedLetters = new Set([' ']);
        this.mistakes = 0;
        this.isGameOver = false;
        this.won = false;

        document.getElementById('hangman-overlay')?.classList.add('hidden');
        this.updateHud();
        this.renderWord();
        this.renderCanvas();
        this.updateKeyboardState();
    }

    renderKeyboard() {
        const kb = document.getElementById('hangman-keyboard');
        if (!kb) return;
        kb.innerHTML = '';

        const alphabet = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
        alphabet.forEach(letter => {
            const btn = document.createElement('button');
            btn.className = 'btn-letter';
            btn.textContent = letter;
            btn.dataset.letter = letter;
            btn.onclick = () => this.guessLetter(letter);
            kb.appendChild(btn);
        });
    }

    updateKeyboardState() {
        const buttons = this.container.querySelectorAll('.btn-letter');
        buttons.forEach(btn => {
            const letter = btn.dataset.letter;
            if (this.guessedLetters.has(letter)) {
                btn.disabled = true;
                if (this.secretWord.includes(letter)) {
                    btn.classList.add('letter-correct');
                } else {
                    btn.classList.add('letter-wrong');
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('letter-correct', 'letter-wrong');
            }
        });
    }

    guessLetter(letter) {
        if (this.isGameOver || this.guessedLetters.has(letter)) return;

        this.guessedLetters.add(letter);

        if (this.secretWord.includes(letter)) {
            window.sound?.play('score');
            this.renderWord();
            this.updateKeyboardState();

            if (this.checkWin()) {
                this.gameOver(true);
            }
        } else {
            this.mistakes++;
            window.sound?.play('hit');
            this.renderCanvas();
            this.updateHud();
            this.updateKeyboardState();

            if (this.mistakes >= this.maxMistakes) {
                this.gameOver(false);
            }
        }
    }

    useHint() {
        if (this.isGameOver || this.mistakes >= this.maxMistakes - 1) return;
        const unrevealed = this.secretWord.split('').filter(ch => ch !== ' ' && !this.guessedLetters.has(ch));
        if (unrevealed.length === 0) return;

        const hintLetter = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        this.mistakes++;
        window.sound?.play('select');
        this.renderCanvas();
        this.guessLetter(hintLetter);
    }

    renderWord() {
        const wordEl = document.getElementById('hangman-word-letters');
        if (!wordEl) return;
        wordEl.innerHTML = '';

        for (const ch of this.secretWord) {
            const span = document.createElement('span');
            if (ch === ' ') {
                span.className = 'letter-space';
                span.textContent = ' ';
            } else if (this.guessedLetters.has(ch)) {
                span.className = 'letter-revealed';
                span.textContent = ch;
            } else {
                span.className = 'letter-hidden';
                span.textContent = '_';
            }
            wordEl.appendChild(span);
        }
    }

    renderCanvas() {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.clearRect(0, 0, 220, 220);

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;

        // Base
        ctx.beginPath();
        ctx.moveTo(20, 200);
        ctx.lineTo(100, 200);
        // Post
        ctx.moveTo(60, 200);
        ctx.lineTo(60, 30);
        // Top beam
        ctx.lineTo(150, 30);
        // Rope
        ctx.lineTo(150, 60);
        ctx.stroke();

        ctx.strokeStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';

        // 1. Head
        if (this.mistakes >= 1) {
            ctx.beginPath();
            ctx.arc(150, 75, 15, 0, Math.PI * 2);
            ctx.stroke();
        }
        // 2. Body
        if (this.mistakes >= 2) {
            ctx.beginPath();
            ctx.moveTo(150, 90);
            ctx.lineTo(150, 140);
            ctx.stroke();
        }
        // 3. Left arm
        if (this.mistakes >= 3) {
            ctx.beginPath();
            ctx.moveTo(150, 105);
            ctx.lineTo(125, 125);
            ctx.stroke();
        }
        // 4. Right arm
        if (this.mistakes >= 4) {
            ctx.beginPath();
            ctx.moveTo(150, 105);
            ctx.lineTo(175, 125);
            ctx.stroke();
        }
        // 5. Left leg
        if (this.mistakes >= 5) {
            ctx.beginPath();
            ctx.moveTo(150, 140);
            ctx.lineTo(130, 175);
            ctx.stroke();
        }
        // 6. Right leg
        if (this.mistakes >= 6) {
            ctx.beginPath();
            ctx.moveTo(150, 140);
            ctx.lineTo(170, 175);
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
    }

    checkWin() {
        return this.secretWord.split('').every(ch => this.guessedLetters.has(ch));
    }

    updateHud() {
        const streakEl = document.getElementById('hangman-streak');
        const mistakesEl = document.getElementById('hangman-mistakes');
        if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;
        if (mistakesEl) mistakesEl.textContent = `${this.mistakes} / ${this.maxMistakes}`;
    }

    gameOver(won) {
        this.isGameOver = true;
        this.won = won;

        if (won) {
            this.streak++;
            window.sound?.play('victory');
            const score = (window.storage.getScore('hangman') || 0) + (100 * this.streak);
            window.storage.setScore('hangman', score);
            window.storage.recordGamePlay('hangman', true, 100, 20);
        } else {
            this.streak = 0;
            window.sound?.play('lose');
            window.storage.recordGamePlay('hangman', false, 0, 20);
        }

        window.achievements?.checkAll();
        this.updateHud();

        const overlay = document.getElementById('hangman-overlay');
        const title = document.getElementById('hangman-overlay-title');
        const msg = document.getElementById('hangman-overlay-msg');

        if (title) title.textContent = won ? '🎉 ¡Palabra Adivinada!' : '💀 ¡Ahorcado!';
        if (msg) msg.innerHTML = `La palabra era: <strong style="color: #00ff88; font-size: 1.2rem;">${this.secretWord}</strong><br>Racha actual: <strong>${this.streak}</strong>`;
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        window.removeEventListener('keydown', this.onKey);
    }
};
