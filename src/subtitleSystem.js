export class SubtitleSystem {
    constructor() {
        this.container = document.querySelector('.subtitle-stream');
        this.activeSubs = []; // { data, element }
        this.allSubData = [];
        this.highlightEnabled = true;
    }

    loadSubtitles(subtitles) {
        this.allSubData = subtitles;
        this.container.innerHTML = '';
        this.activeSubs = [];

        // Create DOM elements for ALL subtitles initially but hide them? 
        // Or create dynamically? Dynamic is better for "Stream".
        // But for "Game" where we might rewind, let's keep them all in DOM but hidden/faded?
        // Let's go with: Only show current +/- history. 
        // Actually, easiest is: Render ALL, but manage their visibility/highlight class.
        // If we want "scrolling", we just stick them in the div.

        // Let's Render ALL now to keep it simple and scrollable.
        subtitles.forEach((sub, index) => {
            const el = document.createElement('div');
            el.className = 'subtitle-line';
            el.textContent = sub.text;
            el.draggable = true;
            el.dataset.index = index;
            // Store data ref
            el.dataset.json = JSON.stringify(sub);

            // Rip Button (Visual only, logic in DragSystem/UI)
            const ripBtn = document.createElement('div');
            ripBtn.className = 'rip-btn';
            ripBtn.innerHTML = '✂'; // Scissors icon
            ripBtn.title = "Drag to Build Area";
            el.appendChild(ripBtn);

            this.container.appendChild(el);
            this.activeSubs.push({ data: sub, element: el });
        });
    }

    update(time) {
        // Manage synchrony (Highlighting)
        this.activeSubs.forEach(({ data, element }) => {
            // Check if this subtitle is "current"
            // We assume a subtitle lasts until the next one starts or +3 seconds
            // A better way: check if time >= t && time < next_t

            const idx = this.activeSubs.findIndex(s => s.data === data);
            const nextSub = this.activeSubs[idx + 1];
            const endTime = nextSub ? nextSub.data.t : (data.t + 3.0);

            const isActive = (time >= data.t && time < endTime);

            if (this.highlightEnabled) {
                if (isActive) element.classList.add('highlight');
                else element.classList.remove('highlight');
            } else {
                element.classList.remove('highlight');
            }
        });

        // Auto-scroll to active?
        if (this.highlightEnabled) {
            const active = this.container.querySelector('.highlight');
            if (active) {
                // simple smooth scroll
                // this.container.scrollTop = active.offsetTop - this.container.offsetTop - 50;
                // Disabled for now as it might interfere with dragging
            }
        }
    }
}
