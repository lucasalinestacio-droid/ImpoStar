// --- UI CONTROLLER ---
// Manages DOM updates, Views, and Animations


// Helper to switch sections
window.Router = {
    views: ['home', 'group', 'stats', 'script', 'setup', 'reveal', 'game', 'results', 'help'],

    go(viewId) {
        this.views.forEach(id => {
            const el = document.getElementById(`view-${id}`);
            if (!el) return;

            if (id === viewId) {
                el.classList.remove('hidden-view');
                // Trigger entry animation
                el.classList.remove('animate-fade-in-up');
                void el.offsetWidth; // reflow
                el.classList.add('animate-fade-in-up');
            } else {
                el.classList.add('hidden-view');
            }
        });
        window.scrollTo(0, 0);
    }
};

window.UI = {
    // --- HOME ---
    renderHome() {
        // No dynamic rendering needed for home - it's just navigation buttons
    },

    // --- GROUP (Roster Management) ---
    renderGroup() {
        const list = document.getElementById('group-list');
        const count = document.getElementById('group-count');

        if (count) count.innerText = State.players.length;

        if (!list) return;

        if (State.players.length === 0) {
            list.innerHTML = `<div class="text-center text-stone-500 py-8 italic text-sm">Sin actores registrados.<br>¡Recluta tu elenco!</div>`;
            return;
        }

        list.innerHTML = State.players.map(p => `
            <div class="flex items-center justify-between p-4 rounded-2xl bg-stone-800/50 border border-stone-700/30 hover:bg-stone-800 transition-all animate-fade-in-up group">
                <div class="flex items-center gap-3" style="overflow: visible;">
                    <img src="${p.avatar}" class="w-12 h-12 rounded-full bg-stone-700 select-none flex-shrink-0">
                    <div class="flex-1">
                        <p class="font-bold text-stone-200">${p.name}</p>
                    </div>
                </div>
                <button onclick="window.App.deletePlayer(${p.id}, event)" 
                    class="text-stone-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 flex-shrink-0">
                    ✕
                </button>
            </div>
        `).join('');
    },

    // --- STATS (Hall of Fame) ---
    renderStats() {
        // Render all three leaderboards
        this.renderLeaderboard('total', 'wins');
        this.renderLeaderboard('daily', 'dailyWins');
        this.renderLeaderboard('monthly', 'monthlyWins');
    },

    renderLeaderboard(type, winsProp) {
        const list = document.getElementById(`stats-${type}`);
        if (!list) return;

        // Sort players by wins (highest first)
        const sorted = [...State.players].sort((a, b) => (b[winsProp] || 0) - (a[winsProp] || 0));

        if (sorted.length === 0) {
            list.innerHTML = `<div class="text-center text-stone-500 py-8 italic text-sm">Sin jugadores registrados.</div>`;
            return;
        }

        list.innerHTML = sorted.map((p, index) => {
            const wins = p[winsProp] || 0;

            let medal = '';
            let borderClass = 'border-stone-700/30';
            if (index === 0) { medal = '🥇'; borderClass = 'border-amber-500/50'; }
            else if (index === 1) { medal = '🥈'; borderClass = 'border-stone-400/50'; }
            else if (index === 2) { medal = '🥉'; borderClass = 'border-amber-700/50'; }

            return `
                <div class="flex items-center justify-between p-4 rounded-xl bg-stone-800/30 border ${borderClass} hover:bg-stone-800/50 transition-all">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl w-8 text-center">${medal || `#${index + 1}`}</span>
                        <img src="${p.avatar}" class="w-10 h-10 rounded-full bg-stone-700 select-none flex-shrink-0">
                        <span class="font-bold text-stone-200">${p.name}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-orange-400 font-black text-lg">${wins}</span>
                        <span class="text-xs text-stone-500">🏆</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    // --- SCRIPTS ---
    renderScripts() {
        const list = document.getElementById('script-list');
        if (!list) return;

        if (State.customScripts.length === 0) {
            list.innerHTML = `<div class="text-center text-stone-500 py-8 italic text-sm">No hay guiones personalizados.<br>¡Crea uno!</div>`;
            return;
        }

        list.innerHTML = State.customScripts.map(script => `
            <div class="flex items-center justify-between p-4 rounded-2xl bg-stone-800/50 border border-stone-700/30 hover:bg-stone-800 transition-all group">
                <div class="flex-1">
                    <p class="font-bold text-stone-200">${script.name}</p>
                    <p class="text-xs text-stone-500 mt-1">${script.words.length} palabras</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.App.editScript('${script.id}')" 
                        class="text-stone-600 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all p-2 flex-shrink-0" title="Editar">
                        ✎
                    </button>
                    <button onclick="window.App.deleteScript('${script.id}')" 
                        class="text-stone-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-2 flex-shrink-0" title="Borrar">
                        ✕
                    </button>
                </div>
            </div>
        `).join('');
    },

    // --- SETUP (Game Configuration) ---
    renderSetup() {
        const list = document.getElementById('setup-player-list');
        const count = document.getElementById('setup-count');
        const select = document.getElementById('category-select');

        // Populate Custom Scripts in Dropdown
        if (select) {
            // Remove old custom options
            Array.from(select.options).forEach(opt => {
                if (opt.value.startsWith('custom:')) opt.remove();
            });

            // Add current scripts
            State.customScripts.forEach(script => {
                const opt = document.createElement('option');
                opt.value = `custom:${script.id}`;
                opt.innerText = `✍ ${script.name}`;
                select.appendChild(opt);
            });
        }

        const activePlayers = State.players.filter(p => p.active);

        if (count) count.innerText = activePlayers.length;

        if (!list) return;

        if (State.players.length === 0) {
            list.innerHTML = `<div class="text-center text-stone-500 py-4 italic text-sm">No hay jugadores. Ve a Elenco para añadir actores.</div>`;
            return;
        }

        // Show ALL players, but style them differently based on active status
        list.innerHTML = State.players.map(p => {
            if (p.active) {
                // Active player - green checkmark
                return `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-stone-800/30 border border-stone-700/20 hover:bg-stone-800/50 transition-all">
                        <div class="flex items-center gap-3 flex-1 overflow-hidden">
                            <img src="${p.avatar}" class="w-8 h-8 rounded-full bg-stone-700 select-none flex-shrink-0">
                            <input type="text" value="${p.name}" 
                                class="bg-transparent border-b border-transparent hover:border-stone-600 focus:border-orange-500 text-stone-200 font-bold outline-none transition-all px-2 py-1 rounded w-full min-w-0"
                                onchange="window.App.updatePlayerName(${p.id}, this.value)">
                        </div>
                        <button onclick="window.App.togglePlayer(${p.id})" 
                            class="text-emerald-500 hover:text-stone-400 transition-colors p-1 flex-shrink-0 text-sm"
                            title="Quitar del elenco">
                            ✓
                        </button>
                    </div>
                `;
            } else {
                // Inactive player - grayed out with add button
                return `
                    <div class="flex items-center justify-between p-3 rounded-xl bg-stone-900/30 border border-stone-800/30 hover:bg-stone-800/40 transition-all opacity-50 hover:opacity-75">
                        <div class="flex items-center gap-3 flex-1 overflow-hidden">
                            <img src="${p.avatar}" class="w-8 h-8 rounded-full bg-stone-800 select-none flex-shrink-0 grayscale">
                            <span class="text-stone-500 font-bold truncate">${p.name}</span>
                        </div>
                        <button onclick="window.App.togglePlayer(${p.id})" 
                            class="text-stone-600 hover:text-emerald-500 transition-colors p-1 flex-shrink-0 text-sm"
                            title="Añadir al elenco">
                            +
                        </button>
                    </div>
                `;
            }
        }).join('');

        // Update impostor display
        this.updateImpostorDisplay(State.config.impostorCount, State.config.chaosMode);

        // Update category select
        const categorySelect = document.getElementById('category-select');
        if (categorySelect) {
            categorySelect.value = State.config.category;
        }

        // Update timer
        const timerToggle = document.getElementById('timer-toggle');
        if (timerToggle) {
            timerToggle.checked = State.config.timerEnabled !== false;
        }

        const timerDuration = document.getElementById('timer-duration');
        if (timerDuration) {
            const mins = (State.config.timerDuration || 180) / 60;
            timerDuration.value = mins;
            document.getElementById('timer-display-val').innerText = `${mins} min`;
        }

        const revealPartners = document.getElementById('reveal-partners-toggle');
        if (revealPartners) {
            revealPartners.checked = State.config.revealPartners !== false;
        }

        const showHints = document.getElementById('show-hints-toggle');
        if (showHints) {
            showHints.checked = State.config.showHints !== false;
        }
    },

    updateImpostorDisplay(count, chaos) {
        const display = document.getElementById('impostor-count-display');
        if (display) {
            if (chaos) {
                display.innerText = '?';
                display.classList.add('text-purple-400');
                display.classList.remove('text-rose-500');
            } else {
                display.innerText = count;
                display.classList.remove('text-purple-400');
                display.classList.add('text-rose-500');
            }
        }
    },


    toggleCustomCategory(show) {
        // Deprecated
    },

    // --- REVEAL RENDER ---
    // Single card flip animation logic
    // --- REVEAL RENDER ---
    // --- REVEAL RENDER ---
    // Single card flip animation logic
    renderRevealStep(player, index, total) {
        const container = document.getElementById('reveal-card-container');
        // Reset state
        container.innerHTML = `
            <div class="flex flex-col items-center w-full max-w-sm mx-auto">
                <div id="card-inner" class="relative w-full h-[400px] transition-all duration-700 preserve-3d mb-8 cursor-pointer" onclick="window.App.flipCard()">
                    <!-- FRONT (Pass Phone) -->
                    <div class="absolute inset-0 backface-hidden bg-stone-800/80 backdrop-blur-xl border border-stone-700 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl">
                        <div class="text-stone-500 text-xs font-bold tracking-[0.2em] uppercase mb-8">Agente ${index + 1} / ${total}</div>
                        <div class="relative mb-6">
                            <div class="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse-slow"></div>
                            <img src="${player.avatar}" class="w-32 h-32 rounded-full border-4 border-stone-700 relative z-10 bg-stone-800">
                        </div>
                        <h2 class="text-3xl font-black text-stone-100 mb-2">${player.name}</h2>
                        <p class="text-orange-400 font-medium animate-bounce mt-4">Toca para revelar</p>
                    </div>

                    <!-- BACK (Secret) -->
                    <div id="card-back" class="absolute inset-0 backface-hidden rotate-y-180 bg-stone-900 border border-stone-800 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl overflow-hidden">
                        <div id="role-top-bar" class="absolute top-0 w-full h-2 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500"></div>
                        <p class="text-stone-500 text-xs font-bold tracking-[0.2em] uppercase mb-4">CONFIDENCIAL</p>
                        
                        <div id="role-content" class="text-center w-full flex-1 flex flex-col items-center justify-center">
                            <!-- Injected Content -->
                        </div>
                    </div>
                </div>

                <!-- EXTERNAL BUTTON (Initially Hidden/Disabled?) -->
                <!-- We want it visible only after flip? Or always visible but active after flip? -->
                <!-- User said: "pon el boton una vez se haya visto la palabra" -->
                <!-- So we can hide it initially and show it in flipCard logic, OR just keep it here and let user click it whenever. -->
                <!-- But logical flow: 1. Tap Card -> Flip. 2. Read. 3. Click Button -> Next. -->
                <button id="btn-next-turn" onclick="window.Game.confirmSeen()" class="w-full bg-stone-800 hover:bg-stone-700 text-white font-bold py-4 rounded-xl border border-stone-700 transition-all flex items-center justify-center gap-2 opacity-50 pointer-events-none">
                    <span>Entendido / Siguiente</span>
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
            </div>
        `;
    },

    setRoleContent(isImpostor, word, hint, currentPId) {
        const container = document.getElementById('role-content');
        const topBar = document.getElementById('role-top-bar');
        const cardBack = document.getElementById('card-back');

        if (!container || !topBar || !cardBack) return; // Safety check

        if (isImpostor) {
            // Logic to find partners
            let partnerInfo = '';
            if (State.config.revealPartners !== false) {
                const partners = State.session.impostors.filter(id => id !== currentPId);
                if (partners.length > 0) {
                    const names = partners.map(id => {
                        const p = State.players.find(px => px.id === id);
                        return p ? p.name : 'Desconocido';
                    }).join(', ');
                    partnerInfo = `
                        <div class="mt-4 pt-4 border-t border-rose-500/20 w-full">
                            <p class="text-rose-300 text-[9px] uppercase font-bold mb-1">Compañeros</p>
                            <p class="text-rose-100 text-xs font-bold">${names}</p>
                        </div>
                    `;
                } else {
                    partnerInfo = `
                        <div class="mt-4 pt-4 border-t border-rose-500/20 w-full">
                            <p class="text-rose-300 text-[9px] uppercase font-bold mb-1">Estado</p>
                            <p class="text-rose-100 text-xs font-bold italic">Estas solo aqui</p>
                        </div>
                    `;
                }
            }

            let hintSection = '';
            if (State.config.showHints !== false) {
                hintSection = `
                    <div class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 w-full max-w-[200px]">
                        <p class="text-rose-300 text-[10px] uppercase font-bold mb-1">Tu pista falsa</p>
                        <p class="text-rose-100 text-lg font-bold leading-tight">"${hint}"</p>
                        ${partnerInfo}
                    </div>
                `;
            } else {
                // Hints disabled - show explicit message
                hintSection = `
                    <div class="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 w-full max-w-[200px]">
                        <p class="text-rose-300 text-[10px] uppercase font-bold mb-1">Sistema</p>
                        <p class="text-rose-100 text-xs font-bold leading-tight">Lo siento pero no hay pistas</p>
                        ${partnerInfo}
                    </div>
                `;
            }

            container.innerHTML = `
                <div class="mb-4 relative">
                    <div class="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse"></div>
                    <span class="text-6xl relative z-10">🤫</span>
                </div>
                <h1 class="text-4xl font-black text-white mb-1 tracking-tighter">IMPOSTOR</h1>
                <p class="text-rose-400 text-xs font-bold uppercase tracking-widest mb-6">Engaña a todos</p>
                
                ${hintSection}
            `;
            // Styles
            topBar.className = "absolute top-0 w-full h-2 bg-gradient-to-r from-rose-600 to-orange-600";
            cardBack.classList.add('border-rose-500/30');
        } else {
            container.innerHTML = `
                <div class="mb-6">
                    <span class="text-5xl">🕵️</span>
                </div>
                <p class="text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">La clave es</p>
                <h1 class="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-stone-400 mb-6 break-words leading-tight px-2">
                    ${word}
                </h1>
                <div class="bg-stone-800/50 rounded-lg px-4 py-2 border border-stone-700/50">
                    <p class="text-stone-500 text-[10px]">Memoriza y actúa</p>
                </div>
            `;
            topBar.className = "absolute top-0 w-full h-2 bg-stone-600";
            cardBack.classList.remove('border-rose-500/30');
            cardBack.classList.add('border-stone-700');
        }
    },

    // --- GAME RENDER ---
    renderDebate(starter, duration) {
        document.getElementById('speaker-name').innerText = starter.name;
        document.getElementById('speaker-avatar').src = starter.avatar;

        const prog = document.getElementById('timer-progress-bar');
        const disp = document.getElementById('timer-display');
        const inf = document.getElementById('timer-infinity-msg');

        if (State.session.timerEnabled) {
            prog.classList.remove('hidden');
            disp.classList.remove('hidden');
            inf.classList.add('hidden');
            UI.updateTimer(duration, duration);
        } else {
            prog.classList.add('hidden');
            disp.classList.add('hidden');
            inf.classList.remove('hidden');
        }
    },

    updateTimer(timeLeft, duration) {
        const el = document.getElementById('timer-display');
        const fill = document.getElementById('timer-fill');

        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        el.innerText = `${m}:${s}`;

        const pct = (timeLeft / duration) * 100;
        fill.style.width = `${pct}%`;

        if (timeLeft < 30) {
            fill.classList.add('bg-rose-500');
            fill.classList.remove('bg-orange-500');
            el.classList.add('text-rose-400');
        } else {
            fill.classList.add('bg-orange-500');
            fill.classList.remove('bg-rose-500');
            el.classList.remove('text-rose-400');
        }
    },

    // --- RESULTS RENDER ---
    renderResults(secretWord, players, impostors, impostorHint) {
        // impostorHint passed from Game state
        document.getElementById('result-word').innerText = secretWord;
        const grid = document.getElementById('result-grid');
        const actions = document.getElementById('result-actions');

        grid.innerHTML = players.map(p => {
            const isImp = impostors.includes(p.id);
            const borderClass = isImp
                ? 'border-rose-500/40 bg-rose-500/5'
                : 'border-stone-700/30 bg-stone-800/20';

            const badge = isImp
                ? `<div class="flex flex-col items-end"><span class="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Impostor</span><span class="text-[10px] text-rose-300 mt-1 italic">"${impostorHint}"</span></div>`
                : `<span class="bg-stone-700 text-stone-300 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">Civil</span>`;

            return `
                <div id="res-card-${p.id}" class="relative flex items-center justify-between p-3 rounded-xl border ${borderClass}">
                    <div class="flex items-center gap-3">
                        <div class="relative">
                           <img src="${p.avatar}" class="w-10 h-10 rounded-full bg-stone-800 grayscale-[0.3]">
                           ${isImp ? '<span class="absolute -bottom-1 -right-1 text-sm">🤫</span>' : ''}
                        </div>
                        <p class="font-bold text-stone-100">${p.name}</p>
                    </div>
                    ${badge}
                </div>
            `;
        }).join('');

        // WHO WON SCORING
        actions.innerHTML = `
            <div class="text-center mb-6">
                <p class="text-xs text-stone-500 uppercase tracking-widest font-bold mb-3">¿Quién ha ganado?</p>
                <div class="flex gap-3">
                    <button onclick="window.App.registerTeamWin('impostor')" class="flex-1 bg-rose-900/30 hover:bg-rose-600/20 border border-rose-500/30 hover:border-rose-500 text-rose-200 py-3 rounded-xl transition-all font-bold text-sm">
                        🤫 Impostores
                    </button>
                    <button onclick="window.App.registerTeamWin('crew')" class="flex-1 bg-stone-800 hover:bg-emerald-600/20 border border-stone-600 hover:border-emerald-500 text-stone-300 hover:text-emerald-200 py-3 rounded-xl transition-all font-bold text-sm">
                        🕵️ Civiles
                    </button>
                </div>
                <p class="text-[10px] text-stone-600 mt-2 italic">*Solo los impostores suman puntos al ganar.</p>
        `;
    },

    animateTeamWin(team) {
        // Not used heavily, just toast or feedback could go here
        // For now, App handles redirection or state update
    }
};

// Helper for Icons
window.getCategoryIcon = (cat) => {
    const icons = {
        "Lugares": "✈️",
        "Profesiones": "💼",
        "Comida": "🍕",
        "Cine": "🎬",
        "Objetos": "🧸",
        "Animales": "🦁",
        "Celebridades": "🌟",
        "Fútbol": "⚽",
        "Acciones": "⚡",
        "Emociones": "😊"
    };
    return icons[cat] || "❓";
};
