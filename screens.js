/**
 * Module des écrans - Arrêt Annuel
 * Gère l'affichage des différents écrans de l'application
 */

const Screens = {
    // === DASHBOARD ===
    renderDashboard() {
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
                    <label>Priorité:</label>
                    <select id="filterPriorite" onchange="App.applyFilters()">
                        <option value="">Toutes</option>
                        <option value="Haute">Haute</option>
                        <option value="Normale">Normale</option>
                        <option value="Basse">Basse</option>
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
                                <th>Priorité</th>
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
                    <td><span class="badge ${this.getPrioriteBadge(t.priorite)}">${t.priorite}</span></td>
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
        // Filtrer les travaux du jour (en cours ou prévus pour cette date)
        const travauxJour = travaux.filter(t => {
            const dateDebut = t.execution?.dateDebut?.split('T')[0];
            const dateFin = t.execution?.dateFin?.split('T')[0];
            const datePrevue = t.datePrevue?.split('T')[0];
            const statut = t.execution?.statutExec;

            // Travaux en cours ou prévus pour ce jour
            return statut === 'En cours' ||
                   dateDebut === this.executionDate ||
                   datePrevue === this.executionDate ||
                   (dateDebut && dateFin && dateDebut <= this.executionDate && dateFin >= this.executionDate);
        });

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">📋 Travaux du ${new Date(this.executionDate).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
                    <span class="badge badge-primary">${travauxJour.length} travaux</span>
                </div>
                ${travauxJour.length === 0 ? `
                    <div class="empty-state">
                        <p>Aucun travail prévu ou en cours pour cette date</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th style="width:80px">OT</th>
                                    <th>Description</th>
                                    <th style="width:120px">Équipement</th>
                                    <th style="width:100px">Statut</th>
                                    <th style="width:80px">Heures</th>
                                    <th style="width:100px">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${travauxJour.map(t => `
                                    <tr class="${t.execution?.statutExec === 'Terminé' ? 'row-success' : t.execution?.statutExec === 'Bloqué' ? 'row-danger' : ''}">
                                        <td><strong>${t.ot}</strong></td>
                                        <td>${t.description.substring(0, 50)}${t.description.length > 50 ? '...' : ''}</td>
                                        <td>${t.equipement || '-'}</td>
                                        <td>
                                            <select class="form-control form-control-sm"
                                                    onchange="Screens.updateExecStatut('${t.id}', this.value)">
                                                <option value="Non démarré" ${t.execution?.statutExec === 'Non démarré' ? 'selected' : ''}>Non démarré</option>
                                                <option value="En cours" ${t.execution?.statutExec === 'En cours' ? 'selected' : ''}>En cours</option>
                                                <option value="Terminé" ${t.execution?.statutExec === 'Terminé' ? 'selected' : ''}>Terminé</option>
                                                <option value="Bloqué" ${t.execution?.statutExec === 'Bloqué' ? 'selected' : ''}>Bloqué</option>
                                            </select>
                                        </td>
                                        <td>${t.execution?.heuresReelles || 0}h / ${t.estimationHeures || 0}h</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline" onclick="App.showDetail('${t.id}')">Détail</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
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
        const hasPlan = planConfig.imageData;
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
                                    <img src="${planConfig.imageData}" alt="Plan de l'usine" draggable="false">
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

        // Pour chaque équipement positionné
        Object.entries(positions).forEach(([equip, pos]) => {
            const travauxEquip = travauxActifs.filter(t => t.equipement === equip);

            if (travauxEquip.length === 0) return;

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
                const offset = entreprises.length > 1 ? (idx - (entreprises.length - 1) / 2) * 2.5 : 0;
                const color = this.getEntrepriseColor(ent === 'Interne' ? null : ent);
                const count = parEntreprise[ent].length;

                markers.push(`
                    <div class="plan-marker-live"
                         style="left: calc(${pos.x}% + ${offset}px); top: ${pos.y}%; background: ${color}"
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
        return Object.entries(positions).map(([equip, pos]) => {
            const travaux = parEquipement[equip] || [];
            const total = travaux.length;
            const termines = travaux.filter(t => t.execution?.statutExec === 'Terminé').length;
            const enCours = travaux.filter(t => t.execution?.statutExec === 'En cours').length;

            // Déterminer la couleur du marqueur
            let markerClass = 'pending';
            if (total > 0) {
                if (termines === total) markerClass = 'completed';
                else if (enCours > 0 || termines > 0) markerClass = 'in-progress';
            }

            return `
                <div class="plan-marker-view ${markerClass}"
                     style="left: ${pos.x}%; top: ${pos.y}%"
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
                                ${planConfig.imageData ? `
                                    <img src="${planConfig.imageData}" alt="Plan" class="plan-preview">
                                    <button class="btn btn-sm btn-danger" onclick="Screens.removePlanImage()">Supprimer l'image</button>
                                ` : `
                                    <input type="file" id="planImageInput" accept="image/*" onchange="Screens.handlePlanImageUpload(event)" style="display:none">
                                    <div class="upload-placeholder" onclick="document.getElementById('planImageInput').click()">
                                        <span class="upload-icon">📁</span>
                                        <p>Cliquez pour sélectionner une image</p>
                                        <small>PNG, JPG, GIF (max 5MB)</small>
                                    </div>
                                `}
                            </div>
                        </div>

                        ${planConfig.imageData ? `
                            <div class="plan-config-section">
                                <h4>2. Positionner les équipements</h4>
                                <p class="config-hint">Cliquez sur le plan pour positionner un équipement, puis sélectionnez-le dans la liste.</p>
                                <div class="plan-editor">
                                    <div class="plan-canvas-container" id="planCanvasContainer">
                                        <img src="${planConfig.imageData}" alt="Plan" id="planEditorImage" onclick="Screens.handlePlanClick(event)">
                                        ${this.renderEquipementMarkers(planConfig.positions || {})}
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
    },

    handlePlanImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            App.showToast('Image trop volumineuse (max 5MB)', 'error');
            return;
        }

        // Convertir en base64
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!DataManager.data.processus) DataManager.data.processus = {};
            if (!DataManager.data.processus.planConfig) DataManager.data.processus.planConfig = {};

            DataManager.data.processus.planConfig.imageData = e.target.result;
            DataManager.saveToStorage();

            // Rafraîchir le modal
            this.closePlanConfig();
            this.showConfigPlan();
            App.showToast('Image importée!', 'success');
        };
        reader.readAsDataURL(file);
    },

    removePlanImage() {
        if (confirm('Supprimer l\'image du plan?')) {
            if (DataManager.data.processus?.planConfig) {
                DataManager.data.processus.planConfig.imageData = null;
                DataManager.data.processus.planConfig.positions = {};
                DataManager.saveToStorage();
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
        const container = document.getElementById('planCanvasContainer');
        if (!container) return;

        // Supprimer l'ancien marqueur s'il existe
        const existingMarker = container.querySelector(`[data-equip="${equipement}"]`);
        if (existingMarker) existingMarker.remove();

        // Créer le nouveau marqueur
        const marker = document.createElement('div');
        marker.className = 'plan-marker';
        marker.setAttribute('data-equip', equipement);
        marker.style.left = x + '%';
        marker.style.top = y + '%';
        marker.innerHTML = `<span class="marker-label">${equipement}</span>`;
        marker.onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Supprimer le positionnement de ${equipement}?`)) {
                delete DataManager.data.processus.planConfig.positions[equipement];
                marker.remove();
                document.querySelectorAll('.equip-config-item').forEach(el => {
                    if (el.textContent.includes(equipement)) {
                        el.classList.remove('positioned');
                    }
                });
            }
        };
        container.appendChild(marker);
    },

    renderEquipementMarkers(positions) {
        return Object.entries(positions).map(([equip, pos]) => `
            <div class="plan-marker" data-equip="${equip}" style="left: ${pos.x}%; top: ${pos.y}%"
                 onclick="event.stopPropagation(); Screens.removeEquipPosition('${equip}', this)">
                <span class="marker-label">${equip}</span>
            </div>
        `).join('');
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

        return `
            <div class="journal-screen">
                <div class="journal-header">
                    <h3>📰 Journal de bord - Point de presse</h3>
                    <div class="journal-date-nav">
                        <button class="btn btn-sm btn-outline" onclick="Screens.changeJournalDate(-1)">◀</button>
                        <input type="date" value="${this.journalDate}" onchange="Screens.setJournalDate(this.value)">
                        <button class="btn btn-sm btn-outline" onclick="Screens.changeJournalDate(1)">▶</button>
                    </div>
                </div>

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

                <div class="demandes-grid">
                    <!-- Grues -->
                    <div class="card demande-card">
                        <div class="card-header">
                            <h4>🏗️ Grues</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.addDemande('grues')">+ Ajouter</button>
                        </div>
                        <div class="demandes-list" id="gruesList">
                            ${this.renderDemandesList(demandesJour.grues, 'grues')}
                        </div>
                    </div>

                    <!-- Échafauds -->
                    <div class="card demande-card">
                        <div class="card-header">
                            <h4>🪜 Échafauds</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.addDemande('echafauds')">+ Ajouter</button>
                        </div>
                        <div class="demandes-list" id="echafaudsList">
                            ${this.renderDemandesList(demandesJour.echafauds, 'echafauds')}
                        </div>
                    </div>

                    <!-- Verrouillages -->
                    <div class="card demande-card">
                        <div class="card-header">
                            <h4>🔒 Verrouillages</h4>
                            <button class="btn btn-sm btn-primary" onclick="Screens.addDemande('verrouillages')">+ Ajouter</button>
                        </div>
                        <div class="demandes-list" id="verrouillagesList">
                            ${this.renderDemandesList(demandesJour.verrouillages, 'verrouillages')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderDemandesList(demandes, type) {
        if (!demandes || demandes.length === 0) {
            return `<div class="empty-state small">Aucune demande</div>`;
        }

        return demandes.map((d, i) => `
            <div class="demande-item ${d.statut || ''}">
                <div class="demande-info">
                    <strong>${d.description || 'Sans description'}</strong>
                    <span class="demande-ot">${d.ot ? 'OT: ' + d.ot : ''}</span>
                    <span class="demande-lieu">${d.lieu || ''}</span>
                </div>
                <div class="demande-actions">
                    <select class="form-control form-control-sm" onchange="Screens.updateDemandeStatut('${type}', ${i}, this.value)">
                        <option value="demande" ${d.statut === 'demande' ? 'selected' : ''}>Demandé</option>
                        <option value="approuve" ${d.statut === 'approuve' ? 'selected' : ''}>Approuvé</option>
                        <option value="enplace" ${d.statut === 'enplace' ? 'selected' : ''}>En place</option>
                        <option value="termine" ${d.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                    </select>
                    <button class="btn btn-sm btn-danger" onclick="Screens.removeDemande('${type}', ${i})">✕</button>
                </div>
            </div>
        `).join('');
    },

    addDemande(type) {
        const description = prompt(`Description de la demande (${type}):`);
        if (!description) return;

        const ot = prompt('OT lié (optionnel):') || '';
        const lieu = prompt('Lieu / Localisation:') || '';

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.demandes) DataManager.data.processus.demandes = {};
        if (!DataManager.data.processus.demandes[this.executionDate]) {
            DataManager.data.processus.demandes[this.executionDate] = {grues: [], echafauds: [], verrouillages: []};
        }

        DataManager.data.processus.demandes[this.executionDate][type].push({
            description,
            ot,
            lieu,
            statut: 'demande',
            dateCreation: new Date().toISOString()
        });

        DataManager.saveToStorage();
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
    renderPostMortem() {
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
    }
};
