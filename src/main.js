import { ScenePlayer } from './scenePlayer.js';
import { SubtitleSystem } from './subtitleSystem.js';
import { DragSystem } from './tokenDragDrop.js';
import { UIManager } from './ui.js';

class GameApp {
    constructor() {
        this.scenes = [];
        this.currentScene = null;
        
        // Systems
        this.player = new ScenePlayer();
        this.subtitles = new SubtitleSystem();
        this.dragger = new DragSystem();
        this.ui = new UIManager(this);

        this.init();
    }

    async init() {
        try {
            const response = await fetch('data/scenes.json');
            this.scenes = await response.json();
            
            this.ui.populateSceneSelect(this.scenes);
            
            // Load first scene
            if (this.scenes.length > 0) {
                this.loadScene(this.scenes[0].id);
            }

            this.loop();
        } catch (e) {
            console.error("Failed to load scenes:", e);
        }
    }

    loadScene(sceneId) {
        const sceneData = this.scenes.find(s => s.id === sceneId);
        if (!sceneData) return;

        this.currentScene = sceneData;
        
        // Reset Systems
        this.player.loadScene(sceneData);
        this.subtitles.loadSubtitles(sceneData.subtitles);
        this.dragger.clearWorkspace();
        
        // Update UI info
        this.ui.updateSceneInfo(sceneData);
    }

    // Main Game Loop
    loop() {
        requestAnimationFrame(() => this.loop());

        // 1. Update Player (Time & Animation)
        this.player.update();

        // 2. Sync Subtitles with Player Time
        this.subtitles.update(this.player.currentTime);

        // 3. Update UI (Scrubber, Time Display)
        this.ui.updateTimeDisplay(this.player.currentTime, this.player.duration);
    }
}

// Start Game
window.game = new GameApp();
