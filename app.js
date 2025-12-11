/**
 * Application principale - Gestion Arrêt Annuel
 * Point d'entrée et contrôleur principal
 */

const App = {
    currentScreen: 'dashboard',
    currentDetailId: null,

    // Initialisation
    init() {
        this.setupNavigation();
        this.setupSearch();
        this.setupModal();
        this.setupImport();
        this.setupDataListeners();
        this.updateDataStatus();
        this.navigate('dashboard');

        console.log('Application Arrêt Annuel initialisée');
    },

    // === NAVIGATION ===
    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const screen = item.dataset.screen;
                this.navigate(screen);
            });
        });

        // Menu mobile
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    },

    navigate(screen) {
        this.currentScreen = screen;

        // Mise à jour navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.screen === screen);
        });

        // Mise à jour titre
        const titles = {
            dashboard: 'Dashboard',
            travaux: 'Liste des Travaux',
            preparation: 'Préparation',
            execution: 'Exécution',
            postmortem: 'Post-Mortem',
            calendrier: 'Calendrier',
            rapports: 'Rapports',
            import: 'Import Données',
            pieces: 'Pièces',
            'avis-syndicaux': 'Avis syndicaux',
            'reunions': 'Réunions',
            'parametres': 'Paramètres'
        };
        document.getElementById('pageTitle').textContent = titles[screen] || screen;

        // Rendu de l'écran
        this.renderScreen(screen);

        // Fermer sidebar mobile
        document.getElementById('sidebar').classList.remove('open');
    },

    renderScreen(screen) {
        const content = document.getElementById('contentArea');

        switch (screen) {
            case 'dashboard':
                content.innerHTML = Screens.renderDashboard();
                break;
            case 'travaux':
                content.innerHTML = Screens.renderTravaux();
                break;
            case 'preparation':
                content.innerHTML = ScreenPreparation.render();
                break;
            case 'execution':
                content.innerHTML = Screens.renderExecution();
                break;
            case 'postmortem':
                content.innerHTML = Screens.renderPostMortem();
                break;
            case 'calendrier':
                content.innerHTML = Screens.renderCalendrier();
                break;
            case 'rapports':
                content.innerHTML = ReportsManager.renderReportsScreen();
                break;
            case 'import':
                content.innerHTML = Screens.renderImport();
                this.setupImportZone();
                break;
            case 'pieces':
                content.innerHTML = Screens.renderPieces();
                break;
            case 'avis-syndicaux':
                content.innerHTML = Screens.renderAvisSyndicaux();
                break;
            case 'reunions':
                content.innerHTML = Screens.renderReunions();
                break;
            case 'parametres':
                content.innerHTML = Screens.renderParametres();
                break;
            default:
                content.innerHTML = '<p>Écran non trouvé</p>';
        }
    },

    // === RECHERCHE GLOBALE ===
    setupSearch() {
        const searchInput = document.getElementById('globalSearch');
        let timeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 2) {
                    this.performSearch(query);
                }
            }, 300);
        });
    },

    performSearch(query) {
        const travaux = DataManager.getTravaux({ search: query });
        if (travaux.length > 0) {
            this.navigate('travaux');
            setTimeout(() => {
                document.getElementById('filterSearch').value = query;
                this.applyFilters();
            }, 100);
        } else {
            this.showToast(`Aucun résultat pour "${query}"`, 'warning');
        }
    },

    // === MODAL DÉTAIL ===
    setupModal() {
        const modal = document.getElementById('detailModal');
        const closeBtn = document.getElementById('modalClose');

        closeBtn.addEventListener('click', () => this.closeModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    },

    showDetail(id) {
        const travail = DataManager.getTravail(id);
        if (!travail) {
            this.showToast('Travail non trouvé', 'error');
            return;
        }

        this.currentDetailId = id;

        // Afficher l'écran détail pleine page au lieu du modal
        document.getElementById('contentArea').innerHTML = ScreenTravailDetail.render(id);
        document.getElementById('pageTitle').textContent = `Détail OT ${travail.ot}`;
    },

    closeModal() {
        document.getElementById('detailModal').classList.remove('active');
        this.currentDetailId = null;
    },

    switchDetailTab(tab) {
        const travail = DataManager.getTravail(this.currentDetailId);
        if (!travail) return;

        // Mettre à jour les onglets actifs
        document.querySelectorAll('#detailModal .tab').forEach(t => {
            const tabText = t.textContent.toLowerCase();
            let isActive = false;
            if (tab === 'info' && tabText.includes('information')) isActive = true;
            if (tab === 'custom' && tabText.includes('perso')) isActive = true;
            if (tab === 'preparation' && tabText.includes('préparation')) isActive = true;
            if (tab === 'execution' && tabText.includes('exécution')) isActive = true;
            if (tab === 'comments' && tabText.includes('commentaire')) isActive = true;
            t.classList.toggle('active', isActive);
        });

        const content = document.getElementById('detailContent');
        switch (tab) {
            case 'info':
                content.innerHTML = Screens.renderDetailInfo(travail);
                break;
            case 'custom':
                content.innerHTML = Screens.renderDetailCustomFields(travail);
                break;
            case 'preparation':
                content.innerHTML = Screens.renderDetailPreparation(travail);
                break;
            case 'execution':
                content.innerHTML = Screens.renderDetailExecution(travail);
                break;
            case 'comments':
                content.innerHTML = Screens.renderDetailComments(travail);
                break;
        }
    },

    // Sauvegarder les champs personnalisés
    saveCustomFields(otId) {
        const inputs = document.querySelectorAll('.custom-field-input');
        let updated = 0;

        inputs.forEach(input => {
            const fieldId = input.dataset.fieldId;
            let value = input.value;

            // Convertir selon le type d'input
            if (input.type === 'number') {
                value = parseFloat(value) || 0;
            }

            DataManager.updateCustomField(otId, fieldId, value);
            updated++;
        });

        this.showToast(`${updated} champ(s) personnalisé(s) sauvegardé(s)`, 'success');
    },

    // === IMPORT ===
    setupImport() {
        // Configuration globale
    },

    setupImportZone() {
        const zone = document.getElementById('uploadZone');
        const input = document.getElementById('fileInput');

        if (!zone || !input) return;

        zone.addEventListener('click', () => input.click());

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('dragover');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileSelect(file);
        });

        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileSelect(file);
        });
    },

    async handleFileSelect(file) {
        const importType = document.getElementById('importType').value;

        try {
            this.showToast('Lecture du fichier...', 'info');

            const result = await ImportManager.readExcel(file);

            // Passer à l'étape 2
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step1').classList.add('completed');
            document.getElementById('step2').classList.add('active');

            // Afficher le mapping
            document.getElementById('importContent').innerHTML = `
                <div class="card">
                    <h3>Fichier: ${result.fileName}</h3>
                    <p>${result.totalRows} lignes détectées</p>
                </div>

                ${ImportManager.generateMappingUI(result.headers, importType)}

                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" onclick="App.previewImport('${importType}')">
                        Aperçu et Validation
                    </button>
                    <button class="btn btn-outline" onclick="App.navigate('import')">
                        Annuler
                    </button>
                </div>
            `;

            this.showToast('Fichier lu avec succès', 'success');

        } catch (error) {
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    },

    previewImport(type) {
        // Sauvegarder le mapping AVANT de changer l'UI
        const mapping = ImportManager.saveMapping();
        const validation = ImportManager.validateMapping(mapping, type);

        if (!validation.valid) {
            this.showToast(validation.message, 'error');
            return;
        }

        // Passer à l'étape 3
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step2').classList.add('completed');
        document.getElementById('step3').classList.add('active');

        const preview = ImportManager.generatePreview(ImportManager.currentData, mapping);

        document.getElementById('importContent').innerHTML = `
            <div class="card">
                <h3>Validation de l'import</h3>
                ${preview}
            </div>

            <div style="margin-top: 20px;">
                <button class="btn btn-success" onclick="App.confirmImport('${type}')">
                    ✓ Confirmer l'Import
                </button>
                <button class="btn btn-outline" onclick="App.navigate('import')">
                    Annuler
                </button>
            </div>
        `;
    },

    confirmImport(type) {
        const result = ImportManager.performImport(type);

        if (result.success) {
            this.showToast(result.message, 'success');
            this.updateDataStatus();
            ImportManager.reset();

            // Retourner au dashboard après 1s
            setTimeout(() => this.navigate('dashboard'), 1000);
        } else {
            this.showToast(result.message, 'error');
        }
    },

    showImportExecution() {
        document.getElementById('importType').value = 'execution';
        this.navigate('import');
    },

    // === FILTRES ===
    applyFilters() {
        const discipline = document.getElementById('filterDiscipline')?.value || '';
        const statut = document.getElementById('filterStatut')?.value || '';
        const search = document.getElementById('filterSearch')?.value || '';

        const travaux = DataManager.getTravaux({ discipline, statut, search });

        document.getElementById('travauxTable').innerHTML = Screens.renderTravauxRows(travaux);
        document.getElementById('travauxCount').textContent = `${travaux.length} travaux`;
    },

    filterExecution() {
        const filter = document.getElementById('execFilter')?.value || '';
        let travaux = DataManager.getTravaux();

        if (filter) {
            travaux = travaux.filter(t => t.execution.statutExec === filter);
        }

        document.getElementById('executionTable').innerHTML = Screens.renderExecutionRows(travaux);
    },

    filterPostMortem() {
        const filter = document.getElementById('pmFilter')?.value || '';
        const actions = DataManager.getPostMortemActions({ statut: filter || undefined });

        document.getElementById('pmTable').innerHTML = Screens.renderPostMortemRows(actions);
    },

    // === PRÉPARATION ===
    togglePrepa(otId, field, value) {
        DataManager.updatePreparation(otId, field, value);
        this.showToast('Préparation mise à jour', 'success');
    },

    switchPrepaTab(tab) {
        document.querySelectorAll('#prepaContent ~ .tabs .tab, .tabs .tab').forEach(t => {
            t.classList.toggle('active', t.textContent.toLowerCase().includes(tab));
        });

        const travaux = DataManager.getTravaux();
        const content = document.getElementById('prepaContent');

        if (tab === 'kanban') {
            content.innerHTML = Screens.renderPreparationKanban(travaux);
        } else {
            content.innerHTML = Screens.renderPreparationList(travaux);
        }
    },

    updatePrepaDetail(otId, field, value) {
        DataManager.updatePreparation(otId, field, value);
    },

    savePrepaComment(otId) {
        const comment = document.getElementById('prepaComment').value;
        DataManager.updateTravail(otId, { 'preparation.commentairePrepa': comment });
        this.showToast('Commentaire sauvegardé', 'success');
    },

    // === EXÉCUTION ===
    updateExecStatus(otId, value) {
        DataManager.updateExecution(otId, 'statutExec', value);
        if (value === 'En cours' && !DataManager.getTravail(otId).execution.dateDebut) {
            DataManager.updateExecution(otId, 'dateDebut', new Date().toISOString());
        }
        if (value === 'Terminé' && !DataManager.getTravail(otId).execution.dateFin) {
            DataManager.updateExecution(otId, 'dateFin', new Date().toISOString());
        }
        this.showToast('Statut mis à jour', 'success');
    },

    updateExecHeures(otId, value) {
        DataManager.updateExecution(otId, 'heuresReelles', parseFloat(value) || 0);
    },

    updateExecDetail(otId, field, value) {
        DataManager.updateExecution(otId, field, value);
    },

    saveExecComment(otId) {
        const comment = document.getElementById('execComment').value;
        const travail = DataManager.getTravail(otId);
        travail.execution.commentaireExec = comment;
        DataManager.saveToStorage();
        this.showToast('Commentaire sauvegardé', 'success');
    },

    // === COMMENTAIRES ===
    addComment(otId) {
        const input = document.getElementById('newComment');
        const text = input.value.trim();

        if (!text) {
            this.showToast('Veuillez saisir un commentaire', 'warning');
            return;
        }

        DataManager.addComment(otId, text);
        input.value = '';

        // Rafraîchir la liste des commentaires
        const travail = DataManager.getTravail(otId);
        document.getElementById('detailContent').innerHTML = Screens.renderDetailComments(travail);

        this.showToast('Commentaire ajouté', 'success');
    },

    // === POST-MORTEM ===
    addPostMortemAction(event) {
        event.preventDefault();

        const action = {
            titre: document.getElementById('actionTitre').value,
            type: document.getElementById('actionType').value,
            description: document.getElementById('actionDescription').value,
            responsable: document.getElementById('actionResponsable').value,
            echeance: document.getElementById('actionEcheance').value
        };

        DataManager.addPostMortemAction(action);

        // Reset form
        document.getElementById('newActionForm').reset();

        // Rafraîchir la liste
        const actions = DataManager.getPostMortemActions();
        document.getElementById('pmTable').innerHTML = Screens.renderPostMortemRows(actions);

        this.showToast('Action ajoutée', 'success');
    },

    updatePMStatus(id, value) {
        DataManager.updatePostMortemAction(id, { statut: value });
        this.showToast('Statut mis à jour', 'success');
    },

    deletePMAction(id) {
        if (confirm('Supprimer cette action ?')) {
            DataManager.data.postmortem = DataManager.data.postmortem.filter(a => a.id !== id);
            DataManager.saveToStorage();

            const actions = DataManager.getPostMortemActions();
            document.getElementById('pmTable').innerHTML = Screens.renderPostMortemRows(actions);

            this.showToast('Action supprimée', 'success');
        }
    },

    // === DONNÉES ===
    setupDataListeners() {
        DataManager.subscribe('all', () => {
            this.updateDataStatus();
        });
    },

    updateDataStatus() {
        const status = document.getElementById('dataStatus');
        const hasData = DataManager.data.travaux.length > 0;

        status.innerHTML = `
            <span class="status-dot ${hasData ? 'online' : 'offline'}"></span>
            <span>${hasData ? DataManager.data.travaux.length + ' travaux' : 'Aucune donnée'}</span>
        `;

        // Mise à jour dernière MAJ
        const lastUpdate = DataManager.data.metadata.lastImportTravaux;
        document.getElementById('lastUpdate').textContent = lastUpdate
            ? `MAJ: ${new Date(lastUpdate).toLocaleDateString('fr-FR')}`
            : 'Dernière MAJ: --';
    },

    resetAllData() {
        if (confirm('Voulez-vous vraiment supprimer TOUTES les données ? Cette action est irréversible.')) {
            DataManager.resetData();
            this.showToast('Données réinitialisées', 'success');
            this.navigate('dashboard');
        }
    },

    exportAllData() {
        const data = DataManager.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `arret_annuel_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showToast('Données exportées', 'success');
    },

    // === TOASTS ===
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span>${this.getToastIcon(type)}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    getToastIcon(type) {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✗';
            case 'warning': return '⚠';
            default: return 'ℹ';
        }
    }
};

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
