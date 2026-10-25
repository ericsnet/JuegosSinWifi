/**
 * Profile & Player Customization Manager
 */
class ProfileManager {
    constructor() {
        this.avatars = [
            '👾', '🤖', '🎮', '🕹️', '🐱', '🦊', '🐉', '⚡', 
            '🚀', '🛸', '💎', '🔥', '🧠', '🧙', '🦸', '🏆'
        ];
    }

    getProfile() {
        return window.storage.data.profile;
    }

    updateProfile(nickname, avatar) {
        if (nickname) {
            window.storage.data.profile.nickname = nickname.trim().slice(0, 20);
        }
        if (avatar && this.avatars.includes(avatar)) {
            window.storage.data.profile.avatar = avatar;
        }
        window.storage.saveLocal();
        this.renderHubProfile();
    }

    renderHubProfile() {
        const profile = this.getProfile();
        const avatarEl = document.getElementById('hub-player-avatar');
        const nameEl = document.getElementById('hub-player-name');
        const levelEl = document.getElementById('hub-player-level');
        const titleEl = document.getElementById('hub-player-title');
        const xpBarEl = document.getElementById('hub-player-xp-bar');
        const xpTextEl = document.getElementById('hub-player-xp-text');

        if (avatarEl) avatarEl.textContent = profile.avatar;
        if (nameEl) nameEl.textContent = profile.nickname;
        if (levelEl) levelEl.textContent = `Niv. ${profile.level}`;
        if (titleEl) titleEl.textContent = profile.title;

        const maxLvlXp = profile.level * 100;
        const currentXp = profile.xp;
        const pct = Math.min(100, Math.round((currentXp / maxLvlXp) * 100));

        if (xpBarEl) xpBarEl.style.width = `${pct}%`;
        if (xpTextEl) xpTextEl.textContent = `${currentXp} / ${maxLvlXp} XP`;
    }
}

window.profile = new ProfileManager();
