
// --- STATE & STORAGE ---
// Handles data persistence and global state

const DEFAULT_API_KEY = "AIzaSyBSu3AWs79xObEn5GC6GhSEDCrn95e5R8w"; // 👈 PEGA TU API KEY AQUÍ

window.State = {
    players: [],
    // structure: { id, name, winsTotal: 0, winsToday: 0, active: true }

    config: {
        impostorCount: 1,
        chaosMode: false,
        category: 'Lugares',
        timerEnabled: true,
        timerDuration: 180, // seconds
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

window.Store = {
    save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(State.players));
        localStorage.setItem(STORAGE_KEY + '_scripts', JSON.stringify(State.customScripts));
    },

    load() {
        const data = localStorage.getItem(STORAGE_KEY);
        const scripts = localStorage.getItem(STORAGE_KEY + '_scripts');

        if (data) {
            try {
                window.State.players = JSON.parse(data);

                // Migration: ensure all players have required properties
                State.players.forEach((p, index) => {
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
        const todayStr = now.toDateString(); // "Wed Feb 11 2026"
        const thisMonthStr = `${now.getMonth()}-${now.getFullYear()}`; // "1-2026"

        const lastDaily = localStorage.getItem('last_daily_reset');
        const lastMonthly = localStorage.getItem('last_monthly_reset');

        // Daily Reset
        if (lastDaily !== todayStr) {
            State.players.forEach(p => p.dailyWins = 0);
            localStorage.setItem('last_daily_reset', todayStr);
            console.log("Diario reseteado");
        }

        // Monthly Reset
        if (lastMonthly !== thisMonthStr) {
            State.players.forEach(p => p.monthlyWins = 0);
            localStorage.setItem('last_monthly_reset', thisMonthStr);
            console.log("Mensual reseteado");
        }

        this.save();
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
