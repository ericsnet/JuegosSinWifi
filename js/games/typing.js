/**
 * Speed Typer / Lluvia de Palabras
 */
window.SpeedTyper = class {
    constructor(container) {
        this.container = container;
        this.wordsBank = [
            'CODIGO', 'TECLADO', 'VELOCIDAD', 'NEON', 'ARCADE', 'PIXEL', 'RADAR', 'CYBER',
            'MATRIZ', 'FUTURO', 'LASER', 'ENERGIA', 'COMANDO', 'VECTOR', 'SISTEMA',
            'PROGRAMA', 'DIGITAL', 'DATOS', 'ESPACIO', 'ROBOT', 'VIRTUAL', 'CIRCUITO',
            'PANTALLA', 'ESCUDO', 'NUCLEO', 'SATELITE', 'GALAXIA', 'CUANTICO', 'MEMORIA',
            'PROCESO', 'TERMINAL', 'MODULO', 'INTERFAZ', 'LOGICA', 'COHETE', 'NUBE'
        ];

        this.fallingWords = [];
        this.score = 0;
        this.streak = 0;
        this.lives = 3;
        this.spawnTimer = 0;
        this.spawnInterval = 90;
        this.fallSpeed = 1.2;
        this.currentInput = '';
        this.isGameOver = false;
        this.isPaused = false;
        this.animationId = null;
        this.startTime = Date.now();
        this.highScore = window.storage.getScore('typing');
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper typing-game">
                <div class="game-hud typing-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="typing-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">RACHA</span><span id="typing-streak" class="hud-val">🔥 0</span></div>
                    <div class="hud-item"><span class="hud-label">VIDAS</span><span id="typing-lives" class="hud-val">❤️❤️❤️</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                </div>

                <div class="typing-canvas-container">
                    <div id="typing-field" class="typing-field"></div>
                    <div id="typing-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="typing-overlay-title">¡Escudo Destruido!</h2>
                            <p id="typing-overlay-msg"></p>
                            <button class="btn btn-primary" id="typing-btn-restart">Jugar de Nuevo</button>
                        </div>
                    </div>
                </div>

                <div class="typing-input-bar">
                    <input type="text" id="typing-input-box" class="form-input typing-input" placeholder="Escribe aquí las palabras..." autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false">
                </div>
            </div>
        `;

        const input = this.container.querySelector('#typing-input-box');
        input.addEventListener('input', (e) => {
            this.handleInput(e.target.value.toUpperCase());
        });

        this.container.querySelector('#typing-btn-restart').onclick = () => {
            this.start();
            input.focus();
        };

        this.start();
        setTimeout(() => input.focus(), 100);
    }

    start() {
        this.fallingWords = [];
        this.score = 0;
        this.streak = 0;
        this.lives = 3;
        this.fallSpeed = 1.2;
        this.spawnTimer = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.currentInput = '';
        this.startTime = Date.now();

        const input = document.getElementById('typing-input-box');
        if (input) {
            input.value = '';
            input.disabled = false;
        }

        document.getElementById('typing-overlay')?.classList.add('hidden');
        this.updateHud();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    handleInput(typed) {
        if (this.isGameOver || this.isPaused) return;

        let matchedIndex = -1;
        for (let i = 0; i < this.fallingWords.length; i++) {
            if (this.fallingWords[i].word === typed) {
                matchedIndex = i;
                break;
            }
        }

        if (matchedIndex !== -1) {
            // Success match!
            const fw = this.fallingWords[matchedIndex];
            this.streak++;
            const pts = (fw.word.length * 10) + (this.streak * 5);
            this.score += pts;
            window.sound?.play('score');

            // Remove word
            this.fallingWords.splice(matchedIndex, 1);

            // Clear input box
            const input = document.getElementById('typing-input-box');
            if (input) input.value = '';

            // Increase difficulty slightly
            if (this.score % 200 === 0) {
                this.fallSpeed = Math.min(3.5, this.fallSpeed + 0.15);
            }

            this.updateHud();
        }
    }

    loop() {
        if (!this.isGameOver && !this.isPaused) {
            this.update();
            this.render();
        }
        this.animationId = requestAnimationFrame(this.loop);
    }

    update() {
        // Spawn words
        this.spawnTimer++;
        if (this.spawnTimer > this.spawnInterval) {
            this.spawnTimer = 0;
            const word = this.wordsBank[Math.floor(Math.random() * this.wordsBank.length)];
            const field = document.getElementById('typing-field');
            const fieldW = field ? field.clientWidth - 120 : 350;

            this.fallingWords.push({
                word,
                x: Math.max(10, Math.floor(Math.random() * fieldW)),
                y: -30,
                speed: this.fallSpeed * (0.8 + Math.random() * 0.4)
            });
        }

        const field = document.getElementById('typing-field');
        const maxHeight = field ? field.clientHeight - 40 : 320;

        // Move words
        for (let i = this.fallingWords.length - 1; i >= 0; i--) {
            const fw = this.fallingWords[i];
            fw.y += fw.speed;

            if (fw.y >= maxHeight) {
                // Word hit defense line!
                this.lives--;
                this.streak = 0;
                window.sound?.play('hit');
                this.fallingWords.splice(i, 1);
                this.updateHud();

                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    render() {
        const field = document.getElementById('typing-field');
        if (!field) return;
        field.innerHTML = '';

        const input = document.getElementById('typing-input-box');
        const currentTyped = input ? input.value.toUpperCase() : '';

        this.fallingWords.forEach(fw => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'falling-word';
            wordDiv.style.left = `${fw.x}px`;
            wordDiv.style.top = `${fw.y}px`;

            if (currentTyped && fw.word.startsWith(currentTyped)) {
                wordDiv.innerHTML = `<span class="word-matched">${currentTyped}</span><span class="word-remaining">${fw.word.slice(currentTyped.length)}</span>`;
                wordDiv.classList.add('word-targeted');
            } else {
                wordDiv.textContent = fw.word;
            }

            field.appendChild(wordDiv);
        });
    }

    updateHud() {
        const scoreEl = document.getElementById('typing-score');
        const streakEl = document.getElementById('typing-streak');
        const livesEl = document.getElementById('typing-lives');
        if (scoreEl) scoreEl.textContent = this.score;
        if (streakEl) streakEl.textContent = `🔥 ${this.streak}`;
        if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives));
    }

    gameOver() {
        this.isGameOver = true;
        window.sound?.play('gameover');

        const isNewHigh = window.storage.setScore('typing', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('typing', false, this.score, playTime);
        window.achievements?.checkAll();

        const input = document.getElementById('typing-input-box');
        if (input) input.disabled = true;

        const overlay = document.getElementById('typing-overlay');
        const title = document.getElementById('typing-overlay-title');
        const msg = document.getElementById('typing-overlay-msg');

        if (title) title.textContent = isNewHigh ? '🏆 ¡Nuevo Récord Mecanógrafo!' : '¡Escudo Caído!';
        if (msg) msg.innerHTML = `Puntuación: <strong>${this.score}</strong> | Palabras escritas con éxito`;
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() { this.isPaused = true; }
    resume() { this.isPaused = false; }
    restart() { this.start(); }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
};
