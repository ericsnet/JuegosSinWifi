/**
 * Cyber Snake Neon
 */
window.CyberSnake = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 20;
        this.tileCount = 20;
        this.snake = [];
        this.dx = 1;
        this.dy = 0;
        this.nextDx = 1;
        this.nextDy = 0;
        this.food = { x: 15, y: 10, type: 'normal' };
        this.specialFood = null;
        this.specialTimer = null;
        this.score = 0;
        this.highScore = window.storage.getScore('snake');
        this.speed = 110;
        this.loopId = null;
        this.particles = [];
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.onKey = this.handleKey.bind(this);
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper snake-game">
                <div class="game-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="snake-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                    <div class="hud-item"><span class="hud-label">VELOCIDAD</span><span id="snake-speed" class="hud-val">1x</span></div>
                </div>
                <div class="canvas-container">
                    <canvas id="snake-canvas" width="400" height="400"></canvas>
                    <div id="snake-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="snake-overlay-title">¡Fin del Juego!</h2>
                            <p id="snake-overlay-msg">Puntuación final: <span id="snake-final-score">0</span></p>
                            <button class="btn btn-primary" id="snake-btn-restart">Jugar de Nuevo (Espacio)</button>
                        </div>
                    </div>
                </div>
                <div class="touch-controls dpad-layout">
                    <div class="dpad-row"><button class="dpad-btn" data-dir="up">▲</button></div>
                    <div class="dpad-row">
                        <button class="dpad-btn" data-dir="left">◀</button>
                        <button class="dpad-btn center-dot">●</button>
                        <button class="dpad-btn" data-dir="right">▶</button>
                    </div>
                    <div class="dpad-row"><button class="dpad-btn" data-dir="down">▼</button></div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Event listeners
        window.addEventListener('keydown', this.onKey);
        this.container.querySelector('#snake-btn-restart').onclick = () => this.restart();

        // Touch buttons
        const dpadBtns = this.container.querySelectorAll('.dpad-btn');
        dpadBtns.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleDir(btn.dataset.dir);
            });
            btn.addEventListener('click', () => {
                this.handleDir(btn.dataset.dir);
            });
        });

        // Touch swipe on canvas
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.canvas.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20) {
                this.handleDir(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > 20) {
                this.handleDir(dy > 0 ? 'down' : 'up');
            }
        }, { passive: true });

        this.start();
    }

    start() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.dx = 1;
        this.dy = 0;
        this.nextDx = 1;
        this.nextDy = 0;
        this.score = 0;
        this.speed = 110;
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.particles = [];
        this.spawnFood();
        this.updateHud();
        document.getElementById('snake-overlay')?.classList.add('hidden');

        if (this.loopId) clearInterval(this.loopId);
        this.loopId = setInterval(() => this.tick(), this.speed);
    }

    handleDir(dir) {
        if (!dir || this.isGameOver || this.isPaused) return;
        if (dir === 'up' && this.dy === 0) { this.nextDx = 0; this.nextDy = -1; window.sound?.play('move'); }
        if (dir === 'down' && this.dy === 0) { this.nextDx = 0; this.nextDy = 1; window.sound?.play('move'); }
        if (dir === 'left' && this.dx === 0) { this.nextDx = -1; this.nextDy = 0; window.sound?.play('move'); }
        if (dir === 'right' && this.dx === 0) { this.nextDx = 1; this.nextDy = 0; window.sound?.play('move'); }
    }

    handleKey(e) {
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            this.handleDir('up');
        } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            this.handleDir('down');
        } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            this.handleDir('left');
        } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            this.handleDir('right');
        } else if (e.code === 'Space' && this.isGameOver) {
            e.preventDefault();
            this.restart();
        }
    }

    spawnFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount),
                type: Math.random() < 0.2 ? 'golden' : 'normal'
            };
            valid = !this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
        }
    }

    tick() {
        if (this.isPaused || this.isGameOver) return;

        this.dx = this.nextDx;
        this.dy = this.nextDy;

        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };

        // Wall collisions (wrap or kill? Let's make walls solid with bounce/fail for competitive feel)
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Self collision
        if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food
        if (head.x === this.food.x && head.y === this.food.y) {
            const pts = this.food.type === 'golden' ? 50 : 10;
            this.score += pts;
            this.addParticles(head.x * this.gridSize + 10, head.y * this.gridSize + 10, this.food.type === 'golden' ? '#ffd700' : '#00f0ff');
            window.sound?.play(this.food.type === 'golden' ? 'powerup' : 'score');
            this.spawnFood();

            // Slightly increase speed
            if (this.speed > 55 && this.score % 50 === 0) {
                this.speed = Math.max(55, this.speed - 5);
                clearInterval(this.loopId);
                this.loopId = setInterval(() => this.tick(), this.speed);
            }
            this.updateHud();
        } else {
            this.snake.pop();
        }

        this.render();
    }

    addParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color,
                life: 1.0,
                decay: 0.05 + Math.random() * 0.05
            });
        }
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        ctx.strokeStyle = '#151b33';
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.gridSize, 0);
            ctx.lineTo(i * this.gridSize, this.canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * this.gridSize);
            ctx.lineTo(this.canvas.width, i * this.gridSize);
            ctx.stroke();
        }

        // Draw Food
        const fx = this.food.x * this.gridSize;
        const fy = this.food.y * this.gridSize;
        ctx.save();
        ctx.shadowBlur = 15;
        if (this.food.type === 'golden') {
            ctx.shadowColor = '#ffd700';
            ctx.fillStyle = '#ffd700';
        } else {
            ctx.shadowColor = '#00f0ff';
            ctx.fillStyle = '#00f0ff';
        }
        ctx.beginPath();
        ctx.arc(fx + this.gridSize / 2, fy + this.gridSize / 2, this.gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Snake
        this.snake.forEach((seg, index) => {
            const sx = seg.x * this.gridSize;
            const sy = seg.y * this.gridSize;
            ctx.save();
            if (index === 0) {
                // Head
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#00ff88';
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(sx + 1, sy + 1, this.gridSize - 2, this.gridSize - 2);
                
                // Eyes
                ctx.fillStyle = '#000';
                const eyeSize = 3;
                if (this.dx === 1) {
                    ctx.fillRect(sx + 14, sy + 4, eyeSize, eyeSize);
                    ctx.fillRect(sx + 14, sy + 13, eyeSize, eyeSize);
                } else if (this.dx === -1) {
                    ctx.fillRect(sx + 3, sy + 4, eyeSize, eyeSize);
                    ctx.fillRect(sx + 3, sy + 13, eyeSize, eyeSize);
                } else if (this.dy === -1) {
                    ctx.fillRect(sx + 4, sy + 3, eyeSize, eyeSize);
                    ctx.fillRect(sx + 13, sy + 3, eyeSize, eyeSize);
                } else {
                    ctx.fillRect(sx + 4, sy + 14, eyeSize, eyeSize);
                    ctx.fillRect(sx + 13, sy + 14, eyeSize, eyeSize);
                }
            } else {
                // Body
                const alpha = Math.max(0.3, 1 - (index / this.snake.length) * 0.7);
                ctx.fillStyle = `rgba(0, 220, 130, ${alpha})`;
                ctx.fillRect(sx + 2, sy + 2, this.gridSize - 4, this.gridSize - 4);
            }
            ctx.restore();
        });

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    updateHud() {
        const scoreEl = document.getElementById('snake-score');
        const speedEl = document.getElementById('snake-speed');
        if (scoreEl) scoreEl.textContent = this.score;
        if (speedEl) {
            const speedMultiplier = ((110 / this.speed)).toFixed(1);
            speedEl.textContent = `${speedMultiplier}x`;
        }
    }

    gameOver() {
        this.isGameOver = true;
        clearInterval(this.loopId);
        window.sound?.play('lose');

        const isNewHigh = window.storage.setScore('snake', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('snake', false, this.score, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('snake-overlay');
        const finalScore = document.getElementById('snake-final-score');
        const overlayTitle = document.getElementById('snake-overlay-title');
        const overlayMsg = document.getElementById('snake-overlay-msg');

        if (finalScore) finalScore.textContent = this.score;
        if (overlayTitle) overlayTitle.textContent = isNewHigh ? '🏆 ¡Nuevo Récord!' : '¡Fin de Partida!';
        if (overlayMsg) overlayMsg.innerHTML = `Puntuación: <strong>${this.score}</strong> ${isNewHigh ? '🔥 ¡Mejor marca superada!' : ''}`;
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    restart() {
        this.start();
    }

    destroy() {
        if (this.loopId) clearInterval(this.loopId);
        window.removeEventListener('keydown', this.onKey);
    }
};
