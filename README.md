<div align="center">

# 🕹️ JuegosSinWifi

### Tu pequeña arcade, incluso cuando no tienes Internet.

Una colección de **14 juegos en HTML, CSS y JavaScript**, con guardado local, controles táctiles y soporte PWA para jugar desde el navegador.

[**▶ Jugar ahora**](https://ericsnet.github.io/JuegosSinWifi/) · [Ver el código](https://github.com/ericsnet/JuegosSinWifi) · [Informar de un problema](https://github.com/ericsnet/JuegosSinWifi/issues)

![GitHub last commit](https://img.shields.io/github/last-commit/ericsnet/JuegosSinWifi?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/ericsnet/JuegosSinWifi?style=flat-square)
![License](https://img.shields.io/badge/licencia-MIT-2ea44f?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-compatible-5a4fcf?style=flat-square)

</div>

---

## 🎮 Juegos incluidos

| Juego | ¿De qué va? |
|---|---|
| 🐍 **Cyber Snake Neon** | Serpiente arcade con poderes y aceleración. |
| 🧱 **TetroBlocks Neon** | Bloques, rotaciones SRS, retención de piezas y combos. |
| 🚀 **Space Defender** | Combate espacial con oleadas, jefes y mejoras. |
| 🐦 **Flappy Cyber** | Vuelo y esquiva de obstáculos. |
| 🔢 **2048 Fusion** | Combina números, deshaz movimientos y supera récords. |
| 💣 **Buscaminas Deluxe** | Tres dificultades, banderas y primer clic seguro. |
| 🧠 **Memory Matrix** | Encuentra parejas con distintos temas y tableros. |
| 🔢 **Sudoku Master** | Cuatro dificultades, notas y pistas. |
| 🔴 **Conecta 4 Neón** | Juega contra la IA o contra otra persona en el mismo dispositivo. |
| 🔤 **El Ahorcado Pro** | Palabras en español organizadas por categorías. |
| 🏓 **Cyber Pong** | Pong con efecto y modos para uno o dos jugadores. |
| 🦖 **Neon Dino Runner** | Carrera infinita con saltos, agachadas y ciclo día/noche. |
| ⌨️ **Speed Typer** | Practica mecanografía y reflejos. |
| 🃏 **Solitario Klondike** | Modos de robar una o tres cartas, deshacer y autocompletar. |

## ✨ Características

- **🌐 Online y offline:** juega desde el navegador; el Service Worker permite almacenar recursos para usarlos sin conexión después de la carga inicial.
- **📱 Adaptado a móviles:** controles táctiles y de teclado.
- **📲 Instalable:** compatible con el enfoque de aplicación web progresiva (PWA).
- **💾 Guardado local:** conserva el perfil, las estadísticas, los récords y los logros en el dispositivo.
- **☁️ Sincronización opcional con GitHub Gists:** permite transferir el progreso entre dispositivos.
- **📦 Copias de seguridad:** exporta e importa partidas mediante archivos JSON.
- **🔊 Audio generado en el navegador:** efectos y música sintetizados con Web Audio API, sin descargar archivos de audio.
- **🏆 Progresión:** experiencia, niveles y logros.

## 🚀 Cómo jugar

### Opción 1: abrir la página

Entra en **[ericsnet.github.io/JuegosSinWifi](https://ericsnet.github.io/JuegosSinWifi/)**. Para jugar sin conexión, abre la página primero con Internet y deja que se descarguen y almacenen los recursos necesarios.

### Opción 2: ejecutar una copia local

Clona el repositorio:

```bash
git clone https://github.com/ericsnet/JuegosSinWifi.git
cd JuegosSinWifi
```

Inicia un servidor local con una de estas opciones:

```bash
# Python 3
python3 -m http.server 8080
```

O, si tienes Node.js instalado:

```bash
npx serve -l 8080 -s .
```

Después abre [http://localhost:8080](http://localhost:8080).

> **Nota:** abrir `index.html` directamente puede permitir jugar, pero los Service Workers y algunas funciones PWA requieren un origen HTTP/HTTPS.

## ☁️ Guardado en la nube con GitHub

La sincronización con Gists es opcional. Si prefieres no conectar GitHub, puedes seguir usando el guardado local y las copias JSON.

1. En GitHub, crea un **Personal Access Token (classic)** desde *Settings → Developer settings → Personal access tokens → Tokens (classic)*.
2. Concede únicamente el permiso **`gist`**.
3. Introduce el token en la sección de sincronización de JuegosSinWifi.
4. Usa las opciones para subir o descargar la partida.

**Seguridad:** el token se guarda en el almacenamiento local del navegador. Usa esta función solo en dispositivos de confianza, no compartas el token y revócalo desde GitHub si crees que se ha expuesto. No concedas permisos adicionales a `gist`.

## 🧰 Tecnologías

- HTML5, CSS3 y JavaScript.
- Canvas y DOM para la interfaz y los juegos.
- Web Audio API para sonido generado en tiempo real.
- LocalStorage para datos locales.
- GitHub Gists API para la sincronización opcional.
- Service Worker y Web App Manifest para las funciones PWA.

No se necesita un proceso de compilación para ejecutar el proyecto.

## 📁 Estructura del proyecto

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
│       └── solitaire.js
└── README.md
```

## 🤝 Contribuir

¿Has encontrado un error o tienes una idea para mejorar el proyecto?

1. Abre un [issue](https://github.com/ericsnet/JuegosSinWifi/issues) describiendo el problema o la propuesta.
2. Si quieres aportar código, crea un fork y prepara una pull request con los cambios.

Procura comprobar tanto el juego afectado como el funcionamiento en móvil y sin conexión.

## 📄 Licencia

Este proyecto se distribuye bajo la **licencia MIT**. Consulta el archivo [LICENSE](https://github.com/ericsnet/JuegosSinWifi/blob/main/LICENSE) para ver sus términos.

---

<div align="center">

**[▶ Jugar a JuegosSinWifi](https://ericsnet.github.io/JuegosSinWifi/)**

Hecho para jugar, también cuando no hay Wi-Fi.

</div>
