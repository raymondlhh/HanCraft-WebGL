# HanCraft WebGL (Mock)

A browser-based game for learning Chinese through interactive animated scenes and subtitle building.

## Features
- **Interactive Scenes**: Watch animated conversations.
- **Subtitle System**: Drag subtitles to "rip" them into learning tokens.
- **Phrase Building**: Reconstruct sentencese with drag-and-drop.
- **Tailored Learning**: Loop sections, toggle pinyin/meaning tooltips (hover), and highlighted playback.

## How to Run
Because this project uses ES Modules (`import/export`) and `fetch` to load JSON data, you must run it on a local web server. It will not work if you just double-click `index.html`.

### Option 1: Using Node.js (Recommended)
1. Open a terminal in this folder.
2. Run:
   ```bash
   npx http-server
   ```
3. Open the URL shown (usually `http://127.0.0.1:8080`).

### Option 2: Using Python
1. Open a terminal in this folder.
2. Run:
   ```bash
   python -m http.server
   ```
3. Open `http://localhost:8000`.

## Project Structure
- `index.html`: Entry point.
- `styles.css`: All styling (Dark Theme).
- `src/`: JavaScript source code (Modular).
- `data/scenes.json`: Scene data definitions.
