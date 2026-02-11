// --- GAME LOOP ---

// PRESETS moved to js/data.js

window.Game = {
    timerInterval: null,

    start() {
        // Validation
        const activePlayers = State.players.filter(p => p.active);
        if (activePlayers.length < 3) return alert("Mínimo 3 actores necesarios.");

        let impostorCount = State.config.chaosMode
            ? Math.floor(Math.random() * activePlayers.length)
            : parseInt(State.config.impostorCount);

        if (impostorCount >= activePlayers.length) impostorCount = activePlayers.length - 1;

        // Select Word & Hint
        let selected;
        const cat = document.getElementById('category-select').value;

        if (cat.startsWith('custom:')) {
            // LOAD SAVED SCRIPT
            const id = cat.split(':')[1];
            const script = State.customScripts.find(s => s.id === id);
            if (script && script.words.length > 0) {
                const randIndex = Math.floor(Math.random() * script.words.length);
                selected = script.words[randIndex];
                // Support legacy custom scripts (single hint string) or new ones
            } else {
                return alert("El guion seleccionado no tiene palabras.");
            }

        } else if (window.DATA[cat]) {
            const list = window.DATA[cat];
            const item = list[Math.floor(Math.random() * list.length)];

            // Handle multiple hints: Pick one randomly
            let finalHint = item.hints;
            if (Array.isArray(item.hints)) {
                finalHint = item.hints[Math.floor(Math.random() * item.hints.length)];
            }

            selected = { word: item.word, hint: finalHint };
        } else {
            // Random or Fallback
            const keys = Object.keys(window.DATA);
            const randomCat = keys[Math.floor(Math.random() * keys.length)];
            const list = window.DATA[randomCat];
            const item = list[Math.floor(Math.random() * list.length)];

            let finalHint = item.hints;
            if (Array.isArray(item.hints)) {
                finalHint = item.hints[Math.floor(Math.random() * item.hints.length)];
            }

            selected = { word: item.word, hint: finalHint };
        }

        if (!selected) return alert("Error seleccionando guion.");

        // Assign Roles
        const shuffled = [...activePlayers].sort(() => Math.random() - 0.5);
        const impostors = shuffled.slice(0, impostorCount).map(p => p.id);

        // Timer Setting
        const timerEnabled = document.getElementById('timer-toggle').checked;
        const timerMins = parseFloat(document.getElementById('timer-duration').value);

        // Set Session
        State.session = {
            active: true,
            secretWord: selected.word,
            hint: selected.hint,
            impostors: impostors,
            activePlayers: activePlayers.map(p => p.id),
            currentRevealIndex: 0,
            starterId: activePlayers[Math.floor(Math.random() * activePlayers.length)].id,
            timerId: null,
            timerEnabled: timerEnabled,
            timerDuration: timerMins * 60
        };

        Router.go('reveal');
        Game.renderReveal();
    },

    renderReveal() {
        const idx = State.session.currentRevealIndex;
        const total = State.session.activePlayers.length;
        const player = State.players.find(p => p.id === State.session.activePlayers[idx]);

        UI.renderRevealStep(player, idx, total);
    },

    showRole() {
        // Called when card flips
        const s = State.session;
        const currentPId = s.activePlayers[s.currentRevealIndex];
        const isImp = s.impostors.includes(currentPId);
        UI.setRoleContent(isImp, s.secretWord, s.hint);
    },

    revealNext() {
        State.session.currentRevealIndex++;
        if (State.session.currentRevealIndex >= State.session.activePlayers.length) {
            Game.startDebate();
        } else {
            Game.renderReveal();
        }
    },

    confirmSeen() {
        // This is called when NEXT button is clicked
        const card = document.getElementById('card-inner');
        // Flip back first? Or just move on?
        // UX: Flip back, then next.
        card.classList.remove('rotate-y-180');
        const btn = document.getElementById('btn-next-turn');
        if (btn) btn.classList.add('opacity-50', 'pointer-events-none');

        setTimeout(() => {
            Game.revealNext();
        }, 500);
    },

    startDebate() {
        Router.go('game');
        const starter = State.players.find(p => p.id === State.session.starterId);
        const duration = State.session.timerDuration || 180; // Fallback 3 min

        UI.renderDebate(starter, duration); // Initial Render

        if (State.session.timerEnabled) {
            let timeLeft = duration;
            Game.timerInterval = setInterval(() => {
                timeLeft--;
                UI.updateTimer(timeLeft, duration);
                if (timeLeft <= 0) Game.resolve();
            }, 1000);
        } else {
            UI.updateTimer(Infinity, duration); // Handle Infinity in UI
        }
    },

    resolve() {
        if (Game.timerInterval) clearInterval(Game.timerInterval);
        Router.go('results');
        const activePs = State.session.activePlayers;
        const players = State.players.filter(p => activePs.includes(p.id));

        UI.renderResults(State.session.secretWord, players, State.session.impostors, State.session.hint);
        State.session.active = false;
    }
};
