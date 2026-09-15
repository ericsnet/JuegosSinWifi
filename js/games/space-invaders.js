/**
 * Space Defender / Retro Invaders
 */
window.SpaceDefender = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.width = 450;
        this.height = 550;

        this.player = {
            x: 225,
            y: 490,
            w: 36,
            h: 36,
            speed: 6,
            lives: 3,
            shield: 0,
            tripleShotTimer: 0,
            shootCooldown: 0
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.stars = [];

        this.score = 0;
        this.wave = 1;
        this.highScore = window.storage.getScore('space');
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.keys = {};

        this.animationId = null;
        this.onKeyDown = (e) => { this.keys[e.code] = true; if (e.code === 'Space' && this.isGameOver) this.restart(); };
        this.onKeyUp = (e) => { this.keys[e.code] = false; };
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper space-game">
                <div class="game-hud space-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="space-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">OLEADA</span><span id="space-wave" class="hud-val">1</span></div>
                    <div class="hud-item"><span class="hud-label">VIDAS</span><span id="space-lives" class="hud-val">❤️❤️❤️</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                </div>
                <div class="canvas-container">
                    <canvas id="space-canvas" width="450" height="550"></canvas>
                    <div id="space-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="space-overlay-title">¡Misión Fallida!</h2>
                            <p id="space-overlay-msg">Puntuación: <span id="space-final-score">0</span></p>
                            <button class="btn btn-primary" id="space-btn-restart">Reintentar Misión</button>
                        </div>
                    </div>
                </div>
                <div class="touch-controls space-touch">
                    <button class="touch-btn touch-btn-large" id="sbtn-left">◀ Izquierda</button>
                    <button class="touch-btn touch-btn-large touch-btn-accent" id="sbtn-fire">🔥 Fuego</button>
                    <button class="touch-btn touch-btn-large" id="sbtn-right">Derecha ▶</button>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('space-canvas');
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('keydown', this.onKeyDown);
        window.addEventListener('keyup', this.onKeyUp);
        this.container.querySelector('#space-btn-restart').onclick = () => this.restart();

        // Touch binds
        this.bindTouch('sbtn-left', () => { this.keys['ArrowLeft'] = true; }, () => { this.keys['ArrowLeft'] = false; });
        this.bindTouch('sbtn-right', () => { this.keys['ArrowRight'] = true; }, () => { this.keys['ArrowRight'] = false; });
        this.bindTouch('sbtn-fire', () => { this.keys['Space'] = true; }, () => { this.keys['Space'] = false; });

        // Touch drag ship on canvas
        this.canvas.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const scaleX = this.canvas.width / rect.width;
            this.player.x = Math.max(20, Math.min(this.width - 20, touchX * scaleX));
            this.keys['Space'] = true;
        }, { passive: true });

        this.start();
    }

    bindTouch(id, onStart, onEnd) {
        const el = this.container.querySelector(`#${id}`);
        if (!el) return;
        el.addEventListener('touchstart', (e) => { e.preventDefault(); onStart(); });
        el.addEventListener('touchend', (e) => { e.preventDefault(); onEnd(); });
        el.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(); });
        el.addEventListener('mouseup', (e) => { e.preventDefault(); onEnd(); });
    }

    start() {
        this.player = {
            x: this.width / 2,
            y: this.height - 60,
            w: 32,
            h: 32,
            speed: 6,
            lives: 3,
            shield: 0,
            tripleShotTimer: 0,
            shootCooldown: 0
        };

        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.score = 0;
        this.wave = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();

        // Init stars
        this.stars = Array.from({ length: 60 }, () => ({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1.5 + 0.5
        }));

        this.spawnWave();
        this.updateHud();
        document.getElementById('space-overlay')?.classList.add('hidden');

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    spawnWave() {
        this.enemies = [];
        const isBossWave = this.wave % 5 === 0;

        if (isBossWave) {
            this.enemies.push({
                x: this.width / 2,
                y: 90,
                w: 64,
                h: 64,
                hp: 20 + this.wave * 10,
                maxHp: 20 + this.wave * 10,
                vx: 2.5,
                type: 'boss',
                shootTimer: 0
            });
        } else {
            const rows = Math.min(5, 2 + Math.floor(this.wave / 2));
            const cols = 7;
            const spacingX = 48;
            const spacingY = 36;
            const startX = (this.width - (cols - 1) * spacingX) / 2;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const type = r === 0 ? 'cruiser' : r === 1 ? 'interceptor' : 'scout';
                    const hp = r === 0 ? 3 : r === 1 ? 2 : 1;
                    this.enemies.push({
                        x: startX + c * spacingX,
                        y: 50 + r * spacingY,
                        w: 26,
                        h: 22,
                        hp,
                        maxHp: hp,
                        vx: 1 + this.wave * 0.15,
                        type,
                        shootTimer: Math.random() * 100
                    });
                }
            }
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
        // Player input
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.player.x = Math.max(20, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.player.x = Math.min(this.width - 20, this.player.x + this.player.speed);
        }

        // Shooting
        if (this.player.shootCooldown > 0) this.player.shootCooldown--;
        if (this.player.tripleShotTimer > 0) this.player.tripleShotTimer--;
        if (this.player.shield > 0) this.player.shield--;

        if ((this.keys['Space'] || this.keys['KeyW'] || this.keys['ArrowUp']) && this.player.shootCooldown <= 0) {
            this.player.shootCooldown = 12;
            window.sound?.play('shoot');

            if (this.player.tripleShotTimer > 0) {
                this.bullets.push({ x: this.player.x, y: this.player.y - 10, vx: 0, vy: -9, color: '#00f0ff' });
                this.bullets.push({ x: this.player.x - 12, y: this.player.y - 6, vx: -2, vy: -8, color: '#00f0ff' });
                this.bullets.push({ x: this.player.x + 12, y: this.player.y - 6, vx: 2, vy: -8, color: '#00f0ff' });
            } else {
                this.bullets.push({ x: this.player.x, y: this.player.y - 10, vx: 0, vy: -9, color: '#00f0ff' });
            }
        }

        // Bullets update
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx;
            b.y += b.vy;
            if (b.y < -10 || b.x < 0 || b.x > this.width) {
                this.bullets.splice(i, 1);
            }
        }

        // Enemy Bullets update
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            eb.x += eb.vx;
            eb.y += eb.vy;

            // Hit player check
            const dist = Math.hypot(eb.x - this.player.x, eb.y - this.player.y);
            if (dist < 18) {
                this.enemyBullets.splice(i, 1);
                this.damagePlayer();
                continue;
            }

            if (eb.y > this.height + 10) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Powerups update
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.y += 2;
            const dist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
            if (dist < 24) {
                window.sound?.play('powerup');
                if (p.type === 'triple') this.player.tripleShotTimer = 400;
                if (p.type === 'shield') this.player.shield = 400;
                if (p.type === 'life') {
                    this.player.lives = Math.min(5, this.player.lives + 1);
                    this.updateHud();
                }
                this.powerups.splice(i, 1);
                continue;
            }
            if (p.y > this.height + 20) this.powerups.splice(i, 1);
        }

        // Enemies update
        let changeDir = false;
        this.enemies.forEach(en => {
            en.x += en.vx;
            if (en.x <= 20 || en.x >= this.width - 20) {
                changeDir = true;
            }

            // Enemy shoot
            en.shootTimer++;
            const shootFreq = en.type === 'boss' ? 35 : Math.max(80, 200 - this.wave * 10);
            if (en.shootTimer > shootFreq) {
                en.shootTimer = 0;
                if (Math.random() < 0.4 || en.type === 'boss') {
                    this.enemyBullets.push({
                        x: en.x,
                        y: en.y + en.h / 2,
                        vx: en.type === 'boss' ? (Math.random() - 0.5) * 4 : 0,
                        vy: 4 + this.wave * 0.2
                    });
                }
            }
        });

        if (changeDir) {
            this.enemies.forEach(en => {
                en.vx *= -1;
                if (en.type !== 'boss') en.y += 12;
            });
        }

        // Bullet vs Enemy Collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const en = this.enemies[j];
                if (Math.abs(b.x - en.x) < en.w / 2 && Math.abs(b.y - en.y) < en.h / 2) {
                    this.bullets.splice(i, 1);
                    en.hp--;
                    this.createExplosion(b.x, b.y, '#00f0ff', 5);

                    if (en.hp <= 0) {
                        const pts = en.type === 'boss' ? 500 : en.type === 'cruiser' ? 60 : 30;
                        this.score += pts;
                        this.updateHud();
                        this.createExplosion(en.x, en.y, en.type === 'boss' ? '#ff0055' : '#ffaa00', 25);
                        window.sound?.play('explosion');

                        // Drop powerup?
                        if (Math.random() < 0.25) {
                            const types = ['triple', 'shield', 'life'];
                            this.powerups.push({
                                x: en.x,
                                y: en.y,
                                type: types[Math.floor(Math.random() * types.length)]
                            });
                        }

                        this.enemies.splice(j, 1);
                    } else {
                        window.sound?.play('hit');
                    }
                    break;
                }
            }
        }

        // Check wave complete
        if (this.enemies.length === 0) {
            this.wave++;
            this.score += 200;
            this.updateHud();
            window.sound?.play('victory');
            this.spawnWave();
        }

        // Enemies reached bottom check
        if (this.enemies.some(en => en.y >= this.player.y - 15)) {
            this.damagePlayer(true);
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Stars scroll
        this.stars.forEach(s => {
            s.y += s.speed;
            if (s.y > this.height) {
                s.y = 0;
                s.x = Math.random() * this.width;
            }
        });
    }

    damagePlayer(instantKill = false) {
        if (this.player.shield > 0 && !instantKill) {
            this.player.shield = 0;
            this.createExplosion(this.player.x, this.player.y, '#00f0ff', 15);
            window.sound?.play('hit');
            return;
        }

        this.player.lives--;
        this.createExplosion(this.player.x, this.player.y, '#ff0055', 20);
        window.sound?.play('hit');
        this.updateHud();

        if (this.player.lives <= 0 || instantKill) {
            this.gameOver();
        }
    }

    createExplosion(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                life: 1.0,
                decay: 0.04 + Math.random() * 0.04
            });
        }
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        // Background
        ctx.fillStyle = '#060814';
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(s => {
            ctx.globalAlpha = s.size > 2 ? 0.9 : 0.4;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1;

        // Powerups
        this.powerups.forEach(p => {
            ctx.save();
            ctx.font = '18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon = p.type === 'triple' ? '⚡' : p.type === 'shield' ? '🛡️' : '❤️';
            ctx.fillText(icon, p.x, p.y);
            ctx.restore();
        });

        // Player bullets
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        this.bullets.forEach(b => {
            ctx.fillRect(b.x - 2, b.y - 6, 4, 12);
        });
        ctx.shadowBlur = 0;

        // Enemy bullets
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 6;
        this.enemyBullets.forEach(eb => {
            ctx.beginPath();
            ctx.arc(eb.x, eb.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Draw Enemies
        this.enemies.forEach(en => {
            ctx.save();
            ctx.translate(en.x, en.y);

            if (en.type === 'boss') {
                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.shadowBlur = 15;
                // Boss ship shape
                ctx.beginPath();
                ctx.moveTo(0, 32);
                ctx.lineTo(-30, -20);
                ctx.lineTo(-10, -30);
                ctx.lineTo(10, -30);
                ctx.lineTo(30, -20);
                ctx.closePath();
                ctx.fill();

                // Boss HP bar
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(-25, -40, 50, 6);
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(-25, -40, (en.hp / en.maxHp) * 50, 6);
            } else {
                ctx.fillStyle = en.type === 'cruiser' ? '#ffaa00' : '#ff0055';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.moveTo(0, 10);
                ctx.lineTo(-12, -10);
                ctx.lineTo(12, -10);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        });

        // Draw Player
        ctx.save();
        ctx.translate(this.player.x, this.player.y);
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 12;

        // Starship geometry
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.lineTo(-16, 14);
        ctx.lineTo(-8, 8);
        ctx.lineTo(8, 8);
        ctx.lineTo(16, 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-3, -8, 6, 8);

        // Shield aura
        if (this.player.shield > 0) {
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();

        // Draw Particles
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
        const scoreEl = document.getElementById('space-score');
        const waveEl = document.getElementById('space-wave');
        const livesEl = document.getElementById('space-lives');
        if (scoreEl) scoreEl.textContent = this.score;
        if (waveEl) waveEl.textContent = this.wave;
        if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, this.player.lives));
    }

    gameOver() {
        this.isGameOver = true;
        window.sound?.play('gameover');

        const isNewHigh = window.storage.setScore('space', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('space', false, this.score, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('space-overlay');
        const finalScore = document.getElementById('space-final-score');
        const overlayTitle = document.getElementById('space-overlay-title');
        const overlayMsg = document.getElementById('space-overlay-msg');

        if (finalScore) finalScore.textContent = this.score;
        if (overlayTitle) overlayTitle.textContent = isNewHigh ? '🏆 ¡Nuevo Récord Cósmico!' : '¡Nave Destruida!';
        if (overlayMsg) overlayMsg.innerHTML = `Puntuación: <strong>${this.score}</strong> | Oleada: <strong>${this.wave}</strong>`;
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
