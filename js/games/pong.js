/**
 * Cyber Pong
 */
window.CyberPong = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.width = 500;
        this.height = 360;

        this.paddleW = 12;
        this.paddleH = 70;
        this.p1 = { y: 145, vy: 0, score: 0 };
        this.p2 = { y: 145, vy: 0, score: 0 };
        this.ball = { x: 250, y: 180, vx: 5, vy: 2, radius: 7 };
        this.targetScore = 5;
        this.mode = 'ai'; // 'ai' or '2p'
        this.aiDifficulty = 0.85; // AI tracking factor
        this.isGameOver = false;
        this.isPaused = false;
        this.animationId = null;
        this.keys = {};
        this.startTime = Date.now();

        this.onKeyDown = (e) => { this.keys[e.code] = true; };
        this.onKeyUp = (e) => { this.keys[e.code] = false; };
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper pong-game">
                <div class="pong-top-bar">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline active" id="pong-mode-1p">🤖 1 Jugador</button>
                        <button class="btn btn-sm btn-outline" id="pong-mode-2p">👥 2 Jugadores</button>
                    </div>
                    <select id="pong-diff-select" class="form-select">
                        <option value="0.7">IA Normal</option>
                        <option value="0.88" selected>IA Difícil</option>
                        <option value="0.98">IA Imbatible</option>
                    </select>
                </div>

                <div class="game-hud pong-hud">
                    <div class="hud-item"><span class="hud-label" id="pong-p1-label">JUGADOR 1</span><span id="pong-p1-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">OBJETIVO</span><span class="hud-val">${this.targetScore} PTS</span></div>
                    <div class="hud-item"><span class="hud-label" id="pong-p2-label">IA</span><span id="pong-p2-score" class="hud-val">0</span></div>
                </div>

                <div class="canvas-container">
                    <canvas id="pong-canvas" width="500" height="360"></canvas>
                    <div id="pong-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="pong-overlay-title">¡Victoria!</h2>
                            <p id="pong-overlay-msg"></p>
                            <button class="btn btn-primary" id="pong-btn-restart">Jugar Otra Partida</button>
                        </div>
                    </div>
                </div>

                <div class="touch-controls pong-touch">
                    <div class="pong-touch-half" id="pong-touch-left">
                        <span>Arrastra o Toca aquí para mover P1</span>
                    </div>
                    <div class="pong-touch-half" id="pong-touch-right">
                        <span>Arrastra o Toca aquí para mover P2</span>
                    </div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('pong-canvas');
        this.ctx = this.canvas.getContext('2d');

        const btn1p = this.container.querySelector('#pong-mode-1p');
        const btn2p = this.container.querySelector('#pong-mode-2p');
        const diffSel = this.container.querySelector('#pong-diff-select');

        btn1p.onclick = () => {
            btn1p.classList.add('active');
            btn2p.classList.remove('active');
            diffSel.style.display = 'inline-block';
            this.mode = 'ai';
            this.updateLabels();
            this.start();
        };

        btn2p.onclick = () => {
            btn2p.classList.add('active');
            btn1p.classList.remove('active');
            diffSel.style.display = 'none';
            this.mode = '2p';
            this.updateLabels();
            this.start();
        };

        diffSel.onchange = (e) => {
            this.aiDifficulty = parseFloat(e.target.value);
            this.start();
        };

        this.container.querySelector('#pong-btn-restart').onclick = () => this.start();

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);

        // Touch control handlers
        const touchLeft = this.container.querySelector('#pong-touch-left');
        const touchRight = this.container.querySelector('#pong-touch-right');

        const handleLeftTouch = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touchY = e.touches[0].clientY - rect.top;
            const scaleY = this.canvas.height / rect.height;
            this.p1.y = Math.max(0, Math.min(this.height - this.paddleH, touchY * scaleY - this.paddleH / 2));
        };

        const handleRightTouch = (e) => {
            e.preventDefault();
            if (this.mode !== '2p') return;
            const rect = this.canvas.getBoundingClientRect();
            const touchY = e.touches[0].clientY - rect.top;
            const scaleY = this.canvas.height / rect.height;
            this.p2.y = Math.max(0, Math.min(this.height - this.paddleH, touchY * scaleY - this.paddleH / 2));
        };

        touchLeft.addEventListener('touchmove', handleLeftTouch, { passive: false });
        touchLeft.addEventListener('touchstart', handleLeftTouch, { passive: false });
        touchRight.addEventListener('touchmove', handleRightTouch, { passive: false });
        touchRight.addEventListener('touchstart', handleRightTouch, { passive: false });

        this.start();
    }

    updateLabels() {
        const p2Label = document.getElementById('pong-p2-label');
        if (p2Label) p2Label.textContent = this.mode === 'ai' ? 'IA' : 'JUGADOR 2';
    }

    start() {
        this.p1 = { y: this.height / 2 - this.paddleH / 2, vy: 0, score: 0 };
        this.p2 = { y: this.height / 2 - this.paddleH / 2, vy: 0, score: 0 };
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.resetBall(1);

        document.getElementById('pong-overlay')?.classList.add('hidden');
        this.updateHud();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    resetBall(dir) {
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
        const angle = (Math.random() * 0.8 - 0.4);
        const speed = 5.5;
        this.ball.vx = dir * speed * Math.cos(angle);
        this.ball.vy = speed * Math.sin(angle);
    }

    loop() {
        if (!this.isGameOver && !this.isPaused) {
            this.update();
            this.render();
        }
        this.animationId = requestAnimationFrame(this.loop);
    }

    update() {
        const pSpeed = 6;

        // Player 1 input (W / S or ArrowUp / ArrowDown in single player)
        if (this.keys['KeyW'] || (this.mode === 'ai' && this.keys['ArrowUp'])) {
            this.p1.y = Math.max(0, this.p1.y - pSpeed);
        }
        if (this.keys['KeyS'] || (this.mode === 'ai' && this.keys['ArrowDown'])) {
            this.p1.y = Math.min(this.height - this.paddleH, this.p1.y + pSpeed);
        }

        // Player 2 or AI
        if (this.mode === '2p') {
            if (this.keys['ArrowUp']) {
                this.p2.y = Math.max(0, this.p2.y - pSpeed);
            }
            if (this.keys['ArrowDown']) {
                this.p2.y = Math.min(this.height - this.paddleH, this.p2.y + pSpeed);
            }
        } else {
            // AI logic
            const targetY = this.ball.y - this.paddleH / 2;
            const diff = targetY - this.p2.y;
            this.p2.y += diff * this.aiDifficulty * 0.12;
            this.p2.y = Math.max(0, Math.min(this.height - this.paddleH, this.p2.y));
        }

        // Ball movement
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Wall collisions (Top / Bottom)
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -1;
            window.sound?.play('tap');
        } else if (this.ball.y + this.ball.radius >= this.height) {
            this.ball.y = this.height - this.ball.radius;
            this.ball.vy *= -1;
            window.sound?.play('tap');
        }

        // Paddle 1 collision (Left)
        const p1X = 20;
        if (this.ball.x - this.ball.radius <= p1X + this.paddleW &&
            this.ball.x + this.ball.radius >= p1X &&
            this.ball.y >= this.p1.y && this.ball.y <= this.p1.y + this.paddleH) {
            
            this.ball.x = p1X + this.paddleW + this.ball.radius;
            const relativeIntersectY = (this.p1.y + (this.paddleH / 2)) - this.ball.y;
            const normalized = relativeIntersectY / (this.paddleH / 2);
            const bounceAngle = normalized * (Math.PI / 3.5);
            const currentSpeed = Math.min(10, Math.hypot(this.ball.vx, this.ball.vy) * 1.05);

            this.ball.vx = currentSpeed * Math.cos(bounceAngle);
            this.ball.vy = -currentSpeed * Math.sin(bounceAngle);
            window.sound?.play('hit');
        }

        // Paddle 2 collision (Right)
        const p2X = this.width - 20 - this.paddleW;
        if (this.ball.x + this.ball.radius >= p2X &&
            this.ball.x - this.ball.radius <= p2X + this.paddleW &&
            this.ball.y >= this.p2.y && this.ball.y <= this.p2.y + this.paddleH) {

            this.ball.x = p2X - this.ball.radius;
            const relativeIntersectY = (this.p2.y + (this.paddleH / 2)) - this.ball.y;
            const normalized = relativeIntersectY / (this.paddleH / 2);
            const bounceAngle = normalized * (Math.PI / 3.5);
            const currentSpeed = Math.min(10, Math.hypot(this.ball.vx, this.ball.vy) * 1.05);

            this.ball.vx = -currentSpeed * Math.cos(bounceAngle);
            this.ball.vy = -currentSpeed * Math.sin(bounceAngle);
            window.sound?.play('hit');
        }

        // Score check
        if (this.ball.x < 0) {
            this.p2.score++;
            window.sound?.play('lose');
            this.updateHud();
            if (this.p2.score >= this.targetScore) {
                this.gameOver(2);
            } else {
                this.resetBall(1);
            }
        } else if (this.ball.x > this.width) {
            this.p1.score++;
            window.sound?.play('score');
            this.updateHud();
            if (this.p1.score >= this.targetScore) {
                this.gameOver(1);
            } else {
                this.resetBall(-1);
            }
        }
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Center line
        ctx.strokeStyle = '#1a233d';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 0);
        ctx.lineTo(this.width / 2, this.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Paddle 1 (Cyan)
        ctx.save();
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(20, this.p1.y, this.paddleW, this.paddleH);
        ctx.restore();

        // Paddle 2 (Magenta)
        ctx.save();
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.width - 20 - this.paddleW, this.p2.y, this.paddleW, this.paddleH);
        ctx.restore();

        // Ball (Yellow/White)
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    updateHud() {
        const p1ScoreEl = document.getElementById('pong-p1-score');
        const p2ScoreEl = document.getElementById('pong-p2-score');
        if (p1ScoreEl) p1ScoreEl.textContent = this.p1.score;
        if (p2ScoreEl) p2ScoreEl.textContent = this.p2.score;
    }

    gameOver(winner) {
        this.isGameOver = true;
        const won = winner === 1;

        window.sound?.play(won ? 'victory' : 'lose');
        if (won) {
            const score = (window.storage.getScore('pong') || 0) + 150;
            window.storage.setScore('pong', score);
        }
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('pong', won, won ? 150 : 0, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('pong-overlay');
        const title = document.getElementById('pong-overlay-title');
        const msg = document.getElementById('pong-overlay-msg');

        if (title) title.textContent = won ? '🏆 ¡Victoria Imparable!' : '💀 ¡Derrota!';
        if (msg) msg.textContent = won ? '¡Has superado a tu oponente con reflejos impecables!' : 'Mejor suerte para la próxima ronda.';
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() { this.isPaused = true; }
    resume() { this.isPaused = false; }
    restart() { this.start(); }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.onKeyDown);
        window.removeEventListener('keyup', this.onKeyUp);
    }
};
