/**
 * Memory Matrix / Parejas de Memoria
 */
window.MemoryMatrix = class {
    constructor(container) {
        this.container = container;
        this.themes = {
            arcade: ['👾', '🕹️', '🎮', '🚀', '💎', '🔥', '⚡', '🛸', '⭐', '💣', '👑', '🎯'],
            fantasy: ['🦄', '🐉', '🧙', '🔮', '🛡️', '⚔️', '🗝️', '🏰', '💍', '📜', '🍄', '✨'],
            food: ['🍕', '🍔', '🍟', '🍩', '🍦', '🍓', '🥑', '🌮', '🍣', '🍿', '🍉', '🎂']
        };
        this.currentTheme = 'arcade';
        this.pairCount = 8; // 16 cards (4x4)
        this.cards = [];
        this.flippedIndices = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isLocked = false;
        this.isGameOver = false;
        this.highScore = window.storage.getScore('memory');
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper memory-game">
                <div class="memory-toolbar">
                    <div class="theme-select-group">
                        <label>Tema:</label>
                        <select id="memory-theme-select" class="form-select">
                            <option value="arcade">👾 Arcade Neón</option>
                            <option value="fantasy">🧙 Fantasía RPG</option>
                            <option value="food">🍕 Delicias</option>
                        </select>
                    </div>
                    <div class="diff-select-group">
                        <button class="btn btn-sm btn-outline" data-pairs="6">12 Cartas</button>
                        <button class="btn btn-sm btn-outline active" data-pairs="8">16 Cartas</button>
                        <button class="btn btn-sm btn-outline" data-pairs="12">24 Cartas</button>
                    </div>
                </div>

                <div class="game-hud memory-hud">
                    <div class="hud-item"><span class="hud-label">MOVIMIENTOS</span><span id="memory-moves" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">PAREJAS</span><span id="memory-pairs" class="hud-val">0 / 8</span></div>
                    <div class="hud-item"><span class="hud-label">TIEMPO</span><span id="memory-timer" class="hud-val">00:00</span></div>
                </div>

                <div class="memory-board-container">
                    <div id="memory-board" class="memory-grid"></div>
                    <div id="memory-overlay" class="game-overlay hidden">
                        <div class="overlay-card">
                            <h2>🎉 ¡Memoria Legendaria!</h2>
                            <p id="memory-overlay-msg">Has emparejado todas las cartas</p>
                            <button class="btn btn-primary" id="memory-btn-restart">Jugar de Nuevo</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const themeSelect = this.container.querySelector('#memory-theme-select');
        themeSelect.onchange = (e) => {
            this.currentTheme = e.target.value;
            this.start();
        };

        const diffBtns = this.container.querySelectorAll('.diff-select-group button');
        diffBtns.forEach(btn => {
            btn.onclick = () => {
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.pairCount = parseInt(btn.dataset.pairs, 10);
                this.start();
            };
        });

        this.container.querySelector('#memory-btn-restart').onclick = () => this.start();

        this.start();
    }

    start() {
        this.moves = 0;
        this.matchedPairs = 0;
        this.flippedIndices = [];
        this.isLocked = false;
        this.isGameOver = false;
        this.timer = 0;

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateHud();
        }, 1000);

        document.getElementById('memory-overlay')?.classList.add('hidden');

        // Select items and shuffle pairs
        const icons = this.themes[this.currentTheme].slice(0, this.pairCount);
        const deck = [...icons, ...icons];
        this.shuffle(deck);

        this.cards = deck.map((icon, id) => ({
            id,
            icon,
            isFlipped: false,
            isMatched: false
        }));

        this.renderBoard();
        this.updateHud();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderBoard() {
        const board = document.getElementById('memory-board');
        if (!board) return;
        board.innerHTML = '';

        const cols = this.pairCount === 6 ? 4 : this.pairCount === 8 ? 4 : 6;
        board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        this.cards.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = `memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
            cardEl.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">❓</div>
                    <div class="card-back">${card.icon}</div>
                </div>
            `;
            cardEl.onclick = () => this.handleCardClick(index);
            board.appendChild(cardEl);
        });
    }

    handleCardClick(index) {
        if (this.isLocked || this.isGameOver) return;
        const card = this.cards[index];
        if (card.isFlipped || card.isMatched) return;

        card.isFlipped = true;
        this.flippedIndices.push(index);
        window.sound?.play('card');
        this.updateCardDom(index);

        if (this.flippedIndices.length === 2) {
            this.moves++;
            this.isLocked = true;
            this.updateHud();

            const [firstIdx, secondIdx] = this.flippedIndices;
            const firstCard = this.cards[firstIdx];
            const secondCard = this.cards[secondIdx];

            if (firstCard.icon === secondCard.icon) {
                // Match!
                firstCard.isMatched = true;
                secondCard.isMatched = true;
                this.matchedPairs++;
                this.flippedIndices = [];
                this.isLocked = false;
                window.sound?.play('match');
                this.updateCardDom(firstIdx);
                this.updateCardDom(secondIdx);
                this.updateHud();

                if (this.matchedPairs === this.pairCount) {
                    this.gameOver();
                }
            } else {
                // No match
                setTimeout(() => {
                    firstCard.isFlipped = false;
                    secondCard.isFlipped = false;
                    this.updateCardDom(firstIdx);
                    this.updateCardDom(secondIdx);
                    this.flippedIndices = [];
                    this.isLocked = false;
                }, 900);
            }
        }
    }

    updateCardDom(index) {
        const board = document.getElementById('memory-board');
        if (!board) return;
        const cardEl = board.children[index];
        if (!cardEl) return;
        const card = this.cards[index];

        cardEl.className = `memory-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
    }

    updateHud() {
        const movesEl = document.getElementById('memory-moves');
        const pairsEl = document.getElementById('memory-pairs');
        const timerEl = document.getElementById('memory-timer');

        if (movesEl) movesEl.textContent = this.moves;
        if (pairsEl) pairsEl.textContent = `${this.matchedPairs} / ${this.pairCount}`;
        if (timerEl) {
            const m = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const s = String(this.timer % 60).padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }
    }

    gameOver() {
        this.isGameOver = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
        window.sound?.play('victory');

        // Score: higher for more pairs, faster time, fewer moves
        const baseScore = this.pairCount * 200;
        const timePenalty = this.timer * 3;
        const movePenalty = (this.moves - this.pairCount) * 8;
        const score = Math.max(50, baseScore - timePenalty - movePenalty);

        window.storage.setScore('memory', score);
        window.storage.recordGamePlay('memory', true, score, this.timer);
        window.achievements?.checkAll();

        const overlay = document.getElementById('memory-overlay');
        const msg = document.getElementById('memory-overlay-msg');
        if (msg) msg.innerHTML = `Movimientos: <strong>${this.moves}</strong> | Tiempo: <strong>${this.timer}s</strong> | Puntos: <strong>${score}</strong>`;
        if (overlay) overlay.classList.remove('hidden');
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};
