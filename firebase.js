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
    // Travaux stockés individuellement dans une collection (contourne limite 1MB/doc)
    async syncToCloud() {
        if (this.syncInProgress || !this.db) return;

        this.syncInProgress = true;
        try {
            // Log pour debug
            console.log('Sync Firebase - processus:', DataManager.data.processus);
            console.log('Sync Firebase - dateArret:', DataManager.data.processus?.dateArret);

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

            // Synchroniser les travaux (chaque travail = 1 document)
            await this.syncTravaux();

            console.log('Données synchronisées vers Firebase');
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

    // Synchroniser les travaux vers Firebase (collection séparée)
    async syncTravaux() {
        const travaux = DataManager.data.travaux || [];
        if (travaux.length === 0) return;

        const batch = this.db.batch();
        const travauxRef = this.db.collection('travaux');

        // Utiliser des batches pour les opérations en masse (max 500 par batch)
        for (let i = 0; i < travaux.length; i++) {
            const travail = travaux[i];
            const cleanTravail = this.cleanTravailForFirebase(travail);
            const docRef = travauxRef.doc(travail.id || `OT-${i}`);
            batch.set(docRef, cleanTravail);

            // Firebase limite à 500 opérations par batch
            if ((i + 1) % 500 === 0) {
                await batch.commit();
            }
        }

        // Commit le reste
        await batch.commit();
        console.log(`${travaux.length} travaux synchronisés vers Firebase`);
    },

    // Charger les travaux depuis Firebase
    async loadTravaux() {
        try {
            const snapshot = await this.db.collection('travaux').get();
            const travaux = [];
            snapshot.forEach(doc => {
                travaux.push({ id: doc.id, ...doc.data() });
            });
            return travaux;
        } catch (error) {
            console.error('Erreur chargement travaux:', error);
            return [];
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
            // Charger les travaux
            const travaux = await this.loadTravaux();

            const metaData = metadataDoc.exists ? metadataDoc.data() : {};
            const piecesData = piecesDoc.exists ? piecesDoc.data() : {};

            console.log('Données chargées depuis Firebase:', travaux.length, 'travaux,',
                (piecesData.pieces || []).length, 'pièces, processus:', metaData.processus ? 'oui' : 'non');
            return {
                travaux: travaux,
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

    // Écouter les changements en temps réel (pièces uniquement)
    subscribeToChanges(callback) {
        if (!this.db) return null;

        return this.db.collection('arretAnnuel').doc('pieces')
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

// === MODULE NOTIFICATIONS KITTING ===
// Écoute les notifications depuis l'app Kitting Aciérie

const KittingNotifications = {
    unsubscribe: null,
    STORAGE_KEY: 'kitting_last_seen_count',

    // Initialiser l'écoute des notifications
    init() {
        if (!FirebaseManager.db) {
            console.warn('Firebase non initialisé, notifications Kitting désactivées');
            return;
        }

        // Écouter les changements en temps réel sur le document de notifications
        this.unsubscribe = FirebaseManager.db.collection('kittingNotifications').doc('stats')
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    this.handleNotification(data);
                }
            }, error => {
                console.error('Erreur écoute notifications Kitting:', error);
            });

        console.log('Écoute notifications Kitting activée');
    },

    // Gérer une notification reçue
    handleNotification(data) {
        const currentCount = (data.totalKittings || 0) + (data.totalPieces || 0);
        const lastSeenCount = parseInt(localStorage.getItem(this.STORAGE_KEY) || '0');

        const newItems = currentCount - lastSeenCount;

        if (newItems > 0 && lastSeenCount > 0) {
            // Il y a de nouveaux éléments
            this.showBadge(newItems);
            // Optionnel: afficher un toast
            FirebaseManager.showToast(`${newItems} nouveau(x) élément(s) dans Kitting`, 'info');
        } else if (lastSeenCount === 0) {
            // Première visite, sauvegarder le count actuel sans notifier
            localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
        }
    },

    // Afficher le badge sur le bouton Kitting
    showBadge(count) {
        const badge = document.getElementById('kittingBadge');
        if (badge) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
        }
    },

    // Masquer le badge (appelé quand l'utilisateur clique sur Kitting)
    hideBadge() {
        const badge = document.getElementById('kittingBadge');
        if (badge) {
            badge.style.display = 'none';
        }
    },

    // Marquer comme vu (appelé quand on clique sur le lien Kitting)
    markAsSeen() {
        // Récupérer le count actuel depuis Firebase
        if (!FirebaseManager.db) return;

        FirebaseManager.db.collection('kittingNotifications').doc('stats').get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const currentCount = (data.totalKittings || 0) + (data.totalPieces || 0);
                    localStorage.setItem(this.STORAGE_KEY, currentCount.toString());
                    this.hideBadge();
                }
            })
            .catch(err => console.error('Erreur markAsSeen:', err));
    },

    // Arrêter l'écoute
    stop() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
};

// Initialiser Firebase et les notifications quand le DOM est prêt
document.addEventListener('DOMContentLoaded', async () => {
    await FirebaseManager.init();
    // Initialiser les notifications après Firebase
    setTimeout(() => KittingNotifications.init(), 1000);
});
