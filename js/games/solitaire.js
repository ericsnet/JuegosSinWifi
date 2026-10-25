/**
 * Solitario Clásico (Klondike Solitaire)
 */
window.SolitaireKlondike = class {
    constructor(container) {
        this.container = container;
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.history = [];
        this.score = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.drawCount = 1; // Draw 1 card
        this.isGameOver = false;
        this.won = false;
        this.startTime = Date.now();

        this.SUITS = ['♠', '♥', '♦', '♣'];
        this.SUIT_COLORS = { '♠': 'black', '♥': 'red', '♦': 'red', '♣': 'black' };
        this.RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    }

    init() {
        this.container.innerHTML = `
            <div class="game-wrapper solitaire-game">
                <div class="solitaire-top-bar">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline active" id="sol-draw-1">Robar 1</button>
                        <button class="btn btn-sm btn-outline" id="sol-draw-3">Robar 3</button>
                    </div>
                    <button class="btn btn-sm btn-secondary" id="sol-undo-btn">↩ Deshacer</button>
                    <button class="btn btn-sm btn-primary" id="sol-new-btn">🔄 Nuevo</button>
                </div>

                <div class="game-hud solitaire-hud">
                    <div class="hud-item"><span class="hud-label">PUNTOS</span><span id="sol-score" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">MOVIMIENTOS</span><span id="sol-moves" class="hud-val">0</span></div>
                    <div class="hud-item"><span class="hud-label">TIEMPO</span><span id="sol-timer" class="hud-val">00:00</span></div>
                </div>

                <div class="solitaire-board">
                    <div class="sol-top-row">
                        <div class="sol-stock-waste-group">
                            <div id="sol-stock" class="sol-card-slot sol-stock-slot"></div>
                            <div id="sol-waste" class="sol-card-slot sol-waste-slot"></div>
                        </div>
                        <div class="sol-foundations-group">
                            ${[0, 1, 2, 3].map(i => `<div id="sol-found-${i}" class="sol-card-slot sol-foundation-slot" data-fidx="${i}"></div>`).join('')}
                        </div>
                    </div>

                    <div class="sol-tableau-row">
                        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<div id="sol-tab-${i}" class="sol-tab-col" data-tidx="${i}"></div>`).join('')}
                    </div>
                </div>

                <div id="sol-overlay" class="game-overlay hidden">
                    <div class="overlay-card">
                        <h2>🎉 ¡Partida de Solitario Ganada!</h2>
                        <p id="sol-overlay-msg"></p>
                        <button class="btn btn-primary" id="sol-overlay-restart">Nueva Partida</button>
                    </div>
                </div>
            </div>
        `;

        const draw1 = this.container.querySelector('#sol-draw-1');
        const draw3 = this.container.querySelector('#sol-draw-3');

        draw1.onclick = () => {
            draw1.classList.add('active');
            draw3.classList.remove('active');
            this.drawCount = 1;
            this.start();
        };

        draw3.onclick = () => {
            draw3.classList.add('active');
            draw1.classList.remove('active');
            this.drawCount = 3;
            this.start();
        };

        this.container.querySelector('#sol-undo-btn').onclick = () => this.undo();
        this.container.querySelector('#sol-new-btn').onclick = () => this.start();
        this.container.querySelector('#sol-overlay-restart').onclick = () => this.start();

        this.start();
    }

    start() {
        this.score = 0;
        this.moves = 0;
        this.timer = 0;
        this.history = [];
        this.isGameOver = false;
        this.won = false;
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.waste = [];

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateHud();
        }, 1000);

        document.getElementById('sol-overlay')?.classList.add('hidden');

        // Create & shuffle deck
        this.deck = [];
        this.SUITS.forEach(suit => {
            this.RANKS.forEach((rank, rankIndex) => {
                this.deck.push({
                    suit,
                    rank,
                    value: rankIndex + 1,
                    color: this.SUIT_COLORS[suit],
                    faceUp: false
                });
            });
        });
        this.shuffle(this.deck);

        // Deal tableau
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.pop();
                card.faceUp = (j === i);
                this.tableau[j].push(card);
            }
        }

        // Remaining cards to stock
        this.stock = this.deck;
        this.render();
        this.updateHud();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    saveState() {
        const cloneCard = c => ({ ...c });
        this.history.push({
            stock: this.stock.map(cloneCard),
            waste: this.waste.map(cloneCard),
            foundations: this.foundations.map(f => f.map(cloneCard)),
            tableau: this.tableau.map(t => t.map(cloneCard)),
            score: this.score,
            moves: this.moves
        });
        if (this.history.length > 25) this.history.shift();
    }

    undo() {
        if (this.history.length === 0 || this.isGameOver) return;
        const prev = this.history.pop();
        this.stock = prev.stock;
        this.waste = prev.waste;
        this.foundations = prev.foundations;
        this.tableau = prev.tableau;
        this.score = prev.score;
        this.moves = prev.moves;

        window.sound?.play('select');
        this.render();
        this.updateHud();
    }

    drawFromStock() {
        if (this.isGameOver) return;
        this.saveState();

        if (this.stock.length === 0) {
            // Recycle waste back to stock
            if (this.waste.length === 0) return;
            this.stock = this.waste.reverse().map(c => { c.faceUp = false; return c; });
            this.waste = [];
            window.sound?.play('card');
        } else {
            const count = Math.min(this.drawCount, this.stock.length);
            for (let i = 0; i < count; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.waste.push(card);
            }
            window.sound?.play('card');
        }

        this.moves++;
        this.render();
        this.updateHud();
    }

    autoMoveCard(card, sourceLocation) {
        if (this.isGameOver || !card.faceUp) return;

        // Try Foundation first
        for (let f = 0; f < 4; f++) {
            const topF = this.foundations[f][this.foundations[f].length - 1];
            if ((!topF && card.value === 1) || (topF && topF.suit === card.suit && topF.value === card.value - 1)) {
                this.saveState();
                this.removeCardFromSource(card, sourceLocation);
                this.foundations[f].push(card);
                this.score += 10;
                this.moves++;
                window.sound?.play('match');
                this.checkTableauUncovers();
                this.render();
                this.updateHud();
                this.checkWin();
                return;
            }
        }

        // Try Tableau
        for (let t = 0; t < 7; t++) {
            if (sourceLocation.type === 'tableau' && sourceLocation.col === t) continue;
            const topT = this.tableau[t][this.tableau[t].length - 1];
            if ((!topT && card.value === 13) || (topT && topT.faceUp && topT.color !== card.color && topT.value === card.value + 1)) {
                this.saveState();
                const movingCards = this.removeCardFromSource(card, sourceLocation);
                this.tableau[t].push(...movingCards);
                this.score += 5;
                this.moves++;
                window.sound?.play('card');
                this.checkTableauUncovers();
                this.render();
                this.updateHud();
                this.checkWin();
                return;
            }
        }
    }

    removeCardFromSource(card, sourceLocation) {
        if (sourceLocation.type === 'waste') {
            return [this.waste.pop()];
        }
        if (sourceLocation.type === 'foundation') {
            return [this.foundations[sourceLocation.fIndex].pop()];
        }
        if (sourceLocation.type === 'tableau') {
            const col = this.tableau[sourceLocation.col];
            const cardIdx = col.indexOf(card);
            return col.splice(cardIdx);
        }
        return [card];
    }

    checkTableauUncovers() {
        for (let t = 0; t < 7; t++) {
            const col = this.tableau[t];
            if (col.length > 0) {
                const top = col[col.length - 1];
                if (!top.faceUp) {
                    top.faceUp = true;
                    this.score += 5;
                }
            }
        }
    }

    render() {
        // Stock
        const stockEl = document.getElementById('sol-stock');
        if (stockEl) {
            stockEl.innerHTML = '';
            if (this.stock.length > 0) {
                stockEl.innerHTML = `<div class="sol-card sol-card-back">🂠 (${this.stock.length})</div>`;
            } else {
                stockEl.innerHTML = `<div class="sol-empty-slot">🔄</div>`;
            }
            stockEl.onclick = () => this.drawFromStock();
        }

        // Waste
        const wasteEl = document.getElementById('sol-waste');
        if (wasteEl) {
            wasteEl.innerHTML = '';
            if (this.waste.length > 0) {
                const topWaste = this.waste[this.waste.length - 1];
                const cardEl = this.createCardElement(topWaste);
                cardEl.onclick = () => this.autoMoveCard(topWaste, { type: 'waste' });
                wasteEl.appendChild(cardEl);
            }
        }

        // Foundations
        for (let f = 0; f < 4; f++) {
            const fEl = document.getElementById(`sol-found-${f}`);
            if (!fEl) continue;
            fEl.innerHTML = '';
            const stack = this.foundations[f];
            if (stack.length > 0) {
                const top = stack[stack.length - 1];
                const cardEl = this.createCardElement(top);
                cardEl.onclick = () => this.autoMoveCard(top, { type: 'foundation', fIndex: f });
                fEl.appendChild(cardEl);
            } else {
                fEl.innerHTML = `<div class="sol-empty-slot">A</div>`;
            }
        }

        // Tableau
        for (let t = 0; t < 7; t++) {
            const tabEl = document.getElementById(`sol-tab-${t}`);
            if (!tabEl) continue;
            tabEl.innerHTML = '';
            const col = this.tableau[t];

            if (col.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'sol-card-slot sol-empty-tableau';
                empty.textContent = 'K';
                empty.onclick = () => {
                    // Check if waste has King
                    if (this.waste.length > 0 && this.waste[this.waste.length - 1].value === 13) {
                        this.autoMoveCard(this.waste[this.waste.length - 1], { type: 'waste' });
                    }
                };
                tabEl.appendChild(empty);
            } else {
                col.forEach((card, cIndex) => {
                    const cardEl = this.createCardElement(card);
                    cardEl.style.top = `${cIndex * 26}px`;
                    if (card.faceUp) {
                        cardEl.onclick = (e) => {
                            e.stopPropagation();
                            this.autoMoveCard(card, { type: 'tableau', col: t });
                        };
                    }
                    tabEl.appendChild(cardEl);
                });
            }
        }
    }

    createCardElement(card) {
        const el = document.createElement('div');
        if (!card.faceUp) {
            el.className = 'sol-card sol-card-back';
            el.innerHTML = '🂠';
            return el;
        }

        el.className = `sol-card sol-card-front card-${card.color}`;
        el.innerHTML = `
            <div class="card-corner top-left"><span>${card.rank}</span><span>${card.suit}</span></div>
            <div class="card-center-suit">${card.suit}</div>
            <div class="card-corner bot-right"><span>${card.rank}</span><span>${card.suit}</span></div>
        `;
        return el;
    }

    checkWin() {
        const totalFoundation = this.foundations.reduce((sum, f) => sum + f.length, 0);
        if (totalFoundation === 52 && !this.won) {
            this.won = true;
            this.isGameOver = true;
            if (this.timerInterval) clearInterval(this.timerInterval);
            window.sound?.play('victory');

            const score = Math.max(100, 1000 - this.timer * 2 + this.score);
            window.storage.setScore('solitaire', score);
            window.storage.recordGamePlay('solitaire', true, score, this.timer);
            window.achievements?.checkAll();

            const overlay = document.getElementById('sol-overlay');
            const msg = document.getElementById('sol-overlay-msg');
            if (msg) msg.innerHTML = `Movimientos: <strong>${this.moves}</strong> | Tiempo: <strong>${this.timer}s</strong> | Puntos: <strong>${score}</strong>`;
            if (overlay) overlay.classList.remove('hidden');
        }
    }

    updateHud() {
        const scoreEl = document.getElementById('sol-score');
        const movesEl = document.getElementById('sol-moves');
        const timerEl = document.getElementById('sol-timer');
        if (scoreEl) scoreEl.textContent = this.score;
        if (movesEl) movesEl.textContent = this.moves;
        if (timerEl) {
            const m = String(Math.floor(this.timer / 60)).padStart(2, '0');
            const s = String(this.timer % 60).padStart(2, '0');
            timerEl.textContent = `${m}:${s}`;
        }
    }

    pause() {}
    resume() {}
    restart() { this.start(); }

    destroy() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
};
