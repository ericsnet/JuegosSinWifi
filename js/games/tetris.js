/**
 * Neon Tetris / TetroBlocks
 */
window.NeonTetris = class {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.nextCanvas = null;
        this.nextCtx = null;
        this.holdCanvas = null;
        this.holdCtx = null;

        this.cols = 10;
        this.rows = 20;
        this.blockSize = 20;
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.holdPiece = null;
        this.canHold = true;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.highScore = window.storage.getScore('tetris');
        this.dropInterval = 800;
        this.lastDropTime = 0;
        this.animationId = null;
        this.isGameOver = false;
        this.isPaused = false;
        this.startTime = Date.now();
        this.flashRows = [];

        this.SHAPES = {
            I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00f0ff' },
            J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: '#0051ff' },
            L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: '#ff7700' },
            O: { shape: [[1,1], [1,1]], color: '#ffd700' },
            S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: '#00ff66' },
            T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: '#aa00ff' },
            Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: '#ff0055' }
        };
        this.KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

        this.onKey = this.handleKey.bind(this);
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper tetris-game">
                <div class="tetris-layout">
                    <div class="tetris-side-panel">
                        <div class="side-box">
                            <span class="side-label">GUARDAR (C)</span>
                            <canvas id="tetris-hold-canvas" width="80" height="80"></canvas>
                        </div>
                        <div class="side-box stats-box">
                            <span class="side-label">NIVEL</span>
                            <span id="tetris-level" class="stat-val">1</span>
                            <span class="side-label">LÍNEAS</span>
                            <span id="tetris-lines" class="stat-val">0</span>
                        </div>
                    </div>

                    <div class="canvas-container">
                        <div class="game-hud tetris-hud">
                            <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="tetris-score" class="hud-val">0</span></div>
                            <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                        </div>
                        <canvas id="tetris-canvas" width="200" height="400"></canvas>
                        <div id="tetris-overlay" class="game-overlay hidden">
                            <div class="overlay-card">
                                <h2 id="tetris-overlay-title">¡Fin del Juego!</h2>
                                <p id="tetris-overlay-msg">Puntos: <span id="tetris-final-score">0</span></p>
                                <button class="btn btn-primary" id="tetris-btn-restart">Jugar de Nuevo (Espacio)</button>
                            </div>
                        </div>
                    </div>

                    <div class="tetris-side-panel">
                        <div class="side-box">
                            <span class="side-label">SIGUIENTE</span>
                            <canvas id="tetris-next-canvas" width="80" height="80"></canvas>
                        </div>
                        <div class="side-box controls-tip">
                            <span>🎮 ◄ ► Mover</span>
                            <span>▲ / X Rotar</span>
                            <span>▼ Bajar</span>
                            <span>Espacio Caída</span>
                        </div>
                    </div>
                </div>

                <div class="touch-controls tetris-touch">
                    <div class="touch-btn-group">
                        <button class="touch-btn" id="tbtn-hold">Hold</button>
                        <button class="touch-btn" id="tbtn-rot">⟳ Rotar</button>
                        <button class="touch-btn touch-btn-accent" id="tbtn-drop">⚡ Caída</button>
                    </div>
                    <div class="touch-btn-group">
                        <button class="touch-btn" id="tbtn-left">◀ Izq</button>
                        <button class="touch-btn" id="tbtn-down">▼ Bajar</button>
                        <button class="touch-btn" id="tbtn-right">▶ Der</button>
                    </div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('tetris-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('tetris-next-canvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.holdCanvas = document.getElementById('tetris-hold-canvas');
        this.holdCtx = this.holdCanvas.getContext('2d');

        window.addEventListener('keydown', this.onKey);
        this.container.querySelector('#tetris-btn-restart').onclick = () => this.restart();

        // Touch control binds
        this.bindTouch('tbtn-left', () => this.moveLeft());
        this.bindTouch('tbtn-right', () => this.moveRight());
        this.bindTouch('tbtn-down', () => this.moveDown());
        this.bindTouch('tbtn-rot', () => this.rotate());
        this.bindTouch('tbtn-drop', () => this.hardDrop());
        this.bindTouch('tbtn-hold', () => this.hold());

        this.start();
    }

    bindTouch(id, action) {
        const el = this.container.querySelector(`#${id}`);
        if (!el) return;
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            action();
        });
        el.addEventListener('click', (e) => {
            e.preventDefault();
            action();
        });
    }

    start() {
        this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 800;
        this.isGameOver = false;
        this.isPaused = false;
        this.holdPiece = null;
        this.canHold = true;
        this.startTime = Date.now();
        this.flashRows = [];

        this.nextPiece = this.randomPiece();
        this.spawnPiece();
        this.updateHud();
        document.getElementById('tetris-overlay')?.classList.add('hidden');

        this.lastDropTime = performance.now();
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.loop = this.loop.bind(this);
        this.animationId = requestAnimationFrame(this.loop);
    }

    randomPiece() {
        const type = this.KEYS[Math.floor(Math.random() * this.KEYS.length)];
        const proto = this.SHAPES[type];
        return {
            type,
            shape: proto.shape.map(r => [...r]),
            color: proto.color,
            x: Math.floor((this.cols - proto.shape[0].length) / 2),
            y: 0
        };
    }

    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.randomPiece();
        this.canHold = true;
        this.drawSideCanvas(this.nextCtx, this.nextPiece);

        if (this.collide(this.currentPiece)) {
            this.gameOver();
        }
    }

    hold() {
        if (!this.canHold || this.isGameOver || this.isPaused) return;
        window.sound?.play('select');
        const type = this.currentPiece.type;
        if (!this.holdPiece) {
            this.holdPiece = {
                type,
                shape: this.SHAPES[type].shape.map(r => [...r]),
                color: this.SHAPES[type].color
            };
            this.spawnPiece();
        } else {
            const tempType = this.holdPiece.type;
            this.holdPiece = {
                type,
                shape: this.SHAPES[type].shape.map(r => [...r]),
                color: this.SHAPES[type].color
            };
            this.currentPiece = {
                type: tempType,
                shape: this.SHAPES[tempType].shape.map(r => [...r]),
                color: this.SHAPES[tempType].color,
                x: Math.floor((this.cols - this.SHAPES[tempType].shape[0].length) / 2),
                y: 0
            };
        }
        this.canHold = false;
        this.drawSideCanvas(this.holdCtx, this.holdPiece);
    }

    collide(piece, offsetX = 0, offsetY = 0, newShape = piece.shape) {
        for (let r = 0; r < newShape.length; r++) {
            for (let c = 0; c < newShape[r].length; c++) {
                if (newShape[r][c]) {
                    const nextX = piece.x + c + offsetX;
                    const nextY = piece.y + r + offsetY;
                    if (nextX < 0 || nextX >= this.cols || nextY >= this.rows) return true;
                    if (nextY >= 0 && this.grid[nextY][nextX]) return true;
                }
            }
        }
        return false;
    }

    moveLeft() {
        if (this.isGameOver || this.isPaused) return;
        if (!this.collide(this.currentPiece, -1, 0)) {
            this.currentPiece.x--;
            window.sound?.play('move');
        }
    }

    moveRight() {
        if (this.isGameOver || this.isPaused) return;
        if (!this.collide(this.currentPiece, 1, 0)) {
            this.currentPiece.x++;
            window.sound?.play('move');
        }
    }

    moveDown() {
        if (this.isGameOver || this.isPaused) return;
        if (!this.collide(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            this.score += 1;
            this.updateHud();
        } else {
            this.lockPiece();
        }
    }

    hardDrop() {
        if (this.isGameOver || this.isPaused) return;
        let dropDistance = 0;
        while (!this.collide(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            dropDistance++;
        }
        this.score += dropDistance * 2;
        window.sound?.play('drop');
        this.lockPiece();
    }

    rotate() {
        if (this.isGameOver || this.isPaused) return;
        const orig = this.currentPiece.shape;
        const rows = orig.length;
        const cols = orig[0].length;
        const rotated = Array.from({ length: cols }, () => Array(rows).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                rotated[c][rows - 1 - r] = orig[r][c];
            }
        }

        // Wall kick check
        let offset = 0;
        if (this.collide(this.currentPiece, 0, 0, rotated)) {
            if (!this.collide(this.currentPiece, 1, 0, rotated)) offset = 1;
            else if (!this.collide(this.currentPiece, -1, 0, rotated)) offset = -1;
            else if (!this.collide(this.currentPiece, 2, 0, rotated)) offset = 2;
            else if (!this.collide(this.currentPiece, -2, 0, rotated)) offset = -2;
            else return; // Cannot rotate
        }
        this.currentPiece.shape = rotated;
        this.currentPiece.x += offset;
        window.sound?.play('move');
    }

    lockPiece() {
        const p = this.currentPiece;
        for (let r = 0; r < p.shape.length; r++) {
            for (let c = 0; c < p.shape[r].length; c++) {
                if (p.shape[r][c]) {
                    if (p.y + r < 0) {
                        this.gameOver();
                        return;
                    }
                    this.grid[p.y + r][p.x + c] = p.color;
                }
            }
        }

        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let cleared = 0;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.grid[r].every(cell => cell !== 0)) {
                this.grid.splice(r, 1);
                this.grid.unshift(Array(this.cols).fill(0));
                cleared++;
                r++; // Recheck same row index
            }
        }

        if (cleared > 0) {
            const linePoints = [0, 100, 300, 500, 800];
            this.score += (linePoints[cleared] || 1000) * this.level;
            this.lines += cleared;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(120, 800 - (this.level - 1) * 70);

            if (cleared === 4) {
                window.sound?.play('combo');
            } else {
                window.sound?.play('clear');
            }
            this.updateHud();
        }
    }

    getGhostY() {
        let ghostY = this.currentPiece.y;
        while (!this.collide(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        return ghostY;
    }

    loop(timestamp) {
        if (this.isGameOver) return;
        if (!this.isPaused) {
            if (timestamp - this.lastDropTime > this.dropInterval) {
                this.moveDown();
                this.lastDropTime = timestamp;
            }
            this.render();
        }
        this.animationId = requestAnimationFrame(this.loop);
    }

    render() {
        const ctx = this.ctx;
        if (!ctx) return;

        ctx.fillStyle = '#0a0d1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        ctx.strokeStyle = '#151b33';
        ctx.lineWidth = 1;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                ctx.strokeRect(c * this.blockSize, r * this.blockSize, this.blockSize, this.blockSize);
            }
        }

        // Draw placed blocks
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c]) {
                    this.drawBlock(ctx, c, r, this.grid[r][c]);
                }
            }
        }

        // Draw Ghost
        if (this.currentPiece) {
            const ghostY = this.getGhostY();
            const p = this.currentPiece;
            for (let r = 0; r < p.shape.length; r++) {
                for (let c = 0; c < p.shape[r].length; c++) {
                    if (p.shape[r][c]) {
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                        ctx.strokeStyle = p.color;
                        ctx.lineWidth = 1;
                        const bx = (p.x + c) * this.blockSize;
                        const by = (ghostY + r) * this.blockSize;
                        ctx.fillRect(bx + 1, by + 1, this.blockSize - 2, this.blockSize - 2);
                        ctx.strokeRect(bx + 1, by + 1, this.blockSize - 2, this.blockSize - 2);
                    }
                }
            }

            // Draw Active Piece
            for (let r = 0; r < p.shape.length; r++) {
                for (let c = 0; c < p.shape[r].length; c++) {
                    if (p.shape[r][c]) {
                        this.drawBlock(ctx, p.x + c, p.y + r, p.color);
                    }
                }
            }
        }
    }

    drawBlock(ctx, x, y, color) {
        const bx = x * this.blockSize;
        const by = y * this.blockSize;
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = color;
        ctx.fillRect(bx + 1, by + 1, this.blockSize - 2, this.blockSize - 2);
        
        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(bx + 2, by + 2, this.blockSize - 4, 3);
        ctx.restore();
    }

    drawSideCanvas(ctx, piece) {
        if (!ctx) return;
        ctx.clearRect(0, 0, 80, 80);
        if (!piece) return;

        const size = 16;
        const shape = piece.shape;
        const offsetX = (80 - shape[0].length * size) / 2;
        const offsetY = (80 - shape.length * size) / 2;

        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    ctx.save();
                    ctx.shadowColor = piece.color;
                    ctx.shadowBlur = 5;
                    ctx.fillStyle = piece.color;
                    ctx.fillRect(offsetX + c * size + 1, offsetY + r * size + 1, size - 2, size - 2);
                    ctx.restore();
                }
            }
        }
    }

    updateHud() {
        const scoreEl = document.getElementById('tetris-score');
        const levelEl = document.getElementById('tetris-level');
        const linesEl = document.getElementById('tetris-lines');
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
        if (linesEl) linesEl.textContent = this.lines;
    }

    handleKey(e) {
        if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            this.moveLeft();
        } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            this.moveRight();
        } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            this.moveDown();
        } else if (['ArrowUp', 'KeyW', 'KeyX'].includes(e.code)) {
            e.preventDefault();
            this.rotate();
        } else if (e.code === 'Space') {
            e.preventDefault();
            if (this.isGameOver) this.restart();
            else this.hardDrop();
        } else if (['KeyC', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
            e.preventDefault();
            this.hold();
        }
    }

    gameOver() {
        this.isGameOver = true;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        window.sound?.play('lose');

        const isNewHigh = window.storage.setScore('tetris', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('tetris', false, this.score, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('tetris-overlay');
        const finalScore = document.getElementById('tetris-final-score');
        const overlayTitle = document.getElementById('tetris-overlay-title');
        const overlayMsg = document.getElementById('tetris-overlay-msg');

        if (finalScore) finalScore.textContent = this.score;
        if (overlayTitle) overlayTitle.textContent = isNewHigh ? '🏆 ¡Nuevo Récord!' : '¡Fin del Juego!';
        if (overlayMsg) overlayMsg.innerHTML = `Puntuación: <strong>${this.score}</strong> | Líneas: <strong>${this.lines}</strong>`;
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
