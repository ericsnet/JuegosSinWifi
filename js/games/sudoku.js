/**
 * Sudoku Master
 */
window.SudokuMaster = class {
    constructor(container) {
        this.container = container;
        this.difficulties = {
            easy: 38,
            medium: 30,
            hard: 24,
            expert: 20
        };
        this.currentDiff = 'easy';
        this.solution = [];
        this.initialGrid = [];
        this.currentGrid = [];
        this.notesGrid = [];
        this.selectedCell = null;
        this.noteMode = false;
        this.mistakes = 0;
        this.maxMistakes = 3;
        this.timer = 0;
        this.timerInterval = null;
        this.isGameOver = false;
        this.won = false;
        this.onKey = this.handleKey.bind(this);
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper sudoku-game">
                <div class="sudoku-diff-bar">
                    <button class="btn btn-sm btn-outline active" data-diff="easy">Fácil</button>
                    <button class="btn btn-sm btn-outline" data-diff="medium">Medio</button>
                    <button class="btn btn-sm btn-outline" data-diff="hard">Difícil</button>
                    <button class="btn btn-sm btn-outline" data-diff="expert">Experto</button>
                </div>

                <div class="game-hud sudoku-hud">
                    <div class="hud-item"><span class="hud-label">ERRORES</span><span id="sudoku-mistakes" class="hud-val">0 / 3</span></div>
                    <div class="hud-item"><span class="hud-label">TIEMPO</span><span id="sudoku-timer" class="hud-val">00:00</span></div>
                    <button class="btn btn-sm btn-primary" id="sudoku-new-game-btn">🔄 Nuevo</button>
                </div>

                <div class="sudoku-board-container">
                    <div id="sudoku-grid" class="sudoku-grid"></div>
                    <div id="sudoku-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2 id="sudoku-overlay-title">¡Sudoku Completado!</h2>
                            <p id="sudoku-overlay-msg"></p>
                            <button class="btn btn-primary" id="sudoku-overlay-restart">Nuevo Sudoku</button>
                        </div>
                    </div>
                </div>

                <div class="sudoku-keypad-container">
                    <div class="sudoku-tools">
                        <button class="btn btn-tool" id="sudoku-tool-undo">↩ Borrar</button>
                        <button class="btn btn-tool" id="sudoku-tool-pencil">✏️ Lápiz: OFF</button>
                        <button class="btn btn-tool" id="sudoku-tool-hint">💡 Pista</button>
                    </div>
                    <div class="sudoku-numpad">
                        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="btn btn-num" data-num="${n}">${n}</button>`).join('')}
                    </div>
                </div>
            </div>
        `;

        const diffBtns = this.container.querySelectorAll('.sudoku-diff-bar button');
        diffBtns.forEach(btn => {
            btn.onclick = () => {
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentDiff = btn.dataset.diff;
                this.start();
            };
        });

        window.addEventListener('keydown', this.onKey);
        this.container.querySelector('#sudoku-new-game-btn').onclick = () => this.start();
        this.container.querySelector('#sudoku-overlay-restart').onclick = () => this.start();

        // Keypad buttons
        this.container.querySelectorAll('.sudoku-numpad button').forEach(btn => {
            btn.onclick = () => this.enterNumber(parseInt(btn.dataset.num, 10));
        });

        // Tools
        this.container.querySelector('#sudoku-tool-undo').onclick = () => this.clearCell();
        const pencilBtn = this.container.querySelector('#sudoku-tool-pencil');
        pencilBtn.onclick = () => {
            this.noteMode = !this.noteMode;
            pencilBtn.classList.toggle('active', this.noteMode);
            pencilBtn.textContent = `✏️ Lápiz: ${this.noteMode ? 'ON' : 'OFF'}`;
            window.sound?.play('select');
        };
        this.container.querySelector('#sudoku-tool-hint').onclick = () => this.useHint();

        this.start();
    }

    start() {
        this.mistakes = 0;
        this.timer = 0;
        this.isGameOver = false;
        this.won = false;
        this.selectedCell = null;
        this.notesGrid = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateHud();
        }, 1000);

        document.getElementById('sudoku-overlay')?.classList.add('hidden');

        this.generatePuzzle();
        this.renderGrid();
        this.updateHud();
    }

    generatePuzzle() {
        // Generate valid completed board
        this.solution = Array.from({ length: 9 }, () => Array(9).fill(0));
        this.fillGrid(this.solution);

        // Clone solution
        this.initialGrid = this.solution.map(r => [...r]);

        // Remove numbers according to difficulty
        const clues = this.difficulties[this.currentDiff];
        let toRemove = 81 - clues;
        while (toRemove > 0) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.initialGrid[r][c] !== 0) {
                this.initialGrid[r][c] = 0;
                toRemove--;
            }
        }

        this.currentGrid = this.initialGrid.map(r => [...r]);
    }

    fillGrid(grid) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    this.shuffleArray(numbers);
                    for (const num of numbers) {
                        if (this.isValidPlacement(grid, r, c, num)) {
                            grid[r][c] = num;
                            if (this.fillGrid(grid)) return true;
                            grid[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    isValidPlacement(grid, r, c, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[r][i] === num && i !== c) return false;
            if (grid[i][c] === num && i !== r) return false;
        }
        const boxR = Math.floor(r / 3) * 3;
        const boxC = Math.floor(c / 3) * 3;
        for (let dr = 0; dr < 3; dr++) {
            for (let dc = 0; dc < 3; dc++) {
                if ((boxR + dr !== r || boxC + dc !== c) && grid[boxR + dr][boxC + dc] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    renderGrid() {
        const gridEl = document.getElementById('sudoku-grid');
        if (!gridEl) return;
        gridEl.innerHTML = '';

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cell = document.createElement('div');
                cell.className = 'sudoku-cell';
                cell.dataset.row = r;
                cell.dataset.col = c;

                if (r % 3 === 2 && r < 8) cell.classList.add('border-bottom-thick');
                if (c % 3 === 2 && c < 8) cell.classList.add('border-right-thick');

                const initialVal = this.initialGrid[r][c];
                const currentVal = this.currentGrid[r][c];

                if (initialVal !== 0) {
                    cell.classList.add('initial-val');
                    cell.textContent = initialVal;
                } else if (currentVal !== 0) {
                    cell.classList.add('user-val');
                    cell.textContent = currentVal;
                } else {
                    const notes = this.notesGrid[r][c];
                    if (notes && notes.length > 0) {
                        cell.classList.add('has-notes');
                        cell.innerHTML = `<div class="notes-grid">${notes.sort().join(' ')}</div>`;
                    }
                }

                cell.onclick = () => this.selectCell(r, c);
                gridEl.appendChild(cell);
            }
        }
    }

    selectCell(r, c) {
        this.selectedCell = { r, c };
        this.highlightSelection();
        window.sound?.play('tap');
    }

    highlightSelection() {
        const cells = this.container.querySelectorAll('.sudoku-cell');
        cells.forEach(cell => {
            const r = parseInt(cell.dataset.row, 10);
            const c = parseInt(cell.dataset.col, 10);
            cell.classList.remove('selected', 'highlighted', 'same-number');

            if (!this.selectedCell) return;

            const selectedVal = this.currentGrid[this.selectedCell.r][this.selectedCell.c];

            if (r === this.selectedCell.r && c === this.selectedCell.c) {
                cell.classList.add('selected');
            } else if (r === this.selectedCell.r || c === this.selectedCell.c || 
                       (Math.floor(r / 3) === Math.floor(this.selectedCell.r / 3) && Math.floor(c / 3) === Math.floor(this.selectedCell.c / 3))) {
                cell.classList.add('highlighted');
            }

            if (selectedVal !== 0 && this.currentGrid[r][c] === selectedVal) {
                cell.classList.add('same-number');
            }
        });
    }

    enterNumber(num) {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        if (this.initialGrid[r][c] !== 0) return; // cannot edit initial clues

        if (this.noteMode) {
            const notes = this.notesGrid[r][c];
            const idx = notes.indexOf(num);
            if (idx >= 0) notes.splice(idx, 1);
            else notes.push(num);
            this.currentGrid[r][c] = 0;
            this.renderGrid();
            this.highlightSelection();
            return;
        }

        this.notesGrid[r][c] = [];
        if (num === this.solution[r][c]) {
            // Correct
            this.currentGrid[r][c] = num;
            window.sound?.play('score');
            this.renderGrid();
            this.highlightSelection();

            if (this.checkWin()) {
                this.gameOver(true);
            }
        } else {
            // Mistake
            this.mistakes++;
            window.sound?.play('hit');
            this.updateHud();

            if (this.mistakes >= this.maxMistakes) {
                this.gameOver(false);
            }
        }
    }

    clearCell() {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        if (this.initialGrid[r][c] !== 0) return;

        this.currentGrid[r][c] = 0;
        this.notesGrid[r][c] = [];
        this.renderGrid();
        this.highlightSelection();
        window.sound?.play('tap');
    }

    useHint() {
        if (!this.selectedCell || this.isGameOver) return;
        const { r, c } = this.selectedCell;
        if (this.initialGrid[r][c] !== 0 || this.currentGrid[r][c] === this.solution[r][c]) return;

        this.currentGrid[r][c] = this.solution[r][c];
        this.notesGrid[r][c] = [];
        window.sound?.play('powerup');
        this.renderGrid();
        this.highlightSelection();

        if (this.checkWin()) {
            this.gameOver(true);
        }
    }

    handleKey(e) {
        if (this.isGameOver) return;
        if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9'].includes(e.code)) {
            const n = parseInt(e.key, 10);
            this.enterNumber(n);
        } else if (['Backspace', 'Delete'].includes(e.code)) {
            this.clearCell();
        } else if (this.selectedCell) {
            let { r, c } = this.selectedCell;
            if (e.code === 'ArrowUp') { r = Math.max(0, r - 1); }
            else if (e.code === 'ArrowDown') { r = Math.min(8, r + 1); }
            else if (e.code === 'ArrowLeft') { c = Math.max(0, c - 1); }
            else if (e.code === 'ArrowRight') { c = Math.min(8, c + 1); }
            this.selectCell(r, c);
        }
    }

    checkWin() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (this.currentGrid[r][c] !== this.solution[r][c]) return false;
            }
        }
        return true;
    }

    updateHud() {
        const mistakeEl = document.getElementById('sudoku-mistakes');
        const timerEl = document.getElementById('sudoku-timer');
        if (mistakeEl) mistakeEl.textContent = `${this.mistakes} / ${this.maxMistakes}`;
        if (timerEl) {
            const m = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const s = String(this.timer % 60).padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }
    }

    gameOver(won) {
        this.isGameOver = true;
        this.won = won;
        if (this.timerInterval) clearInterval(this.timerInterval);

        window.sound?.play(won ? 'win' : 'lose');

        const score = won ? Math.max(100, 1500 - this.timer * 2 - this.mistakes * 100) : 0;
        window.storage.setScore('sudoku', score);
        window.storage.recordGamePlay('sudoku', won, score, this.timer);
        window.achievements?.checkAll();

        const overlay = document.getElementById('sudoku-overlay');
        const overlayTitle = document.getElementById('sudoku-overlay-title');
        const overlayMsg = document.getElementById('sudoku-overlay-msg');

        if (overlayTitle) overlayTitle.textContent = won ? '🎉 ¡Sudoku Resuelto con Éxito!' : '❌ Demasiados Errores';
        if (overlayMsg) overlayMsg.innerHTML = won ? `Tiempo: <strong>${this.timer}s</strong> | Puntos: <strong>${score}</strong>` : 'Has cometido 3 errores.';
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        window.removeEventListener('keydown', this.onKey);
    }
};
