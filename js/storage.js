/**
 * Storage & GitHub Cloud Sync Engine for JuegosSinWifi
 * Supports LocalStorage, JSON Export/Import & GitHub Gist Cloud Sync
 */
class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'jsw_arcade_save_v1';
        this.TOKEN_KEY = 'jsw_gh_token';
        this.GIST_ID_KEY = 'jsw_gh_gist_id';
        this.GIST_FILENAME = 'juegos_sin_wifi_save.json';
        this.data = this.loadInitialData();
    }

    getDefaultData() {
        return {
            version: 1,
            lastModified: Date.now(),
            profile: {
                nickname: 'CiberJugador',
                avatar: '👾',
                level: 1,
                xp: 0,
                title: 'Novato Arcade',
                totalPlayTime: 0,
                gamesPlayed: 0
            },
            scores: {
                snake: 0,
                tetris: 0,
                space: 0,
                flappy: 0,
                game2048: 0,
                minesweeper: 0,
                memory: 0,
                sudoku: 0,
                connect4: 0,
                hangman: 0,
                pong: 0,
                runner: 0,
                typing: 0,
                solitaire: 0
            },
            stats: {
                snake: { played: 0, best: 0, time: 0 },
                tetris: { played: 0, best: 0, lines: 0, time: 0 },
                space: { played: 0, best: 0, waves: 0, time: 0 },
                flappy: { played: 0, best: 0, time: 0 },
                game2048: { played: 0, best: 0, maxTile: 0, time: 0 },
                minesweeper: { played: 0, won: 0, bestTime: 0, time: 0 },
                memory: { played: 0, won: 0, bestMoves: 0, time: 0 },
                sudoku: { played: 0, won: 0, bestTime: 0, time: 0 },
                connect4: { played: 0, won: 0, time: 0 },
                hangman: { played: 0, won: 0, streak: 0, time: 0 },
                pong: { played: 0, won: 0, time: 0 },
                runner: { played: 0, best: 0, time: 0 },
                typing: { played: 0, bestWpm: 0, time: 0 },
                solitaire: { played: 0, won: 0, bestScore: 0, time: 0 }
            },
            achievements: {},
            favorites: ['snake', 'tetris', 'space', 'game2048'],
            settings: {
                theme: 'cyber-dark',
                sfx: true,
                music: false,
                touchControls: true
            },
            customSaves: {}
        };
    }

    loadInitialData() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return this.mergeWithDefault(parsed);
            }
        } catch (e) {
            console.error('Error cargando localStorage:', e);
        }
        const fresh = this.getDefaultData();
        this.saveLocal(fresh);
        return fresh;
    }

    mergeWithDefault(loaded) {
        const def = this.getDefaultData();
        return {
            ...def,
            ...loaded,
            profile: { ...def.profile, ...(loaded.profile || {}) },
            scores: { ...def.scores, ...(loaded.scores || {}) },
            stats: { ...def.stats, ...(loaded.stats || {}) },
            achievements: { ...def.achievements, ...(loaded.achievements || {}) },
            favorites: Array.isArray(loaded.favorites) ? loaded.favorites : def.favorites,
            settings: { ...def.settings, ...(loaded.settings || {}) },
            customSaves: { ...def.customSaves, ...(loaded.customSaves || {}) }
        };
    }

    saveLocal(dataToSave = this.data) {
        dataToSave.lastModified = Date.now();
        this.data = dataToSave;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            window.dispatchEvent(new CustomEvent('jsw_data_saved', { detail: this.data }));
        } catch (e) {
            console.error('Error guardando en localStorage:', e);
        }
    }

    getScore(gameKey) {
        return this.data.scores[gameKey] || 0;
    }

    setScore(gameKey, score) {
        const current = this.data.scores[gameKey] || 0;
        let isNewHigh = false;
        if (score > current) {
            this.data.scores[gameKey] = score;
            if (!this.data.stats[gameKey]) this.data.stats[gameKey] = {};
            this.data.stats[gameKey].best = score;
            isNewHigh = true;
        }
        this.addXp(Math.max(5, Math.floor(score / 10)));
        this.saveLocal();
        return isNewHigh;
    }

    recordGamePlay(gameKey, won = false, score = 0, timeSeconds = 0) {
        if (!this.data.stats[gameKey]) {
            this.data.stats[gameKey] = { played: 0, best: 0, time: 0 };
        }
        const stat = this.data.stats[gameKey];
        stat.played = (stat.played || 0) + 1;
        stat.time = (stat.time || 0) + timeSeconds;
        if (won) stat.won = (stat.won || 0) + 1;

        this.data.profile.gamesPlayed = (this.data.profile.gamesPlayed || 0) + 1;
        this.data.profile.totalPlayTime = (this.data.profile.totalPlayTime || 0) + timeSeconds;

        let earnedXp = 15;
        if (won) earnedXp += 30;
        if (score > 0) earnedXp += Math.min(100, Math.floor(score / 5));
        this.addXp(earnedXp);

        this.saveLocal();
    }

    addXp(amount) {
        if (amount <= 0) return;
        this.data.profile.xp = (this.data.profile.xp || 0) + amount;
        
        // Level curve: 100 XP * Level
        let currentLvl = this.data.profile.level || 1;
        let xpNeeded = currentLvl * 100;
        let leveledUp = false;

        while (this.data.profile.xp >= xpNeeded) {
            this.data.profile.xp -= xpNeeded;
            currentLvl++;
            this.data.profile.level = currentLvl;
            xpNeeded = currentLvl * 100;
            leveledUp = true;
        }

        // Titles based on level
        const titles = [
            'Novato Arcade', 'Jugador Casual', 'Fanático Pixel', 'Estratega Neón',
            'Maestro del Joystick', 'Campeón de Salón', 'Mago del Puzzle',
            'Leyenda Retro', 'Gran Maestro Gamer', 'Dios del Arcade'
        ];
        const titleIndex = Math.min(titles.length - 1, Math.floor((currentLvl - 1) / 3));
        this.data.profile.title = titles[titleIndex];

        if (leveledUp) {
            if (window.sound) window.sound.play('victory');
            window.dispatchEvent(new CustomEvent('jsw_levelup', { detail: this.data.profile }));
        }
    }

    isFavorite(gameKey) {
        return this.data.favorites.includes(gameKey);
    }

    toggleFavorite(gameKey) {
        const idx = this.data.favorites.indexOf(gameKey);
        if (idx >= 0) {
            this.data.favorites.splice(idx, 1);
        } else {
            this.data.favorites.push(gameKey);
        }
        this.saveLocal();
        return this.isFavorite(gameKey);
    }

    saveCustomGame(gameKey, gameState) {
        this.data.customSaves[gameKey] = {
            state: gameState,
            savedAt: Date.now()
        };
        this.saveLocal();
    }

    loadCustomGame(gameKey) {
        return this.data.customSaves[gameKey] || null;
    }

    clearCustomGame(gameKey) {
        delete this.data.customSaves[gameKey];
        this.saveLocal();
    }

    // ==========================================
    // EXPORT & IMPORT LOCAL FILE (JSON)
    // ==========================================
    exportToJsonFile() {
        const payload = JSON.stringify(this.data, null, 2);
        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `juegos-sin-wifi-backup-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importFromJsonFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);
                    if (!parsed || typeof parsed !== 'object') {
                        throw new Error('Formato de archivo inválido');
                    }
                    this.data = this.mergeWithDefault(parsed);
                    this.saveLocal();
                    resolve(this.data);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Error leyendo archivo'));
            reader.readAsText(file);
        });
    }

    // ==========================================
    // GITHUB GIST CLOUD SYNC
    // ==========================================
    getGitHubToken() {
        return localStorage.getItem(this.TOKEN_KEY) || '';
    }

    setGitHubToken(token) {
        if (token) {
            localStorage.setItem(this.TOKEN_KEY, token.trim());
        } else {
            localStorage.removeItem(this.TOKEN_KEY);
            localStorage.removeItem(this.GIST_ID_KEY);
        }
    }

    getGistId() {
        return localStorage.getItem(this.GIST_ID_KEY) || '';
    }

    setGistId(gistId) {
        if (gistId) {
            localStorage.setItem(this.GIST_ID_KEY, gistId.trim());
        } else {
            localStorage.removeItem(this.GIST_ID_KEY);
        }
    }

    async testGitHubConnection(token = this.getGitHubToken()) {
        if (!token) throw new Error('No se ha proporcionado un token de GitHub.');
        
        const res = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!res.ok) {
            if (res.status === 401) throw new Error('Token inválido o expirado. Verifica tus permisos de GitHub.');
            throw new Error(`Error de conexión con GitHub (${res.status}): ${res.statusText}`);
        }

        const user = await res.json();
        return {
            login: user.login,
            name: user.name || user.login,
            avatar_url: user.avatar_url
        };
    }

    async findOrCreateGist(token) {
        let gistId = this.getGistId();

        // Check if existing gist ID is valid
        if (gistId) {
            try {
                const res = await fetch(`https://api.github.com/gists/${gistId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/vnd.github+json'
                    }
                });
                if (res.ok) {
                    return gistId;
                }
            } catch (e) {
                console.warn('Gist existente no encontrado o inaccesible, buscando en lista...');
            }
        }

        // Search user gists for JuegosSinWifi save
        const listRes = await fetch('https://api.github.com/gists?per_page=50', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (listRes.ok) {
            const gists = await listRes.json();
            const existing = gists.find(g => 
                (g.files && g.files[this.GIST_FILENAME]) || 
                (g.description && g.description.includes('JuegosSinWifi'))
            );
            if (existing) {
                this.setGistId(existing.id);
                return existing.id;
            }
        }

        // Create new secret gist
        const createRes = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: '🎮 JuegosSinWifi - Partida Guardada en la Nube (Cloud Save)',
                public: false,
                files: {
                    [this.GIST_FILENAME]: {
                        content: JSON.stringify(this.data, null, 2)
                    }
                }
            })
        });

        if (!createRes.ok) {
            const err = await createRes.json();
            throw new Error(err.message || 'No se pudo crear el Gist en GitHub. Asegúrate de que el token tiene el scope "gist".');
        }

        const newGist = await createRes.json();
        this.setGistId(newGist.id);
        return newGist.id;
    }

    async uploadToGitHub() {
        const token = this.getGitHubToken();
        if (!token) throw new Error('Por favor configura tu Personal Access Token de GitHub primero.');

        const gistId = await this.findOrCreateGist(token);
        this.data.lastModified = Date.now();

        const updateRes = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                description: `🎮 JuegosSinWifi - Cloud Save (Actualizado ${new Date().toLocaleString()})`,
                files: {
                    [this.GIST_FILENAME]: {
                        content: JSON.stringify(this.data, null, 2)
                    }
                }
            })
        });

        if (!updateRes.ok) {
            const err = await updateRes.json();
            throw new Error(err.message || 'Error actualizando Gist en GitHub');
        }

        const savedGist = await updateRes.json();
        localStorage.setItem('jsw_last_cloud_sync', Date.now().toString());
        return {
            gistId: savedGist.id,
            url: savedGist.html_url,
            updatedAt: savedGist.updated_at
        };
    }

    async downloadFromGitHub() {
        const token = this.getGitHubToken();
        if (!token) throw new Error('Por favor configura tu Personal Access Token de GitHub primero.');

        const gistId = await this.findOrCreateGist(token);
        const res = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json'
            }
        });

        if (!res.ok) {
            throw new Error('Error al descargar los datos de la nube.');
        }

        const gist = await res.json();
        const file = gist.files && gist.files[this.GIST_FILENAME];
        if (!file || !file.content) {
            throw new Error('El Gist no contiene el archivo de partida válido.');
        }

        const cloudData = JSON.parse(file.content);
        this.data = this.mergeWithDefault(cloudData);
        this.saveLocal();
        localStorage.setItem('jsw_last_cloud_sync', Date.now().toString());

        return {
            data: this.data,
            gistId: gist.id,
            updatedAt: gist.updated_at
        };
    }

    getLastSyncTime() {
        const raw = localStorage.getItem('jsw_last_cloud_sync');
        return raw ? parseInt(raw, 10) : null;
    }
}

// Global instance
window.storage = new StorageManager();
