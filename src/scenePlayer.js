export class ScenePlayer {
    constructor() {
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.loopStart = 0;
        this.loopEnd = 0;
        this.loopEnabled = false;
        this.lastFrameTime = 0;

        this.stage = document.getElementById('actors-layer');
        this.activeScene = null;
        this.actorsMap = new Map(); // id -> DOM Element
    }

    loadScene(sceneData) {
        this.activeScene = sceneData;
        this.duration = sceneData.duration;
        this.currentTime = 0;
        this.isPlaying = false;
        this.loopEnd = this.duration; // Default full loop

        this.renderActors();
        this.updateActors(0);
    }

    renderActors() {
        this.stage.innerHTML = '';
        this.actorsMap.clear();

        this.activeScene.actors.forEach(actor => {
            const el = document.createElement('div');
            el.className = 'actor';
            el.style.backgroundColor = actor.color;
            el.textContent = actor.name[0]; // First letter as avatar

            const label = document.createElement('div');
            label.className = 'actor-label';
            label.textContent = actor.name;
            el.appendChild(label);

            this.stage.appendChild(el);
            this.actorsMap.set(actor.id, el);
        });
    }

    play() {
        this.isPlaying = true;
        this.lastFrameTime = performance.now();
    }

    pause() {
        this.isPlaying = false;
    }

    togglePlay() {
        if (this.isPlaying) this.pause();
        else this.play();
    }

    seek(time) {
        this.currentTime = Math.max(0, Math.min(time, this.duration));
        this.updateActors(this.currentTime);
    }

    update() {
        if (!this.isPlaying) return;

        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        this.currentTime += dt;

        // Loop Logic
        if (this.loopEnabled) {
            if (this.currentTime >= this.loopEnd) {
                this.currentTime = this.loopStart;
            }
        } else {
            if (this.currentTime >= this.duration) {
                this.currentTime = this.duration;
                this.pause();
            }
        }

        this.updateActors(this.currentTime);
    }

    updateActors(time) {
        if (!this.activeScene) return;

        this.activeScene.actors.forEach(actorData => {
            const domEl = this.actorsMap.get(actorData.id);
            if (!domEl) return;

            // Calculate Position
            const pos = this.calculateActorState(actorData, time);
            domEl.style.left = pos.x + '%';
            domEl.style.top = pos.y + '%';

            // Simple bounce effect for "jump"
            if (pos.jumpOffset) {
                domEl.style.transform = `translate(-50%, calc(-50% - ${pos.jumpOffset}px))`;
            } else {
                domEl.style.transform = `translate(-50%, -50%)`;
            }
        });
    }

    calculateActorState(actorDef, time) {
        // Default start pos
        let currentX = actorDef.x;
        let currentY = actorDef.y;
        let jumpOffset = 0;

        // Find relevant animations
        const anims = this.activeScene.animations.filter(a => a.actorId === actorDef.id);

        // Sort by time
        anims.sort((a, b) => a.time - b.time);

        for (const anim of anims) {
            // If animation hasn't started yet, stop checking (future animations don't affect current pos yet)
            // UNLESS we are processing cumulative moves. 
            // For simplicity: We will process ALL animations up to current time to accumulate "moves".

            const animEnd = anim.time + anim.duration;

            if (time < anim.time) continue; // Future

            // Progress (0 to 1)
            let progress = (time - anim.time) / anim.duration;
            if (progress > 1) progress = 1;

            if (anim.type === 'move') {
                // If this is a move, we interpolate.
                // NOTE: This assumes sequential moves for simplicity. 
                // A better system would calculate exact start/end segments.
                // WE WILL SIMPLIFY: The "toX" in our JSON is absolute target. 
                // We assume linear interpolation from 'currentX' (which is the result of previous moves).
                // Issue: If we just loop, 'currentX' is mutated.
                // Fix: 'currentX' tracks the state *before* this animation starts.

                // Oops, to do this stateless-ly (for rewind), we need to know the 'startX' for this specific animation.
                // Let's assume the actor stays at initial X until an animation moves them.
                // If there are multiple moves, we'd need to chain them.
                // For this MVP: we will assume only 1 active move per actor or non-overlapping moves.

                // Let's just interpolate from actorDef.x to anim.toX for the FIRST move found.
                // This is a "simple" game constraint.

                const startX = actorDef.x;
                const endX = anim.toX;
                currentX = startX + (endX - startX) * progress;
            }

            if (anim.type === 'jump') {
                // Parabolic jump logic: 4 * h * p * (1-p)
                // Only active during the animation window
                if (time < animEnd) {
                    jumpOffset = 50 * (4 * progress * (1 - progress)); // 50px high jump
                }
            }
        }

        return { x: currentX, y: currentY, jumpOffset };
    }
}
