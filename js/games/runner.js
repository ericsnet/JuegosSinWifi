/**
 * Neon Dino Runner
 */
window.DinoRunner = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.width = 600;
        this.height = 300;

        this.groundY = 240;
        this.dino = {
            x: 60,
            y: 240,
            w: 32,
            h: 44,
            vy: 0,
            gravity: 0.65,
            jumpForce: -12.5,
            isGrounded: true,
            isDucking: false,
            runFrame: 0
        };

        this.obstacles = [];
        this.obstacleTimer = 0;
        this.minObstacleInterval = 75;
        this.speed = 6.0;
        this.distance = 0;
        this.highScore = window.storage.getScore('runner');
        this.particles = [];
        this.stars = [];
        this.isGameOver = false;
        this.isPaused = false;
        this.animationId = null;
        this.startTime = Date.now();

        this.onKeyDown = (e) => {
            if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
                e.preventDefault();
                this.jump();
            } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
                e.preventDefault();
                this.duck(true);
            }
        };

        this.onKeyUp = (e) => {
            if (['ArrowDown', 'KeyS'].includes(e.code)) {
                this.duck(false);
            }
        };
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper runner-game">
                <div class="game-hud runner-hud">
                    <div class="hud-item"><span class="hud-label">DISTANCIA</span><span id="runner-score" class="hud-val">0 m</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore} m</span></div>
                    <div class="hud-item"><span class="hud-label">VELOCIDAD</span><span id="runner-speed" class="hud-val">1.0x</span></div>
                </div>

                <div class="canvas-container">
                    <canvas id="runner-canvas" width="600" height="300"></canvas>
                    <div id="runner-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="runner-overlay-title">¡Fin de Carrera!</h2>
                            <p id="runner-overlay-msg"></p>
                            <button class="btn btn-primary" id="runner-btn-restart">Correr de Nuevo</button>
                        </div>
                    </div>
                </div>

                <div class="touch-controls runner-touch">
                    <button class="touch-btn touch-btn-large" id="rbtn-duck">🔽 AGACHARSE</button>
                    <button class="touch-btn touch-btn-large touch-btn-accent" id="rbtn-jump">🔼 SALTAR</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('runner-canvas');
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.container.querySelector('#runner-btn-restart').onclick = () => this.restart();

        // Canvas touch jump
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jump();
        });

        // Touch buttons
        const jumpBtn = this.container.querySelector('#rbtn-jump');
        const duckBtn = this.container.querySelector('#rbtn-duck');

        jumpBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
        jumpBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.jump(); });

        duckBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.duck(true); });
        duckBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.duck(false); });
        duckBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.duck(true); });
        duckBtn.addEventListener('mouseup', (e) => { e.preventDefault(); this.duck(false); });

        this.start();
    }

    start() {
        this.dino = {
            x: 60,
            y: this.groundY,
            w: 32,
            h: 44,
            vy: 0,
            gravity: 0.65,
            jumpForce: -12.5,
            isGrounded: true,
            isDucking: false,
            runFrame: 0
        };

        this.obstacles = [];
        this.particles = [];
        this.obstacleTimer = 0;
        this.speed = 6.0;
        this.distance = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();

        // Init decorative stars
        this.stars = Array.from({ length: 40 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * (this.groundY - 50),
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2
        }));

        document.getElementById('runner-overlay')?.classList.add('hidden');
        this.updateHud();

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    jump() {
        if (this.isGameOver) {
            this.restart();
            return;
        }
        if (this.dino.isGrounded && !this.isPaused) {
            this.dino.vy = this.dino.jumpForce;
            this.dino.isGrounded = false;
            window.sound?.play('jump');

            // Jump particles
            for (let i = 0; i < 8; i++) {
                this.particles.push({
                    x: this.dino.x + 10,
                    y: this.groundY,
                    vx: (Math.random() - 0.7) * 4,
                    vy: (Math.random() - 0.5) * 2,
                    color: '#00ff88',
                    life: 1.0,
                    decay: 0.08
                });
            }
        }
    }

    duck(isDucking) {
        if (this.isGameOver || this.isPaused) return;
        this.dino.isDucking = isDucking;
        if (isDucking) {
            this.dino.h = 24;
            if (!this.dino.isGrounded) {
                this.dino.vy += 4; // Fast fall
            }
        } else {
            this.dino.h = 44;
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
        this.distance += Math.floor(this.speed / 4);
        if (this.distance % 200 === 0) {
            this.speed = Math.min(14, this.speed + 0.25);
            window.sound?.play('score');
        }

        // Dino physics
        if (!this.dino.isGrounded) {
            this.dino.vy += this.dino.gravity;
            this.dino.y += this.dino.vy;

            if (this.dino.y >= this.groundY) {
                this.dino.y = this.groundY;
                this.dino.vy = 0;
                this.dino.isGrounded = true;
            }
        }

        this.dino.runFrame += 0.2;

        // Obstacle Spawning
        this.obstacleTimer++;
        if (this.obstacleTimer > this.minObstacleInterval) {
            if (Math.random() < 0.04) {
                this.obstacleTimer = 0;
                const isFlying = Math.random() < 0.35 && this.distance > 300;

                if (isFlying) {
                    this.obstacles.push({
                        x: this.width + 20,
                        y: this.groundY - 45,
                        w: 36,
                        h: 22,
                        type: 'drone'
                    });
                } else {
                    const cactusTypes = [
                        { w: 20, h: 42 },
                        { w: 38, h: 42 },
                        { w: 18, h: 32 }
                    ];
                    const chosen = cactusTypes[Math.floor(Math.random() * cactusTypes.length)];
                    this.obstacles.push({
                        x: this.width + 20,
                        y: this.groundY - chosen.h,
                        w: chosen.w,
                        h: chosen.h,
                        type: 'cactus'
                    });
                }
            }
        }

        // Obstacles Move & Collision Check
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const ob = this.obstacles[i];
            ob.x -= this.speed;

            // Collision check
            const dinoLeft = this.dino.x + 4;
            const dinoRight = this.dino.x + this.dino.w - 4;
            const dinoTop = this.dino.y - this.dino.h + 4;
            const dinoBottom = this.dino.y - 2;

            const obLeft = ob.x + 2;
            const obRight = ob.x + ob.w - 2;
            const obTop = ob.y;
            const obBottom = ob.y + ob.h;

            if (dinoRight > obLeft && dinoLeft < obRight && dinoBottom > obTop && dinoTop < obBottom) {
                this.gameOver();
                return;
            }

            if (ob.x + ob.w < -20) {
                this.obstacles.splice(i, 1);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        this.updateHud();
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(s => {
            s.x -= s.speed;
            if (s.x < 0) s.x = this.width;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1;

        // Ground line
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Obstacles
        this.obstacles.forEach(ob => {
            ctx.save();
            if (ob.type === 'drone') {
                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 10;
                // Flying drone
                ctx.beginPath();
                ctx.ellipse(ob.x + ob.w / 2, ob.y + ob.h / 2, ob.w / 2, ob.h / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(ob.x + 8, ob.y + 6, 8, 8);
            } else {
                ctx.fillStyle = '#ff7700';
                ctx.shadowColor = '#ff7700';
                ctx.shadowBlur = 8;
                // Cactus / Laser Pylon
                ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(ob.x + 4, ob.y + 4, ob.w - 8, 4);
            }
            ctx.restore();
        });

        // Draw Dino
        ctx.save();
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;

        const dX = this.dino.x;
        const dY = this.dino.y - this.dino.h;

        if (this.dino.isDucking) {
            // Ducking Cyber Dino
            ctx.fillRect(dX, dY + 10, this.dino.w + 12, this.dino.h);
            // Eye
            ctx.fillStyle = '#000000';
            ctx.fillRect(dX + this.dino.w + 4, dY + 14, 4, 4);
        } else {
            // Standing / Running Cyber Dino
            // Body
            ctx.fillRect(dX + 6, dY + 12, 22, 24);
            // Head
            ctx.fillRect(dX + 16, dY, 18, 16);
            // Eye
            ctx.fillStyle = '#000000';
            ctx.fillRect(dX + 26, dY + 4, 4, 4);
            // Tail
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(dX, dY + 18, 8, 10);

            // Legs animation
            const legOffset = Math.sin(this.dino.runFrame * 3) * 6;
            ctx.fillRect(dX + 10, dY + 36, 4, 8 + (this.dino.isGrounded ? legOffset : 0));
            ctx.fillRect(dX + 20, dY + 36, 4, 8 - (this.dino.isGrounded ? legOffset : 0));
        }

        ctx.restore();

        // Particles
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    updateHud() {
        const scoreEl = document.getElementById('runner-score');
        const speedEl = document.getElementById('runner-speed');
        if (scoreEl) scoreEl.textContent = `${this.distance} m`;
        if (speedEl) speedEl.textContent = `${(this.speed / 6.0).toFixed(1)}x`;
    }

    gameOver() {
        this.isGameOver = true;
        window.sound?.play('gameover');

        const isNewHigh = window.storage.setScore('runner', this.distance);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('runner', false, this.distance, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('runner-overlay');
        const title = document.getElementById('runner-overlay-title');
        const msg = document.getElementById('runner-overlay-msg');

        if (title) title.textContent = isNewHigh ? '🏆 ¡Nuevo Récord de Distancia!' : '¡Impacto Detectado!';
        if (msg) msg.innerHTML = `Recorrido: <strong>${this.distance} metros</strong>`;
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
