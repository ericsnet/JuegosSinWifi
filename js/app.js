/**
 * Main Application Hub & Router for JuegosSinWifi
 */
document.addEventListener('DOMContentLoaded', () => {
    // 14 Games Definition with rich tags, gradients and metadata
    const GAMES_CATALOG = [
        {
            id: 'snake',
            title: 'Cyber Snake Neon',
            genre: 'arcade',
            genreLabel: 'Arcade',
            icon: '🐍',
            color: '#10b981',
            desc: 'La serpiente clásica reinventada con estelas brillantes, manzanas doradas y aceleración progresiva.',
            controls: 'Teclas Flechas / WASD o Deslizar en pantalla táctil.',
            className: 'CyberSnake', script: 'js/games/snake.js'
        },
        {
            id: 'tetris',
            title: 'TetroBlocks Neon',
            genre: 'puzzle',
            genreLabel: 'Puzzle',
            icon: '🧱',
            color: '#00f0ff',
            desc: 'El legendario juego de encajar bloques con función Guardar pieza (Hold), sombra fantasma y combos.',
            controls: '◄ ► Mover, ▲ Rotar, ▼ Bajar, Espacio Caída rápida, C Guardar pieza.',
            className: 'NeonTetris', script: 'js/games/tetris.js'
        },
        {
            id: 'space',
            title: 'Space Defender',
            genre: 'arcade',
            genreLabel: 'Shooter',
            icon: '🛸',
            color: '#ec4899',
            desc: 'Shooter espacial retro. Destruye oleadas de invasores alienígenas, recoge power-ups y vence a los jefes.',
            controls: '◄ ► Mover nave, Espacio / Fuego Disparar.',
            className: 'SpaceDefender', script: 'js/games/space-invaders.js'
        },
        {
            id: 'flappy',
            title: 'Flappy Cyber',
            genre: 'arcade',
            genreLabel: 'Arcade',
            icon: '🪽',
            color: '#f43f5e',
            desc: 'Pilota un drone futurista a través de barreras láser flotantes con físicas de impulso.',
            controls: 'Toca la pantalla, Clic o pulsa Espacio para dar propulsión.',
            className: 'FlappyCyber', script: 'js/games/flappy.js'
        },
        {
            id: 'game2048',
            title: '2048 Fusion',
            genre: 'puzzle',
            genreLabel: 'Lógica',
            icon: '🔢',
            color: '#f59e0b',
            desc: 'Desliza y fusiona números idénticos para alcanzar la mítica ficha 2048. ¡Incluye botón Deshacer!',
            controls: 'Flechas / Deslizar en pantalla.',
            className: 'Game2048', script: 'js/games/game2048.js'
        },
        {
            id: 'minesweeper',
            title: 'Buscaminas Deluxe',
            genre: 'puzzle',
            genreLabel: 'Clásico',
            icon: '💣',
            color: '#fb923c',
            desc: 'Despeja el campo minado usando lógica y números. Primer clic siempre seguro garantizado.',
            controls: 'Clic para revelar, Clic derecho o botón Bandera para marcar minas.',
            className: 'Minesweeper', script: 'js/games/minesweeper.js'
        },
        {
            id: 'memory',
            title: 'Memory Matrix',
            genre: 'puzzle',
            genreLabel: 'Memoria',
            icon: '🧠',
            color: '#a855f7',
            desc: 'Encuentra todas las parejas de cartas en el menor número de movimientos y tiempo posible.',
            controls: 'Clic o Toca las cartas para voltearlas.',
            className: 'MemoryMatrix', script: 'js/games/memory.js'
        },
        {
            id: 'sudoku',
            title: 'Sudoku Master',
            genre: 'puzzle',
            genreLabel: 'Lógica',
            icon: '🧩',
            color: '#06b6d4',
            desc: 'Desafíos de Sudoku con 4 dificultades, notas a lápiz, validación y sistema de pistas.',
            controls: 'Selecciona casilla y pulsa un número del 1 al 9.',
            className: 'SudokuMaster', script: 'js/games/sudoku.js'
        },
        {
            id: 'connect4',
            title: 'Conecta 4 Neón',
            genre: 'strategy',
            genreLabel: 'Estrategia',
            icon: '🔴',
            color: '#f43f5e',
            desc: 'Alinea 4 fichas en raya. Juega contra la IA (algoritmo Minimax) o contra un amigo en local.',
            controls: 'Toca la columna deseada para soltar la ficha.',
            className: 'ConnectFour', script: 'js/games/connect4.js'
        },
        {
            id: 'hangman',
            title: 'El Ahorcado Pro',
            genre: 'words',
            genreLabel: 'Palabras',
            icon: '📜',
            color: '#10b981',
            desc: 'Adivina cientos de palabras en español clasificadas por categorías con teclado interactivo.',
            controls: 'Toca las letras del teclado virtual o pulsa las teclas de tu teclado.',
            className: 'HangmanGame', script: 'js/games/hangman.js'
        },
        {
            id: 'pong',
            title: 'Cyber Pong',
            genre: 'arcade',
            genreLabel: 'Deportes',
            icon: '🏓',
            color: '#00f0ff',
            desc: 'El clásico duelo de tenis de mesa arcade con físicas de efecto y modo 1P vs IA o 2P local.',
            controls: 'P1: W/S o Arrastre táctil | P2: Flechas Arriba/Abajo.',
            className: 'CyberPong', script: 'js/games/pong.js'
        },
        {
            id: 'runner',
            title: 'Neon Dino Runner',
            genre: 'arcade',
            genreLabel: 'Runner',
            icon: '🦖',
            color: '#34d399',
            desc: 'Corre sin parar por el desierto ciberpunk saltando obstáculos y agachándote bajo los drones.',
            controls: 'Espacio / ▲ Saltar, ▼ Agacharse.',
            className: 'DinoRunner', script: 'js/games/runner.js'
        },
        {
            id: 'typing',
            title: 'Speed Typer',
            genre: 'words',
            genreLabel: 'Reflejos',
            icon: '⚡',
            color: '#f59e0b',
            desc: 'Escribe a toda velocidad las palabras que caen del cielo para destruir sus proyectiles.',
            controls: 'Escribe las palabras con tu teclado antes de que toquen el suelo.',
            className: 'SpeedTyper', script: 'js/games/typing.js'
        },
        {
            id: 'solitaire',
            title: 'Solitario Klondike',
            genre: 'strategy',
            genreLabel: 'Cartas',
            icon: '🃏',
            color: '#f97316',
            desc: 'El rey de los solitarios de cartas. Modo Robar 1 o 3, auto-completar, clics directos y deshacer.',
            controls: 'Clic o Toca una carta para enviarla automáticamente a su lugar válido.',
            className: 'SolitaireKlondike', script: 'js/games/solitaire.js'
        }
        {
            id: 'breakout', title: 'Breakout', genre: 'arcade', genreLabel: 'Arcade',
            icon: '🧱', color: '#c6a66b',
            desc: 'Rompe todos los bloques con una pala y una pelota. Controles de teclado, ratón y táctiles.',
            controls: 'Flechas o ratón para mover la pala. Espacio o toque para lanzar la pelota.',
            className: 'Breakout', script: 'js/games/breakout.js'
        },
        {
            id: 'tictactoe', title: 'Tres en raya', genre: 'strategy', genreLabel: 'Estrategia',
            icon: '⭕', color: '#6f9fca',
            desc: 'El clásico juego de tablero para dos personas en el mismo dispositivo.',
            controls: 'Selecciona una casilla libre para colocar tu símbolo.',
            className: 'TicTacToe', script: 'js/games/tictactoe.js'
        },
        {
            id: 'lightsout', title: 'Lights Out', genre: 'puzzle', genreLabel: 'Lógica',
            icon: '💡', color: '#d5b56d',
            desc: 'Apaga todas las luces del tablero. Cada toque cambia la casilla y sus vecinas.',
            controls: 'Toca o haz clic en una luz para cambiarla junto a sus vecinas.',
            className: 'LightsOut', script: 'js/games/lightsout.js'
        },
        {
            id: 'reaction', title: 'Prueba de reacción', genre: 'arcade', genreLabel: 'Reflejos',
            icon: '⏱️', color: '#8db8a5',
            desc: 'Mide tus reflejos: espera a que el panel cambie y pulsa lo más rápido posible.',
            controls: 'Pulsa para iniciar. Espera al color verde y vuelve a pulsar.',
            className: 'ReactionTest', script: 'js/games/reaction.js'
        }
    ];

    let currentActiveGame = null;
    let launchSequence = 0;
    const loadedGameScripts = new Map();
    let currentFilter = 'all';
    let searchQuery = '';
    let featuredGameId = 'snake';

    // DOM Elements
    const gamesGrid = document.getElementById('games-grid');
    const searchInput = document.getElementById('search-games-input');
    const filterTabs = document.querySelectorAll('.filter-chip');
    
    // Modal Viewport elements
    const gameModal = document.getElementById('game-viewport-modal');
    const gameContainer = document.getElementById('active-game-container');
    const modalGameTitle = document.getElementById('modal-game-title');
    const modalGameGenre = document.getElementById('modal-game-genre');
    const btnExitGame = document.getElementById('btn-exit-game');
    const btnRestartGame = document.getElementById('btn-restart-game');
    const btnFullscreen = document.getElementById('btn-fullscreen');
    const btnHelpGame = document.getElementById('btn-help-game');
    const btnSoundToggle = document.getElementById('btn-sound-toggle');
    const btnMusicToggle = document.getElementById('btn-music-toggle');

    // Modals
    const cloudModal = document.getElementById('cloud-sync-modal');
    const achievementsModal = document.getElementById('achievements-modal');
    const profileModal = document.getElementById('profile-modal');
    const helpModal = document.getElementById('help-modal');

    // Quick Hub Action buttons
    const btnOpenCloud = document.getElementById('btn-open-cloud');
    const btnOpenAchievements = document.getElementById('btn-open-achievements');
    const btnOpenProfile = document.getElementById('btn-open-profile');
    const btnGlobalSound = document.getElementById('btn-global-sound');
    const btnGlobalMusic = document.getElementById('btn-global-music');
    const btnExportSave = document.getElementById('btn-export-save');
    const btnImportSave = document.getElementById('btn-import-save');
    const fileImportInput = document.getElementById('file-import-input');
    const btnHeroPlayFeatured = document.getElementById('btn-hero-play-featured');
    const btnHeroRandom = document.getElementById('btn-hero-random');
    const btnToolbarRandom = document.getElementById('btn-toolbar-random');

    // Initialize Hub
    pickRandomFeatured();
    window.profile?.renderHubProfile();
    updateQuickStats();
    renderGamesCatalog();
    updateAudioButtons();
    updateCloudStatusBadge();

    function pickRandomFeatured() {
        const feat = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
        featuredGameId = feat.id;
        const tag = document.getElementById('spotlight-title-tag');
        if (tag) tag.textContent = feat.title;
    }

    function updateQuickStats() {
        const data = window.storage.data;
        const statGamesPlayed = document.getElementById('stat-games-played');
        const statAch = document.getElementById('stat-achievements-count');
        const statLvl = document.getElementById('stat-player-level');
        const favCount = document.getElementById('fav-filter-count');
        const totalGames = document.getElementById('stat-total-games');
        if (totalGames) totalGames.textContent = GAMES_CATALOG.length;

        if (statGamesPlayed) statGamesPlayed.textContent = data.profile.gamesPlayed || 0;
        if (statAch) {
            const unlocked = Object.keys(data.achievements || {}).length;
            statAch.textContent = `${unlocked}/17`;
        }
        if (statLvl) statLvl.textContent = `Niv. ${data.profile.level || 1}`;
        if (favCount) favCount.textContent = (data.favorites || []).length;
    }

    // ==========================================
    // CATALOG RENDERING & FILTERING
    // ==========================================
    function renderGamesCatalog() {
        if (!gamesGrid) return;
        gamesGrid.innerHTML = '';

        const filtered = GAMES_CATALOG.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  game.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  game.genreLabel.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;

            if (currentFilter === 'all') return true;
            if (currentFilter === 'favorites') return window.storage.isFavorite(game.id);
            if (currentFilter === 'arcade') return game.genre === 'arcade';
            if (currentFilter === 'puzzle') return game.genre === 'puzzle';
            if (currentFilter === 'strategy') return game.genre === 'strategy';
            if (currentFilter === 'words') return game.genre === 'words';
            return true;
        });

        if (filtered.length === 0) {
            gamesGrid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">🔍</span>
                    <h3>No se encontraron juegos</h3>
                    <p>Prueba con otra palabra clave o selecciona otra categoría.</p>
                </div>
            `;
            return;
        }

        filtered.forEach(game => {
            const isFav = window.storage.isFavorite(game.id);
            const score = window.storage.getScore(game.id);
            const card = document.createElement('div');
            card.className = 'game-card';
            card.dataset.gameId = game.id;
            card.style.setProperty('--card-accent', game.color);

            card.innerHTML = `
                <div class="card-accent-bar"></div>
                <button class="btn-card-fav ${isFav ? 'is-fav' : ''}" title="Marcar como favorito" data-fav-id="${game.id}">
                    ${isFav ? '★' : '☆'}
                </button>
                <div class="card-banner-art">
                    <span class="card-art-emoji">${game.icon}</span>
                </div>
                <div class="card-content">
                    <div class="card-tags-row">
                        <span class="genre-tag">${game.genreLabel}</span>
                        <span class="score-tag">🏆 <span>${score}</span></span>
                    </div>
                    <h3 class="card-title">${game.title}</h3>
                    <p class="card-description">${game.desc}</p>
                    <div class="card-action-bar">
                        <button class="btn-play-action" data-play-id="${game.id}">
                            <span>JUGAR AHORA</span>
                            <span class="play-arrow-icon">▶</span>
                        </button>
                    </div>
                </div>
            `;

            // Click bindings
            card.querySelector('.btn-play-action').onclick = (e) => {
                e.stopPropagation();
                launchGame(game.id);
            };
            card.onclick = () => launchGame(game.id);

            card.querySelector('.btn-card-fav').onclick = (e) => {
                e.stopPropagation();
                window.storage.toggleFavorite(game.id);
                renderGamesCatalog();
                updateQuickStats();
                window.sound?.play('select');
            };

            gamesGrid.appendChild(card);
        });
    }

    // Filter Chips
    filterTabs.forEach(tab => {
        tab.onclick = () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.category;
            renderGamesCatalog();
            window.sound?.play('tap');
        };
    });

    // Search input
    if (searchInput) {
        searchInput.oninput = (e) => {
            searchQuery = e.target.value;
            renderGamesCatalog();
        };
    }

    // Random Game Launches
    const playRandomGame = () => {
        const randomGame = GAMES_CATALOG[Math.floor(Math.random() * GAMES_CATALOG.length)];
        launchGame(randomGame.id);
    };

    if (btnHeroRandom) btnHeroRandom.onclick = playRandomGame;
    if (btnToolbarRandom) btnToolbarRandom.onclick = playRandomGame;
    if (btnHeroPlayFeatured) btnHeroPlayFeatured.onclick = () => launchGame(featuredGameId);

    // ==========================================
    // GAME LAUNCHER & MODAL VIEWPORT
    // ==========================================
    function loadGameScript(src) {
        if (loadedGameScripts.has(src)) return loadedGameScripts.get(src);

        const pending = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => {
                loadedGameScripts.delete(src);
                reject(new Error('No se pudo cargar el motor del juego.'));
            };
            document.body.appendChild(script);
        });

        loadedGameScripts.set(src, pending);
        return pending;
    }

    async function launchGame(gameId) {
        const gameMeta = GAMES_CATALOG.find(g => g.id === gameId);
        if (!gameMeta) return;
        const requestId = ++launchSequence;

        if (currentActiveGame && typeof currentActiveGame.destroy === 'function') {
            currentActiveGame.destroy();
            currentActiveGame = null;
        }

        modalGameTitle.textContent = gameMeta.title;
        modalGameGenre.textContent = gameMeta.genreLabel;
        modalGameGenre.style.color = gameMeta.color;
        gameContainer.textContent = 'Cargando juego…';
        gameModal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        try {
            await loadGameScript(gameMeta.script);
            if (requestId !== launchSequence) return;

            const GameClass = window[gameMeta.className];
            if (typeof GameClass !== 'function') {
                throw new Error('El motor del juego no está disponible.');
            }

            gameContainer.innerHTML = '';
            currentActiveGame = new GameClass(gameContainer);
            currentActiveGame.gameId = gameId;
            currentActiveGame.init();
            window.sound?.play('select');
        } catch (error) {
            if (requestId !== launchSequence) return;
            gameContainer.textContent = 'No se pudo cargar este juego. Comprueba la conexión o vuelve a intentarlo.';
            console.error('Error al cargar el juego:', error);
        }
    }

    function exitGame() {
        launchSequence++;
        if (currentActiveGame && typeof currentActiveGame.destroy === 'function') {
            currentActiveGame.destroy();
            currentActiveGame = null;
        }
        gameContainer.innerHTML = '';
        gameModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        renderGamesCatalog();
        window.profile?.renderHubProfile();
        updateQuickStats();
        window.achievements?.checkAll();
    }

    btnExitGame.onclick = exitGame;

    btnRestartGame.onclick = () => {
        if (currentActiveGame && typeof currentActiveGame.restart === 'function') {
            currentActiveGame.restart();
            window.sound?.play('select');
        }
    };

    btnFullscreen.onclick = () => {
        const elem = document.querySelector('.viewport-card') || document.documentElement;
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen().catch(err => console.log(err));
        }
    };

    btnHelpGame.onclick = () => {
        if (!currentActiveGame) return;
        const meta = GAMES_CATALOG.find(g => g.id === currentActiveGame.gameId);
        if (!meta) return;

        document.getElementById('help-modal-title').textContent = `Cómo Jugar: ${meta.title}`;
        document.getElementById('help-modal-desc').textContent = meta.desc;
        document.getElementById('help-modal-controls').innerHTML = `<strong>Controles:</strong> ${meta.controls}`;
        helpModal.classList.remove('hidden');
    };

    // Global and Viewport Audio Controls
    function updateAudioButtons() {
        const sfxOn = window.sound.sfxEnabled;
        const musicOn = window.sound.musicEnabled;

        if (btnGlobalSound) {
            btnGlobalSound.classList.toggle('active', sfxOn);
            btnGlobalSound.innerHTML = sfxOn ? '🔊' : '🔇';
        }
        if (btnGlobalMusic) {
            btnGlobalMusic.classList.toggle('active', musicOn);
            btnGlobalMusic.innerHTML = musicOn ? '🎵' : '🎼';
        }
        if (btnSoundToggle) {
            btnSoundToggle.innerHTML = sfxOn ? '🔊' : '🔇';
        }
        if (btnMusicToggle) {
            btnMusicToggle.innerHTML = musicOn ? '🎵' : '🎼';
            btnMusicToggle.classList.toggle('active', musicOn);
        }
    }

    const toggleSfxHandler = () => {
        window.sound.toggleSfx();
        updateAudioButtons();
    };

    const toggleMusicHandler = () => {
        window.sound.toggleMusic();
        updateAudioButtons();
    };

    if (btnGlobalSound) btnGlobalSound.onclick = toggleSfxHandler;
    if (btnGlobalMusic) btnGlobalMusic.onclick = toggleMusicHandler;
    if (btnSoundToggle) btnSoundToggle.onclick = toggleSfxHandler;
    if (btnMusicToggle) btnMusicToggle.onclick = toggleMusicHandler;

    // ==========================================
    // CLOUD SAVE MODAL (GITHUB GISTS)
    // ==========================================
    btnOpenCloud.onclick = () => {
        renderCloudModal();
        cloudModal.classList.remove('hidden');
    };

    function updateCloudStatusBadge() {
        const lastSync = window.storage.getLastSyncTime();
        const badge = document.getElementById('hub-cloud-status');
        if (!badge) return;

        if (lastSync) {
            const dateStr = new Date(lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            badge.innerHTML = `<span class="status-dot green"></span> Nube: Sincronizado (${dateStr})`;
        } else if (window.storage.getGitHubToken()) {
            badge.innerHTML = `<span class="status-dot orange"></span> Nube: Conectado`;
        } else {
            badge.innerHTML = `<span class="status-dot gray"></span> Nube: No conectado`;
        }
    }

    function renderCloudModal() {
        const tokenInput = document.getElementById('gh-token-input');
        const token = window.storage.getGitHubToken();
        const gistId = window.storage.getGistId();
        const lastSync = window.storage.getLastSyncTime();

        if (tokenInput) tokenInput.value = token;

        const infoEl = document.getElementById('cloud-account-info');
        if (token) {
            infoEl.innerHTML = `
                <div style="background: rgba(0, 240, 255, 0.06); border: 1px solid rgba(0, 240, 255, 0.2); padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span style="font-size: 1.8rem;">☁️</span>
                        <div>
                            <strong style="color: #fff; font-size: 1rem;">GitHub Cloud Sync Vinculado</strong>
                            <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">Gist ID: <code>${gistId || 'Se creará en tu primera subida'}</code></p>
                        </div>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--cyan);">
                        Última sincronización: <strong>${lastSync ? new Date(lastSync).toLocaleString() : 'Pendiente'}</strong>
                    </div>
                </div>
            `;
        } else {
            infoEl.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-subtle); padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                    <p style="color: var(--text-secondary); font-size: 0.88rem; line-height: 1.5; margin: 0;">
                        Conecta tu cuenta de GitHub con un <strong>Personal Access Token</strong> (permiso <code>gist</code>) para sincronizar tus partidas, récords y logros automáticamente en cualquier dispositivo.
                    </p>
                </div>
            `;
        }
    }

    const btnSaveToken = document.getElementById('btn-save-gh-token');
    const btnTestToken = document.getElementById('btn-test-gh-token');
    const btnUploadCloud = document.getElementById('btn-upload-cloud');
    const btnDownloadCloud = document.getElementById('btn-download-cloud');
    const btnDisconnectCloud = document.getElementById('btn-disconnect-cloud');
    const cloudStatusMsg = document.getElementById('cloud-action-status');

    function showCloudMessage(text, isError = false) {
        if (!cloudStatusMsg) return;
        cloudStatusMsg.className = `alert ${isError ? 'alert-danger' : 'alert-success'}`;
        cloudStatusMsg.textContent = text;
        cloudStatusMsg.style.display = 'flex';
    }

    if (btnSaveToken) {
        btnSaveToken.onclick = () => {
            const token = document.getElementById('gh-token-input').value.trim();
            if (!token) {
                showCloudMessage('Por favor ingresa un token válido de GitHub.', true);
                return;
            }
            window.storage.setGitHubToken(token);
            showCloudMessage('Token de GitHub guardado correctamente.');
            renderCloudModal();
            updateCloudStatusBadge();
            window.achievements?.checkAll();
        };
    }

    if (btnTestToken) {
        btnTestToken.onclick = async () => {
            const token = document.getElementById('gh-token-input').value.trim();
            if (!token) {
                showCloudMessage('Ingresa un token antes de probar la conexión.', true);
                return;
            }
            btnTestToken.disabled = true;
            btnTestToken.textContent = 'Verificando...';
            try {
                const user = await window.storage.testGitHubConnection(token);
                showCloudMessage(`¡Conexión exitosa! Conectado como @${user.login} (${user.name})`);
                window.storage.setGitHubToken(token);
                renderCloudModal();
                updateCloudStatusBadge();
            } catch (err) {
                showCloudMessage(`Error: ${err.message}`, true);
            } finally {
                btnTestToken.disabled = false;
                btnTestToken.textContent = 'Probar Conexión';
            }
        };
    }

    if (btnUploadCloud) {
        btnUploadCloud.onclick = async () => {
            btnUploadCloud.disabled = true;
            btnUploadCloud.textContent = 'Subiendo...';
            try {
                const res = await window.storage.uploadToGitHub();
                showCloudMessage(`¡Partida subida exitosamente a la nube de GitHub! Gist: ${res.gistId}`);
                renderCloudModal();
                updateCloudStatusBadge();
                window.achievements?.checkAll();
            } catch (err) {
                showCloudMessage(`Error al subir: ${err.message}`, true);
            } finally {
                btnUploadCloud.disabled = false;
                btnUploadCloud.textContent = '⬆ Subir Partida a GitHub';
            }
        };
    }

    if (btnDownloadCloud) {
        btnDownloadCloud.onclick = async () => {
            if (!confirm('¿Descargar la partida de la nube y sobrescribir los datos locales actuales?')) return;
            btnDownloadCloud.disabled = true;
            btnDownloadCloud.textContent = 'Descargando...';
            try {
                const res = await window.storage.downloadFromGitHub();
                showCloudMessage(`¡Partida sincronizada desde la nube con éxito!`);
                renderCloudModal();
                renderGamesCatalog();
                window.profile?.renderHubProfile();
                updateCloudStatusBadge();
                updateQuickStats();
                window.achievements?.checkAll();
            } catch (err) {
                showCloudMessage(`Error al descargar: ${err.message}`, true);
            } finally {
                btnDownloadCloud.disabled = false;
                btnDownloadCloud.textContent = '⬇ Descargar de GitHub';
            }
        };
    }

    if (btnDisconnectCloud) {
        btnDisconnectCloud.onclick = () => {
            if (!confirm('¿Desconectar tu token de GitHub? Tus partidas locales se mantendrán intactas.')) return;
            window.storage.setGitHubToken('');
            showCloudMessage('Desconectado de GitHub.');
            renderCloudModal();
            updateCloudStatusBadge();
        };
    }

    // Export / Import Local JSON
    if (btnExportSave) {
        btnExportSave.onclick = () => {
            window.storage.exportToJsonFile();
            window.sound?.play('select');
        };
    }

    if (btnImportSave && fileImportInput) {
        btnImportSave.onclick = () => fileImportInput.click();
        fileImportInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                await window.storage.importFromJsonFile(file);
                alert('¡Partida restaurada con éxito desde el archivo JSON!');
                renderGamesCatalog();
                window.profile?.renderHubProfile();
                updateQuickStats();
                window.achievements?.checkAll();
                window.sound?.play('victory');
            } catch (err) {
                alert(`Error al importar archivo: ${err.message}`);
            }
        };
    }

    // ==========================================
    // ACHIEVEMENTS MODAL
    // ==========================================
    btnOpenAchievements.onclick = () => {
        renderAchievementsModal();
        achievementsModal.classList.remove('hidden');
    };

    function renderAchievementsModal() {
        const listContainer = document.getElementById('achievements-list');
        const countEl = document.getElementById('achievements-unlocked-count');
        const barEl = document.getElementById('achievements-progress-bar');
        if (!listContainer) return;

        const all = window.achievements.getAll();
        const unlockedCount = all.filter(a => a.isUnlocked).length;
        const total = all.length;
        const pct = Math.round((unlockedCount / total) * 100);

        if (countEl) countEl.textContent = `${unlockedCount} / ${total} (${pct}%)`;
        if (barEl) barEl.style.width = `${pct}%`;

        listContainer.innerHTML = '';
        all.forEach(ach => {
            const item = document.createElement('div');
            item.className = `achievement-item ${ach.isUnlocked ? 'unlocked' : 'locked'}`;
            item.innerHTML = `
                <div class="ach-icon">${ach.icon}</div>
                <div class="ach-info">
                    <div class="ach-title">${ach.title} <span class="ach-xp">+${ach.xp} XP</span></div>
                    <div class="ach-desc">${ach.desc}</div>
                    ${ach.isUnlocked && ach.unlockedAt ? `<div class="ach-date">Desbloqueado el ${new Date(ach.unlockedAt).toLocaleDateString()}</div>` : ''}
                </div>
                <div class="ach-status">${ach.isUnlocked ? '✅' : '🔒'}</div>
            `;
            listContainer.appendChild(item);
        });
    }

    // ==========================================
    // PROFILE & STATS MODAL
    // ==========================================
    btnOpenProfile.onclick = () => {
        renderProfileModal();
        profileModal.classList.remove('hidden');
    };

    function renderProfileModal() {
        const p = window.profile.getProfile();
        const nickInput = document.getElementById('profile-nick-input');
        const avatarPicker = document.getElementById('avatar-picker-grid');
        const statsList = document.getElementById('profile-stats-grid');

        if (nickInput) nickInput.value = p.nickname;

        // Avatar selector
        if (avatarPicker) {
            avatarPicker.innerHTML = '';
            window.profile.avatars.forEach(av => {
                const btn = document.createElement('button');
                btn.className = `avatar-opt ${p.avatar === av ? 'selected' : ''}`;
                btn.textContent = av;
                btn.onclick = () => {
                    window.profile.updateProfile(null, av);
                    renderProfileModal();
                    window.sound?.play('tap');
                };
                avatarPicker.appendChild(btn);
            });
        }

        // Stats
        if (statsList) {
            const minsPlayed = Math.floor((p.totalPlayTime || 0) / 60);
            const hours = Math.floor(minsPlayed / 60);
            const mins = minsPlayed % 60;
            const timeFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

            statsList.innerHTML = `
                <div class="stat-card">
                    <span class="stat-num">${p.level}</span>
                    <span class="stat-name">Nivel de Jugador</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${p.xp}</span>
                    <span class="stat-name">Puntos de XP</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${p.gamesPlayed || 0}</span>
                    <span class="stat-name">Partidas Jugadas</span>
                </div>
                <div class="stat-card">
                    <span class="stat-num">${timeFormatted}</span>
                    <span class="stat-name">Tiempo Total</span>
                </div>
            `;
        }
    }

    const btnSaveNick = document.getElementById('btn-save-profile-nick');
    if (btnSaveNick) {
        btnSaveNick.onclick = () => {
            const nick = document.getElementById('profile-nick-input').value;
            window.profile.updateProfile(nick, null);
            alert('¡Perfil actualizado con éxito!');
            window.sound?.play('select');
        };
    }

    // Modal Close Triggers
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.onclick = (e) => {
            const modal = e.target.closest('.app-modal');
            if (modal) modal.classList.add('hidden');
        };
    });

    window.onclick = (e) => {
        if (e.target.classList.contains('app-modal') && !e.target.classList.contains('game-viewport-modal')) {
            e.target.classList.add('hidden');
        }
    };

    // Listen for level-up / save events
    window.addEventListener('jsw_levelup', () => {
        window.profile?.renderHubProfile();
        updateQuickStats();
    });

    // PWA Offline installation & Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker PWA Offline listo:', reg.scope))
            .catch(err => console.warn('SW Error:', err));
    }
});
