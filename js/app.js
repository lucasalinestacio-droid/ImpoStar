
// --- MAIN INIT ---

window.App = {
    // Expose methods for HTML onclicks
    togglePlayer: (id) => {
        Store.togglePlayerActive(id);
        UI.renderSetup(); // Updates active toggle in setup screen
    },

    deletePlayer: (id, e) => {
        e.stopPropagation();
        if (confirm("¿Eliminar?")) {
            Store.removePlayer(id);
            UI.renderGroup(); // Updates Roster
            UI.renderSetup(); // Updates Setup List
        }
    },

    resetDailyWins: () => {
        if (confirm("¿Resetear victorias de hoy?")) {
            Store.resetDailyWins();
            UI.renderGroup();
            UI.renderStats();
        }
    },

    // UI Helpers
    toggleAddModal: (show) => {
        const m = document.getElementById('modal-add');
        if (show) {
            m.classList.remove('hidden');
            setTimeout(() => document.getElementById('new-player-input').focus(), 100);
        } else {
            m.classList.add('hidden');
        }
    },

    handleAddPlayer: () => {
        const inp = document.getElementById('new-player-input');
        if (Store.addPlayer(inp.value.trim())) {
            inp.value = "";
            App.toggleAddModal(false);
            UI.renderGroup();
            UI.renderSetup();
        }
    },

    updatePlayerName: (id, name) => {
        const p = State.players.find(x => x.id === id);
        if (p) {
            p.name = name.trim() || "Anónimo";
            Store.save();
        }
    },

    // Setup Helpers  
    updateSlider: (val) => {
        State.config.impostorCount = parseInt(val);
        State.config.chaosMode = false; // Disable chaos when manually adjusting
        document.getElementById('chaos-mode').checked = false;
        UI.updateImpostorDisplay(val, false);
        Store.save();
    },

    toggleChaos: (el) => {
        State.config.chaosMode = el.checked;
        UI.updateImpostorDisplay(State.config.impostorCount, el.checked);
        Store.save();
    },

    changeCategory: (val) => {
        State.config.category = val;
        Store.save();
    },

    // Timer UI
    toggleTimer: (checkbox) => {
        const slider = document.getElementById('timer-slider-container');
        const status = document.getElementById('timer-status-text');

        if (checkbox.checked) {
            slider.classList.remove('hidden');
            status.innerText = "Activado";
            status.className = "text-[10px] text-emerald-400 flex items-center gap-1 font-bold";
            State.config.timerEnabled = true;
        } else {
            slider.classList.add('hidden');
            status.innerText = "Infinito";
            status.className = "text-[10px] text-stone-500 flex items-center gap-1 font-bold italic";
            State.config.timerEnabled = false;
        }
        Store.save();
    },

    updateTimerDisplay: (val) => {
        document.getElementById('timer-display-val').innerText = `${val} min`;
        State.config.timerDuration = parseFloat(val) * 60;
        Store.save();
    },

    toggleRevealPartners: (checkbox) => {
        State.config.revealPartners = checkbox.checked;
        Store.save();
    },

    toggleShowHints: (checkbox) => {
        State.config.showHints = checkbox.checked;
        Store.save();
    },

    exportRoster: async (btn) => {
        // Optional: pass button element to show loading state
        if (btn) btn.style.opacity = '0.5';

        try {
            const code = await Store.exportRoster();
            navigator.clipboard.writeText(code).then(() => {
                alert(`Código corto copiado: ${code}\n¡Pásalo a tus amigos!`);
            }).catch(err => {
                prompt("Copia tu código de elenco:", code);
            });
        } catch (e) {
            alert("Error al generar código corto.");
        } finally {
            if (btn) btn.style.opacity = '1';
        }
    },

    importRoster: async () => {
        const code = prompt("Pega aquí el código corto (ej: A1B2C3) o el código largo:");
        if (code) {
            const success = await Store.importRoster(code);
            if (success) {
                UI.renderGroup();
                alert('Elenco importado con éxito');
            } else {
                alert('Error al importar. Verifica que el código sea correcto y tengas internet para códigos cortos.');
            }
        }
    },

    editPlayerName: (id) => {
        const p = State.players.find(x => x.id === id);
        if (p) {
            const newName = prompt(`Editar nombre de ${p.name}:`, p.name);
            if (newName && newName !== p.name) {
                Store.updatePlayerName(id, newName);
                UI.renderGroup();
            }
        }
    },

    // --- ROSTER MANAGEMENT ---
    switchRoster: (id) => {
        Store.switchRoster(parseInt(id));
        UI.renderGroup();
        UI.renderStats(); // Update leaderboards
    },

    promptCreateRoster: () => {
        const name = prompt("Nombre del nuevo elenco:");
        if (name) {
            Store.createRoster(name);
            UI.renderGroup();
        }
    },

    promptRenameRoster: (id) => {
        const roster = State.rosters.find(r => r.id === id);
        if (!roster) return;

        const newName = prompt("Nuevo nombre del elenco:", roster.name);
        if (newName && newName !== roster.name) {
            Store.renameRoster(roster.id, newName);
            UI.renderGroup();
        }
    },

    promptDeleteRoster: (id) => {
        const roster = State.rosters.find(r => r.id === id);
        if (!roster) return;

        if (State.rosters.length <= 1) {
            alert("Debes tener al menos un elenco.");
            return;
        }
        if (confirm(`¿Seguro que quieres borrar "${roster.name}" y todos sus jugadores?`)) {
            Store.deleteRoster(roster.id);
            UI.renderGroup();
        }
    },

    // Script Helpers
    tempScriptItems: [], // RAM only

    generateAIHint: async (btn) => {
        if (!btn && event) btn = event.currentTarget;
        const word = document.getElementById('temp-word').value.trim();
        const hintInput = document.getElementById('temp-hint');

        if (!State.apiKey) return alert("⚠️ Configura primero tu API Key de Gemini.");
        if (!word) return alert("Escribe una palabra primero para generar su pista.");

        const originalContent = btn.innerHTML;
        btn.innerHTML = `<svg class="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
        btn.disabled = true;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${State.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Juego de mesa Impostor: Dame una pista muy breve (máximo 4 palabras), ingeniosa y ambigua para la palabra secreta "${word}". NO digas la palabra. Solo la pista.`
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                hintInput.value = data.candidates[0].content.parts[0].text.trim().replace(/^["']|["']$/g, '');
            } else {
                throw new Error("Respuesta inválida de IA");
            }
        } catch (e) {
            console.error("AI Error:", e);
            alert("Error conectando con Gemini. Verifica tu API Key.");
        } finally {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    },

    toggleAddScriptModal: (show) => {
        const m = document.getElementById('modal-script');
        if (show) {
            if (!App.editingScriptId) {
                // Clear only if adding new, not editing
                App.tempScriptItems = []; // Reset
                document.getElementById('new-script-title').value = "";
                document.getElementById('new-script-list').innerHTML = "";
                document.getElementById('new-script-list').classList.add('hidden');
                document.getElementById('temp-word').value = "";
                document.getElementById('temp-hint').value = "";
            }
            m.classList.remove('hidden');
            setTimeout(() => document.getElementById('new-script-title').focus(), 100);
        } else {
            m.classList.add('hidden');
        }
    },

    addTempword: () => {
        const word = document.getElementById('temp-word').value.trim();
        const hint = document.getElementById('temp-hint').value.trim();

        if (!word) return alert("Escribe la palabra.");
        if (word.includes(' ') || (hint && hint.includes(' '))) return alert("Solo se permite una palabra por campo.");

        App.tempScriptItems.push({ word, hint: hint || "Sin pista" });

        // Clear inputs
        document.getElementById('temp-word').value = "";
        document.getElementById('temp-hint').value = "";
        document.getElementById('temp-word').focus();

        App.renderTempScriptList();
    },

    renderTempScriptList: () => {
        const list = document.getElementById('new-script-list');
        if (App.tempScriptItems.length > 0) list.classList.remove('hidden');

        list.innerHTML = App.tempScriptItems.map((item, i) => `
            <div class="flex items-center justify-between bg-stone-950 p-3 rounded-lg border border-stone-800">
                <div>
                    <span class="font-bold text-stone-200 block">${item.word}</span>
                    <span class="text-xs text-stone-500 italic">${item.hint}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.App.editTempWord(${i})" class="text-stone-500 hover:text-amber-500 text-xs font-bold uppercase transition-colors">Editar</button>
                    <button onclick="window.App.removeTempWord(${i})" class="text-stone-600 hover:text-rose-500 text-xs font-bold uppercase transition-colors">Borrar</button>
                </div>
            </div>
        `).join('');
    },

    removeTempWord: (index) => {
        App.tempScriptItems.splice(index, 1);
        App.renderTempScriptList();
    },

    editTempWord: (index) => {
        const item = App.tempScriptItems[index];
        document.getElementById('temp-word').value = item.word;
        document.getElementById('temp-hint').value = item.hint === "Sin pista" ? "" : item.hint;
        App.removeTempWord(index);
        document.getElementById('temp-word').focus();
    },

    // Script Editing
    editingScriptId: null,

    editScript: (id) => {
        const script = State.customScripts.find(s => s.id === id);
        if (!script) return;

        App.editingScriptId = id;
        document.getElementById('new-script-title').value = script.name;
        App.tempScriptItems = [...script.words];
        App.renderTempScriptList();
        App.toggleAddScriptModal(true);
    },

    saveCustomScript: () => {
        const title = document.getElementById('new-script-title').value.trim();
        if (!title) return alert("Ponle un título al guion.");
        if (App.tempScriptItems.length === 0) return alert("Añade al menos un concepto.");

        if (App.editingScriptId) {
            Store.updateCustomScript(App.editingScriptId, title, App.tempScriptItems);
        } else {
            Store.addCustomScript(title, App.tempScriptItems);
        }

        App.toggleAddScriptModal(false);
        UI.renderScripts();
        App.editingScriptId = null; // Reset
    },

    deleteScript: (id) => {
        if (confirm("¿Borrar guion?")) {
            Store.deleteCustomScript(id);
            UI.renderScripts();
        }
    },

    // Navigation
    nav: (view) => {
        if (view === 'group') UI.renderGroup();
        if (view === 'stats') UI.renderStats();
        if (view === 'script') UI.renderScripts();
        if (view === 'setup') UI.renderSetup();
        Router.go(view);
    },

    // Game Actions
    startGame: () => Game.start(),

    // Card Interaction
    flipCard: () => {
        const card = document.getElementById('card-inner');
        const btn = document.getElementById('btn-next-turn');

        if (!card.classList.contains('rotate-y-180')) {
            // Reveal
            card.classList.add('rotate-y-180');
            Game.showRole();

            // Enable Next Button
            if (btn) {
                btn.classList.remove('opacity-50', 'pointer-events-none');
                btn.classList.add('animate-pulse');
            }
        }
    },

    endGame: () => Game.resolve(),

    registerTeamWin: (team) => {
        // team: 'impostor' or 'crew'
        if (team === 'impostor') {
            State.session.impostors.forEach(id => Store.addWin(id));
            alert("¡Puntos para los Impostores!");
        } else {
            // Crew win logic (no points as requested)
            alert("Victoria de los Ciudadanos (Sin puntos).");
        }
        App.returnLobby();
    },

    returnLobby: () => {
        Router.go('home');
    },

    // Stats Tab Switching
    switchStatsTab: (tab) => {
        // Hide all leaderboards
        document.getElementById('stats-total').classList.add('hidden');
        document.getElementById('stats-daily').classList.add('hidden');
        document.getElementById('stats-monthly').classList.add('hidden');

        // Show selected leaderboard
        document.getElementById(`stats-${tab}`).classList.remove('hidden');

        // Update tab styles
        ['total', 'daily', 'monthly'].forEach(t => {
            const tabEl = document.getElementById(`tab-${t}`);
            if (t === tab) {
                tabEl.classList.add('border-orange-500', 'text-orange-500');
                tabEl.classList.remove('border-transparent', 'text-stone-500');
            } else {
                tabEl.classList.remove('border-orange-500', 'text-orange-500');
                tabEl.classList.add('border-transparent', 'text-stone-500');
            }
        });
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    Store.load();
    Router.go('home');

    // Event Listeners for setup inputs
    const impostorSlider = document.getElementById('impostor-slider');
    if (impostorSlider) {
        impostorSlider.value = State.config.impostorCount || 1;
        impostorSlider.addEventListener('input', (e) => App.updateSlider(e.target.value));
    }

    const chaosMode = document.getElementById('chaos-mode');
    if (chaosMode) {
        chaosMode.checked = State.config.chaosMode || false;
        chaosMode.addEventListener('change', (e) => App.toggleChaos(e.target));
    }

    const categorySelect = document.getElementById('category-select');
    if (categorySelect) {
        categorySelect.addEventListener('change', (e) => App.changeCategory(e.target.value));
    }

    const revealPartners = document.getElementById('reveal-partners-toggle');
    if (revealPartners) {
        revealPartners.checked = State.config.revealPartners !== false;
    }

    const showHints = document.getElementById('show-hints-toggle');
    if (showHints) {
        showHints.checked = State.config.showHints !== false;
    }

    // Initialize impostor count display
    UI.updateImpostorDisplay(State.config.impostorCount || 1, State.config.chaosMode || false);

    // Global interval for UI updates (countdowns, etc.)
    setInterval(() => {
        if (window.UI && UI.updateStatsCountdown) UI.updateStatsCountdown();
    }, 1000);
});
