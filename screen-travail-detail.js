/**
 * Écran Détail Travail - Pleine page
 * Design similaire à l'image de référence
 */

const ScreenTravailDetail = {
    currentTravailId: null,

    render(travailId) {
        this.currentTravailId = travailId;
        const travail = DataManager.getTravail(travailId);

        if (!travail) {
            return '<p class="empty-msg">Travail non trouvé</p>';
        }

        return `
            <div class="travail-detail-screen">
                <!-- Header avec retour -->
                <div class="travail-detail-header">
                    <button class="back-btn" onclick="App.navigate('travaux')">
                        ← Retour à la liste
                    </button>
                    <div class="travail-title">
                        <h2>OT ${travail.ot}</h2>
                        <span class="travail-status-badge ${this.getPriorityClass(travail.priorite)}">
                            ${travail.priorite || 'Normale'}
                        </span>
                    </div>
                </div>

                <!-- Contenu en 2 colonnes -->
                <div class="travail-detail-body">
                    <!-- Colonne gauche -->
                    <div class="travail-detail-left">

                        <!-- Section En-tête / Infos principales -->
                        <div class="detail-section">
                            <div class="section-title">Informations générales</div>
                            <div class="info-table">
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">Ordre</span>
                                        <span class="cell-value">${travail.ot}</span>
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">Opé.</span>
                                        <span class="cell-value">${travail.operation || '-'}</span>
                                    </div>
                                </div>
                                <div class="info-row-full">
                                    <span class="cell-label">Désign. opér.</span>
                                    <span class="cell-value">${travail.description}</span>
                                </div>
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">Poste technique</span>
                                        <span class="cell-value">${travail.equipement || '-'}</span>
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">Désignation</span>
                                        <span class="cell-value">${travail.localisation || '-'}</span>
                                    </div>
                                </div>
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">Entreprise externe</span>
                                        <span class="cell-value">${travail.entreprise || '-'}</span>
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">Heures estimées</span>
                                        <span class="cell-value">${travail.estimationHeures || 0}h</span>
                                    </div>
                                </div>
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">Priorité</span>
                                        <span class="cell-value">${travail.priorite || '-'}</span>
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">Discipline</span>
                                        <span class="cell-value">${travail.discipline || '-'}</span>
                                    </div>
                                </div>
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">Révision</span>
                                        <span class="cell-value">${this.getRevision(travail)}</span>
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">Statut</span>
                                        <span class="cell-value">${travail.statut || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section Préparation -->
                        <div class="detail-section">
                            <div class="section-title section-green">Préparation</div>
                            <div class="info-table">
                                <div class="info-row-2col">
                                    <div class="info-cell">
                                        <span class="cell-label">N° DA / PO</span>
                                        <input type="text" class="cell-input"
                                               value="${travail.preparation?.numDA || ''}"
                                               placeholder="Soum."
                                               onchange="ScreenTravailDetail.updateField('preparation.numDA', this.value)">
                                    </div>
                                    <div class="info-cell">
                                        <span class="cell-label">État</span>
                                        <select class="cell-input" onchange="ScreenTravailDetail.updateField('preparation.etatDA', this.value)">
                                            <option value="">-</option>
                                            <option value="Fait" ${travail.preparation?.etatDA === 'Fait' ? 'selected' : ''}>Fait</option>
                                            <option value="En cours" ${travail.preparation?.etatDA === 'En cours' ? 'selected' : ''}>En cours</option>
                                            <option value="À faire" ${travail.preparation?.etatDA === 'À faire' ? 'selected' : ''}>À faire</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="info-row-full">
                                    <span class="cell-label">Budget</span>
                                    <input type="text" class="cell-input"
                                           value="${travail.preparation?.budget || ''}"
                                           onchange="ScreenTravailDetail.updateField('preparation.budget', this.value)">
                                </div>
                            </div>
                        </div>

                        <!-- Section Réservation -->
                        <div class="detail-section">
                            <div class="section-title">Réservation</div>
                            <table class="mini-table">
                                <thead>
                                    <tr>
                                        <th>Catégorie</th>
                                        <th>Type</th>
                                        <th>Réservations</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderReservations(travail)}
                                </tbody>
                            </table>
                            <button class="btn-add" onclick="ScreenTravailDetail.addReservation()">+ Ajouter</button>
                        </div>

                        <!-- Section Taches Cognibox -->
                        <div class="detail-section">
                            <div class="section-title">Taches Cognibox</div>
                            <table class="mini-table">
                                <thead>
                                    <tr>
                                        <th>Date Début</th>
                                        <th>Date fin</th>
                                        <th>Numéro de la tache</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderTachesCognibox(travail)}
                                </tbody>
                            </table>
                            <button class="btn-add" onclick="ScreenTravailDetail.addTacheCognibox()">+ Ajouter</button>
                        </div>

                        <!-- Section Avis Synd. -->
                        <div class="detail-section">
                            <div class="section-title">Avis Synd.</div>
                            <table class="mini-table">
                                <thead>
                                    <tr>
                                        <th>Date Début</th>
                                        <th>Date fin</th>
                                        <th>État</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.renderAvisSynd(travail)}
                                </tbody>
                            </table>
                            <button class="btn-add" onclick="ScreenTravailDetail.addAvisSynd()">+ Ajouter</button>
                        </div>

                        <!-- Section Responsables -->
                        <div class="detail-section">
                            <div class="section-title">Responsables</div>
                            <div class="responsables-list">
                                ${this.renderResponsables(travail)}
                            </div>
                        </div>

                        <!-- Section Commentaire Principal (lié à la liste des travaux) -->
                        <div class="detail-section">
                            <div class="section-title">Commentaire</div>
                            <textarea class="full-textarea commentaire-principal"
                                      id="commentairePrincipal"
                                      placeholder="Commentaire principal visible dans la liste des travaux..."
                                      onchange="ScreenTravailDetail.updateCommentairePrincipal(this.value)">${travail.commentaire || ''}</textarea>
                            <p class="hint-text">Ce commentaire apparaît dans la colonne "Commentaire" de la liste des travaux.</p>
                        </div>

                        <!-- Section Historique Commentaires -->
                        <div class="detail-section">
                            <div class="section-title">Historique des commentaires</div>
                            <div class="comments-box">
                                ${this.renderCommentaires(travail)}
                            </div>
                            <div class="comment-add-inline">
                                <textarea id="newCommentTravail" placeholder="Ajouter un commentaire avec horodatage..."></textarea>
                                <button class="btn btn-primary btn-sm" onclick="ScreenTravailDetail.addComment()">Ajouter</button>
                            </div>
                        </div>

                        <!-- Section Verrouillage -->
                        <div class="detail-section">
                            <div class="section-title">Verrouillage</div>
                            <textarea class="full-textarea"
                                      placeholder="Informations de verrouillage..."
                                      onchange="ScreenTravailDetail.updateField('verrouillage', this.value)">${travail.verrouillage || ''}</textarea>
                        </div>
                    </div>

                    <!-- Colonne droite -->
                    <div class="travail-detail-right">

                        <!-- Section Préparation (droite) -->
                        <div class="detail-section section-border-green">
                            <div class="section-title section-green">Préparation</div>

                            <div class="photos-row">
                                <span class="photos-label">Photos PREP</span>
                                ${this.renderPhotoSlots('PPREP', 8, travail)}
                            </div>

                            <div class="links-row">
                                <span class="links-label">Liens Documents</span>
                                <button class="btn-icon-small" onclick="ScreenTravailDetail.addDocument('preparation')" title="Ajouter document">📎</button>
                                <button class="btn-icon-small" onclick="ScreenTravailDetail.sendEmail('preparation')" title="Envoyer par email">✉️</button>
                            </div>
                        </div>

                        <!-- Section Santé - Sécurité (droite) -->
                        <div class="detail-section section-border-orange">
                            <div class="section-title section-orange">Santé - Sécurité</div>

                            <table class="mini-table sst-table">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Validité</th>
                                        <th>Commentaire</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Ideers5</td>
                                        <td><input type="checkbox" ${travail.sst?.ideers5 ? 'checked' : ''} onchange="ScreenTravailDetail.updateSST('ideers5', this.checked)"></td>
                                        <td><input type="text" class="cell-input" value="${travail.sst?.ideers5Comment || ''}" onchange="ScreenTravailDetail.updateSST('ideers5Comment', this.value)"></td>
                                    </tr>
                                    <tr>
                                        <td>CCC</td>
                                        <td><input type="checkbox" ${travail.sst?.ccc ? 'checked' : ''} onchange="ScreenTravailDetail.updateSST('ccc', this.checked)"></td>
                                        <td><input type="text" class="cell-input" value="${travail.sst?.cccComment || ''}" onchange="ScreenTravailDetail.updateSST('cccComment', this.value)"></td>
                                    </tr>
                                    <tr>
                                        <td>Verrouillage</td>
                                        <td><input type="checkbox" ${travail.sst?.verrouillageSST ? 'checked' : ''} onchange="ScreenTravailDetail.updateSST('verrouillageSST', this.checked)"></td>
                                        <td><input type="text" class="cell-input" value="${travail.sst?.verrouillageComment || ''}" onchange="ScreenTravailDetail.updateSST('verrouillageComment', this.value)"></td>
                                    </tr>
                                    <tr>
                                        <td>Balisage</td>
                                        <td><input type="checkbox" ${travail.sst?.balisage ? 'checked' : ''} onchange="ScreenTravailDetail.updateSST('balisage', this.checked)"></td>
                                        <td><input type="text" class="cell-input" value="${travail.sst?.balisageComment || ''}" onchange="ScreenTravailDetail.updateSST('balisageComment', this.value)"></td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="photos-row">
                                <span class="photos-label">Photos SST</span>
                                ${this.renderPhotoSlots('PSST', 8, travail)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render des réservations
    renderReservations(travail) {
        const reservations = travail.reservations || [
            { categorie: 'Nacelles', type: '', etat: 'À Réserver' },
            { categorie: 'Grue', type: '', etat: 'Non' },
            { categorie: 'Échafaudages', type: '', etat: 'À Réserver' }
        ];

        return reservations.map((r, i) => `
            <tr>
                <td>${r.categorie}</td>
                <td><input type="text" class="cell-input" value="${r.type || ''}" onchange="ScreenTravailDetail.updateReservation(${i}, 'type', this.value)"></td>
                <td>
                    <select class="cell-input reservation-status ${this.getReservationClass(r.etat)}"
                            onchange="ScreenTravailDetail.updateReservation(${i}, 'etat', this.value)">
                        <option value="À Réserver" ${r.etat === 'À Réserver' ? 'selected' : ''}>À Réserver</option>
                        <option value="Réservé" ${r.etat === 'Réservé' ? 'selected' : ''}>Réservé</option>
                        <option value="Non" ${r.etat === 'Non' ? 'selected' : ''}>Non</option>
                    </select>
                </td>
            </tr>
        `).join('');
    },

    // Render des tâches Cognibox
    renderTachesCognibox(travail) {
        const taches = travail.tachesCognibox || [];
        if (taches.length === 0) {
            return '<tr><td colspan="3" class="empty-cell">Aucune tâche</td></tr>';
        }
        return taches.map((t, i) => `
            <tr>
                <td><input type="date" class="cell-input" value="${t.dateDebut || ''}" onchange="ScreenTravailDetail.updateTacheCognibox(${i}, 'dateDebut', this.value)"></td>
                <td><input type="date" class="cell-input" value="${t.dateFin || ''}" onchange="ScreenTravailDetail.updateTacheCognibox(${i}, 'dateFin', this.value)"></td>
                <td><input type="text" class="cell-input" value="${t.numero || ''}" onchange="ScreenTravailDetail.updateTacheCognibox(${i}, 'numero', this.value)"></td>
            </tr>
        `).join('');
    },

    // Render des avis syndicaux
    renderAvisSynd(travail) {
        const avis = travail.avisSynd || [];
        if (avis.length === 0) {
            return '<tr><td colspan="3" class="empty-cell">Aucun avis</td></tr>';
        }
        return avis.map((a, i) => `
            <tr>
                <td><input type="date" class="cell-input" value="${a.dateDebut || ''}" onchange="ScreenTravailDetail.updateAvisSynd(${i}, 'dateDebut', this.value)"></td>
                <td><input type="date" class="cell-input" value="${a.dateFin || ''}" onchange="ScreenTravailDetail.updateAvisSynd(${i}, 'dateFin', this.value)"></td>
                <td>
                    <select class="cell-input etat-status ${a.etat === 'Fait' ? 'etat-fait' : ''}"
                            onchange="ScreenTravailDetail.updateAvisSynd(${i}, 'etat', this.value)">
                        <option value="À faire" ${a.etat === 'À faire' ? 'selected' : ''}>À faire</option>
                        <option value="Fait" ${a.etat === 'Fait' ? 'selected' : ''}>Fait</option>
                    </select>
                </td>
            </tr>
        `).join('');
    },

    // Render des responsables
    renderResponsables(travail) {
        const responsables = travail.responsables || [];
        const today = new Date().toLocaleDateString('fr-FR');

        let html = `<div class="resp-header">
            <span>Aujourd'hui</span>
            <span>Resp</span>
            <span>Nom</span>
            <span>Jours</span>
        </div>`;

        if (responsables.length === 0) {
            html += `<div class="resp-row">
                <span>${today}</span>
                <span>-</span>
                <span>-</span>
                <span>-</span>
            </div>`;
        } else {
            responsables.forEach(r => {
                html += `<div class="resp-row">
                    <span>${r.date || today}</span>
                    <span>${r.role || 'Resp'}</span>
                    <span>${r.nom}</span>
                    <span>${r.jours || '-'}</span>
                </div>`;
            });
        }

        return html;
    },

    // Render des commentaires
    renderCommentaires(travail) {
        const comments = DataManager.getComments(travail.id);
        if (comments.length === 0) {
            return '<p class="empty-text">Aucun commentaire</p>';
        }
        return comments.map(c => `
            <div class="comment-item">
                <span class="comment-text">${c.text}</span>
                <span class="comment-meta">${c.author} - ${new Date(c.date).toLocaleDateString('fr-FR')}</span>
            </div>
        `).join('');
    },

    // Render des slots photo
    renderPhotoSlots(prefix, count, travail) {
        let html = '<div class="photo-slots">';
        for (let i = 1; i <= count; i++) {
            const photoKey = `${prefix}${i}`;
            const hasPhoto = travail.photos && travail.photos[photoKey];
            html += `<div class="photo-slot ${hasPhoto ? 'has-photo' : ''}"
                         onclick="ScreenTravailDetail.handlePhoto('${photoKey}')"
                         title="${photoKey}">
                ${hasPhoto ? '📷' : photoKey}
            </div>`;
        }
        html += '</div>';
        return html;
    },

    // === ACTIONS ===

    updateCommentairePrincipal(value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail) return;

        travail.commentaire = value;
        DataManager.saveToStorage();
        App.showToast('Commentaire enregistré', 'success');
    },

    updateField(field, value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail) return;

        // Gestion des champs imbriqués (ex: "execution.statutExec")
        const parts = field.split('.');
        let obj = travail;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!obj[parts[i]]) obj[parts[i]] = {};
            obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = value;

        DataManager.saveToStorage();
        App.showToast('Modifié', 'success');
    },

    updateReservation(index, field, value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.reservations) {
            travail.reservations = [
                { categorie: 'Nacelles', type: '', etat: 'À Réserver' },
                { categorie: 'Grue', type: '', etat: 'Non' },
                { categorie: 'Échafaudages', type: '', etat: 'À Réserver' }
            ];
        }
        travail.reservations[index][field] = value;
        DataManager.saveToStorage();
        this.refresh();
    },

    updateTacheCognibox(index, field, value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.tachesCognibox) travail.tachesCognibox = [];
        travail.tachesCognibox[index][field] = value;
        DataManager.saveToStorage();
    },

    updateAvisSynd(index, field, value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.avisSynd) travail.avisSynd = [];
        travail.avisSynd[index][field] = value;
        DataManager.saveToStorage();
        this.refresh();
    },

    updateSST(field, value) {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.sst) travail.sst = {};
        travail.sst[field] = value;
        DataManager.saveToStorage();
    },

    addReservation() {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.reservations) travail.reservations = [];
        travail.reservations.push({ categorie: 'Autre', type: '', etat: 'À Réserver' });
        DataManager.saveToStorage();
        this.refresh();
    },

    addTacheCognibox() {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.tachesCognibox) travail.tachesCognibox = [];
        travail.tachesCognibox.push({ dateDebut: '', dateFin: '', numero: '' });
        DataManager.saveToStorage();
        this.refresh();
    },

    addAvisSynd() {
        const travail = DataManager.getTravail(this.currentTravailId);
        if (!travail.avisSynd) travail.avisSynd = [];
        travail.avisSynd.push({ dateDebut: '', dateFin: '', etat: 'À faire' });
        DataManager.saveToStorage();
        this.refresh();
    },

    addComment() {
        const textarea = document.getElementById('newCommentTravail');
        const text = textarea.value.trim();
        if (!text) {
            App.showToast('Écrivez un commentaire', 'warning');
            return;
        }
        DataManager.addComment(this.currentTravailId, text);
        textarea.value = '';
        this.refresh();
        App.showToast('Commentaire ajouté', 'success');
    },

    handlePhoto(photoKey) {
        // Pour l'instant, juste une alerte - on pourra implémenter l'upload plus tard
        App.showToast(`Photo ${photoKey} - Fonctionnalité à venir`, 'info');
    },

    addDocument(section) {
        App.showToast(`Ajout document ${section} - Fonctionnalité à venir`, 'info');
    },

    sendEmail(section) {
        App.showToast(`Email ${section} - Fonctionnalité à venir`, 'info');
    },

    refresh() {
        document.getElementById('contentArea').innerHTML = this.render(this.currentTravailId);
    },

    // Helpers
    getPriorityClass(priorite) {
        switch (priorite) {
            case 'Haute': return 'priority-high';
            case 'Basse': return 'priority-low';
            default: return 'priority-normal';
        }
    },

    getReservationClass(etat) {
        switch (etat) {
            case 'Réservé': return 'res-ok';
            case 'Non': return 'res-no';
            default: return 'res-todo';
        }
    },

    // Récupérer la valeur de révision depuis plusieurs sources possibles
    getRevision(travail) {
        // Chercher d'abord dans les propriétés directes
        if (travail.revision) return travail.revision;

        // Chercher dans customData avec différentes variations
        if (travail.customData) {
            const variations = ['revision', 'Revision', 'Révision', 'révision', 'rev', 'Rev', 'version', 'Version'];
            for (const key of variations) {
                if (travail.customData[key]) return travail.customData[key];
            }
            // Chercher par clé contenant 'rev'
            for (const key of Object.keys(travail.customData)) {
                const normalizedKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                if (normalizedKey.includes('rev')) {
                    return travail.customData[key];
                }
            }
        }
        return '-';
    }
};
