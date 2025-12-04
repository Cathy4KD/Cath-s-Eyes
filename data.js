/**
 * Module de gestion des données - Arrêt Annuel
 * Gère le stockage, la synchronisation et les mises à jour des données
 */

const DataManager = {
    // Structure des données
    data: {
        travaux: [],           // Liste des travaux SAP
        execution: [],         // Données d'exécution temps réel
        postmortem: [],        // Actions post-mortem
        comments: {},          // Commentaires par OT {otId: [comments]}
        customFields: [],      // Champs personnalisés définis lors de l'import
        pieces: [],            // Pièces importées
        avis: [],              // Avis importés
        processus: null,       // Données du processus d'arrêt (initialisé par ProcessusArret)
        metadata: {
            lastImportTravaux: null,
            lastImportExecution: null,
            lastImportPieces: null,
            totalOT: 0,
            arretName: '',
            arretDateDebut: null,
            arretDateFin: null,
            lastLocalSave: null
        }
    },

    // Clé localStorage
    STORAGE_KEY: 'arret_annuel_data_v2',

    // Initialisation
    async init() {
        // D'abord charger depuis localStorage (rapide)
        this.loadFromLocalStorage();

        // Ensuite essayer de charger depuis Firebase
        await this.loadFromFirebase();

        this.setupAutoSave();
        this.setupFirebaseSync();
        console.log('DataManager initialisé');
    },

    // Charger depuis localStorage (synchrone, rapide)
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const loadedData = JSON.parse(saved);
                // Fusionner avec la structure par défaut pour préserver tous les champs
                this.data = {
                    travaux: loadedData.travaux || [],
                    execution: loadedData.execution || [],
                    postmortem: loadedData.postmortem || [],
                    comments: loadedData.comments || {},
                    customFields: loadedData.customFields || [],
                    pieces: loadedData.pieces || [],
                    avis: loadedData.avis || [],
                    processus: loadedData.processus || null,
                    metadata: {
                        ...this.data.metadata,
                        ...(loadedData.metadata || {})
                    }
                };
                console.log('Données locales chargées:', this.data.travaux.length, 'travaux,',
                    (this.data.pieces || []).length, 'pièces,',
                    'processus:', this.data.processus ? 'oui' : 'non');
            }
        } catch (e) {
            console.error('Erreur chargement localStorage:', e);
        }
    },

    // Charger depuis Firebase (asynchrone)
    // Toutes les données sont synchronisées vers Firebase
    async loadFromFirebase() {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            try {
                const cloudData = await FirebaseManager.loadFromCloud();
                if (cloudData) {
                    // Fusionner les travaux (prendre Firebase si plus récent ou local vide)
                    if (cloudData.travaux && cloudData.travaux.length > 0) {
                        if (this.data.travaux.length === 0) {
                            this.data.travaux = cloudData.travaux;
                        }
                    }

                    // Fusionner les pièces (prendre Firebase si disponible)
                    if (cloudData.pieces && cloudData.pieces.length > 0) {
                        this.data.pieces = cloudData.pieces;
                    }

                    // Fusionner les autres données
                    if (cloudData.avis) this.data.avis = cloudData.avis;
                    if (cloudData.postmortem) this.data.postmortem = cloudData.postmortem;
                    if (cloudData.comments) this.data.comments = cloudData.comments;

                    // Fusionner processus (date d'arrêt, etc.) - prendre Firebase si local est vide
                    if (cloudData.processus && !this.data.processus) {
                        this.data.processus = cloudData.processus;
                    }

                    console.log('Données Firebase fusionnées - Travaux:', this.data.travaux.length,
                        '- Pièces:', (this.data.pieces || []).length,
                        '- Processus:', this.data.processus ? 'oui' : 'non');
                }
            } catch (e) {
                console.error('Erreur chargement Firebase:', e);
            }
        }
    },

    // Sauvegarder dans localStorage uniquement
    saveToLocalStorage() {
        try {
            this.data.metadata.lastLocalSave = Date.now();
            const dataStr = JSON.stringify(this.data);
            localStorage.setItem(this.STORAGE_KEY, dataStr);
            console.log('Données sauvegardées:', Math.round(dataStr.length / 1024), 'KB');
        } catch (e) {
            console.error('Erreur sauvegarde localStorage:', e);
            // Afficher une alerte si quota dépassé
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                alert('Erreur: Espace de stockage insuffisant. Les données n\'ont pas pu être sauvegardées. Essayez d\'exporter vos données et de vider le cache.');
            }
        }
    },

    // Timer pour debounce de la sync Firebase
    _syncTimer: null,

    // Sauvegarder (localStorage + sync Firebase automatique avec debounce)
    saveToStorage() {
        this.saveToLocalStorage();

        // Sync Firebase automatique avec debounce de 3 secondes
        // pour éviter trop d'appels lors de modifications rapides
        if (this._syncTimer) {
            clearTimeout(this._syncTimer);
        }
        this._syncTimer = setTimeout(() => {
            this.syncToFirebase();
        }, 3000);
    },

    // Synchroniser vers Firebase
    syncToFirebase: async function() {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            await FirebaseManager.syncToCloud();
        }
    },

    // Configurer la synchronisation Firebase temps réel
    setupFirebaseSync() {
        if (typeof FirebaseManager !== 'undefined') {
            // Attendre que Firebase soit prêt
            const checkFirebase = setInterval(() => {
                if (FirebaseManager.db) {
                    clearInterval(checkFirebase);
                    FirebaseManager.subscribeToChanges((data) => {
                        // Mise à jour temps réel depuis d'autres clients
                        if (data && data.lastSync) {
                            const cloudTime = data.lastSync.toMillis?.() || 0;
                            const localTime = this.data.metadata?.lastLocalSave || 0;

                            // Ne mettre à jour que si les données cloud sont plus récentes
                            if (cloudTime > localTime + 5000) { // 5s de marge
                                console.log('Mise à jour temps réel depuis Firebase');
                                this.data = {
                                    travaux: data.travaux || [],
                                    execution: data.execution || [],
                                    postmortem: data.postmortem || [],
                                    comments: data.comments || {},
                                    customFields: data.customFields || [],
                                    pieces: data.pieces || [],
                                    avis: data.avis || [],
                                    metadata: data.metadata || this.data.metadata
                                };
                                this.saveToLocalStorage();
                                this.notifyUpdate('all');
                            }
                        }
                    });
                }
            }, 500);
        }
    },

    // Auto-save toutes les 30 secondes
    setupAutoSave() {
        setInterval(() => this.saveToStorage(), 30000);
    },

    // === GESTION DES TRAVAUX ===

    // Importer les travaux depuis Excel
    importTravaux(rows, mapping) {
        // Identifier les champs personnalisés (commencent par 'custom_')
        const customFieldIds = Object.keys(mapping).filter(k => k.startsWith('custom_'));

        const newTravaux = rows.map((row, index) => {
            // Construire l'objet des champs personnalisés
            const customData = {};
            customFieldIds.forEach(fieldId => {
                customData[fieldId] = row[mapping[fieldId]] || '';
            });

            const travail = {
                id: `OT-${Date.now()}-${index}`,
                ot: row[mapping.ot] || '',
                description: row[mapping.description] || '',
                equipement: row[mapping.equipement] || '',
                localisation: row[mapping.localisation] || '',
                discipline: row[mapping.discipline] || '',
                priorite: row[mapping.priorite] || 'Normale',
                statut: row[mapping.statut] || 'A faire',
                dateCreation: row[mapping.dateCreation] || new Date().toISOString(),
                datePrevue: row[mapping.datePrevue] || '',
                estimationHeures: parseFloat(row[mapping.estimationHeures]) || 0,
                entreprise: row[mapping.entreprise] || '',
                responsable: row[mapping.responsable] || '',
                // Champs personnalisés
                customData: customData,
                // Champs préparation
                preparation: {
                    materielCommande: false,
                    permisSecurite: false,
                    consignationPrevue: false,
                    pieceJointe: false,
                    gammeValidee: false,
                    commentairePrepa: ''
                },
                // Champs exécution
                execution: {
                    dateDebut: null,
                    dateFin: null,
                    heuresReelles: 0,
                    statutExec: 'Non démarré',
                    commentaireExec: ''
                },
                // Import brut pour référence
                rawData: row
            };
            return travail;
        });

        // Fusion intelligente avec données existantes
        this.mergeTravaux(newTravaux);
        this.data.metadata.lastImportTravaux = new Date().toISOString();
        this.data.metadata.totalOT = this.data.travaux.length;
        this.saveToStorage();
        this.notifyUpdate('travaux');

        return this.data.travaux.length;
    },

    // Importer les pièces depuis Excel (fusion intelligente)
    importPieces(rows, mapping) {
        // Initialiser le tableau pieces si nécessaire
        if (!this.data.pieces) {
            this.data.pieces = [];
        }

        // Créer une clé unique basée sur OT lié + Désignation (normalisés)
        const createKey = (otLie, designation) => {
            const ot = (otLie || '').toString().trim().toLowerCase();
            const desc = (designation || '').toString().trim().toLowerCase();
            return `${ot}|||${desc}`;
        };

        // Créer une map des pièces existantes avec leur index
        const existingMap = new Map();
        this.data.pieces.forEach((piece, index) => {
            const key = createKey(piece.otLie, piece.designation);
            existingMap.set(key, index);
        });

        let addedCount = 0;
        let updatedCount = 0;

        rows.forEach((row, index) => {
            const otLie = row[mapping.otLie] || '';
            const designation = row[mapping.designation] || '';
            const key = createKey(otLie, designation);

            const newPieceData = {
                reference: row[mapping.reference] || '',
                designation: designation,
                quantite: parseFloat(row[mapping.quantite]) || 1,
                fournisseur: row[mapping.fournisseur] || '',
                delai: parseInt(row[mapping.delai]) || 0,
                categorie: row[mapping.categorie] || '',
                otLie: otLie,
                unite: row[mapping.unite] || '',
                prixUnitaire: parseFloat(row[mapping.prixUnitaire]) || 0,
                rawData: row
            };

            if (existingMap.has(key)) {
                // La pièce existe déjà - mettre à jour les données brutes mais conserver les paramètres utilisateur
                const existingIndex = existingMap.get(key);
                const existingPiece = this.data.pieces[existingIndex];

                // Mettre à jour seulement les données importées, pas les statuts/commentaires
                this.data.pieces[existingIndex] = {
                    ...existingPiece,
                    reference: newPieceData.reference,
                    designation: newPieceData.designation,
                    quantite: newPieceData.quantite,
                    fournisseur: newPieceData.fournisseur,
                    delai: newPieceData.delai,
                    categorie: newPieceData.categorie,
                    otLie: newPieceData.otLie,
                    unite: newPieceData.unite,
                    prixUnitaire: newPieceData.prixUnitaire,
                    rawData: newPieceData.rawData
                    // Les champs de commandesMateriel dans processus sont conservés automatiquement
                };
                updatedCount++;
            } else {
                // Nouvelle pièce - l'ajouter
                newPieceData.id = `PIECE-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
                this.data.pieces.push(newPieceData);
                addedCount++;
            }
        });

        this.data.metadata.lastImportPieces = new Date().toISOString();
        this.saveToStorage();
        this.notifyUpdate('pieces');

        return { total: this.data.pieces.length, added: addedCount, updated: updatedCount };
    },

    // Importer les avis depuis Excel (fusion intelligente par numéro d'avis)
    importAvis(rows, mapping) {
        // Initialiser le tableau avis si nécessaire
        if (!this.data.avis) {
            this.data.avis = [];
        }

        // Créer une map des avis existants par numéro
        const existingMap = new Map();
        this.data.avis.forEach((avis, index) => {
            const key = (avis.numeroAvis || '').toString().trim().toLowerCase();
            if (key) existingMap.set(key, index);
        });

        let addedCount = 0;
        let updatedCount = 0;

        rows.forEach((row, index) => {
            const numeroAvis = (row[mapping.numeroAvis] || '').toString().trim();
            const key = numeroAvis.toLowerCase();

            const newAvisData = {
                numeroAvis: numeroAvis,
                description: row[mapping.description] || '',
                equipement: row[mapping.equipement] || '',
                priorite: row[mapping.priorite] || '',
                dateCreation: row[mapping.dateCreation] || '',
                typeAvis: row[mapping.typeAvis] || '',
                statut: row[mapping.statut] || '',
                localisation: row[mapping.localisation] || '',
                demandeur: row[mapping.demandeur] || '',
                rawData: row
            };

            if (key && existingMap.has(key)) {
                // L'avis existe déjà - mettre à jour les données brutes
                const existingIndex = existingMap.get(key);
                const existingAvis = this.data.avis[existingIndex];

                this.data.avis[existingIndex] = {
                    ...existingAvis,
                    ...newAvisData,
                    id: existingAvis.id
                    // Les champs de priorisation dans processus sont conservés automatiquement
                };
                updatedCount++;
            } else if (numeroAvis) {
                // Nouvel avis - l'ajouter
                newAvisData.id = `AVIS-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`;
                this.data.avis.push(newAvisData);
                addedCount++;
            }
        });

        this.data.metadata.lastImportAvis = new Date().toISOString();
        this.saveToStorage();
        this.notifyUpdate('avis');

        return { total: this.data.avis.length, added: addedCount, updated: updatedCount };
    },

    // Fusion des travaux (conserve commentaires et modifications)
    mergeTravaux(newTravaux) {
        const existingMap = new Map(this.data.travaux.map(t => [t.ot, t]));

        newTravaux.forEach(newT => {
            const existing = existingMap.get(newT.ot);
            if (existing) {
                // Mise à jour en conservant les données locales
                Object.assign(existing, {
                    ...newT,
                    id: existing.id,
                    preparation: existing.preparation,
                    execution: existing.execution
                });
            } else {
                this.data.travaux.push(newT);
            }
        });
    },

    // Obtenir tous les travaux
    getTravaux(filters = {}) {
        let result = [...this.data.travaux];

        if (filters.discipline) {
            result = result.filter(t => t.discipline === filters.discipline);
        }
        if (filters.statut) {
            result = result.filter(t => t.statut === filters.statut);
        }
        if (filters.priorite) {
            result = result.filter(t => t.priorite === filters.priorite);
        }
        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(t =>
                t.ot.toLowerCase().includes(s) ||
                t.description.toLowerCase().includes(s) ||
                t.equipement.toLowerCase().includes(s)
            );
        }

        return result;
    },

    // Obtenir un travail par ID ou OT
    getTravail(idOrOt) {
        return this.data.travaux.find(t => t.id === idOrOt || t.ot === idOrOt);
    },

    // Mettre à jour un travail
    updateTravail(idOrOt, updates) {
        const travail = this.getTravail(idOrOt);
        if (travail) {
            Object.assign(travail, updates);
            this.saveToStorage();
            this.notifyUpdate('travaux', travail);
            return true;
        }
        return false;
    },

    // === GESTION DE LA PRÉPARATION ===

    updatePreparation(otId, field, value) {
        const travail = this.getTravail(otId);
        if (travail) {
            travail.preparation[field] = value;
            this.saveToStorage();
            this.notifyUpdate('preparation', travail);
            return true;
        }
        return false;
    },

    getPreparationStats() {
        const total = this.data.travaux.length;
        if (total === 0) return { total: 0, pret: 0, enCours: 0, nonCommence: 0, pourcentage: 0 };

        let pret = 0, enCours = 0, nonCommence = 0;

        this.data.travaux.forEach(t => {
            const p = t.preparation;
            const checks = [p.materielCommande, p.permisSecurite, p.consignationPrevue, p.pieceJointe, p.gammeValidee];
            const done = checks.filter(Boolean).length;

            if (done === 5) pret++;
            else if (done > 0) enCours++;
            else nonCommence++;
        });

        return {
            total,
            pret,
            enCours,
            nonCommence,
            pourcentage: Math.round((pret / total) * 100)
        };
    },

    // === GESTION DE L'EXÉCUTION ===

    importExecution(rows, mapping) {
        rows.forEach(row => {
            const ot = row[mapping.ot];
            const travail = this.getTravail(ot);
            if (travail) {
                travail.execution = {
                    ...travail.execution,
                    dateDebut: row[mapping.dateDebut] || travail.execution.dateDebut,
                    dateFin: row[mapping.dateFin] || travail.execution.dateFin,
                    heuresReelles: parseFloat(row[mapping.heuresReelles]) || travail.execution.heuresReelles,
                    statutExec: row[mapping.statutExec] || travail.execution.statutExec
                };
            }
        });

        this.data.metadata.lastImportExecution = new Date().toISOString();
        this.saveToStorage();
        this.notifyUpdate('execution');
    },

    updateExecution(otId, field, value) {
        const travail = this.getTravail(otId);
        if (travail) {
            travail.execution[field] = value;
            this.saveToStorage();
            this.notifyUpdate('execution', travail);
            return true;
        }
        return false;
    },

    getExecutionStats() {
        const total = this.data.travaux.length;
        if (total === 0) return { total: 0, termine: 0, enCours: 0, nonDemarre: 0, pourcentage: 0 };

        let termine = 0, enCours = 0, nonDemarre = 0;

        this.data.travaux.forEach(t => {
            switch (t.execution.statutExec) {
                case 'Terminé': termine++; break;
                case 'En cours': enCours++; break;
                default: nonDemarre++;
            }
        });

        return {
            total,
            termine,
            enCours,
            nonDemarre,
            pourcentage: Math.round((termine / total) * 100),
            heuresEstimees: this.data.travaux.reduce((sum, t) => sum + t.estimationHeures, 0),
            heuresReelles: this.data.travaux.reduce((sum, t) => sum + t.execution.heuresReelles, 0)
        };
    },

    // === GESTION DES COMMENTAIRES ===

    addComment(otId, text, author = 'Utilisateur') {
        if (!this.data.comments[otId]) {
            this.data.comments[otId] = [];
        }

        const comment = {
            id: `COM-${Date.now()}`,
            text,
            author,
            date: new Date().toISOString(),
            type: 'general'
        };

        this.data.comments[otId].push(comment);
        this.saveToStorage();
        this.notifyUpdate('comments', { otId, comment });
        return comment;
    },

    getComments(otId) {
        return this.data.comments[otId] || [];
    },

    // === GESTION POST-MORTEM ===

    addPostMortemAction(action) {
        const newAction = {
            id: `PM-${Date.now()}`,
            ...action,
            dateCreation: new Date().toISOString(),
            statut: action.statut || 'Ouvert'
        };

        this.data.postmortem.push(newAction);
        this.saveToStorage();
        this.notifyUpdate('postmortem', newAction);
        return newAction;
    },

    getPostMortemActions(filters = {}) {
        let result = [...this.data.postmortem];

        if (filters.statut) {
            result = result.filter(a => a.statut === filters.statut);
        }
        if (filters.type) {
            result = result.filter(a => a.type === filters.type);
        }

        return result;
    },

    updatePostMortemAction(id, updates) {
        const action = this.data.postmortem.find(a => a.id === id);
        if (action) {
            Object.assign(action, updates);
            this.saveToStorage();
            this.notifyUpdate('postmortem', action);
            return true;
        }
        return false;
    },

    // === STATISTIQUES GLOBALES ===

    getGlobalStats() {
        const prepStats = this.getPreparationStats();
        const execStats = this.getExecutionStats();

        const disciplines = {};
        this.data.travaux.forEach(t => {
            if (!disciplines[t.discipline]) {
                disciplines[t.discipline] = { total: 0, termine: 0 };
            }
            disciplines[t.discipline].total++;
            if (t.execution.statutExec === 'Terminé') {
                disciplines[t.discipline].termine++;
            }
        });

        return {
            preparation: prepStats,
            execution: execStats,
            parDiscipline: disciplines,
            totalCommentaires: Object.values(this.data.comments).reduce((sum, arr) => sum + arr.length, 0),
            actionsPostMortem: this.data.postmortem.length,
            actionsOuvertes: this.data.postmortem.filter(a => a.statut === 'Ouvert').length
        };
    },

    // === UTILITAIRES ===

    // Liste des disciplines uniques
    getDisciplines() {
        return [...new Set(this.data.travaux.map(t => t.discipline).filter(Boolean))];
    },

    // Liste des statuts uniques
    getStatuts() {
        return [...new Set(this.data.travaux.map(t => t.statut).filter(Boolean))];
    },

    // Liste des entreprises uniques
    getEntreprises() {
        return [...new Set(this.data.travaux.map(t => t.entreprise).filter(Boolean))];
    },

    // Export des données
    exportData() {
        return JSON.stringify(this.data, null, 2);
    },

    // Import complet
    importFullData(jsonString) {
        try {
            this.data = JSON.parse(jsonString);
            this.saveToStorage();
            this.notifyUpdate('all');
            return true;
        } catch (e) {
            console.error('Erreur import JSON:', e);
            return false;
        }
    },

    // Reset données
    resetData() {
        this.data = {
            travaux: [],
            execution: [],
            postmortem: [],
            comments: {},
            customFields: [],
            metadata: {
                lastImportTravaux: null,
                lastImportExecution: null,
                totalOT: 0
            }
        };
        this.saveToStorage();
        this.notifyUpdate('all');
    },

    // === GESTION DES CHAMPS PERSONNALISÉS ===

    // Obtenir les champs personnalisés
    getCustomFields() {
        return this.data.customFields || [];
    },

    // Mettre à jour un champ personnalisé d'un travail
    updateCustomField(otId, fieldId, value) {
        const travail = this.getTravail(otId);
        if (travail) {
            if (!travail.customData) {
                travail.customData = {};
            }
            travail.customData[fieldId] = value;
            this.saveToStorage();
            this.notifyUpdate('customField', { otId, fieldId, value });
            return true;
        }
        return false;
    },

    // Obtenir la valeur d'un champ personnalisé
    getCustomFieldValue(otId, fieldId) {
        const travail = this.getTravail(otId);
        if (travail && travail.customData) {
            return travail.customData[fieldId] || '';
        }
        return '';
    },

    // === SYSTÈME DE NOTIFICATION ===

    listeners: {},

    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    notifyUpdate(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
        if (this.listeners['all']) {
            this.listeners['all'].forEach(cb => cb(event, data));
        }
    }
};

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => DataManager.init());
