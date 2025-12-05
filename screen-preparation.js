/**
 * Écran de Préparation - Gestion du Processus d'Arrêt
 * Design simple et user-friendly
 */

const ScreenPreparation = {
    currentEtape: null,
    currentView: 'list', // 'list' ou 'detail'
    expandedPhases: { definir: true, planifier: false, preparer: false },

    render() {
        ProcessusArret.init();

        // Si on est en mode détail, afficher l'écran détail
        if (this.currentView === 'detail' && this.currentEtape) {
            return this.renderDetailScreen();
        }

        // Sinon afficher la liste
        const stats = ProcessusArret.getStatsGlobales();
        const dateArret = DataManager.data.processus?.dateArret;

        return `
            <div class="prep-screen">
                <!-- Barre supérieure -->
                <div class="prep-topbar">
                    <div class="prep-date-section">
                        <div class="date-field">
                            <label>Date début (T-0)</label>
                            <input type="date"
                                   id="dateArretInput"
                                   value="${dateArret ? dateArret.split('T')[0] : ''}"
                                   onchange="ScreenPreparation.setDateArret(this.value)">
                        </div>
                        <div class="date-field">
                            <label>Durée (jours)</label>
                            <input type="number"
                                   id="dureeArretInput"
                                   min="1"
                                   max="60"
                                   value="${DataManager.data.processus?.dureeArret || 14}"
                                   onchange="ScreenPreparation.setDureeArret(this.value)">
                        </div>
                        <div class="date-field">
                            <label>Date fin</label>
                            <input type="date"
                                   id="dateFinInput"
                                   value="${this.getDateFin()}"
                                   readonly
                                   class="readonly">
                        </div>
                        ${dateArret ? `<span class="date-countdown">${this.getCountdown(dateArret)}</span>` : ''}
                    </div>
                    <div class="prep-progress-global">
                        <div class="progress-circle" style="--progress: ${stats.pourcentage}">
                            <span>${stats.pourcentage}%</span>
                        </div>
                        <div class="progress-legend">
                            <span class="legend-done">${stats.terminees} terminées</span>
                            <span class="legend-progress">${stats.enCours} en cours</span>
                            <span class="legend-blocked">${stats.bloquees} bloquées</span>
                        </div>
                    </div>
                </div>

                <!-- Les 3 phases -->
                <div class="prep-phases">
                    ${this.renderPhase('definir')}
                    ${this.renderPhase('planifier')}
                    ${this.renderPhase('preparer')}
                </div>
            </div>
        `;
    },

    renderPhase(phaseId) {
        const phase = ProcessusArret.structure[phaseId];
        const stats = ProcessusArret.getStatsPhase(phaseId);
        const isExpanded = this.expandedPhases[phaseId];

        const colors = {
            definir: '#3b82f6',
            planifier: '#8b5cf6',
            preparer: '#ec4899'
        };

        return `
            <div class="prep-phase ${isExpanded ? 'expanded' : ''}" data-phase="${phaseId}">
                <div class="phase-head" onclick="ScreenPreparation.togglePhase('${phaseId}')" style="--color: ${colors[phaseId]}">
                    <div class="phase-left">
                        <span class="phase-icon">${phase.icone}</span>
                        <div class="phase-info">
                            <h3>${phase.nom}</h3>
                            <span class="phase-timing">${phase.periode}</span>
                        </div>
                    </div>
                    <div class="phase-right">
                        <div class="phase-bar">
                            <div class="phase-bar-fill" style="width: ${stats.pourcentage}%; background: ${colors[phaseId]}"></div>
                        </div>
                        <span class="phase-ratio">${stats.terminees}/${stats.total}</span>
                        <span class="phase-arrow">${isExpanded ? '▲' : '▼'}</span>
                    </div>
                </div>

                <div class="phase-body">
                    <table class="etapes-table">
                        <thead>
                            <tr>
                                <th style="width: 70px">Code</th>
                                <th>Étape</th>
                                <th style="width: 110px">Statut</th>
                                <th style="width: 60px">%</th>
                                <th style="width: 150px">Responsable</th>
                                <th style="width: 80px">Travaux</th>
                                <th>Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${phase.etapes.map(etape => this.renderEtapeRow(etape, colors[phaseId])).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    renderEtapeRow(etape, color) {
        const etat = ProcessusArret.getEtatEtape(etape.id);
        const statut = etat?.statut || 'non_demarre';
        const pourcentage = etat?.pourcentage || 0;
        const travauxCount = etat?.travauxLies?.length || 0;

        const statutLabels = {
            'non_demarre': 'À faire',
            'en_cours': 'En cours',
            'termine': 'Terminé',
            'bloque': 'Bloqué'
        };

        const statutColors = {
            'non_demarre': '#94a3b8',
            'en_cours': '#f59e0b',
            'termine': '#22c55e',
            'bloque': '#ef4444'
        };

        return `
            <tr class="etape-row ${statut}" onclick="ScreenPreparation.openEtape('${etape.id}')">
                <td>
                    <span class="etape-code" style="border-left: 3px solid ${color}">${etape.id}</span>
                </td>
                <td>
                    <div class="etape-name">
                        ${etape.nom}
                        ${etape.jalon ? '<span class="tag tag-jalon">Jalon</span>' : ''}
                        ${etape.critical ? '<span class="tag tag-critical">!</span>' : ''}
                    </div>
                </td>
                <td>
                    <select class="status-select"
                            style="--status-color: ${statutColors[statut]}"
                            onclick="event.stopPropagation()"
                            onchange="ScreenPreparation.changeStatut('${etape.id}', this.value)">
                        <option value="non_demarre" ${statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                        <option value="en_cours" ${statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                        <option value="termine" ${statut === 'termine' ? 'selected' : ''}>Terminé</option>
                        <option value="bloque" ${statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                    </select>
                </td>
                <td>
                    <div class="mini-progress">
                        <div class="mini-bar">
                            <div class="mini-fill" style="width: ${pourcentage}%"></div>
                        </div>
                        <span>${pourcentage}%</span>
                    </div>
                </td>
                <td>
                    <input type="text"
                           class="responsable-input"
                           placeholder="..."
                           value="${etat?.responsable || ''}"
                           onclick="event.stopPropagation()"
                           onchange="ScreenPreparation.saveResponsableRapide('${etape.id}', this.value)">
                </td>
                <td>
                    ${travauxCount > 0 ? `<span class="travaux-badge">${travauxCount} OT</span>` : '<span class="no-travaux">-</span>'}
                </td>
                <td>
                    <input type="text"
                           class="comment-input"
                           placeholder="..."
                           value="${etat?.commentaireRapide || ''}"
                           onclick="event.stopPropagation()"
                           onchange="ScreenPreparation.saveCommentRapide('${etape.id}', this.value)">
                </td>
            </tr>
        `;
    },

    togglePhase(phaseId) {
        this.expandedPhases[phaseId] = !this.expandedPhases[phaseId];
        const phaseEl = document.querySelector(`.prep-phase[data-phase="${phaseId}"]`);
        if (phaseEl) {
            phaseEl.classList.toggle('expanded', this.expandedPhases[phaseId]);
            phaseEl.querySelector('.phase-arrow').textContent = this.expandedPhases[phaseId] ? '▲' : '▼';
        }
    },

    changeStatut(etapeId, statut) {
        ProcessusArret.updateStatut(etapeId, statut);

        // Mettre à jour la ligne visuellement
        const row = document.querySelector(`tr.etape-row[onclick*="${etapeId}"]`);
        if (row) {
            row.className = `etape-row ${statut}`;
        }

        // Mettre à jour les stats de la phase
        this.updatePhaseStats();
        App.showToast('Statut mis à jour', 'success');
    },

    updatePhaseStats() {
        ['definir', 'planifier', 'preparer'].forEach(phaseId => {
            const stats = ProcessusArret.getStatsPhase(phaseId);
            const phaseEl = document.querySelector(`.prep-phase[data-phase="${phaseId}"]`);
            if (phaseEl) {
                phaseEl.querySelector('.phase-bar-fill').style.width = `${stats.pourcentage}%`;
                phaseEl.querySelector('.phase-ratio').textContent = `${stats.terminees}/${stats.total}`;
            }
        });

        // Mettre à jour la progression globale
        const statsGlobal = ProcessusArret.getStatsGlobales();
        const circle = document.querySelector('.progress-circle');
        if (circle) {
            circle.style.setProperty('--progress', statsGlobal.pourcentage);
            circle.querySelector('span').textContent = `${statsGlobal.pourcentage}%`;
        }

        const legend = document.querySelector('.progress-legend');
        if (legend) {
            legend.querySelector('.legend-done').textContent = `${statsGlobal.terminees} terminées`;
            legend.querySelector('.legend-progress').textContent = `${statsGlobal.enCours} en cours`;
            legend.querySelector('.legend-blocked').textContent = `${statsGlobal.bloquees} bloquées`;
        }
    },

    openEtape(etapeId) {
        this.currentEtape = etapeId;
        this.currentView = 'detail';
        this.refresh();
    },

    backToList() {
        this.currentView = 'list';
        this.currentEtape = null;
        this.refresh();
    },

    renderDetailScreen() {
        const etapeId = this.currentEtape;

        // Écrans spécifiques par étape
        if (etapeId === 'D1.0') {
            return this.renderDetailDefinitionArret();
        }
        if (etapeId === 'D2.0') {
            return this.renderDetailPlansEntretien();
        }
        if (etapeId === 'D3.0') {
            return this.renderDetailEquipeGestion();
        }
        if (etapeId === 'D4.0') {
            return this.renderDetailCreationDA();
        }
        if (etapeId === 'D5.0') {
            return this.renderDetailStrategieApprovisionnement();
        }

        // Écrans Planifier
        if (etapeId === 'PL1.0') {
            return this.renderDetailProjetsCapitalisation();
        }
        if (etapeId === 'PL2.0') {
            return this.renderDetailScopeSecteurs();
        }
        if (etapeId === 'PL3.0') {
            return this.renderDetailTPAA();
        }
        if (etapeId === 'PL4.0') {
            return this.renderDetailServiceIncendie();
        }
        if (etapeId === 'PL5.0') {
            return this.renderDetailVPO();
        }
        if (etapeId === 'PL6.0') {
            return this.renderDetailPSV();
        }
        if (etapeId === 'PL7.0') {
            return this.renderDetailCommandeMateriel();
        }
        if (etapeId === 'PL8.0') {
            return this.renderDetailAvisPriorises();
        }
        if (etapeId === 'PL9.0') {
            return this.renderDetailTravauxEntrepreneur();
        }
        if (etapeId === 'PL10.0') {
            return this.renderDetailVerrouillage();
        }
        if (etapeId === 'PL11.0') {
            return this.renderDetailEquipementLevage();
        }
        if (etapeId === 'PL12.0') {
            return this.renderDetailEspaceClos();
        }
        if (etapeId === 'PL17.0') {
            return this.renderDetailPlanAmenagement();
        }

        // Trouver l'étape et la phase
        let etape = null, phase = null, phaseId = null;
        for (const [id, p] of Object.entries(ProcessusArret.structure)) {
            const found = p.etapes.find(e => e.id === etapeId);
            if (found) { etape = found; phase = p; phaseId = id; break; }
        }
        if (!etape) return '<p>Étape non trouvée</p>';

        const etat = ProcessusArret.getEtatEtape(etapeId);
        const travauxLies = ProcessusArret.getTravauxLies(etapeId);

        const colors = { definir: '#3b82f6', planifier: '#8b5cf6', preparer: '#ec4899' };
        const color = colors[phaseId] || '#3b82f6';

        const statutLabels = {
            'non_demarre': 'À faire',
            'en_cours': 'En cours',
            'termine': 'Terminé',
            'bloque': 'Bloqué'
        };

        return `
            <div class="detail-screen">
                <!-- Header avec retour -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: ${color}">${phase.nom}</span>
                        <h2>${etape.id} - ${etape.nom}</h2>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="detail-body">
                    <!-- Colonne gauche: Infos -->
                    <div class="detail-main">
                        <div class="detail-card">
                            <h3>Description</h3>
                            <p class="detail-desc">${etape.description}</p>
                        </div>

                        <div class="detail-card">
                            <h3>Statut & Avancement</h3>
                            <div class="detail-form-grid">
                                <div class="form-group">
                                    <label>Statut</label>
                                    <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                        <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                        <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                        <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                        <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                    <input type="range" id="detailPourcentage" class="form-control-range"
                                           min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                           oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                           onchange="ScreenPreparation.savePourcentageDetail()">
                                </div>
                                <div class="form-group">
                                    <label>Responsable</label>
                                    <input type="text" id="detailResponsable" class="form-control"
                                           value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                           onchange="ScreenPreparation.saveResponsableDetail()">
                                </div>
                                <div class="form-group">
                                    <label>Date prévue</label>
                                    <input type="date" id="detailDate" class="form-control"
                                           value="${etat?.datePrevue?.split('T')[0] || ''}"
                                           onchange="ScreenPreparation.saveDateDetail()">
                                </div>
                            </div>
                        </div>

                        <div class="detail-card">
                            <h3>Informations</h3>
                            <div class="info-list">
                                <div class="info-row">
                                    <span class="info-label">Durée estimée</span>
                                    <span class="info-value">${etape.dureeEstimee} jours</span>
                                </div>
                                ${etape.jalon ? '<div class="info-row"><span class="info-label">Type</span><span class="info-value tag tag-jalon">Jalon</span></div>' : ''}
                                ${etape.critical ? '<div class="info-row"><span class="info-label">Priorité</span><span class="info-value tag tag-critical">Critique</span></div>' : ''}
                                ${etape.dependances?.length > 0 ? `
                                    <div class="info-row">
                                        <span class="info-label">Dépend de</span>
                                        <span class="info-value">${etape.dependances.join(', ')}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Notes / Commentaires -->
                        <div class="detail-card">
                            <h3>Notes</h3>
                            <div class="notes-container">
                                ${(etat?.commentaires || []).length === 0 ? '<p class="empty-msg">Aucune note</p>' : ''}
                                ${(etat?.commentaires || []).map(c => `
                                    <div class="note-item">
                                        <div class="note-meta">
                                            <span class="note-author">${c.auteur}</span>
                                            <span class="note-date">${new Date(c.date).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <p class="note-text">${c.texte}</p>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="note-add">
                                <textarea id="newNoteDetail" class="form-control" placeholder="Ajouter une note..."></textarea>
                                <button class="btn btn-primary" onclick="ScreenPreparation.addNoteDetail()">Ajouter</button>
                            </div>
                        </div>
                    </div>

                    <!-- Colonne droite: Travaux liés -->
                    <div class="detail-sidebar">
                        <div class="detail-card">
                            <div class="card-header-flex">
                                <h3>Travaux liés (${travauxLies.length})</h3>
                                <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.showAddTravaux('${etapeId}')">+ Ajouter</button>
                            </div>

                            ${travauxLies.length === 0 ? `
                                <p class="empty-msg">Aucun travail lié</p>
                            ` : `
                                <div class="travaux-list-detail">
                                    ${travauxLies.map(t => `
                                        <div class="travail-item-detail">
                                            <div class="travail-info-detail">
                                                <span class="travail-ot">${t.ot}</span>
                                                <span class="travail-desc">${t.description}</span>
                                            </div>
                                            <div class="travail-actions">
                                                <button class="btn-icon" onclick="App.showDetail('${t.id}')" title="Voir">👁</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.unlinkTravail('${etapeId}', '${t.id}')" title="Retirer">✕</button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderTabInfo(etape, etat, phase) {
        return `
            <div class="tab-info">
                <p class="etape-desc">${etape.description}</p>

                <div class="info-grid">
                    <div class="info-box">
                        <label>Statut</label>
                        <select id="modalStatut" class="form-control" onchange="ScreenPreparation.saveStatut('${etape.id}')">
                            <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                            <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                            <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                            <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                        </select>
                    </div>
                    <div class="info-box">
                        <label>Avancement</label>
                        <div class="range-group">
                            <input type="range" id="modalPourcentage" min="0" max="100" step="10"
                                   value="${etat?.pourcentage || 0}"
                                   onchange="ScreenPreparation.savePourcentage('${etape.id}')">
                            <span id="pourcentageLabel">${etat?.pourcentage || 0}%</span>
                        </div>
                    </div>
                    <div class="info-box">
                        <label>Responsable</label>
                        <input type="text" id="modalResponsable" class="form-control"
                               value="${etat?.responsable || ''}"
                               placeholder="Nom..."
                               onchange="ScreenPreparation.saveResponsable('${etape.id}')">
                    </div>
                    <div class="info-box">
                        <label>Date prévue</label>
                        <input type="date" id="modalDate" class="form-control"
                               value="${etat?.datePrevue?.split('T')[0] || ''}"
                               onchange="ScreenPreparation.saveDate('${etape.id}')">
                    </div>
                </div>

                <div class="info-extra">
                    <p><strong>Durée estimée:</strong> ${etape.dureeEstimee} jours</p>
                    ${etape.dependances?.length > 0 ? `
                        <p><strong>Dépend de:</strong> ${etape.dependances.join(', ')}</p>
                    ` : ''}
                </div>
            </div>
        `;
    },

    renderTabTravaux(etapeId) {
        const travauxLies = ProcessusArret.getTravauxLies(etapeId);
        const allTravaux = DataManager.getTravaux();

        return `
            <div class="tab-travaux">
                <div class="travaux-header">
                    <button class="btn btn-primary btn-sm" onclick="ScreenPreparation.showAddTravaux('${etapeId}')">
                        + Lier des travaux
                    </button>
                </div>

                ${travauxLies.length === 0 ? `
                    <p class="empty-msg">Aucun travail lié à cette étape</p>
                ` : `
                    <div class="travaux-list">
                        ${travauxLies.map(t => `
                            <div class="travail-card">
                                <div class="travail-main">
                                    <span class="travail-ot">${t.ot}</span>
                                    <span class="travail-desc">${t.description}</span>
                                </div>
                                <div class="travail-actions">
                                    <button class="btn-icon" onclick="App.showDetail('${t.id}')" title="Voir détail">👁</button>
                                    <button class="btn-icon danger" onclick="ScreenPreparation.unlinkTravail('${etapeId}', '${t.id}')" title="Délier">✕</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    },

    renderTabNotes(etapeId) {
        const etat = ProcessusArret.getEtatEtape(etapeId);
        const commentaires = etat?.commentaires || [];

        return `
            <div class="tab-notes">
                <div class="notes-list">
                    ${commentaires.length === 0 ? '<p class="empty-msg">Aucune note</p>' : ''}
                    ${commentaires.map(c => `
                        <div class="note-item">
                            <div class="note-meta">
                                <span class="note-author">${c.auteur}</span>
                                <span class="note-date">${new Date(c.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <p class="note-text">${c.texte}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="note-add">
                    <textarea id="newNote" class="form-control" placeholder="Ajouter une note..."></textarea>
                    <button class="btn btn-primary" onclick="ScreenPreparation.addNote('${etapeId}')">Ajouter</button>
                </div>
            </div>
        `;
    },

    switchTab(tab) {
        document.querySelectorAll('.etape-modal-nav .nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        const content = document.getElementById('etapeTabContent');
        const etapeId = this.currentEtape;

        // Trouver l'étape
        let etape = null, phase = null;
        for (const [id, p] of Object.entries(ProcessusArret.structure)) {
            const found = p.etapes.find(e => e.id === etapeId);
            if (found) { etape = found; phase = p; break; }
        }
        const etat = ProcessusArret.getEtatEtape(etapeId);

        switch(tab) {
            case 'info':
                content.innerHTML = this.renderTabInfo(etape, etat, phase);
                break;
            case 'travaux':
                content.innerHTML = this.renderTabTravaux(etapeId);
                break;
            case 'notes':
                content.innerHTML = this.renderTabNotes(etapeId);
                break;
        }
    },

    // === ACTIONS DE SAUVEGARDE ===

    setDateArret(value) {
        ProcessusArret.setDateArret(value);
        // Mettre à jour la date de fin
        const dateFinInput = document.getElementById('dateFinInput');
        if (dateFinInput) {
            dateFinInput.value = this.getDateFin();
        }
        App.showToast('Date d\'arrêt enregistrée', 'success');
    },

    saveStatut(etapeId) {
        const value = document.getElementById('modalStatut').value;
        ProcessusArret.updateStatut(etapeId, value);
        this.updatePhaseStats();
        App.showToast('Statut enregistré', 'success');
    },

    savePourcentage(etapeId) {
        const value = parseInt(document.getElementById('modalPourcentage').value);
        document.getElementById('pourcentageLabel').textContent = value + '%';
        ProcessusArret.updateEtatEtape(etapeId, { pourcentage: value });
    },

    saveResponsable(etapeId) {
        const value = document.getElementById('modalResponsable').value;
        ProcessusArret.updateEtatEtape(etapeId, { responsable: value });
    },

    saveDate(etapeId) {
        const value = document.getElementById('modalDate').value;
        ProcessusArret.updateEtatEtape(etapeId, { datePrevue: value });
    },

    saveCommentRapide(etapeId, value) {
        ProcessusArret.updateEtatEtape(etapeId, { commentaireRapide: value });
    },

    saveResponsableRapide(etapeId, value) {
        ProcessusArret.updateEtatEtape(etapeId, { responsable: value });
    },

    // Fonctions de sauvegarde pour l'écran détail
    saveStatutDetail() {
        const value = document.getElementById('detailStatut').value;
        ProcessusArret.updateStatut(this.currentEtape, value);
        App.showToast('Statut enregistré', 'success');
    },

    savePourcentageDetail() {
        const value = parseInt(document.getElementById('detailPourcentage').value);
        ProcessusArret.updateEtatEtape(this.currentEtape, { pourcentage: value });
    },

    saveResponsableDetail() {
        const value = document.getElementById('detailResponsable').value;
        ProcessusArret.updateEtatEtape(this.currentEtape, { responsable: value });
    },

    saveDateDetail() {
        const value = document.getElementById('detailDate').value;
        ProcessusArret.updateEtatEtape(this.currentEtape, { datePrevue: value });
    },

    addNoteDetail() {
        const textarea = document.getElementById('newNoteDetail');
        const texte = textarea.value.trim();
        if (!texte) {
            App.showToast('Écrivez une note d\'abord', 'warning');
            return;
        }
        ProcessusArret.addCommentaire(this.currentEtape, texte);
        textarea.value = '';
        this.refresh();
        App.showToast('Note ajoutée', 'success');
    },

    addNote(etapeId) {
        const textarea = document.getElementById('newNote');
        const texte = textarea.value.trim();
        if (!texte) {
            App.showToast('Écrivez une note d\'abord', 'warning');
            return;
        }
        ProcessusArret.addCommentaire(etapeId, texte);
        textarea.value = '';
        this.switchTab('notes');
        App.showToast('Note ajoutée', 'success');
    },

    showAddTravaux(etapeId) {
        const allTravaux = DataManager.getTravaux();
        const etat = ProcessusArret.getEtatEtape(etapeId);
        const dejaLies = etat?.travauxLies || [];

        const html = `
            <div class="overlay-modal" id="addTravauxModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>Lier des travaux</h3>
                        <button class="close-btn" onclick="document.getElementById('addTravauxModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <input type="text" class="form-control" placeholder="Rechercher..."
                               oninput="ScreenPreparation.filterTravaux(this.value)">
                        <div class="travaux-checkboxes" id="travauxCheckboxes">
                            ${allTravaux.map(t => `
                                <label class="checkbox-item ${dejaLies.includes(t.id) ? 'disabled' : ''}">
                                    <input type="checkbox" value="${t.id}" ${dejaLies.includes(t.id) ? 'checked disabled' : ''}>
                                    <span>${t.ot} - ${t.description.substring(0, 40)}${t.description.length > 40 ? '...' : ''}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('addTravauxModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.confirmLinkTravaux('${etapeId}')">Confirmer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    filterTravaux(search) {
        const lower = search.toLowerCase();
        document.querySelectorAll('#travauxCheckboxes .checkbox-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lower) ? '' : 'none';
        });
    },

    confirmLinkTravaux(etapeId) {
        const checked = document.querySelectorAll('#travauxCheckboxes input:checked:not(:disabled)');
        const ids = Array.from(checked).map(cb => cb.value);

        if (ids.length > 0) {
            ProcessusArret.lierTravaux(etapeId, ids);
            App.showToast(`${ids.length} travaux liés`, 'success');
        }

        document.getElementById('addTravauxModal').remove();
        this.switchTab('travaux');
    },

    unlinkTravail(etapeId, travailId) {
        const etat = ProcessusArret.getEtatEtape(etapeId);
        if (etat) {
            etat.travauxLies = etat.travauxLies.filter(id => id !== travailId);
            DataManager.saveToStorage();
            this.switchTab('travaux');
            App.showToast('Travail délié', 'success');
        }
    },

    refresh() {
        document.getElementById('contentArea').innerHTML = this.render();
    },

    getCountdown(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        if (diff > 0) return `J-${diff}`;
        if (diff < 0) return `J+${Math.abs(diff)}`;
        return 'JOUR J';
    },

    setDureeArret(value) {
        const duree = parseInt(value) || 14;
        if (!DataManager.data.processus) {
            DataManager.data.processus = {};
        }
        DataManager.data.processus.dureeArret = duree;
        DataManager.saveToStorage();

        // Mettre à jour la date de fin affichée
        document.getElementById('dateFinInput').value = this.getDateFin();
        App.showToast('Durée enregistrée', 'success');
    },

    getDateFin() {
        const dateArret = DataManager.data.processus?.dateArret;
        const duree = DataManager.data.processus?.dureeArret || 14;

        if (!dateArret) return '';

        const debut = new Date(dateArret);
        const fin = new Date(debut);
        fin.setDate(fin.getDate() + duree);

        return fin.toISOString().split('T')[0];
    },

    // ==========================================
    // ÉCRAN SPÉCIFIQUE: D1.0 - Définition de l'arrêt
    // ==========================================

    renderDetailDefinitionArret() {
        const etape = ProcessusArret.structure.definir.etapes.find(e => e.id === 'D1.0');
        const etat = ProcessusArret.getEtatEtape('D1.0');
        const definitionData = DataManager.data.processus?.definitionArret || {};
        const reunionData = definitionData.reunion || {};
        const ressources = definitionData.ressources || [];

        const dateArret = DataManager.data.processus?.dateArret || '';
        const dureeArret = DataManager.data.processus?.dureeArret || 14;
        const budgetArret = definitionData.budget || '';
        const cheminDossier = definitionData.cheminDossier || '';

        return `
            <div class="detail-screen definition-arret-screen">
                <!-- Header avec retour -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: #3b82f6">Définir</span>
                        <h2>D1.0 - Définition de l'arrêt</h2>
                    </div>
                </div>

                <!-- Contenu principal -->
                <div class="detail-body definition-body">
                    <!-- Section 1: Informations générales de l'arrêt -->
                    <div class="detail-card definition-card">
                        <h3>📅 Informations de l'arrêt</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Date de début (T-0)</label>
                                <input type="date"
                                       id="defDateDebut"
                                       class="form-control"
                                       value="${dateArret ? dateArret.split('T')[0] : ''}"
                                       onchange="ScreenPreparation.saveDefinitionArret('dateDebut', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Durée (jours)</label>
                                <input type="number"
                                       id="defDuree"
                                       class="form-control"
                                       min="1" max="60"
                                       value="${dureeArret}"
                                       onchange="ScreenPreparation.saveDefinitionArret('duree', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Date de fin</label>
                                <input type="date"
                                       id="defDateFin"
                                       class="form-control readonly"
                                       value="${this.getDateFin()}"
                                       readonly>
                            </div>
                            <div class="form-group">
                                <label>Budget de l'arrêt ($)</label>
                                <input type="number"
                                       id="defBudget"
                                       class="form-control"
                                       min="0" step="1000"
                                       placeholder="Ex: 500000"
                                       value="${budgetArret}"
                                       onchange="ScreenPreparation.saveDefinitionArret('budget', this.value)">
                            </div>
                        </div>

                        <!-- Chemin dossier réseau -->
                        <div class="dossier-reseau-section">
                            <div class="form-group">
                                <label>📁 Chemin du dossier sur le réseau</label>
                                <div class="dossier-input-group">
                                    <input type="text"
                                           id="defCheminDossier"
                                           class="form-control"
                                           placeholder="Ex: \\\\serveur\\partage\\ArretAnnuel2025"
                                           value="${cheminDossier}"
                                           onchange="ScreenPreparation.saveDefinitionArret('cheminDossier', this.value)">
                                    ${cheminDossier ? `
                                        <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.copyCheminDossier()" title="Copier le chemin">
                                            📋
                                        </button>
                                    ` : ''}
                                </div>
                                ${cheminDossier ? `
                                    <p class="chemin-hint">💡 Cliquez sur 📋 pour copier le chemin dans le presse-papier</p>
                                ` : `
                                    <p class="chemin-hint">Indiquez le chemin UNC du dossier partagé (ex: \\\\serveur\\partage\\dossier)</p>
                                `}
                            </div>
                        </div>

                        ${dateArret ? `
                            <div class="countdown-banner">
                                <span class="countdown-label">Compte à rebours:</span>
                                <span class="countdown-value">${this.getCountdown(dateArret)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Section 2: Compte rendu de réunion -->
                    <div class="detail-card definition-card">
                        <h3>📝 Compte rendu de réunion de définition</h3>
                        <div class="reunion-form">
                            <div class="reunion-header-fields">
                                <div class="form-group">
                                    <label>Date de la réunion</label>
                                    <input type="date"
                                           id="reunionDate"
                                           class="form-control"
                                           value="${reunionData.date || ''}"
                                           onchange="ScreenPreparation.saveReunionDefinition('date', this.value)">
                                </div>
                                <div class="form-group form-group-wide">
                                    <label>Objet de la réunion</label>
                                    <input type="text"
                                           id="reunionObjet"
                                           class="form-control"
                                           placeholder="Ex: Réunion de lancement arrêt annuel 2025"
                                           value="${reunionData.objet || ''}"
                                           onchange="ScreenPreparation.saveReunionDefinition('objet', this.value)">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Participants</label>
                                <input type="text"
                                       id="reunionParticipants"
                                       class="form-control"
                                       placeholder="Ex: Jean Dupont, Marie Martin, Pierre Durand"
                                       value="${reunionData.participants || ''}"
                                       onchange="ScreenPreparation.saveReunionDefinition('participants', this.value)">
                            </div>
                            <div class="form-group">
                                <label>Compte rendu / Commentaires</label>
                                <textarea id="reunionCommentaire"
                                          class="form-control textarea-large"
                                          placeholder="Points discutés, décisions prises, actions à suivre..."
                                          onchange="ScreenPreparation.saveReunionDefinition('commentaire', this.value)">${reunionData.commentaire || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Section 3: Ressources de planification -->
                    <div class="detail-card definition-card">
                        <h3>👥 Ressources de planification</h3>
                        <p class="section-desc">Définir les ressources qui seront impliquées dans la planification de l'arrêt</p>

                        <div class="ressources-list" id="ressourcesList">
                            ${ressources.length === 0 ? `
                                <p class="empty-msg">Aucune ressource définie</p>
                            ` : ressources.map((r, index) => `
                                <div class="ressource-item" data-index="${index}">
                                    <div class="ressource-info">
                                        <span class="ressource-nom">${r.nom}</span>
                                        <span class="ressource-role">${r.role}</span>
                                        ${r.departement ? `<span class="ressource-dept">${r.departement}</span>` : ''}
                                    </div>
                                    <div class="ressource-contact">
                                        ${r.email ? `<span class="ressource-email">📧 ${r.email}</span>` : ''}
                                        ${r.telephone ? `<span class="ressource-tel">📞 ${r.telephone}</span>` : ''}
                                    </div>
                                    <button class="btn-icon danger" onclick="ScreenPreparation.removeRessource(${index})" title="Supprimer">✕</button>
                                </div>
                            `).join('')}
                        </div>

                        <div class="ressource-add-form" id="ressourceAddForm">
                            <h4>Ajouter une ressource</h4>
                            <div class="ressource-form-grid">
                                <div class="form-group">
                                    <label>Nom *</label>
                                    <input type="text" id="newRessourceNom" class="form-control" placeholder="Nom complet">
                                </div>
                                <div class="form-group">
                                    <label>Rôle *</label>
                                    <select id="newRessourceRole" class="form-control">
                                        <option value="">Sélectionner...</option>
                                        <option value="Coordonnateur d'arrêt">Coordonnateur d'arrêt</option>
                                        <option value="Planificateur">Planificateur</option>
                                        <option value="Superviseur mécanique">Superviseur mécanique</option>
                                        <option value="Superviseur électrique">Superviseur électrique</option>
                                        <option value="Superviseur instrumentation">Superviseur instrumentation</option>
                                        <option value="Responsable SST">Responsable SST</option>
                                        <option value="Responsable approvisionnement">Responsable approvisionnement</option>
                                        <option value="Responsable contrats">Responsable contrats</option>
                                        <option value="Ingénieur de fiabilité">Ingénieur de fiabilité</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Département</label>
                                    <input type="text" id="newRessourceDept" class="form-control" placeholder="Ex: Maintenance">
                                </div>
                                <div class="form-group">
                                    <label>Email</label>
                                    <input type="email" id="newRessourceEmail" class="form-control" placeholder="email@exemple.com">
                                </div>
                                <div class="form-group">
                                    <label>Téléphone</label>
                                    <input type="tel" id="newRessourceTel" class="form-control" placeholder="Ex: 514-555-1234">
                                </div>
                            </div>
                            <button class="btn btn-primary" onclick="ScreenPreparation.addRessource()">
                                + Ajouter la ressource
                            </button>
                        </div>
                    </div>

                    <!-- Section Statut (comme les autres étapes) -->
                    <div class="detail-card definition-card">
                        <h3>📊 Statut de l'étape</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                    <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                    <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                    <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                <input type="range" id="detailPourcentage" class="form-control-range"
                                       min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                       oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                       onchange="ScreenPreparation.savePourcentageDetail()">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="detailResponsable" class="form-control"
                                       value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                       onchange="ScreenPreparation.saveResponsableDetail()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Sauvegarder les infos de définition de l'arrêt
    saveDefinitionArret(field, value) {
        if (!DataManager.data.processus) {
            DataManager.data.processus = {};
        }
        if (!DataManager.data.processus.definitionArret) {
            DataManager.data.processus.definitionArret = {};
        }

        switch(field) {
            case 'dateDebut':
                DataManager.data.processus.dateArret = value;
                // Mettre à jour la date de fin
                document.getElementById('defDateFin').value = this.getDateFin();
                break;
            case 'duree':
                DataManager.data.processus.dureeArret = parseInt(value) || 14;
                document.getElementById('defDateFin').value = this.getDateFin();
                break;
            case 'budget':
                DataManager.data.processus.definitionArret.budget = value;
                break;
            case 'cheminDossier':
                DataManager.data.processus.definitionArret.cheminDossier = value;
                this.refresh(); // Rafraîchir pour afficher le bouton copier
                break;
        }

        DataManager.saveToStorage();
        App.showToast('Information enregistrée', 'success');
    },

    // Copier le chemin du dossier dans le presse-papier
    copyCheminDossier() {
        const chemin = DataManager.data.processus?.definitionArret?.cheminDossier;
        if (chemin) {
            navigator.clipboard.writeText(chemin).then(() => {
                App.showToast('Chemin copié dans le presse-papier', 'success');
            }).catch(() => {
                // Fallback pour les navigateurs plus anciens
                const input = document.getElementById('defCheminDossier');
                input.select();
                document.execCommand('copy');
                App.showToast('Chemin copié', 'success');
            });
        }
    },

    // Sauvegarder les infos de réunion
    saveReunionDefinition(field, value) {
        if (!DataManager.data.processus) {
            DataManager.data.processus = {};
        }
        if (!DataManager.data.processus.definitionArret) {
            DataManager.data.processus.definitionArret = {};
        }
        if (!DataManager.data.processus.definitionArret.reunion) {
            DataManager.data.processus.definitionArret.reunion = {};
        }

        DataManager.data.processus.definitionArret.reunion[field] = value;
        DataManager.saveToStorage();
        App.showToast('Réunion mise à jour', 'success');
    },

    // Ajouter une ressource
    addRessource() {
        const nom = document.getElementById('newRessourceNom').value.trim();
        const role = document.getElementById('newRessourceRole').value;
        const departement = document.getElementById('newRessourceDept').value.trim();
        const email = document.getElementById('newRessourceEmail').value.trim();
        const telephone = document.getElementById('newRessourceTel').value.trim();

        if (!nom || !role) {
            App.showToast('Veuillez remplir le nom et le rôle', 'warning');
            return;
        }

        if (!DataManager.data.processus) {
            DataManager.data.processus = {};
        }
        if (!DataManager.data.processus.definitionArret) {
            DataManager.data.processus.definitionArret = {};
        }
        if (!DataManager.data.processus.definitionArret.ressources) {
            DataManager.data.processus.definitionArret.ressources = [];
        }

        DataManager.data.processus.definitionArret.ressources.push({
            nom,
            role,
            departement,
            email,
            telephone,
            dateAjout: new Date().toISOString()
        });

        DataManager.saveToStorage();
        App.showToast('Ressource ajoutée', 'success');
        this.refresh();
    },

    // Supprimer une ressource
    removeRessource(index) {
        if (DataManager.data.processus?.definitionArret?.ressources) {
            DataManager.data.processus.definitionArret.ressources.splice(index, 1);
            DataManager.saveToStorage();
            App.showToast('Ressource supprimée', 'success');
            this.refresh();
        }
    },

    // ==========================================
    // ÉCRAN SPÉCIFIQUE: D2.0 - Plans d'entretien à long délais
    // ==========================================

    plansEntretienImport: {
        currentFile: null,
        currentData: null,
        currentHeaders: [],
        currentMapping: null,
        step: 1
    },

    renderDetailPlansEntretien() {
        const etat = ProcessusArret.getEtatEtape('D2.0');
        const plansData = DataManager.data.processus?.plansEntretien || {};
        const plans = plansData.items || [];
        const importStep = this.plansEntretienImport.step;

        return `
            <div class="detail-screen plans-entretien-screen">
                <!-- Header -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: #3b82f6">Définir</span>
                        <h2>D2.0 - Validation des plans d'entretiens à long délais</h2>
                    </div>
                </div>

                <div class="detail-body plans-body">
                    <!-- Section Import -->
                    <div class="detail-card plans-card">
                        <h3>📥 Import des plans d'entretien</h3>

                        <div class="import-steps-mini">
                            <div class="step-mini ${importStep >= 1 ? 'active' : ''} ${importStep > 1 ? 'completed' : ''}">
                                <span class="step-num">1</span>
                                <span>Fichier</span>
                            </div>
                            <div class="step-mini ${importStep >= 2 ? 'active' : ''} ${importStep > 2 ? 'completed' : ''}">
                                <span class="step-num">2</span>
                                <span>Mapping</span>
                            </div>
                            <div class="step-mini ${importStep >= 3 ? 'active' : ''} ${importStep > 3 ? 'completed' : ''}">
                                <span class="step-num">3</span>
                                <span>Confirmer</span>
                            </div>
                        </div>

                        <div class="import-content" id="plansImportContent">
                            ${this.renderPlansImportStep(importStep)}
                        </div>
                    </div>

                    <!-- Tableau des plans importés -->
                    <div class="detail-card plans-card">
                        <div class="card-header-flex">
                            <h3>📋 Plans d'entretien (${plans.length})</h3>
                            ${plans.length > 0 ? `
                                <button class="btn btn-sm btn-danger" onclick="ScreenPreparation.clearPlansEntretien()">
                                    Effacer tout
                                </button>
                            ` : ''}
                        </div>

                        ${plans.length === 0 ? `
                            <p class="empty-msg">Aucun plan importé. Utilisez la zone d'import ci-dessus.</p>
                        ` : `
                            <div class="plans-table-container">
                                <table class="plans-table">
                                    <thead>
                                        <tr>
                                            <th>Équipement</th>
                                            <th>Description</th>
                                            <th>Délai (sem)</th>
                                            <th>Fournisseur</th>
                                            <th>Statut</th>
                                            <th>Validé</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${plans.map((p, i) => `
                                            <tr class="${p.valide ? 'validated' : ''}">
                                                <td><strong>${p.equipement || '-'}</strong></td>
                                                <td>${p.description || '-'}</td>
                                                <td class="center">${p.delai || '-'}</td>
                                                <td>${p.fournisseur || '-'}</td>
                                                <td>
                                                    <select class="mini-select" onchange="ScreenPreparation.updatePlanStatut(${i}, this.value)">
                                                        <option value="a_commander" ${p.statut === 'a_commander' ? 'selected' : ''}>À commander</option>
                                                        <option value="commande" ${p.statut === 'commande' ? 'selected' : ''}>Commandé</option>
                                                        <option value="recu" ${p.statut === 'recu' ? 'selected' : ''}>Reçu</option>
                                                    </select>
                                                </td>
                                                <td class="center">
                                                    <input type="checkbox" ${p.valide ? 'checked' : ''}
                                                           onchange="ScreenPreparation.togglePlanValidation(${i})">
                                                </td>
                                                <td>
                                                    <button class="btn-icon danger" onclick="ScreenPreparation.deletePlan(${i})">✕</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="plans-summary">
                                <span class="summary-item">
                                    <strong>${plans.filter(p => p.valide).length}</strong> validés sur ${plans.length}
                                </span>
                                <span class="summary-item">
                                    <strong>${plans.filter(p => p.statut === 'a_commander').length}</strong> à commander
                                </span>
                            </div>
                        `}
                    </div>

                    <!-- Statut -->
                    <div class="detail-card plans-card">
                        <h3>📊 Statut de l'étape</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                    <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                    <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                    <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                <input type="range" id="detailPourcentage" class="form-control-range"
                                       min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                       oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                       onchange="ScreenPreparation.savePourcentageDetail()">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="detailResponsable" class="form-control"
                                       value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                       onchange="ScreenPreparation.saveResponsableDetail()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderPlansImportStep(step) {
        switch(step) {
            case 1:
                return `
                    <div class="upload-zone-plans" id="plansUploadZone"
                         ondrop="ScreenPreparation.handlePlansDrop(event)"
                         ondragover="ScreenPreparation.handlePlansDragOver(event)"
                         ondragleave="ScreenPreparation.handlePlansDragLeave(event)">
                        <input type="file" id="plansFileInput" accept=".xlsx,.xls,.csv"
                               onchange="ScreenPreparation.handlePlansFile(event)" style="display:none">
                        <div class="upload-content" onclick="document.getElementById('plansFileInput').click()">
                            <span class="upload-icon">📄</span>
                            <p><strong>Glissez un fichier Excel ici</strong></p>
                            <p class="upload-sub">ou cliquez pour sélectionner</p>
                            <p class="upload-formats">Formats: .xlsx, .xls, .csv</p>
                        </div>
                    </div>
                `;
            case 2:
                return `
                    <div class="mapping-step">
                        <p class="file-info">📄 Fichier: <strong>${this.plansEntretienImport.currentFile}</strong>
                           (${this.plansEntretienImport.currentData?.length || 0} lignes)</p>

                        <div class="mapping-grid-plans">
                            ${this.renderPlansMappingFields()}
                        </div>

                        <div class="step-actions">
                            <button class="btn btn-outline" onclick="ScreenPreparation.plansImportBack()">← Retour</button>
                            <button class="btn btn-primary" onclick="ScreenPreparation.plansImportNext()">Suivant →</button>
                        </div>
                    </div>
                `;
            case 3:
                return `
                    <div class="confirm-step">
                        <p class="confirm-info">✅ Prêt à importer <strong>${this.plansEntretienImport.currentData?.length || 0}</strong> plans d'entretien</p>

                        <div class="preview-plans">
                            ${this.renderPlansPreview()}
                        </div>

                        <div class="step-actions">
                            <button class="btn btn-outline" onclick="ScreenPreparation.plansImportBack()">← Retour</button>
                            <button class="btn btn-success" onclick="ScreenPreparation.confirmPlansImport()">✓ Importer</button>
                        </div>
                    </div>
                `;
        }
    },

    renderPlansMappingFields() {
        const headers = this.plansEntretienImport.currentHeaders;
        const fields = [
            { id: 'equipement', label: 'Équipement', required: true },
            { id: 'description', label: 'Description', required: false },
            { id: 'delai', label: 'Délai (semaines)', required: false },
            { id: 'fournisseur', label: 'Fournisseur', required: false },
            { id: 'reference', label: 'Référence pièce', required: false },
            { id: 'quantite', label: 'Quantité', required: false },
            { id: 'cout', label: 'Coût estimé', required: false }
        ];

        return fields.map(f => `
            <div class="mapping-field">
                <label>${f.label} ${f.required ? '<span class="req">*</span>' : ''}</label>
                <select id="planMap_${f.id}" class="form-control">
                    <option value="">-- Non mappé --</option>
                    ${headers.map(h => `<option value="${h}">${h}</option>`).join('')}
                </select>
            </div>
        `).join('');
    },

    renderPlansPreview() {
        const data = this.plansEntretienImport.currentData?.slice(0, 3) || [];
        const mapping = this.plansEntretienImport.currentMapping || {};

        if (data.length === 0) return '<p>Aucune donnée</p>';

        return `
            <table class="preview-table">
                <thead>
                    <tr>
                        <th>Équipement</th>
                        <th>Description</th>
                        <th>Délai</th>
                        <th>Fournisseur</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>
                            <td>${row[mapping.equipement] || '-'}</td>
                            <td>${row[mapping.description] || '-'}</td>
                            <td>${row[mapping.delai] || '-'}</td>
                            <td>${row[mapping.fournisseur] || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <p class="preview-note">Aperçu des 3 premières lignes...</p>
        `;
    },

    // Handlers pour l'import des plans
    handlePlansDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },

    handlePlansDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    },

    async handlePlansDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) await this.processPlansFile(file);
    },

    async handlePlansFile(e) {
        const file = e.target.files[0];
        if (file) await this.processPlansFile(file);
    },

    async processPlansFile(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                const headers = jsonData[0].map(h => String(h || '').trim()).filter(h => h);
                const rows = jsonData.slice(1).filter(r => r.some(c => c)).map(row => {
                    const obj = {};
                    headers.forEach((h, i) => obj[h] = row[i]);
                    return obj;
                });

                this.plansEntretienImport.currentFile = file.name;
                this.plansEntretienImport.currentHeaders = headers;
                this.plansEntretienImport.currentData = rows;
                this.plansEntretienImport.step = 2;
                this.refresh();
                App.showToast(`${rows.length} lignes détectées`, 'success');
            };
            reader.readAsArrayBuffer(file);
        } catch (err) {
            App.showToast('Erreur lecture fichier', 'error');
        }
    },

    plansImportBack() {
        this.plansEntretienImport.step--;
        this.refresh();
    },

    plansImportNext() {
        // Sauvegarder le mapping
        const mapping = {};
        ['equipement', 'description', 'delai', 'fournisseur', 'reference', 'quantite', 'cout'].forEach(f => {
            const select = document.getElementById(`planMap_${f}`);
            if (select && select.value) mapping[f] = select.value;
        });

        if (!mapping.equipement) {
            App.showToast('Le champ Équipement est obligatoire', 'warning');
            return;
        }

        this.plansEntretienImport.currentMapping = mapping;
        this.plansEntretienImport.step = 3;
        this.refresh();
    },

    confirmPlansImport() {
        const mapping = this.plansEntretienImport.currentMapping;
        const data = this.plansEntretienImport.currentData;

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.plansEntretien) DataManager.data.processus.plansEntretien = { items: [] };

        const newPlans = data.map(row => ({
            equipement: row[mapping.equipement] || '',
            description: row[mapping.description] || '',
            delai: row[mapping.delai] || '',
            fournisseur: row[mapping.fournisseur] || '',
            reference: row[mapping.reference] || '',
            quantite: row[mapping.quantite] || '',
            cout: row[mapping.cout] || '',
            statut: 'a_commander',
            valide: false,
            dateImport: new Date().toISOString()
        }));

        DataManager.data.processus.plansEntretien.items.push(...newPlans);
        DataManager.saveToStorage();

        // Reset import
        this.plansEntretienImport = { currentFile: null, currentData: null, currentHeaders: [], currentMapping: null, step: 1 };
        this.refresh();
        App.showToast(`${newPlans.length} plans importés`, 'success');
    },

    updatePlanStatut(index, statut) {
        if (DataManager.data.processus?.plansEntretien?.items?.[index]) {
            DataManager.data.processus.plansEntretien.items[index].statut = statut;
            DataManager.saveToStorage();
        }
    },

    togglePlanValidation(index) {
        if (DataManager.data.processus?.plansEntretien?.items?.[index]) {
            DataManager.data.processus.plansEntretien.items[index].valide =
                !DataManager.data.processus.plansEntretien.items[index].valide;
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    deletePlan(index) {
        if (confirm('Supprimer ce plan ?')) {
            DataManager.data.processus.plansEntretien.items.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Plan supprimé', 'success');
        }
    },

    clearPlansEntretien() {
        if (confirm('Effacer tous les plans d\'entretien ?')) {
            DataManager.data.processus.plansEntretien = { items: [] };
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Plans effacés', 'success');
        }
    },

    // ==========================================
    // ÉCRAN SPÉCIFIQUE: D3.0 - Équipe de gestion d'arrêt
    // ==========================================

    renderDetailEquipeGestion() {
        const etat = ProcessusArret.getEtatEtape('D3.0');
        const equipeData = DataManager.data.processus?.equipeGestion || {};
        const membres = equipeData.membres || [];

        return `
            <div class="detail-screen equipe-gestion-screen">
                <!-- Header -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: #3b82f6">Définir</span>
                        <h2>D3.0 - Nommer équipe de gestion d'arrêt</h2>
                    </div>
                </div>

                <div class="detail-body equipe-body">
                    <!-- Organigramme visuel -->
                    <div class="detail-card equipe-card">
                        <h3>🏢 Organigramme de l'équipe</h3>
                        <div class="organigramme-container" id="organigramme">
                            ${this.renderOrganigramme(membres)}
                        </div>
                    </div>

                    <!-- Tableau des membres -->
                    <div class="detail-card equipe-card">
                        <div class="card-header-flex">
                            <h3>👥 Membres de l'équipe (${membres.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.showAddMembreModal()">
                                + Ajouter membre
                            </button>
                        </div>

                        ${membres.length === 0 ? `
                            <p class="empty-msg">Aucun membre défini. Cliquez sur "+ Ajouter membre" pour commencer.</p>
                        ` : `
                            <div class="membres-table-container">
                                <table class="membres-table">
                                    <thead>
                                        <tr>
                                            <th>Niveau</th>
                                            <th>Nom</th>
                                            <th>Prénom</th>
                                            <th>Rôle</th>
                                            <th>Secteur</th>
                                            <th>Contact</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${membres.sort((a,b) => a.niveau - b.niveau).map((m, i) => `
                                            <tr class="niveau-${m.niveau}">
                                                <td class="center">
                                                    <span class="niveau-badge niveau-${m.niveau}">${m.niveau}</span>
                                                </td>
                                                <td><strong>${m.nom}</strong></td>
                                                <td>${m.prenom}</td>
                                                <td>${m.role}</td>
                                                <td>${m.secteur || '-'}</td>
                                                <td>
                                                    ${m.email ? `<small>📧 ${m.email}</small>` : ''}
                                                    ${m.telephone ? `<br><small>📞 ${m.telephone}</small>` : ''}
                                                </td>
                                                <td>
                                                    <button class="btn-icon" onclick="ScreenPreparation.editMembre(${i})" title="Modifier">✏️</button>
                                                    <button class="btn-icon danger" onclick="ScreenPreparation.deleteMembre(${i})" title="Supprimer">✕</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        `}
                    </div>

                    <!-- Légende des niveaux -->
                    <div class="detail-card equipe-card">
                        <h3>📊 Légende des niveaux hiérarchiques</h3>
                        <div class="niveaux-legende">
                            <div class="niveau-item">
                                <span class="niveau-badge niveau-1">1</span>
                                <span>Direction / Coordination générale</span>
                            </div>
                            <div class="niveau-item">
                                <span class="niveau-badge niveau-2">2</span>
                                <span>Responsables de secteur / Superviseurs</span>
                            </div>
                            <div class="niveau-item">
                                <span class="niveau-badge niveau-3">3</span>
                                <span>Planificateurs / Coordonnateurs</span>
                            </div>
                            <div class="niveau-item">
                                <span class="niveau-badge niveau-4">4</span>
                                <span>Support / Spécialistes</span>
                            </div>
                        </div>
                    </div>

                    <!-- Statut -->
                    <div class="detail-card equipe-card">
                        <h3>📊 Statut de l'étape</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                    <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                    <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                    <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                <input type="range" id="detailPourcentage" class="form-control-range"
                                       min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                       oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                       onchange="ScreenPreparation.savePourcentageDetail()">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="detailResponsable" class="form-control"
                                       value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                       onchange="ScreenPreparation.saveResponsableDetail()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderOrganigramme(membres) {
        if (membres.length === 0) {
            return '<p class="empty-msg">Ajoutez des membres pour voir l\'organigramme</p>';
        }

        // Grouper par niveau
        const niveaux = {};
        membres.forEach(m => {
            if (!niveaux[m.niveau]) niveaux[m.niveau] = [];
            niveaux[m.niveau].push(m);
        });

        let html = '<div class="org-tree">';

        // Afficher chaque niveau
        [1, 2, 3, 4].forEach(niveau => {
            if (niveaux[niveau] && niveaux[niveau].length > 0) {
                html += `
                    <div class="org-level org-level-${niveau}">
                        <div class="org-level-label">Niveau ${niveau}</div>
                        <div class="org-nodes">
                            ${niveaux[niveau].map(m => `
                                <div class="org-node niveau-${niveau}">
                                    <div class="org-node-role">${m.role}</div>
                                    <div class="org-node-name">${m.prenom} ${m.nom}</div>
                                    <div class="org-node-secteur">${m.secteur || ''}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });

        html += '</div>';
        return html;
    },

    showAddMembreModal(editIndex = null) {
        const membres = DataManager.data.processus?.equipeGestion?.membres || [];
        const membre = editIndex !== null ? membres[editIndex] : null;
        const isEdit = membre !== null;

        const html = `
            <div class="overlay-modal" id="addMembreModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>${isEdit ? 'Modifier le membre' : 'Ajouter un membre'}</h3>
                        <button class="close-btn" onclick="document.getElementById('addMembreModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="membre-form-grid">
                            <div class="form-group">
                                <label>Nom *</label>
                                <input type="text" id="membreNom" class="form-control"
                                       value="${membre?.nom || ''}" placeholder="Nom de famille">
                            </div>
                            <div class="form-group">
                                <label>Prénom *</label>
                                <input type="text" id="membrePrenom" class="form-control"
                                       value="${membre?.prenom || ''}" placeholder="Prénom">
                            </div>
                            <div class="form-group">
                                <label>Rôle *</label>
                                <select id="membreRole" class="form-control">
                                    <option value="">Sélectionner...</option>
                                    <option value="Directeur d'arrêt" ${membre?.role === "Directeur d'arrêt" ? 'selected' : ''}>Directeur d'arrêt</option>
                                    <option value="Coordonnateur principal" ${membre?.role === "Coordonnateur principal" ? 'selected' : ''}>Coordonnateur principal</option>
                                    <option value="Superviseur mécanique" ${membre?.role === "Superviseur mécanique" ? 'selected' : ''}>Superviseur mécanique</option>
                                    <option value="Superviseur électrique" ${membre?.role === "Superviseur électrique" ? 'selected' : ''}>Superviseur électrique</option>
                                    <option value="Superviseur instrumentation" ${membre?.role === "Superviseur instrumentation" ? 'selected' : ''}>Superviseur instrumentation</option>
                                    <option value="Planificateur" ${membre?.role === "Planificateur" ? 'selected' : ''}>Planificateur</option>
                                    <option value="Responsable SST" ${membre?.role === "Responsable SST" ? 'selected' : ''}>Responsable SST</option>
                                    <option value="Responsable approvisionnement" ${membre?.role === "Responsable approvisionnement" ? 'selected' : ''}>Responsable approvisionnement</option>
                                    <option value="Responsable contrats" ${membre?.role === "Responsable contrats" ? 'selected' : ''}>Responsable contrats</option>
                                    <option value="Ingénieur fiabilité" ${membre?.role === "Ingénieur fiabilité" ? 'selected' : ''}>Ingénieur fiabilité</option>
                                    <option value="Autre" ${membre?.role === "Autre" ? 'selected' : ''}>Autre</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Secteur</label>
                                <input type="text" id="membreSecteur" class="form-control"
                                       value="${membre?.secteur || ''}" placeholder="Ex: Zone Nord, Maintenance...">
                            </div>
                            <div class="form-group">
                                <label>Niveau hiérarchique *</label>
                                <select id="membreNiveau" class="form-control">
                                    <option value="1" ${membre?.niveau === 1 ? 'selected' : ''}>1 - Direction</option>
                                    <option value="2" ${membre?.niveau === 2 ? 'selected' : ''}>2 - Responsable/Superviseur</option>
                                    <option value="3" ${membre?.niveau === 3 ? 'selected' : ''}>3 - Planificateur/Coordonnateur</option>
                                    <option value="4" ${membre?.niveau === 4 ? 'selected' : ''}>4 - Support/Spécialiste</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="membreEmail" class="form-control"
                                       value="${membre?.email || ''}" placeholder="email@exemple.com">
                            </div>
                            <div class="form-group">
                                <label>Téléphone</label>
                                <input type="tel" id="membreTel" class="form-control"
                                       value="${membre?.telephone || ''}" placeholder="514-555-1234">
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('addMembreModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveMembre(${editIndex})">
                            ${isEdit ? 'Enregistrer' : 'Ajouter'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        const existing = document.getElementById('addMembreModal');
        if (existing) existing.remove();
        document.body.insertAdjacentHTML('beforeend', html);
    },

    saveMembre(editIndex = null) {
        const nom = document.getElementById('membreNom').value.trim();
        const prenom = document.getElementById('membrePrenom').value.trim();
        const role = document.getElementById('membreRole').value;
        const secteur = document.getElementById('membreSecteur').value.trim();
        const niveau = parseInt(document.getElementById('membreNiveau').value);
        const email = document.getElementById('membreEmail').value.trim();
        const telephone = document.getElementById('membreTel').value.trim();

        if (!nom || !prenom || !role) {
            App.showToast('Veuillez remplir les champs obligatoires', 'warning');
            return;
        }

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.equipeGestion) DataManager.data.processus.equipeGestion = { membres: [] };

        const membre = {
            nom,
            prenom,
            role,
            secteur,
            niveau,
            email,
            telephone,
            dateAjout: new Date().toISOString()
        };

        if (editIndex !== null && editIndex >= 0) {
            DataManager.data.processus.equipeGestion.membres[editIndex] = membre;
            App.showToast('Membre modifié', 'success');
        } else {
            DataManager.data.processus.equipeGestion.membres.push(membre);
            App.showToast('Membre ajouté', 'success');
        }

        DataManager.saveToStorage();
        document.getElementById('addMembreModal').remove();
        this.refresh();
    },

    editMembre(index) {
        this.showAddMembreModal(index);
    },

    deleteMembre(index) {
        if (confirm('Supprimer ce membre ?')) {
            DataManager.data.processus.equipeGestion.membres.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Membre supprimé', 'success');
        }
    },

    // ==========================================
    // ÉCRAN SPÉCIFIQUE: D4.0 - DA et Soumissions
    // ==========================================

    renderDetailCreationDA() {
        const etat = ProcessusArret.getEtatEtape('D4.0');
        const daData = DataManager.data.processus?.demandesAchat || {};
        const lignes = daData.lignes || [];
        const soumissions = DataManager.data.processus?.soumissions || [];
        const budgetTotal = parseFloat(DataManager.data.processus?.definitionArret?.budget) || 0;
        const montantUtilise = this.calculerMontantDA();
        const pourcentageUtilise = budgetTotal > 0 ? ((montantUtilise / budgetTotal) * 100).toFixed(1) : 0;
        const montantRestant = budgetTotal - montantUtilise;

        // Stats soumissions
        const soumissionsRecues = soumissions.filter(s => s.dateReception).length;
        const soumissionsEnAttente = soumissions.length - soumissionsRecues;

        return `
            <div class="detail-screen creation-da-screen">
                <!-- Header -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: #3b82f6">Définir</span>
                        <h2>D4.0 - DA et Soumissions</h2>
                    </div>
                </div>

                <div class="detail-body da-body">
                    <!-- Résumé Budget -->
                    <div class="detail-card da-card budget-summary-card">
                        <h3>Suivi du Budget</h3>
                        <div class="budget-overview">
                            <div class="budget-stat">
                                <span class="budget-label">Budget Total</span>
                                <span class="budget-value total">${this.formatMontant(budgetTotal)}</span>
                            </div>
                            <div class="budget-stat">
                                <span class="budget-label">Montant Engagé (DA)</span>
                                <span class="budget-value used">${this.formatMontant(montantUtilise)}</span>
                            </div>
                            <div class="budget-stat">
                                <span class="budget-label">Reste Disponible</span>
                                <span class="budget-value ${montantRestant < 0 ? 'danger' : 'available'}">${this.formatMontant(montantRestant)}</span>
                            </div>
                        </div>

                        <div class="budget-progress-container">
                            <div class="budget-progress-bar">
                                <div class="budget-progress-fill ${pourcentageUtilise > 100 ? 'over-budget' : pourcentageUtilise > 80 ? 'warning' : ''}"
                                     style="width: ${Math.min(pourcentageUtilise, 100)}%"></div>
                            </div>
                            <span class="budget-progress-label">${pourcentageUtilise}% du budget utilisé</span>
                        </div>

                        ${budgetTotal === 0 ? `
                            <div class="budget-warning">
                                Aucun budget défini. <a href="#" onclick="ScreenPreparation.goToEtape('D1.0'); return false;">Définir le budget dans D1.0</a>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Tableau des DA -->
                    <div class="detail-card da-card">
                        <div class="card-header-flex">
                            <h3>Demandes d'Achat (${lignes.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addLigneDA()">
                                + Ajouter une ligne
                            </button>
                        </div>

                        <div class="da-table-container">
                            <table class="da-table" id="daTable">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">#</th>
                                        <th>Fournisseur</th>
                                        <th>Travaux</th>
                                        <th>CDE Achat</th>
                                        <th>DA Ordre</th>
                                        <th>Opération</th>
                                        <th style="width: 130px;">Montant ($)</th>
                                        <th style="width: 80px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="daTableBody">
                                    ${lignes.length === 0 ? `
                                        <tr class="empty-row">
                                            <td colspan="8" class="empty-msg">Aucune demande d'achat. Cliquez sur "+ Ajouter une ligne" pour commencer.</td>
                                        </tr>
                                    ` : lignes.map((l, i) => this.renderLigneDA(l, i)).join('')}
                                </tbody>
                                ${lignes.length > 0 ? `
                                    <tfoot>
                                        <tr class="total-row">
                                            <td colspan="6" class="total-label">TOTAL</td>
                                            <td class="total-value">${this.formatMontant(montantUtilise)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                ` : ''}
                            </table>
                        </div>

                        ${lignes.length > 0 ? `
                            <div class="da-actions">
                                <button class="btn btn-outline btn-sm" onclick="ScreenPreparation.exportDA()">
                                    Exporter Excel
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="ScreenPreparation.clearAllDA()">
                                    Tout effacer
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Tableau des Soumissions Entrepreneurs -->
                    <div class="detail-card da-card">
                        <div class="card-header-flex">
                            <h3>Soumissions Entrepreneurs (${soumissions.length})</h3>
                            <div class="btn-group">
                                <span class="badge badge-success">${soumissionsRecues} reçue${soumissionsRecues > 1 ? 's' : ''}</span>
                                <span class="badge badge-warning">${soumissionsEnAttente} en attente</span>
                                <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addSoumission()">
                                    + Ajouter
                                </button>
                            </div>
                        </div>

                        <div class="da-table-container">
                            <table class="da-table" id="soumissionsTable">
                                <thead>
                                    <tr>
                                        <th style="width: 140px;">Entrepreneur</th>
                                        <th style="width: 90px;">Code SAP</th>
                                        <th style="min-width: 200px;">Commentaires</th>
                                        <th style="width: 110px;">Date Demande</th>
                                        <th style="width: 100px;">Relance 1</th>
                                        <th style="width: 100px;">Relance 2</th>
                                        <th style="width: 100px;">Relance 3</th>
                                        <th style="width: 110px;">Date Réception</th>
                                        <th style="width: 100px;">N° Soumission</th>
                                        <th style="width: 80px;">Documents</th>
                                        <th style="width: 60px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${soumissions.length === 0 ? `
                                        <tr class="empty-row">
                                            <td colspan="11" class="empty-msg">Aucune soumission. Cliquez sur "+ Ajouter" pour commencer.</td>
                                        </tr>
                                    ` : soumissions.map((s, i) => this.renderLigneSoumission(s, i)).join('')}
                                </tbody>
                            </table>
                        </div>

                        ${soumissions.length > 0 ? `
                            <div class="da-actions">
                                <button class="btn btn-outline btn-sm" onclick="ScreenPreparation.exportSoumissions()">
                                    Exporter Excel
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Statut -->
                    <div class="detail-card da-card">
                        <h3>Statut de l'étape</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                    <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                    <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                    <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                <input type="range" id="detailPourcentage" class="form-control-range"
                                       min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                       oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                       onchange="ScreenPreparation.savePourcentageDetail()">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="detailResponsable" class="form-control"
                                       value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                       onchange="ScreenPreparation.saveResponsableDetail()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderLigneSoumission(soumission, index) {
        const isRecue = soumission.dateReception ? 'row-success' : '';
        return `
            <tr data-index="${index}" class="${isRecue}">
                <td>
                    <input type="text" class="da-input" value="${soumission.entrepreneur || ''}"
                           onchange="ScreenPreparation.updateSoumission(${index}, 'entrepreneur', this.value)"
                           placeholder="Entrepreneur">
                </td>
                <td>
                    <input type="text" class="da-input da-input-sm" value="${soumission.codeSAP || ''}"
                           onchange="ScreenPreparation.updateSoumission(${index}, 'codeSAP', this.value)"
                           placeholder="Code SAP">
                </td>
                <td class="td-commentaire">
                    <textarea class="da-input da-textarea" rows="2"
                              onchange="ScreenPreparation.updateSoumission(${index}, 'commentaires', this.value)"
                              placeholder="Commentaires">${soumission.commentaires || ''}</textarea>
                </td>
                <td>
                    <input type="date" class="da-input da-input-date" value="${soumission.dateDemande || ''}"
                           onchange="ScreenPreparation.updateSoumission(${index}, 'dateDemande', this.value)">
                </td>
                <td class="center">
                    <span class="relance-date ${this.getRelanceStatus(soumission.dateDemande, 14, soumission.dateReception)}">${this.calculerRelance(soumission.dateDemande, 14)}</span>
                </td>
                <td class="center">
                    <span class="relance-date ${this.getRelanceStatus(soumission.dateDemande, 28, soumission.dateReception)}">${this.calculerRelance(soumission.dateDemande, 28)}</span>
                </td>
                <td class="center">
                    <span class="relance-date ${this.getRelanceStatus(soumission.dateDemande, 42, soumission.dateReception)}">${this.calculerRelance(soumission.dateDemande, 42)}</span>
                </td>
                <td>
                    <input type="date" class="da-input da-input-date" value="${soumission.dateReception || ''}"
                           onchange="ScreenPreparation.updateSoumission(${index}, 'dateReception', this.value)">
                </td>
                <td>
                    <input type="text" class="da-input da-input-sm" value="${soumission.numeroSoumission || ''}"
                           onchange="ScreenPreparation.updateSoumission(${index}, 'numeroSoumission', this.value)"
                           placeholder="N°">
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.gererDocumentsSoumission(${index})" title="Gérer documents">
                        ${(soumission.documents || []).length || 0} doc${(soumission.documents || []).length > 1 ? 's' : ''}
                    </button>
                </td>
                <td class="actions-cell">
                    <button class="btn-icon danger" onclick="ScreenPreparation.deleteSoumission(${index})" title="Supprimer">✕</button>
                </td>
            </tr>
        `;
    },

    // Calculer la date de relance (date demande + jours)
    calculerRelance(dateDemande, jours) {
        if (!dateDemande) return '-';
        const date = new Date(dateDemande);
        date.setDate(date.getDate() + jours);
        return date.toLocaleDateString('fr-CA');
    },

    // Déterminer le statut de la relance (passée, proche, future, ou terminé si reçu)
    getRelanceStatus(dateDemande, jours, dateReception) {
        // Si déjà reçu, pas besoin de relance
        if (dateReception) return 'relance-done';
        if (!dateDemande) return '';

        const dateRelance = new Date(dateDemande);
        dateRelance.setDate(dateRelance.getDate() + jours);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateRelance.setHours(0, 0, 0, 0);

        const diffJours = Math.ceil((dateRelance - today) / (1000 * 60 * 60 * 24));

        if (diffJours < 0) return 'relance-passee';      // Date passée
        if (diffJours <= 3) return 'relance-imminente';  // Dans 3 jours ou moins
        if (diffJours <= 7) return 'relance-proche';     // Dans la semaine
        return '';  // Future
    },

    addSoumission() {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.soumissions) DataManager.data.processus.soumissions = [];

        DataManager.data.processus.soumissions.push({
            entrepreneur: '',
            codeSAP: '',
            commentaires: '',
            dateDemande: new Date().toISOString().split('T')[0],
            relance1: '',
            relance2: '',
            relance3: '',
            dateReception: '',
            numeroSoumission: '',
            documents: []
        });

        DataManager.saveToStorage();
        this.refresh();
        App.showToast('Soumission ajoutée', 'success');
    },

    updateSoumission(index, field, value) {
        if (DataManager.data.processus?.soumissions?.[index]) {
            DataManager.data.processus.soumissions[index][field] = value;
            DataManager.saveToStorage();
            // Refresh pour dateReception et dateDemande (recalcul relances)
            if (field === 'dateReception' || field === 'dateDemande') {
                this.refresh();
            }
        }
    },

    deleteSoumission(index) {
        if (confirm('Supprimer cette soumission ?')) {
            DataManager.data.processus.soumissions.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Soumission supprimée', 'success');
        }
    },

    gererDocumentsSoumission(index) {
        const soumission = DataManager.data.processus?.soumissions?.[index];
        if (!soumission) return;

        const documents = soumission.documents || [];

        const html = `
            <div class="overlay-modal" id="documentsSoumissionModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>Documents - ${soumission.entrepreneur || 'Soumission'}</h3>
                        <button class="close-btn" onclick="document.getElementById('documentsSoumissionModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Ajouter un document</label>
                            <div class="input-group">
                                <input type="text" id="nouveauDocument" class="form-control" placeholder="Nom du document ou lien">
                                <button class="btn btn-primary" onclick="ScreenPreparation.ajouterDocumentSoumission(${index})">Ajouter</button>
                            </div>
                        </div>

                        <div class="documents-list" style="margin-top: 15px;">
                            ${documents.length === 0 ? `
                                <p class="empty-msg">Aucun document</p>
                            ` : documents.map((doc, i) => `
                                <div class="document-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #eee;">
                                    <span>${doc}</span>
                                    <button class="btn-icon danger" onclick="ScreenPreparation.supprimerDocumentSoumission(${index}, ${i})">✕</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-primary" onclick="document.getElementById('documentsSoumissionModal').remove()">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    ajouterDocumentSoumission(index) {
        const input = document.getElementById('nouveauDocument');
        const nom = input.value.trim();
        if (!nom) return;

        if (!DataManager.data.processus.soumissions[index].documents) {
            DataManager.data.processus.soumissions[index].documents = [];
        }
        DataManager.data.processus.soumissions[index].documents.push(nom);
        DataManager.saveToStorage();

        document.getElementById('documentsSoumissionModal').remove();
        this.gererDocumentsSoumission(index);
        this.refresh();
    },

    supprimerDocumentSoumission(soumissionIndex, docIndex) {
        DataManager.data.processus.soumissions[soumissionIndex].documents.splice(docIndex, 1);
        DataManager.saveToStorage();

        document.getElementById('documentsSoumissionModal').remove();
        this.gererDocumentsSoumission(soumissionIndex);
        this.refresh();
    },

    exportSoumissions() {
        const soumissions = DataManager.data.processus?.soumissions || [];
        if (soumissions.length === 0) {
            App.showToast('Aucune soumission à exporter', 'error');
            return;
        }

        const headers = ['Entrepreneur', 'Code SAP', 'Commentaires', 'Date Demande', 'Relance 1', 'Relance 2', 'Relance 3', 'Date Réception', 'N° Soumission', 'Documents'];
        const rows = soumissions.map(s => [
            s.entrepreneur || '',
            s.codeSAP || '',
            s.commentaires || '',
            s.dateDemande || '',
            s.relance1 || '',
            s.relance2 || '',
            s.relance3 || '',
            s.dateReception || '',
            s.numeroSoumission || '',
            (s.documents || []).join(', ')
        ]);

        let csv = '\uFEFF';
        csv += 'Soumissions Entrepreneurs\n';
        csv += `Date d'export: ${new Date().toLocaleDateString('fr-CA')}\n\n`;
        csv += headers.join(';') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Soumissions_${new Date().toLocaleDateString('fr-CA')}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        App.showToast('Export téléchargé', 'success');
    },

    renderLigneDA(ligne, index) {
        return `
            <tr data-index="${index}">
                <td class="center">${index + 1}</td>
                <td>
                    <input type="text" class="da-input" value="${ligne.fournisseur || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'fournisseur', this.value)"
                           placeholder="Fournisseur">
                </td>
                <td>
                    <input type="text" class="da-input" value="${ligne.travaux || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'travaux', this.value)"
                           placeholder="Description travaux">
                </td>
                <td>
                    <input type="text" class="da-input da-input-sm" value="${ligne.cdeAchat || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'cdeAchat', this.value)"
                           placeholder="N° CDE">
                </td>
                <td>
                    <input type="text" class="da-input da-input-sm" value="${ligne.daOrdre || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'daOrdre', this.value)"
                           placeholder="DA Ordre">
                </td>
                <td>
                    <input type="text" class="da-input da-input-sm" value="${ligne.operation || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'operation', this.value)"
                           placeholder="Opération">
                </td>
                <td>
                    <input type="number" class="da-input da-input-montant" value="${ligne.montant || ''}"
                           onchange="ScreenPreparation.updateLigneDA(${index}, 'montant', this.value)"
                           placeholder="0.00" min="0" step="0.01">
                </td>
                <td class="actions-cell">
                    <button class="btn-icon danger" onclick="ScreenPreparation.deleteLigneDA(${index})" title="Supprimer">✕</button>
                </td>
            </tr>
        `;
    },

    // Calculer le montant total des DA
    calculerMontantDA() {
        const lignes = DataManager.data.processus?.demandesAchat?.lignes || [];
        return lignes.reduce((total, ligne) => {
            const montant = parseFloat(ligne.montant) || 0;
            return total + montant;
        }, 0);
    },

    // Formater un montant en devise
    formatMontant(montant) {
        return new Intl.NumberFormat('fr-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 2
        }).format(montant || 0);
    },

    // Ajouter une nouvelle ligne DA
    addLigneDA() {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.demandesAchat) DataManager.data.processus.demandesAchat = { lignes: [] };

        DataManager.data.processus.demandesAchat.lignes.push({
            fournisseur: '',
            travaux: '',
            cdeAchat: '',
            daOrdre: '',
            operation: '',
            montant: '',
            dateCreation: new Date().toISOString()
        });

        DataManager.saveToStorage();
        this.refresh();
        App.showToast('Ligne ajoutée', 'success');
    },

    // Mettre à jour une ligne DA
    updateLigneDA(index, field, value) {
        if (DataManager.data.processus?.demandesAchat?.lignes?.[index]) {
            DataManager.data.processus.demandesAchat.lignes[index][field] = value;
            DataManager.saveToStorage();

            // Si c'est le montant, rafraîchir pour mettre à jour les totaux
            if (field === 'montant') {
                this.refresh();
            }
        }
    },

    // Supprimer une ligne DA
    deleteLigneDA(index) {
        if (confirm('Supprimer cette ligne ?')) {
            DataManager.data.processus.demandesAchat.lignes.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Ligne supprimée', 'success');
        }
    },

    // Effacer toutes les DA
    clearAllDA() {
        if (confirm('Effacer toutes les demandes d\'achat ?')) {
            DataManager.data.processus.demandesAchat = { lignes: [] };
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Toutes les DA effacées', 'success');
        }
    },

    // Exporter les DA en Excel
    exportDA() {
        const lignes = DataManager.data.processus?.demandesAchat?.lignes || [];
        if (lignes.length === 0) {
            App.showToast('Aucune donnée à exporter', 'warning');
            return;
        }

        // Préparer les données pour l'export
        const exportData = lignes.map((l, i) => ({
            '#': i + 1,
            'Fournisseur': l.fournisseur || '',
            'Travaux': l.travaux || '',
            'CDE Achat': l.cdeAchat || '',
            'DA Ordre': l.daOrdre || '',
            'Opération': l.operation || '',
            'Montant': parseFloat(l.montant) || 0
        }));

        // Ajouter la ligne total
        exportData.push({
            '#': '',
            'Fournisseur': '',
            'Travaux': '',
            'CDE Achat': '',
            'DA Ordre': '',
            'Opération': 'TOTAL',
            'Montant': this.calculerMontantDA()
        });

        // Créer le workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Demandes Achat');

        // Télécharger
        const dateStr = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `DA_Arret_${dateStr}.xlsx`);
        App.showToast('Export réussi', 'success');
    },

    // Navigation vers une autre étape
    goToEtape(etapeId) {
        this.currentEtape = etapeId;
        this.currentView = 'detail';
        this.refresh();
    },

    // ==========================================
    // D5.0 - Stratégie d'approvisionnement
    // ==========================================

    showHistoriqueAppro: false,

    renderDetailStrategieApprovisionnement() {
        const etat = ProcessusArret.getEtatEtape('D5.0');
        const approData = DataManager.data.processus?.strategieAppro || {};
        const anneeActuelle = new Date().getFullYear();
        const fournisseurs = approData[anneeActuelle] || [];
        const historique = this.getHistoriqueAppro(anneeActuelle);

        // Stats
        const totalEstime = fournisseurs.reduce((sum, f) => sum + (parseFloat(f.estime) || 0), 0);

        return `
            <div class="detail-screen strategie-appro-screen">
                <!-- Header -->
                <div class="detail-header">
                    <button class="back-btn" onclick="ScreenPreparation.backToList()">
                        ← Retour
                    </button>
                    <div class="detail-title">
                        <span class="detail-phase-badge" style="background: #3b82f6">Définir</span>
                        <h2>D5.0 - Stratégie d'approvisionnement</h2>
                    </div>
                </div>

                <div class="detail-body da-body">
                    <!-- Info -->
                    <div class="detail-card da-card info-card">
                        <p class="info-text">
                            📦 Définissez la stratégie d'approvisionnement pour les fournisseurs et types de travaux.
                            L'historique des années précédentes est conservé pour référence.
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card da-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${anneeActuelle}</span>
                                <span class="stat-label">Année en cours</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${fournisseurs.length}</span>
                                <span class="stat-label">Fournisseurs</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${this.formatMontant(totalEstime)}</span>
                                <span class="stat-label">Total estimé</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${historique.length}</span>
                                <span class="stat-label">Années historiques</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tableau année en cours -->
                    <div class="detail-card da-card">
                        <div class="card-header-flex">
                            <h3>📋 Stratégie ${anneeActuelle} (${fournisseurs.length})</h3>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.exportApproExcel()" title="Exporter Excel">
                                    📊 Excel
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.exportApproPDF()" title="Exporter PDF">
                                    📄 PDF
                                </button>
                                <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addFournisseurAppro()">
                                    + Ajouter
                                </button>
                            </div>
                        </div>

                        <div class="da-table-container">
                            <table class="da-table appro-table">
                                <thead>
                                    <tr>
                                        <th style="min-width: 150px;">Fournisseur</th>
                                        <th style="min-width: 150px;">Type de travaux</th>
                                        <th style="min-width: 200px;">Justification</th>
                                        <th style="width: 120px;">Estimé ($)</th>
                                        <th style="width: 60px;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fournisseurs.length === 0 ? `
                                        <tr class="empty-row"><td colspan="5" class="empty-msg">Aucun fournisseur. Cliquez sur "+ Ajouter" pour commencer.</td></tr>
                                    ` : fournisseurs.map((f, i) => this.renderLigneFournisseurAppro(f, i, anneeActuelle)).join('')}
                                </tbody>
                                ${fournisseurs.length > 0 ? `
                                    <tfoot>
                                        <tr class="total-row">
                                            <td colspan="3" class="total-label">TOTAL ${anneeActuelle}</td>
                                            <td class="total-value">${this.formatMontant(totalEstime)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                ` : ''}
                            </table>
                        </div>
                    </div>

                    <!-- Section Historique -->
                    ${historique.length > 0 ? `
                        <div class="detail-card da-card">
                            <div class="card-header-flex">
                                <h3>📚 Historique des années précédentes</h3>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.toggleHistoriqueAppro()">
                                    ${this.showHistoriqueAppro ? '🔼 Masquer' : '🔽 Afficher'} (${historique.length} années)
                                </button>
                            </div>

                            ${this.showHistoriqueAppro ? `
                                <div class="historique-appro">
                                    ${historique.map(h => `
                                        <div class="historique-annee">
                                            <div class="historique-header">
                                                <h4>📅 ${h.annee}</h4>
                                                <span class="historique-total">${h.fournisseurs.length} fournisseurs - Total: ${this.formatMontant(h.total)}</span>
                                            </div>
                                            <div class="table-container">
                                                <table class="planifier-table appro-table historique-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Fournisseur</th>
                                                            <th>Type de travaux</th>
                                                            <th>Justification</th>
                                                            <th>Estimé ($)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        ${h.fournisseurs.map(f => `
                                                            <tr>
                                                                <td>${f.fournisseur || '-'}</td>
                                                                <td>${f.typeTravaux || '-'}</td>
                                                                <td title="${f.justification || ''}">${(f.justification || '-').substring(0, 30)}...</td>
                                                                <td class="montant">${this.formatMontant(f.estime)}</td>
                                                            </tr>
                                                        `).join('')}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    <!-- Statut -->
                    <div class="detail-card da-card">
                        <h3>📊 Statut de l'étape</h3>
                        <div class="definition-form-grid">
                            <div class="form-group">
                                <label>Statut</label>
                                <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                                    <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                                    <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                    <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                    <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                                <input type="range" id="detailPourcentage" class="form-control-range"
                                       min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                                       oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                                       onchange="ScreenPreparation.savePourcentageDetail()">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="detailResponsable" class="form-control"
                                       value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                                       onchange="ScreenPreparation.saveResponsableDetail()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    getHistoriqueAppro(anneeActuelle) {
        const approData = DataManager.data.processus?.strategieAppro || {};
        const historique = [];

        Object.keys(approData).forEach(annee => {
            const anneeNum = parseInt(annee);
            if (anneeNum < anneeActuelle && approData[annee].length > 0) {
                const total = approData[annee].reduce((sum, f) => sum + (parseFloat(f.estime) || 0), 0);
                historique.push({
                    annee: anneeNum,
                    fournisseurs: approData[annee],
                    total: total
                });
            }
        });

        // Trier par année décroissante
        historique.sort((a, b) => b.annee - a.annee);
        return historique;
    },

    toggleHistoriqueAppro() {
        this.showHistoriqueAppro = !this.showHistoriqueAppro;
        this.refresh();
    },

    // Rendre une ligne éditable du tableau fournisseurs
    renderLigneFournisseurAppro(fournisseur, index, annee) {
        return `
            <tr data-index="${index}">
                <td>
                    <input type="text" class="da-input" value="${fournisseur.fournisseur || ''}"
                           onchange="ScreenPreparation.updateFournisseurAppro(${annee}, ${index}, 'fournisseur', this.value)"
                           placeholder="Nom du fournisseur">
                </td>
                <td>
                    <input type="text" class="da-input" value="${fournisseur.typeTravaux || ''}"
                           onchange="ScreenPreparation.updateFournisseurAppro(${annee}, ${index}, 'typeTravaux', this.value)"
                           placeholder="Type de travaux">
                </td>
                <td class="td-commentaire">
                    <textarea class="da-input da-textarea" rows="2"
                              onchange="ScreenPreparation.updateFournisseurAppro(${annee}, ${index}, 'justification', this.value)"
                              placeholder="Justification...">${fournisseur.justification || ''}</textarea>
                </td>
                <td>
                    <input type="number" class="da-input da-input-montant" value="${fournisseur.estime || ''}"
                           onchange="ScreenPreparation.updateFournisseurAppro(${annee}, ${index}, 'estime', this.value)"
                           placeholder="0" min="0" step="100">
                </td>
                <td class="actions-cell">
                    <button class="btn-icon danger" onclick="ScreenPreparation.deleteFournisseurAppro(${annee}, ${index})" title="Supprimer">✕</button>
                </td>
            </tr>
        `;
    },

    addFournisseurAppro() {
        const annee = new Date().getFullYear();
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.strategieAppro) DataManager.data.processus.strategieAppro = {};
        if (!DataManager.data.processus.strategieAppro[annee]) DataManager.data.processus.strategieAppro[annee] = [];

        DataManager.data.processus.strategieAppro[annee].push({
            fournisseur: '',
            typeTravaux: '',
            justification: '',
            estime: 0
        });

        DataManager.saveToStorage();
        this.refresh();
        App.showToast('Ligne ajoutée', 'success');
    },

    updateFournisseurAppro(annee, index, field, value) {
        if (DataManager.data.processus?.strategieAppro?.[annee]?.[index]) {
            if (field === 'estime') {
                DataManager.data.processus.strategieAppro[annee][index][field] = parseFloat(value) || 0;
                // Refresh pour mettre à jour le total
                this.refresh();
            } else {
                DataManager.data.processus.strategieAppro[annee][index][field] = value;
            }
            DataManager.saveToStorage();
        }
    },

    deleteFournisseurAppro(annee, index) {
        if (confirm('Supprimer ce fournisseur ?')) {
            DataManager.data.processus.strategieAppro[annee].splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Fournisseur supprimé', 'success');
        }
    },

    // Export Excel pour Stratégie d'approvisionnement
    exportApproExcel() {
        const annee = new Date().getFullYear();
        const approData = DataManager.data.processus?.strategieAppro || {};
        const fournisseurs = approData[annee] || [];

        if (fournisseurs.length === 0) {
            App.showToast('Aucune donnée à exporter', 'warning');
            return;
        }

        // Créer le CSV
        let csv = '\ufeff'; // BOM pour Excel
        csv += `Stratégie d'approvisionnement ${annee}\n\n`;
        csv += 'Fournisseur;Type de travaux;Justification;Estimé ($)\n';

        let total = 0;
        fournisseurs.forEach(f => {
            const estime = parseFloat(f.estime) || 0;
            total += estime;
            csv += `"${f.fournisseur || ''}";"${f.typeTravaux || ''}";"${(f.justification || '').replace(/"/g, '""')}";"${estime}"\n`;
        });

        csv += `\n"TOTAL";"";"";"${total}"\n`;

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `strategie_approvisionnement_${annee}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        App.showToast('Export Excel généré', 'success');
    },

    // Export PDF pour Stratégie d'approvisionnement
    exportApproPDF() {
        const annee = new Date().getFullYear();
        const approData = DataManager.data.processus?.strategieAppro || {};
        const fournisseurs = approData[annee] || [];

        if (fournisseurs.length === 0) {
            App.showToast('Aucune donnée à exporter', 'warning');
            return;
        }

        // Calculer le total
        const total = fournisseurs.reduce((sum, f) => sum + (parseFloat(f.estime) || 0), 0);

        // Créer le contenu HTML pour l'impression
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Stratégie d'approvisionnement ${annee}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
                    .info { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #1e40af; color: white; padding: 12px 8px; text-align: left; }
                    td { padding: 10px 8px; border-bottom: 1px solid #ddd; }
                    tr:nth-child(even) { background: #f8fafc; }
                    .montant { text-align: right; font-weight: 500; }
                    .total-row { background: #1e40af !important; color: white; font-weight: bold; }
                    .total-row td { border: none; }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
                </style>
            </head>
            <body>
                <h1>📦 Stratégie d'approvisionnement ${annee}</h1>
                <p class="info">Généré le ${new Date().toLocaleDateString('fr-CA')} - ${fournisseurs.length} fournisseur(s)</p>

                <table>
                    <thead>
                        <tr>
                            <th>Fournisseur</th>
                            <th>Type de travaux</th>
                            <th>Justification</th>
                            <th style="text-align: right;">Estimé ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${fournisseurs.map(f => `
                            <tr>
                                <td><strong>${f.fournisseur || '-'}</strong></td>
                                <td>${f.typeTravaux || '-'}</td>
                                <td>${f.justification || '-'}</td>
                                <td class="montant">${this.formatMontant(f.estime)}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="3">TOTAL</td>
                            <td class="montant">${this.formatMontant(total)}</td>
                        </tr>
                    </tbody>
                </table>

                <p class="footer">Cath's Eyes - Arrêt Annuel</p>
            </body>
            </html>
        `;

        // Ouvrir dans une nouvelle fenêtre et imprimer
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.onload = function() {
            printWindow.print();
        };
        App.showToast('PDF prêt pour impression', 'success');
    },

    // ==========================================
    // ÉCRANS SECTION PLANIFIER
    // ==========================================

    // Helper pour obtenir les travaux importés
    getTravauxImportes() {
        return DataManager.data.travaux || [];
    },

    // Helper pour rendre le header des écrans Planifier
    renderPlanifierHeader(id, titre) {
        return `
            <div class="detail-header">
                <button class="back-btn" onclick="ScreenPreparation.backToList()">
                    ← Retour
                </button>
                <div class="detail-title">
                    <span class="detail-phase-badge" style="background: #8b5cf6">Planifier</span>
                    <h2>${id} - ${titre}</h2>
                </div>
            </div>
        `;
    },

    // Helper pour rendre le statut des écrans Planifier
    renderPlanifierStatut(etapeId) {
        const etat = ProcessusArret.getEtatEtape(etapeId);
        return `
            <div class="detail-card planifier-card">
                <h3>📊 Statut de l'étape</h3>
                <div class="definition-form-grid">
                    <div class="form-group">
                        <label>Statut</label>
                        <select id="detailStatut" class="form-control" onchange="ScreenPreparation.saveStatutDetail()">
                            <option value="non_demarre" ${etat?.statut === 'non_demarre' ? 'selected' : ''}>À faire</option>
                            <option value="en_cours" ${etat?.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                            <option value="termine" ${etat?.statut === 'termine' ? 'selected' : ''}>Terminé</option>
                            <option value="bloque" ${etat?.statut === 'bloque' ? 'selected' : ''}>Bloqué</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Avancement: <span id="pctLabel">${etat?.pourcentage || 0}%</span></label>
                        <input type="range" id="detailPourcentage" class="form-control-range"
                               min="0" max="100" step="10" value="${etat?.pourcentage || 0}"
                               oninput="document.getElementById('pctLabel').textContent = this.value + '%'"
                               onchange="ScreenPreparation.savePourcentageDetail()">
                    </div>
                    <div class="form-group">
                        <label>Responsable</label>
                        <input type="text" id="detailResponsable" class="form-control"
                               value="${etat?.responsable || ''}" placeholder="Nom du responsable"
                               onchange="ScreenPreparation.saveResponsableDetail()">
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // PL1.0 - Liste des projets et capitalisation
    // ==========================================

    renderDetailProjetsCapitalisation() {
        const travaux = this.getTravauxImportes();
        const projetsData = DataManager.data.processus?.projetsCapitalisation || {};
        const projets = projetsData.projets || [];
        const capitalisation = projetsData.capitalisation || [];
        const projetsIng = DataManager.data.processus?.projetsIngenierie?.items || [];

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL1.0', 'Liste des projets et capitalisation')}

                <div class="detail-body planifier-body">
                    <!-- Info travaux importés -->
                    <div class="detail-card planifier-card info-card">
                        <div class="info-banner">
                            <span class="info-icon">📊</span>
                            <div class="info-content">
                                <strong>${travaux.length} travaux importés</strong>
                                <span>depuis Import de Données</span>
                            </div>
                            ${travaux.length === 0 ? `
                                <a href="#" onclick="App.navigateTo('import'); return false;" class="btn btn-sm btn-primary">
                                    Importer des données
                                </a>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Tableau Liste des Projets -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>📁 Liste des Projets (${projets.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addProjet()">
                                + Ajouter un projet
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Ordre</th>
                                        <th>Désignation</th>
                                        <th>Poste technique</th>
                                        <th>Responsable</th>
                                        <th>Durée</th>
                                        <th>Commentaire</th>
                                        <th>Documents</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${projets.length === 0 ? `
                                        <tr><td colspan="8" class="empty-msg">Aucun projet défini</td></tr>
                                    ` : projets.map((p, i) => `
                                        <tr>
                                            <td><strong>${p.ordre || '-'}</strong></td>
                                            <td class="td-wrap">${p.designation || '-'}</td>
                                            <td>${p.posteTechnique || '-'}</td>
                                            <td>${p.responsable || '-'}</td>
                                            <td class="center">${p.duree || '-'}</td>
                                            <td class="td-wrap td-commentaire-full">${p.commentaire || '-'}</td>
                                            <td class="center">${p.documents?.length ? `📎 ${p.documents.length}` : '-'}</td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editProjet(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteProjet(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tableau Capitalisation -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>💰 Capitalisation (${capitalisation.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addCapitalisation()">
                                + Ajouter
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Ordre</th>
                                        <th>Désignation</th>
                                        <th>Poste technique</th>
                                        <th>Responsable</th>
                                        <th>Durée</th>
                                        <th>Commentaire</th>
                                        <th>Documents</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${capitalisation.length === 0 ? `
                                        <tr><td colspan="8" class="empty-msg">Aucune capitalisation définie</td></tr>
                                    ` : capitalisation.map((c, i) => `
                                        <tr>
                                            <td><strong>${c.ordre || '-'}</strong></td>
                                            <td class="td-wrap">${c.designation || '-'}</td>
                                            <td>${c.posteTechnique || '-'}</td>
                                            <td>${c.responsable || '-'}</td>
                                            <td class="center">${c.duree || '-'}</td>
                                            <td class="td-wrap td-commentaire-full">${c.commentaire || '-'}</td>
                                            <td class="center">${c.documents?.length ? `📎 ${c.documents.length}` : '-'}</td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editCapitalisation(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteCapitalisation(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Tableau Projets Ingénierie -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>⚙️ Projets Ingénierie (${projetsIng.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addProjetIng()">
                                + Ajouter
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Ordre</th>
                                        <th>Désignation</th>
                                        <th>Poste technique</th>
                                        <th>Responsable</th>
                                        <th>Durée</th>
                                        <th>Commentaire</th>
                                        <th>Documents</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${projetsIng.length === 0 ? `
                                        <tr><td colspan="8" class="empty-msg">Aucun projet d'ingénierie</td></tr>
                                    ` : projetsIng.map((p, i) => `
                                        <tr>
                                            <td><strong>${p.ordre || '-'}</strong></td>
                                            <td class="td-wrap">${p.designation || '-'}</td>
                                            <td>${p.posteTechnique || '-'}</td>
                                            <td>${p.responsable || '-'}</td>
                                            <td class="center">${p.duree || '-'}</td>
                                            <td class="td-wrap td-commentaire-full">${p.commentaire || '-'}</td>
                                            <td class="center">${p.documents?.length ? `📎 ${p.documents.length}` : '-'}</td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editProjetIng(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteProjetIng(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL1.0')}
                </div>
            </div>
        `;
    },

    getStatutProjetLabel(statut) {
        const labels = {
            'planifie': 'Planifié',
            'en_cours': 'En cours',
            'termine': 'Terminé',
            'annule': 'Annulé'
        };
        return labels[statut] || 'Planifié';
    },

    addProjet() {
        this.showProjetModal();
    },

    editProjet(index) {
        this.showProjetModal(index);
    },

    showProjetModal(editIndex = null) {
        const projets = DataManager.data.processus?.projetsCapitalisation?.projets || [];
        const projet = editIndex !== null ? projets[editIndex] : null;
        const travaux = this.getTravauxImportes();

        const html = `
            <div class="overlay-modal" id="projetModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>${projet ? 'Modifier le projet' : 'Ajouter un projet'}</h3>
                        <button class="close-btn" onclick="document.getElementById('projetModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>Ordre (N° OT)</label>
                                <div class="input-with-btn">
                                    <input type="text" id="projetOrdre" class="form-control" value="${projet?.ordre || ''}"
                                        placeholder="N° OT (optionnel)">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.ouvrirRechercheTravaux('projet')">
                                        🔍 Rechercher
                                    </button>
                                </div>
                                <small class="form-hint">Laissez vide ou cliquez sur Rechercher pour sélectionner un travail</small>
                            </div>
                            <div class="form-group">
                                <label>Désignation</label>
                                <input type="text" id="projetDesignation" class="form-control" value="${projet?.designation || ''}" placeholder="Description du travail">
                            </div>
                            <div class="form-group">
                                <label>Poste technique</label>
                                <input type="text" id="projetPosteTechnique" class="form-control" value="${projet?.posteTechnique || ''}" placeholder="Équipement/Localisation">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="projetResponsable" class="form-control" value="${projet?.responsable || ''}">
                            </div>
                            <div class="form-group">
                                <label>Durée (heures)</label>
                                <input type="text" id="projetDuree" class="form-control" value="${projet?.duree || ''}" placeholder="Ex: 8h">
                            </div>
                            <div class="form-group full-width">
                                <label>Commentaire</label>
                                <textarea id="projetCommentaire" class="form-control" rows="2">${projet?.commentaire || ''}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>Documents / Photos</label>
                                <div class="documents-list" id="projetDocuments">
                                    ${(projet?.documents || []).map((doc, i) => `
                                        <div class="document-item">
                                            <span>📎 ${doc}</span>
                                            <button type="button" class="btn-icon danger" onclick="ScreenPreparation.removeDocument('projet', ${i})">✕</button>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-document">
                                    <input type="text" id="projetNewDoc" class="form-control" placeholder="Chemin ou nom du fichier">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.addDocument('projet')">+ Ajouter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('projetModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveProjet(${editIndex})">${projet ? 'Enregistrer' : 'Ajouter'}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Stocker les documents temporairement
        this.tempDocuments = { projet: projet?.documents || [] };
    },

    saveProjet(editIndex = null) {
        const ordre = document.getElementById('projetOrdre').value.trim();
        const designation = document.getElementById('projetDesignation').value.trim();
        const posteTechnique = document.getElementById('projetPosteTechnique').value.trim();
        const responsable = document.getElementById('projetResponsable').value.trim();
        const duree = document.getElementById('projetDuree').value.trim();
        const commentaire = document.getElementById('projetCommentaire').value.trim();

        // OT n'est plus obligatoire
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.projetsCapitalisation) DataManager.data.processus.projetsCapitalisation = { projets: [], capitalisation: [] };

        const projet = {
            ordre: ordre || '',
            designation,
            posteTechnique,
            responsable,
            duree,
            commentaire,
            documents: this.tempDocuments?.projet || [],
            dateCreation: new Date().toISOString()
        };

        if (editIndex !== null && editIndex >= 0) {
            DataManager.data.processus.projetsCapitalisation.projets[editIndex] = projet;
        } else {
            DataManager.data.processus.projetsCapitalisation.projets.push(projet);
        }

        DataManager.saveToStorage();
        document.getElementById('projetModal').remove();
        this.refresh();
        App.showToast(editIndex !== null ? 'Projet modifié' : 'Projet ajouté', 'success');
    },

    deleteProjet(index) {
        if (confirm('Supprimer ce projet ?')) {
            DataManager.data.processus.projetsCapitalisation.projets.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Projet supprimé', 'success');
        }
    },

    addCapitalisation() {
        this.showCapitalisationModal();
    },

    editCapitalisation(index) {
        this.showCapitalisationModal(index);
    },

    showCapitalisationModal(editIndex = null) {
        const capitalisation = DataManager.data.processus?.projetsCapitalisation?.capitalisation || [];
        const item = editIndex !== null ? capitalisation[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="capitalisationModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier la capitalisation' : 'Ajouter une capitalisation'}</h3>
                        <button class="close-btn" onclick="document.getElementById('capitalisationModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>Ordre (N° OT)</label>
                                <div class="input-with-btn">
                                    <input type="text" id="capOrdre" class="form-control" value="${item?.ordre || ''}"
                                        placeholder="N° OT (optionnel)">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.ouvrirRechercheTravaux('cap')">
                                        🔍 Rechercher
                                    </button>
                                </div>
                                <small class="form-hint">Laissez vide ou cliquez sur Rechercher pour sélectionner un travail</small>
                            </div>
                            <div class="form-group">
                                <label>Désignation</label>
                                <input type="text" id="capDesignation" class="form-control" value="${item?.designation || ''}" placeholder="Description du travail">
                            </div>
                            <div class="form-group">
                                <label>Poste technique</label>
                                <input type="text" id="capPosteTechnique" class="form-control" value="${item?.posteTechnique || ''}" placeholder="Équipement/Localisation">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="capResponsable" class="form-control" value="${item?.responsable || ''}">
                            </div>
                            <div class="form-group">
                                <label>Durée (heures)</label>
                                <input type="text" id="capDuree" class="form-control" value="${item?.duree || ''}" placeholder="Ex: 8h">
                            </div>
                            <div class="form-group full-width">
                                <label>Commentaire</label>
                                <textarea id="capCommentaire" class="form-control" rows="2">${item?.commentaire || ''}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>Documents / Photos</label>
                                <div class="documents-list" id="capDocuments">
                                    ${(item?.documents || []).map((doc, i) => `
                                        <div class="document-item">
                                            <span>📎 ${doc}</span>
                                            <button type="button" class="btn-icon danger" onclick="ScreenPreparation.removeDocument('cap', ${i})">✕</button>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-document">
                                    <input type="text" id="capNewDoc" class="form-control" placeholder="Chemin ou nom du fichier">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.addDocument('cap')">+ Ajouter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('capitalisationModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveCapitalisation(${editIndex})">${item ? 'Enregistrer' : 'Ajouter'}</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Stocker les documents temporairement
        if (!this.tempDocuments) this.tempDocuments = {};
        this.tempDocuments.cap = item?.documents || [];
    },

    saveCapitalisation(editIndex = null) {
        const ordre = document.getElementById('capOrdre').value.trim();
        const designation = document.getElementById('capDesignation').value.trim();
        const posteTechnique = document.getElementById('capPosteTechnique').value.trim();
        const responsable = document.getElementById('capResponsable').value.trim();
        const duree = document.getElementById('capDuree').value.trim();
        const commentaire = document.getElementById('capCommentaire').value.trim();

        // OT n'est plus obligatoire
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.projetsCapitalisation) DataManager.data.processus.projetsCapitalisation = { projets: [], capitalisation: [] };

        const item = {
            ordre: ordre || '',
            designation,
            posteTechnique,
            responsable,
            duree,
            commentaire,
            documents: this.tempDocuments?.cap || [],
            dateCreation: new Date().toISOString()
        };

        if (editIndex !== null && editIndex >= 0) {
            DataManager.data.processus.projetsCapitalisation.capitalisation[editIndex] = item;
        } else {
            DataManager.data.processus.projetsCapitalisation.capitalisation.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('capitalisationModal').remove();
        this.refresh();
        App.showToast(editIndex !== null ? 'Capitalisation modifiée' : 'Capitalisation ajoutée', 'success');
    },

    deleteCapitalisation(index) {
        if (confirm('Supprimer cette capitalisation ?')) {
            DataManager.data.processus.projetsCapitalisation.capitalisation.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Capitalisation supprimée', 'success');
        }
    },

    // ==========================================
    // Recherche de travaux pour Projets/Capitalisation
    // ==========================================

    rechercheTravauxTarget: null, // 'projet', 'cap', ou 'ping'
    rechercheTravauxFiltre: '',

    ouvrirRechercheTravaux(target) {
        this.rechercheTravauxTarget = target;
        this.rechercheTravauxFiltre = '';
        const travaux = this.getTravauxImportes();

        if (travaux.length === 0) {
            App.showToast('Aucun travail importé. Importez des données d\'abord.', 'warning');
            return;
        }

        const html = `
            <div class="overlay-modal" id="rechercheTravauxModal" style="z-index: 10001;">
                <div class="overlay-box" style="max-width: 900px; max-height: 80vh;">
                    <div class="overlay-header">
                        <h3>🔍 Rechercher un travail</h3>
                        <button class="close-btn" onclick="document.getElementById('rechercheTravauxModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body" style="padding: 15px;">
                        <div class="search-bar" style="margin-bottom: 15px;">
                            <input type="text" id="rechercheTravailInput" class="form-control"
                                   placeholder="Rechercher par OT, description, poste technique..."
                                   oninput="ScreenPreparation.filtrerTravauxRecherche(this.value)"
                                   autofocus>
                        </div>
                        <div class="table-container" style="max-height: 50vh; overflow-y: auto;">
                            <table class="data-table" id="tableRechercheTravaux">
                                <thead>
                                    <tr>
                                        <th style="width: 100px;">OT</th>
                                        <th>Description</th>
                                        <th style="width: 150px;">Poste technique</th>
                                        <th style="width: 100px;">Discipline</th>
                                        <th style="width: 80px;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderListeTravauxRecherche(travaux)}
                                </tbody>
                            </table>
                        </div>
                        <div style="margin-top: 10px; color: var(--text-light); font-size: 0.85rem;">
                            ${travaux.length} travaux disponibles
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('rechercheTravailInput').focus();
    },

    renderListeTravauxRecherche(travaux, filtre = '') {
        const filtreLC = filtre.toLowerCase();
        const travauxFiltres = filtre
            ? travaux.filter(t =>
                (t.ot || '').toLowerCase().includes(filtreLC) ||
                (t.description || '').toLowerCase().includes(filtreLC) ||
                (t.posteTechnique || '').toLowerCase().includes(filtreLC) ||
                (t.discipline || '').toLowerCase().includes(filtreLC)
            )
            : travaux;

        // Limiter à 100 résultats pour la performance
        const travauxAffiches = travauxFiltres.slice(0, 100);

        if (travauxAffiches.length === 0) {
            return '<tr><td colspan="5" class="empty-msg">Aucun travail trouvé</td></tr>';
        }

        return travauxAffiches.map(t => `
            <tr class="clickable" onclick="ScreenPreparation.selectionnerTravail('${t.ot}', '${(t.description || '').replace(/'/g, "\\'")}', '${(t.posteTechnique || '').replace(/'/g, "\\'")}')">
                <td><strong>${t.ot || '-'}</strong></td>
                <td>${(t.description || '-').substring(0, 60)}${(t.description || '').length > 60 ? '...' : ''}</td>
                <td>${t.posteTechnique || '-'}</td>
                <td>${t.discipline || '-'}</td>
                <td class="center">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); ScreenPreparation.selectionnerTravail('${t.ot}', '${(t.description || '').replace(/'/g, "\\'")}', '${(t.posteTechnique || '').replace(/'/g, "\\'")}')">
                        Choisir
                    </button>
                </td>
            </tr>
        `).join('') + (travauxFiltres.length > 100 ? `<tr><td colspan="5" class="center" style="color: var(--text-light);">... et ${travauxFiltres.length - 100} autres résultats. Affinez votre recherche.</td></tr>` : '');
    },

    filtrerTravauxRecherche(filtre) {
        this.rechercheTravauxFiltre = filtre;
        const travaux = this.getTravauxImportes();
        const tbody = document.querySelector('#tableRechercheTravaux tbody');
        if (tbody) {
            tbody.innerHTML = this.renderListeTravauxRecherche(travaux, filtre);
        }
    },

    selectionnerTravail(ot, description, posteTechnique) {
        const target = this.rechercheTravauxTarget;

        // Remplir les champs selon le formulaire cible
        if (target === 'projet') {
            document.getElementById('projetOrdre').value = ot || '';
            document.getElementById('projetDesignation').value = description || '';
            document.getElementById('projetPosteTechnique').value = posteTechnique || '';
        } else if (target === 'cap') {
            document.getElementById('capOrdre').value = ot || '';
            document.getElementById('capDesignation').value = description || '';
            document.getElementById('capPosteTechnique').value = posteTechnique || '';
        } else if (target === 'ping') {
            document.getElementById('pingOrdre').value = ot || '';
            document.getElementById('pingDesignation').value = description || '';
            document.getElementById('pingPosteTechnique').value = posteTechnique || '';
        }

        // Fermer le modal de recherche
        const modal = document.getElementById('rechercheTravauxModal');
        if (modal) modal.remove();

        App.showToast('Travail sélectionné', 'success');
    },

    // ==========================================
    // PL2.0 - Scope des travaux par secteurs
    // ==========================================

    // Liste des secteurs fixes
    secteursUsine: [
        { id: 'convertisseur', nom: 'Convertisseur', icon: '🔥' },
        { id: 'fosse', nom: 'Fosse', icon: '🕳️' },
        { id: 'halle1', nom: 'Halle 1', icon: '🏭' },
        { id: 'halle2', nom: 'Halle 2', icon: '🏭' },
        { id: 'pont_roulant', nom: 'Pont roulant', icon: '🏗️' },
        { id: 'coulee_continue', nom: 'Coulée continue - Arc de coulée', icon: '⚙️' },
        { id: 'expedition', nom: 'Expédition', icon: '🚚' },
        { id: 'bassin_tour', nom: 'Bassin et tour d\'eau', icon: '💧' }
    ],

    renderDetailScopeSecteurs() {
        const travaux = this.getTravauxImportes();
        const configSecteurs = DataManager.data.processus?.scopeSecteurs || {};
        const secteurActif = this.secteurActifScope || null;

        // Extraire tous les postes techniques uniques des travaux importés
        const postesTechniques = this.getPostesTechniquesUniques(travaux);

        // Calculer les stats pour chaque secteur
        const statsParSecteur = this.calculerStatsParSecteur(travaux, configSecteurs);

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL2.0', 'Scope des travaux par secteurs')}

                <div class="detail-body planifier-body">
                    ${travaux.length === 0 ? `
                        <div class="detail-card planifier-card">
                            <div class="empty-state">
                                <p>Aucun travail importé. Importez des données pour configurer les secteurs.</p>
                                <a href="#" onclick="App.navigateTo('import'); return false;" class="btn btn-primary">
                                    Importer des données
                                </a>
                            </div>
                        </div>
                    ` : `
                        <!-- Info -->
                        <div class="detail-card planifier-card info-card">
                            <p class="info-text">
                                📋 Configurez les équipements pour chaque secteur. Cliquez sur <strong>Configurer</strong> pour associer les équipements.
                                <br><small>Note: Un équipement ne peut appartenir qu'à un seul secteur.</small>
                            </p>
                        </div>

                        <!-- Cartes des secteurs -->
                        <div class="detail-card planifier-card">
                            <h3>📊 Secteurs de l'usine</h3>
                            <div class="secteurs-grid secteurs-grid-fixed">
                                ${this.secteursUsine.map(secteur => {
                                    const stats = statsParSecteur[secteur.id] || { count: 0, heures: 0, postes: 0 };
                                    const isActive = secteurActif === secteur.id;
                                    return `
                                        <div class="secteur-card ${isActive ? 'secteur-card-active' : ''}" data-secteur="${secteur.id}">
                                            <div class="secteur-header">
                                                <span class="secteur-icon">${secteur.icon}</span>
                                                <span class="secteur-nom">${secteur.nom}</span>
                                            </div>
                                            <div class="secteur-stats">
                                                <div class="secteur-stat">
                                                    <span class="stat-value">${stats.count}</span>
                                                    <span class="stat-label">travaux</span>
                                                </div>
                                                <div class="secteur-stat">
                                                    <span class="stat-value">${stats.heures}</span>
                                                    <span class="stat-label">heures</span>
                                                </div>
                                                <div class="secteur-stat">
                                                    <span class="stat-value">${stats.postes}</span>
                                                    <span class="stat-label">équip.</span>
                                                </div>
                                            </div>
                                            <div class="secteur-actions">
                                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.configurerSecteur('${secteur.id}')">
                                                    ⚙️ Configurer
                                                </button>
                                                <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}" onclick="ScreenPreparation.voirTravauxSecteur('${secteur.id}')">
                                                    👁️ Voir
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Tableau des travaux du secteur sélectionné -->
                        <div class="detail-card planifier-card">
                            <div class="card-header-flex">
                                <h3>📋 ${secteurActif ? `Travaux - ${this.getNomSecteur(secteurActif)}` : 'Sélectionnez un secteur pour voir les travaux'}</h3>
                                ${secteurActif ? `
                                    <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.voirTravauxSecteur(null)">
                                        Voir tous
                                    </button>
                                ` : ''}
                            </div>

                            <div class="table-container" style="max-height: 400px;">
                                <table class="planifier-table" id="tableTravauxSecteur">
                                    <thead>
                                        <tr>
                                            <th>OT</th>
                                            <th>Description</th>
                                            <th>Équipement</th>
                                            <th>Discipline</th>
                                            <th>Heures</th>
                                            <th>Priorité</th>
                                            <th>Commentaire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${this.renderTravauxSecteur(travaux, configSecteurs, secteurActif)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `}

                    ${this.renderPlanifierStatut('PL2.0')}
                </div>
            </div>
        `;
    },

    getNomSecteur(secteurId) {
        const secteur = this.secteursUsine.find(s => s.id === secteurId);
        return secteur ? secteur.nom : secteurId;
    },

    getPostesTechniquesUniques(travaux) {
        const postes = new Set();
        travaux.forEach(t => {
            // Utiliser le champ 'equipement' qui correspond à la colonne Équipement
            const poste = t.equipement;
            if (poste && poste.trim()) postes.add(poste.trim());
        });
        return Array.from(postes).sort();
    },

    calculerStatsParSecteur(travaux, configSecteurs) {
        const stats = {};

        this.secteursUsine.forEach(secteur => {
            const postesAssocies = configSecteurs[secteur.id] || [];
            const travauxSecteur = travaux.filter(t => {
                const poste = t.equipement;
                return poste && postesAssocies.includes(poste.trim());
            });

            const heuresTotal = travauxSecteur.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0);

            stats[secteur.id] = {
                count: travauxSecteur.length,
                heures: Math.round(heuresTotal * 100) / 100, // Arrondi à 2 décimales
                postes: postesAssocies.length
            };
        });

        return stats;
    },

    renderTravauxSecteur(travaux, configSecteurs, secteurActif) {
        let travauxFiltres = travaux;

        if (secteurActif) {
            const postesAssocies = configSecteurs[secteurActif] || [];
            travauxFiltres = travaux.filter(t => {
                const poste = t.equipement;
                return poste && postesAssocies.includes(poste.trim());
            });
        }

        if (travauxFiltres.length === 0) {
            return `<tr><td colspan="7" class="empty-msg">${secteurActif ? 'Aucun travail pour ce secteur. Configurez les équipements.' : 'Sélectionnez un secteur pour voir les travaux.'}</td></tr>`;
        }

        const travauxAffichés = travauxFiltres.slice(0, 100);
        let html = travauxAffichés.map((t, index) => {
            const travailIndex = travaux.findIndex(tr => tr.ot === t.ot);
            return `
            <tr>
                <td><strong>${t.ot || '-'}</strong></td>
                <td>${(t.description || '-').substring(0, 50)}${(t.description || '').length > 50 ? '...' : ''}</td>
                <td>${t.equipement || '-'}</td>
                <td>${t.discipline || '-'}</td>
                <td class="center">${t.estimationHeures || '-'}</td>
                <td>${t.priorite || '-'}</td>
                <td class="commentaire-cell">
                    <div class="commentaire-wrapper">
                        <span class="commentaire-text">${(t.commentaire || '').substring(0, 30)}${(t.commentaire || '').length > 30 ? '...' : ''}</span>
                        <button class="btn-icon btn-edit-comment" onclick="ScreenPreparation.editCommentaireTravail(${travailIndex})" title="Modifier le commentaire">✏️</button>
                    </div>
                </td>
            </tr>
        `}).join('');

        if (travauxFiltres.length > 100) {
            html += `<tr><td colspan="7" class="more-info">... et ${travauxFiltres.length - 100} autres travaux</td></tr>`;
        }

        return html;
    },

    editCommentaireTravail(index) {
        const travaux = this.getTravauxImportes();
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
                        <button class="btn btn-primary" onclick="ScreenPreparation.sauvegarderCommentaireTravail(${index})">Enregistrer</button>
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
        this.refresh();
        App.showToast('Commentaire enregistré', 'success');
    },

    voirTravauxSecteur(secteurId) {
        this.secteurActifScope = secteurId;
        this.refresh();
    },

    configurerSecteur(secteurId) {
        const travaux = this.getTravauxImportes();
        const postesTechniques = this.getPostesTechniquesUniques(travaux);
        const configSecteurs = DataManager.data.processus?.scopeSecteurs || {};
        const postesActuels = configSecteurs[secteurId] || [];
        const secteur = this.secteursUsine.find(s => s.id === secteurId);

        // Trouver les postes déjà utilisés par d'autres secteurs
        const postesUtilises = {};
        Object.entries(configSecteurs).forEach(([sid, postes]) => {
            if (sid !== secteurId) {
                postes.forEach(p => {
                    postesUtilises[p] = sid;
                });
            }
        });

        const html = `
            <div class="overlay-modal" id="configureSecteurModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>${secteur.icon} Configurer ${secteur.nom}</h3>
                        <button class="close-btn" onclick="document.getElementById('configureSecteurModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <p class="modal-desc">Sélectionnez les équipements qui appartiennent à ce secteur:</p>

                        <div class="postes-filter">
                            <input type="text" id="filtrePostes" class="form-control" placeholder="🔍 Filtrer les équipements..." oninput="ScreenPreparation.filtrerPostesModal()">
                        </div>

                        <div class="postes-selection" id="postesSelectionList">
                            ${postesTechniques.map(poste => {
                                const isSelected = postesActuels.includes(poste);
                                const usedBy = postesUtilises[poste];
                                const isDisabled = usedBy ? true : false;
                                const usedByName = usedBy ? this.getNomSecteur(usedBy) : '';

                                return `
                                    <label class="poste-item ${isDisabled ? 'poste-disabled' : ''} ${isSelected ? 'poste-selected' : ''}" data-poste="${poste.toLowerCase()}">
                                        <input type="checkbox"
                                            value="${poste}"
                                            ${isSelected ? 'checked' : ''}
                                            ${isDisabled ? 'disabled' : ''}
                                            onchange="ScreenPreparation.togglePosteSelection(this)">
                                        <span class="poste-nom">${poste}</span>
                                        ${isDisabled ? `<span class="poste-used">Utilisé par: ${usedByName}</span>` : ''}
                                    </label>
                                `;
                            }).join('')}
                        </div>

                        <div class="postes-summary">
                            <span id="postesCount">${postesActuels.length}</span> équipement(s) sélectionné(s)
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('configureSecteurModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.sauvegarderConfigSecteur('${secteurId}')">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    filtrerPostesModal() {
        const filtre = document.getElementById('filtrePostes').value.toLowerCase();
        const items = document.querySelectorAll('#postesSelectionList .poste-item');
        items.forEach(item => {
            const poste = item.dataset.poste;
            item.style.display = poste.includes(filtre) ? '' : 'none';
        });
    },

    togglePosteSelection(checkbox) {
        const label = checkbox.closest('.poste-item');
        if (checkbox.checked) {
            label.classList.add('poste-selected');
        } else {
            label.classList.remove('poste-selected');
        }
        this.updatePostesCount();
    },

    updatePostesCount() {
        const count = document.querySelectorAll('#postesSelectionList input[type="checkbox"]:checked:not(:disabled)').length;
        document.getElementById('postesCount').textContent = count;
    },

    sauvegarderConfigSecteur(secteurId) {
        const checkboxes = document.querySelectorAll('#postesSelectionList input[type="checkbox"]:checked:not(:disabled)');
        const postesSelectionnes = Array.from(checkboxes).map(cb => cb.value);

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.scopeSecteurs) DataManager.data.processus.scopeSecteurs = {};

        DataManager.data.processus.scopeSecteurs[secteurId] = postesSelectionnes;
        DataManager.saveToStorage();

        document.getElementById('configureSecteurModal').remove();
        this.refresh();
        App.showToast(`${postesSelectionnes.length} équipement(s) configuré(s) pour ce secteur`, 'success');
    },

    // ==========================================
    // PL3.0 - TPAA (Travaux Préparatoires Avant Arrêt)
    // ==========================================

    // État du tri et recherche TPAA
    tpaaFiltre: '',
    tpaaTri: 'date', // 'date' ou 'entreprise'
    tpaaTriOrder: 'asc',

    renderDetailTPAA() {
        const travaux = this.getTravauxImportes();
        // Filtrer les travaux contenant "TPAA" dans la description
        let travauxTPAA = travaux.filter(t =>
            t.description && t.description.toUpperCase().includes('TPAA')
        );

        // Récupérer les données TPAA sauvegardées (ajustements de dates, statuts, commentaires)
        const tpaaData = DataManager.data.processus?.tpaa || {};

        // Date de début d'arrêt (T-0) pour calculer les dates (depuis D1.0 - Définition de l'arrêt)
        // La date est stockée dans DataManager.data.processus.dateArret
        const dateDebutArret = DataManager.data.processus?.dateArret;

        // Appliquer le filtre de recherche
        if (this.tpaaFiltre) {
            const filtre = this.tpaaFiltre.toLowerCase();
            travauxTPAA = travauxTPAA.filter(t =>
                (t.ot && t.ot.toLowerCase().includes(filtre)) ||
                (t.description && t.description.toLowerCase().includes(filtre)) ||
                (t.entreprise && t.entreprise.toLowerCase().includes(filtre)) ||
                (t.operation && t.operation.toLowerCase().includes(filtre))
            );
        }

        // Calculer les dates pour le tri
        // Utiliser un ID unique basé sur OT + index pour gérer les doublons d'OT
        const travauxAvecDates = travauxTPAA.map((t, idx) => {
            // Créer un ID unique pour chaque ligne (OT + index dans la liste des travaux originale)
            const travailIndex = travaux.findIndex(tr => tr === t);
            const uniqueId = `${t.ot}_${travailIndex}`;
            const tpaaInfo = tpaaData[uniqueId] || {};
            const semainesAvant = this.extraireSemainesTPAA(t.description);
            const dateCalculee = this.calculerDateTPAA(dateDebutArret, semainesAvant, tpaaInfo.ajustementJours || 0);
            return { ...t, dateCalculee, semainesAvant, tpaaInfo, uniqueId, travailIndex };
        });

        // Appliquer le tri
        travauxAvecDates.sort((a, b) => {
            let comparison = 0;
            if (this.tpaaTri === 'date') {
                // Trier par date (semaines avant l'arrêt)
                const semainesA = a.semainesAvant !== null ? a.semainesAvant : -9999;
                const semainesB = b.semainesAvant !== null ? b.semainesAvant : -9999;
                comparison = semainesB - semainesA; // Plus négatif = plus tôt
            } else if (this.tpaaTri === 'entreprise') {
                const entA = (a.entreprise || '').toLowerCase();
                const entB = (b.entreprise || '').toLowerCase();
                comparison = entA.localeCompare(entB);
            }
            return this.tpaaTriOrder === 'asc' ? comparison : -comparison;
        });

        // Extraire les entreprises uniques pour le filtre
        const entreprisesUniques = [...new Set(travaux
            .filter(t => t.description && t.description.toUpperCase().includes('TPAA'))
            .map(t => t.entreprise)
            .filter(e => e))].sort();

        // Stats (sur les données non filtrées)
        const allTPAA = travaux.filter(t => t.description && t.description.toUpperCase().includes('TPAA'));
        const stats = {
            total: allTPAA.length,
            aFaire: allTPAA.filter(t => this.getTPAAStatut(t.ot, tpaaData) === 'a_faire').length,
            enCours: allTPAA.filter(t => this.getTPAAStatut(t.ot, tpaaData) === 'en_cours').length,
            termine: allTPAA.filter(t => this.getTPAAStatut(t.ot, tpaaData) === 'termine').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL3.0', 'TPAA - Travaux Préparatoires Avant Arrêt')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            📌 Les TPAA sont les travaux contenant <strong>"TPAA (-4)"</strong> ou <strong>"TPAA (-15)"</strong> dans la description.
                            La date est calculée automatiquement: <strong>T-0</strong> moins le nombre de <strong>semaines</strong> indiqué (ex: TPAA(-4) = 4 semaines avant T-0).
                            ${!dateDebutArret ? '<br><span style="color: var(--warning);">⚠️ Définissez la date de début d\'arrêt (T-0) dans D1.0 pour calculer les dates automatiquement.</span>' : `<br><span style="color: var(--success);">✓ Date de début d'arrêt (T-0): <strong>${new Date(dateDebutArret).toLocaleDateString('fr-CA')}</strong></span>`}
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Total TPAA</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.aFaire}</span>
                                <span class="stat-label">À faire</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.enCours}</span>
                                <span class="stat-label">En cours</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.termine}</span>
                                <span class="stat-label">Terminés</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>🔧 Liste TPAA (${travauxAvecDates.length}${this.tpaaFiltre ? ` / ${allTPAA.length}` : ''})</h3>
                        </div>

                        <!-- Barre de recherche et tri -->
                        <div class="tpaa-filters">
                            <div class="search-box">
                                <input type="text" id="tpaaSearch" class="form-control"
                                    placeholder="🔍 Rechercher (OT, description, entreprise...)"
                                    value="${this.tpaaFiltre}"
                                    oninput="ScreenPreparation.filtrerTPAA(this.value)">
                                ${this.tpaaFiltre ? `<button class="btn-clear" onclick="ScreenPreparation.filtrerTPAA('')">✕</button>` : ''}
                            </div>
                            <div class="sort-buttons">
                                <span class="sort-label">Trier par:</span>
                                <button class="btn btn-sm ${this.tpaaTri === 'date' ? 'btn-primary' : 'btn-outline'}"
                                    onclick="ScreenPreparation.trierTPAA('date')">
                                    📅 Date ${this.tpaaTri === 'date' ? (this.tpaaTriOrder === 'asc' ? '↑' : '↓') : ''}
                                </button>
                                <button class="btn btn-sm ${this.tpaaTri === 'entreprise' ? 'btn-primary' : 'btn-outline'}"
                                    onclick="ScreenPreparation.trierTPAA('entreprise')">
                                    🏢 Entreprise ${this.tpaaTri === 'entreprise' ? (this.tpaaTriOrder === 'asc' ? '↑' : '↓') : ''}
                                </button>
                            </div>
                        </div>

                        <div class="table-container" style="max-height: 500px;">
                            <table class="planifier-table" id="tpaaTable">
                                <thead>
                                    <tr>
                                        <th>OT Lié</th>
                                        <th>Description</th>
                                        <th>Opération</th>
                                        <th>Date prévue</th>
                                        <th>Entreprise</th>
                                        <th>Statut</th>
                                        <th>Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${travauxAvecDates.length === 0 ? `
                                        <tr><td colspan="7" class="empty-msg">${this.tpaaFiltre ? 'Aucun résultat pour cette recherche' : 'Aucun travail avec "TPAA" dans la description'}</td></tr>
                                    ` : travauxAvecDates.map((t) => {
                                        const statut = t.tpaaInfo.statut || 'a_faire';

                                        return `
                                        <tr class="${statut === 'termine' ? 'row-success' : ''}" data-unique-id="${t.uniqueId}">
                                            <td><strong>${t.ot || '-'}</strong></td>
                                            <td title="${t.description || ''}">${(t.description || '-').substring(0, 40)}${(t.description || '').length > 40 ? '...' : ''}</td>
                                            <td>${t.operation || '-'}</td>
                                            <td class="date-cell">
                                                <div class="date-ajustable">
                                                    <button class="btn-icon btn-sm btn-week" onclick="ScreenPreparation.ajusterDateTPAA('${t.uniqueId}', -7)" title="-7 jours">◀◀</button>
                                                    <button class="btn-icon btn-sm btn-day" onclick="ScreenPreparation.ajusterDateTPAA('${t.uniqueId}', -1)" title="-1 jour">◀</button>
                                                    <span class="date-value">${t.dateCalculee || '-'}</span>
                                                    <button class="btn-icon btn-sm btn-day" onclick="ScreenPreparation.ajusterDateTPAA('${t.uniqueId}', 1)" title="+1 jour">▶</button>
                                                    <button class="btn-icon btn-sm btn-week" onclick="ScreenPreparation.ajusterDateTPAA('${t.uniqueId}', 7)" title="+7 jours">▶▶</button>
                                                    ${t.tpaaInfo.ajustementJours ? `<span class="ajustement-badge">${t.tpaaInfo.ajustementJours > 0 ? '+' : ''}${t.tpaaInfo.ajustementJours}j</span>` : ''}
                                                </div>
                                            </td>
                                            <td>${t.entreprise || '-'}</td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updateTPAAStatut('${t.uniqueId}', this.value)">
                                                    <option value="a_faire" ${statut === 'a_faire' ? 'selected' : ''}>À faire</option>
                                                    <option value="en_cours" ${statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                                    <option value="termine" ${statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                                </select>
                                            </td>
                                            <td class="commentaire-cell">
                                                <div class="commentaire-wrapper">
                                                    <span class="commentaire-text">${(t.commentaire || '').substring(0, 20)}${(t.commentaire || '').length > 20 ? '...' : ''}</span>
                                                    <button class="btn-icon btn-edit-comment" onclick="ScreenPreparation.editCommentaireTravail(${t.travailIndex})" title="Modifier">✏️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL3.0')}
                </div>
            </div>
        `;
    },

    filtrerTPAA(valeur) {
        this.tpaaFiltre = valeur;
        this.refresh();
    },

    trierTPAA(champ) {
        if (this.tpaaTri === champ) {
            // Inverser l'ordre si même champ
            this.tpaaTriOrder = this.tpaaTriOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.tpaaTri = champ;
            this.tpaaTriOrder = 'asc';
        }
        this.refresh();
    },

    // Extraire le nombre de semaines avant l'arrêt depuis la description
    // Formats supportés: "TPAA (-15)", "TPAA(-4)", "TPAA -6", "TPAA (-15 à -2)", "TPAA (4)", etc.
    extraireSemainesTPAA(description) {
        if (!description) return null;

        // Pattern 1: TPAA suivi de parenthèses avec un ou deux nombres - ex: TPAA (-15 à -2) ou TPAA (-4)
        const matchRange = description.match(/TPAA\s*\(\s*(-?\d+)\s*(?:[àa]\s*(-?\d+))?\s*\)/i);
        if (matchRange) {
            let semaines = parseInt(matchRange[1]);
            // S'assurer que c'est négatif (semaines AVANT l'arrêt)
            if (semaines > 0) semaines = -semaines;
            return semaines;
        }

        // Pattern 2: TPAA suivi directement d'un nombre - ex: TPAA -6 ou TPAA-4
        const matchDirect = description.match(/TPAA\s*(-?\d+)/i);
        if (matchDirect) {
            let semaines = parseInt(matchDirect[1]);
            // S'assurer que c'est négatif (semaines AVANT l'arrêt)
            if (semaines > 0) semaines = -semaines;
            return semaines;
        }

        return null;
    },

    // Calculer la date prévue basée sur la date de début d'arrêt et les semaines
    calculerDateTPAA(dateDebutArret, semainesAvant, ajustementJours) {
        if (!dateDebutArret || semainesAvant === null) return null;

        const dateDebut = new Date(dateDebutArret);
        if (isNaN(dateDebut.getTime())) return null;

        // semainesAvant est négatif (ex: -15 signifie 15 semaines avant)
        // Convertir les semaines en jours (x7) puis ajouter l'ajustement en jours
        const joursFromSemaines = semainesAvant * 7;
        const totalJours = joursFromSemaines + (ajustementJours || 0);
        const datePrevue = new Date(dateDebut);
        datePrevue.setDate(datePrevue.getDate() + totalJours);

        return datePrevue.toLocaleDateString('fr-CA');
    },

    getTPAAStatut(uniqueId, tpaaData) {
        return tpaaData[uniqueId]?.statut || 'a_faire';
    },

    ajusterDateTPAA(uniqueId, jours) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.tpaa) DataManager.data.processus.tpaa = {};

        if (!DataManager.data.processus.tpaa[uniqueId]) {
            DataManager.data.processus.tpaa[uniqueId] = {};
        }

        const currentAjustement = DataManager.data.processus.tpaa[uniqueId].ajustementJours || 0;
        DataManager.data.processus.tpaa[uniqueId].ajustementJours = currentAjustement + jours;

        DataManager.saveToStorage();
        this.refresh();
    },

    updateTPAAStatut(uniqueId, statut) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.tpaa) DataManager.data.processus.tpaa = {};

        if (!DataManager.data.processus.tpaa[uniqueId]) {
            DataManager.data.processus.tpaa[uniqueId] = {};
        }

        DataManager.data.processus.tpaa[uniqueId].statut = statut;
        DataManager.saveToStorage();
        this.refresh();
    },

    // ==========================================
    // PL4.0 - Implication du service incendie
    // ==========================================

    renderDetailServiceIncendie() {
        const incendieData = DataManager.data.processus?.serviceIncendie || { interventions: [] };
        const interventions = incendieData.interventions || [];

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL4.0', 'Implication du service incendie')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>🚒 Interventions requises (${interventions.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addIntervention()">
                                + Ajouter
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Zone</th>
                                        <th>Date requise</th>
                                        <th>Permis de feu</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${interventions.length === 0 ? `
                                        <tr><td colspan="7" class="empty-msg">Aucune intervention définie</td></tr>
                                    ` : interventions.map((item, i) => `
                                        <tr>
                                            <td>${item.type || '-'}</td>
                                            <td>${item.description || '-'}</td>
                                            <td>${item.zone || '-'}</td>
                                            <td>${item.dateRequise ? new Date(item.dateRequise).toLocaleDateString('fr-CA') : '-'}</td>
                                            <td class="center">${item.permisFeu ? '✅' : '❌'}</td>
                                            <td>
                                                <span class="status-badge status-${item.statut || 'en_attente'}">${item.statut === 'approuve' ? 'Approuvé' : item.statut === 'refuse' ? 'Refusé' : 'En attente'}</span>
                                            </td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editIntervention(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteIntervention(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL4.0')}
                </div>
            </div>
        `;
    },

    addIntervention() { this.showInterventionModal(); },
    editIntervention(index) { this.showInterventionModal(index); },

    showInterventionModal(editIndex = null) {
        const items = DataManager.data.processus?.serviceIncendie?.interventions || [];
        const item = editIndex !== null ? items[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="interventionModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier' : 'Ajouter'} intervention</h3>
                        <button class="close-btn" onclick="document.getElementById('interventionModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Type *</label>
                            <select id="intType" class="form-control">
                                <option value="Surveillance" ${item?.type === 'Surveillance' ? 'selected' : ''}>Surveillance travaux chauds</option>
                                <option value="Permis de feu" ${item?.type === 'Permis de feu' ? 'selected' : ''}>Permis de feu</option>
                                <option value="Ronde" ${item?.type === 'Ronde' ? 'selected' : ''}>Ronde incendie</option>
                                <option value="Standby" ${item?.type === 'Standby' ? 'selected' : ''}>Standby pompier</option>
                                <option value="Autre" ${item?.type === 'Autre' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="intDesc" class="form-control" rows="2">${item?.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Zone</label>
                            <input type="text" id="intZone" class="form-control" value="${item?.zone || ''}">
                        </div>
                        <div class="form-group">
                            <label>Date requise</label>
                            <input type="date" id="intDate" class="form-control" value="${item?.dateRequise?.split('T')[0] || ''}">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="intPermis" ${item?.permisFeu ? 'checked' : ''}> Permis de feu requis
                            </label>
                        </div>
                        <div class="form-group">
                            <label>Statut</label>
                            <select id="intStatut" class="form-control">
                                <option value="en_attente" ${item?.statut === 'en_attente' ? 'selected' : ''}>En attente</option>
                                <option value="approuve" ${item?.statut === 'approuve' ? 'selected' : ''}>Approuvé</option>
                                <option value="refuse" ${item?.statut === 'refuse' ? 'selected' : ''}>Refusé</option>
                            </select>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('interventionModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveIntervention(${editIndex})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    saveIntervention(editIndex = null) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.serviceIncendie) DataManager.data.processus.serviceIncendie = { interventions: [] };

        const item = {
            type: document.getElementById('intType').value,
            description: document.getElementById('intDesc').value.trim(),
            zone: document.getElementById('intZone').value.trim(),
            dateRequise: document.getElementById('intDate').value,
            permisFeu: document.getElementById('intPermis').checked,
            statut: document.getElementById('intStatut').value
        };

        if (editIndex !== null) {
            DataManager.data.processus.serviceIncendie.interventions[editIndex] = item;
        } else {
            DataManager.data.processus.serviceIncendie.interventions.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('interventionModal').remove();
        this.refresh();
        App.showToast('Intervention enregistrée', 'success');
    },

    deleteIntervention(index) {
        if (confirm('Supprimer ?')) {
            DataManager.data.processus.serviceIncendie.interventions.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    // ==========================================
    // PL5.0 - Projet Ingénierie
    // ==========================================

    renderDetailProjetIngenierie() {
        const projetsIng = DataManager.data.processus?.projetsIngenierie || { items: [] };
        const items = projetsIng.items || [];

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL5.0', 'Projet Ingénierie')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>⚙️ Projets d'ingénierie (${items.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addProjetIng()">
                                + Ajouter
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>N° Projet</th>
                                        <th>Description</th>
                                        <th>Ingénieur resp.</th>
                                        <th>Date livraison</th>
                                        <th>Avancement</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.length === 0 ? `
                                        <tr><td colspan="6" class="empty-msg">Aucun projet d'ingénierie</td></tr>
                                    ` : items.map((p, i) => `
                                        <tr>
                                            <td><strong>${p.numero || '-'}</strong></td>
                                            <td>${p.description || '-'}</td>
                                            <td>${p.ingenieur || '-'}</td>
                                            <td>${p.dateLivraison ? new Date(p.dateLivraison).toLocaleDateString('fr-CA') : '-'}</td>
                                            <td>
                                                <div class="mini-progress">
                                                    <div class="mini-progress-bar" style="width: ${p.avancement || 0}%"></div>
                                                    <span>${p.avancement || 0}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editProjetIng(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteProjetIng(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL5.0')}
                </div>
            </div>
        `;
    },

    addProjetIng() { this.showProjetIngModal(); },
    editProjetIng(index) { this.showProjetIngModal(index); },

    showProjetIngModal(editIndex = null) {
        const items = DataManager.data.processus?.projetsIngenierie?.items || [];
        const item = editIndex !== null ? items[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="projetIngModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier' : 'Ajouter'} projet ingénierie</h3>
                        <button class="close-btn" onclick="document.getElementById('projetIngModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label>Ordre (N° OT)</label>
                                <div class="input-with-btn">
                                    <input type="text" id="pingOrdre" class="form-control" value="${item?.ordre || ''}"
                                        placeholder="N° OT (optionnel)">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.ouvrirRechercheTravaux('ping')">
                                        🔍 Rechercher
                                    </button>
                                </div>
                                <small class="form-hint">Laissez vide ou cliquez sur Rechercher pour sélectionner un travail</small>
                            </div>
                            <div class="form-group">
                                <label>Désignation</label>
                                <input type="text" id="pingDesignation" class="form-control" value="${item?.designation || ''}" placeholder="Description du travail">
                            </div>
                            <div class="form-group">
                                <label>Poste technique</label>
                                <input type="text" id="pingPosteTechnique" class="form-control" value="${item?.posteTechnique || ''}" placeholder="Équipement/Localisation">
                            </div>
                            <div class="form-group">
                                <label>Responsable</label>
                                <input type="text" id="pingResponsable" class="form-control" value="${item?.responsable || ''}">
                            </div>
                            <div class="form-group">
                                <label>Durée (heures)</label>
                                <input type="text" id="pingDuree" class="form-control" value="${item?.duree || ''}" placeholder="Ex: 8h">
                            </div>
                            <div class="form-group full-width">
                                <label>Commentaire</label>
                                <textarea id="pingCommentaire" class="form-control" rows="2">${item?.commentaire || ''}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>Documents / Photos</label>
                                <div class="documents-list" id="pingDocuments">
                                    ${(item?.documents || []).map((doc, i) => `
                                        <div class="document-item">
                                            <span>📎 ${doc}</span>
                                            <button type="button" class="btn-icon danger" onclick="ScreenPreparation.removeDocument('ping', ${i})">✕</button>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="add-document">
                                    <input type="text" id="pingNewDoc" class="form-control" placeholder="Chemin ou nom du fichier">
                                    <button type="button" class="btn btn-sm btn-outline" onclick="ScreenPreparation.addDocument('ping')">+ Ajouter</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('projetIngModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveProjetIng(${editIndex})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Stocker les documents temporairement
        if (!this.tempDocuments) this.tempDocuments = {};
        this.tempDocuments.ping = item?.documents || [];
    },

    saveProjetIng(editIndex = null) {
        const ordre = document.getElementById('pingOrdre').value.trim();
        const designation = document.getElementById('pingDesignation').value.trim();
        const posteTechnique = document.getElementById('pingPosteTechnique').value.trim();
        const responsable = document.getElementById('pingResponsable').value.trim();
        const duree = document.getElementById('pingDuree').value.trim();
        const commentaire = document.getElementById('pingCommentaire').value.trim();

        // OT n'est plus obligatoire
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.projetsIngenierie) DataManager.data.processus.projetsIngenierie = { items: [] };

        const item = {
            ordre: ordre || '',
            designation,
            posteTechnique,
            responsable,
            duree,
            commentaire,
            documents: this.tempDocuments?.ping || [],
            dateCreation: new Date().toISOString()
        };

        if (editIndex !== null) {
            DataManager.data.processus.projetsIngenierie.items[editIndex] = item;
        } else {
            DataManager.data.processus.projetsIngenierie.items.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('projetIngModal').remove();
        this.refresh();
        App.showToast('Projet enregistré', 'success');
    },

    deleteProjetIng(index) {
        if (confirm('Supprimer ?')) {
            DataManager.data.processus.projetsIngenierie.items.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    // ==========================================
    // PL5.0 - VPO (Vérification Pré-Opérationnelle)
    // ==========================================

    renderDetailVPO() {
        const vpoData = DataManager.data.processus?.vpo || { items: [] };
        const items = vpoData.items || [];

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL5.0', 'VPO - Vérification Pré-Opérationnelle')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            📋 Les VPO définissent les vérifications à effectuer <strong>avant la remise en service</strong> des équipements.
                        </p>
                    </div>

                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>✅ Liste VPO (${items.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addVPO()">
                                + Ajouter
                            </button>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Équipement</th>
                                        <th>Vérifications</th>
                                        <th>Responsable</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.length === 0 ? `
                                        <tr><td colspan="5" class="empty-msg">Aucune VPO définie</td></tr>
                                    ` : items.map((v, i) => `
                                        <tr>
                                            <td><strong>${v.equipement || '-'}</strong></td>
                                            <td>${v.verifications || '-'}</td>
                                            <td>${v.responsable || '-'}</td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updateVPOStatut(${i}, this.value)">
                                                    <option value="a_faire" ${v.statut === 'a_faire' ? 'selected' : ''}>À faire</option>
                                                    <option value="en_cours" ${v.statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                                    <option value="complete" ${v.statut === 'complete' ? 'selected' : ''}>Complété</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editVPO(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteVPO(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL5.0')}
                </div>
            </div>
        `;
    },

    addVPO() { this.showVPOModal(); },
    editVPO(index) { this.showVPOModal(index); },

    showVPOModal(editIndex = null) {
        const items = DataManager.data.processus?.vpo?.items || [];
        const item = editIndex !== null ? items[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="vpoModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier' : 'Ajouter'} VPO</h3>
                        <button class="close-btn" onclick="document.getElementById('vpoModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Équipement *</label>
                            <input type="text" id="vpoEquip" class="form-control" value="${item?.equipement || ''}">
                        </div>
                        <div class="form-group">
                            <label>Vérifications à effectuer</label>
                            <textarea id="vpoVerif" class="form-control" rows="4" placeholder="Liste des vérifications...">${item?.verifications || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Responsable</label>
                            <input type="text" id="vpoResp" class="form-control" value="${item?.responsable || ''}">
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('vpoModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveVPO(${editIndex})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    saveVPO(editIndex = null) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.vpo) DataManager.data.processus.vpo = { items: [] };

        const item = {
            equipement: document.getElementById('vpoEquip').value.trim(),
            verifications: document.getElementById('vpoVerif').value.trim(),
            responsable: document.getElementById('vpoResp').value.trim(),
            statut: 'a_faire'
        };

        if (!item.equipement) { App.showToast('Équipement obligatoire', 'warning'); return; }

        if (editIndex !== null) {
            item.statut = DataManager.data.processus.vpo.items[editIndex].statut;
            DataManager.data.processus.vpo.items[editIndex] = item;
        } else {
            DataManager.data.processus.vpo.items.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('vpoModal').remove();
        this.refresh();
        App.showToast('VPO enregistrée', 'success');
    },

    updateVPOStatut(index, statut) {
        if (DataManager.data.processus?.vpo?.items?.[index]) {
            DataManager.data.processus.vpo.items[index].statut = statut;
            DataManager.saveToStorage();
        }
    },

    deleteVPO(index) {
        if (confirm('Supprimer ?')) {
            DataManager.data.processus.vpo.items.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    // ==========================================
    // PL6.0 - PSV (Soupapes de Sécurité)
    // ==========================================

    // Filtre et tri pour PSV
    psvFiltre: '',
    psvTri: 'psv',
    psvTriDir: 'asc',

    renderDetailPSV() {
        const travaux = DataManager.data.travaux || [];
        const psvData = DataManager.data.processus?.psv || {};

        // Extraire tous les numéros PSV uniques (format PSV**** ou PSV-****)
        const psvRegex = /PSV[-]?\d{4,}/gi;
        const psvMap = new Map(); // Map pour stocker PSV -> travaux associés

        travaux.forEach((t, index) => {
            if (t.description) {
                const matches = t.description.match(psvRegex);
                if (matches) {
                    matches.forEach(match => {
                        const psvNorm = match.toUpperCase().replace('-', ''); // Normaliser PSV1234 et PSV-1234
                        if (!psvMap.has(psvNorm)) {
                            psvMap.set(psvNorm, []);
                        }
                        psvMap.get(psvNorm).push({ ...t, travailIndex: index });
                    });
                }
            }
        });

        // Convertir en tableau avec infos PSV
        let travauxPSV = Array.from(psvMap.entries()).map(([psvNum, travauxList]) => {
            const uniqueId = psvNum;
            const psvInfo = psvData[uniqueId] || {};
            const premierTravail = travauxList[0];
            return {
                psvNum,
                ot: travauxList.map(t => t.ot).join(', '),
                description: premierTravail.description,
                equipement: premierTravail.equipement,
                entreprise: premierTravail.entreprise,
                travauxAssocies: travauxList,
                nbTravaux: travauxList.length,
                uniqueId,
                psvInfo
            };
        });

        // Appliquer le filtre de recherche
        if (this.psvFiltre) {
            const filtre = this.psvFiltre.toLowerCase();
            travauxPSV = travauxPSV.filter(t =>
                (t.psvNum && t.psvNum.toLowerCase().includes(filtre)) ||
                (t.ot && t.ot.toString().toLowerCase().includes(filtre)) ||
                (t.description && t.description.toLowerCase().includes(filtre)) ||
                (t.equipement && t.equipement.toLowerCase().includes(filtre)) ||
                (t.entreprise && t.entreprise.toLowerCase().includes(filtre))
            );
        }

        // Renommer pour compatibilité avec le reste du code
        const travauxAvecId = travauxPSV;

        // Appliquer le tri
        travauxAvecId.sort((a, b) => {
            let comparison = 0;
            if (this.psvTri === 'psv') {
                comparison = (a.psvNum || '').localeCompare(b.psvNum || '');
            } else if (this.psvTri === 'ot') {
                comparison = (a.ot || '').toString().localeCompare((b.ot || '').toString());
            } else if (this.psvTri === 'entreprise') {
                comparison = (a.entreprise || '').localeCompare(b.entreprise || '');
            } else if (this.psvTri === 'equipement') {
                comparison = (a.equipement || '').localeCompare(b.equipement || '');
            }
            return this.psvTriDir === 'desc' ? -comparison : comparison;
        });

        // Stats
        const stats = {
            total: travauxAvecId.length,
            aFaire: travauxAvecId.filter(t => (t.psvInfo.statut || 'a_faire') === 'a_faire').length,
            enCours: travauxAvecId.filter(t => t.psvInfo.statut === 'en_cours').length,
            termine: travauxAvecId.filter(t => t.psvInfo.statut === 'termine').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL6.0', 'PSV - Soupapes de Sécurité')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            🔧 <strong>Pressure Safety Valves (PSV)</strong> - Liste des numéros PSV uniques extraits automatiquement (format PSV**** ou PSV-****).
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Total PSV</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.aFaire}</span>
                                <span class="stat-label">À faire</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.enCours}</span>
                                <span class="stat-label">En cours</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.termine}</span>
                                <span class="stat-label">Terminés</span>
                            </div>
                        </div>
                    </div>

                    <!-- Filtres -->
                    <div class="detail-card planifier-card">
                        <div class="tpaa-filters">
                            <div class="filter-group">
                                <label>Rechercher:</label>
                                <input type="text" class="form-control" placeholder="OT, description, équipement..."
                                    value="${this.psvFiltre}"
                                    oninput="ScreenPreparation.psvFiltre = this.value; ScreenPreparation.refresh();">
                            </div>
                            <div class="filter-group">
                                <label>Trier par:</label>
                                <select class="form-control" onchange="ScreenPreparation.psvTri = this.value; ScreenPreparation.refresh();">
                                    <option value="psv" ${this.psvTri === 'psv' ? 'selected' : ''}>N° PSV</option>
                                    <option value="ot" ${this.psvTri === 'ot' ? 'selected' : ''}>OT</option>
                                    <option value="entreprise" ${this.psvTri === 'entreprise' ? 'selected' : ''}>Entreprise</option>
                                    <option value="equipement" ${this.psvTri === 'equipement' ? 'selected' : ''}>Équipement</option>
                                </select>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.psvTriDir = ScreenPreparation.psvTriDir === 'asc' ? 'desc' : 'asc'; ScreenPreparation.refresh();">
                                    ${this.psvTriDir === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>🔩 Liste PSV (${travauxAvecId.length} uniques)</h3>
                        </div>

                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>N° PSV</th>
                                        <th>OT associés</th>
                                        <th>Équipement</th>
                                        <th>Entreprise</th>
                                        <th>Nb travaux</th>
                                        <th>Statut</th>
                                        <th>Commentaire PSV</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${travauxAvecId.length === 0 ? `
                                        <tr><td colspan="7" class="empty-msg">${this.psvFiltre ? 'Aucun résultat pour cette recherche' : 'Aucun numéro PSV trouvé (format PSV**** ou PSV-****)'}</td></tr>
                                    ` : travauxAvecId.map((t) => {
                                        const statut = t.psvInfo.statut || 'a_faire';
                                        return `
                                        <tr class="${statut === 'termine' ? 'row-success' : ''}" data-unique-id="${t.uniqueId}">
                                            <td><strong class="psv-num">${t.psvNum || '-'}</strong></td>
                                            <td class="td-wrap" style="max-width: 150px; font-size: 0.85rem;">${t.ot || '-'}</td>
                                            <td>${t.equipement || '-'}</td>
                                            <td>${t.entreprise || '-'}</td>
                                            <td class="center"><span class="badge badge-info">${t.nbTravaux}</span></td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updatePSVStatut('${t.uniqueId}', this.value)">
                                                    <option value="a_faire" ${statut === 'a_faire' ? 'selected' : ''}>À faire</option>
                                                    <option value="en_cours" ${statut === 'en_cours' ? 'selected' : ''}>En cours</option>
                                                    <option value="termine" ${statut === 'termine' ? 'selected' : ''}>Terminé</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input type="text" class="mini-input" value="${t.psvInfo.commentaire || ''}"
                                                    placeholder="Commentaire..."
                                                    onchange="ScreenPreparation.updatePSVCommentaire('${t.uniqueId}', this.value)">
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL6.0')}
                </div>
            </div>
        `;
    },

    updatePSVStatut(uniqueId, statut) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.psv) DataManager.data.processus.psv = {};

        if (!DataManager.data.processus.psv[uniqueId]) {
            DataManager.data.processus.psv[uniqueId] = {};
        }

        DataManager.data.processus.psv[uniqueId].statut = statut;
        DataManager.saveToStorage();
        this.refresh();
    },

    updatePSVCommentaire(uniqueId, commentaire) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.psv) DataManager.data.processus.psv = {};

        if (!DataManager.data.processus.psv[uniqueId]) {
            DataManager.data.processus.psv[uniqueId] = {};
        }

        DataManager.data.processus.psv[uniqueId].commentaire = commentaire;
        DataManager.saveToStorage();
    },

    // ==========================================
    // PL7.0 - Commande matériel
    // ==========================================

    renderDetailCommandeMateriel() {
        const pieces = DataManager.data.pieces || [];
        const commandeData = DataManager.data.processus?.commandesMateriel || {};

        // Mapper les pièces avec leur statut de commande
        const piecesAvecStatut = pieces.map((p, index) => {
            const uniqueId = `piece_${index}`;
            const cmdInfo = commandeData[uniqueId] || {};
            return { ...p, uniqueId, index, cmdInfo };
        });

        // Filtrer par délai (90J, 60J, 30J basé sur la colonne "delai" des pièces importées)
        const pieces90J = piecesAvecStatut.filter(p => {
            const delai = parseInt(p.delai) || 0;
            return delai >= 90 || (p.categorie && p.categorie.toUpperCase().includes('90'));
        });
        const pieces60J = piecesAvecStatut.filter(p => {
            const delai = parseInt(p.delai) || 0;
            return (delai >= 60 && delai < 90) || (p.categorie && p.categorie.toUpperCase().includes('60'));
        });
        const pieces30J = piecesAvecStatut.filter(p => {
            const delai = parseInt(p.delai) || 0;
            return (delai >= 30 && delai < 60) || (p.categorie && p.categorie.toUpperCase().includes('30'));
        });

        // Stats globales
        const stats = {
            total: pieces.length,
            commandees: piecesAvecStatut.filter(p => p.cmdInfo.statut === 'commandee').length,
            recues: piecesAvecStatut.filter(p => p.cmdInfo.statut === 'recue').length,
            enAttente: piecesAvecStatut.filter(p => !p.cmdInfo.statut || p.cmdInfo.statut === 'en_attente').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL7.0', 'Commande matériel')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            📦 <strong>Gestion des commandes de pièces</strong> - Les pièces sont importées via "Import de données > Liste des pièces".
                            Elles sont classées par délai de commande (90J, 60J, 30J avant l'arrêt).
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Total pièces</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.enAttente}</span>
                                <span class="stat-label">En attente</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.commandees}</span>
                                <span class="stat-label">Commandées</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.recues}</span>
                                <span class="stat-label">Reçues</span>
                            </div>
                        </div>
                    </div>

                    ${pieces.length === 0 ? `
                        <div class="detail-card planifier-card">
                            <div class="empty-state">
                                <p>📋 Aucune pièce importée</p>
                                <p class="hint">Importez la liste des pièces via "Import de données > Liste des pièces"</p>
                            </div>
                        </div>
                    ` : `
                        <!-- Tableau 90 Jours -->
                        ${this.renderCommandeTable('90J', pieces90J, 'Commandes 90 jours avant', '🔴')}

                        <!-- Tableau 60 Jours -->
                        ${this.renderCommandeTable('60J', pieces60J, 'Commandes 60 jours avant', '🟠')}

                        <!-- Tableau 30 Jours -->
                        ${this.renderCommandeTable('30J', pieces30J, 'Commandes 30 jours avant', '🟡')}
                    `}

                    ${this.renderPlanifierStatut('PL7.0')}
                </div>
            </div>
        `;
    },

    renderCommandeTable(periode, pieces, titre, icon) {
        const recues = pieces.filter(p => p.cmdInfo.statut === 'recue').length;
        const commandees = pieces.filter(p => p.cmdInfo.statut === 'commandee').length;

        // Stats kitting pour cette liste
        const piecesAvecKitting = pieces.filter(p => {
            if (typeof KittingSync === 'undefined') return false;
            const ks = KittingSync.getPieceKittingStatus(p);
            return ks.hasKitting;
        });
        const kittingsPrets = piecesAvecKitting.filter(p => {
            const ks = KittingSync.getPieceKittingStatus(p);
            return ks.kittingStatus === 'pret';
        }).length;

        return `
            <div class="detail-card planifier-card">
                <div class="card-header-flex">
                    <h3>${icon} ${titre} (${pieces.length})</h3>
                    <div class="mini-stats">
                        <span class="badge badge-warning">${pieces.length - recues - commandees} en attente</span>
                        <span class="badge badge-info">${commandees} commandées</span>
                        <span class="badge badge-success">${recues} reçues</span>
                        ${piecesAvecKitting.length > 0 ? `<span class="badge" style="background: #4ade80; color: #166534;">📦 ${kittingsPrets}/${piecesAvecKitting.length} kittings prêts</span>` : ''}
                    </div>
                </div>

                <div class="table-container">
                    <table class="planifier-table">
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Désignation</th>
                                <th>Quantité</th>
                                <th>Fournisseur</th>
                                <th>OT lié</th>
                                <th>Kitting</th>
                                <th>Statut</th>
                                <th>N° Commande</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pieces.length === 0 ? `
                                <tr><td colspan="8" class="empty-msg">Aucune pièce dans cette catégorie</td></tr>
                            ` : pieces.map(p => {
                                const statut = p.cmdInfo.statut || 'en_attente';
                                // Obtenir le statut kitting - vert si pièce reçue, jaune si en attente
                                const kittingStatus = typeof KittingSync !== 'undefined' ? KittingSync.getPieceKittingStatus(p) : { hasKitting: false };
                                const kittingClass = kittingStatus.hasKitting
                                    ? (kittingStatus.pieceReceived ? 'kitting-pret' : 'kitting-incomplet')
                                    : '';
                                const baseClass = statut === 'recue' ? 'row-success' : statut === 'retard' ? 'row-danger' : '';
                                const rowClass = kittingClass || baseClass;

                                const kittingBadge = kittingStatus.hasKitting
                                    ? (kittingStatus.pieceReceived
                                        ? `<span class="badge" style="background: #4ade80; color: #166534; font-size: 0.7rem;">✓ Reçue</span>`
                                        : `<span class="badge" style="background: #fbbf24; color: #92400e; font-size: 0.7rem;">⏳</span>`)
                                    : `<span style="color: var(--text-light); font-size: 0.75rem;">-</span>`;
                                const locationInfo = kittingStatus.location ? `<br><small style="font-size: 0.65rem; color: var(--text-light);">${kittingStatus.location}</small>` : '';

                                return `
                                <tr class="${rowClass}" data-unique-id="${p.uniqueId}">
                                    <td><strong>${p.reference || '-'}</strong></td>
                                    <td title="${p.designation || ''}">${(p.designation || '-').substring(0, 30)}${(p.designation || '').length > 30 ? '...' : ''}</td>
                                    <td class="center">${p.quantite || '-'}</td>
                                    <td>${p.fournisseur || '-'}</td>
                                    <td>${p.otLie || '-'}</td>
                                    <td style="text-align: center;">${kittingBadge}${locationInfo}</td>
                                    <td>
                                        <select class="mini-select" onchange="ScreenPreparation.updatePieceStatut('${p.uniqueId}', this.value)">
                                            <option value="en_attente" ${statut === 'en_attente' ? 'selected' : ''}>En attente</option>
                                            <option value="commandee" ${statut === 'commandee' ? 'selected' : ''}>Commandée</option>
                                            <option value="expediee" ${statut === 'expediee' ? 'selected' : ''}>Expédiée</option>
                                            <option value="recue" ${statut === 'recue' ? 'selected' : ''}>Reçue</option>
                                            <option value="retard" ${statut === 'retard' ? 'selected' : ''}>En retard</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input type="text" class="mini-input" value="${p.cmdInfo.numeroCommande || ''}"
                                            placeholder="N° cmd"
                                            onchange="ScreenPreparation.updatePieceNumeroCommande('${p.uniqueId}', this.value)">
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    updatePieceStatut(uniqueId, statut) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.commandesMateriel) DataManager.data.processus.commandesMateriel = {};

        if (!DataManager.data.processus.commandesMateriel[uniqueId]) {
            DataManager.data.processus.commandesMateriel[uniqueId] = {};
        }

        DataManager.data.processus.commandesMateriel[uniqueId].statut = statut;
        DataManager.saveToStorage();
        this.refresh();
    },

    updatePieceNumeroCommande(uniqueId, numero) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.commandesMateriel) DataManager.data.processus.commandesMateriel = {};

        if (!DataManager.data.processus.commandesMateriel[uniqueId]) {
            DataManager.data.processus.commandesMateriel[uniqueId] = {};
        }

        DataManager.data.processus.commandesMateriel[uniqueId].numeroCommande = numero;
        DataManager.saveToStorage();
    },

    editPieceCommentaire(uniqueId) {
        const cmdData = DataManager.data.processus?.commandesMateriel?.[uniqueId] || {};
        const currentComment = cmdData.commentaire || '';

        const html = `
            <div class="overlay-modal" id="pieceCommentModal">
                <div class="overlay-box" style="max-width: 500px;">
                    <div class="overlay-header">
                        <h3>Commentaire pièce</h3>
                        <button class="close-btn" onclick="document.getElementById('pieceCommentModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="pieceCommentText" class="form-control" rows="4" placeholder="Notes sur la commande...">${currentComment}</textarea>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('pieceCommentModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.savePieceCommentaire('${uniqueId}')">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('pieceCommentText').focus();
    },

    savePieceCommentaire(uniqueId) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.commandesMateriel) DataManager.data.processus.commandesMateriel = {};

        if (!DataManager.data.processus.commandesMateriel[uniqueId]) {
            DataManager.data.processus.commandesMateriel[uniqueId] = {};
        }

        const commentaire = document.getElementById('pieceCommentText').value.trim();
        DataManager.data.processus.commandesMateriel[uniqueId].commentaire = commentaire;

        DataManager.saveToStorage();
        document.getElementById('pieceCommentModal').remove();
        this.refresh();
        App.showToast('Commentaire enregistré', 'success');
    },

    // ==========================================
    // PL8.0 - Avis Priorisés
    // ==========================================

    avisFiltre: '',
    avisTri: 'priorite',
    avisTriDir: 'desc',

    renderDetailAvisPriorises() {
        const avis = DataManager.data.avis || [];
        const avisData = DataManager.data.processus?.avisPriorises || {};

        // Appliquer le filtre de recherche
        let avisFiltres = [...avis];
        if (this.avisFiltre) {
            const filtre = this.avisFiltre.toLowerCase();
            avisFiltres = avisFiltres.filter(a =>
                (a.numeroAvis && a.numeroAvis.toString().toLowerCase().includes(filtre)) ||
                (a.description && a.description.toLowerCase().includes(filtre)) ||
                (a.equipement && a.equipement.toLowerCase().includes(filtre)) ||
                (a.localisation && a.localisation.toLowerCase().includes(filtre))
            );
        }

        // Mapper avec uniqueId et données de priorisation
        const avisAvecPrio = avisFiltres.map((a, idx) => {
            const originalIndex = avis.findIndex(av => av === a);
            const uniqueId = `avis_${originalIndex}`;
            const prioInfo = avisData[uniqueId] || {};
            return {
                ...a,
                uniqueId,
                originalIndex,
                prioInfo,
                prioriteNum: this.getPrioriteNum(prioInfo.prioriteManuelle || a.priorite)
            };
        });

        // Appliquer le tri
        avisAvecPrio.sort((a, b) => {
            let comparison = 0;
            if (this.avisTri === 'priorite') {
                comparison = b.prioriteNum - a.prioriteNum;
            } else if (this.avisTri === 'numero') {
                comparison = (a.numeroAvis || '').toString().localeCompare((b.numeroAvis || '').toString());
            } else if (this.avisTri === 'equipement') {
                comparison = (a.equipement || '').localeCompare(b.equipement || '');
            } else if (this.avisTri === 'date') {
                comparison = new Date(a.dateCreation || 0) - new Date(b.dateCreation || 0);
            }
            return this.avisTriDir === 'desc' ? -comparison : comparison;
        });

        // Stats
        const stats = {
            total: avis.length,
            priorises: Object.keys(avisData).filter(k => avisData[k].inclus).length,
            haute: avisAvecPrio.filter(a => a.prioInfo.prioriteManuelle === 'Haute' || (!a.prioInfo.prioriteManuelle && a.prioriteNum >= 3)).length,
            moyenne: avisAvecPrio.filter(a => a.prioInfo.prioriteManuelle === 'Moyenne' || (!a.prioInfo.prioriteManuelle && a.prioriteNum === 2)).length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL8.0', 'Avis Priorisés')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            📋 <strong>Priorisation des Avis</strong> - Sélectionnez et priorisez les avis (notifications SAP) à inclure dans l'arrêt annuel.
                            Les avis sont importés via "Import de données > Avis".
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Total avis</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.priorises}</span>
                                <span class="stat-label">Inclus dans l'arrêt</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.haute}</span>
                                <span class="stat-label">Priorité haute</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.moyenne}</span>
                                <span class="stat-label">Priorité moyenne</span>
                            </div>
                        </div>
                    </div>

                    ${avis.length === 0 ? `
                        <div class="detail-card planifier-card">
                            <div class="empty-state">
                                <p>📋 Aucun avis importé</p>
                                <p class="hint">Importez les avis via "Import de données > Avis (Notifications SAP)"</p>
                            </div>
                        </div>
                    ` : `
                        <!-- Filtres -->
                        <div class="detail-card planifier-card">
                            <div class="tpaa-filters">
                                <div class="filter-group">
                                    <label>Rechercher:</label>
                                    <input type="text" class="form-control" placeholder="N° avis, description, équipement..."
                                        value="${this.avisFiltre}"
                                        oninput="ScreenPreparation.avisFiltre = this.value; ScreenPreparation.refresh();">
                                </div>
                                <div class="filter-group">
                                    <label>Trier par:</label>
                                    <select class="form-control" onchange="ScreenPreparation.avisTri = this.value; ScreenPreparation.refresh();">
                                        <option value="priorite" ${this.avisTri === 'priorite' ? 'selected' : ''}>Priorité</option>
                                        <option value="numero" ${this.avisTri === 'numero' ? 'selected' : ''}>N° Avis</option>
                                        <option value="equipement" ${this.avisTri === 'equipement' ? 'selected' : ''}>Équipement</option>
                                        <option value="date" ${this.avisTri === 'date' ? 'selected' : ''}>Date création</option>
                                    </select>
                                    <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.avisTriDir = ScreenPreparation.avisTriDir === 'asc' ? 'desc' : 'asc'; ScreenPreparation.refresh();">
                                        ${this.avisTriDir === 'asc' ? '↑' : '↓'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Tableau des avis -->
                        <div class="detail-card planifier-card">
                            <div class="card-header-flex">
                                <h3>📋 Liste des Avis (${avisFiltres.length})</h3>
                            </div>

                            <div class="table-container">
                                <table class="planifier-table avis-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 50px;">Inclus</th>
                                            <th>N° Avis</th>
                                            <th>Description</th>
                                            <th>Équipement</th>
                                            <th>Priorité</th>
                                            <th>Type</th>
                                            <th>Commentaire</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${avisAvecPrio.length === 0 ? `
                                            <tr><td colspan="7" class="empty-msg">${this.avisFiltre ? 'Aucun résultat pour cette recherche' : 'Aucun avis'}</td></tr>
                                        ` : avisAvecPrio.map(a => {
                                            const inclus = a.prioInfo.inclus || false;
                                            const prioriteManuelle = a.prioInfo.prioriteManuelle || a.priorite || '-';
                                            return `
                                            <tr class="${inclus ? 'row-selected' : ''}" data-unique-id="${a.uniqueId}">
                                                <td class="center">
                                                    <input type="checkbox" ${inclus ? 'checked' : ''}
                                                        onchange="ScreenPreparation.toggleAvisInclus('${a.uniqueId}', this.checked)">
                                                </td>
                                                <td><strong>${a.numeroAvis || '-'}</strong></td>
                                                <td title="${a.description || ''}">${(a.description || '-').substring(0, 35)}${(a.description || '').length > 35 ? '...' : ''}</td>
                                                <td>${a.equipement || '-'}</td>
                                                <td>
                                                    <select class="mini-select priorite-select ${this.getPrioriteClass(prioriteManuelle)}"
                                                        onchange="ScreenPreparation.updateAvisPriorite('${a.uniqueId}', this.value)">
                                                        <option value="" ${!a.prioInfo.prioriteManuelle ? 'selected' : ''}>-</option>
                                                        <option value="Haute" ${prioriteManuelle === 'Haute' ? 'selected' : ''}>Haute</option>
                                                        <option value="Moyenne" ${prioriteManuelle === 'Moyenne' ? 'selected' : ''}>Moyenne</option>
                                                        <option value="Basse" ${prioriteManuelle === 'Basse' ? 'selected' : ''}>Basse</option>
                                                    </select>
                                                </td>
                                                <td>${a.typeAvis || '-'}</td>
                                                <td class="commentaire-cell">
                                                    <div class="commentaire-wrapper">
                                                        <span class="commentaire-text">${(a.prioInfo.commentaire || '').substring(0, 15)}${(a.prioInfo.commentaire || '').length > 15 ? '...' : ''}</span>
                                                        <button class="btn-icon btn-edit-comment" onclick="ScreenPreparation.editAvisCommentaire('${a.uniqueId}')" title="Modifier">✏️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `}).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `}

                    ${this.renderPlanifierStatut('PL8.0')}
                </div>
            </div>
        `;
    },

    getPrioriteNum(priorite) {
        const prio = (priorite || '').toString().toLowerCase();
        if (prio.includes('haute') || prio.includes('high') || prio === '1') return 4;
        if (prio.includes('moyenne') || prio.includes('medium') || prio === '2') return 3;
        if (prio.includes('basse') || prio.includes('low') || prio === '3') return 2;
        return 1;
    },

    getPrioriteClass(priorite) {
        const prio = (priorite || '').toString().toLowerCase();
        if (prio.includes('haute') || prio.includes('high')) return 'prio-haute';
        if (prio.includes('moyenne') || prio.includes('medium')) return 'prio-moyenne';
        if (prio.includes('basse') || prio.includes('low')) return 'prio-basse';
        return '';
    },

    toggleAvisInclus(uniqueId, inclus) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.avisPriorises) DataManager.data.processus.avisPriorises = {};

        if (!DataManager.data.processus.avisPriorises[uniqueId]) {
            DataManager.data.processus.avisPriorises[uniqueId] = {};
        }

        DataManager.data.processus.avisPriorises[uniqueId].inclus = inclus;
        DataManager.saveToStorage();
        this.refresh();
    },

    updateAvisPriorite(uniqueId, priorite) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.avisPriorises) DataManager.data.processus.avisPriorises = {};

        if (!DataManager.data.processus.avisPriorises[uniqueId]) {
            DataManager.data.processus.avisPriorises[uniqueId] = {};
        }

        DataManager.data.processus.avisPriorises[uniqueId].prioriteManuelle = priorite;
        DataManager.saveToStorage();
        this.refresh();
    },

    editAvisCommentaire(uniqueId) {
        const avisData = DataManager.data.processus?.avisPriorises?.[uniqueId] || {};
        const currentComment = avisData.commentaire || '';

        const html = `
            <div class="overlay-modal" id="avisCommentModal">
                <div class="overlay-box" style="max-width: 500px;">
                    <div class="overlay-header">
                        <h3>Commentaire avis</h3>
                        <button class="close-btn" onclick="document.getElementById('avisCommentModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="avisCommentText" class="form-control" rows="4" placeholder="Notes sur l'avis...">${currentComment}</textarea>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('avisCommentModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveAvisCommentaire('${uniqueId}')">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('avisCommentText').focus();
    },

    saveAvisCommentaire(uniqueId) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.avisPriorises) DataManager.data.processus.avisPriorises = {};

        if (!DataManager.data.processus.avisPriorises[uniqueId]) {
            DataManager.data.processus.avisPriorises[uniqueId] = {};
        }

        const commentaire = document.getElementById('avisCommentText').value.trim();
        DataManager.data.processus.avisPriorises[uniqueId].commentaire = commentaire;

        DataManager.saveToStorage();
        document.getElementById('avisCommentModal').remove();
        this.refresh();
        App.showToast('Commentaire enregistré', 'success');
    },

    // ==========================================
    // PL9.0 - Travaux entrepreneur
    // ==========================================

    entrepreneurActif: null, // Entreprise sélectionnée pour affichage

    getEntreprisesUniques(travaux) {
        const entreprises = new Set();
        travaux.forEach(t => {
            if (t.entreprise && t.entreprise.trim()) {
                entreprises.add(t.entreprise.trim());
            }
        });
        return Array.from(entreprises).sort();
    },

    calculerStatsParEntreprise(travaux) {
        const stats = {};
        const entreprises = this.getEntreprisesUniques(travaux);

        entreprises.forEach(entreprise => {
            const travauxEntreprise = travaux.filter(t =>
                t.entreprise && t.entreprise.trim() === entreprise
            );

            stats[entreprise] = {
                count: travauxEntreprise.length,
                heures: travauxEntreprise.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0)
            };
        });

        return stats;
    },

    renderDetailTravauxEntrepreneur() {
        const travaux = DataManager.data.travaux || [];
        const entreprisesVisibles = DataManager.data.processus?.entreprisesVisibles || {};
        const entrepreneurActif = this.entrepreneurActif || null;

        // Extraire toutes les entreprises uniques
        const toutesEntreprises = this.getEntreprisesUniques(travaux);

        // Filtrer pour n'afficher que les entreprises visibles
        const entreprises = toutesEntreprises.filter(ent => {
            if (Object.keys(entreprisesVisibles).length === 0) return true;
            return entreprisesVisibles[ent] !== false;
        });

        // Calculer les stats
        const statsParEntreprise = this.calculerStatsParEntreprise(travaux);
        const entreprisesMasquees = toutesEntreprises.length - entreprises.length;

        // Travaux filtrés par entreprise active
        let travauxAffiches = [];
        if (entrepreneurActif) {
            travauxAffiches = travaux.filter(t =>
                t.entreprise && t.entreprise.trim() === entrepreneurActif
            );
        }

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL9.0', 'Travaux entrepreneur')}

                <div class="detail-body planifier-body">
                    ${travaux.length === 0 ? `
                        <div class="detail-card planifier-card">
                            <div class="empty-state">
                                <p>Aucun travail importé. Importez des données pour voir les entreprises.</p>
                                <a href="#" onclick="App.navigateTo('import'); return false;" class="btn btn-primary">
                                    Importer des données
                                </a>
                            </div>
                        </div>
                    ` : toutesEntreprises.length === 0 ? `
                        <div class="detail-card planifier-card">
                            <div class="empty-state">
                                <p>Aucune entreprise trouvée dans les travaux importés</p>
                                <p class="hint">Les travaux avec une entreprise dans la colonne "Entreprise" apparaîtront ici</p>
                            </div>
                        </div>
                    ` : `
                        <!-- Cartes des entreprises -->
                        <div class="detail-card planifier-card">
                            <div class="card-header-flex">
                                <h3>Entrepreneurs (${entreprises.length}${entreprisesMasquees > 0 ? '/' + toutesEntreprises.length : ''})</h3>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.gererVisibiliteEntreprises()">
                                    Gérer visibilité ${entreprisesMasquees > 0 ? `(${entreprisesMasquees} masqué${entreprisesMasquees > 1 ? 's' : ''})` : ''}
                                </button>
                            </div>
                            ${entreprises.length === 0 ? `
                                <div class="empty-state">
                                    <p>Toutes les entreprises sont masquées</p>
                                    <button class="btn btn-primary btn-sm" onclick="ScreenPreparation.gererVisibiliteEntreprises()">
                                        Gérer la visibilité
                                    </button>
                                </div>
                            ` : `
                                <div class="secteurs-grid secteurs-grid-fixed">
                                    ${entreprises.map(entreprise => {
                                        const stats = statsParEntreprise[entreprise] || { count: 0, heures: 0 };
                                        const isActive = entrepreneurActif === entreprise;
                                        return `
                                            <div class="secteur-card ${isActive ? 'secteur-card-active' : ''}"
                                                 onclick="ScreenPreparation.voirTravauxEntreprise('${this.escapeHtml(entreprise)}')"
                                                 style="cursor: pointer;">
                                                <div class="secteur-header">
                                                    <span class="secteur-nom" title="${entreprise}">${entreprise.length > 25 ? entreprise.substring(0, 25) + '...' : entreprise}</span>
                                                </div>
                                                <div class="secteur-stats">
                                                    <div class="secteur-stat">
                                                        <span class="stat-value">${stats.count}</span>
                                                        <span class="stat-label">travaux</span>
                                                    </div>
                                                    <div class="secteur-stat">
                                                        <span class="stat-value">${stats.heures}</span>
                                                        <span class="stat-label">heures</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            `}
                        </div>

                        <!-- Tableau des travaux -->
                        <div class="detail-card planifier-card">
                            <div class="card-header-flex">
                                <h3>${entrepreneurActif ? `Travaux - ${entrepreneurActif} (${travauxAffiches.length})` : 'Cliquez sur une entreprise pour voir ses travaux'}</h3>
                                ${entrepreneurActif ? `
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.exporterTravauxEntrepreneur('pdf')" title="Exporter en PDF">
                                            PDF
                                        </button>
                                        <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.exporterTravauxEntrepreneur('excel')" title="Exporter en Excel">
                                            Excel
                                        </button>
                                        <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.envoyerTravauxParCourriel()" title="Envoyer par courriel">
                                            Courriel
                                        </button>
                                        <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.voirTravauxEntreprise(null)">
                                            Fermer
                                        </button>
                                    </div>
                                ` : ''}
                            </div>

                            ${entrepreneurActif ? `
                                <div class="table-container" style="max-height: 400px;">
                                    <table class="planifier-table" id="tableTravauxEntrepreneur">
                                        <thead>
                                            <tr>
                                                <th>OT</th>
                                                <th>Description</th>
                                                <th>Équipement</th>
                                                <th>Discipline</th>
                                                <th>Heures</th>
                                                <th>Priorité</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${travauxAffiches.length === 0 ? `
                                                <tr><td colspan="6" class="empty-msg">Aucun travail pour cette entreprise</td></tr>
                                            ` : travauxAffiches.map(t => `
                                                <tr>
                                                    <td><strong>${t.ot || '-'}</strong></td>
                                                    <td title="${t.description || ''}">${(t.description || '-').substring(0, 50)}${(t.description || '').length > 50 ? '...' : ''}</td>
                                                    <td>${t.equipement || '-'}</td>
                                                    <td>${t.discipline || '-'}</td>
                                                    <td class="center">${t.estimationHeures || '-'}</td>
                                                    <td>${t.priorite || '-'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            ` : ''}
                        </div>
                    `}

                    ${this.renderPlanifierStatut('PL9.0')}
                </div>
            </div>
        `;
    },

    gererVisibiliteEntreprises() {
        const travaux = DataManager.data.travaux || [];
        const toutesEntreprises = this.getEntreprisesUniques(travaux);
        const entreprisesVisibles = DataManager.data.processus?.entreprisesVisibles || {};
        const statsParEntreprise = this.calculerStatsParEntreprise(travaux);

        const html = `
            <div class="overlay-modal" id="visibiliteEntreprisesModal">
                <div class="overlay-box overlay-box-large">
                    <div class="overlay-header">
                        <h3>Gérer la visibilité des entreprises</h3>
                        <button class="close-btn" onclick="document.getElementById('visibiliteEntreprisesModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="visibilite-actions" style="margin-bottom: 15px; display: flex; gap: 10px;">
                            <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.toggleToutesEntreprises(true)">
                                Tout afficher
                            </button>
                            <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.toggleToutesEntreprises(false)">
                                Tout masquer
                            </button>
                        </div>

                        <div class="postes-filter">
                            <input type="text" id="filtreVisibiliteEntreprises" class="form-control" placeholder="Filtrer..." oninput="ScreenPreparation.filtrerVisibiliteEntreprisesModal()">
                        </div>

                        <div class="postes-selection" id="visibiliteEntreprisesList">
                            ${toutesEntreprises.map(entreprise => {
                                const isVisible = Object.keys(entreprisesVisibles).length === 0 || entreprisesVisibles[entreprise] !== false;
                                const stats = statsParEntreprise[entreprise] || { count: 0, heures: 0 };
                                return `
                                    <label class="poste-item ${isVisible ? 'poste-selected' : ''}" data-entreprise="${entreprise.toLowerCase()}">
                                        <input type="checkbox" value="${this.escapeHtml(entreprise)}" ${isVisible ? 'checked' : ''} onchange="ScreenPreparation.toggleVisibiliteEntreprise(this)">
                                        <span class="poste-nom">
                                            <strong>${entreprise}</strong>
                                            <small style="color: #666; margin-left: 10px;">(${stats.count} travaux)</small>
                                        </span>
                                    </label>
                                `;
                            }).join('')}
                        </div>

                        <div class="postes-summary">
                            <span id="visibiliteEntreprisesCount">${toutesEntreprises.filter(e => Object.keys(entreprisesVisibles).length === 0 || entreprisesVisibles[e] !== false).length}</span> / ${toutesEntreprises.length} visible(s)
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('visibiliteEntreprisesModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.sauvegarderVisibiliteEntreprises()">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    filtrerVisibiliteEntreprisesModal() {
        const filtre = document.getElementById('filtreVisibiliteEntreprises').value.toLowerCase();
        document.querySelectorAll('#visibiliteEntreprisesList .poste-item').forEach(item => {
            item.style.display = item.dataset.entreprise.includes(filtre) ? '' : 'none';
        });
    },

    toggleVisibiliteEntreprise(checkbox) {
        const label = checkbox.closest('.poste-item');
        label.classList.toggle('poste-selected', checkbox.checked);
        this.updateVisibiliteEntreprisesCount();
    },

    toggleToutesEntreprises(visible) {
        document.querySelectorAll('#visibiliteEntreprisesList input[type="checkbox"]').forEach(cb => {
            cb.checked = visible;
            cb.closest('.poste-item').classList.toggle('poste-selected', visible);
        });
        this.updateVisibiliteEntreprisesCount();
    },

    updateVisibiliteEntreprisesCount() {
        const count = document.querySelectorAll('#visibiliteEntreprisesList input:checked').length;
        document.getElementById('visibiliteEntreprisesCount').textContent = count;
    },

    sauvegarderVisibiliteEntreprises() {
        const visibilite = {};
        document.querySelectorAll('#visibiliteEntreprisesList input[type="checkbox"]').forEach(cb => {
            visibilite[cb.value] = cb.checked;
        });

        if (!DataManager.data.processus) DataManager.data.processus = {};
        DataManager.data.processus.entreprisesVisibles = visibilite;
        DataManager.saveToStorage();

        document.getElementById('visibiliteEntreprisesModal').remove();
        this.refresh();
        App.showToast('Visibilité enregistrée', 'success');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/'/g, "\\'");
    },

    voirTravauxEntreprise(entreprise) {
        this.entrepreneurActif = entreprise;
        this.refresh();
    },

    getTravauxEntrepreneurActif() {
        const travaux = DataManager.data.travaux || [];
        if (!this.entrepreneurActif) return [];
        return travaux.filter(t => t.entreprise && t.entreprise.trim() === this.entrepreneurActif);
    },

    exporterTravauxEntrepreneur(format) {
        const travaux = this.getTravauxEntrepreneurActif();
        if (travaux.length === 0) {
            App.showToast('Aucun travail à exporter', 'error');
            return;
        }

        const entreprise = this.entrepreneurActif;
        const dateExport = new Date().toLocaleDateString('fr-CA');

        if (format === 'excel') {
            this.exporterEntrepreneurExcel(travaux, entreprise, dateExport);
        } else if (format === 'pdf') {
            this.exporterEntrepreneurPDF(travaux, entreprise, dateExport);
        }
    },

    exporterEntrepreneurExcel(travaux, entreprise, dateExport) {
        // Préparer les données pour Excel
        const headers = ['OT', 'Description', 'Équipement', 'Discipline', 'Heures', 'Priorité'];
        const rows = travaux.map(t => [
            t.ot || '',
            t.description || '',
            t.equipement || '',
            t.discipline || '',
            t.estimationHeures || '',
            t.priorite || ''
        ]);

        // Créer le contenu CSV (compatible Excel)
        let csv = '\uFEFF'; // BOM pour UTF-8
        csv += `Travaux - ${entreprise}\n`;
        csv += `Date d'export: ${dateExport}\n`;
        csv += `Nombre de travaux: ${travaux.length}\n\n`;
        csv += headers.join(';') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';') + '\n';
        });

        // Télécharger le fichier
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Travaux_${entreprise.replace(/[^a-zA-Z0-9]/g, '_')}_${dateExport}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        App.showToast('Export Excel téléchargé', 'success');
    },

    exporterEntrepreneurPDF(travaux, entreprise, dateExport) {
        // Créer une fenêtre d'impression pour générer le PDF
        const totalHeures = travaux.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0);

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Travaux - ${entreprise}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
                    h1 { color: #1e3a5f; font-size: 18px; margin-bottom: 5px; }
                    .info { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #1e3a5f; color: white; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .total { margin-top: 15px; font-weight: bold; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>Travaux Entrepreneur - ${entreprise}</h1>
                <div class="info">
                    Date d'export: ${dateExport} | Nombre de travaux: ${travaux.length}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>OT</th>
                            <th>Description</th>
                            <th>Équipement</th>
                            <th>Discipline</th>
                            <th>Heures</th>
                            <th>Priorité</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${travaux.map(t => `
                            <tr>
                                <td>${t.ot || '-'}</td>
                                <td>${t.description || '-'}</td>
                                <td>${t.equipement || '-'}</td>
                                <td>${t.discipline || '-'}</td>
                                <td>${t.estimationHeures || '-'}</td>
                                <td>${t.priorite || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="total">Total heures estimées: ${totalHeures}h</div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();

        App.showToast('Fenêtre d\'impression ouverte', 'success');
    },

    envoyerTravauxParCourriel() {
        const travaux = this.getTravauxEntrepreneurActif();
        if (travaux.length === 0) {
            App.showToast('Aucun travail à envoyer', 'error');
            return;
        }

        const entreprise = this.entrepreneurActif;
        const totalHeures = travaux.reduce((sum, t) => sum + (parseFloat(t.estimationHeures) || 0), 0);

        // Afficher le modal d'envoi
        const html = `
            <div class="overlay-modal" id="envoyerCourrielModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>Envoyer par courriel</h3>
                        <button class="close-btn" onclick="document.getElementById('envoyerCourrielModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Destinataire(s)</label>
                            <input type="email" id="courrielDestinataire" class="form-control" placeholder="email@exemple.com" multiple>
                            <small>Séparez plusieurs adresses par des virgules</small>
                        </div>
                        <div class="form-group">
                            <label>Sujet</label>
                            <input type="text" id="courrielSujet" class="form-control" value="Travaux Arrêt Annuel - ${entreprise}">
                        </div>
                        <div class="form-group">
                            <label>Message</label>
                            <textarea id="courrielMessage" class="form-control" rows="4">Bonjour,

Veuillez trouver ci-dessous la liste des travaux assignés pour l'arrêt annuel.

Entreprise: ${entreprise}
Nombre de travaux: ${travaux.length}
Total heures estimées: ${totalHeures}h

Cordialement</textarea>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="inclureTableau" checked> Inclure le tableau des travaux
                            </label>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('envoyerCourrielModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.envoyerCourrielEntrepreneur()">Envoyer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    envoyerCourrielEntrepreneur() {
        const destinataire = document.getElementById('courrielDestinataire').value.trim();
        const sujet = document.getElementById('courrielSujet').value.trim();
        const message = document.getElementById('courrielMessage').value.trim();
        const inclureTableau = document.getElementById('inclureTableau').checked;

        if (!destinataire) {
            App.showToast('Veuillez entrer un destinataire', 'error');
            return;
        }

        const travaux = this.getTravauxEntrepreneurActif();
        let corps = message;

        if (inclureTableau && travaux.length > 0) {
            corps += '\n\n--- Liste des travaux ---\n\n';
            travaux.forEach((t, i) => {
                corps += `${i + 1}. OT: ${t.ot || '-'}\n`;
                corps += `   Description: ${t.description || '-'}\n`;
                corps += `   Équipement: ${t.equipement || '-'}\n`;
                corps += `   Heures: ${t.estimationHeures || '-'}h\n\n`;
            });
        }

        // Ouvrir le client de messagerie avec mailto
        const mailtoLink = `mailto:${encodeURIComponent(destinataire)}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
        window.location.href = mailtoLink;

        document.getElementById('envoyerCourrielModal').remove();
        App.showToast('Client de messagerie ouvert', 'success');
    },

    // ==========================================
    // PL10.0 - Verrouillage (LOTO)
    // ==========================================

    verrouillageFiltre: '',

    renderDetailVerrouillage() {
        const travaux = DataManager.data.travaux || [];
        const lotoData = DataManager.data.processus?.verrouillage || {};

        // Mapper tous les travaux avec données LOTO
        let travauxLoto = travaux.map((t, index) => {
            const uniqueId = `loto_${index}`;
            const lotoInfo = lotoData[uniqueId] || {};
            return { ...t, uniqueId, travailIndex: index, lotoInfo };
        });

        // Filtrer seulement ceux qui ont une consignation requise ou ceux qui sont marqués
        travauxLoto = travauxLoto.filter(t => t.lotoInfo.requis || t.preparation?.consignationPrevue);

        // Appliquer le filtre de recherche
        if (this.verrouillageFiltre) {
            const filtre = this.verrouillageFiltre.toLowerCase();
            travauxLoto = travauxLoto.filter(t =>
                (t.ot && t.ot.toString().toLowerCase().includes(filtre)) ||
                (t.description && t.description.toLowerCase().includes(filtre)) ||
                (t.equipement && t.equipement.toLowerCase().includes(filtre))
            );
        }

        // Stats
        const stats = {
            total: travauxLoto.length,
            prepares: travauxLoto.filter(t => t.lotoInfo.statut === 'prepare').length,
            valides: travauxLoto.filter(t => t.lotoInfo.statut === 'valide').length,
            enAttente: travauxLoto.filter(t => !t.lotoInfo.statut || t.lotoInfo.statut === 'en_attente').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL10.0', 'Verrouillage (LOTO)')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            🔒 <strong>Procédures de verrouillage/cadenassage</strong> - Travaux nécessitant une consignation.
                            Ajoutez des travaux via le bouton ou marquez "Consignation prévue" dans la préparation.
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Travaux LOTO</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.enAttente}</span>
                                <span class="stat-label">En attente</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.prepares}</span>
                                <span class="stat-label">Préparés</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.valides}</span>
                                <span class="stat-label">Validés</span>
                            </div>
                        </div>
                    </div>

                    <!-- Filtre + Ajout -->
                    <div class="detail-card planifier-card">
                        <div class="tpaa-filters">
                            <div class="filter-group">
                                <label>Rechercher:</label>
                                <input type="text" class="form-control" placeholder="OT, description, équipement..."
                                    value="${this.verrouillageFiltre}"
                                    oninput="ScreenPreparation.verrouillageFiltre = this.value; ScreenPreparation.refresh();">
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addTravailLoto()">+ Ajouter un travail</button>
                        </div>
                    </div>

                    <div class="detail-card planifier-card">
                        <h3>🔒 Travaux avec verrouillage requis (${travauxLoto.length})</h3>
                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>OT</th>
                                        <th>Description</th>
                                        <th>Équipement</th>
                                        <th>Type LOTO</th>
                                        <th>Statut</th>
                                        <th>Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${travauxLoto.length === 0 ? `
                                        <tr><td colspan="6" class="empty-msg">Aucun travail avec verrouillage requis</td></tr>
                                    ` : travauxLoto.map(t => {
                                        const statut = t.lotoInfo.statut || 'en_attente';
                                        return `
                                        <tr class="${statut === 'valide' ? 'row-success' : ''}">
                                            <td><strong>${t.ot || '-'}</strong></td>
                                            <td title="${t.description || ''}">${(t.description || '-').substring(0, 35)}...</td>
                                            <td>${t.equipement || '-'}</td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updateLotoType('${t.uniqueId}', this.value)">
                                                    <option value="" ${!t.lotoInfo.type ? 'selected' : ''}>-</option>
                                                    <option value="electrique" ${t.lotoInfo.type === 'electrique' ? 'selected' : ''}>Électrique</option>
                                                    <option value="mecanique" ${t.lotoInfo.type === 'mecanique' ? 'selected' : ''}>Mécanique</option>
                                                    <option value="hydraulique" ${t.lotoInfo.type === 'hydraulique' ? 'selected' : ''}>Hydraulique</option>
                                                    <option value="pneumatique" ${t.lotoInfo.type === 'pneumatique' ? 'selected' : ''}>Pneumatique</option>
                                                    <option value="multiple" ${t.lotoInfo.type === 'multiple' ? 'selected' : ''}>Multiple</option>
                                                </select>
                                            </td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updateLotoStatut('${t.uniqueId}', this.value)">
                                                    <option value="en_attente" ${statut === 'en_attente' ? 'selected' : ''}>En attente</option>
                                                    <option value="prepare" ${statut === 'prepare' ? 'selected' : ''}>Préparé</option>
                                                    <option value="valide" ${statut === 'valide' ? 'selected' : ''}>Validé</option>
                                                </select>
                                            </td>
                                            <td class="commentaire-cell">
                                                <div class="commentaire-wrapper">
                                                    <span class="commentaire-text">${(t.lotoInfo.commentaire || '').substring(0, 15)}...</span>
                                                    <button class="btn-icon btn-edit-comment" onclick="ScreenPreparation.editLotoComment('${t.uniqueId}')" title="Modifier">✏️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL10.0')}
                </div>
            </div>
        `;
    },

    addTravailLoto() {
        this.showSelectTravailModal('loto', 'Ajouter un travail LOTO');
    },

    updateLotoStatut(uniqueId, statut) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.verrouillage) DataManager.data.processus.verrouillage = {};
        if (!DataManager.data.processus.verrouillage[uniqueId]) DataManager.data.processus.verrouillage[uniqueId] = { requis: true };
        DataManager.data.processus.verrouillage[uniqueId].statut = statut;
        DataManager.saveToStorage();
        this.refresh();
    },

    updateLotoType(uniqueId, type) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.verrouillage) DataManager.data.processus.verrouillage = {};
        if (!DataManager.data.processus.verrouillage[uniqueId]) DataManager.data.processus.verrouillage[uniqueId] = { requis: true };
        DataManager.data.processus.verrouillage[uniqueId].type = type;
        DataManager.saveToStorage();
    },

    editLotoComment(uniqueId) {
        const data = DataManager.data.processus?.verrouillage?.[uniqueId] || {};
        this.showCommentModal('loto', uniqueId, data.commentaire || '', 'Commentaire verrouillage');
    },

    // ==========================================
    // PL11.0 - Équipement de levage
    // ==========================================

    levageFiltre: '',

    renderDetailEquipementLevage() {
        const travaux = DataManager.data.travaux || [];
        const levageData = DataManager.data.processus?.equipementLevage || {};
        const equipements = levageData.equipements || [];

        // Travaux nécessitant du levage
        let travauxLevage = travaux.map((t, index) => {
            const uniqueId = `levage_${index}`;
            const levInfo = levageData.travaux?.[uniqueId] || {};
            return { ...t, uniqueId, travailIndex: index, levInfo };
        }).filter(t => t.levInfo.requis);

        // Appliquer le filtre
        if (this.levageFiltre) {
            const filtre = this.levageFiltre.toLowerCase();
            travauxLevage = travauxLevage.filter(t =>
                (t.ot && t.ot.toString().toLowerCase().includes(filtre)) ||
                (t.description && t.description.toLowerCase().includes(filtre))
            );
        }

        // Stats
        const stats = {
            equipements: equipements.length,
            travaux: travauxLevage.length,
            grues: equipements.filter(e => e.type === 'grue').length,
            nacelles: equipements.filter(e => e.type === 'nacelle').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL11.0', 'Équipement de levage')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            🏗️ <strong>Grues, nacelles et équipements de levage</strong> - Planifiez les besoins en équipement de levage pour l'arrêt.
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.equipements}</span>
                                <span class="stat-label">Équipements</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.grues}</span>
                                <span class="stat-label">Grues</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.nacelles}</span>
                                <span class="stat-label">Nacelles</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.travaux}</span>
                                <span class="stat-label">Travaux associés</span>
                            </div>
                        </div>
                    </div>

                    <!-- Équipements -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>🏗️ Équipements de levage (${equipements.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addEquipementLevage()">+ Ajouter</button>
                        </div>
                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Type</th>
                                        <th>Description</th>
                                        <th>Capacité</th>
                                        <th>Fournisseur</th>
                                        <th>Date début</th>
                                        <th>Date fin</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${equipements.length === 0 ? `
                                        <tr><td colspan="8" class="empty-msg">Aucun équipement de levage défini</td></tr>
                                    ` : equipements.map((e, i) => `
                                        <tr class="${e.statut === 'confirme' ? 'row-success' : ''}">
                                            <td><strong>${this.getLevageTypeLabel(e.type)}</strong></td>
                                            <td>${e.description || '-'}</td>
                                            <td>${e.capacite || '-'}</td>
                                            <td>${e.fournisseur || '-'}</td>
                                            <td>${e.dateDebut || '-'}</td>
                                            <td>${e.dateFin || '-'}</td>
                                            <td>
                                                <select class="mini-select" onchange="ScreenPreparation.updateLevageStatut(${i}, this.value)">
                                                    <option value="demande" ${e.statut === 'demande' ? 'selected' : ''}>Demandé</option>
                                                    <option value="confirme" ${e.statut === 'confirme' ? 'selected' : ''}>Confirmé</option>
                                                    <option value="annule" ${e.statut === 'annule' ? 'selected' : ''}>Annulé</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editEquipementLevage(${i})">✏️</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteEquipementLevage(${i})">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Travaux associés -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>📋 Travaux nécessitant du levage (${travauxLevage.length})</h3>
                            <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.addTravailLevage()">+ Associer un travail</button>
                        </div>
                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>OT</th>
                                        <th>Description</th>
                                        <th>Équipement requis</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${travauxLevage.length === 0 ? `
                                        <tr><td colspan="4" class="empty-msg">Aucun travail associé</td></tr>
                                    ` : travauxLevage.map(t => `
                                        <tr>
                                            <td><strong>${t.ot || '-'}</strong></td>
                                            <td>${(t.description || '-').substring(0, 40)}...</td>
                                            <td>${t.levInfo.equipementType || '-'}</td>
                                            <td>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.removeTravailLevage('${t.uniqueId}')">✕</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL11.0')}
                </div>
            </div>
        `;
    },

    getLevageTypeLabel(type) {
        const labels = {
            'grue': '🏗️ Grue',
            'nacelle': '🚜 Nacelle',
            'chariot': '🚛 Chariot élévateur',
            'palan': '⛓️ Palan',
            'autre': '📦 Autre'
        };
        return labels[type] || type || '-';
    },

    addEquipementLevage() { this.showEquipementLevageModal(); },
    editEquipementLevage(index) { this.showEquipementLevageModal(index); },

    showEquipementLevageModal(editIndex = null) {
        const equipements = DataManager.data.processus?.equipementLevage?.equipements || [];
        const item = editIndex !== null ? equipements[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="levageModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier' : 'Ajouter'} un équipement</h3>
                        <button class="close-btn" onclick="document.getElementById('levageModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Type *</label>
                            <select id="levageType" class="form-control">
                                <option value="grue" ${item?.type === 'grue' ? 'selected' : ''}>Grue</option>
                                <option value="nacelle" ${item?.type === 'nacelle' ? 'selected' : ''}>Nacelle</option>
                                <option value="chariot" ${item?.type === 'chariot' ? 'selected' : ''}>Chariot élévateur</option>
                                <option value="palan" ${item?.type === 'palan' ? 'selected' : ''}>Palan</option>
                                <option value="autre" ${item?.type === 'autre' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" id="levageDesc" class="form-control" value="${item?.description || ''}" placeholder="Ex: Grue 50T">
                        </div>
                        <div class="form-group">
                            <label>Capacité</label>
                            <input type="text" id="levageCapacite" class="form-control" value="${item?.capacite || ''}" placeholder="Ex: 50 tonnes">
                        </div>
                        <div class="form-group">
                            <label>Fournisseur</label>
                            <input type="text" id="levageFournisseur" class="form-control" value="${item?.fournisseur || ''}">
                        </div>
                        <div class="grid-2">
                            <div class="form-group">
                                <label>Date début</label>
                                <input type="date" id="levageDateDebut" class="form-control" value="${item?.dateDebut || ''}">
                            </div>
                            <div class="form-group">
                                <label>Date fin</label>
                                <input type="date" id="levageDateFin" class="form-control" value="${item?.dateFin || ''}">
                            </div>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('levageModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveEquipementLevage(${editIndex})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    saveEquipementLevage(editIndex = null) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.equipementLevage) DataManager.data.processus.equipementLevage = { equipements: [], travaux: {} };
        if (!DataManager.data.processus.equipementLevage.equipements) DataManager.data.processus.equipementLevage.equipements = [];

        const item = {
            type: document.getElementById('levageType').value,
            description: document.getElementById('levageDesc').value.trim(),
            capacite: document.getElementById('levageCapacite').value.trim(),
            fournisseur: document.getElementById('levageFournisseur').value.trim(),
            dateDebut: document.getElementById('levageDateDebut').value,
            dateFin: document.getElementById('levageDateFin').value,
            statut: 'demande'
        };

        if (editIndex !== null) {
            item.statut = DataManager.data.processus.equipementLevage.equipements[editIndex]?.statut || 'demande';
            DataManager.data.processus.equipementLevage.equipements[editIndex] = item;
        } else {
            DataManager.data.processus.equipementLevage.equipements.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('levageModal').remove();
        this.refresh();
        App.showToast('Équipement enregistré', 'success');
    },

    updateLevageStatut(index, statut) {
        if (DataManager.data.processus?.equipementLevage?.equipements?.[index]) {
            DataManager.data.processus.equipementLevage.equipements[index].statut = statut;
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    deleteEquipementLevage(index) {
        if (confirm('Supprimer cet équipement ?')) {
            DataManager.data.processus.equipementLevage.equipements.splice(index, 1);
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    addTravailLevage() {
        this.showSelectTravailModal('levage', 'Associer un travail au levage');
    },

    removeTravailLevage(uniqueId) {
        if (DataManager.data.processus?.equipementLevage?.travaux?.[uniqueId]) {
            delete DataManager.data.processus.equipementLevage.travaux[uniqueId];
            DataManager.saveToStorage();
            this.refresh();
        }
    },

    // ==========================================
    // PL12.0 - Espace clos
    // ==========================================

    espaceClosFiltre: '',

    renderDetailEspaceClos() {
        const travaux = DataManager.data.travaux || [];
        const espaceData = DataManager.data.processus?.espaceClos || {};

        // Filtrer les travaux contenant "EC" ou "EP" dans la description
        let travauxEspace = travaux.filter(t => {
            if (!t.description) return false;
            const desc = t.description.toUpperCase();
            // Recherche EC ou EP comme mot ou partie de mot
            return /\bEC\b|^EC\s|[\s\-_]EC[\s\-_]|[\s\-_]EC$|\bEP\b|^EP\s|[\s\-_]EP[\s\-_]|[\s\-_]EP$/.test(desc) ||
                   desc.includes(' EC ') || desc.includes(' EP ') ||
                   desc.includes('-EC-') || desc.includes('-EP-') ||
                   desc.includes('(EC)') || desc.includes('(EP)') ||
                   desc.startsWith('EC ') || desc.startsWith('EP ') ||
                   desc.endsWith(' EC') || desc.endsWith(' EP');
        });

        // Mapper avec uniqueId et données sauvegardées
        travauxEspace = travauxEspace.map((t) => {
            const travailIndex = travaux.findIndex(tr => tr === t);
            const uniqueId = `espace_${travailIndex}`;
            const espInfo = espaceData[uniqueId] || {};
            return { ...t, uniqueId, travailIndex, espInfo };
        });

        // Appliquer le filtre de recherche
        if (this.espaceClosFiltre) {
            const filtre = this.espaceClosFiltre.toLowerCase();
            travauxEspace = travauxEspace.filter(t =>
                (t.ot && t.ot.toString().toLowerCase().includes(filtre)) ||
                (t.description && t.description.toLowerCase().includes(filtre)) ||
                (t.equipement && t.equipement.toLowerCase().includes(filtre))
            );
        }

        // Stats
        const stats = {
            total: travauxEspace.length,
            permisEmis: travauxEspace.filter(t => t.espInfo.permisEmis).length,
            enAttente: travauxEspace.filter(t => !t.espInfo.permisEmis).length,
            hautRisque: travauxEspace.filter(t => t.espInfo.niveauRisque === 'haut').length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL12.0', 'Espace clos')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            <strong>Travaux en espace clos</strong> - Travaux contenant "EC" ou "EP" dans la description.
                            <br><small>Filtré automatiquement depuis la Liste des travaux.</small>
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.total}</span>
                                <span class="stat-label">Travaux EC/EP</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.hautRisque}</span>
                                <span class="stat-label">Haut risque</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.permisEmis}</span>
                                <span class="stat-label">Permis émis</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.enAttente}</span>
                                <span class="stat-label">En attente</span>
                            </div>
                        </div>
                    </div>

                    <!-- Filtre -->
                    <div class="detail-card planifier-card">
                        <div class="tpaa-filters">
                            <div class="filter-group">
                                <label>Rechercher:</label>
                                <input type="text" class="form-control" placeholder="OT, description, équipement..."
                                    value="${this.espaceClosFiltre}"
                                    oninput="ScreenPreparation.espaceClosFiltre = this.value; ScreenPreparation.refresh();">
                            </div>
                        </div>
                    </div>

                    <div class="detail-card planifier-card">
                        <h3>Travaux en espace clos (${travauxEspace.length})</h3>
                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>OT</th>
                                        <th>Description</th>
                                        <th>Équipement</th>
                                        <th>Discipline</th>
                                        <th>Heures</th>
                                        <th>Niveau risque</th>
                                        <th>Permis émis</th>
                                        <th>Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${travauxEspace.length === 0 ? `
                                        <tr><td colspan="8" class="empty-msg">Aucun travail contenant "EC" ou "EP" dans la description</td></tr>
                                    ` : travauxEspace.map(t => `
                                        <tr class="${t.espInfo.permisEmis ? 'row-success' : t.espInfo.niveauRisque === 'haut' ? 'row-danger' : ''}">
                                            <td><strong>${t.ot || '-'}</strong></td>
                                            <td title="${t.description || ''}">${(t.description || '-').substring(0, 40)}${(t.description || '').length > 40 ? '...' : ''}</td>
                                            <td>${t.equipement || '-'}</td>
                                            <td>${t.discipline || '-'}</td>
                                            <td class="center">${t.estimationHeures || '-'}</td>
                                            <td>
                                                <select class="mini-select ${t.espInfo.niveauRisque === 'haut' ? 'prio-haute' : t.espInfo.niveauRisque === 'moyen' ? 'prio-moyenne' : ''}"
                                                    onchange="ScreenPreparation.updateEspaceRisque('${t.uniqueId}', this.value)">
                                                    <option value="bas" ${!t.espInfo.niveauRisque || t.espInfo.niveauRisque === 'bas' ? 'selected' : ''}>Bas</option>
                                                    <option value="moyen" ${t.espInfo.niveauRisque === 'moyen' ? 'selected' : ''}>Moyen</option>
                                                    <option value="haut" ${t.espInfo.niveauRisque === 'haut' ? 'selected' : ''}>Haut</option>
                                                </select>
                                            </td>
                                            <td class="center">
                                                <input type="checkbox" ${t.espInfo.permisEmis ? 'checked' : ''}
                                                    onchange="ScreenPreparation.updateEspacePermis('${t.uniqueId}', this.checked)">
                                            </td>
                                            <td class="commentaire-cell">
                                                <div class="commentaire-wrapper">
                                                    <span class="commentaire-text">${(t.espInfo.commentaire || '').substring(0, 15)}${(t.espInfo.commentaire || '').length > 15 ? '...' : ''}</span>
                                                    <button class="btn-icon btn-edit-comment" onclick="ScreenPreparation.editEspaceComment('${t.uniqueId}')" title="Modifier">✏️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    ${this.renderPlanifierStatut('PL12.0')}
                </div>
            </div>
        `;
    },

    updateEspaceRisque(uniqueId, niveau) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.espaceClos) DataManager.data.processus.espaceClos = {};
        if (!DataManager.data.processus.espaceClos[uniqueId]) DataManager.data.processus.espaceClos[uniqueId] = {};
        DataManager.data.processus.espaceClos[uniqueId].niveauRisque = niveau;
        DataManager.saveToStorage();
        this.refresh();
    },

    updateEspacePermis(uniqueId, emis) {
        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.espaceClos) DataManager.data.processus.espaceClos = {};
        if (!DataManager.data.processus.espaceClos[uniqueId]) DataManager.data.processus.espaceClos[uniqueId] = {};
        DataManager.data.processus.espaceClos[uniqueId].permisEmis = emis;
        DataManager.saveToStorage();
        this.refresh();
    },

    editEspaceComment(uniqueId) {
        const data = DataManager.data.processus?.espaceClos?.[uniqueId] || {};
        this.showCommentModal('espaceClos', uniqueId, data.commentaire || '', 'Commentaire espace clos');
    },

    // ==========================================
    // Modals utilitaires partagés
    // ==========================================

    showCommentModal(type, uniqueId, currentComment, titre) {
        const html = `
            <div class="overlay-modal" id="genericCommentModal">
                <div class="overlay-box" style="max-width: 500px;">
                    <div class="overlay-header">
                        <h3>${titre}</h3>
                        <button class="close-btn" onclick="document.getElementById('genericCommentModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Commentaire</label>
                            <textarea id="genericCommentText" class="form-control" rows="4" placeholder="Notes...">${currentComment}</textarea>
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('genericCommentModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveGenericComment('${type}', '${uniqueId}')">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        document.getElementById('genericCommentText').focus();
    },

    saveGenericComment(type, uniqueId) {
        const commentaire = document.getElementById('genericCommentText').value.trim();
        const dataPath = {
            'entrepreneur': 'travauxEntrepreneur',
            'loto': 'verrouillage',
            'espaceClos': 'espaceClos'
        };

        const path = dataPath[type];
        if (!path) return;

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus[path]) DataManager.data.processus[path] = {};
        if (!DataManager.data.processus[path][uniqueId]) DataManager.data.processus[path][uniqueId] = {};

        DataManager.data.processus[path][uniqueId].commentaire = commentaire;
        DataManager.saveToStorage();
        document.getElementById('genericCommentModal').remove();
        this.refresh();
        App.showToast('Commentaire enregistré', 'success');
    },

    showSelectTravailModal(type, titre) {
        const travaux = DataManager.data.travaux || [];
        const dataPath = {
            'loto': 'verrouillage',
            'levage': 'equipementLevage',
            'espaceClos': 'espaceClos'
        };

        const html = `
            <div class="overlay-modal" id="selectTravailModal">
                <div class="overlay-box" style="max-width: 700px;">
                    <div class="overlay-header">
                        <h3>${titre}</h3>
                        <button class="close-btn" onclick="document.getElementById('selectTravailModal').remove()">✕</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Rechercher un travail</label>
                            <input type="text" id="searchTravailInput" class="form-control" placeholder="OT, description..."
                                oninput="ScreenPreparation.filterTravailList()">
                        </div>
                        <div class="travail-list-container" id="travailListContainer" style="max-height: 300px; overflow-y: auto;">
                            ${travaux.slice(0, 50).map((t, i) => `
                                <div class="travail-list-item" data-index="${i}" onclick="ScreenPreparation.selectTravailForType('${type}', ${i})">
                                    <strong>${t.ot || '-'}</strong> - ${(t.description || '').substring(0, 50)}...
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('selectTravailModal').remove()">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    filterTravailList() {
        const search = document.getElementById('searchTravailInput').value.toLowerCase();
        const items = document.querySelectorAll('.travail-list-item');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(search) ? 'block' : 'none';
        });
    },

    selectTravailForType(type, index) {
        const uniqueId = `${type === 'levage' ? 'levage' : type === 'loto' ? 'loto' : 'espace'}_${index}`;

        if (!DataManager.data.processus) DataManager.data.processus = {};

        if (type === 'loto') {
            if (!DataManager.data.processus.verrouillage) DataManager.data.processus.verrouillage = {};
            DataManager.data.processus.verrouillage[uniqueId] = { requis: true, statut: 'en_attente' };
        } else if (type === 'levage') {
            if (!DataManager.data.processus.equipementLevage) DataManager.data.processus.equipementLevage = { equipements: [], travaux: {} };
            if (!DataManager.data.processus.equipementLevage.travaux) DataManager.data.processus.equipementLevage.travaux = {};
            DataManager.data.processus.equipementLevage.travaux[uniqueId] = { requis: true };
        } else if (type === 'espaceClos') {
            if (!DataManager.data.processus.espaceClos) DataManager.data.processus.espaceClos = {};
            DataManager.data.processus.espaceClos[uniqueId] = { requis: true, niveauRisque: 'moyen' };
        }

        DataManager.saveToStorage();
        document.getElementById('selectTravailModal').remove();
        this.refresh();
        App.showToast('Travail ajouté', 'success');
    },

    // ==========================================
    // Fonctions utilitaires pour recherche d'Ordre et Documents
    // ==========================================

    // Recherche dans les travaux importés par numéro d'ordre
    rechercherOrdre(prefix, valeur) {
        if (!valeur || valeur.length < 2) {
            // Réinitialiser l'indicateur si la valeur est trop courte
            const indicator = document.getElementById(`${prefix}SearchIndicator`);
            if (indicator) indicator.innerHTML = '';
            return;
        }

        const travaux = this.getTravauxImportes();
        const travailTrouve = travaux.find(t =>
            (t.ot && t.ot.toString().toLowerCase() === valeur.toLowerCase()) ||
            (t.ordre && t.ordre.toString().toLowerCase() === valeur.toLowerCase())
        );

        const indicator = document.getElementById(`${prefix}SearchIndicator`);

        if (travailTrouve) {
            // Trouvé - remplir automatiquement les champs
            if (indicator) indicator.innerHTML = '<span style="color: var(--success);">✓ Trouvé</span>';

            // Remplir les champs selon le préfixe
            const designationField = document.getElementById(`${prefix}Designation`);
            const posteTechniqueField = document.getElementById(`${prefix}PosteTechnique`);
            const dureeField = document.getElementById(`${prefix}Duree`);

            if (designationField && !designationField.value) {
                designationField.value = travailTrouve.description || travailTrouve.designation || '';
            }
            if (posteTechniqueField && !posteTechniqueField.value) {
                posteTechniqueField.value = travailTrouve.localisation || travailTrouve.posteTechnique || travailTrouve.secteur || '';
            }
            if (dureeField && !dureeField.value) {
                dureeField.value = travailTrouve.estimationHeures || travailTrouve.duree || '';
            }
        } else {
            // Recherche partielle
            const correspondances = travaux.filter(t =>
                (t.ot && t.ot.toString().toLowerCase().includes(valeur.toLowerCase())) ||
                (t.ordre && t.ordre.toString().toLowerCase().includes(valeur.toLowerCase()))
            );

            if (correspondances.length > 0 && correspondances.length <= 5) {
                if (indicator) indicator.innerHTML = `<span style="color: var(--warning);">${correspondances.length} suggestion(s)</span>`;
            } else if (correspondances.length > 5) {
                if (indicator) indicator.innerHTML = '<span style="color: var(--muted);">Continuez à taper...</span>';
            } else {
                if (indicator) indicator.innerHTML = '<span style="color: var(--muted);">Non trouvé</span>';
            }
        }
    },

    // Gestion des documents
    addDocument(prefix) {
        const inputId = `${prefix}NewDoc`;
        const listId = `${prefix}Documents`;
        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);

        if (!input || !input.value.trim()) {
            App.showToast('Entrez un chemin ou nom de fichier', 'warning');
            return;
        }

        const doc = input.value.trim();

        // Ajouter au tableau temporaire
        if (!this.tempDocuments) this.tempDocuments = {};
        if (!this.tempDocuments[prefix]) this.tempDocuments[prefix] = [];
        this.tempDocuments[prefix].push(doc);

        // Mettre à jour l'affichage
        const docIndex = this.tempDocuments[prefix].length - 1;
        const docHtml = `
            <div class="document-item">
                <span>📎 ${doc}</span>
                <button type="button" class="btn-icon danger" onclick="ScreenPreparation.removeDocument('${prefix}', ${docIndex})">✕</button>
            </div>
        `;
        list.insertAdjacentHTML('beforeend', docHtml);

        // Vider l'input
        input.value = '';
    },

    removeDocument(prefix, index) {
        if (!this.tempDocuments || !this.tempDocuments[prefix]) return;

        this.tempDocuments[prefix].splice(index, 1);

        // Rafraîchir l'affichage de la liste
        const listId = `${prefix}Documents`;
        const list = document.getElementById(listId);
        if (list) {
            list.innerHTML = this.tempDocuments[prefix].map((doc, i) => `
                <div class="document-item">
                    <span>📎 ${doc}</span>
                    <button type="button" class="btn-icon danger" onclick="ScreenPreparation.removeDocument('${prefix}', ${i})">✕</button>
                </div>
            `).join('');
        }
    }
,

    // ==========================================
    // PL17.0 - Plan d'aménagement AA
    // ==========================================

    planAmenagementZoom: 1,
    planAmenagementSelectedRoulotte: null,

    renderDetailPlanAmenagement() {
        const amenagementData = DataManager.data.processus?.planAmenagement || {};
        const roulottes = amenagementData.roulottesExternes || [];
        const placements = amenagementData.placements || [];

        // Stats
        const stats = {
            totalRoulottes: roulottes.reduce((sum, r) => sum + (parseInt(r.nombre) || 0), 0),
            externes: roulottes.length,
            placees: placements.length
        };

        return `
            <div class="detail-screen planifier-screen">
                ${this.renderPlanifierHeader('PL17.0', 'Plan d\'aménagement AA')}

                <div class="detail-body planifier-body">
                    <div class="detail-card planifier-card info-card">
                        <p class="info-text">
                            <strong>Plan d'aménagement des roulottes</strong> - Gérez les roulottes externes et leur emplacement sur le site.
                        </p>
                    </div>

                    <!-- Résumé -->
                    <div class="detail-card planifier-card">
                        <div class="commande-resume">
                            <div class="resume-stat">
                                <span class="stat-value">${stats.externes}</span>
                                <span class="stat-label">Externes</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.totalRoulottes}</span>
                                <span class="stat-label">Roulottes totales</span>
                            </div>
                            <div class="resume-stat">
                                <span class="stat-value">${stats.placees}</span>
                                <span class="stat-label">Placées sur plan</span>
                            </div>
                        </div>
                    </div>

                    <!-- Tableau des roulottes externes -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>Roulottes par externes (${roulottes.length})</h3>
                            <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.addRoulotteExterne()">+ Ajouter</button>
                        </div>
                        <div class="table-container">
                            <table class="planifier-table">
                                <thead>
                                    <tr>
                                        <th>Externe</th>
                                        <th>Dimension roulotte</th>
                                        <th>Nombre</th>
                                        <th>Localisation</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${roulottes.length === 0 ? `
                                        <tr><td colspan="5" class="empty-msg">Aucune roulotte externe définie</td></tr>
                                    ` : roulottes.map((r, i) => `
                                        <tr>
                                            <td><strong>${r.externe || '-'}</strong></td>
                                            <td>${r.dimension || '-'}</td>
                                            <td>${r.nombre || 0}</td>
                                            <td>${r.localisation || '-'}</td>
                                            <td>
                                                <button class="btn-icon" onclick="ScreenPreparation.editRoulotteExterne(${i})" title="Modifier">&#9998;</button>
                                                <button class="btn-icon danger" onclick="ScreenPreparation.deleteRoulotteExterne(${i})" title="Supprimer">&#10005;</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Plan d'aménagement -->
                    <div class="detail-card planifier-card">
                        <div class="card-header-flex">
                            <h3>Plan d'aménagement</h3>
                            <div class="plan-controls">
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.zoomPlan(-0.1)">-</button>
                                <span id="planZoomLevel">${Math.round(this.planAmenagementZoom * 100)}%</span>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.zoomPlan(0.1)">+</button>
                                <button class="btn btn-sm btn-outline" onclick="ScreenPreparation.resetZoomPlan()">Reset</button>
                                <button class="btn btn-sm btn-primary" onclick="ScreenPreparation.uploadPlanImage()">Charger image</button>
                            </div>
                        </div>

                        <div class="plan-amenagement-container" id="planAmenagementContainer"
                             ondragover="event.preventDefault()"
                             ondrop="ScreenPreparation.onPlanDrop(event)">
                            <div class="plan-amenagement-canvas" id="planAmenagementCanvas"
                                 style="transform: scale(${this.planAmenagementZoom})"
                                 onclick="ScreenPreparation.onPlanClick(event)">

                                ${amenagementData.planImage ? `
                                    <img src="${amenagementData.planImage}" alt="Plan du site" class="plan-background-image">
                                ` : `
                                    <div class="plan-placeholder">
                                        <p>Cliquez sur "Charger image" pour ajouter un plan du site</p>
                                        <p class="plan-hint">Glissez-déposez des roulottes depuis la palette ci-dessous</p>
                                    </div>
                                `}

                                <!-- Roulottes placées -->
                                ${placements.map((p, i) => `
                                    <div class="roulotte-marker ${this.planAmenagementSelectedRoulotte === i ? 'selected' : ''}"
                                         style="left: ${p.x}%; top: ${p.y}%"
                                         onclick="event.stopPropagation(); ScreenPreparation.selectRoulottePlacement(${i})"
                                         draggable="true"
                                         ondragstart="ScreenPreparation.onRoulotteDragStart(event, ${i})"
                                         title="${p.externe} - ${p.dimension}">
                                        <span class="roulotte-icon">&#128656;</span>
                                        <span class="roulotte-label">${p.externe}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Palette des roulottes à placer -->
                        <div class="roulotte-palette">
                            <h4>Roulottes à placer (glisser-déposer sur le plan):</h4>
                            <div class="palette-items">
                                ${roulottes.length === 0 ? `
                                    <p class="empty-msg">Ajoutez d'abord des roulottes dans le tableau ci-dessus</p>
                                ` : roulottes.map((r, i) => {
                                    const placedCount = placements.filter(p => p.roulotteIndex === i).length;
                                    const remaining = (parseInt(r.nombre) || 0) - placedCount;
                                    return `
                                        <div class="palette-item ${remaining <= 0 ? 'disabled' : ''}"
                                             draggable="${remaining > 0}"
                                             ondragstart="ScreenPreparation.onPaletteDragStart(event, ${i})"
                                             data-roulotte-index="${i}">
                                            <span class="palette-icon">&#128656;</span>
                                            <span class="palette-info">
                                                <strong>${r.externe}</strong>
                                                <small>${r.dimension}</small>
                                            </span>
                                            <span class="palette-count">${remaining}/${r.nombre || 0}</span>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>

                        <!-- Actions sur roulotte sélectionnée -->
                        ${this.planAmenagementSelectedRoulotte !== null ? `
                            <div class="roulotte-actions">
                                <button class="btn btn-sm btn-danger" onclick="ScreenPreparation.removeRoulottePlacement(${this.planAmenagementSelectedRoulotte})">
                                    Retirer du plan
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    ${this.renderPlanifierStatut('PL17.0')}
                </div>
            </div>
        `;
    },

    // Gestion des roulottes externes (tableau)
    addRoulotteExterne() {
        this.showRoulotteExterneModal();
    },

    editRoulotteExterne(index) {
        this.showRoulotteExterneModal(index);
    },

    showRoulotteExterneModal(editIndex = null) {
        const roulottes = DataManager.data.processus?.planAmenagement?.roulottesExternes || [];
        const item = editIndex !== null ? roulottes[editIndex] : null;

        const html = `
            <div class="overlay-modal" id="roulotteModal">
                <div class="overlay-box">
                    <div class="overlay-header">
                        <h3>${item ? 'Modifier' : 'Ajouter'} une roulotte externe</h3>
                        <button class="close-btn" onclick="document.getElementById('roulotteModal').remove()">&#10005;</button>
                    </div>
                    <div class="overlay-body">
                        <div class="form-group">
                            <label>Externe (entrepreneur) *</label>
                            <input type="text" id="roulotteExterne" class="form-control"
                                   value="${item?.externe || ''}" placeholder="Nom de l'entrepreneur">
                        </div>
                        <div class="form-group">
                            <label>Dimension de la roulotte</label>
                            <select id="roulotteDimension" class="form-control">
                                <option value="">-- Sélectionner --</option>
                                <option value="Petite (20 pieds)" ${item?.dimension === 'Petite (20 pieds)' ? 'selected' : ''}>Petite (20 pieds)</option>
                                <option value="Moyenne (40 pieds)" ${item?.dimension === 'Moyenne (40 pieds)' ? 'selected' : ''}>Moyenne (40 pieds)</option>
                                <option value="Grande (53 pieds)" ${item?.dimension === 'Grande (53 pieds)' ? 'selected' : ''}>Grande (53 pieds)</option>
                                <option value="Double" ${item?.dimension === 'Double' ? 'selected' : ''}>Double</option>
                                <option value="Autre" ${item?.dimension === 'Autre' ? 'selected' : ''}>Autre</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Nombre de roulottes</label>
                            <input type="number" id="roulotteNombre" class="form-control"
                                   value="${item?.nombre || 1}" min="1" max="50">
                        </div>
                        <div class="form-group">
                            <label>Localisation prévue</label>
                            <input type="text" id="roulotteLocalisation" class="form-control"
                                   value="${item?.localisation || ''}" placeholder="Ex: Zone Nord, Parking B...">
                        </div>
                    </div>
                    <div class="overlay-footer">
                        <button class="btn btn-outline" onclick="document.getElementById('roulotteModal').remove()">Annuler</button>
                        <button class="btn btn-primary" onclick="ScreenPreparation.saveRoulotteExterne(${editIndex})">Enregistrer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    saveRoulotteExterne(editIndex = null) {
        const externe = document.getElementById('roulotteExterne').value.trim();
        if (!externe) {
            App.showToast('Le nom de l\'externe est requis', 'warning');
            return;
        }

        if (!DataManager.data.processus) DataManager.data.processus = {};
        if (!DataManager.data.processus.planAmenagement) DataManager.data.processus.planAmenagement = { roulottesExternes: [], placements: [] };
        if (!DataManager.data.processus.planAmenagement.roulottesExternes) DataManager.data.processus.planAmenagement.roulottesExternes = [];

        const item = {
            externe: externe,
            dimension: document.getElementById('roulotteDimension').value,
            nombre: parseInt(document.getElementById('roulotteNombre').value) || 1,
            localisation: document.getElementById('roulotteLocalisation').value.trim()
        };

        if (editIndex !== null) {
            DataManager.data.processus.planAmenagement.roulottesExternes[editIndex] = item;
        } else {
            DataManager.data.processus.planAmenagement.roulottesExternes.push(item);
        }

        DataManager.saveToStorage();
        document.getElementById('roulotteModal').remove();
        this.refresh();
        App.showToast('Roulotte enregistrée', 'success');
    },

    deleteRoulotteExterne(index) {
        if (confirm('Supprimer cette roulotte externe ?')) {
            DataManager.data.processus.planAmenagement.roulottesExternes.splice(index, 1);
            // Supprimer aussi les placements associés
            if (DataManager.data.processus.planAmenagement.placements) {
                DataManager.data.processus.planAmenagement.placements =
                    DataManager.data.processus.planAmenagement.placements.filter(p => p.roulotteIndex !== index);
                // Mettre à jour les index
                DataManager.data.processus.planAmenagement.placements.forEach(p => {
                    if (p.roulotteIndex > index) p.roulotteIndex--;
                });
            }
            DataManager.saveToStorage();
            this.refresh();
            App.showToast('Roulotte supprimée', 'success');
        }
    },

    // Gestion du plan
    zoomPlan(delta) {
        this.planAmenagementZoom = Math.max(0.5, Math.min(2, this.planAmenagementZoom + delta));
        const canvas = document.getElementById('planAmenagementCanvas');
        const zoomLabel = document.getElementById('planZoomLevel');
        if (canvas) canvas.style.transform = `scale(${this.planAmenagementZoom})`;
        if (zoomLabel) zoomLabel.textContent = `${Math.round(this.planAmenagementZoom * 100)}%`;
    },

    resetZoomPlan() {
        this.planAmenagementZoom = 1;
        const canvas = document.getElementById('planAmenagementCanvas');
        const zoomLabel = document.getElementById('planZoomLevel');
        if (canvas) canvas.style.transform = 'scale(1)';
        if (zoomLabel) zoomLabel.textContent = '100%';
    },

    uploadPlanImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (!DataManager.data.processus) DataManager.data.processus = {};
                    if (!DataManager.data.processus.planAmenagement) DataManager.data.processus.planAmenagement = { roulottesExternes: [], placements: [] };
                    DataManager.data.processus.planAmenagement.planImage = event.target.result;
                    DataManager.saveToStorage();
                    this.refresh();
                    App.showToast('Image du plan chargée', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    },

    onPlanClick(event) {
        // Désélectionner si on clique sur le plan (pas sur une roulotte)
        this.planAmenagementSelectedRoulotte = null;
        this.refresh();
    },

    onPlanDrop(event) {
        event.preventDefault();
        const container = document.getElementById('planAmenagementContainer');
        const canvas = document.getElementById('planAmenagementCanvas');
        if (!container || !canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;

        // Vérifier les limites
        if (x < 0 || x > 100 || y < 0 || y > 100) return;

        const data = event.dataTransfer.getData('text/plain');

        if (this.draggingPaletteIndex !== undefined && this.draggingPaletteIndex !== null) {
            // Placement depuis la palette
            this.placeRoulotteFromPalette(this.draggingPaletteIndex, x, y);
            this.draggingPaletteIndex = null;
        } else if (this.draggingPlacementIndex !== undefined && this.draggingPlacementIndex !== null) {
            // Déplacement d'une roulotte existante
            this.moveRoulottePlacement(this.draggingPlacementIndex, x, y);
            this.draggingPlacementIndex = null;
        }
    },

    onPaletteDragStart(event, roulotteIndex) {
        this.draggingPaletteIndex = roulotteIndex;
        this.draggingPlacementIndex = null;
        event.dataTransfer.setData('text/plain', 'palette_' + roulotteIndex);
        event.dataTransfer.effectAllowed = 'copy';
    },

    onRoulotteDragStart(event, placementIndex) {
        this.draggingPlacementIndex = placementIndex;
        this.draggingPaletteIndex = null;
        event.dataTransfer.setData('text/plain', 'placement_' + placementIndex);
        event.dataTransfer.effectAllowed = 'move';
    },

    placeRoulotteFromPalette(roulotteIndex, x, y) {
        const roulottes = DataManager.data.processus?.planAmenagement?.roulottesExternes || [];
        const roulotte = roulottes[roulotteIndex];
        if (!roulotte) return;

        if (!DataManager.data.processus.planAmenagement.placements) {
            DataManager.data.processus.planAmenagement.placements = [];
        }

        // Vérifier qu'on n'a pas dépassé le nombre de roulottes
        const placements = DataManager.data.processus.planAmenagement.placements;
        const placedCount = placements.filter(p => p.roulotteIndex === roulotteIndex).length;
        if (placedCount >= (parseInt(roulotte.nombre) || 0)) {
            App.showToast('Toutes les roulottes de cet externe sont déjà placées', 'warning');
            return;
        }

        placements.push({
            roulotteIndex: roulotteIndex,
            externe: roulotte.externe,
            dimension: roulotte.dimension,
            x: x,
            y: y
        });

        DataManager.saveToStorage();
        this.refresh();
        App.showToast('Roulotte placée sur le plan', 'success');
    },

    moveRoulottePlacement(placementIndex, x, y) {
        const placements = DataManager.data.processus?.planAmenagement?.placements;
        if (!placements || !placements[placementIndex]) return;

        placements[placementIndex].x = x;
        placements[placementIndex].y = y;
        DataManager.saveToStorage();
        this.refresh();
    },

    selectRoulottePlacement(index) {
        this.planAmenagementSelectedRoulotte = index;
        this.refresh();
    },

    removeRoulottePlacement(index) {
        if (!DataManager.data.processus?.planAmenagement?.placements) return;
        DataManager.data.processus.planAmenagement.placements.splice(index, 1);
        this.planAmenagementSelectedRoulotte = null;
        DataManager.saveToStorage();
        this.refresh();
        App.showToast('Roulotte retirée du plan', 'success');
    }
};
