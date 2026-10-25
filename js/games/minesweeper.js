/**
 * Buscaminas Deluxe
 */
window.Minesweeper = class {
    constructor(container) {
        this.container = container;
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 12, cols: 12, mines: 25 },
            hard: { rows: 16, cols: 16, mines: 45 }
        };
        this.currentDiff = 'easy';
        this.board = [];
        this.revealedCount = 0;
        this.flagCount = 0;
        this.firstClick = true;
        this.isGameOver = false;
        this.won = false;
        this.flagMode = false; // For mobile toggle
        this.timer = 0;
        this.timerInterval = null;
        this.startTime = Date.now();
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper mines-game">
                <div class="mines-diff-selector">
                    <button class="btn btn-sm btn-outline active" data-diff="easy">Fácil (9x9)</button>
                    <button class="btn btn-sm btn-outline" data-diff="medium">Medio (12x12)</button>
                    <button class="btn btn-sm btn-outline" data-diff="hard">Difícil (16x16)</button>
                </div>

                <div class="game-hud mines-hud">
                    <div class="hud-item"><span class="hud-label">MINAS</span><span id="mines-count" class="hud-val">10</span></div>
                    <button class="btn btn-icon" id="mines-face-btn">🙂</button>
                    <div class="hud-item"><span class="hud-label">TIEMPO</span><span id="mines-timer" class="hud-val">000</span></div>
                </div>

                <div class="mines-mobile-toolbar">
                    <button class="btn btn-toggle" id="mines-flag-toggle">🚩 Modo Bandera: OFF</button>
                </div>

                <div class="mines-board-container">
                    <div id="mines-board" class="mines-board"></div>
                    <div id="mines-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="mines-overlay-title">¡Victoria!</h2>
                            <p id="mines-overlay-msg">Tiempo: <span id="mines-final-time">0</span>s</p>
                            <button class="btn btn-primary" id="mines-overlay-restart">Jugar de Nuevo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind difficulty buttons
        const diffBtns = this.container.querySelectorAll('.mines-diff-selector button');
        diffBtns.forEach(btn => {
            btn.onclick = () => {
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDiff = btn.dataset.diff;
                this.start();
            };
        });

        // Face button
        this.container.querySelector('#mines-face-btn').onclick = () => this.start();
        this.container.querySelector('#mines-overlay-restart').onclick = () => this.start();

        // Mobile Flag mode toggle
        const flagToggle = this.container.querySelector('#mines-flag-toggle');
        flagToggle.onclick = () => {
            this.flagMode = !this.flagMode;
            flagToggle.classList.toggle('active', this.flagMode);
            flagToggle.textContent = `🚩 Modo Bandera: ${this.flagMode ? 'ON' : 'OFF'}`;
            window.sound?.play('select');
        };

        this.start();
    }

    start() {
        const config = this.difficulties[this.currentDiff];
        this.rows = config.rows;
        this.cols = config.cols;
        this.totalMines = config.mines;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.firstClick = true;
        this.isGameOver = false;
        this.won = false;
        this.timer = 0;
        this.startTime = Date.now();

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.setFace('🙂');
        this.updateHud();
        document.getElementById('mines-overlay')?.classList.add('hidden');

        // Create empty board
        this.board = Array.from({ length: this.rows }, (_, r) => 
            Array.from({ length: this.cols }, (_, c) => ({
                row: r,
                col: c,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            }))
        );

        this.renderBoard();
    }

    setFace(emoji) {
        const face = document.getElementById('mines-face-btn');
        if (face) face.textContent = emoji;
    }

    plantMines(safeRow, safeCol) {
        let planted = 0;
        while (planted < this.totalMines) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);

            // Don't plant on or immediately around first click
            if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
            if (!this.board[r][c].isMine) {
                this.board[r][c].isMine = true;
                planted++;
            }
        }

        // Calculate neighbor numbers
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (!this.board[r][c].isMine) {
                    let count = 0;
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc].isMine) {
                                count++;
                            }
                        }
                    }
                    this.board[r][c].neighborMines = count;
                }
            }
        }
    }

    handleClick(r, c) {
        if (this.isGameOver) return;
        const cell = this.board[r][c];

        if (this.flagMode) {
            this.handleRightClick(r, c);
            return;
        }

        if (cell.isFlagged || cell.isRevealed) return;

        if (this.firstClick) {
            this.firstClick = false;
            this.plantMines(r, c);
            this.timerInterval = setInterval(() => {
                this.timer++;
                this.updateHud();
            }, 1000);
        }

        if (cell.isMine) {
            this.revealAllMines();
            this.gameOver(false);
            return;
        }

        this.revealCell(r, c);
        window.sound?.play('tap');

        if (this.checkWin()) {
            this.gameOver(true);
        }
    }

    handleRightClick(r, c, e) {
        if (e) e.preventDefault();
        if (this.isGameOver) return;
        const cell = this.board[r][c];
        if (cell.isRevealed) return;

        cell.isFlagged = !cell.isFlagged;
        this.flagCount += cell.isFlagged ? 1 : -1;
        window.sound?.play('flag');
        this.updateHud();
        this.updateCellDom(r, c);
    }

    revealCell(r, c) {
        const cell = this.board[r][c];
        if (cell.isRevealed || cell.isFlagged) return;

        cell.isRevealed = true;
        this.revealedCount++;
        this.updateCellDom(r, c);

        // Flood fill empty zeroes
        if (cell.neighborMines === 0 && !cell.isMine) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                        this.revealCell(nr, nc);
                    }
                }
            }
        }
    }

    revealAllMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].isMine) {
                    this.board[r][c].isRevealed = true;
                    this.updateCellDom(r, c);
                }
            }
        }
    }

    checkWin() {
        return this.revealedCount === (this.rows * this.cols - this.totalMines);
    }

    renderBoard() {
        const boardEl = document.getElementById('mines-board');
        if (!boardEl) return;
        boardEl.innerHTML = '';
        boardEl.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const btn = document.createElement('button');
                btn.className = 'mines-cell';
                btn.id = `mcell-${r}-${c}`;
                
                btn.onclick = () => this.handleClick(r, c);
                btn.oncontextmenu = (e) => this.handleRightClick(r, c, e);
                
                boardEl.appendChild(btn);
            }
        }
    }

    updateCellDom(r, c) {
        const btn = document.getElementById(`mcell-${r}-${c}`);
        if (!btn) return;
        const cell = this.board[r][c];

        btn.className = 'mines-cell';
        if (cell.isRevealed) {
            btn.classList.add('revealed');
            if (cell.isMine) {
                btn.classList.add('mine');
                btn.textContent = '💣';
            } else if (cell.neighborMines > 0) {
                btn.classList.add(`num-${cell.neighborMines}`);
                btn.textContent = cell.neighborMines;
            } else {
                btn.textContent = '';
            }
        } else if (cell.isFlagged) {
            btn.classList.add('flagged');
            btn.textContent = '🚩';
        } else {
            btn.textContent = '';
        }
    }

    updateHud() {
        const countEl = document.getElementById('mines-count');
        const timerEl = document.getElementById('mines-timer');
        if (countEl) countEl.textContent = Math.max(0, this.totalMines - this.flagCount);
        if (timerEl) timerEl.textContent = String(this.timer).padStart(3, '0');
    }

    gameOver(won) {
        this.isGameOver = true;
        this.won = won;
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.setFace(won ? '😎' : '😵');
        window.sound?.play(won ? 'win' : 'lose');

        const score = won ? Math.max(10, 1000 - this.timer * 5 + (this.totalMines * 10)) : 0;
        window.storage.setScore('minesweeper', score);
        window.storage.recordGamePlay('minesweeper', won, score, this.timer);
        window.achievements?.checkAll();

        const overlay = document.getElementById('mines-overlay');
        const overlayTitle = document.getElementById('mines-overlay-title');
        const overlayMsg = document.getElementById('mines-overlay-msg');
        const finalTime = document.getElementById('mines-final-time');

        if (finalTime) finalTime.textContent = this.timer;
        if (overlayTitle) overlayTitle.textContent = won ? '🎉 ¡Campo Desminado con Éxito!' : '💥 ¡BOOM! Mina Detonada';
        if (overlayMsg) overlayMsg.innerHTML = won ? `Tiempo: <strong>${this.timer}s</strong> | Puntos: <strong>${score}</strong>` : 'Ten más cuidado con los radares.';
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};
