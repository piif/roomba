(function init() {
    const lang = (window.APP_CONFIG && window.APP_CONFIG.lang) || 'en';

    const translations = {
        en: {
            appTitle: 'Roomba Control',
            refresh: 'Refresh',
            tabHome: 'Home',
            tabPlanning: 'Planning',
            tabDetails: 'Details',
            homeTitle: 'Robot Status',
            labelName: 'Name',
            labelStatus: 'Status',
            labelMission: 'Mission',
            labelBattery: 'Battery',
            labelBin: 'Bin',
            clean: 'Clean',
            stop: 'Stop',
            dock: 'Dock',
            planningTitle: 'Planning',
            detailsTitle: 'Technical Details',
            confirm: 'Confirm',
            charging: '(charging)',
            binOk: 'OK',
            binFull: 'Full',
            binMissing: 'Missing',
            inactive: 'Inactive',
            active: 'Active',
            errorPrefix: 'Request failed',
            statuses: {
                Ready: 'Ready',
                NotReady: 'Not ready',
                Error: 'Error'
            },
            missionCycles: {
                none: 'None',
                clean: 'Cleaning',
                start: 'Start'
            },
            missionPhases: {
                charge: 'Charging',
                run: 'Running',
                stop: 'Stopped',
                hmUsrDock: 'Returning home',
                stuck: 'Stuck'
            },
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        fr: {
            appTitle: 'Controle Roomba',
            refresh: 'Actualiser',
            tabHome: 'Accueil',
            tabPlanning: 'Planning',
            tabDetails: 'Details',
            homeTitle: 'Etat du robot',
            labelName: 'Nom',
            labelStatus: 'Statut',
            labelMission: 'Mission',
            labelBattery: 'Batterie',
            labelBin: 'Bac',
            clean: 'Nettoyer',
            stop: 'Stop',
            dock: 'Retour base',
            planningTitle: 'Planning',
            detailsTitle: 'Informations techniques',
            confirm: 'Confirmer',
            charging: '(en charge)',
            binOk: 'OK',
            binFull: 'Pleine',
            binMissing: 'Absente',
            inactive: 'Inactif',
            active: 'Actif',
            errorPrefix: 'Echec de la requete',
            statuses: {
                Ready: 'Pret',
                NotReady: 'Indisponible',
                Error: 'Erreur'
            },
            missionCycles: {
                none: 'Aucune',
                clean: 'Nettoyage',
                start: 'Demarrage'
            },
            missionPhases: {
                charge: 'En charge',
                run: 'En cours',
                stop: 'Arrete',
                hmUsrDock: 'Retour base',
                stuck: 'Bloque'
            },
            days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        }
    };

    const i18n = translations[lang] || translations.en;

    const state = {
        planning: null,
        editedPlanning: null
    };

    function byId(id) {
        return document.getElementById(id);
    }

    function setText(id, text) {
        byId(id).textContent = text;
    }

    function applyTranslations() {
        setText('appTitle', i18n.appTitle);
        setText('refreshButton', i18n.refresh);
        setText('tabHome', i18n.tabHome);
        setText('tabPlanning', i18n.tabPlanning);
        setText('tabDetails', i18n.tabDetails);
        setText('homeTitle', i18n.homeTitle);
        setText('labelName', i18n.labelName);
        setText('labelStatus', i18n.labelStatus);
        setText('labelMission', i18n.labelMission);
        setText('labelBattery', i18n.labelBattery);
        setText('labelBin', i18n.labelBin);
        setText('cleanButton', i18n.clean);
        setText('stopButton', i18n.stop);
        setText('dockButton', i18n.dock);
        setText('planningTitle', i18n.planningTitle);
        setText('detailsTitle', i18n.detailsTitle);
        setText('confirmPlanningButton', i18n.confirm);
        document.title = i18n.appTitle;
    }

    function showError(message) {
        const banner = byId('errorBanner');
        banner.textContent = `${i18n.errorPrefix}: ${message}`;
        banner.classList.remove('hidden');
    }

    function clearError() {
        byId('errorBanner').classList.add('hidden');
    }

    async function api(path, options) {
        clearError();

        const response = await fetch(path, options);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(payload.error || `HTTP ${response.status}`);
        }

        return payload;
    }

    function isMissionRunning(mission) {
        return mission && mission !== 'none';
    }

    function isRobotReady(status) {
        return status === 'Ready';
    }

    function isRobotDocked(status) {
        return !!(status && status.battery && status.battery.charging);
    }

    function translateStatus(status) {
        if (!status) {
            return '-';
        }

        if (status.startsWith('Error ')) {
            return `${i18n.statuses.Error} ${status.slice('Error '.length)}`;
        }

        return i18n.statuses[status] || status;
    }

    function translateMission(mission) {
        if (!mission) {
            return '-';
        }

        if (mission === 'none') {
            return i18n.missionCycles.none || mission;
        }

        const [cycle, phase] = mission.split(':');
        if (!phase) {
            return i18n.missionCycles[cycle] || mission;
        }

        const translatedCycle = i18n.missionCycles[cycle] || cycle;
        const translatedPhase = i18n.missionPhases[phase] || phase;
        return `${translatedCycle}: ${translatedPhase}`;
    }

    function toBinLabel(bin) {
        if (!bin || !bin.present) {
            return i18n.binMissing;
        }
        if (bin.full) {
            return i18n.binFull;
        }
        return i18n.binOk;
    }

    function renderStatus(data) {
        setText('robotName', data.config.name || '-');
        setText('robotStatus', translateStatus(data.status.status));
        setText('robotMission', translateMission(data.status.mission));
        setText('robotBattery', `${data.status.battery.percent}%`);
        setText('batteryCharging', data.status.battery.charging ? i18n.charging : '');
        setText('robotBin', toBinLabel(data.status.bin));

        const ready = isRobotReady(data.status.status);
        const running = isMissionRunning(data.status.mission);
        const docked = isRobotDocked(data.status);

        byId('cleanButton').classList.toggle('hidden', !ready || running);
        byId('stopButton').classList.toggle('hidden', !ready || !running);
        byId('dockButton').classList.toggle('hidden', !ready || (!running && docked));
    }

    function setActivePage(page) {
        document.querySelectorAll('.tab').forEach((tab) => {
            tab.classList.toggle('active', tab.dataset.page === page);
        });

        document.querySelectorAll('.page').forEach((panel) => {
            panel.classList.toggle('active', panel.id === `page-${page}`);
        });
    }

    function deepEqualPlanning(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    }

    function toTimeValue(entry) {
        if (!entry) {
            return '09:00';
        }

        const h = String(entry[0]).padStart(2, '0');
        const m = String(entry[1]).padStart(2, '0');
        return `${h}:${m}`;
    }

    function normalizeToQuarterHour(hour, minute) {
        const safeHour = Number.isNaN(hour) ? 0 : hour;
        const safeMinute = Number.isNaN(minute) ? 0 : minute;

        const quarterMinute = Math.round(safeMinute / 15) * 15;
        const carryHour = Math.floor(quarterMinute / 60);
        const normalizedMinute = quarterMinute % 60;
        const normalizedHour = (safeHour + carryHour + 24) % 24;

        return [normalizedHour, normalizedMinute];
    }

    function readNormalizedTime(timeInput) {
        const [rawHour, rawMinute] = timeInput.value
            .split(':')
            .map((value) => Number.parseInt(value, 10));

        const [hour, minute] = normalizeToQuarterHour(rawHour, rawMinute);

        timeInput.value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        return [hour, minute];
    }

    function normalizePlanningToQuarterHours(planning) {
        return planning.map((entry) => {
            if (!entry) {
                return null;
            }

            return normalizeToQuarterHour(entry[0], entry[1]);
        });
    }

    function onPlanningChanged(dayIndex, activeInput, timeInput) {
        if (!state.editedPlanning) {
            return;
        }

        if (!activeInput.checked) {
            state.editedPlanning[dayIndex] = null;
        } else {
            const [hour, minute] = readNormalizedTime(timeInput);
            state.editedPlanning[dayIndex] = [hour, minute];
        }

        timeInput.disabled = !activeInput.checked;

        byId('confirmPlanningButton').classList.toggle(
            'hidden',
            deepEqualPlanning(state.planning, state.editedPlanning)
        );
    }

    function renderPlanningRows(planning) {
        const container = byId('planningList');
        container.innerHTML = '';

        planning.forEach((entry, dayIndex) => {
            const row = document.createElement('div');
            row.className = 'planning-row';

            const day = document.createElement('strong');
            day.textContent = i18n.days[dayIndex];

            const activeLabel = document.createElement('label');
            const activeInput = document.createElement('input');
            activeInput.type = 'checkbox';
            activeInput.checked = !!entry;
            activeLabel.appendChild(activeInput);
            activeLabel.appendChild(document.createTextNode(` ${activeInput.checked ? i18n.active : i18n.inactive}`));

            const timeInput = document.createElement('input');
            timeInput.type = 'time';
            timeInput.step = 900;
            timeInput.value = toTimeValue(entry);
            timeInput.disabled = !entry;

            activeInput.addEventListener('change', () => {
                activeLabel.lastChild.textContent = ` ${activeInput.checked ? i18n.active : i18n.inactive}`;
                onPlanningChanged(dayIndex, activeInput, timeInput);
            });

            timeInput.addEventListener('change', () => {
                onPlanningChanged(dayIndex, activeInput, timeInput);
            });

            row.appendChild(day);
            row.appendChild(activeLabel);
            row.appendChild(timeInput);

            container.appendChild(row);
        });
    }

    async function loadHome() {
        const status = await api('api/status');
        renderStatus(status);
    }

    async function loadPlanning() {
        const payload = await api('api/planning');
        state.planning = payload.planning;
        state.editedPlanning = JSON.parse(JSON.stringify(payload.planning));
        byId('confirmPlanningButton').classList.add('hidden');
        renderPlanningRows(state.editedPlanning);
    }

    async function loadDetails() {
        const payload = await api('api/details');
        byId('detailsJson').textContent = JSON.stringify(payload.details, null, 2);
    }

    async function sendAction(action) {
        await api(`api/actions/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        await loadHome();
    }

    async function savePlanning() {
        if (!state.editedPlanning) {
            return;
        }

        const normalizedPlanning = normalizePlanningToQuarterHours(state.editedPlanning);
        state.editedPlanning = normalizedPlanning;

        await api('api/planning', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planning: normalizedPlanning })
        });

        await new Promise((resolve) => {
            setTimeout(resolve, 2000);
        });

        await loadPlanning();
    }

    function bindEvents() {
        document.querySelectorAll('.tab').forEach((tab) => {
            tab.addEventListener('click', async () => {
                setActivePage(tab.dataset.page);
                try {
                    if (tab.dataset.page === 'home') {
                        await loadHome();
                    }
                    if (tab.dataset.page === 'planning') {
                        await loadPlanning();
                    }
                    if (tab.dataset.page === 'details') {
                        await loadDetails();
                    }
                } catch (error) {
                    showError(error.message);
                }
            });
        });

        byId('refreshButton').addEventListener('click', async () => {
            try {
                await loadHome();
            } catch (error) {
                showError(error.message);
            }
        });

        byId('cleanButton').addEventListener('click', async () => {
            try {
                await sendAction('clean');
            } catch (error) {
                showError(error.message);
            }
        });

        byId('stopButton').addEventListener('click', async () => {
            try {
                await sendAction('stop');
            } catch (error) {
                showError(error.message);
            }
        });

        byId('dockButton').addEventListener('click', async () => {
            try {
                await sendAction('dock');
            } catch (error) {
                showError(error.message);
            }
        });

        byId('confirmPlanningButton').addEventListener('click', async () => {
            try {
                await savePlanning();
            } catch (error) {
                showError(error.message);
            }
        });
    }

    async function boot() {
        applyTranslations();
        bindEvents();
        try {
            await Promise.all([loadHome(), loadPlanning(), loadDetails()]);
            setActivePage('home');
        } catch (error) {
            showError(error.message);
        }
    }

    boot();
})();
