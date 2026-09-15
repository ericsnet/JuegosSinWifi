/**
 * Flappy Cyber / Turbo Drone
 */
window.FlappyCyber = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.width = 400;
        this.height = 540;

        this.drone = {
            x: 80,
            y: 200,
            w: 28,
            h: 22,
            vy: 0,
            gravity: 0.38,
            jumpForce: -6.8,
            rotation: 0
        };

        this.pipes = [];
        this.pipeTimer = 0;
        this.score = 0;
        this.highScore = window.storage.getScore('flappy');
        this.isGameOver = false;
        this.isStarted = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.animationId = null;

        this.onKey = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        };
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper flappy-game">
                <div class="game-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="flappy-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                </div>
                <div class="canvas-container">
                    <canvas id="flappy-canvas" width="400" height="540"></canvas>
                    <div id="flappy-overlay" class="game-overlay">
                        <div class="overlay-card">
                            <h2 id="flappy-overlay-title">Flappy Cyber</h2>
                            <p id="flappy-overlay-msg">Presiona la pantalla o pulsa <b>Espacio</b> para volar</p>
                            <button class="btn btn-primary" id="flappy-btn-action">¡Comenzar Vuelo!</button>
                        </div>
                    </div>
                </div>
                <div class="touch-controls flappy-touch">
                    <button class="touch-btn touch-btn-large touch-btn-accent" id="fbtn-flap">⚡ PROPULSIÓN (TOCA)</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('flappy-canvas');
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('keydown', this.onKey);
        const actionBtn = this.container.querySelector('#flappy-btn-action');
        actionBtn.onclick = () => {
            if (this.isGameOver) {
                this.restart();
            } else {
                this.start();
                this.jump();
            }
        };

        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });
        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.jump();
        });

        const flapBtn = this.container.querySelector('#fbtn-flap');
        if (flapBtn) {
            flapBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
            flapBtn.addEventListener('click', (e) => { e.preventDefault(); this.jump(); });
        }

        this.renderMenu();
    }

    jump() {
        if (!this.isStarted) {
            this.start();
        }
        if (this.isGameOver || this.isPaused) return;

        this.drone.vy = this.drone.jumpForce;
        window.sound?.play('jump');
    }

    start() {
        this.drone = {
            x: 80,
            y: 200,
            w: 28,
            h: 22,
            vy: 0,
            gravity: 0.38,
            jumpForce: -6.8,
            rotation: 0
        };
        this.pipes = [];
        this.pipeTimer = 0;
        this.score = 0;
        this.isGameOver = false;
        this.isStarted = true;
        this.isPaused = false;
        this.startTime = Date.now();

        document.getElementById('flappy-overlay')?.classList.add('hidden');
        this.updateHud();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    loop() {
        if (this.isStarted && !this.isGameOver && !this.isPaused) {
            this.update();
            this.render();
        }
        this.animationId = requestAnimationFrame(this.loop);
    }

    update() {
        // Physics
        this.drone.vy += this.drone.gravity;
        this.drone.y += this.drone.vy;

        // Rotation
        this.drone.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, (this.drone.vy * 0.08)));

        // Floor / Ceiling collision
        if (this.drone.y + this.drone.h / 2 >= this.height - 40 || this.drone.y - this.drone.h / 2 <= 0) {
            this.gameOver();
            return;
        }

        // Spawn pipes
        this.pipeTimer++;
        if (this.pipeTimer > 100) {
            this.pipeTimer = 0;
            const gap = 135;
            const minHeight = 50;
            const maxHeight = this.height - 180 - gap;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

            this.pipes.push({
                x: this.width,
                top: topHeight,
                bottom: this.height - 40 - (topHeight + gap),
                gap,
                w: 48,
                passed: false
            });
        }

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            p.x -= 2.6;

            // Score check
            if (!p.passed && p.x + p.w < this.drone.x) {
                p.passed = true;
                this.score++;
                window.sound?.play('point');
                this.updateHud();
            }

            // Drone Collision with pipes
            const droneLeft = this.drone.x - this.drone.w / 2 + 4;
            const droneRight = this.drone.x + this.drone.w / 2 - 4;
            const droneTop = this.drone.y - this.drone.h / 2 + 4;
            const droneBottom = this.drone.y + this.drone.h / 2 - 4;

            if (droneRight > p.x && droneLeft < p.x + p.w) {
                if (droneTop < p.top || droneBottom > this.height - 40 - p.bottom) {
                    this.gameOver();
                    return;
                }
            }

            if (p.x + p.w < -20) {
                this.pipes.splice(i, 1);
            }
        }
    }

    renderMenu() {
        const ctx = this.ctx;
        if (!ctx) return;
        ctx.fillStyle = '#0b0f1e';
        ctx.fillRect(0, 0, this.width, this.height);
        this.drawCityscape(ctx);
        this.drawGround(ctx);
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#070a14';
        ctx.fillRect(0, 0, this.width, this.height);

        this.drawCityscape(ctx);

        // Pipes
        this.pipes.forEach(p => {
            // Top Pipe
            ctx.save();
            ctx.fillStyle = '#10223d';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(p.x, 0, p.w, p.top);
            ctx.strokeRect(p.x, -2, p.w, p.top + 2);

            // Top Cap
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(p.x - 3, p.top - 12, p.w + 6, 12);

            // Bottom Pipe
            const botY = this.height - 40 - p.bottom;
            ctx.fillStyle = '#10223d';
            ctx.fillRect(p.x, botY, p.w, p.bottom);
            ctx.strokeRect(p.x, botY, p.w, p.bottom + 2);

            // Bottom Cap
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(p.x - 3, botY, p.w + 6, 12);
            ctx.restore();
        });

        // Ground
        this.drawGround(ctx);

        // Draw Drone
        ctx.save();
        ctx.translate(this.drone.x, this.drone.y);
        ctx.rotate(this.drone.rotation);

        // Drone Thruster flame
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ff5500';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-24 - Math.random() * 8, 0);
        ctx.lineTo(-14, 4);
        ctx.closePath();
        ctx.fill();

        // Drone Body
        ctx.fillStyle = '#ff007f';
        ctx.shadowColor = '#ff007f';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.ellipse(5, -2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawCityscape(ctx) {
        ctx.save();
        ctx.fillStyle = '#0f172a';
        // Buildings silhouette
        const buildings = [
            { x: 10, w: 50, h: 140 },
            { x: 70, w: 40, h: 180 },
            { x: 120, w: 60, h: 220 },
            { x: 190, w: 45, h: 160 },
            { x: 245, w: 55, h: 200 },
            { x: 310, w: 40, h: 150 },
            { x: 360, w: 50, h: 190 }
        ];
        buildings.forEach(b => {
            ctx.fillRect(b.x, this.height - 40 - b.h, b.w, b.h);
            // Window lights
            ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
            for (let y = this.height - 35 - b.h; y < this.height - 50; y += 18) {
                ctx.fillRect(b.x + 8, y, 6, 8);
                ctx.fillRect(b.x + b.w - 14, y, 6, 8);
            }
            ctx.fillStyle = '#0f172a';
        });
        ctx.restore();
    }

    drawGround(ctx) {
        ctx.save();
        ctx.fillStyle = '#0e1224';
        ctx.fillRect(0, this.height - 40, this.width, 40);
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.height - 40);
        ctx.lineTo(this.width, this.height - 40);
        ctx.stroke();
        ctx.restore();
    }

    updateHud() {
        const scoreEl = document.getElementById('flappy-score');
        if (scoreEl) scoreEl.textContent = this.score;
    }

    gameOver() {
        this.isGameOver = true;
        window.sound?.play('lose');

        const isNewHigh = window.storage.setScore('flappy', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('flappy', false, this.score, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('flappy-overlay');
        const overlayTitle = document.getElementById('flappy-overlay-title');
        const overlayMsg = document.getElementById('flappy-overlay-msg');
        const btnAction = document.getElementById('flappy-btn-action');

        if (overlayTitle) overlayTitle.textContent = isNewHigh ? '🏆 ¡Nuevo Récord!' : '¡Drone Estrellado!';
        if (overlayMsg) overlayMsg.innerHTML = `Puntuación: <strong>${this.score}</strong>`;
        if (btnAction) btnAction.textContent = 'Intentar de Nuevo';
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() { this.isPaused = true; }
    resume() { this.isPaused = false; }
    restart() { this.start(); }

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.onKey);
    }
};
