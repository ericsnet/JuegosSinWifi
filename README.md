**Languages:** English | [Español](README.es.md)

<div align="center">

# 🕹️ JuegosSinWifi

### Your little arcade, even when you don't have Internet.

A collection of **18 games in HTML, CSS, and JavaScript**, with local saves, touch controls, and PWA support so you can play in your browser.

[**▶ Play now**](https://ericsnet.github.io/JuegosSinWifi/) · [View the code](https://github.com/ericsnet/JuegosSinWifi) · [Report an issue](https://github.com/ericsnet/JuegosSinWifi/issues)

![GitHub last commit](https://img.shields.io/github/last-commit/ericsnet/JuegosSinWifi?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/ericsnet/JuegosSinWifi?style=flat-square)
![License](https://img.shields.io/badge/licencia-propietaria-555?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-compatible-5a4fcf?style=flat-square)

</div>

---

## 🎮 Included games

| Game | What is it about? |
|---|---|
| 🐍 **Cyber Snake Neon** | Arcade snake with power-ups and acceleration. |
| 🧱 **TetroBlocks Neon** | Blocks, SRS rotations, piece hold, and combos. |
| 🚀 **Space Defender** | Space combat with waves, bosses, and upgrades. |
| 🐦 **Flappy Cyber** | Fly and dodge obstacles. |
| 🔢 **2048 Fusion** | Combine numbers, undo moves, and beat records. |
| 💣 **Buscaminas Deluxe** | Three difficulty levels, flags, and a safe first click. |
| 🧠 **Memory Matrix** | Find matching pairs across different themes and boards. |
| 🔢 **Sudoku Master** | Four difficulty levels, notes, and hints. |
| 🔴 **Conecta 4 Neón** | Play against the AI or another person on the same device. |
| 🔤 **El Ahorcado Pro** | Spanish words organized by category. |
| 🏓 **Cyber Pong** | Pong with effects and one- or two-player modes. |
| 🦖 **Neon Dino Runner** | Endless runner with jumps, ducking, and a day/night cycle. |
| ⌨️ **Speed Typer** | Practice typing and reflexes. |
| 🃏 **Solitario Klondike** | Draw-one or draw-three modes, undo, and auto-complete. |
| 🧱 **Breakout** | Break blocks with a paddle and ball, using touch or keyboard controls. |
| ⭕ **Tres en raya** | A classic strategy game for two people on the same device. |
| 💡 **Lights Out** | Turn off all the lights in as few moves as possible. |
| ⏱️ **Prueba de reacción** | Measure your response time with a quick reflex test. |

## ✨ Features

- **🌐 Online and offline:** play in your browser; the Service Worker can store resources for offline use after the initial load.
- **📱 Mobile-friendly:** touch and keyboard controls.
- **📲 Installable:** supports the progressive web app (PWA) approach.
- **💾 Local saves:** keeps your profile, stats, records, and achievements on your device.
- **☁️ Optional GitHub Gist sync:** transfer progress between devices.
- **📦 Backups:** export and import game saves as JSON files.
- **🔊 Browser-generated audio:** sound effects and music synthesized with the Web Audio API, with no audio files to download.
- **🏆 Progression:** experience, levels, and achievements.

## 🚀 How to play

### Option 1: Open the website

Go to **[ericsnet.github.io/JuegosSinWifi](https://ericsnet.github.io/JuegosSinWifi/)**. To play offline, first open the page with Internet access and let the necessary resources download and be stored.

### Option 2: Run a local copy

Clone the repository:

```bash
git clone https://github.com/ericsnet/JuegosSinWifi.git
cd JuegosSinWifi
```

Start a local server with one of these options:

```bash
# Python 3
python3 -m http.server 8080
```

Or, if you have Node.js installed:

```bash
npx serve -l 8080 -s .
```

Then open [http://localhost:8080](http://localhost:8080).

> **Note:** opening `index.html` directly may let you play, but Service Workers and some PWA features require an HTTP/HTTPS origin.

## ☁️ Cloud saves with GitHub

Gist sync is optional. If you prefer not to connect GitHub, you can keep using local saves and JSON backups.

1. On GitHub, create a **Personal Access Token (classic)** from *Settings → Developer settings → Personal access tokens → Tokens (classic)*.
2. Grant only the **`gist`** permission.
3. Enter the token in the JuegosSinWifi sync section.
4. Use the options to upload or download your save.

**Security:** the token is stored in your browser's local storage. Use this feature only on trusted devices, do not share the token, and revoke it on GitHub if you think it has been exposed. Do not grant permissions beyond `gist`.

## 🧰 Technologies

- HTML5, CSS3, and JavaScript.
- Canvas and DOM for the interface and games.
- Web Audio API for sound generated in real time.
- LocalStorage for local data.
- GitHub Gists API for optional synchronization.
- Service Worker and Web App Manifest for PWA features.

No build process is needed to run the project.

## 📁 Project structure

```text
JuegosSinWifi/
├── index.html
├── manifest.json
├── sw.js
├── icons/
│   └── icon.svg
├── css/
│   ├── style.css
│   ├── games.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── audio.js
│   ├── storage.js
│   ├── achievements.js
│   ├── profile.js
│   └── games/
│       ├── snake.js
│       ├── tetris.js
│       ├── space-invaders.js
│       ├── flappy.js
│       ├── game2048.js
│       ├── minesweeper.js
│       ├── memory.js
│       ├── sudoku.js
│       ├── connect4.js
│       ├── hangman.js
│       ├── pong.js
│       ├── runner.js
│       ├── typing.js
│       ├── solitaire.js
│       ├── breakout.js
│       ├── tictactoe.js
│       ├── lightsout.js
│       └── reaction.js
└── README.md
```

## 🤝 Contributing

Found a bug or have an idea to improve the project?

1. Open an [issue](https://github.com/ericsnet/JuegosSinWifi/issues) describing the problem or suggestion.
2. If you want to contribute code, fork the repository and prepare a pull request with your changes.

Please test the affected game as well as how it works on mobile and offline.

## 📄 License

Copyright (c) 2026 **ericsnet**. All rights reserved.

This project is proprietary software. No permission is granted to copy, modify, distribute, or create derivative works without prior written authorization, except as permitted by applicable law. See the [LICENSE](https://github.com/ericsnet/JuegosSinWifi/blob/main/LICENSE) file.

---

<div align="center">

**[▶ Play JuegosSinWifi](https://ericsnet.github.io/JuegosSinWifi/)**

Made for playing, even when there's no Wi-Fi.

</div>