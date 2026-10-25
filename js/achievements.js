/**
 * Global Achievements Engine for JuegosSinWifi
 */
class AchievementManager {
    constructor() {
        this.list = [
            {
                id: 'first_steps',
                title: 'Primeros Pasos',
                desc: 'Juega tu primera partida a cualquier juego',
                icon: '🚀',
                xp: 50,
                check: (data) => data.profile.gamesPlayed >= 1
            },
            {
                id: 'arcade_enthusiast',
                title: 'Fan del Arcade',
                desc: 'Juega al menos 10 partidas en total',
                icon: '🕹️',
                xp: 150,
                check: (data) => data.profile.gamesPlayed >= 10
            },
            {
                id: 'game_master',
                title: 'Veterano Imparable',
                desc: 'Alcanza 50 partidas jugadas',
                icon: '🏆',
                xp: 500,
                check: (data) => data.profile.gamesPlayed >= 50
            },
            {
                id: 'snake_charmer',
                title: 'Encantador de Serpientes',
                desc: 'Consigue 200 puntos en Cyber Snake',
                icon: '🐍',
                xp: 100,
                check: (data) => (data.scores.snake || 0) >= 200
            },
            {
                id: 'tetris_stacker',
                title: 'Arquitecto de Bloques',
                desc: 'Supera los 1,000 puntos en Neon Tetris',
                icon: '🧱',
                xp: 150,
                check: (data) => (data.scores.tetris || 0) >= 1000
            },
            {
                id: 'space_ace',
                title: 'Piloto Galáctico',
                desc: 'Alcanza 1,500 puntos en Space Defender',
                icon: '🛸',
                xp: 200,
                check: (data) => (data.scores.space || 0) >= 1500
            },
            {
                id: 'fusion_master',
                title: 'Fusión Cuántica',
                desc: 'Llega a 2048 o consigue 2,000 puntos en 2048 Fusion',
                icon: '🔢',
                xp: 250,
                check: (data) => (data.scores.game2048 || 0) >= 2000
            },
            {
                id: 'bomb_defuser',
                title: 'Desactivador Experto',
                desc: 'Gana una partida en Buscaminas',
                icon: '💣',
                xp: 150,
                check: (data) => (data.stats.minesweeper?.won || 0) >= 1
            },
            {
                id: 'mind_pro',
                title: 'Memoria Fotográfica',
                desc: 'Completa una partida de Memory Matrix',
                icon: '🧠',
                xp: 100,
                check: (data) => (data.stats.memory?.won || 0) >= 1
            },
            {
                id: 'sudoku_solver',
                title: 'Mente Numérica',
                desc: 'Resuelve un Sudoku completo',
                icon: '🧩',
                xp: 200,
                check: (data) => (data.stats.sudoku?.won || 0) >= 1
            },
            {
                id: 'wordsmith',
                title: 'Maestro de la Palabra',
                desc: 'Gana una partida de Ahorcado',
                icon: '📜',
                xp: 100,
                check: (data) => (data.stats.hangman?.won || 0) >= 1
            },
            {
                id: 'pong_champion',
                title: 'Rey de la Mesa',
                desc: 'Gana una partida en Cyber Pong',
                icon: '🏓',
                xp: 120,
                check: (data) => (data.stats.pong?.won || 0) >= 1
            },
            {
                id: 'speed_runner',
                title: 'Corredor Supersónico',
                desc: 'Consigue 500 metros en Dino Runner',
                icon: '🦖',
                xp: 150,
                check: (data) => (data.scores.runner || 0) >= 500
            },
            {
                id: 'flappy_flyer',
                title: 'As del Vuelo',
                desc: 'Esquiva 20 obstáculos en Flappy Cyber',
                icon: '🪽',
                xp: 150,
                check: (data) => (data.scores.flappy || 0) >= 20
            },
            {
                id: 'typing_god',
                title: 'Dedos Relámpago',
                desc: 'Consigue 300 puntos en Speed Typer',
                icon: '⚡',
                xp: 150,
                check: (data) => (data.scores.typing || 0) >= 300
            },
            {
                id: 'solitaire_win',
                title: 'Gran Tahúr',
                desc: 'Completa una partida de Solitario',
                icon: '🃏',
                xp: 200,
                check: (data) => (data.stats.solitaire?.won || 0) >= 1
            },
            {
                id: 'cloud_master',
                title: 'Guardado Cósmico',
                desc: 'Configura o sincroniza tu partida en la nube de GitHub',
                icon: '☁️',
                xp: 100,
                check: (data) => !!localStorage.getItem('jsw_gh_token') || !!localStorage.getItem('jsw_last_cloud_sync')
            }
        ];
    }

    checkAll() {
        if (!window.storage) return;
        const data = window.storage.data;
        const unlocked = data.achievements || {};
        let newlyUnlocked = [];

        for (const ach of this.list) {
            if (!unlocked[ach.id] && ach.check(data)) {
                unlocked[ach.id] = {
                    unlockedAt: Date.now()
                };
                newlyUnlocked.push(ach);
                window.storage.addXp(ach.xp);
            }
        }

        if (newlyUnlocked.length > 0) {
            data.achievements = unlocked;
            window.storage.saveLocal();
            newlyUnlocked.forEach(ach => this.showNotification(ach));
        }
    }

    showNotification(ach) {
        if (window.sound) window.sound.play('victory');
        
        const container = document.getElementById('achievement-toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = 'achievement-toast animate-slide-in';
        toast.innerHTML = `
            <div class="toast-icon">${ach.icon}</div>
            <div class="toast-content">
                <div class="toast-title">¡Logro Desbloqueado! +${ach.xp} XP</div>
                <div class="toast-name">${ach.title}</div>
                <div class="toast-desc">${ach.desc}</div>
            </div>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4500);
    }

    createToastContainer() {
        let el = document.getElementById('achievement-toast-container');
        if (!el) {
            el = document.createElement('div');
            el.id = 'achievement-toast-container';
            el.className = 'achievement-toast-container';
            document.body.appendChild(el);
        }
        return el;
    }

    getAll() {
        const unlocked = window.storage?.data?.achievements || {};
        return this.list.map(ach => ({
            ...ach,
            isUnlocked: !!unlocked[ach.id],
            unlockedAt: unlocked[ach.id]?.unlockedAt || null
        }));
    }

    getUnlockedCount() {
        const unlocked = window.storage?.data?.achievements || {};
        return Object.keys(unlocked).length;
    }
}

window.achievements = new AchievementManager();
