export class DragSystem {
    constructor() {
        this.buildArea = document.getElementById('build-area');
        this.tooltip = document.getElementById('tooltip');
        this.pinyinEl = this.tooltip.querySelector('.tooltip-pinyin');
        this.meaningEl = this.tooltip.querySelector('.tooltip-meaning');

        this.setupGlobalListeners();
        this.setupDropZone();
    }

    setupGlobalListeners() {
        // We use delegation for dragstart because items are dynamic
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('subtitle-line')) {
                e.dataTransfer.setData('type', 'subtitle');
                e.dataTransfer.setData('json', e.target.dataset.json);
                e.target.classList.add('dragging');
            } else if (e.target.classList.contains('token')) {
                e.dataTransfer.setData('type', 'token');
                e.dataTransfer.setData('id', e.target.id);
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('subtitle-line') || e.target.classList.contains('token')) {
                e.target.classList.remove('dragging');
            }
        });

        // Tooltip Delegation
        document.addEventListener('mouseover', (e) => {
            const token = e.target.closest('.token');
            if (token) {
                this.showTooltip(token, e.pageX, e.pageY);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const token = e.target.closest('.token');
            if (token) {
                this.hideTooltip();
            }
        });

        document.addEventListener('mousemove', (e) => {
            // Keep tooltip following if needed, or static. Static above token is better.
            // But we used fixed position in CSS, so maybe just move it once.
        });

        // Click Listener for Rip Button
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.rip-btn');
            if (btn) {
                const line = btn.closest('.subtitle-line');
                if (line) {
                    const json = line.dataset.json;
                    if (json) {
                        this.ripSubtitle(JSON.parse(json));
                    }
                }
            }
        });
    }

    setupDropZone() {
        this.buildArea.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            this.buildArea.classList.add('drag-over');
        });

        this.buildArea.addEventListener('dragleave', (e) => {
            this.buildArea.classList.remove('drag-over');
        });

        this.buildArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.buildArea.classList.remove('drag-over');
            const type = e.dataTransfer.getData('type');

            if (type === 'subtitle') {
                const json = e.dataTransfer.getData('json');
                if (json) {
                    this.ripSubtitle(JSON.parse(json));
                    // Optional: Remove original? The requirements say "User can drag... into build area".
                    // Usually implies a copy or move. Let's effectively "copy" for the game flow, 
                    // or user might want to drag it again.
                }
            } else if (type === 'token') {
                const id = e.dataTransfer.getData('id');
                const el = document.getElementById(id);
                if (el) {
                    this.buildArea.appendChild(el); // Move to end of list
                }
            }
        });
    }

    ripSubtitle(data) {
        // Clear Empty Hint
        const hint = this.buildArea.querySelector('.empty-hint');
        if (hint) hint.style.display = 'none';

        // Play Sound (simulated)
        // const audio = new Audio('assets/rip.mp3'); audio.play().catch(e=>{});

        // Create Tokens
        if (data.tokens) {
            data.tokens.forEach((t, i) => {
                this.createToken(t);
            });
        } else {
            // Fallback split
            const chars = data.text.split('');
            chars.forEach(char => {
                this.createToken({ hanzi: char, pinyin: '', meaning: '' });
            });
        }
    }

    createToken(tokenData) {
        const el = document.createElement('div');
        el.className = 'token';
        el.textContent = tokenData.hanzi;
        el.draggable = true;
        el.id = 'tok-' + Date.now() + '-' + Math.random().toString(16).slice(2);

        // Store Meta
        el.dataset.pinyin = tokenData.pinyin;
        el.dataset.meaning = tokenData.meaning;

        this.buildArea.appendChild(el);
    }

    clearWorkspace() {
        this.buildArea.innerHTML = '<div class="empty-hint">Drag tokens here to build a phrase</div>';
    }

    showTooltip(el, x, y) {
        const pinyin = el.dataset.pinyin;
        const meaning = el.dataset.meaning;
        if (!pinyin && !meaning) return;

        this.pinyinEl.textContent = pinyin || '';
        this.meaningEl.textContent = meaning || '?';

        this.tooltip.classList.remove('hidden');

        // Position above the element
        const rect = el.getBoundingClientRect();
        this.tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        this.tooltip.style.top = rect.top + 'px'; // CSS handle translate -100%
    }

    hideTooltip() {
        this.tooltip.classList.add('hidden');
    }
}
