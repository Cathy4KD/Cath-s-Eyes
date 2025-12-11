/**
 * Module des écrans - Arrêt Annuel
 * Gère l'affichage des différents écrans de l'application
 */

const Screens = {
    // === DÉTECTION MOBILE ===
    isMobile() {
        return window.innerWidth <= 768;
    },

    // === DASHBOARD ===
    renderDashboard() {
        // Sur mobile, afficher l'écran d'accueil simplifié
        if (this.isMobile()) {
            return this.renderMobileHome();
        }
        const stats = DataManager.getGlobalStats();
        const travaux = DataManager.getTravaux();
        const pieces = DataManager.data.pieces || [];

        // Calculer les alertes
        const alertes = this.getAlertes(travaux, pieces);

        // Calculer les stats kitting
        const kittingStats = this.getKittingStats();

        // Calculer les rappels de réunions
        const reunionsRappel = this.getReunionsRappel();

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">📋</div>
                    <div class="stat-info">
                        <h3>${stats.preparation.total}</h3>
                        <p>Total Travaux</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-info">
                        <h3>${stats.preparation.pret}</h3>
                        <p>Préparation OK</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">⚡</div>
                    <div class="stat-info">
                        <h3>${stats.execution.enCours}</h3>
                        <p>En Exécution</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon cyan">🏁</div>
                    <div class="stat-info">
                        <h3>${stats.execution.termine}</h3>
                        <p>Terminés</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Avancement Préparation</h3>
                    <span class="badge badge-primary">${stats.preparation.pourcentage}%</span>
                </div>
                <div class="progress-bar" style="height: 20px;">
                    <div class="progress-fill green" style="width: ${stats.preparation.pourcentage}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 15px; font-size: 0.9rem;">
                    <span>✅ Prêt: ${stats.preparation.pret}</span>
                    <span>🔄 En cours: ${stats.preparation.enCours}</span>
                    <span>⏳ Non commencé: ${stats.preparation.nonCommence}</span>
                </div>
            </div>

            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Alertes</h3>
                        <span class="badge ${alertes.total > 0 ? 'badge-danger' : 'badge-success'}">${alertes.total}</span>
                    </div>
                    <div class="alertes-container" style="max-height: 250px; overflow-y: auto;">
                        ${alertes.total === 0 ? `
                            <div style="text-align: center; padding: 30px; color: var(--success);">
                                <div style="font-size: 2rem;">✓</div>
                                <p>Aucune alerte</p>
                            </div>
                        ` : `
                            ${alertes.items.map(a => `
                                <div class="alerte-item ${a.type}" style="padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 4px solid ${a.color}; background: ${a.bg};">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span>${a.icon}</span>
                                        <span style="font-weight: 500;">${a.titre}</span>
                                    </div>
                                    <div style="font-size: 0.85rem; color: var(--text-light); margin-top: 4px;">${a.detail}</div>
                                </div>
                            `).join('')}
                        `}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Résumé Kitting</h3>
                        <button class="btn btn-outline btn-sm" onclick="App.navigate('preparation', 'PL7.0')">Voir PL7.0</button>
                    </div>
                    <div style="padding: 15px 0;">
                        <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px;">
                            <div>
                                <div style="font-size: 2rem; font-weight: bold; color: var(--primary);">
                                    ${kittingStats.total}
                                </div>
                                <div style="color: var(--text-light); font-size: 0.85rem;">Kittings Total</div>
                            </div>
                            <div>
                                <div style="font-size: 2rem; font-weight: bold; color: var(--success);">
                                    ${kittingStats.prets}
                                </div>
                                <div style="color: var(--text-light); font-size: 0.85rem;">Prêts</div>
                            </div>
                            <div>
                                <div style="font-size: 2rem; font-weight: bold; color: var(--warning);">
                                    ${kittingStats.enAttente}
                                </div>
                                <div style="color: var(--text-light); font-size: 0.85rem;">En attente</div>
                            </div>
                        </div>
                        <div class="progress-bar" style="height: 12px; margin-bottom: 10px;">
                            <div class="progress-fill green" style="width: ${kittingStats.pourcentage}%"></div>
                        </div>
                        <div style="text-align: center; font-size: 0.9rem; color: var(--text-light);">
                            ${kittingStats.piecesRecues} / ${kittingStats.totalPieces} pièces reçues
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📅 Rappel Réunions</h3>
                    <button class="btn btn-outline btn-sm" onclick="App.navigate('reunions')">Voir tout</button>
                </div>
                ${reunionsRappel.length === 0 ? `
                    <div style="text-align: center; padding: 20px; color: var(--text-light);">
                        ${reunionsRappel.noDateArret ?
                            '<p>⚠️ Date d\'arrêt non définie. <a href="#" onclick="App.navigate(\'preparation\'); return false;">Définir dans D1.0</a></p>' :
                            '<p>✓ Aucune réunion à venir</p>'
                        }
                    </div>
                ` : `
                    <div class="table-container" style="max-height: 300px;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width: 100px;">Date butoir</th>
                                    <th>Réunion</th>
                                    <th style="width: 120px;">Responsable</th>
                                    <th style="width: 100px;">Statut</th>
                                    <th style="width: 80px;">Urgence</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${reunionsRappel.map(r => `
                                    <tr class="${r.urgence}" style="cursor: pointer;" onclick="Screens.ouvrirReunion('${r.id}'); App.navigate('reunions');">
                                        <td class="center"><strong>${r.dateButoir}</strong></td>
                                        <td>${r.nom}</td>
                                        <td>${r.responsable}</td>
                                        <td><span class="badge ${r.statutClass}">${r.statutLabel}</span></td>
                                        <td class="center">${r.urgenceIcon}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    },

    // === ÉCRAN D'ACCUEIL MOBILE ===
    renderMobileHome() {
        const stats = DataManager.getGlobalStats();

        return `
            <div class="mobile-home">
                <div class="mobile-stats-summary">
                    <div class="mobile-stat">
                        <span class="mobile-stat-value">${stats.preparation.total}</span>
                        <span class="mobile-stat-label">Travaux</span>
                    </div>
                    <div class="mobile-stat">
                        <span class="mobile-stat-value">${stats.preparation.pourcentage}%</span>
                        <span class="mobile-stat-label">Préparé</span>
                    </div>
                    <div class="mobile-stat">
                        <span class="mobile-stat-value">${stats.execution.termine}</span>
                        <span class="mobile-stat-label">Terminés</span>
                    </div>
                </div>

                <h3 class="mobile-section-title">Accès rapide</h3>

                <div class="mobile-menu-grid">
                    <button class="mobile-menu-btn mobile-btn-orange" onclick="App.navigate('preparation')">
                        <span class="mobile-btn-icon">📝</span>
                        <span class="mobile-btn-text">Préparation</span>
                    </button>
                    <button class="mobile-menu-btn mobile-btn-blue" onclick="App.navigate('execution')">
                        <span class="mobile-btn-icon">⚡</span>
                        <span class="mobile-btn-text">Exécution</span>
                    </button>
                    <button class="mobile-menu-btn mobile-btn-green" onclick="App.navigate('postmortem')">
                        <span class="mobile-btn-icon">📈</span>
                        <span class="mobile-btn-text">Post-Mortem</span>
                    </button>
                    <button class="mobile-menu-btn mobile-btn-purple" onclick="App.navigate('calendrier')">
                        <span class="mobile-btn-icon">📅</span>
                        <span class="mobile-btn-text">Calendrier</span>
                    </button>
                </div>

                <div class="mobile-menu-grid-secondary">
                    <button class="mobile-menu-btn-small" onclick="App.navigate('travaux')">
                        <span class="mobile-btn-icon">📋</span>
                        <span class="mobile-btn-text">Liste Travaux</span>
                    </button>
                </div>

                <h3 class="mobile-section-title">Consultation rapide</h3>

                <div class="mobile-quick-links">
                    <button class="mobile-link-btn" onclick="App.navigate('preparation', 'PL3.0')">
                        <span>🔧</span> Liste TPAA
                    </button>
                    <button class="mobile-link-btn" onclick="App.navigate('reunions')">
                        <span>👥</span> Réunions
                    </button>
                    <button class="mobile-link-btn" onclick="App.navigate('pieces')">
                        <span>🔩</span> Pièces
                    </button>
                    <button class="mobile-link-btn" onclick="App.navigate('rapports')">
                        <span>📄</span> Rapports
                    </button>
                </div>

                <div class="mobile-footer-links">
                    <a href="https://cathy4kd.github.io/Kitting_acierie/" target="_blank" class="mobile-external-link">
                        📦 Kitting Aciérie
                    </a>
                </div>
            </div>
        `;
    },

    // === LISTE TRAVAUX ===
    renderTravaux() {
        const disciplines = DataManager.getDisciplines();
        const statuts = DataManager.getStatuts();
        const travaux = DataManager.getTravaux();

        return `
            <div class="filters-bar">
                <div class="filter-group">
                    <label>Discipline:</label>
                    <select id="filterDiscipline" onchange="App.applyFilters()">
                        <option value="">Toutes</option>
                        ${disciplines.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Statut:</label>
                    <select id="filterStatut" onchange="App.applyFilters()">
                        <option value="">Tous</option>
                        ${statuts.map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <input type="text" id="filterSearch" placeholder="Rechercher OT, description..."
                           onkeyup="App.applyFilters()" style="width: 200px;">
                </div>
                <div style="margin-left: auto;">
                    <span id="travauxCount">${travaux.length} travaux</span>
                </div>
            </div>

            <div class="card">
                <div class="table-container" style="max-height: calc(100vh - 280px);">
                    <table>
                        <thead>
                            <tr>
                                <th>OT</th>
                                <th>Description</th>
                                <th>Équipement</th>
                                <th>Date début</th>
                                <th>Entreprise</th>
                                <th>Révision</th>
                                <th>Commentaire</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="travauxTable">
                            ${this.renderTravauxRows(travaux)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderTravauxRows(travaux) {
        return travaux.map((t, index) => {
            // Chercher revision dans l'objet ou dans customData (avec plusieurs variations)
            const revision = t.revision ||
                (t.customData && (t.customData.revision || t.customData.Revision || t.customData['Révision'] || t.customData['révision'])) ||
                this.findCustomField(t, 'revision') ||
                this.findCustomField(t, 'rev') ||
                '-';
            return `
                <tr class="clickable" onclick="App.showDetail('${t.id}')">
                    <td><strong>${t.ot}</strong></td>
                    <td title="${t.description}">${t.description.substring(0, 60)}${t.description.length > 60 ? '...' : ''}</td>
                    <td>${t.equipement || '-'}</td>
                    <td>${t.execution?.dateDebut ? new Date(t.execution.dateDebut).toLocaleDateString('fr-CA') : '-'}</td>
                    <td>${t.entreprise || '-'}</td>
                    <td>${revision}</td>
                    <td class="commentaire-cell" title="${(t.commentaire || '').replace(/"/g, '&quot;')}">
                        <div class="commentaire-wrapper">
                            <span class="commentaire-text">${(t.commentaire || '-').substring(0, 30)}${(t.commentaire || '').length > 30 ? '...' : ''}</span>
                            <button class="btn-icon btn-edit-comment" onclick="event.stopPropagation(); Screens.editCommentaireTravail(${index})" title="Modifier le commentaire">✏️</button>
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); App.showDetail('${t.id}')">
                            Détail
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    editCommentaireTravail(index) {
        const travaux = DataManager.data.travaux || [];
        const travail = travaux[index];
        if (!travail) return;

        const html = `
            <div class="overlay-modal" id="commentaireModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>Commentaire - OT ${travail.ot}</h3>
                        <button class="close-btn" onclick="document.getElementById('commentaireModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Travail: ${(travail.description || '').substring(0, 60)}</label>
                        </div>
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="travailCommentaire" class="form-control" rows="4" placeholder="Ajouter un commentaire...">${travail.commentaire || ''}</textarea>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('commentaireModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="Screens.sauvegarderCommentaireTravail(${index})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    sauvegarderCommentaireTravail(index) {
        const commentaire = document.getElementById('travailCommentaire').value.trim();

        if (DataManager.data.travaux && DataManager.data.travaux[index]) {
            DataManager.data.travaux[index].commentaire = commentaire;
            DataManager.saveToStorage();
        }

        document.getElementById('commentaireModal').remove();
        App.refresh();
        App.showToast('Commentaire enregistré', 'success');
    },

    // Chercher une valeur dans customData par nom de champ
    findCustomField(travail, fieldName) {
        if (!travail.customData) return null;

        const normalizedSearch = fieldName.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Enlever les accents

        // Chercher par clé contenant le nom du champ
        for (const key of Object.keys(travail.customData)) {
            const normalizedKey = key.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (normalizedKey.includes(normalizedSearch) || normalizedSearch.includes(normalizedKey)) {
                return travail.customData[key];
            }
        }
        return null;
    },

    // === PRÉPARATION ===
    renderPreparation() {
        const stats = DataManager.getPreparationStats();
        const travaux = DataManager.getTravaux();

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-info">
                        <h3>${stats.pret}</h3>
                        <p>Préparation Complète</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon orange">🔄</div>
                    <div class="stat-info">
                        <h3>${stats.enCours}</h3>
                        <p>En Cours</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">⏳</div>
                    <div class="stat-info">
                        <h3>${stats.nonCommence}</h3>
                        <p>Non Commencé</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon blue">📊</div>
                    <div class="stat-info">
                        <h3>${stats.pourcentage}%</h3>
                        <p>Avancement Global</p>
                    </div>
                </div>
            </div>

            <div class="tabs">
                <div class="tab active" onclick="App.switchPrepaTab('liste')">Liste</div>
                <div class="tab" onclick="App.switchPrepaTab('kanban')">Vue Kanban</div>
            </div>

            <div id="prepaContent">
                ${this.renderPreparationList(travaux)}
            </div>
        `;
    },

    renderPreparationList(travaux) {
        return `
            <div class="card">
                <div class="table-container" style="max-height: calc(100vh - 350px);">
                    <table>
                        <thead>
                            <tr>
                                <th>OT</th>
                                <th>Description</th>
                                <th>Matériel</th>
                                <th>Permis</th>
                                <th>Consignation</th>
                                <th>PJ</th>
                                <th>Gamme</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${travaux.map(t => `
                                <tr class="clickable" onclick="App.showDetail('${t.id}')">
                                    <td><strong>${t.ot}</strong></td>
                                    <td>${t.description.substring(0, 30)}...</td>
                                    <td>${this.renderCheckbox(t.id, 'materielCommande', t.preparation.materielCommande)}</td>
                                    <td>${this.renderCheckbox(t.id, 'permisSecurite', t.preparation.permisSecurite)}</td>
                                    <td>${this.renderCheckbox(t.id, 'consignationPrevue', t.preparation.consignationPrevue)}</td>
                                    <td>${this.renderCheckbox(t.id, 'pieceJointe', t.preparation.pieceJointe)}</td>
                                    <td>${this.renderCheckbox(t.id, 'gammeValidee', t.preparation.gammeValidee)}</td>
                                    <td>${this.getPreparationScore(t)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderPreparationKanban(travaux) {
        const nonCommence = travaux.filter(t => this.getPreparationScore(t) === 0);
        const enCours = travaux.filter(t => { const s = this.getPreparationScore(t); return s > 0 && s < 100; });
        const pret = travaux.filter(t => this.getPreparationScore(t) === 100);

        return `
            <div class="kanban-board">
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>⏳ Non Commencé</span>
                        <span class="kanban-count">${nonCommence.length}</span>
                    </div>
                    ${nonCommence.map(t => this.renderKanbanCard(t)).join('')}
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>🔄 En Cours</span>
                        <span class="kanban-count">${enCours.length}</span>
                    </div>
                    ${enCours.map(t => this.renderKanbanCard(t)).join('')}
                </div>
                <div class="kanban-column">
                    <div class="kanban-header">
                        <span>✅ Prêt</span>
                        <span class="kanban-count">${pret.length}</span>
                    </div>
                    ${pret.map(t => this.renderKanbanCard(t)).join('')}
                </div>
            </div>
        `;
    },

    renderKanbanCard(travail) {
        return `
            <div class="kanban-item" onclick="App.showDetail('${travail.id}')">
                <strong>${travail.ot}</strong>
                <p style="font-size: 0.85rem; margin: 5px 0;">${travail.description.substring(0, 50)}...</p>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-light);">
                    <span>${travail.discipline || '-'}</span>
                    <span>${this.getPreparationScore(travail)}%</span>
                </div>
            </div>
        `;
    },

    // === EXÉCUTION ===
    // Onglet actif de l'exécution
    executionTab: 'realisation',
    executionDate: new Date().toISOString().split('T')[0],
    journalDate: new Date().toISOString().split('T')[0],

    renderExecution() {
        const stats = DataManager.getExecutionStats();

        return `
            <div class="execution-screen">
                <!-- Stats rapides -->
                <div class="stats-grid stats-small">
                    <div class="stat-card mini">
                        <div class="stat-icon green">🏁</div>
                        <div class="stat-info">
                            <h3>${stats.termine}</h3>
                            <p>Terminés</p>
                        </div>
                    </div>
                    <div class="stat-card mini">
                        <div class="stat-icon orange">⚡</div>
                        <div class="stat-info">
                            <h3>${stats.enCours}</h3>
                            <p>En Cours</p>
                        </div>
                    </div>
                    <div class="stat-card mini">
                        <div class="stat-icon blue">📊</div>
                        <div class="stat-info">
                            <h3>${stats.pourcentage}%</h3>
                            <p>Avancement</p>
                        </div>
                    </div>
                    <div class="stat-card mini">
                        <div class="stat-icon purple">⏱️</div>
                        <div class="stat-info">
                            <h3>${stats.heuresReelles.toLocaleString('fr-FR')}h</h3>
                            <p>/ ${stats.heuresEstimees.toLocaleString('fr-FR')}h</p>
                        </div>
                    </div>
                </div>

                <!-- Onglets principaux -->
                <div class="exec-tabs">
                    <button class="exec-tab ${this.executionTab === 'realisation' ? 'active' : ''}"
                            onclick="Screens.switchExecutionTab('realisation')">
                        📍 Réalisation temps réel
                    </button>
                    <button class="exec-tab ${this.executionTab === 'journal' ? 'active' : ''}"
                            onclick="Screens.switchExecutionTab('journal')">
                        📰 Points de presse
                    </button>
                    <button class="exec-tab ${this.executionTab === 'demandes' ? 'active' : ''}"
                            onclick="Screens.switchExecutionTab('demandes')">
                        📋 Demandes quotidiennes
                    </button>
                    <button class="exec-tab ${this.executionTab === 'quarts' ? 'active' : ''}"
                            onclick="Screens.switchExecutionTab('quarts')">
                        🌙 Rapports de Quart
                    </button>
                </div>

                <!-- Contenu de l'onglet -->
                <div class="exec-content">
                    ${this.renderExecutionTabContent()}
                </div>
            </div>
        `;
    },

    switchExecutionTab(tab) {
        this.executionTab = tab;
        document.querySelector('.exec-content').innerHTML = this.renderExecutionTabContent();
        // Mettre à jour les onglets actifs
        document.querySelectorAll('.exec-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.exec-tab[onclick*="${tab}"]`).classList.add('active');
    },

    renderExecutionTabContent() {
        switch(this.executionTab) {
            case 'realisation': return this.renderRealisationTempsReel();
            case 'journal': return this.renderJournalDeBord();
            case 'demandes': return this.renderDemandesQuotidiennes();
            case 'quarts': return this.renderRapportsDeQuart();
            default: return this.renderRealisationTempsReel();
        }
    },

    // === RÉALISATION TEMPS RÉEL ===
    renderRealisationTempsReel() {
        const travaux = DataManager.getTravaux();
        const today = this.executionDate;

        return `
            <div class="realisation-screen">
                <!-- Sous-navigation -->
                <div class="realisation-nav">
                    <button class="btn btn-sm ${this.realisationView === 'liste' ? 'btn-primary' : 'btn-outline'}"
                            onclick="Screens.setRealisationView('liste')">📋 Liste du jour</button>
                    <button class="btn btn-sm ${this.realisationView === 'calendrier' ? 'btn-primary' : 'btn-outline'}"
                            onclick="Screens.setRealisationView('calendrier')">📅 Calendrier</button>
                    <button class="btn btn-sm ${this.realisationView === 'plan' ? 'btn-primary' : 'btn-outline'}"
                            onclick="Screens.setRealisationView('plan')">🗺️ Plan</button>
                    <div class="date-selector">
                        <input type="date" value="${today}" onchange="Screens.setExecutionDate(this.value)">
                    </div>
                </div>

                <!-- Contenu selon la vue -->
                <div class="realisation-content">
                    ${this.renderRealisationView(travaux)}
                </div>
            </div>
        `;
    },

    realisationView: 'liste',

    setRealisationView(view) {
        this.realisationView = view;
        const content = document.querySelector('.realisation-content');
        if (content) {
            content.innerHTML = this.renderRealisationView(DataManager.getTravaux());
        }
        // Mettre à jour boutons
        document.querySelectorAll('.realisation-nav .btn').forEach(b => {
            b.classList.remove('btn-primary');
            b.classList.add('btn-outline');
        });
        document.querySelector(`.realisation-nav .btn[onclick*="${view}"]`)?.classList.replace('btn-outline', 'btn-primary');
    },

    setExecutionDate(date) {
        this.executionDate = date;
        this.setRealisationView(this.realisationView);
    },

    renderRealisationView(travaux) {
        switch(this.realisationView) {
            case 'liste': return this.renderListeJour(travaux);
            case 'calendrier': return this.renderCalendrier(travaux);
            case 'plan': return this.renderPlanVisuel(travaux);
            default: return this.renderListeJour(travaux);
        }
    },

    // Liste du jour
    renderListeJour(travaux) {
        // Date du jour sélectionné et du lendemain
        const dateJour = this.executionDate;
        const dateDemain = new Date(dateJour);
        dateDemain.setDate(dateDemain.getDate() + 1);
        const dateDemainStr = dateDemain.toISOString().split('T')[0];

        // Filtrer les travaux du jour
        const travauxJour = travaux.filter(t => this.isTravauxPourDate(t, dateJour));

        // Filtrer les travaux des prochaines 24h (demain)
        const travauxDemain = travaux.filter(t => {
            // Exclure ceux déjà dans aujourd'hui
            if (this.isTravauxPourDate(t, dateJour)) return false;
            return this.isTravauxPourDate(t, dateDemainStr);
        });

        return `
            <!-- Travaux du jour -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Aujourd'hui - ${new Date(dateJour).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
                    <span class="badge badge-primary">${travauxJour.length} travaux</span>
                </div>
                ${this.renderTravauxTable(travauxJour, 'Aucun travail prévu ou en cours pour aujourd\'hui')}
            </div>

            <!-- Travaux des prochaines 24h -->
            <div class="card" style="margin-top: 20px;">
                <div class="card-header">
                    <h3 class="card-title">⏰ Prochaines 24h - ${dateDemain.toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
                    <span class="badge badge-secondary">${travauxDemain.length} travaux</span>
                </div>
                ${this.renderTravauxTable(travauxDemain, 'Aucun travail prévu pour demain')}
            </div>
        `;
    },

    isTravauxPourDate(travail, date) {
        const dateDebut = travail.execution?.dateDebut?.split('T')[0];
        const dateFin = travail.execution?.dateFin?.split('T')[0];
        const datePrevue = travail.datePrevue?.split('T')[0];
        const statut = travail.execution?.statutExec;

        // Travaux terminés ne sont pas affichés
        if (statut === 'Terminé') return false;

        // Travaux en cours pour aujourd'hui seulement
        if (statut === 'En cours' && date === this.executionDate) return true;

        // Travaux avec date de début ou date prévue correspondante
        if (dateDebut === date || datePrevue === date) return true;

        // Travaux dans la plage de dates
        if (dateDebut && dateFin && dateDebut <= date && dateFin >= date) return true;

        return false;
    },

    renderTravauxTable(travaux, emptyMessage) {
        if (travaux.length === 0) {
            return `<div class="empty-state"><p>${emptyMessage}</p></div>`;
        }

        return `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width:80px">OT</th>
                            <th>Description</th>
                            <th style="width:100px">Entreprise</th>
                            <th style="width:120px">Équipement</th>
                            <th style="width:100px">Statut</th>
                            <th style="width:80px">Heures</th>
                            <th style="width:80px">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${travaux.map(t => `
                            <tr class="${t.execution?.statutExec === 'Terminé' ? 'row-success' : t.execution?.statutExec === 'Bloqué' ? 'row-danger' : t.execution?.statutExec === 'En cours' ? 'row-warning' : ''}">
                                <td><strong>${t.ot}</strong></td>
                                <td>${(t.description || '').substring(0, 50)}${(t.description || '').length > 50 ? '...' : ''}</td>
                                <td>
                                    <span class="entreprise-tag" style="border-left: 3px solid ${this.getEntrepriseColor(t.entreprise)}">
                                        ${t.entreprise || 'Interne'}
                                    </span>
                                </td>
                                <td>${t.equipement || '-'}</td>
                                <td>
                                    <select class="form-control form-control-sm statut-${(t.execution?.statutExec || 'non-demarre').toLowerCase().replace(' ', '-')}"
                                            onchange="Screens.updateExecStatut('${t.id}', this.value)">
                                        <option value="Non démarré" ${t.execution?.statutExec === 'Non démarré' ? 'selected' : ''}>Non démarré</option>
                                        <option value="En cours" ${t.execution?.statutExec === 'En cours' ? 'selected' : ''}>En cours</option>
                                        <option value="Terminé" ${t.execution?.statutExec === 'Terminé' ? 'selected' : ''}>Terminé</option>
                                        <option value="Bloqué" ${t.execution?.statutExec === 'Bloqué' ? 'selected' : ''}>Bloqué</option>
                                    </select>
                                </td>
                                <td>${t.execution?.heuresReelles || 0}h / ${t.estimationHeures || 0}h</td>
                                <td>
                                    <button class="btn btn-sm btn-outline" onclick="TravailDetail.show('${t.ot}')">Détail</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    updateExecStatut(travailId, statut) {
        const travail = DataManager.getTravail(travailId);
        if (travail) {
            travail.execution.statutExec = statut;
            if (statut === 'En cours' && !travail.execution.dateDebut) {
                travail.execution.dateDebut = new Date().toISOString();
            }
            if (statut === 'Terminé' && !travail.execution.dateFin) {
                travail.execution.dateFin = new Date().toISOString();
            }
            DataManager.saveToStorage();
            App.showToast('Statut mis à jour', 'success');
        }
    },

    // Calendrier (vue semaine)
    renderCalendrier(travaux) {
        const startDate = new Date(this.executionDate);
        startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Lundi

        const jours = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            jours.push(date);
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📅 Semaine du ${jours[0].toLocaleDateString('fr-FR')} au ${jours[6].toLocaleDateString('fr-FR')}</h3>
                </div>
                <div class="calendrier-semaine">
                    ${jours.map(jour => {
                        const jourStr = jour.toISOString().split('T')[0];
                        const isToday = jourStr === new Date().toISOString().split('T')[0];
                        const isSelected = jourStr === this.executionDate;
                        const travauxJour = travaux.filter(t => {
                            const dateDebut = t.execution?.dateDebut?.split('T')[0];
                            return dateDebut === jourStr || t.datePrevue?.split('T')[0] === jourStr;
                        });

                        return `
                            <div class="calendrier-jour ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
                                 onclick="Screens.setExecutionDate('${jourStr}'); Screens.setRealisationView('liste')">
                                <div class="jour-header">
                                    <span class="jour-nom">${jour.toLocaleDateString('fr-FR', {weekday: 'short'})}</span>
                                    <span class="jour-num">${jour.getDate()}</span>
                                </div>
                                <div class="jour-travaux">
                                    ${travauxJour.slice(0, 3).map(t => `
                                        <div class="travail-mini ${t.execution?.statutExec === 'Terminé' ? 'done' : t.execution?.statutExec === 'En cours' ? 'progress' : ''}">
                                            ${t.ot}
                                        </div>
                                    `).join('')}
                                    ${travauxJour.length > 3 ? `<div class="travail-more">+${travauxJour.length - 3} autres</div>` : ''}
                                </div>
                                <div class="jour-count">${travauxJour.length} travaux</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    // Plan visuel (placeholder - à compléter avec le plan de l'usine)
    // Mode du plan: 'setup' ou 'live'
    planMode: 'live',

    renderPlanVisuel(travaux) {
        // Grouper les travaux par équipement/localisation
        const parEquipement = {};
        travaux.forEach(t => {
            const equip = t.equipement || 'Non assigné';
            if (!parEquipement[equip]) parEquipement[equip] = [];
            parEquipement[equip].push(t);
        });

        const planConfig = DataManager.data.processus?.planConfig || {};
        const planImageSrc = planConfig.imageURL || planConfig.imageData;
        const hasPlan = !!planImageSrc;
        const vuesDetail = planConfig.vuesDetail || [];

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🗺️ Plan - Localisation des travaux</h3>
                    <div class="plan-header-actions">
                        ${hasPlan ? `
                            <div class="plan-mode-toggle">
                                <button class="mode-btn ${this.planMode === 'live' ? 'active' : ''}"
                                        onclick="Screens.setPlanMode('live')">📍 Live</button>
                                <button class="mode-btn ${this.planMode === 'setup' ? 'active' : ''}"
                                        onclick="Screens.setPlanMode('setup')">⚙️ Setup</button>
                            </div>
                            <select class="vue-select" id="vueSelect" onchange="Screens.loadVueDetail(this.value)">
                                <option value="">Vue complète</option>
                                ${vuesDetail.map((v, i) => `<option value="${i}">${v.nom}</option>`).join('')}
                            </select>
                            <button class="btn btn-sm btn-outline" onclick="Screens.saveCurrentVue()" title="Sauvegarder cette vue">💾</button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline" onclick="Screens.showConfigPlan()">⚙️ Configurer</button>
                    </div>
                </div>
                <div class="plan-container">
                    ${hasPlan ? `
                        <div class="plan-view">
                            <div class="plan-zoom-controls">
                                <button class="zoom-btn" onclick="Screens.zoomPlan(0.2)" title="Zoom +">+</button>
                                <button class="zoom-btn" onclick="Screens.zoomPlan(-0.2)" title="Zoom -">−</button>
                                <button class="zoom-btn" onclick="Screens.resetZoom()" title="Réinitialiser">⟲</button>
                            </div>
                            <div class="plan-canvas-wrapper" id="planWrapper">
                                <div class="plan-canvas-view" id="planViewCanvas"
                                     onmousedown="Screens.startPan(event)"
                                     onwheel="Screens.wheelZoom(event)">
                                    <img src="${planImageSrc}" alt="Plan de l'usine" draggable="false">
                                    ${this.planMode === 'setup'
                                        ? this.renderPlanMarkersWithStats(planConfig.positions || {}, parEquipement)
                                        : this.renderLiveMarkers(planConfig.positions || {}, travaux)}
                                </div>
                            </div>
                            ${this.planMode === 'setup' ? `
                                <div class="plan-legend">
                                    <div class="legend-item"><span class="legend-dot completed"></span> Terminés</div>
                                    <div class="legend-item"><span class="legend-dot in-progress"></span> En cours</div>
                                    <div class="legend-item"><span class="legend-dot pending"></span> Non démarrés</div>
                                    <span class="zoom-indicator" id="zoomIndicator">100%</span>
                                </div>
                            ` : `
                                <div class="plan-legend live-legend">
                                    ${this.renderEntrepriseLegend(travaux)}
                                    <span class="zoom-indicator" id="zoomIndicator">100%</span>
                                </div>
                            `}
                        </div>
                    ` : `
                        <div class="plan-placeholder">
                            <p>📍 Plan de l'usine à configurer</p>
                            <p style="font-size: 0.9rem; color: var(--text-light);">
                                Importez une image du plan et positionnez les équipements
                            </p>
                            <button class="btn btn-primary" onclick="Screens.showConfigPlan()">
                                Configurer le plan
                            </button>
                        </div>
                    `}
                </div>

                <!-- Liste par équipement -->
                <div class="card-header" style="margin-top: 20px;">
                    <h3 class="card-title">${this.planMode === 'live' ? 'Travaux en cours par équipement' : 'Tous les équipements'}</h3>
                </div>
                <div class="equipements-grid">
                    ${Object.entries(parEquipement).map(([equip, trav]) => {
                        const travauxAffiches = this.planMode === 'live'
                            ? trav.filter(t => this.isTravauxActif(t))
                            : trav;
                        if (this.planMode === 'live' && travauxAffiches.length === 0) return '';
                        return `
                            <div class="equipement-card">
                                <div class="equip-header">
                                    <strong>${equip}</strong>
                                    <span class="badge badge-primary">${travauxAffiches.length}</span>
                                </div>
                                <div class="equip-travaux">
                                    ${travauxAffiches.slice(0, 5).map(t => `
                                        <div class="travail-item ${t.execution?.statutExec === 'Terminé' ? 'done' : t.execution?.statutExec === 'En cours' ? 'progress' : ''}">
                                            <span class="ot">${t.ot}</span>
                                            <span class="entreprise-dot" style="background: ${this.getEntrepriseColor(t.entreprise)}"></span>
                                            <span class="entreprise-name">${t.entreprise || 'Interne'}</span>
                                        </div>
                                    `).join('')}
                                    ${travauxAffiches.length > 5 ? `<div class="more">+${travauxAffiches.length - 5} autres</div>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    setPlanMode(mode) {
        this.planMode = mode;
        this.setRealisationView('plan');
    },

    // Couleurs pour les entreprises
    entrepriseColors: {},
    colorPalette: [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b',
        '#2980b9', '#27ae60', '#8e44ad', '#d35400', '#2c3e50'
    ],

    getEntrepriseColor(entreprise) {
        if (!entreprise) return '#6c757d'; // Gris pour interne
        if (!this.entrepriseColors[entreprise]) {
            const usedColors = Object.values(this.entrepriseColors).length;
            this.entrepriseColors[entreprise] = this.colorPalette[usedColors % this.colorPalette.length];
        }
        return this.entrepriseColors[entreprise];
    },

    // Vérifie si un travail est actif (en cours selon les dates)
    isTravauxActif(travail) {
        // Si terminé, ne pas afficher
        if (travail.execution?.statutExec === 'Terminé') return false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Vérifier les dates d'exécution
        const dateDebut = travail.execution?.dateDebut ? new Date(travail.execution.dateDebut) : null;
        const dateFin = travail.execution?.dateFin ? new Date(travail.execution.dateFin) : null;

        // Si pas de dates, vérifier le statut
        if (!dateDebut && !dateFin) {
            return travail.execution?.statutExec === 'En cours';
        }

        // Vérifier si aujourd'hui est dans la plage
        if (dateDebut && today < dateDebut) return false;
        if (dateFin && today > dateFin) return false;

        return true;
    },

    // Génère les marqueurs pour le mode Live
    renderLiveMarkers(positions, travaux) {
        const markers = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Grouper les travaux actifs par équipement et entreprise
        const travauxActifs = travaux.filter(t => this.isTravauxActif(t));

        // Calculer les offsets pour les équipements proches
        const offsets = this.calculateMarkerOffsets(positions);

        // Pour chaque équipement positionné
        Object.entries(positions).forEach(([equip, pos]) => {
            const travauxEquip = travauxActifs.filter(t => t.equipement === equip);

            if (travauxEquip.length === 0) return;

            // Appliquer l'offset pour les équipements proches
            const equipOffset = offsets[equip] || { x: 0, y: 0 };
            const baseX = parseFloat(pos.x) + equipOffset.x;
            const baseY = parseFloat(pos.y) + equipOffset.y;

            // Grouper par entreprise
            const parEntreprise = {};
            travauxEquip.forEach(t => {
                const ent = t.entreprise || 'Interne';
                if (!parEntreprise[ent]) parEntreprise[ent] = [];
                parEntreprise[ent].push(t);
            });

            // Créer un marqueur par entreprise, légèrement décalé
            const entreprises = Object.keys(parEntreprise);
            entreprises.forEach((ent, idx) => {
                const entOffset = entreprises.length > 1 ? (idx - (entreprises.length - 1) / 2) * 2.5 : 0;
                const color = this.getEntrepriseColor(ent === 'Interne' ? null : ent);
                const count = parEntreprise[ent].length;

                markers.push(`
                    <div class="plan-marker-live"
                         style="left: calc(${baseX}% + ${entOffset}px); top: ${baseY}%; background: ${color}"
                         onclick="Screens.showEquipementEntrepriseDetail('${equip}', '${ent}')"
                         title="${equip} - ${ent}: ${count} travail(x)">
                        <span class="marker-count">${count}</span>
                        <div class="marker-tooltip">
                            <strong>${equip}</strong>
                            <div class="ent-name" style="color: ${color}">${ent}</div>
                            <div class="marker-stats">
                                <span>${count} travail(x) en cours</span>
                            </div>
                        </div>
                    </div>
                `);
            });
        });

        return markers.join('');
    },

    renderEntrepriseLegend(travaux) {
        const entreprises = [...new Set(travaux.filter(t => this.isTravauxActif(t)).map(t => t.entreprise || 'Interne'))];

        if (entreprises.length === 0) {
            return '<span class="no-travaux">Aucun travail en cours</span>';
        }

        return entreprises.map(ent => `
            <div class="legend-item">
                <span class="legend-dot" style="background: ${this.getEntrepriseColor(ent === 'Interne' ? null : ent)}"></span>
                ${ent}
            </div>
        `).join('');
    },

    showEquipementEntrepriseDetail(equipement, entreprise) {
        const travaux = DataManager.getTravaux().filter(t =>
            t.equipement === equipement &&
            (t.entreprise || 'Interne') === entreprise &&
            this.isTravauxActif(t)
        );

        const color = this.getEntrepriseColor(entreprise === 'Interne' ? null : entreprise);

        const html = `
            <div class="modal-overlay" id="equipDetailModal" onclick="if(event.target === this) this.remove()">
                <div class="modal-content">
                    <div class="modal-header" style="border-left: 4px solid ${color}">
                        <h3>🔧 ${equipement}</h3>
                        <button class="modal-close" onclick="document.getElementById('equipDetailModal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="entreprise-badge" style="background: ${color}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 15px;">
                            ${entreprise}
                        </div>
                        <div class="equip-travaux-list">
                            ${travaux.map(t => `
                                <div class="travail-row" onclick="TravailDetail.show('${t.ot}')">
                                    <span class="ot-number">${t.ot}</span>
                                    <span class="travail-desc">${t.description?.substring(0, 50) || 'Sans description'}...</span>
                                    <span class="badge badge-warning">${t.execution?.statutExec || 'En cours'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    renderPlanMarkersWithStats(positions, parEquipement) {
        const offsets = this.calculateMarkerOffsets(positions);

        return Object.entries(positions).map(([equip, pos]) => {
            const travaux = parEquipement[equip] || [];
            const total = travaux.length;
            const termines = travaux.filter(t => t.execution?.statutExec === 'Terminé').length;
            const enCours = travaux.filter(t => t.execution?.statutExec === 'En cours').length;

            // Appliquer l'offset pour les équipements proches
            const offset = offsets[equip] || { x: 0, y: 0 };
            const finalX = parseFloat(pos.x) + offset.x;
            const finalY = parseFloat(pos.y) + offset.y;

            // Déterminer la couleur du marqueur
            let markerClass = 'pending';
            if (total > 0) {
                if (termines === total) markerClass = 'completed';
                else if (enCours > 0 || termines > 0) markerClass = 'in-progress';
            }

            return `
                <div class="plan-marker-view ${markerClass}"
                     style="left: ${finalX}%; top: ${finalY}%"
                     onclick="Screens.showEquipementDetail('${equip}')"
                     title="${equip}: ${termines}/${total} terminés">
                    <span class="marker-count">${total}</span>
                    <div class="marker-tooltip">
                        <strong>${equip}</strong>
                        <div class="marker-stats">
                            <span>✅ ${termines}</span>
                            <span>⚡ ${enCours}</span>
                            <span>⏳ ${total - termines - enCours}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    showEquipementDetail(equipement) {
        const travaux = DataManager.getTravaux().filter(t => t.equipement === equipement);

        const html = `
            <div class="modal-overlay" id="equipDetailModal" onclick="if(event.target === this) this.remove()">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>🔧 ${equipement}</h3>
                        <button class="modal-close" onclick="document.getElementById('equipDetailModal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="equip-detail-stats">
                            <div class="stat-mini">
                                <span class="stat-value">${travaux.length}</span>
                                <span class="stat-label">Total</span>
                            </div>
                            <div class="stat-mini green">
                                <span class="stat-value">${travaux.filter(t => t.execution?.statutExec === 'Terminé').length}</span>
                                <span class="stat-label">Terminés</span>
                            </div>
                            <div class="stat-mini orange">
                                <span class="stat-value">${travaux.filter(t => t.execution?.statutExec === 'En cours').length}</span>
                                <span class="stat-label">En cours</span>
                            </div>
                        </div>
                        <div class="equip-travaux-list">
                            ${travaux.map(t => `
                                <div class="travail-row" onclick="TravailDetail.show('${t.ot}')">
                                    <span class="ot-number">${t.ot}</span>
                                    <span class="travail-desc">${t.description?.substring(0, 50) || 'Sans description'}...</span>
                                    <span class="badge ${t.execution?.statutExec === 'Terminé' ? 'badge-success' : t.execution?.statutExec === 'En cours' ? 'badge-warning' : 'badge-secondary'}">
                                        ${t.execution?.statutExec || 'Non démarré'}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    // === ZOOM ET PAN DU PLAN ===
    planZoom: 1,
    planPanX: 0,
    planPanY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,

    zoomPlan(delta) {
        this.planZoom = Math.max(0.5, Math.min(4, this.planZoom + delta));
        this.applyPlanTransform();
    },

    wheelZoom(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        this.planZoom = Math.max(0.5, Math.min(4, this.planZoom + delta));
        this.applyPlanTransform();
    },

    resetZoom() {
        this.planZoom = 1;
        this.planPanX = 0;
        this.planPanY = 0;
        this.applyPlanTransform();
    },

    applyPlanTransform() {
        const canvas = document.getElementById('planViewCanvas');
        if (canvas) {
            canvas.style.transform = `scale(${this.planZoom}) translate(${this.planPanX}px, ${this.planPanY}px)`;

            // Ajuster la taille des marqueurs pour compenser le zoom
            const inverseScale = 1 / this.planZoom;
            canvas.style.setProperty('--marker-scale', inverseScale);
            const markers = canvas.querySelectorAll('.plan-marker-view, .plan-marker-live');
            markers.forEach(marker => {
                marker.style.transform = `translate(-50%, -50%) scale(${inverseScale})`;
            });
        }
        const indicator = document.getElementById('zoomIndicator');
        if (indicator) {
            indicator.textContent = Math.round(this.planZoom * 100) + '%';
        }
    },

    startPan(event) {
        if (event.target.closest('.plan-marker-view')) return; // Ne pas panner si on clique sur un marqueur
        this.isPanning = true;
        this.panStartX = event.clientX - this.planPanX * this.planZoom;
        this.panStartY = event.clientY - this.planPanY * this.planZoom;

        const canvas = document.getElementById('planViewCanvas');
        if (canvas) canvas.style.cursor = 'grabbing';

        const moveHandler = (e) => {
            if (!this.isPanning) return;
            this.planPanX = (e.clientX - this.panStartX) / this.planZoom;
            this.planPanY = (e.clientY - this.panStartY) / this.planZoom;
            this.applyPlanTransform();
        };

        const upHandler = () => {
            this.isPanning = false;
            if (canvas) canvas.style.cursor = 'grab';
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    },

    // === VUES DÉTAIL ===
    saveCurrentVue() {
        const nom = prompt('Nom de cette vue (ex: Zone Four, Secteur Nord...)');
        if (!nom) return;

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.planConfig) DataManager.data.processus.planConfig = {};
        if (!DataManager.data.processus.planConfig.vuesDetail) DataManager.data.processus.planConfig.vuesDetail = [];

        DataManager.data.processus.planConfig.vuesDetail.push({
            nom,
            zoom: this.planZoom,
            panX: this.planPanX,
            panY: this.planPanY
        });

        DataManager.saveToStorage(true);
        App.showToast(`Vue "${nom}" sauvegardée!`, 'success');

        // Rafraîchir pour mettre à jour le select
        this.setRealisationView('plan');
    },

    loadVueDetail(index) {
        if (index === '') {
            this.resetZoom();
            return;
        }

        const vues = DataManager.data.processus?.planConfig?.vuesDetail || [];
        const vue = vues[parseInt(index)];
        if (vue) {
            this.planZoom = vue.zoom;
            this.planPanX = vue.panX;
            this.planPanY = vue.panY;
            this.applyPlanTransform();
        }
    },

    deleteVueDetail(index) {
        if (!confirm('Supprimer cette vue?')) return;

        const vues = DataManager.data.processus?.planConfig?.vuesDetail;
        if (vues) {
            vues.splice(index, 1);
            DataManager.saveToStorage(true);
            this.setRealisationView('plan');
        }
    },

    showConfigPlan() {
        // Créer le modal de configuration
        const planConfig = DataManager.data.processus?.planConfig || {};
        const planImageSrc = planConfig.imageURL || planConfig.imageData;
        const hasPlanImage = !!planImageSrc;

        const modalHtml = `
            <div class="modal-overlay" id="planConfigModal" onclick="if(event.target === this) Screens.closePlanConfig()">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h3>🗺️ Configuration du plan</h3>
                        <button class="modal-close" onclick="Screens.closePlanConfig()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="plan-config-section">
                            <h4>1. Importer l'image du plan</h4>
                            <div class="plan-upload-area" id="planUploadArea">
                                ${hasPlanImage ? `
                                    <img src="${planImageSrc}" alt="Plan" class="plan-preview">
                                    <button class="btn btn-sm btn-danger" onclick="Screens.removePlanImage()">Supprimer l'image</button>
                                ` : `
                                    <input type="file" id="planImageInput" accept="image/*,application/pdf" onchange="Screens.handlePlanImageUpload(event)" style="display:none">
                                    <div class="upload-placeholder" onclick="document.getElementById('planImageInput').click()">
                                        <span class="upload-icon">📁</span>
                                        <p>Cliquez pour sélectionner un fichier</p>
                                        <small>PNG, JPG, PDF (max 20MB)</small>
                                    </div>
                                `}
                            </div>
                        </div>

                        ${hasPlanImage ? `
                            <div class="plan-config-section">
                                <h4>2. Positionner les équipements</h4>
                                <p class="config-hint">Sélectionnez un équipement dans la liste, puis cliquez sur le plan pour le positionner. Utilisez la molette ou les boutons pour zoomer.</p>
                                <div class="plan-editor">
                                    <div class="plan-editor-main">
                                        <div class="config-zoom-controls">
                                            <button class="zoom-btn" onclick="Screens.zoomConfigPlan(0.2)" title="Zoom +">+</button>
                                            <button class="zoom-btn" onclick="Screens.zoomConfigPlan(-0.2)" title="Zoom -">−</button>
                                            <button class="zoom-btn" onclick="Screens.resetConfigZoom()" title="Réinitialiser">⟲</button>
                                            <span class="config-zoom-level" id="configZoomLevel">100%</span>
                                        </div>
                                        <div class="plan-canvas-wrapper-config" id="planConfigWrapper"
                                             onwheel="Screens.wheelConfigZoom(event)">
                                            <div class="plan-canvas-container" id="planCanvasContainer"
                                                 onmousedown="Screens.startConfigPan(event)">
                                                <img src="${planImageSrc}" alt="Plan" id="planEditorImage"
                                                     onclick="Screens.handlePlanClick(event)" draggable="false">
                                                ${this.renderEquipementMarkers(planConfig.positions || {})}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="equipements-panel">
                                        <h5>Équipements</h5>
                                        <div class="equipements-list-config">
                                            ${this.getEquipementsList().map(eq => `
                                                <div class="equip-config-item ${planConfig.positions?.[eq] ? 'positioned' : ''}"
                                                     onclick="Screens.selectEquipementToPosition('${eq}')">
                                                    <span class="equip-name">${eq}</span>
                                                    ${planConfig.positions?.[eq] ? '<span class="positioned-badge">✓</span>' : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="Screens.closePlanConfig()">Fermer</button>
                        <button class="btn btn-primary" onclick="Screens.savePlanConfig()">💾 Sauvegarder</button>
                    </div>
                </div>
            </div>
        `;

        // Ajouter le modal au DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    closePlanConfig() {
        const modal = document.getElementById('planConfigModal');
        if (modal) modal.remove();
        // Reset zoom config
        this.configZoom = 1;
        this.configPanX = 0;
        this.configPanY = 0;
    },

    // === ZOOM ET PAN POUR LA CONFIGURATION ===
    configZoom: 1,
    configPanX: 0,
    configPanY: 0,
    isConfigPanning: false,

    zoomConfigPlan(delta) {
        this.configZoom = Math.max(0.5, Math.min(4, this.configZoom + delta));
        this.applyConfigTransform();
    },

    wheelConfigZoom(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.1 : 0.1;
        this.configZoom = Math.max(0.5, Math.min(4, this.configZoom + delta));
        this.applyConfigTransform();
    },

    resetConfigZoom() {
        this.configZoom = 1;
        this.configPanX = 0;
        this.configPanY = 0;
        this.applyConfigTransform();
    },

    applyConfigTransform() {
        const container = document.getElementById('planCanvasContainer');
        if (container) {
            container.style.transform = `scale(${this.configZoom}) translate(${this.configPanX}px, ${this.configPanY}px)`;

            // Ajuster la taille des marqueurs pour compenser le zoom
            const inverseScale = 1 / this.configZoom;
            container.style.setProperty('--marker-scale', inverseScale);
            const markers = container.querySelectorAll('.plan-marker');
            markers.forEach(marker => {
                marker.style.transform = `translate(-50%, -50%) scale(${inverseScale})`;
            });
        }
        const indicator = document.getElementById('configZoomLevel');
        if (indicator) {
            indicator.textContent = Math.round(this.configZoom * 100) + '%';
        }
    },

    startConfigPan(event) {
        // Ne pas panner si on clique sur un marqueur ou l'image pour positionner
        if (event.target.closest('.plan-marker') || this.selectedEquipement) return;

        this.isConfigPanning = true;
        const startX = event.clientX - this.configPanX * this.configZoom;
        const startY = event.clientY - this.configPanY * this.configZoom;

        const container = document.getElementById('planCanvasContainer');
        if (container) container.style.cursor = 'grabbing';

        const moveHandler = (e) => {
            if (!this.isConfigPanning) return;
            this.configPanX = (e.clientX - startX) / this.configZoom;
            this.configPanY = (e.clientY - startY) / this.configZoom;
            this.applyConfigTransform();
        };

        const upHandler = () => {
            this.isConfigPanning = false;
            if (container) container.style.cursor = this.selectedEquipement ? 'crosshair' : 'grab';
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };

        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    },

    async handlePlanImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Vérifier la taille (max 20MB pour PDF, 10MB pour images)
        const maxSize = file.type === 'application/pdf' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            App.showToast(`Fichier trop volumineux (max ${file.type === 'application/pdf' ? '20' : '10'}MB)`, 'error');
            return;
        }

        App.showToast('Traitement du plan en cours...', 'info');

        // Si c'est un PDF, le convertir en image
        if (file.type === 'application/pdf') {
            await this.handlePDFUpload(file);
        } else {
            // Sinon, traiter comme une image normale
            await this.handleImageUpload(file);
        }
    },

    // Convertir un PDF en image et l'uploader
    async handlePDFUpload(file) {
        try {
            // Configurer PDF.js
            if (typeof pdfjsLib !== 'undefined') {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }

            App.showToast('Conversion du PDF en image...', 'info');

            // Lire le fichier PDF
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Récupérer la première page
            const page = await pdf.getPage(1);

            // Définir l'échelle pour une bonne qualité (2x pour haute résolution)
            const scale = 2;
            const viewport = page.getViewport({ scale });

            // Créer un canvas pour le rendu
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Rendre la page PDF sur le canvas
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Convertir en image JPEG - compresser pour Firestore (max ~500KB)
            App.showToast('Compression de l\'image...', 'info');
            const maxImageSize = 500 * 1024; // 500KB max pour Firestore

            let quality = 0.8;
            let imageData = canvas.toDataURL('image/jpeg', quality);

            // Réduire la qualité si nécessaire
            while (imageData.length > maxImageSize * 1.4 && quality > 0.2) {
                quality -= 0.1;
                imageData = canvas.toDataURL('image/jpeg', quality);
            }

            // Si toujours trop grand, réduire les dimensions
            if (imageData.length > maxImageSize * 1.4) {
                const scale = 0.7;
                canvas.width = Math.round(viewport.width * scale);
                canvas.height = Math.round(viewport.height * scale);
                context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
                imageData = canvas.toDataURL('image/jpeg', 0.6);
            }

            console.log('Taille image PDF:', Math.round(imageData.length / 1024), 'KB');

            // Sauvegarder l'image
            await this.savePlanImage(imageData);

        } catch (error) {
            console.error('Erreur conversion PDF:', error);
            App.showToast('Erreur lors de la conversion du PDF', 'error');
        }
    },

    // Traiter une image normale
    async handleImageUpload(file) {
        const self = this; // Conserver la référence à this

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        // Toujours compresser pour Firestore (max 500KB)
                        App.showToast('Compression de l\'image...', 'info');
                        const maxSize = 500 * 1024; // 500KB pour Firestore
                        const imageData = self.compressImage(img, maxSize);

                        console.log('Taille image:', Math.round(imageData.length / 1024), 'KB');

                        await self.savePlanImage(imageData);
                        resolve();
                    } catch (error) {
                        console.error('Erreur traitement image:', error);
                        App.showToast('Erreur lors du traitement de l\'image', 'error');
                        reject(error);
                    }
                };
                img.onerror = () => {
                    App.showToast('Erreur: fichier image invalide', 'error');
                    reject(new Error('Image invalide'));
                };
                img.src = e.target.result;
            };
            reader.onerror = () => {
                App.showToast('Erreur lors de la lecture du fichier', 'error');
                reject(new Error('Erreur lecture fichier'));
            };
            reader.readAsDataURL(file);
        });
    },

    // Sauvegarder l'image du plan (commune aux deux types)
    async savePlanImage(imageData) {
        try {
            // Initialiser les données processus si nécessaire
            if (!DataManager.data.processus) DataManager.data.processus = {};
            if (!DataManager.data.processus.planConfig) DataManager.data.processus.planConfig = {};

            // Sauvegarder l'image en base64 directement
            // (Firebase Storage a des problèmes CORS, on stocke en local + Firestore)
            DataManager.data.processus.planConfig.imageData = imageData;
            DataManager.data.processus.planConfig.imageURL = null;

            // Sauvegarder localement et synchroniser vers Firestore
            DataManager.saveToStorage(true);

            App.showToast('Plan sauvegardé!', 'success');

            // Rafraîchir l'affichage
            this.closePlanConfig();
            this.showConfigPlan();

        } catch (error) {
            console.error('Erreur sauvegarde plan:', error);
            App.showToast('Erreur lors de la sauvegarde du plan', 'error');
        }
    },

    // Compresser une image pour qu'elle soit sous la taille max
    compressImage(img, maxSize) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculer les nouvelles dimensions (réduire si nécessaire)
        let width = img.width;
        let height = img.height;
        const maxDimension = 2000; // Max 2000px de côté

        if (width > maxDimension || height > maxDimension) {
            if (width > height) {
                height = Math.round(height * maxDimension / width);
                width = maxDimension;
            } else {
                width = Math.round(width * maxDimension / height);
                height = maxDimension;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Essayer différentes qualités jusqu'à être sous la limite
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > maxSize * 1.4 && quality > 0.3) { // 1.4 pour compenser base64
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
        }

        // Si toujours trop grand, réduire les dimensions
        if (result.length > maxSize * 1.4) {
            width = Math.round(width * 0.7);
            height = Math.round(height * 0.7);
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            result = canvas.toDataURL('image/jpeg', 0.7);
        }

        console.log(`Image compressée: ${Math.round(result.length / 1024)}KB (qualité: ${quality})`);
        return result;
    },

    async removePlanImage() {
        if (confirm('Supprimer l\'image du plan?')) {
            if (DataManager.data.processus?.planConfig) {
                // Supprimer de Firebase Storage si présent
                if (DataManager.data.processus.planConfig.imageURL &&
                    typeof FirebaseManager !== 'undefined' && FirebaseManager.storage) {
                    await FirebaseManager.deletePlanImage();
                }

                DataManager.data.processus.planConfig.imageData = null;
                DataManager.data.processus.planConfig.imageURL = null;
                DataManager.data.processus.planConfig.positions = {};
                DataManager.saveToStorage(true); // Sync Firebase immédiate
            }
            this.closePlanConfig();
            this.showConfigPlan();
            App.showToast('Image supprimée', 'info');
        }
    },

    selectedEquipement: null,

    selectEquipementToPosition(equipement) {
        this.selectedEquipement = equipement;
        // Mettre à jour la sélection visuelle
        document.querySelectorAll('.equip-config-item').forEach(el => el.classList.remove('selected'));
        event.target.closest('.equip-config-item')?.classList.add('selected');
        App.showToast(`Cliquez sur le plan pour positionner: ${equipement}`, 'info');
    },

    handlePlanClick(event) {
        if (!this.selectedEquipement) {
            App.showToast('Sélectionnez d\'abord un équipement dans la liste', 'warning');
            return;
        }

        const img = event.target;
        const rect = img.getBoundingClientRect();

        // Calculer la position en pourcentage
        const x = ((event.clientX - rect.left) / rect.width * 100).toFixed(2);
        const y = ((event.clientY - rect.top) / rect.height * 100).toFixed(2);

        // Sauvegarder la position
        if (!DataManager.data.processus.planConfig.positions) {
            DataManager.data.processus.planConfig.positions = {};
        }
        DataManager.data.processus.planConfig.positions[this.selectedEquipement] = { x, y };
        DataManager.saveToStorage(true); // Sync Firebase immédiate

        // Ajouter le marqueur visuellement
        this.addMarkerToCanvas(this.selectedEquipement, x, y);

        // Marquer comme positionné dans la liste
        document.querySelectorAll('.equip-config-item').forEach(el => {
            if (el.textContent.includes(this.selectedEquipement)) {
                el.classList.add('positioned');
                el.classList.remove('selected');
            }
        });

        App.showToast(`${this.selectedEquipement} positionné!`, 'success');
        this.selectedEquipement = null;
    },

    addMarkerToCanvas(equipement, x, y) {
        // Rafraîchir tous les marqueurs pour recalculer les offsets
        this.refreshAllMarkers();
    },

    refreshAllMarkers() {
        const container = document.getElementById('planCanvasContainer');
        if (!container) return;

        const positions = DataManager.data.processus?.planConfig?.positions || {};

        // Supprimer tous les marqueurs existants
        container.querySelectorAll('.plan-marker').forEach(m => m.remove());

        // Recalculer les offsets
        const offsets = this.calculateMarkerOffsets(positions);

        // Recréer tous les marqueurs avec leurs nouveaux offsets
        Object.entries(positions).forEach(([equip, pos]) => {
            const offset = offsets[equip] || { x: 0, y: 0 };
            const finalX = parseFloat(pos.x) + offset.x;
            const finalY = parseFloat(pos.y) + offset.y;

            const marker = document.createElement('div');
            marker.className = 'plan-marker';
            marker.setAttribute('data-equip', equip);
            marker.style.left = finalX + '%';
            marker.style.top = finalY + '%';
            marker.innerHTML = `<span class="marker-label">${equip}</span>`;
            marker.onclick = (e) => {
                e.stopPropagation();
                if (confirm(`Supprimer le positionnement de ${equip}?`)) {
                    delete DataManager.data.processus.planConfig.positions[equip];
                    DataManager.saveToStorage(true); // Sync Firebase immédiate
                    this.refreshAllMarkers(); // Recalculer les offsets après suppression
                    document.querySelectorAll('.equip-config-item').forEach(el => {
                        if (el.textContent.includes(equip)) {
                            el.classList.remove('positioned');
                        }
                    });
                }
            };
            container.appendChild(marker);
        });

        // Réappliquer le zoom sur les marqueurs
        this.applyConfigTransform();
    },

    // Calcule les offsets pour les marqueurs proches (en éventail)
    calculateMarkerOffsets(positions) {
        const entries = Object.entries(positions);
        const offsets = {};
        const threshold = 1.5; // Distance en % pour considérer des marqueurs comme "proches"
        const offsetDistance = 1.2; // Distance de décalage en %

        // Grouper les marqueurs proches
        const groups = [];
        const assigned = new Set();

        entries.forEach(([equip, pos]) => {
            if (assigned.has(equip)) return;

            const group = [[equip, pos]];
            assigned.add(equip);

            entries.forEach(([otherEquip, otherPos]) => {
                if (assigned.has(otherEquip)) return;
                const dx = parseFloat(pos.x) - parseFloat(otherPos.x);
                const dy = parseFloat(pos.y) - parseFloat(otherPos.y);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < threshold) {
                    group.push([otherEquip, otherPos]);
                    assigned.add(otherEquip);
                }
            });

            groups.push(group);
        });

        // Calculer les offsets pour chaque groupe
        groups.forEach(group => {
            if (group.length === 1) {
                offsets[group[0][0]] = { x: 0, y: 0 };
            } else {
                group.forEach(([equip], index) => {
                    const angle = (2 * Math.PI * index) / group.length - Math.PI / 2;
                    offsets[equip] = {
                        x: Math.cos(angle) * offsetDistance,
                        y: Math.sin(angle) * offsetDistance
                    };
                });
            }
        });

        return offsets;
    },

    renderEquipementMarkers(positions) {
        const offsets = this.calculateMarkerOffsets(positions);

        return Object.entries(positions).map(([equip, pos]) => {
            const offset = offsets[equip] || { x: 0, y: 0 };
            const finalX = parseFloat(pos.x) + offset.x;
            const finalY = parseFloat(pos.y) + offset.y;

            return `
            <div class="plan-marker" data-equip="${equip}" style="left: ${finalX}%; top: ${finalY}%"
                 onclick="event.stopPropagation(); Screens.removeEquipPosition('${equip}', this)">
                <span class="marker-label">${equip}</span>
            </div>
        `}).join('');
    },

    removeEquipPosition(equip, markerEl) {
        if (confirm(`Supprimer le positionnement de ${equip}?`)) {
            delete DataManager.data.processus.planConfig.positions[equip];
            markerEl.remove();
            document.querySelectorAll('.equip-config-item').forEach(el => {
                if (el.textContent.includes(equip)) {
                    el.classList.remove('positioned');
                }
            });
        }
    },

    getEquipementsList() {
        const travaux = DataManager.getTravaux();
        const equipements = [...new Set(travaux.map(t => t.equipement).filter(Boolean))];
        return equipements.sort();
    },

    savePlanConfig() {
        DataManager.saveToStorage(true); // Sync immédiate
        App.showToast('Configuration du plan sauvegardée!', 'success');
        this.closePlanConfig();
        // Rafraîchir la vue du plan
        if (this.realisationView === 'plan') {
            this.setRealisationView('plan');
        }
    },

    // === JOURNAL DE BORD (Points de presse) ===
    renderJournalDeBord() {
        const journals = DataManager.data.processus?.journals || {};
        const journalDuJour = journals[this.journalDate] || this.getEmptyJournal();

        // Obtenir la liste des dates avec des journaux sauvegardés
        const journalDates = Object.keys(journals).filter(d => this.isJournalComplete(journals[d])).sort().reverse();

        return `
            <div class="journal-screen">
                <div class="journal-header">
                    <div class="journal-title-row">
                        <h3>📰 Journal de bord - Point de presse</h3>
                        <button class="btn btn-sm ${this.showJournalHistory ? 'btn-primary' : 'btn-outline'}"
                                onclick="Screens.toggleJournalHistory()">
                            📚 Historique (${journalDates.length})
                        </button>
                    </div>
                    <div class="journal-date-nav">
                        <button class="btn btn-sm btn-outline" onclick="Screens.changeJournalDate(-1)">◀</button>
                        <input type="date" value="${this.journalDate}" onchange="Screens.setJournalDate(this.value)">
                        <button class="btn btn-sm btn-outline" onclick="Screens.changeJournalDate(1)">▶</button>
                        ${journals[this.journalDate] ? '<span class="journal-saved-badge">✓ Sauvegardé</span>' : ''}
                    </div>
                </div>

                ${this.showJournalHistory ? this.renderJournalHistory(journals, journalDates) : ''}

                <div class="journal-grid">
                    <!-- Upside / Downside -->
                    <div class="card journal-card">
                        <div class="card-header dual">
                            <div class="upside-header">✅ Upside (Points positifs)</div>
                            <div class="downside-header">⚠️ Downside (Points négatifs)</div>
                        </div>
                        <div class="updown-grid">
                            <div class="upside-content">
                                <textarea id="journalUpside" placeholder="Points positifs du jour..."
                                          onchange="Screens.saveJournalField('upside', this.value)">${journalDuJour.upside || ''}</textarea>
                            </div>
                            <div class="downside-content">
                                <textarea id="journalDownside" placeholder="Points négatifs / risques..."
                                          onchange="Screens.saveJournalField('downside', this.value)">${journalDuJour.downside || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Statut coûts -->
                    <div class="card journal-card small">
                        <div class="card-header">
                            <h4>💰 Statut suivi coûts</h4>
                        </div>
                        <select id="journalCouts" class="form-control"
                                onchange="Screens.saveJournalField('statutCouts', this.value)">
                            <option value="favorable" ${journalDuJour.statutCouts === 'favorable' ? 'selected' : ''}>✅ Favorable</option>
                            <option value="conforme" ${journalDuJour.statutCouts === 'conforme' ? 'selected' : ''}>🟡 Conforme</option>
                            <option value="depassement" ${journalDuJour.statutCouts === 'depassement' ? 'selected' : ''}>🔴 Dépassement</option>
                        </select>
                        <textarea id="journalCoutsComment" placeholder="Commentaire coûts..."
                                  onchange="Screens.saveJournalField('coutsComment', this.value)">${journalDuJour.coutsComment || ''}</textarea>
                    </div>

                    <!-- Chemins critiques -->
                    <div class="card journal-card">
                        <div class="card-header">
                            <h4>🎯 État des chemins critiques</h4>
                        </div>
                        <div class="chemins-critiques">
                            ${(journalDuJour.cheminsCritiques || [{nom: '', statut: ''}]).map((cc, i) => `
                                <div class="chemin-critique">
                                    <input type="text" placeholder="Nom du chemin critique" value="${cc.nom}"
                                           onchange="Screens.saveCheminCritique(${i}, 'nom', this.value)">
                                    <input type="text" placeholder="Statut" value="${cc.statut}"
                                           onchange="Screens.saveCheminCritique(${i}, 'statut', this.value)">
                                </div>
                            `).join('')}
                            <button class="btn btn-sm btn-outline" onclick="Screens.addCheminCritique()">+ Ajouter chemin</button>
                        </div>
                    </div>

                    <!-- Incidents / Sécurité -->
                    <div class="card journal-card">
                        <div class="card-header">
                            <h4>🛡️ Sécurité - Incidents</h4>
                        </div>
                        <div class="securite-grid">
                            <div class="securite-compteurs">
                                <div class="compteur">
                                    <label>Quasi (Danger observé)</label>
                                    <input type="number" value="${journalDuJour.quasi || 0}" min="0"
                                           onchange="Screens.saveJournalField('quasi', parseInt(this.value))">
                                </div>
                                <div class="compteur">
                                    <label>Règle d'or</label>
                                    <input type="number" value="${journalDuJour.regleOr || 0}" min="0"
                                           onchange="Screens.saveJournalField('regleOr', parseInt(this.value))">
                                </div>
                                <div class="compteur">
                                    <label>Incident</label>
                                    <input type="number" value="${journalDuJour.incident || 0}" min="0"
                                           onchange="Screens.saveJournalField('incident', parseInt(this.value))">
                                </div>
                            </div>
                            <div class="incident-detail">
                                <label>Description incident du jour</label>
                                <textarea placeholder="Équipe, date/heure, description..."
                                          onchange="Screens.saveJournalField('incidentDescription', this.value)">${journalDuJour.incidentDescription || ''}</textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="journal-actions">
                    <button class="btn btn-outline" onclick="Screens.exportJournal()">📄 Exporter PDF</button>
                    <button class="btn btn-primary" onclick="Screens.saveJournal()">💾 Sauvegarder</button>
                </div>
            </div>
        `;
    },

    getEmptyJournal() {
        return {
            upside: '',
            downside: '',
            statutCouts: 'conforme',
            coutsComment: '',
            cheminsCritiques: [{nom: '', statut: ''}, {nom: '', statut: ''}, {nom: '', statut: ''}, {nom: '', statut: ''}],
            quasi: 0,
            regleOr: 0,
            incident: 0,
            incidentDescription: ''
        };
    },

    showJournalHistory: false,

    toggleJournalHistory() {
        this.showJournalHistory = !this.showJournalHistory;
        document.querySelector('.exec-content').innerHTML = this.renderJournalDeBord();
    },

    isJournalComplete(journal) {
        if (!journal) return false;
        // Un journal est considéré complet s'il a du contenu significatif
        return journal.upside || journal.downside || journal.coutsComment ||
               journal.incidentDescription || journal.quasi > 0 ||
               journal.regleOr > 0 || journal.incident > 0 ||
               (journal.cheminsCritiques && journal.cheminsCritiques.some(cc => cc.nom));
    },

    renderJournalHistory(journals, dates) {
        if (dates.length === 0) {
            return `
                <div class="journal-history-panel">
                    <div class="empty-state small">Aucun journal sauvegardé</div>
                </div>
            `;
        }

        return `
            <div class="journal-history-panel">
                <h4>📚 Historique des points de presse</h4>
                <div class="journal-history-list">
                    ${dates.map(date => {
                        const j = journals[date];
                        const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
                            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
                        });
                        const hasIncident = j.incident > 0 || j.regleOr > 0;
                        return `
                            <div class="journal-history-item ${date === this.journalDate ? 'active' : ''} ${hasIncident ? 'has-incident' : ''}"
                                 onclick="Screens.setJournalDate('${date}')">
                                <div class="history-date">
                                    <strong>${dateFormatted}</strong>
                                    ${hasIncident ? '<span class="incident-flag">⚠️</span>' : ''}
                                </div>
                                <div class="history-preview">
                                    ${j.upside ? `<span class="preview-upside">✅ ${j.upside.substring(0, 40)}...</span>` : ''}
                                    ${j.downside ? `<span class="preview-downside">⚠️ ${j.downside.substring(0, 40)}...</span>` : ''}
                                </div>
                                <div class="history-stats">
                                    <span title="Quasi-accidents">🔶 ${j.quasi || 0}</span>
                                    <span title="Règles d'or">🟡 ${j.regleOr || 0}</span>
                                    <span title="Incidents">🔴 ${j.incident || 0}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    setJournalDate(date) {
        this.journalDate = date;
        document.querySelector('.exec-content').innerHTML = this.renderJournalDeBord();
    },

    changeJournalDate(delta) {
        const date = new Date(this.journalDate);
        date.setDate(date.getDate() + delta);
        this.setJournalDate(date.toISOString().split('T')[0]);
    },

    saveJournalField(field, value) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.journals) DataManager.data.processus.journals = {};
        if (!DataManager.data.processus.journals[this.journalDate]) {
            DataManager.data.processus.journals[this.journalDate] = this.getEmptyJournal();
        }
        DataManager.data.processus.journals[this.journalDate][field] = value;
        DataManager.saveToStorage();
    },

    saveCheminCritique(index, field, value) {
        if (!DataManager.data.processus?.journals?.[this.journalDate]) {
            this.saveJournalField('cheminsCritiques', this.getEmptyJournal().cheminsCritiques);
        }
        const journal = DataManager.data.processus.journals[this.journalDate];
        if (!journal.cheminsCritiques) journal.cheminsCritiques = [];
        if (!journal.cheminsCritiques[index]) journal.cheminsCritiques[index] = {nom: '', statut: ''};
        journal.cheminsCritiques[index][field] = value;
        DataManager.saveToStorage();
    },

    addCheminCritique() {
        if (!DataManager.data.processus?.journals?.[this.journalDate]) {
            this.saveJournalField('cheminsCritiques', []);
        }
        DataManager.data.processus.journals[this.journalDate].cheminsCritiques.push({nom: '', statut: ''});
        DataManager.saveToStorage();
        document.querySelector('.exec-content').innerHTML = this.renderJournalDeBord();
    },

    saveJournal() {
        DataManager.saveToStorage(true); // Sync immédiate
        App.showToast('Journal sauvegardé', 'success');
    },

    exportJournal() {
        App.showToast('Export PDF à venir', 'info');
    },

    // === DEMANDES QUOTIDIENNES ===
    renderDemandesQuotidiennes() {
        const demandes = DataManager.data.processus?.demandes || {};
        const demandesJour = demandes[this.executionDate] || {grues: [], echafauds: [], verrouillages: []};

        return `
            <div class="demandes-screen">
                <div class="demandes-header">
                    <h3>📋 Demandes quotidiennes</h3>
                    <input type="date" value="${this.executionDate}" onchange="Screens.setExecutionDate(this.value); Screens.switchExecutionTab('demandes')">
                </div>

                <div class="demandes-sections">
                    <!-- Grues -->
                    <div class="card demande-section">
                        <div class="card-header">
                            <h4>🏗️ Grues</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.showAddDemandeModal('grues')">+ Ajouter</button>
                        </div>
                        ${this.renderDemandesTable(demandesJour.grues, 'grues')}
                    </div>

                    <!-- Échafauds -->
                    <div class="card demande-section">
                        <div class="card-header">
                            <h4>🪜 Échafauds</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.showAddDemandeModal('echafauds')">+ Ajouter</button>
                        </div>
                        ${this.renderDemandesTable(demandesJour.echafauds, 'echafauds')}
                    </div>

                    <!-- Verrouillages -->
                    <div class="card demande-section">
                        <div class="card-header">
                            <h4>🔒 Verrouillages</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.showAddDemandeModal('verrouillages')">+ Ajouter</button>
                        </div>
                        ${this.renderDemandesTable(demandesJour.verrouillages, 'verrouillages')}
                    </div>
                </div>
            </div>
        `;
    },

    renderDemandesTable(demandes, type) {
        if (!demandes || demandes.length === 0) {
            return `<div class="empty-state small">Aucune demande pour cette date</div>`;
        }

        return `
            <div class="demandes-table-wrapper">
                <table class="demandes-table">
                    <thead>
                        <tr>
                            <th>Demandeur</th>
                            <th>OT</th>
                            <th>Date</th>
                            <th>Localisation</th>
                            <th>Commentaire</th>
                            <th>Statut</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${demandes.map((d, i) => `
                            <tr class="demande-row ${d.statut || 'demande'}">
                                <td>${d.demandeur || '-'}</td>
                                <td class="ot-cell">${d.ot || '-'}</td>
                                <td>${d.dateDemande || '-'}</td>
                                <td>${d.localisation || '-'}</td>
                                <td class="comment-cell" title="${d.commentaire || ''}">${d.commentaire || '-'}</td>
                                <td>
                                    <select class="statut-select ${d.statut || 'demande'}" onchange="Screens.updateDemandeStatut('${type}', ${i}, this.value)">
                                        <option value="demande" ${d.statut === 'demande' ? 'selected' : ''}>Demandé</option>
                                        <option value="approuve" ${d.statut === 'approuve' ? 'selected' : ''}>Approuvé</option>
                                        <option value="enplace" ${d.statut === 'enplace' ? 'selected' : ''}>En place</option>
                                        <option value="termine" ${d.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn-icon btn-danger" onclick="Screens.removeDemande('${type}', ${i})" title="Supprimer">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    showAddDemandeModal(type) {
        const typeLabels = {grues: 'Grue', echafauds: 'Échafaud', verrouillages: 'Verrouillage'};

        const html = `
            <div class="modal-overlay" id="addDemandeModal" onclick="if(event.target === this) this.remove()">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>➕ Nouvelle demande - ${typeLabels[type]}</h3>
                        <button class="modal-close" onclick="document.getElementById('addDemandeModal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <form id="demandeForm" class="demande-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Demandeur *</label>
                                    <input type="text" id="demandeDemandeur" class="form-control" required placeholder="Nom du demandeur">
                                </div>
                                <div class="form-group">
                                    <label>OT</label>
                                    <input type="text" id="demandeOT" class="form-control" placeholder="Numéro OT (optionnel)">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date de la demande</label>
                                    <input type="date" id="demandeDate" class="form-control" value="${this.executionDate}">
                                </div>
                                <div class="form-group">
                                    <label>Localisation *</label>
                                    <input type="text" id="demandeLocalisation" class="form-control" required placeholder="Lieu / Équipement">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Commentaire</label>
                                <textarea id="demandeCommentaire" class="form-control" rows="3" placeholder="Détails, instructions spéciales..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('addDemandeModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="Screens.submitDemande('${type}')">Ajouter</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('demandeDemandeur').focus();
    },

    submitDemande(type) {
        const demandeur = document.getElementById('demandeDemandeur').value.trim();
        const localisation = document.getElementById('demandeLocalisation').value.trim();

        if (!demandeur || !localisation) {
            App.showToast('Veuillez remplir les champs obligatoires', 'error');
            return;
        }

        const ot = document.getElementById('demandeOT').value.trim();
        const dateDemande = document.getElementById('demandeDate').value;
        const commentaire = document.getElementById('demandeCommentaire').value.trim();

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.demandes) DataManager.data.processus.demandes = {};
        if (!DataManager.data.processus.demandes[this.executionDate]) {
            DataManager.data.processus.demandes[this.executionDate] = {grues: [], echafauds: [], verrouillages: []};
        }

        DataManager.data.processus.demandes[this.executionDate][type].push({
            demandeur,
            ot,
            dateDemande,
            localisation,
            commentaire,
            statut: 'demande',
            dateCreation: new Date().toISOString()
        });

        DataManager.saveToStorage();
        document.getElementById('addDemandeModal').remove();
        document.querySelector('.exec-content').innerHTML = this.renderDemandesQuotidiennes();
        App.showToast('Demande ajoutée', 'success');
    },

    updateDemandeStatut(type, index, statut) {
        if (DataManager.data.processus?.demandes?.[this.executionDate]?.[type]?.[index]) {
            DataManager.data.processus.demandes[this.executionDate][type][index].statut = statut;
            DataManager.saveToStorage();
        }
    },

    removeDemande(type, index) {
        if (confirm('Supprimer cette demande ?')) {
            DataManager.data.processus.demandes[this.executionDate][type].splice(index, 1);
            DataManager.saveToStorage();
            document.querySelector('.exec-content').innerHTML = this.renderDemandesQuotidiennes();
        }
    },

    // === POST-MORTEM ===
    postMortemView: 'preparation', // 'preparation', 'execution', 'couts', 'lecons', 'actions', 'quarts'

    setPostMortemView(view) {
        this.postMortemView = view;
        document.querySelector('.pm-content').innerHTML = this.renderPostMortemContent();
    },

    renderPostMortem() {
        const actions = DataManager.getPostMortemActions();
        const ouvertes = actions.filter(a => a.statut === 'Ouvert').length;
        const fermees = actions.filter(a => a.statut === 'Fermé').length;

        return `
            <div class="pm-nav">
                <button class="pm-nav-btn ${this.postMortemView === 'preparation' ? 'active' : ''}"
                        onclick="Screens.setPostMortemView('preparation')">📋 Préparation</button>
                <button class="pm-nav-btn ${this.postMortemView === 'execution' ? 'active' : ''}"
                        onclick="Screens.setPostMortemView('execution')">⚡ Exécution</button>
                <button class="pm-nav-btn ${this.postMortemView === 'couts' ? 'active' : ''}"
                        onclick="Screens.setPostMortemView('couts')">💰 Coûts</button>
                <button class="pm-nav-btn ${this.postMortemView === 'lecons' ? 'active' : ''}"
                        onclick="Screens.setPostMortemView('lecons')">💡 Leçons Apprises</button>
                <button class="pm-nav-btn ${this.postMortemView === 'actions' ? 'active' : ''}"
                        onclick="Screens.setPostMortemView('actions')">
                    ✅ Actions
                    ${ouvertes > 0 ? `<span class="pm-badge">${ouvertes}</span>` : ''}
                </button>
            </div>

            <div class="pm-content">
                ${this.renderPostMortemContent()}
            </div>
        `;
    },

    renderPostMortemContent() {
        switch(this.postMortemView) {
            case 'preparation': return this.renderPMPreparation();
            case 'execution': return this.renderPMExecution();
            case 'couts': return this.renderPMCouts();
            case 'lecons': return this.renderPMLecons();
            case 'actions': return this.renderPMActions();
            default: return this.renderPMPreparation();
        }
    },

    // Évaluation de la Préparation
    renderPMPreparation() {
        const pm = DataManager.data.processus?.postMortem || {};
        const prep = pm.preparation || {};

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Évaluation de la Préparation</h3>
                    <button class="btn btn-primary btn-sm" onclick="Screens.savePMSection('preparation')">💾 Sauvegarder</button>
                </div>

                <div class="pm-section">
                    <h4>Qualité du Scope de Travail</h4>
                    <div class="pm-rating-group">
                        <label>Note globale:</label>
                        <div class="pm-rating" id="prepScopeRating">
                            ${this.renderRatingStars('prepScope', prep.scopeRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires sur le scope:</label>
                        <textarea class="form-control" id="prepScopeComment" rows="2">${prep.scopeComment || ''}</textarea>
                    </div>
                    <div class="pm-checklist">
                        <label><input type="checkbox" id="prepScopeComplete" ${prep.scopeComplete ? 'checked' : ''}> Scope complet et bien défini</label>
                        <label><input type="checkbox" id="prepScopeReviewed" ${prep.scopeReviewed ? 'checked' : ''}> Revue du post-mortem précédent effectuée</label>
                        <label><input type="checkbox" id="prepScopeValidated" ${prep.scopeValidated ? 'checked' : ''}> Évaluation terrain réalisée</label>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Planification</h4>
                    <div class="pm-rating-group">
                        <label>Note globale:</label>
                        <div class="pm-rating" id="prepPlanRating">
                            ${this.renderRatingStars('prepPlan', prep.planRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires sur la planification:</label>
                        <textarea class="form-control" id="prepPlanComment" rows="2">${prep.planComment || ''}</textarea>
                    </div>
                    <div class="pm-checklist">
                        <label><input type="checkbox" id="prepPlanRealistic" ${prep.planRealistic ? 'checked' : ''}> Calendrier réaliste</label>
                        <label><input type="checkbox" id="prepPlanCritical" ${prep.planCritical ? 'checked' : ''}> Chemins critiques identifiés</label>
                        <label><input type="checkbox" id="prepPlanContingency" ${prep.planContingency ? 'checked' : ''}> Marges de contingence prévues</label>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Ressources</h4>
                    <div class="pm-rating-group">
                        <label>Note globale:</label>
                        <div class="pm-rating" id="prepResRating">
                            ${this.renderRatingStars('prepRes', prep.resRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires sur les ressources:</label>
                        <textarea class="form-control" id="prepResComment" rows="2">${prep.resComment || ''}</textarea>
                    </div>
                    <div class="pm-checklist">
                        <label><input type="checkbox" id="prepResTeam" ${prep.resTeam ? 'checked' : ''}> Équipes suffisantes et qualifiées</label>
                        <label><input type="checkbox" id="prepResTools" ${prep.resTools ? 'checked' : ''}> Outillage disponible</label>
                        <label><input type="checkbox" id="prepResParts" ${prep.resParts ? 'checked' : ''}> Pièces de rechange commandées à temps</label>
                        <label><input type="checkbox" id="prepResContractors" ${prep.resContractors ? 'checked' : ''}> Entrepreneurs externes confirmés</label>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Communication Pré-Arrêt</h4>
                    <div class="pm-rating-group">
                        <label>Note globale:</label>
                        <div class="pm-rating" id="prepCommRating">
                            ${this.renderRatingStars('prepComm', prep.commRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires:</label>
                        <textarea class="form-control" id="prepCommComment" rows="2">${prep.commComment || ''}</textarea>
                    </div>
                    <div class="pm-checklist">
                        <label><input type="checkbox" id="prepCommMeetings" ${prep.commMeetings ? 'checked' : ''}> Réunions de planification tenues</label>
                        <label><input type="checkbox" id="prepCommStakeholders" ${prep.commStakeholders ? 'checked' : ''}> Parties prenantes informées</label>
                        <label><input type="checkbox" id="prepCommDocs" ${prep.commDocs ? 'checked' : ''}> Documentation distribuée</label>
                    </div>
                </div>
            </div>
        `;
    },

    renderRatingStars(prefix, rating) {
        return [1, 2, 3, 4, 5].map(i => `
            <span class="star ${i <= rating ? 'filled' : ''}"
                  onclick="Screens.setRating('${prefix}', ${i})">★</span>
        `).join('');
    },

    setRating(prefix, value) {
        const container = document.getElementById(`${prefix}Rating`);
        if (container) {
            container.innerHTML = this.renderRatingStars(prefix, value);
            container.dataset.rating = value;
        }
    },

    // Évaluation de l'Exécution
    renderPMExecution() {
        const pm = DataManager.data.processus?.postMortem || {};
        const exec = pm.execution || {};

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚡ Évaluation de l'Exécution</h3>
                    <button class="btn btn-primary btn-sm" onclick="Screens.savePMSection('execution')">💾 Sauvegarder</button>
                </div>

                <div class="pm-section">
                    <h4>Respect du Calendrier</h4>
                    <div class="grid-3">
                        <div class="form-group">
                            <label>Durée prévue (jours)</label>
                            <input type="number" class="form-control" id="execDureePrevue" value="${exec.dureePrevue || ''}">
                        </div>
                        <div class="form-group">
                            <label>Durée réelle (jours)</label>
                            <input type="number" class="form-control" id="execDureeReelle" value="${exec.dureeReelle || ''}">
                        </div>
                        <div class="form-group">
                            <label>Écart</label>
                            <input type="text" class="form-control" id="execEcart" readonly
                                   value="${exec.dureePrevue && exec.dureeReelle ? (exec.dureeReelle - exec.dureePrevue) + ' jours' : '-'}">
                        </div>
                    </div>
                    <div class="pm-rating-group">
                        <label>Note:</label>
                        <div class="pm-rating" id="execCalRating">
                            ${this.renderRatingStars('execCal', exec.calRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires:</label>
                        <textarea class="form-control" id="execCalComment" rows="2">${exec.calComment || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Sécurité (EHS)</h4>
                    <div class="grid-4">
                        <div class="form-group">
                            <label>Quasi-incidents</label>
                            <input type="number" class="form-control" id="execQuasi" value="${exec.quasi || 0}">
                        </div>
                        <div class="form-group">
                            <label>Règles d'or</label>
                            <input type="number" class="form-control" id="execRegleOr" value="${exec.regleOr || 0}">
                        </div>
                        <div class="form-group">
                            <label>Incidents</label>
                            <input type="number" class="form-control" id="execIncidents" value="${exec.incidents || 0}">
                        </div>
                        <div class="form-group">
                            <label>Accidents</label>
                            <input type="number" class="form-control" id="execAccidents" value="${exec.accidents || 0}">
                        </div>
                    </div>
                    <div class="pm-rating-group">
                        <label>Note sécurité:</label>
                        <div class="pm-rating" id="execSecuRating">
                            ${this.renderRatingStars('execSecu', exec.secuRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires sécurité:</label>
                        <textarea class="form-control" id="execSecuComment" rows="2">${exec.secuComment || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Qualité des Travaux</h4>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Travaux complétés</label>
                            <input type="number" class="form-control" id="execCompletes" value="${exec.completes || ''}">
                        </div>
                        <div class="form-group">
                            <label>Reprises nécessaires</label>
                            <input type="number" class="form-control" id="execReprises" value="${exec.reprises || 0}">
                        </div>
                    </div>
                    <div class="pm-rating-group">
                        <label>Note qualité:</label>
                        <div class="pm-rating" id="execQualRating">
                            ${this.renderRatingStars('execQual', exec.qualRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires:</label>
                        <textarea class="form-control" id="execQualComment" rows="2">${exec.qualComment || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Coordination des Équipes</h4>
                    <div class="pm-rating-group">
                        <label>Note coordination:</label>
                        <div class="pm-rating" id="execCoordRating">
                            ${this.renderRatingStars('execCoord', exec.coordRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires:</label>
                        <textarea class="form-control" id="execCoordComment" rows="2">${exec.coordComment || ''}</textarea>
                    </div>
                    <div class="pm-checklist">
                        <label><input type="checkbox" id="execCoordDaily" ${exec.coordDaily ? 'checked' : ''}> Réunions quotidiennes efficaces</label>
                        <label><input type="checkbox" id="execCoordShift" ${exec.coordShift ? 'checked' : ''}> Passation de quart fluide</label>
                        <label><input type="checkbox" id="execCoordContractors" ${exec.coordContractors ? 'checked' : ''}> Bonne coordination entrepreneurs</label>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Gestion des Imprévus</h4>
                    <div class="form-group">
                        <label>Nombre de travaux imprévus ajoutés</label>
                        <input type="number" class="form-control" id="execImprevus" value="${exec.imprevus || 0}" style="width: 150px;">
                    </div>
                    <div class="pm-rating-group">
                        <label>Note gestion imprévus:</label>
                        <div class="pm-rating" id="execImprevuRating">
                            ${this.renderRatingStars('execImprevu', exec.imprevuRating || 0)}
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Commentaires:</label>
                        <textarea class="form-control" id="execImprevuComment" rows="2">${exec.imprevuComment || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    // Analyse des Coûts
    renderPMCouts() {
        const pm = DataManager.data.processus?.postMortem || {};
        const couts = pm.couts || {};

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💰 Analyse des Coûts</h3>
                    <button class="btn btn-primary btn-sm" onclick="Screens.savePMSection('couts')">💾 Sauvegarder</button>
                </div>

                <div class="pm-section">
                    <h4>Budget Global</h4>
                    <div class="grid-3">
                        <div class="form-group">
                            <label>Budget prévu ($)</label>
                            <input type="number" class="form-control" id="coutsBudgetPrevu" value="${couts.budgetPrevu || ''}">
                        </div>
                        <div class="form-group">
                            <label>Coût réel ($)</label>
                            <input type="number" class="form-control" id="coutsBudgetReel" value="${couts.budgetReel || ''}">
                        </div>
                        <div class="form-group">
                            <label>Écart (%)</label>
                            <input type="text" class="form-control" id="coutsEcart" readonly
                                   value="${couts.budgetPrevu && couts.budgetReel ?
                                       (((couts.budgetReel - couts.budgetPrevu) / couts.budgetPrevu) * 100).toFixed(1) + '%' : '-'}">
                        </div>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>Détail par Catégorie</h4>
                    <table class="pm-table">
                        <thead>
                            <tr>
                                <th>Catégorie</th>
                                <th>Budget ($)</th>
                                <th>Réel ($)</th>
                                <th>Écart</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Main d'œuvre interne</td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsMOIPrevu" value="${couts.moiPrevu || ''}"></td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsMOIReel" value="${couts.moiReel || ''}"></td>
                                <td class="ecart-cell">${this.calcEcart(couts.moiPrevu, couts.moiReel)}</td>
                            </tr>
                            <tr>
                                <td>Entrepreneurs externes</td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsExtPrevu" value="${couts.extPrevu || ''}"></td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsExtReel" value="${couts.extReel || ''}"></td>
                                <td class="ecart-cell">${this.calcEcart(couts.extPrevu, couts.extReel)}</td>
                            </tr>
                            <tr>
                                <td>Pièces de rechange</td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsPiecesPrevu" value="${couts.piecesPrevu || ''}"></td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsPiecesReel" value="${couts.piecesReel || ''}"></td>
                                <td class="ecart-cell">${this.calcEcart(couts.piecesPrevu, couts.piecesReel)}</td>
                            </tr>
                            <tr>
                                <td>Location équipement</td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsLocPrevu" value="${couts.locPrevu || ''}"></td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsLocReel" value="${couts.locReel || ''}"></td>
                                <td class="ecart-cell">${this.calcEcart(couts.locPrevu, couts.locReel)}</td>
                            </tr>
                            <tr>
                                <td>Autres</td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsAutresPrevu" value="${couts.autresPrevu || ''}"></td>
                                <td><input type="number" class="form-control form-control-sm" id="coutsAutresReel" value="${couts.autresReel || ''}"></td>
                                <td class="ecart-cell">${this.calcEcart(couts.autresPrevu, couts.autresReel)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="pm-section">
                    <h4>Analyse des Dépassements</h4>
                    <div class="form-group">
                        <label>Principales causes de dépassement:</label>
                        <textarea class="form-control" id="coutsCauses" rows="3">${couts.causes || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Opportunités d'économies identifiées:</label>
                        <textarea class="form-control" id="coutsOpportunites" rows="3">${couts.opportunites || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    calcEcart(prevu, reel) {
        if (!prevu || !reel) return '-';
        const ecart = ((reel - prevu) / prevu) * 100;
        const classe = ecart > 0 ? 'ecart-negatif' : 'ecart-positif';
        return `<span class="${classe}">${ecart > 0 ? '+' : ''}${ecart.toFixed(1)}%</span>`;
    },

    // Leçons Apprises
    renderPMLecons() {
        const pm = DataManager.data.processus?.postMortem || {};
        const lecons = pm.lecons || { bonnes: [], mauvaises: [] };

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">💡 Leçons Apprises</h3>
                    <button class="btn btn-primary btn-sm" onclick="Screens.savePMSection('lecons')">💾 Sauvegarder</button>
                </div>

                <div class="pm-lecons-grid">
                    <div class="pm-section pm-good">
                        <h4>✅ Ce qui a bien fonctionné</h4>
                        <div class="lecons-list" id="leconsBonnes">
                            ${lecons.bonnes.map((l, i) => `
                                <div class="lecon-item">
                                    <span class="lecon-text">${l}</span>
                                    <button class="btn btn-sm btn-danger" onclick="Screens.removeLecon('bonnes', ${i})">×</button>
                                </div>
                            `).join('') || '<p class="empty-msg">Aucune leçon ajoutée</p>'}
                        </div>
                        <div class="lecon-add">
                            <input type="text" class="form-control" id="newLeconBonne" placeholder="Ajouter une bonne pratique...">
                            <button class="btn btn-success btn-sm" onclick="Screens.addLecon('bonnes')">+</button>
                        </div>
                    </div>

                    <div class="pm-section pm-bad">
                        <h4>❌ Ce qui n'a pas bien fonctionné</h4>
                        <div class="lecons-list" id="leconsMauvaises">
                            ${lecons.mauvaises.map((l, i) => `
                                <div class="lecon-item">
                                    <span class="lecon-text">${l}</span>
                                    <button class="btn btn-sm btn-danger" onclick="Screens.removeLecon('mauvaises', ${i})">×</button>
                                </div>
                            `).join('') || '<p class="empty-msg">Aucune leçon ajoutée</p>'}
                        </div>
                        <div class="lecon-add">
                            <input type="text" class="form-control" id="newLeconMauvaise" placeholder="Ajouter un problème rencontré...">
                            <button class="btn btn-danger btn-sm" onclick="Screens.addLecon('mauvaises')">+</button>
                        </div>
                    </div>
                </div>

                <div class="pm-section" style="margin-top: 20px;">
                    <h4>📝 Recommandations pour le prochain arrêt</h4>
                    <div class="form-group">
                        <textarea class="form-control" id="leconsRecommandations" rows="4">${lecons.recommandations || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    },

    addLecon(type) {
        const inputId = type === 'bonnes' ? 'newLeconBonne' : 'newLeconMauvaise';
        const input = document.getElementById(inputId);
        const text = input.value.trim();
        if (!text) return;

        if (!DataManager.data.processus.postMortem) {
            DataManager.data.processus.postMortem = {};
        }
        if (!DataManager.data.processus.postMortem.lecons) {
            DataManager.data.processus.postMortem.lecons = { bonnes: [], mauvaises: [] };
        }
        DataManager.data.processus.postMortem.lecons[type].push(text);
        DataManager.saveToStorage();
        input.value = '';
        document.querySelector('.pm-content').innerHTML = this.renderPMLecons();
    },

    removeLecon(type, index) {
        DataManager.data.processus.postMortem.lecons[type].splice(index, 1);
        DataManager.saveToStorage();
        document.querySelector('.pm-content').innerHTML = this.renderPMLecons();
    },

    // Actions (garde l'existant)
    renderPMActions() {
        const actions = DataManager.getPostMortemActions();
        const ouvertes = actions.filter(a => a.statut === 'Ouvert').length;
        const fermees = actions.filter(a => a.statut === 'Fermé').length;

        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon blue">📋</div>
                    <div class="stat-info">
                        <h3>${actions.length}</h3>
                        <p>Total Actions</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon red">🔓</div>
                    <div class="stat-info">
                        <h3>${ouvertes}</h3>
                        <p>Ouvertes</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon green">✅</div>
                    <div class="stat-info">
                        <h3>${fermees}</h3>
                        <p>Fermées</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Nouvelle Action</h3>
                </div>
                <form id="newActionForm" onsubmit="App.addPostMortemAction(event)">
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Titre *</label>
                            <input type="text" class="form-control" id="actionTitre" required>
                        </div>
                        <div class="form-group">
                            <label>Type</label>
                            <select class="form-control" id="actionType">
                                <option value="Amélioration">Amélioration</option>
                                <option value="Problème">Problème rencontré</option>
                                <option value="Sécurité">Sécurité</option>
                                <option value="Qualité">Qualité</option>
                                <option value="Organisation">Organisation</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="form-control" id="actionDescription" rows="3"></textarea>
                    </div>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Responsable</label>
                            <input type="text" class="form-control" id="actionResponsable">
                        </div>
                        <div class="form-group">
                            <label>Échéance</label>
                            <input type="date" class="form-control" id="actionEcheance">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Ajouter Action</button>
                </form>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Liste des Actions</h3>
                    <select id="pmFilter" onchange="App.filterPostMortem()">
                        <option value="">Toutes</option>
                        <option value="Ouvert">Ouvertes</option>
                        <option value="Fermé">Fermées</option>
                    </select>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Titre</th>
                                <th>Type</th>
                                <th>Responsable</th>
                                <th>Échéance</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="pmTable">
                            ${this.renderPostMortemRows(actions)}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderPostMortemRows(actions) {
        return actions.map(a => `
            <tr>
                <td>${a.id}</td>
                <td><strong>${a.titre}</strong></td>
                <td><span class="badge badge-info">${a.type}</span></td>
                <td>${a.responsable || '-'}</td>
                <td>${a.echeance ? new Date(a.echeance).toLocaleDateString('fr-FR') : '-'}</td>
                <td>
                    <select class="form-control" style="width: 100px;"
                            onchange="App.updatePMStatus('${a.id}', this.value)">
                        <option value="Ouvert" ${a.statut === 'Ouvert' ? 'selected' : ''}>Ouvert</option>
                        <option value="En cours" ${a.statut === 'En cours' ? 'selected' : ''}>En cours</option>
                        <option value="Fermé" ${a.statut === 'Fermé' ? 'selected' : ''}>Fermé</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="App.deletePMAction('${a.id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    // Sauvegarde des sections Post-Mortem
    savePMSection(section) {
        if (!DataManager.data.processus.postMortem) {
            DataManager.data.processus.postMortem = {};
        }

        switch(section) {
            case 'preparation':
                DataManager.data.processus.postMortem.preparation = {
                    scopeRating: parseInt(document.getElementById('prepScopeRating')?.dataset?.rating) || 0,
                    scopeComment: document.getElementById('prepScopeComment')?.value || '',
                    scopeComplete: document.getElementById('prepScopeComplete')?.checked || false,
                    scopeReviewed: document.getElementById('prepScopeReviewed')?.checked || false,
                    scopeValidated: document.getElementById('prepScopeValidated')?.checked || false,
                    planRating: parseInt(document.getElementById('prepPlanRating')?.dataset?.rating) || 0,
                    planComment: document.getElementById('prepPlanComment')?.value || '',
                    planRealistic: document.getElementById('prepPlanRealistic')?.checked || false,
                    planCritical: document.getElementById('prepPlanCritical')?.checked || false,
                    planContingency: document.getElementById('prepPlanContingency')?.checked || false,
                    resRating: parseInt(document.getElementById('prepResRating')?.dataset?.rating) || 0,
                    resComment: document.getElementById('prepResComment')?.value || '',
                    resTeam: document.getElementById('prepResTeam')?.checked || false,
                    resTools: document.getElementById('prepResTools')?.checked || false,
                    resParts: document.getElementById('prepResParts')?.checked || false,
                    resContractors: document.getElementById('prepResContractors')?.checked || false,
                    commRating: parseInt(document.getElementById('prepCommRating')?.dataset?.rating) || 0,
                    commComment: document.getElementById('prepCommComment')?.value || '',
                    commMeetings: document.getElementById('prepCommMeetings')?.checked || false,
                    commStakeholders: document.getElementById('prepCommStakeholders')?.checked || false,
                    commDocs: document.getElementById('prepCommDocs')?.checked || false
                };
                break;

            case 'execution':
                DataManager.data.processus.postMortem.execution = {
                    dureePrevue: parseInt(document.getElementById('execDureePrevue')?.value) || 0,
                    dureeReelle: parseInt(document.getElementById('execDureeReelle')?.value) || 0,
                    calRating: parseInt(document.getElementById('execCalRating')?.dataset?.rating) || 0,
                    calComment: document.getElementById('execCalComment')?.value || '',
                    quasi: parseInt(document.getElementById('execQuasi')?.value) || 0,
                    regleOr: parseInt(document.getElementById('execRegleOr')?.value) || 0,
                    incidents: parseInt(document.getElementById('execIncidents')?.value) || 0,
                    accidents: parseInt(document.getElementById('execAccidents')?.value) || 0,
                    secuRating: parseInt(document.getElementById('execSecuRating')?.dataset?.rating) || 0,
                    secuComment: document.getElementById('execSecuComment')?.value || '',
                    completes: parseInt(document.getElementById('execCompletes')?.value) || 0,
                    reprises: parseInt(document.getElementById('execReprises')?.value) || 0,
                    qualRating: parseInt(document.getElementById('execQualRating')?.dataset?.rating) || 0,
                    qualComment: document.getElementById('execQualComment')?.value || '',
                    coordRating: parseInt(document.getElementById('execCoordRating')?.dataset?.rating) || 0,
                    coordComment: document.getElementById('execCoordComment')?.value || '',
                    coordDaily: document.getElementById('execCoordDaily')?.checked || false,
                    coordShift: document.getElementById('execCoordShift')?.checked || false,
                    coordContractors: document.getElementById('execCoordContractors')?.checked || false,
                    imprevus: parseInt(document.getElementById('execImprevus')?.value) || 0,
                    imprevuRating: parseInt(document.getElementById('execImprevuRating')?.dataset?.rating) || 0,
                    imprevuComment: document.getElementById('execImprevuComment')?.value || ''
                };
                break;

            case 'couts':
                DataManager.data.processus.postMortem.couts = {
                    budgetPrevu: parseFloat(document.getElementById('coutsBudgetPrevu')?.value) || 0,
                    budgetReel: parseFloat(document.getElementById('coutsBudgetReel')?.value) || 0,
                    moiPrevu: parseFloat(document.getElementById('coutsMOIPrevu')?.value) || 0,
                    moiReel: parseFloat(document.getElementById('coutsMOIReel')?.value) || 0,
                    extPrevu: parseFloat(document.getElementById('coutsExtPrevu')?.value) || 0,
                    extReel: parseFloat(document.getElementById('coutsExtReel')?.value) || 0,
                    piecesPrevu: parseFloat(document.getElementById('coutsPiecesPrevu')?.value) || 0,
                    piecesReel: parseFloat(document.getElementById('coutsPiecesReel')?.value) || 0,
                    locPrevu: parseFloat(document.getElementById('coutsLocPrevu')?.value) || 0,
                    locReel: parseFloat(document.getElementById('coutsLocReel')?.value) || 0,
                    autresPrevu: parseFloat(document.getElementById('coutsAutresPrevu')?.value) || 0,
                    autresReel: parseFloat(document.getElementById('coutsAutresReel')?.value) || 0,
                    causes: document.getElementById('coutsCauses')?.value || '',
                    opportunites: document.getElementById('coutsOpportunites')?.value || ''
                };
                break;

            case 'lecons':
                if (!DataManager.data.processus.postMortem.lecons) {
                    DataManager.data.processus.postMortem.lecons = { bonnes: [], mauvaises: [] };
                }
                DataManager.data.processus.postMortem.lecons.recommandations =
                    document.getElementById('leconsRecommandations')?.value || '';
                break;
        }

        DataManager.saveToStorage();
        App.showToast('Section sauvegardée', 'success');
    },

    // Rapports de Quart
    quartDate: new Date().toISOString().split('T')[0],
    quartType: 'soir', // 'soir' ou 'nuit'

    // Fonction pour l'onglet Exécution
    renderRapportsDeQuart() {
        return this.renderPMQuarts();
    },

    renderPMQuarts() {
        const pm = DataManager.data.processus?.postMortem || {};
        const quarts = pm.quarts || {};
        const quartKey = `${this.quartDate}_${this.quartType}`;
        const currentQuart = quarts[quartKey] || {};

        // Compter les rapports sauvegardés
        const rapportsSauvegardes = Object.keys(quarts).length;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🌙 Rapports de Quart</h3>
                    <div class="quart-nav">
                        <input type="date" class="form-control" id="quartDatePicker"
                               value="${this.quartDate}" onchange="Screens.changeQuartDate(this.value)">
                        <div class="quart-type-toggle">
                            <button class="btn btn-sm ${this.quartType === 'soir' ? 'btn-primary' : 'btn-outline'}"
                                    onclick="Screens.setQuartType('soir')">🌆 Soir</button>
                            <button class="btn btn-sm ${this.quartType === 'nuit' ? 'btn-primary' : 'btn-outline'}"
                                    onclick="Screens.setQuartType('nuit')">🌙 Nuit</button>
                        </div>
                        <button class="btn btn-sm btn-outline" onclick="Screens.toggleQuartHistory()">
                            📜 Historique (${rapportsSauvegardes})
                        </button>
                    </div>
                </div>

                <div class="quart-history-panel" id="quartHistoryPanel" style="display: none;">
                    ${this.renderQuartHistory(quarts)}
                </div>

                <div class="pm-section">
                    <h4>📋 Résumé du Quart - ${this.quartType === 'soir' ? 'Soir (16h-00h)' : 'Nuit (00h-08h)'}</h4>
                    <div class="grid-2">
                        <div class="form-group">
                            <label>Superviseur de quart:</label>
                            <input type="text" class="form-control" id="quartSuperviseur"
                                   value="${currentQuart.superviseur || ''}">
                        </div>
                        <div class="form-group">
                            <label>Nombre de personnes sur site:</label>
                            <input type="number" class="form-control" id="quartEffectif"
                                   value="${currentQuart.effectif || ''}">
                        </div>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>⚠️ Sécurité</h4>
                    <div class="grid-4">
                        <div class="form-group">
                            <label>Quasi-incidents</label>
                            <input type="number" class="form-control" id="quartQuasi"
                                   value="${currentQuart.quasi || 0}">
                        </div>
                        <div class="form-group">
                            <label>Règles d'or</label>
                            <input type="number" class="form-control" id="quartRegleOr"
                                   value="${currentQuart.regleOr || 0}">
                        </div>
                        <div class="form-group">
                            <label>Incidents</label>
                            <input type="number" class="form-control" id="quartIncidents"
                                   value="${currentQuart.incidents || 0}">
                        </div>
                        <div class="form-group">
                            <label>Premiers soins</label>
                            <input type="number" class="form-control" id="quartPremiersSoins"
                                   value="${currentQuart.premiersSoins || 0}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Détails sécurité:</label>
                        <textarea class="form-control" id="quartSecuDetails" rows="2">${currentQuart.secuDetails || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>📊 Avancement des Travaux</h4>
                    <div class="grid-3">
                        <div class="form-group">
                            <label>Travaux complétés</label>
                            <input type="number" class="form-control" id="quartCompletes"
                                   value="${currentQuart.completes || 0}">
                        </div>
                        <div class="form-group">
                            <label>Travaux en retard</label>
                            <input type="number" class="form-control" id="quartRetards"
                                   value="${currentQuart.retards || 0}">
                        </div>
                        <div class="form-group">
                            <label>Travaux imprévus ajoutés</label>
                            <input type="number" class="form-control" id="quartImprevus"
                                   value="${currentQuart.imprevus || 0}">
                        </div>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>🔴 Points Bloquants</h4>
                    <div class="form-group">
                        <textarea class="form-control" id="quartBloquants" rows="3"
                                  placeholder="Décrire les problèmes rencontrés, équipements en panne, retards...">${currentQuart.bloquants || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>✅ Travaux Majeurs Réalisés</h4>
                    <div class="form-group">
                        <textarea class="form-control" id="quartRealises" rows="3"
                                  placeholder="Lister les travaux importants terminés durant ce quart...">${currentQuart.realises || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>📌 À Transmettre au Quart Suivant</h4>
                    <div class="form-group">
                        <textarea class="form-control" id="quartTransmission" rows="3"
                                  placeholder="Informations importantes pour le quart suivant...">${currentQuart.transmission || ''}</textarea>
                    </div>
                </div>

                <div class="pm-section">
                    <h4>📝 Notes Générales</h4>
                    <div class="form-group">
                        <textarea class="form-control" id="quartNotes" rows="2">${currentQuart.notes || ''}</textarea>
                    </div>
                </div>

                <div class="pm-actions">
                    <button class="btn btn-primary" onclick="Screens.saveQuartReport()">
                        💾 Sauvegarder le Rapport
                    </button>
                    <button class="btn btn-outline" onclick="Screens.printQuartReport()">
                        🖨️ Imprimer
                    </button>
                </div>
            </div>
        `;
    },

    changeQuartDate(date) {
        this.quartDate = date;
        this.refreshQuartsContent();
    },

    setQuartType(type) {
        this.quartType = type;
        this.refreshQuartsContent();
    },

    // Rafraîchir le contenu des rapports de quart (fonctionne dans Exécution et Post-Mortem)
    refreshQuartsContent() {
        // Essayer d'abord le conteneur Exécution, sinon Post-Mortem
        const execContent = document.querySelector('.exec-content');
        const pmContent = document.querySelector('.pm-content');

        if (execContent && this.executionTab === 'quarts') {
            execContent.innerHTML = this.renderPMQuarts();
        } else if (pmContent) {
            pmContent.innerHTML = this.renderPMQuarts();
        }
    },

    toggleQuartHistory() {
        const panel = document.getElementById('quartHistoryPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    },

    renderQuartHistory(quarts) {
        const entries = Object.entries(quarts).sort((a, b) => b[0].localeCompare(a[0]));

        if (entries.length === 0) {
            return '<p class="empty-msg">Aucun rapport de quart sauvegardé</p>';
        }

        return `
            <div class="quart-history-list">
                ${entries.map(([key, quart]) => {
                    const [date, type] = key.split('_');
                    const hasIncidents = (quart.quasi || 0) + (quart.regleOr || 0) +
                                        (quart.incidents || 0) + (quart.premiersSoins || 0) > 0;
                    return `
                        <div class="quart-history-item ${hasIncidents ? 'has-incidents' : ''}"
                             onclick="Screens.loadQuartReport('${date}', '${type}')">
                            <div class="quart-history-date">
                                <strong>${new Date(date).toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short'})}</strong>
                                <span class="quart-badge ${type}">${type === 'soir' ? '🌆 Soir' : '🌙 Nuit'}</span>
                            </div>
                            <div class="quart-history-info">
                                <span>👷 ${quart.superviseur || 'N/A'}</span>
                                <span>✅ ${quart.completes || 0} terminés</span>
                                ${hasIncidents ? '<span class="incident-warning">⚠️</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    loadQuartReport(date, type) {
        this.quartDate = date;
        this.quartType = type;
        this.refreshQuartsContent();
    },

    saveQuartReport() {
        if (!DataManager.data.processus.postMortem) {
            DataManager.data.processus.postMortem = {};
        }
        if (!DataManager.data.processus.postMortem.quarts) {
            DataManager.data.processus.postMortem.quarts = {};
        }

        const quartKey = `${this.quartDate}_${this.quartType}`;
        DataManager.data.processus.postMortem.quarts[quartKey] = {
            superviseur: document.getElementById('quartSuperviseur')?.value || '',
            effectif: parseInt(document.getElementById('quartEffectif')?.value) || 0,
            quasi: parseInt(document.getElementById('quartQuasi')?.value) || 0,
            regleOr: parseInt(document.getElementById('quartRegleOr')?.value) || 0,
            incidents: parseInt(document.getElementById('quartIncidents')?.value) || 0,
            premiersSoins: parseInt(document.getElementById('quartPremiersSoins')?.value) || 0,
            secuDetails: document.getElementById('quartSecuDetails')?.value || '',
            completes: parseInt(document.getElementById('quartCompletes')?.value) || 0,
            retards: parseInt(document.getElementById('quartRetards')?.value) || 0,
            imprevus: parseInt(document.getElementById('quartImprevus')?.value) || 0,
            bloquants: document.getElementById('quartBloquants')?.value || '',
            realises: document.getElementById('quartRealises')?.value || '',
            transmission: document.getElementById('quartTransmission')?.value || '',
            notes: document.getElementById('quartNotes')?.value || '',
            savedAt: new Date().toISOString()
        };

        DataManager.saveToStorage();
        App.showToast('Rapport de quart sauvegardé', 'success');

        // Rafraîchir pour mettre à jour l'historique
        this.refreshQuartsContent();
    },

    printQuartReport() {
        const printContent = `
            <html>
            <head>
                <title>Rapport de Quart - ${this.quartDate} ${this.quartType}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #1a237e; }
                    h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                    .section { margin-bottom: 20px; }
                    .label { font-weight: bold; }
                    .value { margin-left: 10px; }
                </style>
            </head>
            <body>
                <h1>Rapport de Quart - ${this.quartType === 'soir' ? 'Soir' : 'Nuit'}</h1>
                <p><strong>Date:</strong> ${new Date(this.quartDate).toLocaleDateString('fr-FR')}</p>
                <p><strong>Superviseur:</strong> ${document.getElementById('quartSuperviseur')?.value || 'N/A'}</p>
                <p><strong>Effectif:</strong> ${document.getElementById('quartEffectif')?.value || 'N/A'} personnes</p>

                <h2>Sécurité</h2>
                <div class="grid">
                    <p><span class="label">Quasi-incidents:</span><span class="value">${document.getElementById('quartQuasi')?.value || 0}</span></p>
                    <p><span class="label">Règles d'or:</span><span class="value">${document.getElementById('quartRegleOr')?.value || 0}</span></p>
                    <p><span class="label">Incidents:</span><span class="value">${document.getElementById('quartIncidents')?.value || 0}</span></p>
                    <p><span class="label">Premiers soins:</span><span class="value">${document.getElementById('quartPremiersSoins')?.value || 0}</span></p>
                </div>
                <p>${document.getElementById('quartSecuDetails')?.value || ''}</p>

                <h2>Avancement</h2>
                <div class="grid">
                    <p><span class="label">Complétés:</span><span class="value">${document.getElementById('quartCompletes')?.value || 0}</span></p>
                    <p><span class="label">En retard:</span><span class="value">${document.getElementById('quartRetards')?.value || 0}</span></p>
                    <p><span class="label">Imprévus:</span><span class="value">${document.getElementById('quartImprevus')?.value || 0}</span></p>
                </div>

                <h2>Points Bloquants</h2>
                <p>${document.getElementById('quartBloquants')?.value || 'Aucun'}</p>

                <h2>Travaux Réalisés</h2>
                <p>${document.getElementById('quartRealises')?.value || '-'}</p>

                <h2>Transmission au Quart Suivant</h2>
                <p>${document.getElementById('quartTransmission')?.value || '-'}</p>

                <h2>Notes</h2>
                <p>${document.getElementById('quartNotes')?.value || '-'}</p>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    },

    // === IMPORT ===
    renderImport() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Import des Données</h3>
                </div>

                <div class="import-steps">
                    <div class="import-step active" id="step1">
                        <div class="step-number">1</div>
                        <div>Sélection Fichier</div>
                    </div>
                    <div class="import-step" id="step2">
                        <div class="step-number">2</div>
                        <div>Mapping Colonnes</div>
                    </div>
                    <div class="import-step" id="step3">
                        <div class="step-number">3</div>
                        <div>Validation</div>
                    </div>
                </div>

                <div class="grid-2" style="margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Type d'import:</label>
                        <select class="form-control" id="importType">
                            <option value="travaux">Travaux SAP (Base de données principale)</option>
                            <option value="execution">Données Exécution (Mise à jour avancement)</option>
                            <option value="pieces">Liste des pièces (Commande matériel)</option>
                            <option value="avis">Avis (Notifications SAP)</option>
                        </select>
                    </div>
                </div>

                <div id="importContent">
                    <div class="upload-zone" id="uploadZone">
                        <input type="file" id="fileInput" accept=".xlsx,.xls,.csv">
                        <div class="upload-icon">📁</div>
                        <h3>Glissez votre fichier Excel ici</h3>
                        <p>ou cliquez pour sélectionner</p>
                        <p style="font-size: 0.85rem; color: var(--text-light);">Formats acceptés: .xlsx, .xls, .csv</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">État des Données</h3>
                </div>
                <div class="grid-4">
                    <div>
                        <p><strong>Travaux:</strong> ${DataManager.data.travaux.length} enregistrements</p>
                        <p><strong>Dernier import:</strong> ${DataManager.data.metadata.lastImportTravaux ? new Date(DataManager.data.metadata.lastImportTravaux).toLocaleString('fr-FR') : 'Jamais'}</p>
                    </div>
                    <div>
                        <p><strong>Pièces:</strong> ${(DataManager.data.pieces || []).length} enregistrements</p>
                        <p><strong>Dernier import:</strong> ${DataManager.data.metadata.lastImportPieces ? new Date(DataManager.data.metadata.lastImportPieces).toLocaleString('fr-FR') : 'Jamais'}</p>
                    </div>
                    <div>
                        <p><strong>Avis:</strong> ${(DataManager.data.avis || []).length} enregistrements</p>
                        <p><strong>Dernier import:</strong> ${DataManager.data.metadata.lastImportAvis ? new Date(DataManager.data.metadata.lastImportAvis).toLocaleString('fr-FR') : 'Jamais'}</p>
                    </div>
                    <div>
                        <p><strong>Import exécution:</strong> ${DataManager.data.metadata.lastImportExecution ? new Date(DataManager.data.metadata.lastImportExecution).toLocaleString('fr-FR') : 'Jamais'}</p>
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-danger" onclick="App.resetAllData()">🗑️ Réinitialiser toutes les données</button>
                    <button class="btn btn-secondary" onclick="App.exportAllData()">📤 Exporter JSON</button>
                </div>
            </div>
        `;
    },

    // === DÉTAIL TRAVAIL (MODAL) ===
    renderDetailTravail(travail) {
        const comments = DataManager.getComments(travail.id);
        const customFields = DataManager.getCustomFields();
        const hasCustomFields = customFields.length > 0 || (travail.customData && Object.keys(travail.customData).length > 0);

        return `
            <div class="tabs">
                <div class="tab active" onclick="App.switchDetailTab('info')">Informations</div>
                ${hasCustomFields ? '<div class="tab" onclick="App.switchDetailTab(\'custom\')">Champs Perso.</div>' : ''}
                <div class="tab" onclick="App.switchDetailTab('preparation')">Préparation</div>
                <div class="tab" onclick="App.switchDetailTab('execution')">Exécution</div>
                <div class="tab" onclick="App.switchDetailTab('comments')">Commentaires (${comments.length})</div>
            </div>

            <div id="detailContent">
                ${this.renderDetailInfo(travail)}
            </div>
        `;
    },

    renderDetailInfo(travail) {
        return `
            <div class="grid-2">
                <div class="form-group">
                    <label>Numéro OT</label>
                    <input type="text" class="form-control" value="${travail.ot}" readonly>
                </div>
                <div class="form-group">
                    <label>Discipline</label>
                    <input type="text" class="form-control" value="${travail.discipline || '-'}" readonly>
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" readonly>${travail.description}</textarea>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Équipement</label>
                    <input type="text" class="form-control" value="${travail.equipement || '-'}" readonly>
                </div>
                <div class="form-group">
                    <label>Localisation</label>
                    <input type="text" class="form-control" value="${travail.localisation || '-'}" readonly>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Priorité</label>
                    <span class="badge ${this.getPrioriteBadge(travail.priorite)}">${travail.priorite}</span>
                </div>
                <div class="form-group">
                    <label>Entreprise</label>
                    <input type="text" class="form-control" value="${travail.entreprise || '-'}" readonly>
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Heures Estimées</label>
                    <input type="text" class="form-control" value="${travail.estimationHeures}h" readonly>
                </div>
                <div class="form-group">
                    <label>Responsable</label>
                    <input type="text" class="form-control" value="${travail.responsable || '-'}" readonly>
                </div>
            </div>
        `;
    },

    renderDetailPreparation(travail) {
        return `
            <div class="form-group">
                <label><input type="checkbox" ${travail.preparation.materielCommande ? 'checked' : ''}
                       onchange="App.updatePrepaDetail('${travail.id}', 'materielCommande', this.checked)">
                       Matériel commandé / disponible</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" ${travail.preparation.permisSecurite ? 'checked' : ''}
                       onchange="App.updatePrepaDetail('${travail.id}', 'permisSecurite', this.checked)">
                       Permis de sécurité préparé</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" ${travail.preparation.consignationPrevue ? 'checked' : ''}
                       onchange="App.updatePrepaDetail('${travail.id}', 'consignationPrevue', this.checked)">
                       Consignation prévue</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" ${travail.preparation.pieceJointe ? 'checked' : ''}
                       onchange="App.updatePrepaDetail('${travail.id}', 'pieceJointe', this.checked)">
                       Pièces jointes / plans disponibles</label>
            </div>
            <div class="form-group">
                <label><input type="checkbox" ${travail.preparation.gammeValidee ? 'checked' : ''}
                       onchange="App.updatePrepaDetail('${travail.id}', 'gammeValidee', this.checked)">
                       Gamme validée</label>
            </div>
            <div class="form-group">
                <label>Commentaire préparation</label>
                <textarea class="form-control" id="prepaComment" rows="4">${travail.preparation.commentairePrepa || ''}</textarea>
                <button class="btn btn-primary btn-sm" style="margin-top: 10px;"
                        onclick="App.savePrepaComment('${travail.id}')">Sauvegarder</button>
            </div>
        `;
    },

    renderDetailExecution(travail) {
        return `
            <div class="grid-2">
                <div class="form-group">
                    <label>Statut Exécution</label>
                    <select class="form-control" id="execStatut"
                            onchange="App.updateExecDetail('${travail.id}', 'statutExec', this.value)">
                        <option value="Non démarré" ${travail.execution.statutExec === 'Non démarré' ? 'selected' : ''}>Non démarré</option>
                        <option value="En cours" ${travail.execution.statutExec === 'En cours' ? 'selected' : ''}>En cours</option>
                        <option value="Terminé" ${travail.execution.statutExec === 'Terminé' ? 'selected' : ''}>Terminé</option>
                        <option value="Bloqué" ${travail.execution.statutExec === 'Bloqué' ? 'selected' : ''}>Bloqué</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Heures Réelles</label>
                    <input type="number" class="form-control" id="execHeures" value="${travail.execution.heuresReelles}"
                           onchange="App.updateExecDetail('${travail.id}', 'heuresReelles', parseFloat(this.value))">
                </div>
            </div>
            <div class="grid-2">
                <div class="form-group">
                    <label>Date Début</label>
                    <input type="date" class="form-control" id="execDateDebut"
                           value="${travail.execution.dateDebut ? travail.execution.dateDebut.split('T')[0] : ''}"
                           onchange="App.updateExecDetail('${travail.id}', 'dateDebut', this.value)">
                </div>
                <div class="form-group">
                    <label>Date Fin</label>
                    <input type="date" class="form-control" id="execDateFin"
                           value="${travail.execution.dateFin ? travail.execution.dateFin.split('T')[0] : ''}"
                           onchange="App.updateExecDetail('${travail.id}', 'dateFin', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Commentaire exécution</label>
                <textarea class="form-control" id="execComment" rows="4">${travail.execution.commentaireExec || ''}</textarea>
                <button class="btn btn-primary btn-sm" style="margin-top: 10px;"
                        onclick="App.saveExecComment('${travail.id}')">Sauvegarder</button>
            </div>
        `;
    },

    renderDetailComments(travail) {
        const comments = DataManager.getComments(travail.id);

        return `
            <div class="comments-section">
                ${comments.length === 0 ? '<p style="color: var(--text-light);">Aucun commentaire</p>' : ''}
                ${comments.map(c => `
                    <div class="comment">
                        <div class="comment-header">
                            <span class="comment-author">${c.author}</span>
                            <span class="comment-date">${new Date(c.date).toLocaleString('fr-FR')}</span>
                        </div>
                        <div class="comment-text">${c.text}</div>
                    </div>
                `).join('')}
            </div>
            <div class="comment-add">
                <textarea class="form-control" id="newComment" placeholder="Ajouter un commentaire..."></textarea>
                <button class="btn btn-primary" onclick="App.addComment('${travail.id}')">Envoyer</button>
            </div>
        `;
    },

    // Rendu des champs personnalisés
    renderDetailCustomFields(travail) {
        const customFields = DataManager.getCustomFields();
        const customData = travail.customData || {};

        // Si pas de champs définis, essayer de récupérer depuis les données du travail
        let fieldsToShow = customFields;
        if (fieldsToShow.length === 0 && Object.keys(customData).length > 0) {
            fieldsToShow = Object.keys(customData).map(key => ({
                id: key,
                label: key.replace('custom_', '').replace(/_/g, ' ').replace(/^\d+/, '').trim() || key,
                type: 'text',
                isCustom: true
            }));
        }

        if (fieldsToShow.length === 0) {
            return '<p style="color: var(--text-light);">Aucun champ personnalisé défini pour ce travail.</p>';
        }

        return `
            <div class="custom-fields-detail">
                <p class="info-text" style="margin-bottom: 15px; padding: 10px; background: #f0f9ff; border-radius: 6px; font-size: 0.9rem;">
                    Ces champs ont été importés depuis votre fichier Excel. Vous pouvez les modifier ci-dessous.
                </p>
                <div class="grid-2">
                ${fieldsToShow.map(field => {
                    const value = customData[field.id] || '';
                    return `
                        <div class="form-group custom-field-item">
                            <label>
                                ${field.label}
                                <span class="field-type-badge" style="font-size: 0.7rem; color: var(--text-light);">(${this.getFieldTypeLabel(field.type)})</span>
                            </label>
                            ${this.renderCustomFieldInput(travail.id, field, value)}
                        </div>
                    `;
                }).join('')}
                </div>
            </div>
            <div style="margin-top: 15px;">
                <button class="btn btn-primary" onclick="App.saveCustomFields('${travail.id}')">
                    Sauvegarder les modifications
                </button>
            </div>
        `;
    },

    renderCustomFieldInput(travailId, field, value) {
        const escapedValue = String(value || '').replace(/"/g, '&quot;');

        switch (field.type) {
            case 'number':
                return '<input type="number" class="form-control custom-field-input" data-field-id="' + field.id + '" value="' + escapedValue + '">';

            case 'date':
                const dateValue = value ? String(value).split('T')[0] : '';
                return '<input type="date" class="form-control custom-field-input" data-field-id="' + field.id + '" value="' + dateValue + '">';

            case 'boolean':
                const isChecked = value === true || value === 'true' || value === 'Oui' || value === '1';
                return '<select class="form-control custom-field-input" data-field-id="' + field.id + '">' +
                       '<option value="">--</option>' +
                       '<option value="Oui"' + (isChecked ? ' selected' : '') + '>Oui</option>' +
                       '<option value="Non"' + (!isChecked && value ? ' selected' : '') + '>Non</option>' +
                       '</select>';

            default:
                if (String(value).length > 100) {
                    return '<textarea class="form-control custom-field-input" data-field-id="' + field.id + '" rows="3">' + escapedValue + '</textarea>';
                }
                return '<input type="text" class="form-control custom-field-input" data-field-id="' + field.id + '" value="' + escapedValue + '">';
        }
    },

    getFieldTypeLabel(type) {
        const labels = { text: 'Texte', number: 'Nombre', date: 'Date', boolean: 'Oui/Non' };
        return labels[type] || 'Texte';
    },

    // === HELPERS ===
    renderCheckbox(otId, field, checked) {
        return `<input type="checkbox" ${checked ? 'checked' : ''}
                onclick="event.stopPropagation(); App.togglePrepa('${otId}', '${field}', this.checked)">`;
    },

    getPreparationScore(travail) {
        const p = travail.preparation;
        const checks = [p.materielCommande, p.permisSecurite, p.consignationPrevue, p.pieceJointe, p.gammeValidee];
        return Math.round((checks.filter(Boolean).length / 5) * 100);
    },

    getPrioriteBadge(priorite) {
        switch (priorite) {
            case 'Haute': return 'badge-danger';
            case 'Normale': return 'badge-warning';
            case 'Basse': return 'badge-success';
            default: return 'badge-secondary';
        }
    },

    getStatusClass(status) {
        switch (status) {
            case 'Terminé': return 'completed';
            case 'En cours': return 'in-progress';
            case 'Bloqué': return 'blocked';
            default: return 'pending';
        }
    },

    // === ALERTES DASHBOARD ===
    getAlertes(travaux, pieces) {
        const alertes = [];

        // Travaux bloqués
        const travauxBloques = travaux.filter(t => t.execution && t.execution.statutExec === 'Bloqué');
        if (travauxBloques.length > 0) {
            alertes.push({
                type: 'danger',
                icon: '🚫',
                titre: `${travauxBloques.length} travaux bloqués`,
                detail: travauxBloques.slice(0, 3).map(t => t.ot).join(', ') + (travauxBloques.length > 3 ? '...' : ''),
                color: '#ef4444',
                bg: 'rgba(239, 68, 68, 0.1)'
            });
        }

        // Travaux haute priorité non terminés
        const travauxHautePriorite = travaux.filter(t =>
            t.priorite === 'Haute' &&
            t.execution &&
            t.execution.statutExec !== 'Terminé'
        );
        if (travauxHautePriorite.length > 0) {
            alertes.push({
                type: 'warning',
                icon: '⚠️',
                titre: `${travauxHautePriorite.length} travaux haute priorité`,
                detail: 'En attente ou en cours',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.1)'
            });
        }

        // Pièces en attente (kitting créé mais non reçues)
        if (typeof KittingSync !== 'undefined' && KittingSync.kittings) {
            const piecesEnAttente = pieces.filter(p => {
                const status = KittingSync.getPieceKittingStatus(p);
                return status.hasKitting && !status.pieceReceived;
            });
            if (piecesEnAttente.length > 0) {
                alertes.push({
                    type: 'info',
                    icon: '📦',
                    titre: `${piecesEnAttente.length} pièces en attente`,
                    detail: 'Kitting créé, réception en attente',
                    color: '#3b82f6',
                    bg: 'rgba(59, 130, 246, 0.1)'
                });
            }
        }

        // Travaux sans préparation complète mais en exécution
        const travauxSansPrep = travaux.filter(t => {
            if (!t.execution || t.execution.statutExec === 'Non démarré') return false;
            const p = t.preparation || {};
            const prepOk = p.materielCommande && p.permisSecurite && p.consignationPrevue;
            return !prepOk;
        });
        if (travauxSansPrep.length > 0) {
            alertes.push({
                type: 'warning',
                icon: '📋',
                titre: `${travauxSansPrep.length} en exécution sans prép. complète`,
                detail: 'Préparation incomplète',
                color: '#f59e0b',
                bg: 'rgba(245, 158, 11, 0.1)'
            });
        }

        return {
            total: alertes.length,
            items: alertes
        };
    },

    // === STATS KITTING DASHBOARD ===
    getKittingStats() {
        if (typeof KittingSync === 'undefined' || !KittingSync.kittings) {
            return {
                total: 0,
                prets: 0,
                enAttente: 0,
                pourcentage: 0,
                piecesRecues: 0,
                totalPieces: 0
            };
        }

        const kittings = KittingSync.kittings;
        const total = kittings.length;
        const prets = kittings.filter(k => k.status === 'pret').length;
        const enAttente = total - prets;

        // Compter les pièces
        let piecesRecues = 0;
        let totalPieces = 0;
        kittings.forEach(k => {
            if (k.pieces && Array.isArray(k.pieces)) {
                k.pieces.forEach(p => {
                    totalPieces++;
                    if (p.received) piecesRecues++;
                });
            }
        });

        const pourcentage = totalPieces > 0 ? Math.round((piecesRecues / totalPieces) * 100) : 0;

        return {
            total,
            prets,
            enAttente,
            pourcentage,
            piecesRecues,
            totalPieces
        };
    },

    // === RAPPEL RÉUNIONS DASHBOARD ===
    getReunionsRappel() {
        const dateArret = DataManager.data.processus?.dateArret;

        // Si pas de date d'arrêt, retourner un tableau vide avec flag
        if (!dateArret) {
            const result = [];
            result.noDateArret = true;
            return result;
        }

        const reunionsConfig = this.getReunionsConfig();
        const reunionsData = DataManager.data.processus?.reunions || {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filtrer les réunions non terminées et calculer leur date butoir
        const reunionsAVenir = reunionsConfig
            .map(r => {
                const data = reunionsData[r.id] || {};
                const statut = data.statut || 'non_commence';

                // Ignorer les réunions terminées
                if (statut === 'termine') return null;

                // Calculer la date butoir
                const dateButoir = new Date(dateArret);
                dateButoir.setDate(dateButoir.getDate() + (r.semaine * 7));

                // Calculer l'urgence (jours restants)
                const joursRestants = Math.ceil((dateButoir - today) / (1000 * 60 * 60 * 24));

                let urgence = '';
                let urgenceIcon = '';
                if (joursRestants < 0) {
                    urgence = 'reunion-retard';
                    urgenceIcon = '🔴 Retard';
                } else if (joursRestants <= 7) {
                    urgence = 'reunion-urgent';
                    urgenceIcon = '🟠 Cette semaine';
                } else if (joursRestants <= 14) {
                    urgence = 'reunion-proche';
                    urgenceIcon = '🟡 2 semaines';
                } else {
                    urgenceIcon = '🟢 OK';
                }

                return {
                    ...r,
                    statut,
                    statutClass: statut === 'en_cours' ? 'badge-warning' : 'badge-secondary',
                    statutLabel: statut === 'en_cours' ? 'En cours' : 'Non commencé',
                    dateButoir: dateButoir.toLocaleDateString('fr-CA'),
                    dateButorObj: dateButoir,
                    joursRestants,
                    urgence,
                    urgenceIcon
                };
            })
            .filter(r => r !== null)
            // Trier par date butoir (plus proche en premier)
            .sort((a, b) => a.dateButorObj - b.dateButorObj)
            // Limiter à 8 réunions pour le dashboard
            .slice(0, 8);

        return reunionsAVenir;
    },

    // === AVIS SYNDICAUX ===
    // État de l'écran avis syndicaux
    avisSyndicalSelectionne: null,

    getAvisSyndicauxData() {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.avisSyndicaux) {
            DataManager.data.processus.avisSyndicaux = {
                template: null,
                templateNom: '',
                avis: []
            };
        }
        return DataManager.data.processus.avisSyndicaux;
    },

    renderAvisSyndicaux() {
        // Si un avis est sélectionné, afficher le détail
        if (this.avisSyndicalSelectionne !== null) {
            return this.renderAvisSyndicalDetail(this.avisSyndicalSelectionne);
        }

        const data = this.getAvisSyndicauxData();
        const avis = data.avis || [];

        // Stats
        const total = avis.length;
        const valides = avis.filter(a => a.valideDirection).length;
        const enAttente = avis.filter(a => !a.valideDirection).length;
        const generes = avis.filter(a => a.dateGeneration).length;

        return `
            <div class="avis-syndicaux-screen">
                <!-- Stats -->
                <div class="card">
                    <div class="commande-resume">
                        <div class="resume-stat">
                            <span class="stat-value">${total}</span>
                            <span class="stat-label">Total avis</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${valides}</span>
                            <span class="stat-label">Validés</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${enAttente}</span>
                            <span class="stat-label">En attente</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${generes}</span>
                            <span class="stat-label">Générés</span>
                        </div>
                    </div>
                </div>

                <!-- Template -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Template DOCX</h3>
                    </div>
                    <div class="template-section">
                        ${data.templateNom ? `
                            <div class="template-info">
                                <span class="template-icon">📄</span>
                                <span class="template-name">${data.templateNom}</span>
                                <button class="btn btn-sm btn-outline" onclick="Screens.supprimerTemplateAvis()">Supprimer</button>
                            </div>
                            <p class="template-hint">Le template sera utilisé pour générer les avis. Utilisez des balises comme <code>{{titre}}</code>, <code>{{dateDebut}}</code>, <code>{{dateFin}}</code>, etc.</p>
                        ` : `
                            <div class="template-upload">
                                <p>Aucun template uploadé. Uploadez un fichier DOCX avec des balises à remplacer.</p>
                                <p class="template-hint">Balises disponibles: <code>{{titre}}</code>, <code>{{dateDebut}}</code>, <code>{{dateFin}}</code>, <code>{{description}}</code>, <code>{{travaux}}</code>, <code>{{responsable}}</code>, <code>{{dateCreation}}</code></p>
                                <input type="file" id="templateAvisInput" accept=".docx" style="display: none;" onchange="Screens.uploadTemplateAvis(this)">
                                <button class="btn btn-primary" onclick="document.getElementById('templateAvisInput').click()">
                                    Uploader un template DOCX
                                </button>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Liste des avis -->
                <div class="card">
                    <div class="card-header-flex">
                        <h3 class="card-title">Avis syndicaux (${avis.length})</h3>
                        <button class="btn btn-primary" onclick="Screens.creerNouvelAvis()">
                            + Nouvel avis
                        </button>
                    </div>
                    <div class="table-container">
                        <table class="data-table avis-table">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">#</th>
                                    <th>Titre</th>
                                    <th style="width: 110px;">Date début</th>
                                    <th style="width: 110px;">Date fin</th>
                                    <th style="width: 120px;">Validation</th>
                                    <th style="width: 100px;">Statut</th>
                                    <th style="width: 120px;">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${avis.length === 0 ? `
                                    <tr><td colspan="7" class="empty-msg">Aucun avis syndical. Cliquez sur "+ Nouvel avis" pour commencer.</td></tr>
                                ` : avis.map((a, i) => {
                                    const statutClass = a.dateGeneration ? 'badge-success' : a.valideDirection ? 'badge-warning' : 'badge-secondary';
                                    const statutLabel = a.dateGeneration ? 'Généré' : a.valideDirection ? 'Validé' : 'Brouillon';
                                    return `
                                        <tr class="${a.valideDirection ? 'row-success' : ''}" style="cursor: pointer;" onclick="Screens.ouvrirAvisSyndical(${i})">
                                            <td class="center">${i + 1}</td>
                                            <td><strong>${a.titre || 'Sans titre'}</strong></td>
                                            <td class="center">${a.dateDebut || '-'}</td>
                                            <td class="center">${a.dateFin || '-'}</td>
                                            <td class="center">
                                                ${a.valideDirection ? `
                                                    <span class="badge badge-success">Validé</span>
                                                    <br><small>${a.dateValidation || ''}</small>
                                                ` : `
                                                    <span class="badge badge-warning">En attente</span>
                                                `}
                                            </td>
                                            <td class="center"><span class="badge ${statutClass}">${statutLabel}</span></td>
                                            <td class="center">
                                                <div class="btn-group">
                                                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Screens.ouvrirAvisSyndical(${i})" title="Modifier">
                                                        Modifier
                                                    </button>
                                                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); Screens.supprimerAvisSyndical(${i})" title="Supprimer">
                                                        ✕
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    uploadTemplateAvis(input) {
        const file = input.files[0];
        if (!file) return;

        if (!file.name.endsWith('.docx')) {
            App.showToast('Veuillez sélectionner un fichier DOCX', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const data = this.getAvisSyndicauxData();
            data.template = e.target.result; // Base64
            data.templateNom = file.name;
            DataManager.saveToStorage();
            App.render();
            App.showToast('Template uploadé avec succès', 'success');
        };
        reader.readAsDataURL(file);
    },

    supprimerTemplateAvis() {
        if (!confirm('Supprimer le template ?')) return;
        const data = this.getAvisSyndicauxData();
        data.template = null;
        data.templateNom = '';
        DataManager.saveToStorage();
        App.render();
        App.showToast('Template supprimé', 'success');
    },

    creerNouvelAvis() {
        const data = this.getAvisSyndicauxData();
        data.avis.push({
            titre: '',
            dateDebut: '',
            dateFin: '',
            description: '',
            travaux: '',
            responsable: '',
            dateCreation: new Date().toISOString().split('T')[0],
            valideDirection: false,
            validateurNom: '',
            dateValidation: '',
            commentaireValidation: '',
            dateGeneration: '',
            historique: []
        });
        DataManager.saveToStorage();
        this.avisSyndicalSelectionne = data.avis.length - 1;
        App.render();
        App.showToast('Nouvel avis créé', 'success');
    },

    ouvrirAvisSyndical(index) {
        this.avisSyndicalSelectionne = index;
        App.render();
    },

    fermerAvisSyndical() {
        this.avisSyndicalSelectionne = null;
        App.render();
    },

    supprimerAvisSyndical(index) {
        if (!confirm('Supprimer cet avis syndical ?')) return;
        const data = this.getAvisSyndicauxData();
        data.avis.splice(index, 1);
        DataManager.saveToStorage();
        App.render();
        App.showToast('Avis supprimé', 'success');
    },

    renderAvisSyndicalDetail(index) {
        const data = this.getAvisSyndicauxData();
        const avis = data.avis[index];
        if (!avis) {
            this.avisSyndicalSelectionne = null;
            return this.renderAvisSyndicaux();
        }

        const historique = avis.historique || [];

        return `
            <div class="avis-detail-screen">
                <!-- Header -->
                <div class="detail-header" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <button class="back-btn" onclick="Screens.fermerAvisSyndical()">
                        ← Retour à la liste
                    </button>
                    <div class="detail-title" style="margin-top: 10px;">
                        <h2 style="margin: 10px 0;">${avis.titre || 'Nouvel avis syndical'}</h2>
                        <p style="color: #64748b;">
                            Créé le: ${avis.dateCreation || 'N/A'} |
                            ${avis.valideDirection ?
                                `<span class="badge badge-success">Validé par la direction</span> le ${avis.dateValidation}` :
                                '<span class="badge badge-warning">En attente de validation</span>'
                            }
                            ${avis.dateGeneration ? ` | <span class="badge badge-info">Généré le ${avis.dateGeneration}</span>` : ''}
                        </p>
                    </div>
                </div>

                <div class="grid-2">
                    <!-- Formulaire -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Informations de l'avis</h3>
                        </div>
                        <div class="form-group">
                            <label>Titre de l'avis *</label>
                            <input type="text" class="form-control" value="${avis.titre || ''}"
                                   placeholder="Ex: Avis de sous-traitance - Arrêt annuel 2025"
                                   onchange="Screens.updateAvisSyndical(${index}, 'titre', this.value)">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date de début *</label>
                                <input type="date" class="form-control" value="${avis.dateDebut || ''}"
                                       onchange="Screens.updateAvisSyndical(${index}, 'dateDebut', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Date de fin *</label>
                                <input type="date" class="form-control" value="${avis.dateFin || ''}"
                                       onchange="Screens.updateAvisSyndical(${index}, 'dateFin', this.value)">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Responsable</label>
                            <input type="text" class="form-control" value="${avis.responsable || ''}"
                                   placeholder="Nom du responsable"
                                   onchange="Screens.updateAvisSyndical(${index}, 'responsable', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Description des travaux</label>
                            <textarea class="form-control" rows="4"
                                      placeholder="Description détaillée des travaux concernés..."
                                      onchange="Screens.updateAvisSyndical(${index}, 'description', this.value)">${avis.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Liste des travaux (OT)</label>
                            <textarea class="form-control" rows="3"
                                      placeholder="Liste des OT concernés, séparés par des virgules ou retours à la ligne..."
                                      onchange="Screens.updateAvisSyndical(${index}, 'travaux', this.value)">${avis.travaux || ''}</textarea>
                        </div>
                    </div>

                    <!-- Validation et Actions -->
                    <div>
                        <!-- Validation Direction -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">Validation Direction</h3>
                            </div>
                            ${avis.valideDirection ? `
                                <div class="validation-status validation-approved">
                                    <div class="validation-icon">✓</div>
                                    <div class="validation-info">
                                        <strong>Validé par la direction</strong>
                                        <p>Par: ${avis.validateurNom || 'N/A'}</p>
                                        <p>Date: ${avis.dateValidation || 'N/A'}</p>
                                        ${avis.commentaireValidation ? `<p>Commentaire: ${avis.commentaireValidation}</p>` : ''}
                                    </div>
                                    <button class="btn btn-sm btn-outline" onclick="Screens.annulerValidationAvis(${index})">
                                        Annuler la validation
                                    </button>
                                </div>
                            ` : `
                                <div class="validation-form">
                                    <div class="form-group">
                                        <label>Nom du validateur</label>
                                        <input type="text" id="validateurNom" class="form-control" placeholder="Nom de la personne qui valide">
                                    </div>
                                    <div class="form-group">
                                        <label>Commentaire (optionnel)</label>
                                        <textarea id="commentaireValidation" class="form-control" rows="2" placeholder="Commentaire de validation..."></textarea>
                                    </div>
                                    <button class="btn btn-success" onclick="Screens.validerAvisDirection(${index})">
                                        Valider l'avis
                                    </button>
                                </div>
                            `}
                        </div>

                        <!-- Génération Document -->
                        <div class="card" style="margin-top: 20px;">
                            <div class="card-header">
                                <h3 class="card-title">Génération du document</h3>
                            </div>
                            ${!data.templateNom ? `
                                <div class="generation-warning">
                                    <p>Aucun template DOCX uploadé.</p>
                                    <a href="#" onclick="Screens.fermerAvisSyndical(); return false;">Uploader un template</a>
                                </div>
                            ` : !avis.valideDirection ? `
                                <div class="generation-warning">
                                    <p>L'avis doit être validé par la direction avant de pouvoir générer le document.</p>
                                </div>
                            ` : `
                                <div class="generation-actions">
                                    <p>Template: <strong>${data.templateNom}</strong></p>
                                    ${avis.dateGeneration ? `
                                        <p class="generation-date">Dernière génération: ${avis.dateGeneration}</p>
                                    ` : ''}
                                    <button class="btn btn-primary" onclick="Screens.genererDocumentAvis(${index})">
                                        Générer le document DOCX
                                    </button>
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Historique -->
                <div class="card" style="margin-top: 20px;">
                    <div class="card-header">
                        <h3 class="card-title">Historique des modifications (${historique.length})</h3>
                    </div>
                    <div class="historique-list" style="max-height: 300px; overflow-y: auto;">
                        ${historique.length === 0 ? `
                            <p class="empty-msg" style="text-align: center; color: #94a3b8; padding: 20px;">Aucune modification enregistrée</p>
                        ` : historique.slice().reverse().map(h => `
                            <div class="historique-item" style="padding: 12px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                                <div>
                                    <strong>${h.action}</strong>
                                    ${h.details ? `<br><span style="color: #64748b; font-size: 0.9rem;">${h.details}</span>` : ''}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.85rem; white-space: nowrap;">
                                    ${h.date} ${h.heure || ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    updateAvisSyndical(index, field, value) {
        const data = this.getAvisSyndicauxData();
        const avis = data.avis[index];
        if (!avis) return;

        const oldValue = avis[field];
        avis[field] = value;

        // Ajouter à l'historique
        if (!avis.historique) avis.historique = [];
        avis.historique.push({
            action: `Modification: ${field}`,
            details: `"${oldValue || ''}" → "${value}"`,
            date: new Date().toLocaleDateString('fr-CA'),
            heure: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
        });

        DataManager.saveToStorage();
    },

    validerAvisDirection(index) {
        const validateurNom = document.getElementById('validateurNom').value.trim();
        const commentaire = document.getElementById('commentaireValidation').value.trim();

        if (!validateurNom) {
            App.showToast('Veuillez entrer le nom du validateur', 'error');
            return;
        }

        const data = this.getAvisSyndicauxData();
        const avis = data.avis[index];
        if (!avis) return;

        avis.valideDirection = true;
        avis.validateurNom = validateurNom;
        avis.dateValidation = new Date().toLocaleDateString('fr-CA');
        avis.commentaireValidation = commentaire;

        // Historique
        if (!avis.historique) avis.historique = [];
        avis.historique.push({
            action: 'Validation direction',
            details: `Validé par ${validateurNom}`,
            date: new Date().toLocaleDateString('fr-CA'),
            heure: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
        });

        DataManager.saveToStorage();
        App.render();
        App.showToast('Avis validé par la direction', 'success');
    },

    annulerValidationAvis(index) {
        if (!confirm('Annuler la validation de cet avis ?')) return;

        const data = this.getAvisSyndicauxData();
        const avis = data.avis[index];
        if (!avis) return;

        const ancienValidateur = avis.validateurNom;
        avis.valideDirection = false;
        avis.validateurNom = '';
        avis.dateValidation = '';
        avis.commentaireValidation = '';

        // Historique
        if (!avis.historique) avis.historique = [];
        avis.historique.push({
            action: 'Annulation validation',
            details: `Validation de ${ancienValidateur} annulée`,
            date: new Date().toLocaleDateString('fr-CA'),
            heure: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
        });

        DataManager.saveToStorage();
        App.render();
        App.showToast('Validation annulée', 'success');
    },

    async genererDocumentAvis(index) {
        const data = this.getAvisSyndicauxData();
        const avis = data.avis[index];

        if (!data.template) {
            App.showToast('Aucun template disponible', 'error');
            return;
        }

        if (!avis.valideDirection) {
            App.showToast('L\'avis doit être validé avant génération', 'error');
            return;
        }

        try {
            // Décoder le base64 du template
            const base64Data = data.template.split(',')[1];
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Créer un blob et télécharger
            // Note: Pour une vraie génération DOCX avec remplacement de balises,
            // il faudrait utiliser une librairie comme docxtemplater
            // Ici on fait un téléchargement simple du template avec les données en JSON

            // Créer un fichier texte avec les données pour accompagner
            const donneesAvis = {
                titre: avis.titre,
                dateDebut: avis.dateDebut,
                dateFin: avis.dateFin,
                description: avis.description,
                travaux: avis.travaux,
                responsable: avis.responsable,
                dateCreation: avis.dateCreation,
                validateurNom: avis.validateurNom,
                dateValidation: avis.dateValidation
            };

            // Télécharger le template original
            const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Avis_Syndical_${avis.titre.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('fr-CA')}.docx`;
            link.click();
            URL.revokeObjectURL(url);

            // Télécharger aussi les données en JSON pour référence
            const jsonBlob = new Blob([JSON.stringify(donneesAvis, null, 2)], { type: 'application/json' });
            const jsonUrl = URL.createObjectURL(jsonBlob);
            const jsonLink = document.createElement('a');
            jsonLink.href = jsonUrl;
            jsonLink.download = `Donnees_Avis_${avis.titre.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
            setTimeout(() => {
                jsonLink.click();
                URL.revokeObjectURL(jsonUrl);
            }, 500);

            // Mettre à jour la date de génération
            avis.dateGeneration = new Date().toLocaleDateString('fr-CA');

            // Historique
            if (!avis.historique) avis.historique = [];
            avis.historique.push({
                action: 'Document généré',
                details: `Fichier téléchargé`,
                date: new Date().toLocaleDateString('fr-CA'),
                heure: new Date().toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
            });

            DataManager.saveToStorage();
            App.render();
            App.showToast('Document généré et téléchargé', 'success');

        } catch (error) {
            console.error('Erreur génération:', error);
            App.showToast('Erreur lors de la génération', 'error');
        }
    },

    // === RÉUNIONS ===
    // État de l'écran réunions
    reunionSelectionnee: null,

    // Liste des entreprises externes (pour réunions par entité)
    getEntreprisesExternes() {
        const entreprises = DataManager.getEntreprises();
        const externes = entreprises.filter(e => {
            if (!e) return false;
            const nom = e.toUpperCase();
            // Entreprises externes: MECEXT*, HYDEP, ORTEC, VEOLIA, A91CS, AEROVAC
            return nom.startsWith('MECEXT') ||
                   nom === 'HYDEP' ||
                   nom === 'ORTEC' ||
                   nom === 'VEOLIA' ||
                   nom === 'A91CS' ||
                   nom === 'AEROVAC';
        });
        return [...new Set(externes)].sort();
    },

    // Liste des réunions prédéfinies
    getReunionsConfig() {
        const reunionsBase = [
            // Réunions Principales
            { id: 'R1', categorie: 'Principales', semaine: -26, nom: 'Convoquer rencontre de définition et concertation de l\'arrêt', responsable: 'Planificateur Long terme' },
            { id: 'R2', categorie: 'Principales', semaine: -20, nom: 'Rencontre de définition d\'arrêt', responsable: 'Planificateur Long terme' },
            { id: 'R3', categorie: 'Principales', semaine: -16, nom: 'Rencontre de concertation d\'arrêt', responsable: 'Planificateur Long terme' },
            { id: 'R4', categorie: 'Principales', semaine: -8, nom: 'Rencontre pré-arrêt', responsable: 'PL' },
            { id: 'R5', categorie: 'Principales', semaine: 0, nom: 'Simulation d\'une rencontre de shutdown', responsable: 'PL' },
            // Réunions Entrepreneurs
            { id: 'R6', categorie: 'Entrepreneurs', semaine: -4, nom: 'Rencontre syndicale pour présentation travaux sous-traitance', responsable: 'SE' },
            // R7 est maintenant généré dynamiquement par entreprise externe
            // Réunions Sécurité
            { id: 'R8', categorie: 'Sécurité', semaine: -14, nom: 'Faire rencontre pour les travaux des tours de refroidissement', responsable: 'Planificateur Long terme' },
            { id: 'R9', categorie: 'Sécurité', semaine: -1, nom: 'Planifier rencontre sécurité pour employés (3 tableaux de bord) + pool', responsable: 'CE' },
            // Réunions Techniques
            { id: 'R10', categorie: 'Techniques', semaine: -12, nom: 'Rencontre avec groupe technique entretien pour définir liste de travaux', responsable: 'Planificateur Long terme' },
            { id: 'R11', categorie: 'Techniques', semaine: -6, nom: 'Rencontre avec l\'équipe du gaz CO (pour l\'arrêt du gaz CO)', responsable: 'PL' },
            // Autres Réunions
            { id: 'R12', categorie: 'Autres', semaine: -12, nom: 'Planifier les rencontres de préparation arrêt hebdo', responsable: 'Planificateur Long terme', recurrent: true },
            { id: 'R13', categorie: 'Autres', semaine: -4, nom: 'Établir horaire des rencontres (N3) de shut down', responsable: 'CE' },
            { id: 'R14', categorie: 'Autres', semaine: -1, nom: 'Envoyer convocation pour rencontre de suivi de l\'arrêt (exécution)', responsable: 'PL' }
        ];

        // Générer les réunions entrepreneurs (R7) par entreprise externe
        const entreprisesExternes = this.getEntreprisesExternes();
        entreprisesExternes.forEach((entreprise, index) => {
            reunionsBase.push({
                id: `R7-${entreprise}`,
                categorie: 'Entrepreneurs',
                semaine: 0,
                nom: `Rencontre entrepreneur: ${entreprise}`,
                responsable: 'PL',
                entreprise: entreprise,
                isEntrepreneur: true
            });
        });

        // Si aucune entreprise externe, ajouter une réunion générique
        if (entreprisesExternes.length === 0) {
            reunionsBase.push({
                id: 'R7',
                categorie: 'Entrepreneurs',
                semaine: 0,
                nom: 'Faire rencontre général pour les entrepreneurs',
                responsable: 'PL',
                noEntreprises: true
            });
        }

        return reunionsBase;
    },

    getCategorieIcon(categorie) {
        const icons = {
            'Principales': '📅',
            'Entrepreneurs': '🏗️',
            'Sécurité': '🛡️',
            'Techniques': '🔧',
            'Autres': '📋'
        };
        return icons[categorie] || '📋';
    },

    getReunionData(reunionId) {
        const reunions = DataManager.data.processus?.reunions || {};
        return reunions[reunionId] || {
            statut: 'non_commence',
            pourcentage: 0,
            dateButoir: '',
            dateRealisee: '',
            compteRendu: '',
            documents: [],
            participants: ''
        };
    },

    renderReunions() {
        // Si une réunion est sélectionnée, afficher le détail
        if (this.reunionSelectionnee) {
            return this.renderReunionDetail(this.reunionSelectionnee);
        }

        const reunionsConfig = this.getReunionsConfig();
        const reunionsData = DataManager.data.processus?.reunions || {};

        // Grouper par catégorie
        const categories = {};
        reunionsConfig.forEach(r => {
            if (!categories[r.categorie]) categories[r.categorie] = [];
            const data = reunionsData[r.id] || {};
            categories[r.categorie].push({ ...r, data });
        });

        // Stats
        const totalReunions = reunionsConfig.length;
        const terminees = reunionsConfig.filter(r => (reunionsData[r.id]?.statut === 'termine')).length;
        const enCours = reunionsConfig.filter(r => (reunionsData[r.id]?.statut === 'en_cours')).length;

        // Calculer les dates butoirs basées sur la date d'arrêt
        const dateArret = DataManager.data.processus?.definitionArret?.dateDebut;

        return `
            <div class="reunions-screen">
                <!-- Stats -->
                <div class="card">
                    <div class="commande-resume">
                        <div class="resume-stat">
                            <span class="stat-value">${totalReunions}</span>
                            <span class="stat-label">Total réunions</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${terminees}</span>
                            <span class="stat-label">Terminées</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${enCours}</span>
                            <span class="stat-label">En cours</span>
                        </div>
                        <div class="resume-stat">
                            <span class="stat-value">${totalReunions - terminees - enCours}</span>
                            <span class="stat-label">Non commencées</span>
                        </div>
                    </div>
                </div>

                ${!dateArret ? `
                    <div class="card">
                        <div class="budget-warning" style="margin: 0;">
                            Aucune date d'arrêt définie. <a href="#" onclick="App.navigateTo('preparation'); return false;">Définir dans D1.0</a> pour calculer les dates butoirs.
                        </div>
                    </div>
                ` : ''}

                ${Object.entries(categories).map(([categorie, reunions]) => `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${this.getCategorieIcon(categorie)} Réunions ${categorie} (${reunions.length})</h3>
                        </div>
                        <div class="table-container">
                            <table class="data-table reunions-table">
                                <thead>
                                    <tr>
                                        <th style="width: 80px;">Semaine</th>
                                        <th>Réunion</th>
                                        <th style="width: 120px;">Date butoir</th>
                                        <th style="width: 150px;">Responsable</th>
                                        <th style="width: 120px;">Statut</th>
                                        <th style="width: 100px;">Progression</th>
                                        <th style="width: 80px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${reunions.map(r => {
                                        const statut = r.data.statut || 'non_commence';
                                        const pct = r.data.pourcentage || 0;
                                        const dateButoir = this.calculerDateButoir(dateArret, r.semaine);
                                        const statutClass = statut === 'termine' ? 'badge-success' : statut === 'en_cours' ? 'badge-warning' : 'badge-secondary';
                                        const statutLabel = statut === 'termine' ? 'Terminé' : statut === 'en_cours' ? 'En cours' : 'Non commencé';

                                        return `
                                            <tr class="${statut === 'termine' ? 'row-success' : ''}${r.isEntrepreneur ? ' row-entrepreneur' : ''}" style="cursor: pointer;" onclick="Screens.ouvrirReunion('${r.id}')">
                                                <td class="center"><strong>${r.semaine >= 0 ? '' : ''}${r.semaine} sem</strong></td>
                                                <td>
                                                    ${r.nom}
                                                    ${r.recurrent ? '<span class="badge badge-info" style="margin-left: 5px;">♻️ Hebdo</span>' : ''}
                                                    ${r.isEntrepreneur ? '<span class="badge badge-entrepreneur" style="margin-left: 5px;">🏗️ Externe</span>' : ''}
                                                    ${r.noEntreprises ? '<span class="badge badge-warning" style="margin-left: 5px;">⚠️ Importer travaux</span>' : ''}
                                                </td>
                                                <td class="center">${dateButoir || '-'}</td>
                                                <td>${r.responsable}</td>
                                                <td><span class="badge ${statutClass}">${statutLabel}</span></td>
                                                <td>
                                                    <div class="mini-progress">
                                                        <div class="mini-progress-bar" style="width: ${pct}%"></div>
                                                    </div>
                                                    <span class="mini-pct">${pct}%</span>
                                                </td>
                                                <td class="center">
                                                    <button class="btn btn-sm btn-outline" onclick="event.stopPropagation(); Screens.ouvrirReunion('${r.id}')">
                                                        Détails
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    calculerDateButoir(dateArret, semaines) {
        if (!dateArret) return null;
        const date = new Date(dateArret);
        date.setDate(date.getDate() + (semaines * 7));
        return date.toLocaleDateString('fr-CA');
    },

    ouvrirReunion(reunionId) {
        this.reunionSelectionnee = reunionId;
        App.navigate('reunions');
    },

    fermerReunion() {
        this.reunionSelectionnee = null;
        App.navigate('reunions');
    },

    renderReunionDetail(reunionId) {
        const reunionsConfig = this.getReunionsConfig();
        const reunion = reunionsConfig.find(r => r.id === reunionId);
        if (!reunion) {
            this.reunionSelectionnee = null;
            return this.renderReunions();
        }

        const data = this.getReunionData(reunionId);
        const dateArret = DataManager.data.processus?.definitionArret?.dateDebut;
        const dateButoir = this.calculerDateButoir(dateArret, reunion.semaine);

        return `
            <div class="reunion-detail-screen">
                <!-- Header -->
                <div class="detail-header" style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <button class="back-btn" onclick="Screens.fermerReunion()">
                        ← Retour aux réunions
                    </button>
                    <div class="detail-title" style="margin-top: 10px;">
                        <span class="badge badge-primary">${reunion.semaine} sem</span>
                        <h2 style="margin: 10px 0;">${reunion.nom}</h2>
                        <p style="color: #64748b;">
                            ${this.getCategorieIcon(reunion.categorie)} ${reunion.categorie} |
                            Responsable: <strong>${reunion.responsable}</strong> |
                            Date butoir: <strong>${dateButoir || 'Non définie'}</strong>
                        </p>
                    </div>
                </div>

                <div class="grid-2">
                    <!-- Informations -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Informations</h3>
                        </div>
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="reunionStatut" class="form-control" onchange="Screens.updateReunion('${reunionId}', 'statut', this.value)">
                                <option value="non_commence" ${data.statut === 'non_commence' ? 'selected' : ''}>Non commencé</option>
                                <option value="en_cours" ${data.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                <option value="termine" ${data.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Progression: <span id="reunionPctLabel">${data.pourcentage || 0}%</span></label>
                            <input type="range" class="form-control-range" min="0" max="100" step="10"
                                   value="${data.pourcentage || 0}"
                                   oninput="document.getElementById('reunionPctLabel').textContent = this.value + '%'"
                                   onchange="Screens.updateReunion('${reunionId}', 'pourcentage', parseInt(this.value))">
                        </div>
                        <div class="form-group">
                            <label>Date réalisée</label>
                            <input type="date" class="form-control" value="${data.dateRealisee || ''}"
                                   onchange="Screens.updateReunion('${reunionId}', 'dateRealisee', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Participants</label>
                            <input type="text" class="form-control" value="${data.participants || ''}"
                                   placeholder="Liste des participants"
                                   onchange="Screens.updateReunion('${reunionId}', 'participants', this.value)">
                        </div>
                    </div>

                    <!-- Documents -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Documents (${(data.documents || []).length})</h3>
                        </div>
                        <div class="form-group">
                            <label>Ajouter un document</label>
                            <div class="input-group">
                                <input type="text" id="nouveauDocReunion" class="form-control" placeholder="Nom du document ou lien">
                                <button class="btn btn-primary" onclick="Screens.ajouterDocumentReunion('${reunionId}')">Ajouter</button>
                            </div>
                        </div>
                        <div class="documents-list" style="max-height: 200px; overflow-y: auto;">
                            ${(data.documents || []).length === 0 ? `
                                <p class="empty-msg" style="text-align: center; color: #94a3b8;">Aucun document</p>
                            ` : (data.documents || []).map((doc, i) => `
                                <div class="document-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                                    <span>📄 ${doc}</span>
                                    <button class="btn-icon danger" onclick="Screens.supprimerDocumentReunion('${reunionId}', ${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Compte rendu -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Compte rendu de la réunion</h3>
                    </div>
                    <div class="form-group">
                        <textarea id="reunionCompteRendu" class="form-control" rows="12"
                                  placeholder="Saisissez le compte rendu de la réunion ici...

Points abordés:
-
-

Décisions prises:
-
-

Actions à suivre:
-
- "
                                  onchange="Screens.updateReunion('${reunionId}', 'compteRendu', this.value)">${data.compteRendu || ''}</textarea>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-outline" onclick="Screens.exporterCompteRendu('${reunionId}')">
                            Exporter PDF
                        </button>
                        <button class="btn btn-outline" onclick="Screens.envoyerCompteRendu('${reunionId}')">
                            Envoyer par courriel
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    updateReunion(reunionId, field, value) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.reunions) DataManager.data.processus.reunions = {};
        if (!DataManager.data.processus.reunions[reunionId]) {
            DataManager.data.processus.reunions[reunionId] = {};
        }
        DataManager.data.processus.reunions[reunionId][field] = value;
        DataManager.saveToStorage();

        // Mettre à jour automatiquement le statut si progression = 100
        if (field === 'pourcentage' && value === 100) {
            DataManager.data.processus.reunions[reunionId].statut = 'termine';
            DataManager.saveToStorage();
            App.render();
        }
    },

    ajouterDocumentReunion(reunionId) {
        const input = document.getElementById('nouveauDocReunion');
        const nom = input.value.trim();
        if (!nom) return;

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.reunions) DataManager.data.processus.reunions = {};
        if (!DataManager.data.processus.reunions[reunionId]) {
            DataManager.data.processus.reunions[reunionId] = { documents: [] };
        }
        if (!DataManager.data.processus.reunions[reunionId].documents) {
            DataManager.data.processus.reunions[reunionId].documents = [];
        }

        DataManager.data.processus.reunions[reunionId].documents.push(nom);
        DataManager.saveToStorage();
        App.render();
        App.showToast('Document ajouté', 'success');
    },

    supprimerDocumentReunion(reunionId, index) {
        if (DataManager.data.processus?.reunions?.[reunionId]?.documents) {
            DataManager.data.processus.reunions[reunionId].documents.splice(index, 1);
            DataManager.saveToStorage();
            App.render();
        }
    },

    exporterCompteRendu(reunionId) {
        const reunionsConfig = this.getReunionsConfig();
        const reunion = reunionsConfig.find(r => r.id === reunionId);
        const data = this.getReunionData(reunionId);
        const dateArret = DataManager.data.processus?.definitionArret?.dateDebut;
        const dateButoir = this.calculerDateButoir(dateArret, reunion.semaine);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Compte rendu - ${reunion.nom}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; font-size: 12px; line-height: 1.6; }
                    h1 { color: #1e3a5f; font-size: 18px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
                    .info { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .info p { margin: 5px 0; }
                    .label { font-weight: bold; color: #475569; }
                    .content { white-space: pre-wrap; background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; }
                    .documents { margin-top: 20px; }
                    .documents ul { margin: 10px 0; padding-left: 20px; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>Compte rendu de réunion</h1>
                <div class="info">
                    <p><span class="label">Réunion:</span> ${reunion.nom}</p>
                    <p><span class="label">Catégorie:</span> ${reunion.categorie}</p>
                    <p><span class="label">Responsable:</span> ${reunion.responsable}</p>
                    <p><span class="label">Date butoir:</span> ${dateButoir || 'Non définie'}</p>
                    <p><span class="label">Date réalisée:</span> ${data.dateRealisee || 'Non renseignée'}</p>
                    <p><span class="label">Participants:</span> ${data.participants || 'Non renseignés'}</p>
                </div>
                <h2>Compte rendu</h2>
                <div class="content">${data.compteRendu || 'Aucun compte rendu saisi.'}</div>
                ${(data.documents || []).length > 0 ? `
                    <div class="documents">
                        <h2>Documents</h2>
                        <ul>
                            ${data.documents.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
    },

    envoyerCompteRendu(reunionId) {
        const reunionsConfig = this.getReunionsConfig();
        const reunion = reunionsConfig.find(r => r.id === reunionId);
        const data = this.getReunionData(reunionId);

        const sujet = `Compte rendu - ${reunion.nom}`;
        let corps = `Bonjour,\n\nVeuillez trouver ci-dessous le compte rendu de la réunion.\n\n`;
        corps += `Réunion: ${reunion.nom}\n`;
        corps += `Date: ${data.dateRealisee || 'Non renseignée'}\n`;
        corps += `Participants: ${data.participants || 'Non renseignés'}\n\n`;
        corps += `--- Compte rendu ---\n\n`;
        corps += data.compteRendu || 'Aucun compte rendu saisi.';
        corps += `\n\nCordialement`;

        const mailtoLink = `mailto:?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
        window.location.href = mailtoLink;
        App.showToast('Client de messagerie ouvert', 'success');
    },

    // === PARAMÈTRES ===
    renderParametres() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Paramètres</h3>
                </div>
                <p style="color: var(--text-light); padding: 40px; text-align: center;">
                    Cette section sera développée prochainement.
                </p>
            </div>
        `;
    },

    // === PIÈCES ===
    renderPieces() {
        const pieces = DataManager.data.pieces || [];

        if (pieces.length === 0) {
            return `
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🔩 Liste des Pièces</h3>
                    </div>
                    <div style="padding: 40px; text-align: center; color: var(--text-light);">
                        <p>Aucune pièce importée.</p>
                        <p style="margin-top: 10px;">Importez des pièces depuis l'écran "Import Données".</p>
                    </div>
                </div>
            `;
        }

        // Obtenir les OT uniques pour le filtre
        const otUniques = [...new Set(pieces.map(p => p.otLie).filter(Boolean))].sort();

        // Statistiques kitting
        const kittingStats = typeof KittingSync !== 'undefined' ? KittingSync.getStats() : null;

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🔩 Liste des Pièces</h3>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span class="badge badge-primary">${pieces.length} pièces</span>
                        <button onclick="Screens.syncPiecesToFirebase()" class="btn-sync" title="Synchroniser vers Firebase" style="background: #4CAF50; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                            ☁️ Sync Firebase
                        </button>
                    </div>
                </div>

                <!-- Légende des couleurs kitting -->
                <div style="padding: 10px 15px; background: var(--bg-light); border-bottom: 1px solid var(--border); display: flex; gap: 20px; flex-wrap: wrap; align-items: center; font-size: 0.85rem;">
                    <span style="font-weight: 500;">Statut Pièce:</span>
                    <span style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 12px; height: 12px; background: #4ade80; border-radius: 3px;"></span>
                        Reçue
                    </span>
                    <span style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 12px; height: 12px; background: #fbbf24; border-radius: 3px;"></span>
                        En attente
                    </span>
                    <span style="display: flex; align-items: center; gap: 5px;">
                        <span style="width: 12px; height: 12px; background: #e5e7eb; border-radius: 3px;"></span>
                        Pas de kitting
                    </span>
                    ${kittingStats ? `<span style="margin-left: auto; color: var(--text-light);">Kittings: ${kittingStats.prets}/${kittingStats.total} prêts</span>` : ''}
                </div>

                <div style="padding: 15px; border-bottom: 1px solid var(--border); display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
                    <input type="text" id="pieceSearch" placeholder="Rechercher..."
                           style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; flex: 1; min-width: 200px;"
                           oninput="Screens.filterPieces()">
                    <select id="pieceOTFilter" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;"
                            onchange="Screens.filterPieces()">
                        <option value="">Tous les OT</option>
                        ${otUniques.map(ot => `<option value="${ot}">${ot}</option>`).join('')}
                    </select>
                    <select id="pieceKittingFilter" style="padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px;"
                            onchange="Screens.filterPieces()">
                        <option value="">Tous statuts kitting</option>
                        <option value="pret">Kitting prêt</option>
                        <option value="incomplet">Kitting incomplet</option>
                        <option value="none">Sans kitting</option>
                    </select>
                </div>

                <div style="overflow-x: auto;">
                    <table class="table" id="piecesTable">
                        <thead>
                            <tr>
                                <th>OT Lié</th>
                                <th>Référence</th>
                                <th>Désignation</th>
                                <th>Quantité</th>
                                <th>Fournisseur</th>
                                <th>Kitting</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pieces.map(p => {
                                const kittingStatus = typeof KittingSync !== 'undefined' ? KittingSync.getPieceKittingStatus(p) : { hasKitting: false };
                                // Vert si la pièce est reçue, jaune si kitting existe mais pièce non reçue
                                const rowClass = kittingStatus.hasKitting
                                    ? (kittingStatus.pieceReceived ? 'kitting-pret' : 'kitting-incomplet')
                                    : '';
                                const kittingBadge = kittingStatus.hasKitting
                                    ? (kittingStatus.pieceReceived
                                        ? `<span class="badge" style="background: #4ade80; color: #166534;">✓ Reçue</span>`
                                        : `<span class="badge" style="background: #fbbf24; color: #92400e;">⏳ En attente</span>`)
                                    : `<span style="color: var(--text-light);">-</span>`;
                                const locationInfo = kittingStatus.location ? `<br><small style="color: var(--text-light);">${kittingStatus.location}</small>` : '';

                                return `
                                <tr class="${rowClass}"
                                    data-ot="${(p.otLie || '').toLowerCase()}"
                                    data-kitting="${kittingStatus.hasKitting ? (kittingStatus.pieceReceived ? 'pret' : 'incomplet') : 'none'}"
                                    data-search="${(p.otLie + ' ' + p.reference + ' ' + p.designation + ' ' + p.fournisseur).toLowerCase()}">
                                    <td><strong>${p.otLie || '-'}</strong></td>
                                    <td>${p.reference || '-'}</td>
                                    <td>${p.designation || '-'}</td>
                                    <td>${p.quantite || 1}${p.unite ? ' ' + p.unite : ''}</td>
                                    <td>${p.fournisseur || '-'}</td>
                                    <td>${kittingBadge}${locationInfo}</td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    filterPieces() {
        const search = (document.getElementById('pieceSearch')?.value || '').toLowerCase();
        const otFilter = (document.getElementById('pieceOTFilter')?.value || '').toLowerCase();
        const kittingFilter = document.getElementById('pieceKittingFilter')?.value || '';
        const rows = document.querySelectorAll('#piecesTable tbody tr');

        rows.forEach(row => {
            const rowSearch = row.dataset.search || '';
            const rowOT = row.dataset.ot || '';
            const rowKitting = row.dataset.kitting || '';

            const matchSearch = !search || rowSearch.includes(search);
            const matchOT = !otFilter || rowOT === otFilter;
            const matchKitting = !kittingFilter || rowKitting === kittingFilter;

            row.style.display = (matchSearch && matchOT && matchKitting) ? '' : 'none';
        });
    },

    async syncPiecesToFirebase() {
        const pieces = DataManager.data.pieces || [];
        if (pieces.length === 0) {
            App.showToast('Aucune pièce à synchroniser', 'warning');
            return;
        }

        try {
            App.showToast('Synchronisation en cours...', 'info');
            await FirebaseManager.syncToCloud();
            App.showToast(`${pieces.length} pièces synchronisées vers Firebase`, 'success');
            console.log('Pièces synchronisées:', pieces.length);
        } catch (error) {
            console.error('Erreur sync pièces:', error);
            App.showToast('Erreur de synchronisation', 'error');
        }
    },

    // ==========================================
    // CALENDRIER - Vue globale des dates du projet
    // ==========================================

    calendrierVue: 'mois', // 'mois' ou 'semaine'
    calendrierDate: new Date(),

    renderCalendrier() {
        const evenements = this.collecterEvenements();
        const aujourd_hui = new Date();
        aujourd_hui.setHours(0, 0, 0, 0);

        // Événements aujourd'hui
        const eventsAujourdhui = evenements.filter(e => {
            const dateEvent = new Date(e.date);
            dateEvent.setHours(0, 0, 0, 0);
            return dateEvent.getTime() === aujourd_hui.getTime();
        });

        // Événements des prochaines 24h (demain)
        const demain = new Date(aujourd_hui);
        demain.setDate(demain.getDate() + 1);
        const events24h = evenements.filter(e => {
            const dateEvent = new Date(e.date);
            dateEvent.setHours(0, 0, 0, 0);
            return dateEvent.getTime() === demain.getTime();
        });

        // Événements des 7 prochains jours
        const dans7jours = new Date(aujourd_hui);
        dans7jours.setDate(dans7jours.getDate() + 7);
        const eventsSemaine = evenements.filter(e => {
            const dateEvent = new Date(e.date);
            dateEvent.setHours(0, 0, 0, 0);
            return dateEvent > aujourd_hui && dateEvent <= dans7jours;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));

        // Notes du jour
        const noteJour = DataManager.getNoteJour(aujourd_hui);

        return `
            <div class="calendrier-screen">
                <!-- Panneau Aujourd'hui étendu -->
                <div class="calendrier-rappels">
                    <!-- Section Aujourd'hui avec résumé -->
                    <div class="aujourdhui-panel">
                        <div class="aujourdhui-header">
                            <div class="aujourdhui-date">
                                <span class="aujourdhui-jour">${aujourd_hui.getDate()}</span>
                                <div class="aujourdhui-mois">
                                    <span>${aujourd_hui.toLocaleDateString('fr-FR', {weekday: 'long'})}</span>
                                    <span>${aujourd_hui.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'})}</span>
                                </div>
                            </div>
                            <div class="aujourdhui-badge">${eventsAujourdhui.length} événement${eventsAujourdhui.length > 1 ? 's' : ''}</div>
                        </div>

                        <!-- Résumé des événements -->
                        <div class="aujourdhui-events">
                            ${eventsAujourdhui.length === 0 ?
                                '<p class="rappel-vide">🎉 Aucun événement aujourd\'hui</p>' :
                                eventsAujourdhui.map(e => this.renderEventRappel(e)).join('')
                            }
                        </div>

                        <!-- Zone de notes -->
                        <div class="aujourdhui-notes">
                            <div class="notes-header">
                                <h4>📝 Notes du jour</h4>
                            </div>
                            <textarea class="notes-textarea"
                                placeholder="Écrivez vos notes ici..."
                                onchange="Screens.saveNoteJour(this.value)">${noteJour.note || ''}</textarea>
                        </div>

                        <!-- Zone photos -->
                        <div class="aujourdhui-photos">
                            <div class="photos-header">
                                <h4>📷 Photos</h4>
                                <label class="btn btn-sm btn-outline photo-add-btn">
                                    + Ajouter
                                    <input type="file" accept="image/*" capture="environment"
                                           onchange="Screens.addPhotoJour(this)" style="display:none">
                                </label>
                            </div>
                            <div class="photos-grid">
                                ${noteJour.photos && noteJour.photos.length > 0 ?
                                    noteJour.photos.map(p => `
                                        <div class="photo-item" onclick="Screens.viewPhoto('${p.id}')">
                                            <img src="${p.data}" alt="Photo">
                                            <button class="photo-delete" onclick="event.stopPropagation(); Screens.deletePhotoJour('${p.id}')" title="Supprimer">×</button>
                                        </div>
                                    `).join('') :
                                    '<p class="photos-empty">Aucune photo</p>'
                                }
                            </div>
                        </div>
                    </div>

                    <!-- Demain et Cette semaine -->
                    <div class="rappel-section rappel-demain">
                        <h3>⏰ Demain</h3>
                        ${events24h.length === 0 ?
                            '<p class="rappel-vide">Aucun événement</p>' :
                            `<div class="rappel-liste">${events24h.map(e => this.renderEventRappel(e)).join('')}</div>`
                        }
                    </div>
                    <div class="rappel-section rappel-semaine">
                        <h3>📆 Cette semaine (${eventsSemaine.length})</h3>
                        ${eventsSemaine.length === 0 ?
                            '<p class="rappel-vide">Aucun événement</p>' :
                            `<div class="rappel-liste">${eventsSemaine.slice(0, 5).map(e => this.renderEventRappel(e, true)).join('')}
                             ${eventsSemaine.length > 5 ? `<p class="rappel-more">+ ${eventsSemaine.length - 5} autres...</p>` : ''}</div>`
                        }
                    </div>
                </div>

                <!-- Calendrier principal -->
                <div class="calendrier-main">
                    <div class="calendrier-header">
                        <div class="calendrier-nav">
                            <button class="btn btn-icon" onclick="Screens.calendrierPrecedent()">◀</button>
                            <h2>${this.getCalendrierTitre()}</h2>
                            <button class="btn btn-icon" onclick="Screens.calendrierSuivant()">▶</button>
                        </div>
                        <div class="calendrier-vues">
                            <button class="btn ${this.calendrierVue === 'mois' ? 'btn-primary' : 'btn-outline'}" onclick="Screens.setCalendrierVue('mois')">Mois</button>
                            <button class="btn ${this.calendrierVue === 'semaine' ? 'btn-primary' : 'btn-outline'}" onclick="Screens.setCalendrierVue('semaine')">Semaine</button>
                            <button class="btn btn-outline" onclick="Screens.calendrierAujourdhui()">Aujourd'hui</button>
                        </div>
                    </div>

                    <div class="calendrier-legende">
                        <span class="legende-item"><span class="legende-dot" style="background: #ef4444;"></span> Arrêt</span>
                        <span class="legende-item"><span class="legende-dot" style="background: #f59e0b;"></span> TPAA</span>
                        <span class="legende-item"><span class="legende-dot" style="background: #3b82f6;"></span> Réunion</span>
                        <span class="legende-item"><span class="legende-dot" style="background: #8b5cf6;"></span> Jalon</span>
                        <span class="legende-item"><span class="legende-dot" style="background: #10b981;"></span> Travaux</span>
                    </div>

                    ${this.calendrierVue === 'mois' ? this.renderCalendrierMois(evenements) : this.renderCalendrierSemaine(evenements)}
                </div>
            </div>
        `;
    },

    collecterEvenements() {
        const evenements = [];
        const dateArret = DataManager.data.processus?.dateArret;
        const dureeArret = DataManager.data.processus?.dureeArret || 14;

        // 1. Date de début et fin d'arrêt
        if (dateArret) {
            evenements.push({
                date: dateArret,
                titre: 'Début Arrêt (T-0)',
                type: 'arret',
                icon: '🚀',
                important: true
            });

            const dateFin = new Date(dateArret);
            dateFin.setDate(dateFin.getDate() + dureeArret);
            evenements.push({
                date: dateFin.toISOString(),
                titre: 'Fin Arrêt',
                type: 'arret',
                icon: '🏁',
                important: true
            });
        }

        // 2. TPAA avec leurs dates calculées
        const travaux = DataManager.getTravaux();
        const tpaaData = DataManager.data.processus?.tpaa || {};
        const travauxTPAA = travaux.filter(t => t.description && t.description.toUpperCase().includes('TPAA'));

        travauxTPAA.forEach((t, idx) => {
            const travailIndex = travaux.findIndex(tr => tr === t);
            const uniqueId = `${t.ot}_${travailIndex}`;
            const tpaaInfo = tpaaData[uniqueId] || {};

            if (dateArret) {
                const semainesAvant = this.extraireSemainesTPAA(t.description);
                const dateTPAA = this.calculerDateTPAA(dateArret, semainesAvant, tpaaInfo.ajustementJours || 0);

                if (dateTPAA && dateTPAA !== '-') {
                    evenements.push({
                        date: dateTPAA,
                        titre: `TPAA: ${t.ot}`,
                        description: t.description?.substring(0, 50),
                        type: 'tpaa',
                        icon: '🔧',
                        statut: tpaaInfo.statut || 'a_faire',
                        tpaaId: uniqueId,
                        ot: t.ot
                    });
                }
            }
        });

        // 3. Réunions
        const reunionsConfig = this.getReunionsConfig ? this.getReunionsConfig() : [];
        const reunionsData = DataManager.data.processus?.reunions || {};

        reunionsConfig.forEach(r => {
            if (dateArret && r.semaines !== undefined) {
                const dateReunion = new Date(dateArret);
                dateReunion.setDate(dateReunion.getDate() + (r.semaines * 7));

                const statut = reunionsData[r.id]?.statut || 'planifie';

                evenements.push({
                    date: dateReunion.toISOString(),
                    titre: r.nom,
                    type: 'reunion',
                    icon: '👥',
                    statut: statut
                });
            }
        });

        // 4. Jalons du processus
        if (typeof ProcessusArret !== 'undefined' && ProcessusArret.structure) {
            ['definir', 'planifier', 'preparer'].forEach(phaseId => {
                const phase = ProcessusArret.structure[phaseId];
                if (phase && phase.etapes) {
                    phase.etapes.forEach(etape => {
                        if (etape.jalon && dateArret) {
                            const datesPhase = ProcessusArret.getDatesPhase ? ProcessusArret.getDatesPhase(phaseId) : null;
                            if (datesPhase && datesPhase.fin) {
                                evenements.push({
                                    date: datesPhase.fin.toISOString(),
                                    titre: `Jalon: ${etape.nom}`,
                                    type: 'jalon',
                                    icon: '🎯',
                                    etapeId: etape.id
                                });
                            }
                        }
                    });
                }
            });
        }

        // 5. Travaux avec date de début
        travaux.forEach(t => {
            if (t.execution?.dateDebut) {
                evenements.push({
                    date: t.execution.dateDebut,
                    titre: `OT ${t.ot}`,
                    description: t.description?.substring(0, 40),
                    type: 'travaux',
                    icon: '⚙️'
                });
            }
        });

        return evenements;
    },

    extraireSemainesTPAA(description) {
        if (!description) return null;
        const match = description.match(/TPAA\s*\(?-?(\d+)\)?/i);
        return match ? parseInt(match[1]) : null;
    },

    calculerDateTPAA(dateDebutArret, semainesAvant, ajustementJours = 0) {
        if (!dateDebutArret || semainesAvant === null) return '-';

        const dateArret = new Date(dateDebutArret);
        const datePrevue = new Date(dateArret);
        datePrevue.setDate(datePrevue.getDate() - (semainesAvant * 7) + ajustementJours);

        return datePrevue.toISOString().split('T')[0];
    },

    renderEventRappel(event, showDate = false) {
        const typeColors = {
            arret: '#ef4444',
            tpaa: '#f59e0b',
            reunion: '#3b82f6',
            jalon: '#8b5cf6',
            travaux: '#10b981'
        };

        const dateStr = showDate ? `<span class="event-date">${this.formatDateCourte(new Date(event.date))}</span>` : '';

        // Sélecteur de statut pour les TPAA
        let statutSelect = '';
        if (event.type === 'tpaa' && event.tpaaId) {
            const statuts = {
                'a_faire': 'À faire',
                'planifie': 'Planifié',
                'en_cours': 'En cours',
                'termine': 'Terminé',
                'annule': 'Annulé'
            };
            const statutClass = {
                'a_faire': '',
                'planifie': 'status-planifie',
                'en_cours': 'status-encours',
                'termine': 'status-termine',
                'annule': 'status-annule'
            };
            statutSelect = `
                <select class="tpaa-statut-select ${statutClass[event.statut] || ''}"
                        onclick="event.stopPropagation()"
                        onchange="Screens.changeTPAAStatutCalendrier('${event.tpaaId}', this.value)">
                    ${Object.entries(statuts).map(([val, label]) =>
                        `<option value="${val}" ${event.statut === val ? 'selected' : ''}>${label}</option>`
                    ).join('')}
                </select>
            `;
        }

        return `
            <div class="rappel-event ${event.type === 'tpaa' ? 'rappel-tpaa' : ''}" style="border-left-color: ${typeColors[event.type] || '#94a3b8'}">
                <span class="event-icon">${event.icon}</span>
                <div class="event-info">
                    <span class="event-titre">${event.titre}</span>
                    ${event.description ? `<span class="event-desc">${event.description}</span>` : ''}
                </div>
                ${statutSelect}
                ${dateStr}
            </div>
        `;
    },

    changeTPAAStatutCalendrier(tpaaId, statut) {
        if (!DataManager.data.processus) {
            DataManager.data.processus = {};
        }
        if (!DataManager.data.processus.tpaa) {
            DataManager.data.processus.tpaa = {};
        }
        if (!DataManager.data.processus.tpaa[tpaaId]) {
            DataManager.data.processus.tpaa[tpaaId] = {};
        }
        DataManager.data.processus.tpaa[tpaaId].statut = statut;
        DataManager.saveToStorage();

        // Mettre à jour le select visuellement
        const select = event.target;
        select.className = 'tpaa-statut-select';
        const statutClass = {
            'a_faire': '',
            'planifie': 'status-planifie',
            'en_cours': 'status-encours',
            'termine': 'status-termine',
            'annule': 'status-annule'
        };
        if (statutClass[statut]) {
            select.classList.add(statutClass[statut]);
        }

        App.showToast('Statut TPAA mis à jour', 'success');
    },

    renderCalendrierMois(evenements) {
        const annee = this.calendrierDate.getFullYear();
        const mois = this.calendrierDate.getMonth();

        const premierJour = new Date(annee, mois, 1);
        const dernierJour = new Date(annee, mois + 1, 0);

        // Ajuster pour commencer le lundi (0 = lundi, 6 = dimanche)
        let jourDebut = premierJour.getDay() - 1;
        if (jourDebut < 0) jourDebut = 6;

        const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const aujourd_hui = new Date();
        aujourd_hui.setHours(0, 0, 0, 0);

        let html = `<div class="calendrier-grille">`;

        // En-têtes des jours
        html += `<div class="calendrier-jours-header">`;
        jours.forEach(j => html += `<div class="jour-header">${j}</div>`);
        html += `</div>`;

        html += `<div class="calendrier-jours">`;

        // Cases vides avant le premier jour
        for (let i = 0; i < jourDebut; i++) {
            html += `<div class="jour-case jour-vide"></div>`;
        }

        // Jours du mois
        for (let jour = 1; jour <= dernierJour.getDate(); jour++) {
            const dateJour = new Date(annee, mois, jour);
            dateJour.setHours(0, 0, 0, 0);

            const isAujourdhui = dateJour.getTime() === aujourd_hui.getTime();
            const isWeekend = dateJour.getDay() === 0 || dateJour.getDay() === 6;

            // Événements de ce jour
            const eventsJour = evenements.filter(e => {
                const dateEvent = new Date(e.date);
                dateEvent.setHours(0, 0, 0, 0);
                return dateEvent.getTime() === dateJour.getTime();
            });

            const classes = ['jour-case'];
            if (isAujourdhui) classes.push('jour-aujourdhui');
            if (isWeekend) classes.push('jour-weekend');
            if (eventsJour.length > 0) classes.push('jour-events');

            html += `<div class="${classes.join(' ')}" onclick="Screens.voirJour('${dateJour.toISOString()}')">`;
            html += `<span class="jour-numero">${jour}</span>`;

            if (eventsJour.length > 0) {
                html += `<div class="jour-events-liste">`;
                // Afficher les 3 premiers événements avec leur titre
                eventsJour.slice(0, 3).forEach(e => {
                    const color = {arret: '#ef4444', tpaa: '#f59e0b', reunion: '#3b82f6', jalon: '#8b5cf6', travaux: '#10b981'}[e.type];
                    const titre = e.titre.length > 15 ? e.titre.substring(0, 15) + '...' : e.titre;
                    html += `<div class="jour-event-mini" style="background: ${color}20; border-left-color: ${color}">
                        <span class="event-mini-icon">${e.icon}</span>
                        <span class="event-mini-titre">${titre}</span>
                    </div>`;
                });
                if (eventsJour.length > 3) {
                    html += `<div class="jour-events-more">+${eventsJour.length - 3} autres</div>`;
                }
                html += `</div>`;
            }

            html += `</div>`;
        }

        html += `</div></div>`;
        return html;
    },

    renderCalendrierSemaine(evenements) {
        const debut = this.getDebutSemaine(this.calendrierDate);
        const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const aujourd_hui = new Date();
        aujourd_hui.setHours(0, 0, 0, 0);

        let html = `<div class="calendrier-semaine">`;

        for (let i = 0; i < 7; i++) {
            const dateJour = new Date(debut);
            dateJour.setDate(debut.getDate() + i);
            dateJour.setHours(0, 0, 0, 0);

            const isAujourdhui = dateJour.getTime() === aujourd_hui.getTime();

            const eventsJour = evenements.filter(e => {
                const dateEvent = new Date(e.date);
                dateEvent.setHours(0, 0, 0, 0);
                return dateEvent.getTime() === dateJour.getTime();
            });

            const classes = ['semaine-jour'];
            if (isAujourdhui) classes.push('jour-aujourdhui');

            html += `<div class="${classes.join(' ')}">`;
            html += `<div class="semaine-jour-header">`;
            html += `<span class="semaine-jour-nom">${jours[i]}</span>`;
            html += `<span class="semaine-jour-date">${dateJour.getDate()}/${dateJour.getMonth() + 1}</span>`;
            html += `</div>`;

            html += `<div class="semaine-jour-events">`;
            if (eventsJour.length === 0) {
                html += `<p class="semaine-vide">-</p>`;
            } else {
                eventsJour.forEach(e => {
                    const color = {arret: '#ef4444', tpaa: '#f59e0b', reunion: '#3b82f6', jalon: '#8b5cf6', travaux: '#10b981'}[e.type];
                    html += `<div class="semaine-event" style="background: ${color}20; border-left-color: ${color}">`;
                    html += `<span class="event-icon">${e.icon}</span>`;
                    html += `<span class="event-titre">${e.titre}</span>`;
                    html += `</div>`;
                });
            }
            html += `</div>`;
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    },

    getDebutSemaine(date) {
        const d = new Date(date);
        const jour = d.getDay();
        const diff = d.getDate() - jour + (jour === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    },

    getCalendrierTitre() {
        const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

        if (this.calendrierVue === 'mois') {
            return `${mois[this.calendrierDate.getMonth()]} ${this.calendrierDate.getFullYear()}`;
        } else {
            const debut = this.getDebutSemaine(this.calendrierDate);
            const fin = new Date(debut);
            fin.setDate(debut.getDate() + 6);
            return `${debut.getDate()} - ${fin.getDate()} ${mois[fin.getMonth()]} ${fin.getFullYear()}`;
        }
    },

    formatDateComplete(date) {
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        return date.toLocaleDateString('fr-FR', options);
    },

    formatDateCourte(date) {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    },

    setCalendrierVue(vue) {
        this.calendrierVue = vue;
        App.renderScreen('calendrier');
    },

    calendrierPrecedent() {
        if (this.calendrierVue === 'mois') {
            this.calendrierDate.setMonth(this.calendrierDate.getMonth() - 1);
        } else {
            this.calendrierDate.setDate(this.calendrierDate.getDate() - 7);
        }
        App.renderScreen('calendrier');
    },

    calendrierSuivant() {
        if (this.calendrierVue === 'mois') {
            this.calendrierDate.setMonth(this.calendrierDate.getMonth() + 1);
        } else {
            this.calendrierDate.setDate(this.calendrierDate.getDate() + 7);
        }
        App.renderScreen('calendrier');
    },

    calendrierAujourdhui() {
        this.calendrierDate = new Date();
        App.renderScreen('calendrier');
    },

    voirJour(dateStr) {
        // TODO: Afficher les détails du jour
        console.log('Voir jour:', dateStr);
    },

    // === Notes et Photos du jour ===

    saveNoteJour(note) {
        const today = new Date().toISOString().split('T')[0];
        DataManager.saveNoteJour(today, note);
        App.showToast('Note sauvegardée', 'success');
    },

    addPhotoJour(input) {
        const file = input.files[0];
        if (!file) return;

        // Vérifier la taille (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            App.showToast('Image trop grande (max 2MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Compresser l'image si nécessaire
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedData = canvas.toDataURL('image/jpeg', 0.7);
                const today = new Date().toISOString().split('T')[0];
                DataManager.addPhotoJour(today, compressedData);
                App.showToast('Photo ajoutée', 'success');
                App.renderScreen('calendrier');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    deletePhotoJour(photoId) {
        if (confirm('Supprimer cette photo ?')) {
            const today = new Date().toISOString().split('T')[0];
            DataManager.deletePhotoJour(today, photoId);
            App.showToast('Photo supprimée', 'success');
            App.renderScreen('calendrier');
        }
    },

    viewPhoto(photoId) {
        const today = new Date().toISOString().split('T')[0];
        const noteJour = DataManager.getNoteJour(today);
        const photo = noteJour.photos.find(p => p.id === photoId);
        if (photo) {
            // Afficher en plein écran
            const modal = document.createElement('div');
            modal.className = 'photo-modal';
            modal.innerHTML = `
                <div class="photo-modal-content">
                    <img src="${photo.data}" alt="Photo">
                    <button class="photo-modal-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
            document.body.appendChild(modal);
        }
    }
};
