
// --- STATE & STORAGE ---
// Handles data persistence and global state

const DEFAULT_API_KEY = "AIzaSyBSu3AWs79xObEn5GC6GhSEDCrn95e5R8w"; // 👈 PEGA TU API KEY AQUÍ

window.State = {
    players: [], // This will be the shadow of the active roster
    rosters: [], // Array of { id, name, players: [] }
    activeRosterId: null,

    config: {
        impostorCount: 1,
        chaosMode: false,
        category: 'Lugares',
        timerEnabled: true,
        timerDuration: 180, // seconds
        revealPartners: true,
        showHints: true,
        customPreset: null
    },

    apiKey: DEFAULT_API_KEY,

    customScripts: [],

    session: {
        active: false,
        secretWord: "",
        hint: "",
        impostors: [], // IDs
        activePlayers: [], // subset of players participating
        currentRevealIndex: 0,
        starterId: null,
        timerId: null
    }
};

const STORAGE_KEY = 'impostar_data_v2';
const ROSTERS_KEY = 'impostar_rosters_v1';

window.Store = {
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State.players));
        localStorage.setItem(ROSTERS_KEY, JSON.stringify({
            rosters: State.rosters,
            activeRosterId: State.activeRosterId
        }));
        localStorage.setItem(STORAGE_KEY + '_scripts', JSON.stringify(State.customScripts));
    },

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        const rostersData = localStorage.getItem(ROSTERS_KEY);
        const scripts = localStorage.getItem(STORAGE_KEY + '_scripts');

        // Load Rosters
        if (rostersData) {
            try {
                const parsed = JSON.parse(rostersData);
                State.rosters = parsed.rosters || [];
                State.activeRosterId = parsed.activeRosterId;
            } catch (e) { console.error(e); }
        }

        // Load/Migrate Players
        if (data) {
            try {
                const players = JSON.parse(data);

                // Migration: If we have players but no rosters, create the first one
                if (players.length > 0 && State.rosters.length === 0) {
                    const mainRoster = {
                        id: Date.now(),
                        name: "Elenco Principal",
                        players: players
                    };
                    State.rosters = [mainRoster];
                    State.activeRosterId = mainRoster.id;
                }

                // If we have an active roster, set State.players
                const active = State.rosters.find(r => r.id === State.activeRosterId) || State.rosters[0];
                if (active) {
                    State.activeRosterId = active.id;
                    State.players = active.players;
                }

                // Migration: ensure all players have required properties
                State.players.forEach((p, index) => {
                    if (!p.id) p.id = Date.now() + Math.random();
                    if (!p.name) p.name = `Jugador ${index + 1}`;
                    if (p.wins === undefined) p.wins = p.winsTotal || 0;
                    if (p.dailyWins === undefined) p.dailyWins = p.winsToday || 0;
                    if (p.monthlyWins === undefined) p.monthlyWins = 0;
                    if (!p.avatar) p.avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=transparent`;
                });

                // Save migrated data
                this.save();
            } catch (e) { console.error(e); }
        }

        // 24h and Monthly Reset Logic
        this.checkResets();

        if (scripts) {
            try { window.State.customScripts = JSON.parse(scripts); } catch (e) { console.error(e); }
        }

        const key = localStorage.getItem('gemini_api_key');
        if (key) {
            State.apiKey = key;
            // Update input if exists
            const input = document.getElementById('gemini-api-key');
            if (input) input.value = key;
        }
    },

    checkResets() {
        const now = new Date();
        const todayStr = now.toDateString();
        const thisMonthStr = `${now.getMonth()}-${now.getFullYear()}`;

        const lastDaily = localStorage.getItem('last_daily_reset');
        const lastMonthly = localStorage.getItem('last_monthly_reset');

        let changed = false;

        // Daily Reset
        if (lastDaily !== todayStr) {
            State.rosters.forEach(r => {
                r.players.forEach(p => p.dailyWins = 0);
            });
            // Sync current State.players if it exists
            if (State.players) State.players.forEach(p => p.dailyWins = 0);

            localStorage.setItem('last_daily_reset', todayStr);
            changed = true;
            console.log("Diario reseteado globalmente");
        }

        // Monthly Reset
        if (lastMonthly !== thisMonthStr) {
            State.rosters.forEach(r => {
                r.players.forEach(p => p.monthlyWins = 0);
            });
            if (State.players) State.players.forEach(p => p.monthlyWins = 0);

            localStorage.setItem('last_monthly_reset', thisMonthStr);
            changed = true;
            console.log("Mensual reseteado globalmente");
        }

        if (changed) this.save();
    },

    setApiKey(key) {
        State.apiKey = key;
        localStorage.setItem('gemini_api_key', key);
    },

    addPlayer(name) {
        if (!name) return;
        const newPlayer = {
            id: Date.now(),
            name: name,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`,
            wins: 0,
            dailyWins: 0,
            monthlyWins: 0,
            active: true
        };
        State.players.push(newPlayer);
        Store.save();
        return newPlayer;
    },

    removePlayer(id) {
        State.players = State.players.filter(p => p.id !== id);
        Store.save();
    },

    togglePlayerActive(id) {
        const p = State.players.find(x => x.id === id);
        if (p) {
            p.active = !p.active;
            Store.save();
        }
    },

    // --- ROSTER MANAGEMENT ---
    createRoster(name) {
        const newRoster = {
            id: Date.now(),
            name: name || "Nuevo Elenco",
            players: []
        };
        State.rosters.push(newRoster);
        this.switchRoster(newRoster.id);
    },

    switchRoster(id) {
        const r = State.rosters.find(x => x.id === id);
        if (r) {
            State.activeRosterId = id;
            State.players = r.players;
            this.save();
        }
    },

    renameRoster(id, newName) {
        const r = State.rosters.find(x => x.id === id);
        if (r && newName) {
            r.name = newName;
            this.save();
        }
    },

    deleteRoster(id) {
        if (State.rosters.length <= 1) return; // Keep at least one
        State.rosters = State.rosters.filter(x => x.id !== id);
        if (State.activeRosterId === id) {
            this.switchRoster(State.rosters[0].id);
        } else {
            this.save();
        }
    },

    updatePlayerName(id, newName) {
        const p = State.players.find(x => x.id === id);
        if (p && newName) {
            p.name = newName;
            // Update avatar with new name seed
            p.avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newName)}&backgroundColor=transparent`;
            Store.save();
        }
    },

    exportRoster() {
        // Compact format: name:wins,name:wins
        // We only export essential stats to keep it short
        const compact = State.players.map(p => `${p.name}:${p.wins || 0}`).join(',');
        return btoa(unescape(encodeURIComponent(compact)));
    },

    importRoster(base64Data) {
        try {
            const raw = decodeURIComponent(escape(atob(base64Data)));
            let players = [];

            if (raw.startsWith('[') || raw.startsWith('{')) {
                // Legacy JSON format
                players = JSON.parse(raw);
            } else {
                // Compact format: Name:Wins,Name:Wins
                players = raw.split(',').map(item => {
                    const [name, wins] = item.split(':');
                    return {
                        id: Date.now() + Math.random(),
                        name: name.trim(),
                        wins: parseInt(wins) || 0,
                        dailyWins: 0,
                        monthlyWins: 0,
                        active: true,
                        avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=transparent`
                    };
                });
            }

            if (Array.isArray(players)) {
                // Ensure all imported players have correct structure
                players.forEach(p => {
                    if (!p.id) p.id = Date.now() + Math.random();
                    if (!p.avatar) p.avatar = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(p.name)}&backgroundColor=transparent`;
                    if (p.wins === undefined) p.wins = 0;
                    if (p.dailyWins === undefined) p.dailyWins = 0;
                    if (p.monthlyWins === undefined) p.monthlyWins = 0;
                    if (p.active === undefined) p.active = true;
                });

                State.players = players;

                // Update the roster in the list to maintain sync
                const activeIdx = State.rosters.findIndex(r => r.id === State.activeRosterId);
                if (activeIdx !== -1) {
                    State.rosters[activeIdx].players = players;
                }

                Store.save();
                return true;
            }
        } catch (e) {
            console.error("Import failed:", e);
        }
        return false;
    },

    resetDailyWins() {
        State.players.forEach(p => p.dailyWins = 0);
        localStorage.setItem('last_daily_reset', new Date().toDateString());
        Store.save();
        // Refresh UI if necessary
        if (window.UI && UI.renderStats) UI.renderStats();
    },

    // --- SCRIPTS ---
    addCustomScript(name, items) {
        // items: Array of {word, hint}
        const id = Date.now().toString(36);
        const script = {
            id,
            name,
            words: items
        };
        State.customScripts.push(script);
        Store.save();
    },

    updateCustomScript(id, name, items) {
        const script = State.customScripts.find(s => s.id === id);
        if (script) {
            script.name = name;
            script.words = items;
            Store.save();
        }
    },

    deleteCustomScript(id) {
        State.customScripts = State.customScripts.filter(s => s.id !== id);
        Store.save();
    },

    addWin(id) {
        const p = State.players.find(x => x.id === id);
        if (p) {
            p.wins++;
            p.dailyWins++;
            p.monthlyWins++;
            Store.save();
        }
    }
};
