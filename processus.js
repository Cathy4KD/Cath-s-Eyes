/**
 * Module de gestion du Processus d'Arrêt
 * Basé sur le Shutdown Management Process Rio Tinto
 */

const ProcessusArret = {
    // Structure complète du processus
    structure: {
        definir: {
            id: 'definir',
            nom: 'Définir',
            description: 'Élaboration et fixation de l\'ampleur',
            periode: 'T-26 à T-18 semaines',
            couleur: '#3b82f6', // Bleu
            icone: '🎯',
            etapes: [
                {
                    id: 'D1.0',
                    nom: 'Définition de l\'arrêt',
                    description: 'Définir les objectifs, le périmètre et les dates clés de l\'arrêt annuel',
                    responsable: '',
                    documents: ['Document de définition', 'Périmètre de l\'arrêt'],
                    dependances: [],
                    dureeEstimee: 5,
                    critical: true
                },
                {
                    id: 'D2.0',
                    nom: 'Validation des plans d\'entretiens à long délais',
                    description: 'Réviser et valider les plans d\'entretien nécessitant des délais d\'approvisionnement longs',
                    responsable: '',
                    documents: ['Plans d\'entretien', 'Liste des pièces à long délai'],
                    dependances: ['D1.0'],
                    dureeEstimee: 7,
                    critical: true
                },
                {
                    id: 'D3.0',
                    nom: 'Nommer équipe de gestion d\'arrêt',
                    description: 'Constituer et officialiser l\'équipe de gestion de l\'arrêt avec les rôles et responsabilités',
                    responsable: '',
                    documents: ['Organigramme', 'Rôles et responsabilités'],
                    dependances: ['D1.0'],
                    dureeEstimee: 3,
                    critical: true
                },
                {
                    id: 'D4.0',
                    nom: 'DA et Soumissions',
                    description: 'Créer les demandes d\'achat et gérer les soumissions des entrepreneurs',
                    responsable: '',
                    documents: ['Demande d\'achat', 'Budget préliminaire', 'Soumissions'],
                    dependances: ['D2.0'],
                    dureeEstimee: 5,
                    critical: true
                },
                {
                    id: 'D5.0',
                    nom: 'Stratégie d\'approvisionnement',
                    description: 'Définir la stratégie d\'approvisionnement pour les pièces, matériaux et services requis',
                    responsable: '',
                    documents: ['Stratégie d\'approvisionnement', 'Liste des fournisseurs'],
                    dependances: ['D4.0'],
                    dureeEstimee: 7,
                    critical: true,
                    jalon: true
                }
            ]
        },
        planifier: {
            id: 'planifier',
            nom: 'Planifier',
            description: 'Programmation de l\'arrêt',
            periode: 'T-18 à T-12 semaines',
            couleur: '#8b5cf6', // Violet
            icone: '📋',
            etapes: [
                {
                    id: 'PL1.0',
                    nom: 'Liste des projets et capitalisation',
                    description: 'Identifier les projets d\'arrêt, les opportunités de capitalisation et les projets d\'ingénierie',
                    responsable: '',
                    documents: ['Liste des projets', 'Tableau de capitalisation', 'Projets ingénierie'],
                    dependances: ['D5.0'],
                    dureeEstimee: 5,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL2.0',
                    nom: 'Scope des travaux par secteurs',
                    description: 'Définir et répartir l\'ampleur des travaux par secteur opérationnel',
                    responsable: '',
                    documents: ['Scope par secteur', 'Répartition des travaux'],
                    dependances: ['PL1.0'],
                    dureeEstimee: 5,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL3.0',
                    nom: 'TPAA',
                    description: 'Travaux Préparatoires Avant Arrêt - Identifier et planifier les tâches réalisables avant l\'arrêt',
                    responsable: '',
                    documents: ['Liste TPAA', 'Planning TPAA'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL4.0',
                    nom: 'Implication du service incendie',
                    description: 'Coordonner les besoins avec le service incendie pour les permis et surveillances',
                    responsable: '',
                    documents: ['Plan d\'intervention', 'Permis de feu'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 3,
                    critical: true
                },
                {
                    id: 'PL5.0',
                    nom: 'VPO',
                    description: 'Vérification Pré-Opérationnelle - Planifier les inspections et vérifications avant remise en service',
                    responsable: '',
                    documents: ['Checklist VPO', 'Procédures de vérification'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL6.0',
                    nom: 'PSV',
                    description: 'Planification des Soupapes de Sécurité - Gestion des inspections et certifications des soupapes',
                    responsable: '',
                    documents: ['Liste PSV', 'Calendrier inspections'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL7.0',
                    nom: 'Commande matériel',
                    description: 'Gestion des commandes de matériel et suivi des approvisionnements',
                    responsable: '',
                    documents: ['Liste des commandes', 'Suivi livraisons'],
                    dependances: ['D5.0'],
                    dureeEstimee: 10,
                    critical: true,
                    jalon: true
                },
                {
                    id: 'PL8.0',
                    nom: 'Avis Priorisés',
                    description: 'Priorisation et planification des avis (notifications SAP) pour l\'arrêt annuel',
                    responsable: '',
                    documents: ['Liste avis priorisés', 'Matrice de priorisation'],
                    dependances: ['D2.0'],
                    dureeEstimee: 5,
                    critical: false,
                    lienTravaux: true
                },
                {
                    id: 'PL9.0',
                    nom: 'Travaux entrepreneur',
                    description: 'Planification et suivi des travaux confiés aux entrepreneurs externes',
                    responsable: '',
                    documents: ['Liste entrepreneurs', 'Contrats', 'Planification travaux'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 5,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL10.0',
                    nom: 'Verrouillage',
                    description: 'Planification des procédures de verrouillage/cadenassage (LOTO) pour les travaux',
                    responsable: '',
                    documents: ['Procédures LOTO', 'Liste équipements à verrouiller'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL11.0',
                    nom: 'Équipement de levage',
                    description: 'Planification des grues, nacelles et autres équipements de levage requis',
                    responsable: '',
                    documents: ['Liste équipements levage', 'Planning utilisation', 'Certifications'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: false,
                    lienTravaux: true
                },
                {
                    id: 'PL12.0',
                    nom: 'Espace clos',
                    description: 'Identification et planification des travaux en espace clos avec permis requis',
                    responsable: '',
                    documents: ['Liste espaces clos', 'Procédures entrée', 'Permis'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 3,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PL13.0',
                    nom: 'Arrêt et besoins Électriques',
                    description: 'Planification des coupures et travaux électriques majeurs',
                    responsable: '',
                    documents: ['Plan électrique', 'Séquence de coupure'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: true
                },
                {
                    id: 'PL14.0',
                    nom: 'Chemin critique',
                    description: 'Identification et suivi du chemin critique de l\'arrêt',
                    responsable: '',
                    documents: ['Diagramme chemin critique', 'Analyse des risques'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 3,
                    critical: true
                },
                {
                    id: 'PL15.0',
                    nom: 'SMED',
                    description: 'Application de la méthode SMED pour optimiser les temps d\'arrêt',
                    responsable: '',
                    documents: ['Analyse SMED', 'Plan d\'amélioration'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 4,
                    critical: false
                },
                {
                    id: 'PL16.0',
                    nom: 'GAZ CO',
                    description: 'Planification et surveillance des niveaux de monoxyde de carbone',
                    responsable: '',
                    documents: ['Plan de surveillance CO', 'Procédures d\'urgence'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 2,
                    critical: true
                },
                {
                    id: 'PL17.0',
                    nom: 'Plan d\'aménagement AA',
                    description: 'Planification de l\'emplacement des roulottes et installations temporaires',
                    responsable: '',
                    documents: ['Plan d\'aménagement', 'Carte du site'],
                    dependances: ['PL2.0'],
                    dureeEstimee: 2,
                    critical: false
                }
            ]
        },
        preparer: {
            id: 'preparer',
            nom: 'Préparer',
            description: 'Optimisation du calendrier et mobilisation',
            periode: 'T-4 à T-0 semaines',
            couleur: '#f59e0b', // Orange
            icone: '🔧',
            etapes: [
                {
                    id: 'PR1.0',
                    nom: 'Examen des lots de travaux avec les responsables',
                    description: 'Revue détaillée avec chaque responsable (T-3 semaines)',
                    responsable: '',
                    documents: ['Fiches de revue', 'Actions identifiées'],
                    dependances: ['PL7.0'],
                    dureeEstimee: 3,
                    critical: true,
                    jalon: true,
                    lienTravaux: true
                },
                {
                    id: 'PR2.0',
                    nom: 'Élaboration du calendrier détaillé définitif',
                    description: 'Livrer le calendrier final avec budget +/-5% (T-3 semaines)',
                    responsable: '',
                    documents: ['Calendrier définitif', 'Budget final'],
                    dependances: ['PR1.0'],
                    dureeEstimee: 3,
                    critical: true,
                    jalon: true
                },
                {
                    id: 'PR3.0',
                    nom: 'Examen du niveau de préparation de l\'arrêt',
                    description: 'Contrôle final de la direction sur l\'état de préparation (T-2 semaines)',
                    responsable: '',
                    documents: ['Checklist de préparation', 'Go/No-Go'],
                    dependances: ['PR2.0'],
                    dureeEstimee: 2,
                    critical: true,
                    jalon: true
                },
                {
                    id: 'PR4.0',
                    nom: 'Procéder à l\'arrêt?',
                    description: 'Décision finale de procéder ou reporter l\'arrêt',
                    responsable: '',
                    documents: ['Décision documentée'],
                    dependances: ['PR3.0'],
                    dureeEstimee: 1,
                    critical: true,
                    decision: true
                },
                {
                    id: 'PR5.0',
                    nom: 'Préparation des équipes de travail',
                    description: 'Briefings, formations et préparation des équipes',
                    responsable: '',
                    documents: ['Plan de formation', 'Attestations'],
                    dependances: ['PR4.0'],
                    dureeEstimee: 3,
                    critical: true
                },
                {
                    id: 'PR6.0',
                    nom: 'Préparation des isolations et des autorisations',
                    description: 'Préparer tous les permis et procédures d\'isolation',
                    responsable: '',
                    documents: ['Permis de travail', 'Procédures d\'isolation'],
                    dependances: ['PR4.0'],
                    dureeEstimee: 4,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PR7.0',
                    nom: 'Livraison du matériel, outillage et équipement',
                    description: 'Réception et vérification de tout le matériel nécessaire',
                    responsable: '',
                    documents: ['Bordereaux de livraison', 'Inventaire'],
                    dependances: ['PL7.0'],
                    dureeEstimee: 5,
                    critical: true,
                    lienTravaux: true
                },
                {
                    id: 'PR8.0',
                    nom: 'Exécution des tâches préalables à l\'arrêt',
                    description: 'Réaliser les travaux pouvant être faits avant l\'arrêt',
                    responsable: '',
                    documents: ['Liste tâches préalables', 'Rapports d\'exécution'],
                    dependances: ['PR5.0', 'PR7.0'],
                    dureeEstimee: 5,
                    critical: false,
                    lienTravaux: true
                },
                {
                    id: 'PR9.0',
                    nom: 'Cognibox',
                    description: 'Validation des accès et conformité des entrepreneurs via Cognibox',
                    responsable: '',
                    documents: ['Liste entrepreneurs validés', 'Rapports Cognibox'],
                    dependances: ['PR1.0'],
                    dureeEstimee: 3,
                    critical: true
                },
                {
                    id: 'PR10.0',
                    nom: 'Emplacement des poches',
                    description: 'Planification et assignation des emplacements pour les poches de coulée',
                    responsable: '',
                    documents: ['Plan des emplacements', 'Liste des poches'],
                    dependances: ['PR2.0'],
                    dureeEstimee: 2,
                    critical: false
                }
            ]
        }
    },

    // Données d'état des étapes (sera sauvegardé dans DataManager)
    getEtatInitial() {
        const etat = {};
        Object.values(this.structure).forEach(phase => {
            phase.etapes.forEach(etape => {
                etat[etape.id] = {
                    statut: 'non_demarre', // non_demarre, en_cours, termine, bloque
                    pourcentage: 0,
                    dateDebut: null,
                    dateFin: null,
                    datePrevue: null,
                    responsable: etape.responsable || '',
                    commentaires: [],
                    documents: [],
                    travauxLies: [], // IDs des travaux liés
                    risques: [],
                    lastUpdate: null
                };
            });
        });
        return etat;
    },

    // Initialiser les données de processus dans DataManager
    init() {
        if (!DataManager.data.processus) {
            DataManager.data.processus = {
                etatEtapes: this.getEtatInitial(),
                dateArret: null, // Date T-0
                metadata: {
                    lastUpdate: null,
                    version: '1.0'
                }
            };
            DataManager.saveToStorage();
        }
    },

    // Obtenir l'état d'une étape
    getEtatEtape(etapeId) {
        this.init();
        return DataManager.data.processus.etatEtapes[etapeId] || null;
    },

    // Mettre à jour l'état d'une étape
    updateEtatEtape(etapeId, updates) {
        this.init();
        if (DataManager.data.processus.etatEtapes[etapeId]) {
            Object.assign(DataManager.data.processus.etatEtapes[etapeId], updates, {
                lastUpdate: new Date().toISOString()
            });
            DataManager.saveToStorage();
            DataManager.notifyUpdate('processus', { etapeId, updates });
            return true;
        }
        return false;
    },

    // Mettre à jour le statut d'une étape (pourcentage automatique selon statut)
    updateStatut(etapeId, statut) {
        // Pourcentages automatiques selon le statut
        const pourcentageAuto = {
            'non_demarre': 0,
            'en_cours': 50,
            'termine': 100,
            'bloque': 25
        };

        const updates = {
            statut,
            pourcentage: pourcentageAuto[statut] ?? 0
        };

        if (statut === 'en_cours' && !this.getEtatEtape(etapeId).dateDebut) {
            updates.dateDebut = new Date().toISOString();
        }
        if (statut === 'termine') {
            updates.dateFin = new Date().toISOString();
        }

        return this.updateEtatEtape(etapeId, updates);
    },

    // Ajouter un commentaire à une étape
    addCommentaire(etapeId, texte, auteur = 'Utilisateur') {
        const etat = this.getEtatEtape(etapeId);
        if (etat) {
            etat.commentaires.push({
                id: `COM-${Date.now()}`,
                texte,
                auteur,
                date: new Date().toISOString()
            });
            DataManager.saveToStorage();
            return true;
        }
        return false;
    },

    // Lier des travaux à une étape
    lierTravaux(etapeId, travauxIds) {
        const etat = this.getEtatEtape(etapeId);
        if (etat) {
            etat.travauxLies = [...new Set([...etat.travauxLies, ...travauxIds])];
            DataManager.saveToStorage();
            return true;
        }
        return false;
    },

    // Obtenir les travaux liés à une étape
    getTravauxLies(etapeId) {
        const etat = this.getEtatEtape(etapeId);
        if (etat && etat.travauxLies.length > 0) {
            return etat.travauxLies.map(id => DataManager.getTravail(id)).filter(Boolean);
        }
        return [];
    },

    // Calculer les statistiques d'une phase
    getStatsPhase(phaseId) {
        const phase = this.structure[phaseId];
        if (!phase) return null;

        let total = phase.etapes.length;
        let terminees = 0;
        let enCours = 0;
        let bloquees = 0;
        let pourcentageTotal = 0;

        phase.etapes.forEach(etape => {
            const etat = this.getEtatEtape(etape.id);
            if (etat) {
                pourcentageTotal += etat.pourcentage;
                if (etat.statut === 'termine') terminees++;
                else if (etat.statut === 'en_cours') enCours++;
                else if (etat.statut === 'bloque') bloquees++;
            }
        });

        return {
            total,
            terminees,
            enCours,
            bloquees,
            nonDemarrees: total - terminees - enCours - bloquees,
            pourcentage: Math.round(pourcentageTotal / total)
        };
    },

    // Calculer les statistiques globales
    getStatsGlobales() {
        const phases = ['definir', 'planifier', 'preparer'];
        let totalEtapes = 0;
        let terminees = 0;
        let enCours = 0;
        let bloquees = 0;
        let pourcentageTotal = 0;

        phases.forEach(phaseId => {
            const stats = this.getStatsPhase(phaseId);
            if (stats) {
                totalEtapes += stats.total;
                terminees += stats.terminees;
                enCours += stats.enCours;
                bloquees += stats.bloquees;
                pourcentageTotal += stats.pourcentage * stats.total;
            }
        });

        return {
            totalEtapes,
            terminees,
            enCours,
            bloquees,
            nonDemarrees: totalEtapes - terminees - enCours - bloquees,
            pourcentage: totalEtapes > 0 ? Math.round(pourcentageTotal / totalEtapes) : 0
        };
    },

    // Obtenir les prochaines étapes à faire
    getProchainEtapes(limit = 5) {
        const etapes = [];

        Object.values(this.structure).forEach(phase => {
            phase.etapes.forEach(etape => {
                const etat = this.getEtatEtape(etape.id);
                if (etat && (etat.statut === 'non_demarre' || etat.statut === 'en_cours')) {
                    // Vérifier si les dépendances sont terminées
                    const dependancesOk = etape.dependances.every(depId => {
                        const depEtat = this.getEtatEtape(depId);
                        return depEtat && depEtat.statut === 'termine';
                    });

                    if (dependancesOk || etape.dependances.length === 0) {
                        etapes.push({
                            ...etape,
                            phase: phase.nom,
                            phaseId: phase.id,
                            phaseCouleur: phase.couleur,
                            etat
                        });
                    }
                }
            });
        });

        return etapes.slice(0, limit);
    },

    // Obtenir les étapes bloquées
    getEtapesBloquees() {
        const bloquees = [];

        Object.values(this.structure).forEach(phase => {
            phase.etapes.forEach(etape => {
                const etat = this.getEtatEtape(etape.id);
                if (etat && etat.statut === 'bloque') {
                    bloquees.push({
                        ...etape,
                        phase: phase.nom,
                        phaseId: phase.id,
                        etat
                    });
                }
            });
        });

        return bloquees;
    },

    // Définir la date d'arrêt (T-0)
    setDateArret(date) {
        this.init();
        DataManager.data.processus.dateArret = date;
        DataManager.saveToStorage();
        // Sync Firebase immédiate pour la date d'arrêt (importante)
        if (typeof FirebaseManager !== 'undefined' && FirebaseManager.db) {
            FirebaseManager.syncToCloud();
        }
    },

    // Calculer les dates cibles basées sur T-0
    getDatesCibles() {
        this.init();
        const t0 = DataManager.data.processus.dateArret;
        if (!t0) return null;

        const t0Date = new Date(t0);

        return {
            't-26': new Date(t0Date.getTime() - 26 * 7 * 24 * 60 * 60 * 1000),
            't-18': new Date(t0Date.getTime() - 18 * 7 * 24 * 60 * 60 * 1000),
            't-14': new Date(t0Date.getTime() - 14 * 7 * 24 * 60 * 60 * 1000),
            't-12': new Date(t0Date.getTime() - 12 * 7 * 24 * 60 * 60 * 1000),
            't-11': new Date(t0Date.getTime() - 11 * 7 * 24 * 60 * 60 * 1000),
            't-10': new Date(t0Date.getTime() - 10 * 7 * 24 * 60 * 60 * 1000),
            't-7': new Date(t0Date.getTime() - 7 * 7 * 24 * 60 * 60 * 1000),
            't-6': new Date(t0Date.getTime() - 6 * 7 * 24 * 60 * 60 * 1000),
            't-5': new Date(t0Date.getTime() - 5 * 7 * 24 * 60 * 60 * 1000),
            't-4': new Date(t0Date.getTime() - 4 * 7 * 24 * 60 * 60 * 1000),
            't-3': new Date(t0Date.getTime() - 3 * 7 * 24 * 60 * 60 * 1000),
            't-2': new Date(t0Date.getTime() - 2 * 7 * 24 * 60 * 60 * 1000),
            't-1': new Date(t0Date.getTime() - 1 * 7 * 24 * 60 * 60 * 1000),
            't-0': t0Date
        };
    },

    // Obtenir les dates de début et fin d'une phase
    getDatesPhase(phaseId) {
        const dates = this.getDatesCibles();
        if (!dates) return null;

        const phaseDates = {
            'definir': { debut: dates['t-26'], fin: dates['t-18'], debutLabel: 'T-26', finLabel: 'T-18' },
            'planifier': { debut: dates['t-18'], fin: dates['t-12'], debutLabel: 'T-18', finLabel: 'T-12' },
            'preparer': { debut: dates['t-4'], fin: dates['t-0'], debutLabel: 'T-4', finLabel: 'T-0' }
        };

        return phaseDates[phaseId] || null;
    },

    // Formater une date en français (ex: "15 jan. 2025")
    formatDateCourte(date) {
        if (!date) return '';
        const mois = ['jan.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
        const d = new Date(date);
        return `${d.getDate()} ${mois[d.getMonth()]} ${d.getFullYear()}`;
    },

    // Obtenir la phase actuelle basée sur les dates
    getPhaseActuelle() {
        const dates = this.getDatesCibles();
        if (!dates) return null;

        const now = new Date();

        if (now < dates['t-12']) return 'definir';
        if (now < dates['t-4']) return 'planifier';
        if (now < dates['t-0']) return 'preparer';
        return 'execution';
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    ProcessusArret.init();
});
