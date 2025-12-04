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
    isOnline: false,
    syncInProgress: false,

    // Initialisation Firebase
    async init() {
        try {
            // Initialiser Firebase
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();

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
    // Données séparées en plusieurs documents (limite 1MB par doc)
    async syncToCloud() {
        if (this.syncInProgress || !this.db) return;

        this.syncInProgress = true;
        try {
            // Document metadata (léger)
            const metadataRef = this.db.collection('arretAnnuel').doc('metadata');
            await metadataRef.set({
                metadata: this.cleanForFirestore(DataManager.data.metadata || {}),
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

            // Les travaux sont trop gros, on ne les sync pas automatiquement
            // Ils restent en localStorage uniquement

            console.log('Données synchronisées vers Firebase');
            this.showToast('Données synchronisées', 'success');
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

            const metaData = metadataDoc.exists ? metadataDoc.data() : {};
            const piecesData = piecesDoc.exists ? piecesDoc.data() : {};

            console.log('Données chargées depuis Firebase');
            return {
                // Les travaux restent en local (trop gros pour Firebase)
                travaux: [],
                execution: [],
                postmortem: metaData.postmortem || [],
                comments: metaData.comments || {},
                customFields: metaData.customFields || [],
                pieces: piecesData.pieces || [],
                avis: metaData.avis || [],
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

    // Écouter les changements en temps réel
    subscribeToChanges(callback) {
        if (!this.db) return null;

        return this.db.collection('arretAnnuel').doc('mainData')
            .onSnapshot(doc => {
                if (doc.exists) {
                    callback(doc.data());
                }
            }, error => {
                console.error('Erreur écoute temps réel:', error);
            });
    },

    // === OPÉRATIONS SPÉCIFIQUES ===

    // Sauvegarder un travail spécifique
    async saveTravail(travail) {
        if (!this.db) return false;

        try {
            await this.db.collection('travaux').doc(travail.id).set(travail);
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde travail:', error);
            return false;
        }
    },

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
    }
};

// Initialiser Firebase quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseManager.init();
});
