/**
 * 2048 Neon Fusion
 */
window.Game2048 = class {
    constructor(container) {
        this.container = container;
        this.size = 4;
        this.grid = [];
        this.history = [];
        this.score = 0;
        this.highScore = window.storage.getScore('game2048');
        this.isGameOver = false;
        this.won = false;
        this.startTime = Date.now();
        this.onKey = this.handleKey.bind(this);
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper g2048-game">
                <div class="game-hud g2048-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="g2048-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">RÉCORD</span><span class="hud-val">${this.highScore}</span></div>
                    <button class="btn btn-secondary btn-sm" id="g2048-undo-btn">↩ Deshacer</button>
                    <button class="btn btn-primary btn-sm" id="g2048-restart-btn">🔄 Nuevo</button>
                </div>

                <div class="g2048-board-container">
                    <div id="g2048-board" class="g2048-board grid-4"></div>
                    <div id="g2048-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="g2048-overlay-title">¡Juego Terminado!</h2>
                            <p id="g2048-overlay-msg">Sin más movimientos posibles</p>
                            <button class="btn btn-primary" id="g2048-overlay-restart">Jugar de Nuevo</button>
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

        window.addEventListener('keydown', this.onKey);
        this.container.querySelector('#g2048-undo-btn').onclick = () => this.undo();
        this.container.querySelector('#g2048-restart-btn').onclick = () => this.restart();
        this.container.querySelector('#g2048-overlay-restart').onclick = () => this.restart();

        // Touch buttons
        const dpadBtns = this.container.querySelectorAll('.dpad-btn');
        dpadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.dir) this.move(btn.dataset.dir);
            });
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (btn.dataset.dir) this.move(btn.dataset.dir);
            });
        });

        // Touch swipe on board
        const board = this.container.querySelector('#g2048-board');
        let touchStartX = 0;
        let touchStartY = 0;
        board.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        board.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
                this.move(dx > 0 ? 'right' : 'left');
            } else if (Math.abs(dy) > 30) {
                this.move(dy > 0 ? 'down' : 'up');
            }
        }, { passive: true });

        this.start();
    }

    start() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.score = 0;
        this.history = [];
        this.isGameOver = false;
        this.won = false;
        this.startTime = Date.now();

        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.updateHud();
        document.getElementById('g2048-overlay')?.classList.add('hidden');
    }

    saveState() {
        this.history.push({
            grid: this.grid.map(row => [...row]),
            score: this.score
        });
        if (this.history.length > 20) this.history.shift();
    }

    undo() {
        if (this.history.length === 0 || this.isGameOver) return;
        const previous = this.history.pop();
        this.grid = previous.grid;
        this.score = previous.score;
        window.sound?.play('select');
        this.render();
        this.updateHud();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) emptyCells.push({ r, c });
            }
        }
        if (emptyCells.length === 0) return;
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    handleKey(e) {
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            this.move('up');
        } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            this.move('down');
        } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            this.move('left');
        } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            this.move('right');
        } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            this.undo();
        }
    }

    move(dir) {
        if (this.isGameOver) return;

        this.saveState();
        let rotated = this.grid.map(row => [...row]);
        let rotations = 0;

        if (dir === 'left') rotations = 0;
        else if (dir === 'up') rotations = 3;
        else if (dir === 'right') rotations = 2;
        else if (dir === 'down') rotations = 1;

        for (let i = 0; i < rotations; i++) {
            rotated = this.rotateMatrix(rotated);
        }

        let moved = false;
        let gainedScore = 0;

        for (let r = 0; r < this.size; r++) {
            let row = rotated[r].filter(val => val !== 0);
            for (let c = 0; c < row.length - 1; c++) {
                if (row[c] === row[c + 1]) {
                    row[c] *= 2;
                    gainedScore += row[c];
                    row.splice(c + 1, 1);
                    moved = true;
                }
            }
            while (row.length < this.size) row.push(0);
            if (!this.arraysEqual(rotated[r], row)) moved = true;
            rotated[r] = row;
        }

        for (let i = 0; i < (4 - rotations) % 4; i++) {
            rotated = this.rotateMatrix(rotated);
        }

        if (moved) {
            this.grid = rotated;
            this.score += gainedScore;
            this.addRandomTile();
            if (gainedScore > 0) {
                window.sound?.play('match');
            } else {
                window.sound?.play('move');
            }
            this.render();
            this.updateHud();

            if (this.checkWin() && !this.won) {
                this.won = true;
                window.sound?.play('win');
            }

            if (this.checkGameOver()) {
                this.gameOver();
            }
        } else {
            this.history.pop(); // discard redundant history
        }
    }

    rotateMatrix(matrix) {
        const n = matrix.length;
        const res = Array.from({ length: n }, () => Array(n).fill(0));
        for (let r = 0; r < n; r++) {
            for (let c = 0; c < n; c++) {
                res[c][n - 1 - r] = matrix[r][c];
            }
        }
        return res;
    }

    arraysEqual(a, b) {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }

    checkWin() {
        return this.grid.some(row => row.some(cell => cell >= 2048));
    }

    checkGameOver() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return false;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return false;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return false;
            }
        }
        return true;
    }

    render() {
        const board = document.getElementById('g2048-board');
        if (!board) return;
        board.innerHTML = '';

        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.grid[r][c];
                const cell = document.createElement('div');
                cell.className = `g2048-cell ${val > 0 ? `tile-${val}` : 'tile-empty'}`;
                cell.textContent = val > 0 ? val : '';
                board.appendChild(cell);
            }
        }
    }

    updateHud() {
        const scoreEl = document.getElementById('g2048-score');
        if (scoreEl) scoreEl.textContent = this.score;
    }

    gameOver() {
        this.isGameOver = true;
        window.sound?.play('lose');

        const isNewHigh = window.storage.setScore('game2048', this.score);
        const playTime = Math.floor((Date.now() - this.startTime) / 1000);
        window.storage.recordGamePlay('game2048', this.won, this.score, playTime);
        window.achievements?.checkAll();

        const overlay = document.getElementById('g2048-overlay');
        const overlayTitle = document.getElementById('g2048-overlay-title');
        const overlayMsg = document.getElementById('g2048-overlay-msg');

        if (overlayTitle) overlayTitle.textContent = this.won ? '🎉 ¡Alcanzaste el 2048!' : (isNewHigh ? '🏆 ¡Nuevo Récord!' : '¡Sin Movimientos!');
        if (overlayMsg) overlayMsg.innerHTML = `Puntuación: <strong>${this.score}</strong>`;
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        window.removeEventListener('keydown', this.onKey);
    }
};
