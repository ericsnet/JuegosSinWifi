/**
 * Main Application Hub & Router for JuegosSinWifi
 */
document.addEventListener('DOMContentLoaded', () => {
    // 14 Games Definition
    const GAMES_CATALOG = [
        {
            id: 'snake',
            title: 'Cyber Snake Neon',
            genre: 'arcade',
            genreLabel: 'Arcade & Acción',
            icon: '🐍',
            color: '#00ff88',
            desc: 'La serpiente clásica reinventada con gráficos neón, manzanas doradas y velocidad creciente.',
            controls: 'Teclas Flechas / WASD o Deslizar en pantalla táctil.',
            classRef: window.CyberSnake
        },
        {
            id: 'tetris',
            title: 'TetroBlocks Neon',
            genre: 'puzzle',
            genreLabel: 'Puzzles & Lógica',
            icon: '🧱',
            color: '#00f0ff',
            desc: 'El legendario juego de encajar bloques con función Guardar pieza, sombra fantasma y combos.',
            controls: '◄ ► Mover, ▲ Rotar, ▼ Bajar, Espacio Caída rápida, C Guardar pieza.',
            classRef: window.NeonTetris
        },
        {
            id: 'space',
            title: 'Space Defender',
            genre: 'arcade',
            genreLabel: 'Arcade & Acción',
            icon: '🛸',
            color: '#ff0055',
            desc: 'Shooter espacial retro. Destruye oleadas de invasores alienígenas, recoge power-ups y vence a los jefes.',
            controls: '◄ ► Mover nave, Espacio / Fuego Disparar.',
            classRef: window.SpaceDefender
        },
        {
            id: 'flappy',
            title: 'Flappy Cyber',
            genre: 'arcade',
            genreLabel: 'Arcade & Acción',
            icon: '🪽',
            color: '#ff007f',
            desc: 'Pilota un drone futurista a través de barreras láser flotantes.',
            controls: 'Toca la pantalla, Clic o pulsa Espacio para dar propulsión.',
            classRef: window.FlappyCyber
        },
        {
            id: 'game2048',
            title: '2048 Fusion',
            genre: 'puzzle',
            genreLabel: 'Puzzles & Lógica',
            icon: '🔢',
            color: '#ffd700',
            desc: 'Desliza y fusiona números idénticos para alcanzar la mítica ficha 2048. ¡Incluye botón Deshacer!',
            controls: 'Flechas / Deslizar en pantalla.',
            classRef: window.Game2048
        },
        {
            id: 'minesweeper',
            title: 'Buscaminas Deluxe',
            genre: 'puzzle',
            genreLabel: 'Puzzles & Lógica',
            icon: '💣',
            color: '#ffaa00',
            desc: 'Despeja el campo minado usando lógica y números. Primer clic siempre seguro.',
            controls: 'Clic para revelar, Clic derecho o botón Bandera para marcar minas.',
            classRef: window.Minesweeper
        },
        {
            id: 'memory',
            title: 'Memory Matrix',
            genre: 'puzzle',
            genreLabel: 'Puzzles & Lógica',
            icon: '🧠',
            color: '#bf00ff',
            desc: 'Encuentra todas las parejas de cartas en el menor número de movimientos posible.',
            controls: 'Clic o Toca las cartas para voltearlas.',
            classRef: window.MemoryMatrix
        },
        {
            id: 'sudoku',
            title: 'Sudoku Master',
            genre: 'puzzle',
            genreLabel: 'Puzzles & Lógica',
            icon: '🧩',
            color: '#00d2ff',
            desc: 'Desafíos diarios de Sudoku con 4 dificultades, notas a lápiz y sistema de pistas.',
            controls: 'Selecciona casilla y pulsa un número del 1 al 9.',
            classRef: window.SudokuMaster
        },
        {
            id: 'connect4',
            title: 'Conecta 4 Neón',
            genre: 'strategy',
            genreLabel: 'Estrategia & Cartas',
            icon: '🔴',
            color: '#ff3366',
            desc: 'Alinea 4 fichas en raya antes que tu rival. Juega contra la IA o contra un amigo en local.',
            controls: 'Toca la columna deseada para soltar la ficha.',
            classRef: window.ConnectFour
        },
        {
            id: 'hangman',
            title: 'El Ahorcado Pro',
            genre: 'words',
            genreLabel: 'Palabras & Reflejos',
            icon: '📜',
            color: '#00ffaa',
            desc: 'Adivina palabras en español de videojuegos, países, cine, ciencia y animales.',
            controls: 'Toca las letras del teclado virtual o pulsa las teclas de tu teclado.',
            classRef: window.HangmanGame
        },
        {
            id: 'pong',
            title: 'Cyber Pong',
            genre: 'arcade',
            genreLabel: 'Arcade & Acción',
            icon: '🏓',
            color: '#00f0ff',
            desc: 'El clásico duelo de tenis de mesa arcade con físicas de efecto y modo 1P / 2P.',
            controls: 'P1: W/S o Arrastre | P2: Flechas Arriba/Abajo.',
            classRef: window.CyberPong
        },
        {
            id: 'runner',
            title: 'Neon Dino Runner',
            genre: 'arcade',
            genreLabel: 'Arcade & Acción',
            icon: '🦖',
            color: '#00ff88',
            desc: 'Corre sin parar por el desierto ciberpunk saltando obstáculos y agachándote bajo los drones.',
            controls: 'Espacio / ▲ Saltar, ▼ Agacharse.',
            classRef: window.DinoRunner
        },
        {
            id: 'typing',
            title: 'Speed Typer',
            genre: 'words',
            genreLabel: 'Palabras & Reflejos',
            icon: '⚡',
            color: '#ffd700',
            desc: 'Escribe a toda velocidad las palabras que caen del cielo para destruir sus proyectiles.',
            controls: 'Escribe las palabras con tu teclado antes de que toquen el suelo.',
            classRef: window.SpeedTyper
        },
        {
            id: 'solitaire',
            title: 'Solitario Klondike',
            genre: 'strategy',
            genreLabel: 'Estrategia & Cartas',
            icon: '🃏',
            color: '#ff5500',
            desc: 'El rey de los solitarios de cartas. Modo Robar 1 o 3, auto-completar y deshacer.',
            controls: 'Clic o Toca una carta para enviarla automáticamente a su lugar válido.',
            classRef: window.SolitaireKlondike
        }
    ];

    let currentActiveGame = null;
    let currentFilter = 'all';
    let searchQuery = '';

    // DOM Elements
    const gamesGrid = document.getElementById('games-grid');
    const searchInput = document.getElementById('search-games-input');
    const filterTabs = document.querySelectorAll('.category-tab');
    
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

    // Render Hub & Profile initial
    window.profile?.renderHubProfile();
    renderGamesCatalog();
    updateAudioButtons();
    updateCloudStatusBadge();

    // ==========================================
    // CATALOG RENDERING & FILTERING
    // ==========================================
    function renderGamesCatalog() {
        if (!gamesGrid) return;
        gamesGrid.innerHTML = '';

        const filtered = GAMES_CATALOG.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  game.desc.toLowerCase().includes(searchQuery.toLowerCase());
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
                    <span class="empty-icon">🔍</span>
                    <h3>No se encontraron juegos</h3>
                    <p>Prueba con otra búsqueda o selecciona una categoría diferente.</p>
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

            card.innerHTML = `
                <div class="card-glow" style="--accent: ${game.color};"></div>
                <button class="btn-fav ${isFav ? 'is-fav' : ''}" title="Marcar como favorito" data-fav-id="${game.id}">
                    ${isFav ? '★' : '☆'}
                </button>
                <div class="card-icon-wrapper" style="--accent: ${game.color};">
                    <span class="card-game-icon">${game.icon}</span>
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <span class="genre-badge">${game.genreLabel}</span>
                        <span class="score-badge">🏆 ${score}</span>
                    </div>
                    <h3 class="card-title">${game.title}</h3>
                    <p class="card-desc">${game.desc}</p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-play" data-play-id="${game.id}">
                        <span>JUGAR AHORA</span>
                        <span class="play-arrow">▶</span>
                    </button>
                </div>
            `;

            // Card Play event
            card.querySelector('.btn-play').onclick = (e) => {
                e.stopPropagation();
                launchGame(game.id);
            };
            card.onclick = () => launchGame(game.id);

            // Fav event
            card.querySelector('.btn-fav').onclick = (e) => {
                e.stopPropagation();
                const nowFav = window.storage.toggleFavorite(game.id);
                renderGamesCatalog();
                window.sound?.play('select');
            };

            gamesGrid.appendChild(card);
        });
    }

    // Filter Tabs
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

    // ==========================================
    // GAME LAUNCHER & MODAL VIEWPORT
    // ==========================================
    function launchGame(gameId) {
        const gameMeta = GAMES_CATALOG.find(g => g.id === gameId);
        if (!gameMeta) return;

        // Clean up any existing game instance
        if (currentActiveGame && typeof currentActiveGame.destroy === 'function') {
            currentActiveGame.destroy();
            currentActiveGame = null;
        }

        modalGameTitle.textContent = gameMeta.title;
        modalGameGenre.textContent = gameMeta.genreLabel;
        gameContainer.innerHTML = '';

        gameModal.classList.remove('hidden');
        document.body.classList.add('modal-open');

        // Instantiate game class
        const GameClass = gameMeta.classRef;
        if (GameClass) {
            currentActiveGame = new GameClass(gameContainer);
            currentActiveGame.gameId = gameId;
            currentActiveGame.init();
        }

        window.sound?.play('select');
    }

    function exitGame() {
        if (currentActiveGame && typeof currentActiveGame.destroy === 'function') {
            currentActiveGame.destroy();
            currentActiveGame = null;
        }
        gameContainer.innerHTML = '';
        gameModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        renderGamesCatalog();
        window.profile?.renderHubProfile();
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
            btnGlobalSound.innerHTML = sfxOn ? '🔊 Efectos: ON' : '🔇 Efectos: OFF';
        }
        if (btnGlobalMusic) {
            btnGlobalMusic.classList.toggle('active', musicOn);
            btnGlobalMusic.innerHTML = musicOn ? '🎵 Música: ON' : '🎵 Música: OFF';
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
            badge.innerHTML = `<span class="status-dot orange"></span> Nube: Conectado (Sin sincronizar)`;
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
                <div class="cloud-connected-card">
                    <div class="cloud-user-header">
                        <span class="cloud-icon">☁️</span>
                        <div>
                            <strong>GitHub Cloud Sync Activado</strong>
                            <p class="text-muted">Gist ID: <code>${gistId || 'Se creará en la primera sincronización'}</code></p>
                        </div>
                    </div>
                    <div class="cloud-sync-meta">
                        <span>Última sincronización: <strong>${lastSync ? new Date(lastSync).toLocaleString() : 'Nunca'}</strong></span>
                    </div>
                </div>
            `;
        } else {
            infoEl.innerHTML = `
                <div class="cloud-disconnected-card">
                    <p>Conecta tu cuenta de GitHub con un <strong>Personal Access Token</strong> (permiso <code>gist</code>) para sincronizar tus partidas, récords y logros automáticamente en cualquier dispositivo.</p>
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
        cloudStatusMsg.style.display = 'block';
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
                alert('¡Partida restaurada con éxito desde el archivo!');
                renderGamesCatalog();
                window.profile?.renderHubProfile();
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
    window.addEventListener('jsw_levelup', (e) => {
        window.profile?.renderHubProfile();
    });

    // PWA Offline installation & Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado con éxito (PWA Offline listo):', reg.scope))
            .catch(err => console.warn('Error registrando Service Worker:', err));
    }
});
