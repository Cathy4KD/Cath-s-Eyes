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
        notesJour: {},         // Notes journalières {date: {note: '', photos: []}}
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
                    notesJour: loadedData.notesJour || {},
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
    // Firebase est TOUJOURS la source de vérité
    async loadFromFirebase() {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            try {
                const cloudData = await FirebaseManager.loadFromCloud();
                if (cloudData) {
                    // Firebase est la source de vérité pour TOUTES les données
                    if (cloudData.travaux && cloudData.travaux.length > 0) {
                        this.data.travaux = cloudData.travaux;
                    }

                    if (cloudData.pieces && cloudData.pieces.length > 0) {
                        this.data.pieces = cloudData.pieces;
                    }

                    if (cloudData.avis && cloudData.avis.length > 0) {
                        this.data.avis = cloudData.avis;
                    }

                    if (cloudData.postmortem) {
                        this.data.postmortem = cloudData.postmortem;
                    }

                    if (cloudData.comments) {
                        this.data.comments = cloudData.comments;
                    }

                    if (cloudData.customFields) {
                        this.data.customFields = cloudData.customFields;
                    }

                    // IMPORTANT: Firebase est TOUJOURS la source de vérité pour processus
                    if (cloudData.processus) {
                        this.data.processus = cloudData.processus;
                    }

                    if (cloudData.metadata) {
                        this.data.metadata = { ...this.data.metadata, ...cloudData.metadata };
                    }

                    // Sauvegarder en local pour avoir une copie à jour
                    this.saveToLocalStorage();

                    console.log('Données Firebase chargées - Travaux:', this.data.travaux.length,
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
    saveToStorage(immediate = false) {
        this.saveToLocalStorage();

        // Sync Firebase automatique
        if (this._syncTimer) {
            clearTimeout(this._syncTimer);
        }

        if (immediate) {
            // Sync immédiate pour les données critiques
            this.syncToFirebase();
        } else {
            // Debounce de 1 seconde pour les modifications rapides
            this._syncTimer = setTimeout(() => {
                this.syncToFirebase();
            }, 1000);
        }
    },

    // Synchroniser vers Firebase
    syncToFirebase: async function() {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            await FirebaseManager.syncToCloud();
        }
    },

    // Forcer la synchronisation (appelé par le bouton sync)
    async forceSyncFirebase() {
        const statusEl = document.getElementById('dataStatus');
        const syncIcon = statusEl?.querySelector('.sync-icon');

        // Animation de rotation
        if (syncIcon) {
            syncIcon.style.animation = 'spin 1s linear infinite';
        }

        try {
            // Sauvegarder en local d'abord
            this.saveToLocalStorage();

            // Sync vers Firebase
            await this.syncToFirebase();

            // Notification de succès
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Synchronisation réussie!', 'success');
            }
        } catch (e) {
            console.error('Erreur sync forcée:', e);
            if (typeof App !== 'undefined' && App.showToast) {
                App.showToast('Erreur de synchronisation', 'error');
            }
        } finally {
            // Arrêter l'animation
            if (syncIcon) {
                syncIcon.style.animation = '';
            }
        }
    },

    // Afficher l'overlay de synchronisation
    showSyncOverlay() {
        // Créer l'overlay s'il n'existe pas
        let overlay = document.getElementById('syncOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'syncOverlay';
            overlay.innerHTML = `
                <div class="sync-overlay-content">
                    <div class="sync-spinner"></div>
                    <p>Synchronisation en cours...</p>
                    <small>Veuillez patienter</small>
                </div>
            `;
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
            `;
            const content = overlay.querySelector('.sync-overlay-content');
            content.style.cssText = `
                background: white;
                padding: 40px 60px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            `;
            const spinner = overlay.querySelector('.sync-spinner');
            spinner.style.cssText = `
                width: 50px;
                height: 50px;
                border: 4px solid #e2e8f0;
                border-top-color: #3b82f6;
                border-radius: 50%;
                margin: 0 auto 20px;
                animation: spin 1s linear infinite;
            `;
            const p = overlay.querySelector('p');
            p.style.cssText = `
                font-size: 1.2rem;
                font-weight: 600;
                color: #1e293b;
                margin: 0 0 5px 0;
            `;
            const small = overlay.querySelector('small');
            small.style.cssText = `
                color: #64748b;
                font-size: 0.9rem;
            `;
            document.body.appendChild(overlay);
        }
        overlay.style.display = 'flex';
    },

    // Masquer l'overlay de synchronisation
    hideSyncOverlay() {
        const overlay = document.getElementById('syncOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },

    // Configurer la synchronisation Firebase
    setupFirebaseSync() {
        // Sync automatique quand l'utilisateur quitte la page
        window.addEventListener('beforeunload', (e) => {
            // Afficher l'overlay de synchronisation
            this.showSyncOverlay();

            // Annuler le timer de debounce et forcer la sync immédiate
            if (this._syncTimer) {
                clearTimeout(this._syncTimer);
            }
            // Utiliser sendBeacon pour une sync fiable à la fermeture
            this.syncBeforeUnload();

            // Message standard du navigateur (pour donner le temps à la sync)
            e.returnValue = 'Synchronisation en cours...';
            return e.returnValue;
        });

        // Sync quand l'utilisateur change d'onglet ou minimise
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // L'utilisateur quitte l'onglet - sync immédiate
                this.syncToFirebase();
                console.log('Sync Firebase (onglet caché)');
            }
        });

        // Sync quand l'utilisateur perd le focus sur la page
        window.addEventListener('blur', () => {
            this.syncToFirebase();
        });

        console.log('Firebase sync configuré (auto-sync à la fermeture)');
    },

    // Synchronisation avant fermeture (utilise sendBeacon si possible)
    syncBeforeUnload() {
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            // Sauvegarder en local d'abord (synchrone)
            this.saveToLocalStorage();
            // Lancer la sync Firebase (peut ne pas finir mais on essaie)
            FirebaseManager.syncToCloud();
            console.log('Sync Firebase (fermeture page)');
        }
    },

    // Auto-save localStorage + sync périodique Firebase
    setupAutoSave() {
        // Sauvegarde locale toutes les 30 secondes
        setInterval(() => this.saveToLocalStorage(), 30000);

        // Sync Firebase toutes les 2 minutes (backup)
        setInterval(() => {
            this.syncToFirebase();
            console.log('Sync Firebase périodique');
        }, 120000);
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

        // Sync Firebase immédiate après import
        this.syncToFirebase();

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

        // Sync Firebase immédiate après import
        this.syncToFirebase();

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

        // Sync Firebase immédiate après import
        this.syncToFirebase();

        return { total: this.data.avis.length, added: addedCount, updated: updatedCount };
    },

    // Créer une clé unique pour un travail basée sur OT + Description
    createTravailKey(ot, description) {
        const otNorm = (ot || '').toString().trim().toLowerCase();
        const descNorm = (description || '').toString().trim().toLowerCase();
        return `${otNorm}|||${descNorm}`;
    },

    // Fusion des travaux (conserve commentaires et modifications)
    // Clé unique = OT + Description
    // Supprime les travaux qui n'existent plus dans le nouveau fichier
    mergeTravaux(newTravaux) {
        const existingMap = new Map();
        this.data.travaux.forEach(t => {
            const key = this.createTravailKey(t.ot, t.description);
            existingMap.set(key, t);
        });

        // Créer un set des clés des nouveaux travaux
        const newTravauxKeys = new Set();
        newTravaux.forEach(newT => {
            const key = this.createTravailKey(newT.ot, newT.description);
            newTravauxKeys.add(key);
        });

        // Stats pour le résumé
        let added = 0, updated = 0, removed = 0;

        // Traiter les nouveaux travaux
        newTravaux.forEach(newT => {
            const key = this.createTravailKey(newT.ot, newT.description);
            const existing = existingMap.get(key);
            if (existing) {
                // Mise à jour en conservant les données locales (commentaires, statuts, etc.)
                Object.assign(existing, {
                    ...newT,
                    id: existing.id,
                    preparation: existing.preparation,
                    execution: existing.execution,
                    commentaire: existing.commentaire // Conserver le commentaire
                });
                updated++;
            } else {
                this.data.travaux.push(newT);
                existingMap.set(key, newT);
                added++;
            }
        });

        // Supprimer les travaux qui n'existent plus dans le nouveau fichier
        const travauxToKeep = this.data.travaux.filter(t => {
            const key = this.createTravailKey(t.ot, t.description);
            if (!newTravauxKeys.has(key)) {
                removed++;
                return false; // Supprimer
            }
            return true; // Garder
        });

        this.data.travaux = travauxToKeep;

        // Stocker les stats pour affichage
        this.lastMergeStats = { added, updated, removed };
        console.log(`Fusion travaux: ${added} ajoutés, ${updated} mis à jour, ${removed} supprimés`);

        return { added, updated, removed };
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

    // Obtenir un travail par ID, OT, ou clé OT+Description
    getTravail(idOrOtOrKey, description = null) {
        // Si description fournie, chercher par clé OT+Description
        if (description !== null) {
            const key = this.createTravailKey(idOrOtOrKey, description);
            return this.data.travaux.find(t => this.createTravailKey(t.ot, t.description) === key);
        }
        // Sinon chercher par ID ou OT (compatibilité)
        return this.data.travaux.find(t => t.id === idOrOtOrKey || t.ot === idOrOtOrKey);
    },

    // Obtenir un travail par clé unique (OT + Description)
    getTravailByKey(ot, description) {
        const key = this.createTravailKey(ot, description);
        return this.data.travaux.find(t => this.createTravailKey(t.ot, t.description) === key);
    },

    // === STATISTIQUES ===

    // Statistiques globales pour le Dashboard
    getGlobalStats() {
        const travaux = this.data.travaux || [];
        const total = travaux.length;

        // Stats préparation
        const prepTermine = travaux.filter(t => this.getPreparationScore(t) === 100).length;
        const prepEnCours = travaux.filter(t => {
            const score = this.getPreparationScore(t);
            return score > 0 && score < 100;
        }).length;

        // Stats exécution
        const execTermine = travaux.filter(t => t.execution?.statutExec === 'Terminé').length;
        const execEnCours = travaux.filter(t => t.execution?.statutExec === 'En cours').length;
        const execNonDemarre = total - execTermine - execEnCours;

        // Heures
        const heuresEstimees = travaux.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0);
        const heuresReelles = travaux.reduce((sum, t) => sum + (parseFloat(t.execution?.heuresReelles) || 0), 0);

        return {
            total,
            preparation: {
                termine: prepTermine,
                enCours: prepEnCours,
                pourcentage: total > 0 ? Math.round((prepTermine / total) * 100) : 0
            },
            execution: {
                termine: execTermine,
                enCours: execEnCours,
                nonDemarre: execNonDemarre,
                pourcentage: total > 0 ? Math.round((execTermine / total) * 100) : 0,
                heuresEstimees: heuresEstimees,
                heuresReelles: heuresReelles
            }
        };
    },

    // Statistiques préparation
    getPreparationStats() {
        const travaux = this.data.travaux || [];
        const total = travaux.length;

        const termine = travaux.filter(t => this.getPreparationScore(t) === 100).length;
        const enCours = travaux.filter(t => {
            const score = this.getPreparationScore(t);
            return score > 0 && score < 100;
        }).length;
        const aFaire = total - termine - enCours;

        return {
            total,
            termine,
            enCours,
            aFaire,
            pourcentage: total > 0 ? Math.round((termine / total) * 100) : 0
        };
    },

    // Statistiques exécution
    getExecutionStats() {
        const travaux = this.data.travaux || [];
        const total = travaux.length;

        const termine = travaux.filter(t => t.execution?.statutExec === 'Terminé').length;
        const enCours = travaux.filter(t => t.execution?.statutExec === 'En cours').length;
        const nonDemarre = total - termine - enCours;

        const heuresEstimees = travaux.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0);
        const heuresReelles = travaux.reduce((sum, t) => sum + (parseFloat(t.execution?.heuresReelles) || 0), 0);

        return {
            total,
            termine,
            enCours,
            nonDemarre,
            pourcentage: total > 0 ? Math.round((termine / total) * 100) : 0,
            heuresEstimees: heuresEstimees,
            heuresReelles: heuresReelles
        };
    },

    // Score de préparation d'un travail (0-100)
    getPreparationScore(travail) {
        if (!travail || !travail.preparation) return 0;
        const prep = travail.preparation;
        const checks = [
            prep.materielCommande,
            prep.permisSecurite,
            prep.consignationPrevue,
            prep.pieceJointe,
            prep.gammeValidee
        ];
        const done = checks.filter(Boolean).length;
        return Math.round((done / checks.length) * 100);
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

    // === GESTION DES NOTES JOURNALIÈRES ===

    getNoteJour(date) {
        const dateKey = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        return this.data.notesJour[dateKey] || { note: '', photos: [] };
    },

    saveNoteJour(date, note) {
        const dateKey = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        if (!this.data.notesJour[dateKey]) {
            this.data.notesJour[dateKey] = { note: '', photos: [] };
        }
        this.data.notesJour[dateKey].note = note;
        this.saveToStorage();
        this.notifyUpdate('notesJour', { date: dateKey });
    },

    addPhotoJour(date, photoData) {
        const dateKey = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        if (!this.data.notesJour[dateKey]) {
            this.data.notesJour[dateKey] = { note: '', photos: [] };
        }
        const photo = {
            id: `PHOTO-${Date.now()}`,
            data: photoData,
            timestamp: new Date().toISOString()
        };
        this.data.notesJour[dateKey].photos.push(photo);
        this.saveToStorage();
        this.notifyUpdate('notesJour', { date: dateKey, photo });
        return photo;
    },

    deletePhotoJour(date, photoId) {
        const dateKey = typeof date === 'string' ? date.split('T')[0] : date.toISOString().split('T')[0];
        if (this.data.notesJour[dateKey]) {
            this.data.notesJour[dateKey].photos = this.data.notesJour[dateKey].photos.filter(p => p.id !== photoId);
            this.saveToStorage();
            this.notifyUpdate('notesJour', { date: dateKey });
        }
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
