export class UIManager {
    constructor(game) {
        this.game = game;

        // Elements
        this.btnPlayPause = document.getElementById('btn-play-pause');
        this.iconPlay = document.getElementById('icon-play');
        this.iconPause = document.getElementById('icon-pause');
        this.btnRewind = document.getElementById('btn-rewind');
        this.scrubber = document.getElementById('timeline-scrubber');
        this.timeCurrent = document.getElementById('time-current');
        this.timeTotal = document.getElementById('time-total');
        this.sceneSelect = document.getElementById('scene-select');

        // Settings elements
        this.toggleHighlight = document.getElementById('toggle-highlight');
        this.loopStart = document.getElementById('loop-start');
        this.loopEnd = document.getElementById('loop-end');
        this.btnSetLoop = document.getElementById('btn-set-loop');
        this.btnClearLoop = document.getElementById('btn-clear-loop');
        this.btnClearBuild = document.getElementById('btn-clear-build');

        this.bindEvents();
    }

    bindEvents() {
        // Playback
        this.btnPlayPause.addEventListener('click', () => {
            if (this.game.player.isPlaying) {
                this.game.player.pause();
                this.setPlayState(false);
            } else {
                this.game.player.play();
                this.setPlayState(true);
            }
        });

        this.btnRewind.addEventListener('click', () => {
            const newTime = this.game.player.currentTime - 5;
            this.game.player.seek(newTime);
        });

        // Scrubber
        this.scrubber.addEventListener('input', (e) => {
            const time = parseFloat(e.target.value);
            this.game.player.seek(time);
            this.updateTimeDisplay(time, this.game.player.duration);
        });

        this.scrubber.addEventListener('mousedown', () => {
            this.wasPlaying = this.game.player.isPlaying;
            this.game.player.pause();
        });

        this.scrubber.addEventListener('mouseup', () => {
            if (this.wasPlaying) this.game.player.play();
        });

        // Scene Select
        this.sceneSelect.addEventListener('change', (e) => {
            this.game.loadScene(e.target.value);
        });

        // Settings
        this.toggleHighlight.addEventListener('change', (e) => {
            this.game.subtitles.highlightEnabled = e.target.checked;
        });

        this.btnSetLoop.addEventListener('click', () => {
            const start = parseFloat(this.loopStart.value);
            const end = parseFloat(this.loopEnd.value);

            if (!isNaN(start) && !isNaN(end) && start < end) {
                this.game.player.loopEnabled = true;
                this.game.player.loopStart = start;
                this.game.player.loopEnd = end;
                // Visual feedback could be added here
            }
        });

        this.btnClearLoop.addEventListener('click', () => {
            this.game.player.loopEnabled = false;
            // Restore full duration loop (implied loop at end of scene if we want, or stop).
            // Main player logic stops at duration if loop not enabled.
        });

        this.btnClearBuild.addEventListener('click', () => {
            this.game.dragger.clearWorkspace();
        });
    }

    populateSceneSelect(scenes) {
        this.sceneSelect.innerHTML = '';
        scenes.forEach(scene => {
            const opt = document.createElement('option');
            opt.value = scene.id;
            opt.textContent = scene.title;
            this.sceneSelect.appendChild(opt);
        });
    }

    updateSceneInfo(scene) {
        this.scrubber.max = scene.duration;
        this.timeTotal.textContent = this.formatTime(scene.duration);
        this.loopEnd.value = scene.duration; // Default loop end

        // Reset state
        this.setPlayState(false);
        this.updateTimeDisplay(0, scene.duration);
    }

    updateTimeDisplay(current, total) {
        // Only update input if not user dragging? 
        // Actually standard is to update it unless user is holding usage.
        // But for simplicity we update it.
        // To prevent fighting the user, we could check activeElement, 
        // but 'input' event handles the "user drag" seeking.
        const isActive = document.activeElement === this.scrubber;
        if (!isActive) {
            this.scrubber.value = current;
        }

        this.timeCurrent.textContent = this.formatTime(current);
    }

    setPlayState(isPlaying) {
        if (isPlaying) {
            this.iconPlay.classList.add('hidden');
            this.iconPause.classList.remove('hidden');
        } else {
            this.iconPlay.classList.remove('hidden');
            this.iconPause.classList.add('hidden');
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}
