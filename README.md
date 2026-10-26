# 🕹️ JuegosSinWifi

> **Portal Arcade de Videojuegos 100% Funcional Online y Offline con Guardado Local y en la Nube de GitHub.**

![JuegosSinWifi](icons/icon.svg)

🌐 **Página web:** [https://ericsnet.github.io/JuegosSinWifi/](https://ericsnet.github.io/JuegosSinWifi/)

---

## 🌟 Características Principales

- 🌐 **Juega Online y Offline**: Funciona en cualquier navegador web moderno, como aplicación web progresiva (PWA) instalable en tu móvil u ordenador, o descargando los archivos para jugar sin conexión ni internet.
- 🎮 **14 Juegos Completos para Todos los Gustos**:
  1. **Cyber Snake Neon** (Serpiente arcade con poderes y aceleración)
  2. **TetroBlocks Neon (Tetris)** (Piezas con rotación SRS, retención/hold, sombras y combos)
  3. **Space Defender** (Shooter espacial contra oleadas, jefes y power-ups)
  4. **Flappy Cyber** (Vuelo táctico con físicas y esquive de obstáculos)
  5. **2048 Fusion** (Fusión numérica con función de deshacer y modos de récord)
  6. **Buscaminas Deluxe** (3 niveles de dificultad, banderas y primer clic seguro)
  7. **Memory Matrix** (Encuentra parejas con múltiples temas y tamaños de tablero)
  8. **Sudoku Master** (Generador de tableros lógicos con 4 dificultades, lápiz y pistas)
  9. **Conecta 4 Neón** (Modo 1 Jugador contra IA Minimax y Modo 2 Jugadores en pantalla compartida)
  10. **El Ahorcado Pro** (Cientos de palabras en español clasificadas por categorías)
  11. **Cyber Pong** (Tenis de mesa retro con físicas de efecto y modos 1P / 2P)
  12. **Neon Dino Runner** (Corredor infinito con saltos, agachadas y ciclo día/noche)
  13. **Speed Typer** (Mecanografía y reflejos para interceptar palabras que caen)
  14. **Solitario Klondike** (Clásico juego de cartas con modos Robar 1/3, deshacer y autocompletar)
- 💾 **Doble Sistema de Guardado**:
  - **Guardado Local Automático**: Guarda puntuaciones máximas, estadísticas de partidas, logros desbloqueados y perfil de jugador en tu dispositivo.
  - **Sincronización en la Nube con GitHub (Gists)**: Conecta tu token de GitHub para subir y descargar tu partida en cualquier momento y compartir tu progreso entre varios dispositivos.
  - **Copia de Seguridad en Archivo JSON**: Exporta e importa tu archivo de partida en un solo clic sin necesidad de cuentas ni registros.
- 🔊 **Audio Sintetizado 100% Offline**: Efectos de sonido arcade (SFX) y música chiptune ambiental generada mediante Web Audio API en tiempo real (sin necesidad de descargar pesados archivos de audio).
- 📱 **Controles Táctiles y de Teclado**: Soporte completo para pantallas táctiles (botones en pantalla, swipes, toques) y teclados de PC (WASD, flechas, barra espaciadora).
- 🏆 **Sistema Global de Logros y Niveles de Jugador (XP)**.

---

## 🚀 Cómo Ejecutar el Proyecto

### Opción 1: Directamente en el Navegador (Sin dependencias)
Simplemente abre el archivo `index.html` en tu navegador favorito (Chrome, Edge, Firefox, Safari, etc.).

### Opción 2: Con un Servidor Local Ligero (Recomendado para Service Worker / PWA)
```bash
# Con Node.js / npx
npx serve -l 8080 -s .

# O con Python 3
python3 -m http.server 8080
```
Luego abre `http://localhost:8080` en tu navegador.

### Opción 3: Despliegue en GitHub Pages
1. Sube este repositorio a tu cuenta de GitHub.
2. Ve a **Settings > Pages**.
3. En **Branch**, selecciona `main` o tu rama por defecto y la carpeta `/ (root)`.
4. ¡Listo! Tu portal arcade estará disponible online en `https://<tu-usuario>.github.io/JuegosSinWifi/`.

---

## ☁️ Configuración del Guardado en la Nube de GitHub

Para activar la sincronización con la nube:

1. Ve a tu cuenta de GitHub: **Settings > Developer Settings > Personal Access Tokens > Tokens (classic)**.
2. Haz clic en **Generate new token (classic)**.
3. Asígnale un nombre (ej. `JuegosSinWifi Save`) y marca únicamente el permiso **`gist`**.
4. Copia el token generado (`ghp_...`).
5. En el juego, haz clic en el botón **Nube** o abre la ventana de sincronización, pega tu token y pulsa **Guardar Token**.
6. ¡Ahora puedes pulsar **Subir Partida a GitHub** o **Descargar de GitHub** cuando quieras!

---

## 📂 Estructura del Código

```text
JuegosSinWifi/
├── index.html                 # Portal principal Arcade
├── manifest.json              # Configuración PWA
├── sw.js                      # Service Worker para funcionamiento 100% Offline
├── icons/
│   └── icon.svg               # Icono vectorial oficial
├── css/
│   ├── style.css              # Tema ciberpunk neón, variables y componentes
│   ├── games.css              # Estilos específicos de cada juego
│   └── responsive.css         # Adaptabilidad móvil y táctil
├── js/
│   ├── audio.js               # Motor de audio sintetizado Web Audio API
│   ├── storage.js             # Gestor de LocalStorage y API de GitHub Gists
│   ├── achievements.js        # Sistema de logros globales y XP
│   ├── profile.js             # Perfil de jugador y avatares
│   ├── app.js                 # Enrutador, catálogo y control de modales
│   └── games/                 # Módulos de los 14 juegos
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
│       └── solitaire.js
└── README.md
```

---

## 📜 Licencia

Distribuido bajo la Licencia MIT. ¡Siéntete libre de modificarlo, mejorarlo y jugar cuanto quieras!
