/**
 * Module Firebase - Arrêt Annuel
 * Gère la connexion et synchronisation avec Firebase Firestore
 */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBI6F9YaMkxjIOzMpyjz3osrTklAMpIBZE",
    authDomain: "caths-eyes.firebaseapp.com",
    projectId: "caths-eyes",
    storageBucket: "caths-eyes.firebasestorage.app",
    messagingSenderId: "659756322626",
    appId: "1:659756322626:web:4163988910805ef7ec82db"
};

// Module Firebase Manager
const FirebaseManager = {
    db: null,
    storage: null,
    isOnline: false,
    syncInProgress: false,

    // Initialisation Firebase
    async init() {
        try {
            // Initialiser Firebase
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.storage = firebase.storage();

            // Activer la persistance hors ligne
            await this.db.enablePersistence({ synchronizeTabs: true }).catch(err => {
                if (err.code === 'failed-precondition') {
                    console.warn('Persistance impossible: plusieurs onglets ouverts');
                } else if (err.code === 'unimplemented') {
                    console.warn('Persistance non supportée par ce navigateur');
                }
            });

            this.isOnline = true;
            console.log('Firebase initialisé avec succès');
            this.updateConnectionStatus(true);

            // Écouter les changements de connexion
            window.addEventListener('online', () => this.handleConnectionChange(true));
            window.addEventListener('offline', () => this.handleConnectionChange(false));

            return true;
        } catch (error) {
            console.error('Erreur initialisation Firebase:', error);
            this.updateConnectionStatus(false);
            return false;
        }
    },

    // Gérer les changements de connexion
    handleConnectionChange(online) {
        this.isOnline = online;
        this.updateConnectionStatus(online);
        if (online) {
            console.log('Connexion rétablie - synchronisation...');
            this.syncToCloud();
        }
    },

    // Mettre à jour l'indicateur de statut
    updateConnectionStatus(online) {
        const statusEl = document.getElementById('dataStatus');
        if (statusEl) {
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.querySelector('span:last-child');
            if (dot) {
                dot.className = 'status-dot ' + (online ? 'online' : 'offline');
            }
            if (text) {
                text.textContent = online ? 'Connecté' : 'Hors ligne';
            }
        }
    },

    // === OPÉRATIONS FIRESTORE ===

    // Nettoyer les données pour Firestore (remplacer undefined par null)
    // Exclut imageData (base64 trop volumineux) - utilise imageURL à la place
    cleanForFirestore(obj) {
        if (obj === undefined) return null;
        if (obj === null) return null;
        if (Array.isArray(obj)) {
            return obj.map(item => this.cleanForFirestore(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            const cleaned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // Exclure imageData (base64 volumineux) - on utilise imageURL (Firebase Storage)
                    if (key === 'imageData') {
                        continue;
                    }
                    const value = obj[key];
                    if (value === undefined) {
                        cleaned[key] = null;
                    } else {
                        cleaned[key] = this.cleanForFirestore(value);
                    }
                }
            }
            return cleaned;
        }
        return obj;
    },

    // Nettoyer un travail pour Firebase (enlever rawData volumineux)
    cleanTravailForFirebase(travail) {
        const { rawData, ...cleanTravail } = travail;
        return this.cleanForFirestore(cleanTravail);
    },

    // Nettoyer une pièce pour Firebase (enlever rawData volumineux)
    cleanPieceForFirebase(piece) {
        const { rawData, ...cleanPiece } = piece;
        return this.cleanForFirestore(cleanPiece);
    },

    // Sauvegarder toutes les données vers Firebase
    // Travaux et Pièces stockés chacun dans un document unique
    async syncToCloud() {
        if (this.syncInProgress || !this.db) return;

        this.syncInProgress = true;
        try {
            // Document metadata (léger) - inclut processus pour la date d'arrêt
            const metadataRef = this.db.collection('arretAnnuel').doc('metadata');
            await metadataRef.set({
                metadata: this.cleanForFirestore(DataManager.data.metadata || {}),
                processus: this.cleanForFirestore(DataManager.data.processus || null),
                postmortem: this.cleanForFirestore(DataManager.data.postmortem || []),
                comments: this.cleanForFirestore(DataManager.data.comments || {}),
                customFields: this.cleanForFirestore(DataManager.data.customFields || []),
                avis: this.cleanForFirestore(DataManager.data.avis || []),
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Document pièces (sans rawData)
            const piecesRef = this.db.collection('arretAnnuel').doc('pieces');
            const cleanPieces = (DataManager.data.pieces || []).map(p => this.cleanPieceForFirebase(p));
            await piecesRef.set({
                pieces: cleanPieces,
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Document travaux (sans rawData) - même structure que pièces
            const travauxRef = this.db.collection('arretAnnuel').doc('travaux');
            const cleanTravaux = (DataManager.data.travaux || []).map(t => this.cleanTravailForFirebase(t));
            await travauxRef.set({
                travaux: cleanTravaux,
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            });

            console.log('Données synchronisées vers Firebase:', cleanTravaux.length, 'travaux,', cleanPieces.length, 'pièces');
            this.showToast('Synchronisé ☁️', 'success');
            return true;
        } catch (error) {
            console.error('Erreur sync vers cloud:', error);
            this.showToast('Erreur de synchronisation', 'error');
            return false;
        } finally {
            this.syncInProgress = false;
        }
    },

    // Charger les données depuis Firebase
    async loadFromCloud() {
        if (!this.db) return null;

        try {
            // Charger le document metadata
            const metadataDoc = await this.db.collection('arretAnnuel').doc('metadata').get();
            // Charger le document des pièces
            const piecesDoc = await this.db.collection('arretAnnuel').doc('pieces').get();
            // Charger le document des travaux
            const travauxDoc = await this.db.collection('arretAnnuel').doc('travaux').get();

            const metaData = metadataDoc.exists ? metadataDoc.data() : {};
            const piecesData = piecesDoc.exists ? piecesDoc.data() : {};
            const travauxData = travauxDoc.exists ? travauxDoc.data() : {};

            console.log('Données chargées depuis Firebase:', (travauxData.travaux || []).length, 'travaux,',
                (piecesData.pieces || []).length, 'pièces, processus:', metaData.processus ? 'oui' : 'non');

            return {
                travaux: travauxData.travaux || [],
                execution: [],
                postmortem: metaData.postmortem || [],
                comments: metaData.comments || {},
                customFields: metaData.customFields || [],
                pieces: piecesData.pieces || [],
                avis: metaData.avis || [],
                processus: metaData.processus || null,
                metadata: metaData.metadata || {
                    lastImportTravaux: null,
                    lastImportExecution: null,
                    totalOT: 0,
                    arretName: '',
                    arretDateDebut: null,
                    arretDateFin: null
                }
            };
        } catch (error) {
            console.error('Erreur chargement depuis cloud:', error);
            return null;
        }
    },

    // Écouter les changements en temps réel (pièces)
    subscribeToChanges(callback) {
        if (!this.db) return null;

        return this.db.collection('arretAnnuel').doc('pieces')
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, error => {
                console.error('Erreur écoute temps réel pièces:', error);
            });
    },

    // Écouter les changements en temps réel (travaux)
    subscribeToTravauxChanges(callback) {
        if (!this.db) return null;

        return this.db.collection('arretAnnuel').doc('travaux')
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, error => {
                console.error('Erreur écoute temps réel travaux:', error);
            });
    },

    // === OPÉRATIONS SPÉCIFIQUES ===

    // Sauvegarder les processus
    async saveProcessus(processusData) {
        if (!this.db) return false;

        try {
            await this.db.collection('arretAnnuel').doc('processus').set({
                data: processusData,
                lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde processus:', error);
            return false;
        }
    },

    // Charger les processus
    async loadProcessus() {
        if (!this.db) return null;

        try {
            const doc = await this.db.collection('arretAnnuel').doc('processus').get();
            if (doc.exists) {
                return doc.data().data;
            }
            return null;
        } catch (error) {
            console.error('Erreur chargement processus:', error);
            return null;
        }
    },

    // Afficher une notification toast
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-fade');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // === FIREBASE STORAGE - Images du plan ===

    // Uploader l'image du plan vers Firebase Storage
    async uploadPlanImage(base64Data) {
        if (!this.storage) {
            console.error('Firebase Storage non initialisé');
            return null;
        }

        try {
            // Convertir base64 en blob
            const response = await fetch(base64Data);
            const blob = await response.blob();

            // Référence dans Storage
            const storageRef = this.storage.ref();
            const planRef = storageRef.child('plans/plan-usine.jpg');

            // Upload
            console.log('Upload du plan vers Firebase Storage...');
            const snapshot = await planRef.put(blob, {
                contentType: 'image/jpeg',
                cacheControl: 'public, max-age=31536000'
            });

            // Obtenir l'URL de téléchargement
            const downloadURL = await snapshot.ref.getDownloadURL();
            console.log('Plan uploadé avec succès:', downloadURL);

            this.showToast('Plan synchronisé ☁️', 'success');
            return downloadURL;
        } catch (error) {
            console.error('Erreur upload plan:', error);
            this.showToast('Erreur upload du plan', 'error');
            return null;
        }
    },

    // Télécharger l'URL de l'image du plan depuis Firebase Storage
    async getPlanImageURL() {
        if (!this.storage) {
            return null;
        }

        try {
            const storageRef = this.storage.ref();
            const planRef = storageRef.child('plans/plan-usine.jpg');
            const url = await planRef.getDownloadURL();
            console.log('URL du plan récupérée:', url);
            return url;
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                console.log('Aucun plan trouvé dans Firebase Storage');
                return null;
            }
            console.error('Erreur récupération plan:', error);
            return null;
        }
    },

    // Supprimer l'image du plan de Firebase Storage
    async deletePlanImage() {
        if (!this.storage) {
            return false;
        }

        try {
            const storageRef = this.storage.ref();
            const planRef = storageRef.child('plans/plan-usine.jpg');
            await planRef.delete();
            console.log('Plan supprimé de Firebase Storage');
            return true;
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                return true; // Déjà supprimé
            }
            console.error('Erreur suppression plan:', error);
            return false;
        }
    }
};

// === MODULE KITTING SYNC ===
// Écoute les kittings depuis l'app Kitting Aciérie et met à jour les pièces/statuts

const KittingSync = {
    db: null, // Base de données Kitting Aciérie
    unsubscribe: null,
    kittings: [], // Cache des kittings
    STORAGE_KEY: 'kitting_last_seen_count',

    // Configuration Firebase Kitting Aciérie
    kittingFirebaseConfig: {
        apiKey: "AIzaSyA4bfAKvmgkw1DyTZSvcudndX7z7hUJWZU",
        authDomain: "kitting-acierie.firebaseapp.com",
        projectId: "kitting-acierie",
        storageBucket: "kitting-acierie.firebasestorage.app",
        messagingSenderId: "22aborede098",
        appId: "1:220598741098:web:kitting"
    },

    // Initialiser la connexion à Kitting Firebase
    async init() {
        try {
            // Initialiser la seconde app Firebase pour Kitting
            const kittingApp = firebase.initializeApp(this.kittingFirebaseConfig, 'kitting-acierie');
            this.db = kittingApp.firestore();

            // Écouter les changements sur la collection kittings
            this.subscribeToKittings();

            console.log('KittingSync initialisé avec succès');
            return true;
        } catch (error) {
            // Si l'app existe déjà, la récupérer
            if (error.code === 'app/duplicate-app') {
                const kittingApp = firebase.app('kitting-acierie');
                this.db = kittingApp.firestore();
                this.subscribeToKittings();
                console.log('KittingSync reconnecté');
                return true;
            }
            console.error('Erreur initialisation KittingSync:', error);
            return false;
        }
    },

    // Écouter les changements sur la collection kittings
    subscribeToKittings() {
        if (!this.db) return;

        this.unsubscribe = this.db.collection('kittings')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                this.kittings = [];
                snapshot.forEach(doc => {
                    this.kittings.push({ id: doc.id, ...doc.data() });
                });

                console.log('Kittings mis à jour:', this.kittings.length);

                // Mettre à jour les pièces avec le statut kitting
                this.updatePiecesKittingStatus();

                // Mettre à jour le statut PL7.0
                this.updatePL7Status();

                // Notifier l'UI pour rafraîchir
                if (typeof DataManager !== 'undefined') {
                    DataManager.notifyUpdate('kittings');
                }
            }, error => {
                console.error('Erreur écoute kittings:', error);
            });

        console.log('Écoute kittings activée');
    },

    // Normaliser un numéro OT pour comparaison
    normalizeOT(ot) {
        if (!ot) return '';
        return ot.toString().trim().toLowerCase()
            .replace(/[\s\-_]/g, '')
            .replace(/^0+/, '');
    },

    // Trouver le kitting associé à une pièce (par OT)
    getKittingForPiece(piece) {
        const pieceOT = this.normalizeOT(piece.otLie || piece.ot);
        if (!pieceOT) return null;

        return this.kittings.find(k => {
            const kittingOT = this.normalizeOT(k.ordre);
            return kittingOT === pieceOT;
        });
    },

    // Vérifier si une pièce est dans un kitting et son statut
    getPieceKittingStatus(piece) {
        const kitting = this.getKittingForPiece(piece);
        if (!kitting) {
            return { hasKitting: false, status: null, kitting: null };
        }

        // Chercher la pièce dans le kitting
        const pieceRef = (piece.reference || '').toLowerCase();
        const pieceDesign = (piece.designation || '').toLowerCase();

        const kittingPiece = kitting.pieces?.find(kp => {
            const kpName = (kp.name || '').toLowerCase();
            return kpName.includes(pieceRef) || kpName.includes(pieceDesign);
        });

        return {
            hasKitting: true,
            kittingStatus: kitting.status, // 'pret' ou 'incomplet'
            pieceReceived: kittingPiece?.received || false,
            kitting: kitting,
            location: kitting.location
        };
    },

    // Mettre à jour le statut kitting de toutes les pièces
    // OPTIMISATION: Met à jour en mémoire seulement, pas de sauvegarde automatique
    updatePiecesKittingStatus() {
        if (!DataManager?.data?.pieces) return;

        DataManager.data.pieces.forEach(piece => {
            const status = this.getPieceKittingStatus(piece);
            piece.hasKitting = status.hasKitting;
            piece.kittingStatus = status.kittingStatus;
            piece.pieceReceived = status.pieceReceived;
            piece.kittingLocation = status.location;
        });
        // Pas de sauvegarde automatique - sera fait lors de la prochaine action utilisateur
    },

    // Mettre à jour le statut de l'étape PL7.0 - Commande matériel
    updatePL7Status() {
        if (!this.kittings.length || typeof ProcessusArret === 'undefined') return;

        const totalKittings = this.kittings.length;
        const kittingsPrets = this.kittings.filter(k => k.status === 'pret').length;

        // Calculer le pourcentage
        const pourcentage = totalKittings > 0 ? Math.round((kittingsPrets / totalKittings) * 100) : 0;

        // Déterminer le statut
        let statut = 'non_demarre';
        if (pourcentage === 100) {
            statut = 'termine';
        } else if (pourcentage > 0) {
            statut = 'en_cours';
        }

        // Mettre à jour PL7.0
        const currentState = ProcessusArret.getEtatEtape('PL7.0');
        if (currentState && (currentState.pourcentage !== pourcentage || currentState.statut !== statut)) {
            ProcessusArret.updateEtatEtape('PL7.0', {
                statut: statut,
                pourcentage: pourcentage,
                commentaires: currentState.commentaires || []
            });

            console.log(`PL7.0 mis à jour: ${pourcentage}% (${kittingsPrets}/${totalKittings} kittings prêts)`);
        }
    },

    // Obtenir les statistiques des kittings
    getStats() {
        const total = this.kittings.length;
        const prets = this.kittings.filter(k => k.status === 'pret').length;
        const incomplets = total - prets;

        return {
            total,
            prets,
            incomplets,
            pourcentage: total > 0 ? Math.round((prets / total) * 100) : 0
        };
    },

    // Obtenir tous les kittings
    getKittings() {
        return this.kittings;
    },

    // Obtenir un kitting par OT
    getKittingByOT(ot) {
        const normalizedOT = this.normalizeOT(ot);
        return this.kittings.find(k => this.normalizeOT(k.ordre) === normalizedOT);
    },

    // Badge notifications (ancien comportement conservé)
    showBadge(count) {
        const badge = document.getElementById('kittingBadge');
        if (badge) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        }
    },

    hideBadge() {
        const badge = document.getElementById('kittingBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    },

    markAsSeen() {
        const currentCount = this.kittings.length;
        localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
        this.hideBadge();
    },

    // Arrêter l'écoute
    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
};

// Alias pour compatibilité
const KittingNotifications = KittingSync;

// Initialiser Firebase et les notifications quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseManager.init();
    // Initialiser les notifications après Firebase
    setTimeout(() => KittingNotifications.init(), 1000);
});
