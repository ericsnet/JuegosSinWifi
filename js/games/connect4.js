/**
 * Conecta 4 / Cuatro en Línea
 */
window.ConnectFour = class {
    constructor(container) {
        this.container = container;
        this.rows = 6;
        this.cols = 7;
        this.board = [];
        this.mode = 'ai'; // 'ai' or 'pvp'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.currentPlayer = 1; // 1 = Red (Player), 2 = Yellow (AI/P2)
        this.isGameOver = false;
        this.winningCells = [];
        this.p1Wins = 0;
        this.p2Wins = 0;
        this.isAiThinking = false;
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper c4-game">
                <div class="c4-settings-bar">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline active" id="c4-mode-ai">🤖 vs IA</button>
                        <button class="btn btn-sm btn-outline" id="c4-mode-pvp">👥 2 Jugadores</button>
                    </div>
                    <select id="c4-ai-diff" class="form-select">
                        <option value="easy">IA Fácil</option>
                        <option value="medium" selected>IA Normal</option>
                        <option value="hard">IA Imbatible</option>
                    </select>
                </div>

                <div class="game-hud c4-hud">
                    <div class="hud-item player-indicator p1-active" id="c4-turn-display">
                        <span class="chip-circle p1"></span>
                        <span id="c4-turn-text">Turno: Jugador 1 (Rojo)</span>
                    </div>
                    <div class="c4-score-counter">
                        <span class="p1-score">P1: <strong id="c4-p1-wins">0</strong></span>
                        <span class="p2-score">P2/IA: <strong id="c4-p2-wins">0</strong></span>
                    </div>
                </div>

                <div class="c4-board-container">
                    <div class="c4-col-selectors">
                        ${[0,1,2,3,4,5,6].map(c => `<button class="c4-col-drop-btn" data-col="${c}">▼</button>`).join('')}
                    </div>
                    <div id="c4-board" class="c4-grid"></div>
                    <div id="c4-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="c4-overlay-title">¡Victoria!</h2>
                            <p id="c4-overlay-msg"></p>
                            <button class="btn btn-primary" id="c4-overlay-restart">Nueva Ronda</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btnAi = this.container.querySelector('#c4-mode-ai');
        const btnPvp = this.container.querySelector('#c4-mode-pvp');
        const aiDiffSelect = this.container.querySelector('#c4-ai-diff');

        btnAi.onclick = () => {
            btnAi.classList.add('active');
            btnPvp.classList.remove('active');
            aiDiffSelect.style.display = 'inline-block';
            this.mode = 'ai';
            this.start();
        };

        btnPvp.onclick = () => {
            btnPvp.classList.add('active');
            btnAi.classList.remove('active');
            aiDiffSelect.style.display = 'none';
            this.mode = 'pvp';
            this.start();
        };

        aiDiffSelect.onchange = (e) => {
            this.aiDifficulty = e.target.value;
            this.start();
        };

        this.container.querySelectorAll('.c4-col-drop-btn').forEach(btn => {
            btn.onclick = () => this.dropPiece(parseInt(btn.dataset.col, 10));
        });

        this.container.querySelector('#c4-overlay-restart').onclick = () => this.start();

        this.start();
    }

    start() {
        this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
        this.currentPlayer = 1;
        this.isGameOver = false;
        this.winningCells = [];
        this.isAiThinking = false;

        document.getElementById('c4-overlay')?.classList.add('hidden');
        this.renderBoard();
        this.updateHud();
    }

    renderBoard() {
        const boardEl = document.getElementById('c4-board');
        if (!boardEl) return;
        boardEl.innerHTML = '';

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'c4-cell';
                const val = this.board[r][c];
                
                const isWin = this.winningCells.some(w => w.r === r && w.c === c);
                if (val === 1) cell.classList.add('p1-chip');
                if (val === 2) cell.classList.add('p2-chip');
                if (isWin) cell.classList.add('win-pulse');

                cell.onclick = () => this.dropPiece(c);
                boardEl.appendChild(cell);
            }
        }
    }

    dropPiece(col) {
        if (this.isGameOver || this.isAiThinking) return;
        if (this.board[0][col] !== 0) return; // column is full

        // Find lowest empty row in column
        let row = -1;
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                row = r;
                break;
            }
        }

        if (row === -1) return;

        this.board[row][col] = this.currentPlayer;
        window.sound?.play('tap');
        this.renderBoard();

        const win = this.checkWin(row, col, this.currentPlayer);
        if (win) {
            this.winningCells = win;
            this.renderBoard();
            this.handleGameEnd(this.currentPlayer);
            return;
        }

        if (this.isBoardFull()) {
            this.handleGameEnd(0); // Draw
            return;
        }

        // Switch player
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.updateHud();

        if (this.mode === 'ai' && this.currentPlayer === 2 && !this.isGameOver) {
            this.isAiThinking = true;
            setTimeout(() => this.makeAiMove(), 450);
        }
    }

    makeAiMove() {
        if (this.isGameOver) return;
        const col = this.getBestMove();
        this.isAiThinking = false;
        this.dropPiece(col);
    }

    getBestMove() {
        const validCols = [];
        for (let c = 0; c < this.cols; c++) {
            if (this.board[0][c] === 0) validCols.push(c);
        }

        if (this.aiDifficulty === 'easy') {
            return validCols[Math.floor(Math.random() * validCols.length)];
        }

        // 1. Can AI win in one move?
        for (const c of validCols) {
            const r = this.getNextOpenRow(c);
            this.board[r][c] = 2;
            if (this.checkWin(r, c, 2)) {
                this.board[r][c] = 0;
                return c;
            }
            this.board[r][c] = 0;
        }

        // 2. Can Player win in one move? Block it!
        for (const c of validCols) {
            const r = this.getNextOpenRow(c);
            this.board[r][c] = 1;
            if (this.checkWin(r, c, 1)) {
                this.board[r][c] = 0;
                return c;
            }
            this.board[r][c] = 0;
        }

        if (this.aiDifficulty === 'medium') {
            // Prefer center columns
            const centerOrder = [3, 2, 4, 1, 5, 0, 6];
            for (const c of centerOrder) {
                if (validCols.includes(c)) return c;
            }
        }

        // Hard: Minimax depth 4
        return this.minimaxBestCol(4);
    }

    getNextOpenRow(c) {
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][c] === 0) return r;
        }
        return -1;
    }

    minimaxBestCol(depth) {
        let bestScore = -Infinity;
        let bestCol = 3;
        const validCols = [3, 2, 4, 1, 5, 0, 6].filter(c => this.board[0][c] === 0);

        for (const c of validCols) {
            const r = this.getNextOpenRow(c);
            this.board[r][c] = 2;
            const score = this.minimax(depth - 1, false, -Infinity, Infinity);
            this.board[r][c] = 0;
            if (score > bestScore) {
                bestScore = score;
                bestCol = c;
            }
        }
        return bestCol;
    }

    minimax(depth, isMax, alpha, beta) {
        if (depth === 0) return 0;
        const validCols = [3, 2, 4, 1, 5, 0, 6].filter(c => this.board[0][c] === 0);
        if (validCols.length === 0) return 0;

        if (isMax) {
            let maxEval = -Infinity;
            for (const c of validCols) {
                const r = this.getNextOpenRow(c);
                this.board[r][c] = 2;
                if (this.checkWin(r, c, 2)) {
                    this.board[r][c] = 0;
                    return 1000 + depth;
                }
                const evaluation = this.minimax(depth - 1, false, alpha, beta);
                this.board[r][c] = 0;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const c of validCols) {
                const r = this.getNextOpenRow(c);
                this.board[r][c] = 1;
                if (this.checkWin(r, c, 1)) {
                    this.board[r][c] = 0;
                    return -1000 - depth;
                }
                const evaluation = this.minimax(depth - 1, true, alpha, beta);
                this.board[r][c] = 0;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    checkWin(r, c, player) {
        const directions = [
            [[0, 1], [0, -1]],  // Horizontal
            [[1, 0], [-1, 0]],  // Vertical
            [[1, 1], [-1, -1]], // Diagonal \
            [[1, -1], [-1, 1]]  // Diagonal /
        ];

        for (const dir of directions) {
            let streak = [{ r, c }];
            for (const [dr, dc] of dir) {
                let nr = r + dr;
                let nc = c + dc;
                while (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.board[nr][nc] === player) {
                    streak.push({ r: nr, c: nc });
                    nr += dr;
                    nc += dc;
                }
            }
            if (streak.length >= 4) return streak;
        }
        return null;
    }

    isBoardFull() {
        return this.board[0].every(cell => cell !== 0);
    }

    handleGameEnd(winner) {
        this.isGameOver = true;
        const overlay = document.getElementById('c4-overlay');
        const overlayTitle = document.getElementById('c4-overlay-title');
        const overlayMsg = document.getElementById('c4-overlay-msg');

        if (winner === 1) {
            this.p1Wins++;
            window.sound?.play('win');
            if (overlayTitle) overlayTitle.textContent = '🎉 ¡Victoria del Jugador 1!';
            if (overlayMsg) overlayMsg.textContent = this.mode === 'ai' ? '¡Has vencido a la inteligencia artificial!' : '¡Victoria para el equipo Rojo!';
            window.storage.setScore('connect4', (window.storage.getScore('connect4') || 0) + 100);
            window.storage.recordGamePlay('connect4', true, 100, 30);
        } else if (winner === 2) {
            this.p2Wins++;
            window.sound?.play('lose');
            if (overlayTitle) overlayTitle.textContent = this.mode === 'ai' ? '🤖 La IA ha Ganado' : '🎉 ¡Victoria del Jugador 2!';
            if (overlayMsg) overlayMsg.textContent = this.mode === 'ai' ? '¡Sigue practicando tus estrategias!' : '¡Victoria para el equipo Amarillo!';
            window.storage.recordGamePlay('connect4', false, 0, 30);
        } else {
            window.sound?.play('select');
            if (overlayTitle) overlayTitle.textContent = '🤝 ¡Empate!';
            if (overlayMsg) overlayMsg.textContent = 'Tablero completo sin ganador.';
        }

        window.achievements?.checkAll();
        this.updateHud();
        if (overlay) overlay.classList.remove('hidden');
    }

    updateHud() {
        const turnText = document.getElementById('c4-turn-text');
        const turnDisplay = document.getElementById('c4-turn-display');
        const p1WinsEl = document.getElementById('c4-p1-wins');
        const p2WinsEl = document.getElementById('c4-p2-wins');

        if (p1WinsEl) p1WinsEl.textContent = this.p1Wins;
        if (p2WinsEl) p2WinsEl.textContent = this.p2Wins;

        if (turnDisplay && turnText) {
            turnDisplay.className = `hud-item player-indicator ${this.currentPlayer === 1 ? 'p1-active' : 'p2-active'}`;
            if (this.currentPlayer === 1) {
                turnText.textContent = 'Turno: Jugador 1 (Rojo)';
            } else {
                turnText.textContent = this.mode === 'ai' ? 'Turno: IA (Amarillo)...' : 'Turno: Jugador 2 (Amarillo)';
            }
        }
    }

    pause() {}
    resume() {}
    restart() { this.start(); }
    destroy() {}
};
