/**
 * Module d'import Excel - Arrêt Annuel
 * Gère l'import des fichiers Excel (travaux SAP et exécution)
 * Avec support des colonnes personnalisées
 */

const ImportManager = {
    // Configuration des colonnes par défaut
    defaultFieldsTravaux: [
        { id: 'ot', label: 'Numéro OT', required: true, type: 'text' },
        { id: 'description', label: 'Description', required: true, type: 'text' },
        { id: 'equipement', label: 'Équipement', required: false, type: 'text' },
        { id: 'localisation', label: 'Localisation', required: false, type: 'text' },
        { id: 'discipline', label: 'Discipline', required: false, type: 'text' },
        { id: 'priorite', label: 'Priorité', required: false, type: 'text' },
        { id: 'statut', label: 'Statut', required: false, type: 'text' },
        { id: 'revision', label: 'Révision', required: false, type: 'text' },
        { id: 'dateCreation', label: 'Date création', required: false, type: 'date' },
        { id: 'datePrevue', label: 'Date prévue', required: false, type: 'date' },
        { id: 'estimationHeures', label: 'Heures estimées', required: false, type: 'number' },
        { id: 'entreprise', label: 'Entreprise', required: false, type: 'text' },
        { id: 'responsable', label: 'Responsable', required: false, type: 'text' }
    ],

    defaultFieldsExecution: [
        { id: 'ot', label: 'Numéro OT', required: true, type: 'text' },
        { id: 'dateDebut', label: 'Date début', required: false, type: 'date' },
        { id: 'dateFin', label: 'Date fin', required: false, type: 'date' },
        { id: 'heuresReelles', label: 'Heures réelles', required: false, type: 'number' },
        { id: 'statutExec', label: 'Statut exécution', required: false, type: 'text' }
    ],

    defaultFieldsPieces: [
        { id: 'reference', label: 'Référence pièce', required: true, type: 'text' },
        { id: 'designation', label: 'Désignation', required: true, type: 'text' },
        { id: 'quantite', label: 'Quantité', required: false, type: 'number' },
        { id: 'fournisseur', label: 'Fournisseur', required: false, type: 'text' },
        { id: 'delai', label: 'Délai (jours)', required: false, type: 'number' },
        { id: 'categorie', label: 'Catégorie (30J/60J/90J)', required: false, type: 'text' },
        { id: 'otLie', label: 'OT lié', required: false, type: 'text' },
        { id: 'unite', label: 'Unité', required: false, type: 'text' },
        { id: 'prixUnitaire', label: 'Prix unitaire', required: false, type: 'number' }
    ],

    defaultFieldsAvis: [
        { id: 'numeroAvis', label: 'Numéro Avis', required: true, type: 'text' },
        { id: 'description', label: 'Description', required: true, type: 'text' },
        { id: 'equipement', label: 'Équipement', required: false, type: 'text' },
        { id: 'priorite', label: 'Priorité', required: false, type: 'text' },
        { id: 'dateCreation', label: 'Date création', required: false, type: 'date' },
        { id: 'typeAvis', label: 'Type avis', required: false, type: 'text' },
        { id: 'statut', label: 'Statut', required: false, type: 'text' },
        { id: 'localisation', label: 'Localisation', required: false, type: 'text' },
        { id: 'demandeur', label: 'Demandeur', required: false, type: 'text' }
    ],

    // Colonnes personnalisées ajoutées par l'utilisateur
    customFields: [],

    // Données courantes
    currentFile: null,
    currentData: null,
    currentHeaders: [],
    currentType: 'travaux',
    currentMapping: null,  // Mapping sauvegardé pour l'étape de confirmation

    // Patterns de détection automatique
    patterns: {
        ot: ['ot', 'ordre', 'numero', 'n°', 'order', 'wo', 'workorder'],
        description: ['description', 'desc', 'libelle', 'intitule', 'titre', 'text'],
        equipement: ['equipement', 'equipment', 'equip', 'machine', 'poste', 'tag'],
        localisation: ['localisation', 'location', 'lieu', 'zone', 'secteur', 'area'],
        discipline: ['discipline', 'metier', 'corps', 'specialite', 'type', 'craft'],
        priorite: ['priorite', 'priority', 'urgence', 'prio'],
        statut: ['statut', 'status', 'etat', 'state'],
        revision: ['revision', 'rev', 'version', 'ver'],
        dateCreation: ['date creation', 'created', 'cree le', 'creation', 'date crea'],
        datePrevue: ['date prevue', 'date planifiee', 'planned', 'echeance', 'due date'],
        estimationHeures: ['heures', 'hours', 'estimation', 'duree', 'temps', 'estimated'],
        entreprise: ['entreprise', 'company', 'societe', 'prestataire', 'fournisseur', 'vendor'],
        responsable: ['responsable', 'responsible', 'owner', 'charge', 'planner'],
        dateDebut: ['date debut', 'start', 'debut', 'commencement', 'start date'],
        dateFin: ['date fin', 'end', 'fin', 'termine', 'end date', 'complete'],
        heuresReelles: ['heures reelles', 'actual', 'reelles', 'consomme', 'actual hours'],
        statutExec: ['statut exec', 'execution', 'avancement', 'progress', 'work status'],
        // Patterns pour les pièces
        reference: ['reference', 'ref', 'code', 'numero piece', 'part number', 'article', 'n° piece'],
        designation: ['designation', 'libelle', 'description', 'nom', 'intitule'],
        quantite: ['quantite', 'qty', 'qte', 'nombre', 'quantity', 'nb'],
        fournisseur: ['fournisseur', 'vendor', 'supplier', 'fabricant'],
        delai: ['delai', 'lead time', 'jours', 'days', 'livraison'],
        categorie: ['categorie', 'category', 'classe', 'type', '30j', '60j', '90j'],
        otLie: ['ot', 'ordre', 'ot lie', 'work order', 'wo'],
        unite: ['unite', 'unit', 'uom', 'mesure'],
        prixUnitaire: ['prix', 'price', 'cout', 'cost', 'montant', 'tarif'],
        // Patterns pour les avis
        numeroAvis: ['avis', 'numero avis', 'n° avis', 'notification', 'notif', 'num avis'],
        typeAvis: ['type avis', 'type', 'categorie avis', 'nature'],
        demandeur: ['demandeur', 'createur', 'auteur', 'emetteur', 'created by']
    },

    // Lire un fichier Excel
    async readExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    if (jsonData.length < 2) {
                        reject(new Error('Le fichier est vide ou ne contient pas de données'));
                        return;
                    }

                    const headers = jsonData[0].map(h => h ? String(h).trim() : '');
                    const rows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

                    this.currentFile = file.name;
                    this.currentHeaders = headers.filter(h => h !== '');
                    this.currentData = rows.map(row => {
                        const obj = {};
                        headers.forEach((h, i) => {
                            if (h) obj[h] = row[i];
                        });
                        return obj;
                    });

                    // Reset custom fields on new file
                    this.customFields = [];

                    resolve({
                        headers: this.currentHeaders,
                        rows: this.currentData,
                        totalRows: rows.length,
                        fileName: file.name,
                        sheets: workbook.SheetNames
                    });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erreur lecture fichier'));
            reader.readAsArrayBuffer(file);
        });
    },

    // Obtenir tous les champs (défaut + personnalisés)
    getAllFields(type = 'travaux') {
        let defaultFields;
        if (type === 'travaux') {
            defaultFields = this.defaultFieldsTravaux;
        } else if (type === 'execution') {
            defaultFields = this.defaultFieldsExecution;
        } else if (type === 'pieces') {
            defaultFields = this.defaultFieldsPieces;
        } else if (type === 'avis') {
            defaultFields = this.defaultFieldsAvis;
        } else {
            defaultFields = this.defaultFieldsTravaux;
        }
        return [...defaultFields, ...this.customFields];
    },

    // Ajouter une colonne personnalisée
    addCustomField(label, type = 'text') {
        const id = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const field = {
            id,
            label,
            required: false,
            type,
            isCustom: true
        };
        this.customFields.push(field);
        return field;
    },

    // Supprimer une colonne personnalisée
    removeCustomField(id) {
        this.customFields = this.customFields.filter(f => f.id !== id);
    },

    // Détecter automatiquement le mapping
    autoDetectMapping(headers, type = 'travaux') {
        const detected = {};
        const fields = this.getAllFields(type);

        fields.forEach(field => {
            if (field.isCustom) return; // Pas d'auto-détection pour les champs custom

            const fieldPatterns = this.patterns[field.id] || [field.id.toLowerCase()];

            for (const header of headers) {
                const headerLower = header.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

                for (const pattern of fieldPatterns) {
                    if (headerLower.includes(pattern)) {
                        detected[field.id] = header;
                        break;
                    }
                }
                if (detected[field.id]) break;
            }
        });

        return detected;
    },

    // Générer l'interface de mapping complète
    generateMappingUI(headers, type = 'travaux') {
        this.currentType = type;
        const fields = this.getAllFields(type);
        const detected = this.autoDetectMapping(headers, type);

        let html = `
            <div class="mapping-container">
                <div class="mapping-info">
                    <p>Associez les colonnes de votre fichier Excel aux champs de l'application.</p>
                    <p><strong>Colonnes disponibles dans votre fichier :</strong> ${headers.length}</p>
                </div>

                <div class="mapping-sections">
                    <!-- Section champs standards -->
                    <div class="mapping-section">
                        <h4>Champs Standards</h4>
                        <div class="mapping-form" id="standardFieldsMapping">
                            ${fields.filter(f => !f.isCustom).map(field => this.renderMappingRow(field, headers, detected[field.id])).join('')}
                        </div>
                    </div>

                    <!-- Section champs personnalisés -->
                    <div class="mapping-section">
                        <h4>Champs Personnalisés
                            <button type="button" class="btn btn-sm btn-success" onclick="ImportManager.showAddFieldModal()">
                                + Ajouter une colonne
                            </button>
                        </h4>
                        <div class="mapping-form" id="customFieldsMapping">
                            ${this.customFields.length === 0 ?
                                '<p class="no-custom-fields">Aucun champ personnalisé. Cliquez sur "+ Ajouter une colonne" pour en créer.</p>' :
                                this.customFields.map(field => this.renderMappingRow(field, headers, null, true)).join('')
                            }
                        </div>
                    </div>
                </div>

                <!-- Liste des colonnes Excel non mappées -->
                <div class="unmapped-columns" id="unmappedColumns">
                    <h4>Colonnes Excel non utilisées</h4>
                    <div class="column-tags" id="columnTags">
                        ${this.renderUnmappedColumns(headers, detected)}
                    </div>
                </div>
            </div>
        `;

        return html;
    },

    // Rendu d'une ligne de mapping
    renderMappingRow(field, headers, selectedValue, isCustom = false) {
        return `
            <div class="form-group mapping-row ${isCustom ? 'custom-field-row' : ''}" data-field-id="${field.id}">
                <label for="map_${field.id}">
                    ${field.label} ${field.required ? '<span class="required">*</span>' : ''}
                    <span class="field-type">(${this.getTypeLabel(field.type)})</span>
                </label>
                <select id="map_${field.id}" class="form-control mapping-select" data-field="${field.id}" onchange="ImportManager.updateUnmappedColumns()">
                    <option value="">-- Non mappé --</option>
                    ${headers.map(h => `
                        <option value="${this.escapeHtml(h)}" ${selectedValue === h ? 'selected' : ''}>${this.escapeHtml(h)}</option>
                    `).join('')}
                </select>
                ${selectedValue ? '<span class="auto-detected">✓ Auto</span>' : ''}
                ${isCustom ? `<button type="button" class="btn btn-sm btn-danger" onclick="ImportManager.removeField('${field.id}')">✕</button>` : ''}
            </div>
        `;
    },

    // Rendu des colonnes non mappées
    renderUnmappedColumns(headers, currentMapping) {
        const mappedValues = Object.values(currentMapping);
        const unmapped = headers.filter(h => !mappedValues.includes(h));

        if (unmapped.length === 0) {
            return '<p class="all-mapped">Toutes les colonnes sont mappées !</p>';
        }

        return unmapped.map(col => `
            <span class="column-tag" onclick="ImportManager.quickAddField('${this.escapeHtml(col)}')" title="Cliquer pour ajouter comme champ personnalisé">
                ${this.escapeHtml(col)}
                <span class="add-icon">+</span>
            </span>
        `).join('');
    },

    // Mise à jour des colonnes non mappées
    updateUnmappedColumns() {
        const mapping = this.getMappingFromUI();
        const mappedValues = Object.values(mapping);
        const unmapped = this.currentHeaders.filter(h => !mappedValues.includes(h));

        const container = document.getElementById('columnTags');
        if (container) {
            if (unmapped.length === 0) {
                container.innerHTML = '<p class="all-mapped">Toutes les colonnes sont mappées !</p>';
            } else {
                container.innerHTML = unmapped.map(col => `
                    <span class="column-tag" onclick="ImportManager.quickAddField('${this.escapeHtml(col)}')" title="Cliquer pour ajouter comme champ personnalisé">
                        ${this.escapeHtml(col)}
                        <span class="add-icon">+</span>
                    </span>
                `).join('');
            }
        }
    },

    // Modal pour ajouter un champ
    showAddFieldModal() {
        const modalHtml = `
            <div class="add-field-modal" id="addFieldModal">
                <div class="add-field-content">
                    <h3>Ajouter une colonne personnalisée</h3>
                    <div class="form-group">
                        <label>Nom du champ</label>
                        <input type="text" class="form-control" id="newFieldLabel" placeholder="Ex: Numéro de permis">
                    </div>
                    <div class="form-group">
                        <label>Type de données</label>
                        <select class="form-control" id="newFieldType">
                            <option value="text">Texte</option>
                            <option value="number">Nombre</option>
                            <option value="date">Date</option>
                            <option value="boolean">Oui/Non</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Mapper avec la colonne Excel</label>
                        <select class="form-control" id="newFieldMapping">
                            <option value="">-- Sélectionner --</option>
                            ${this.currentHeaders.map(h => `<option value="${this.escapeHtml(h)}">${this.escapeHtml(h)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-primary" onclick="ImportManager.confirmAddField()">Ajouter</button>
                        <button class="btn btn-outline" onclick="ImportManager.closeAddFieldModal()">Annuler</button>
                    </div>
                </div>
            </div>
        `;

        // Supprimer si existe déjà
        const existing = document.getElementById('addFieldModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    // Ajout rapide depuis une colonne non mappée
    quickAddField(columnName) {
        const field = this.addCustomField(columnName, 'text');
        this.refreshCustomFieldsUI();

        // Sélectionner automatiquement la colonne
        setTimeout(() => {
            const select = document.getElementById(`map_${field.id}`);
            if (select) {
                select.value = columnName;
                this.updateUnmappedColumns();
            }
        }, 50);

        App.showToast(`Champ "${columnName}" ajouté`, 'success');
    },

    // Confirmer l'ajout d'un champ
    confirmAddField() {
        const label = document.getElementById('newFieldLabel').value.trim();
        const type = document.getElementById('newFieldType').value;
        const mapping = document.getElementById('newFieldMapping').value;

        if (!label) {
            App.showToast('Veuillez saisir un nom de champ', 'warning');
            return;
        }

        const field = this.addCustomField(label, type);
        this.closeAddFieldModal();
        this.refreshCustomFieldsUI();

        // Appliquer le mapping si sélectionné
        if (mapping) {
            setTimeout(() => {
                const select = document.getElementById(`map_${field.id}`);
                if (select) {
                    select.value = mapping;
                    this.updateUnmappedColumns();
                }
            }, 50);
        }

        App.showToast(`Champ "${label}" ajouté`, 'success');
    },

    closeAddFieldModal() {
        const modal = document.getElementById('addFieldModal');
        if (modal) modal.remove();
    },

    // Supprimer un champ personnalisé
    removeField(fieldId) {
        const field = this.customFields.find(f => f.id === fieldId);
        if (field && confirm(`Supprimer le champ "${field.label}" ?`)) {
            this.removeCustomField(fieldId);
            this.refreshCustomFieldsUI();
            this.updateUnmappedColumns();
            App.showToast('Champ supprimé', 'success');
        }
    },

    // Rafraîchir l'UI des champs personnalisés
    refreshCustomFieldsUI() {
        const container = document.getElementById('customFieldsMapping');
        if (container) {
            if (this.customFields.length === 0) {
                container.innerHTML = '<p class="no-custom-fields">Aucun champ personnalisé. Cliquez sur "+ Ajouter une colonne" pour en créer.</p>';
            } else {
                container.innerHTML = this.customFields.map(field =>
                    this.renderMappingRow(field, this.currentHeaders, null, true)
                ).join('');
            }
        }
    },

    // Récupérer le mapping depuis l'UI
    getMappingFromUI() {
        const mapping = {};
        document.querySelectorAll('.mapping-select').forEach(select => {
            const field = select.dataset.field;
            const value = select.value;
            if (value) {
                mapping[field] = value;
            }
        });
        return mapping;
    },

    // Valider le mapping
    validateMapping(mapping, type = 'travaux') {
        const fields = this.getAllFields(type);
        const required = fields.filter(f => f.required).map(f => f.id);
        const missing = required.filter(f => !mapping[f]);

        if (missing.length > 0) {
            const missingLabels = missing.map(id => {
                const field = fields.find(f => f.id === id);
                return field ? field.label : id;
            });
            return {
                valid: false,
                message: `Champs obligatoires manquants: ${missingLabels.join(', ')}`
            };
        }

        return { valid: true };
    },

    // Prévisualiser les données
    generatePreview(data, mapping, limit = 5) {
        const previewData = data.slice(0, limit);
        const mappedFields = Object.keys(mapping);

        // Combiner champs standards et personnalisés pour trouver les labels
        const allFields = [...this.getAllFields(this.currentType), ...this.customFields];

        let html = '<div class="preview-container">';
        html += `<p>Aperçu des ${Math.min(limit, data.length)} premières lignes sur ${data.length} total</p>`;
        html += `<p style="color: var(--success); font-size: 0.9rem;"><strong>${mappedFields.length} colonnes mappées</strong> (dont ${this.customFields.length} personnalisée(s))</p>`;
        html += '<div class="table-container"><table>';

        // En-têtes avec les labels des champs
        html += '<thead><tr>';
        mappedFields.forEach(fieldId => {
            // Chercher dans les champs standards et custom
            let field = allFields.find(f => f.id === fieldId);
            let label = field ? field.label : mapping[fieldId]; // Utiliser le nom de colonne Excel si pas trouvé
            let isCustom = fieldId.startsWith('custom_');
            html += `<th>${label} ${isCustom ? '<span style="color: var(--warning);">*</span>' : ''}</th>`;
        });
        html += '</tr></thead>';

        // Données
        html += '<tbody>';
        previewData.forEach(row => {
            html += '<tr>';
            mappedFields.forEach(fieldId => {
                const value = row[mapping[fieldId]] || '-';
                html += `<td>${this.formatPreviewValue(value)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table></div>';

        if (this.customFields.length > 0) {
            html += '<p style="margin-top: 10px; font-size: 0.85rem; color: var(--text-light);"><span style="color: var(--warning);">*</span> = Champ personnalisé</p>';
        }

        html += '</div>';

        return html;
    },

    formatPreviewValue(value) {
        if (value === null || value === undefined) return '-';
        if (value instanceof Date) return value.toLocaleDateString('fr-FR');
        if (typeof value === 'number') return value.toLocaleString('fr-FR');
        return String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
    },

    // Sauvegarder le mapping pour l'étape de confirmation
    saveMapping() {
        this.currentMapping = this.getMappingFromUI();
        return this.currentMapping;
    },

    // Effectuer l'import
    performImport(type = 'travaux') {
        // Utiliser le mapping sauvegardé ou essayer de le récupérer depuis l'UI
        const mapping = this.currentMapping || this.getMappingFromUI();

        if (!mapping || Object.keys(mapping).length === 0) {
            return { success: false, message: 'Aucun mapping défini. Veuillez recommencer l\'import.' };
        }

        const validation = this.validateMapping(mapping, type);

        if (!validation.valid) {
            return { success: false, message: validation.message };
        }

        try {
            // Sauvegarder les champs personnalisés dans les données
            if (this.customFields.length > 0) {
                DataManager.data.customFields = this.customFields;
            }

            if (type === 'travaux') {
                const count = DataManager.importTravaux(this.currentData, mapping);
                return {
                    success: true,
                    message: `${count} travaux importés avec succès (${Object.keys(mapping).length} colonnes)`,
                    count
                };
            } else if (type === 'pieces') {
                const result = DataManager.importPieces(this.currentData, mapping);
                return {
                    success: true,
                    message: `Import terminé: ${result.added} nouvelles pièces ajoutées, ${result.updated} mises à jour (Total: ${result.total})`,
                    count: result.total
                };
            } else if (type === 'avis') {
                const result = DataManager.importAvis(this.currentData, mapping);
                return {
                    success: true,
                    message: `Import terminé: ${result.added} nouveaux avis ajoutés, ${result.updated} mis à jour (Total: ${result.total})`,
                    count: result.total
                };
            } else {
                DataManager.importExecution(this.currentData, mapping);
                return {
                    success: true,
                    message: `Données d'exécution importées avec succès`,
                    count: this.currentData.length
                };
            }
        } catch (error) {
            return {
                success: false,
                message: `Erreur lors de l'import: ${error.message}`
            };
        }
    },

    // Utilitaires
    getTypeLabel(type) {
        const labels = {
            text: 'Texte',
            number: 'Nombre',
            date: 'Date',
            boolean: 'Oui/Non'
        };
        return labels[type] || type;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    reset() {
        this.currentFile = null;
        this.currentData = null;
        this.currentHeaders = [];
        this.customFields = [];
        this.currentMapping = null;
    }
};

// Styles additionnels pour l'import
const importStyles = document.createElement('style');
importStyles.textContent = `
    .mapping-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .mapping-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    @media (max-width: 1024px) {
        .mapping-sections {
            grid-template-columns: 1fr;
        }
    }

    .mapping-section {
        background: var(--bg-light);
        padding: 15px;
        border-radius: 8px;
    }

    .mapping-section h4 {
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }

    .mapping-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 400px;
        overflow-y: auto;
    }

    .mapping-row {
        display: grid;
        grid-template-columns: 200px 1fr auto auto;
        align-items: center;
        gap: 10px;
        padding: 8px;
        background: var(--bg-white);
        border-radius: 6px;
    }

    .mapping-row label {
        font-size: 0.9rem;
        display: flex;
        flex-direction: column;
    }

    .mapping-row .required {
        color: var(--danger);
    }

    .mapping-row .field-type {
        font-size: 0.75rem;
        color: var(--text-light);
    }

    .mapping-info {
        padding: 15px;
        background: #f0f9ff;
        border-radius: 8px;
        border-left: 4px solid var(--primary);
    }

    .mapping-info p {
        margin: 5px 0;
    }

    .auto-detected {
        color: var(--success);
        font-size: 0.8rem;
        white-space: nowrap;
    }

    .custom-field-row {
        border-left: 3px solid var(--warning);
    }

    .no-custom-fields {
        color: var(--text-light);
        font-style: italic;
        padding: 20px;
        text-align: center;
    }

    .unmapped-columns {
        background: var(--bg-light);
        padding: 15px;
        border-radius: 8px;
    }

    .unmapped-columns h4 {
        margin-bottom: 10px;
    }

    .column-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .column-tag {
        background: var(--bg-white);
        border: 1px dashed var(--border);
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .column-tag:hover {
        border-color: var(--primary);
        background: rgba(37, 99, 235, 0.05);
    }

    .column-tag .add-icon {
        color: var(--success);
        font-weight: bold;
    }

    .all-mapped {
        color: var(--success);
        font-style: italic;
    }

    /* Modal ajout champ */
    .add-field-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
    }

    .add-field-content {
        background: white;
        padding: 25px;
        border-radius: 10px;
        width: 400px;
        max-width: 90%;
    }

    .add-field-content h3 {
        margin-bottom: 20px;
    }

    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 20px;
        justify-content: flex-end;
    }

    .preview-container {
        margin-top: 20px;
        max-height: 300px;
        overflow: auto;
    }

    .preview-container table {
        font-size: 0.85rem;
    }

    .import-steps {
        display: flex;
        margin-bottom: 30px;
    }

    .import-step {
        flex: 1;
        text-align: center;
        padding: 15px;
        position: relative;
    }

    .import-step::after {
        content: '';
        position: absolute;
        top: 50%;
        right: 0;
        width: 50%;
        height: 2px;
        background: var(--border);
    }

    .import-step:last-child::after {
        display: none;
    }

    .import-step.active {
        color: var(--primary);
    }

    .import-step.completed {
        color: var(--success);
    }

    .step-number {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--border);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 5px;
    }

    .import-step.active .step-number {
        background: var(--primary);
        color: white;
    }

    .import-step.completed .step-number {
        background: var(--success);
        color: white;
    }

    /* Styles pour le sélecteur de mode d'import */
    .import-mode-selector {
        background: var(--bg-light);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .import-mode-selector h4 {
        margin-bottom: 12px;
        color: var(--text);
    }

    .import-mode-options {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
    }

    .import-mode-option {
        flex: 1;
        min-width: 200px;
        padding: 12px 15px;
        border: 2px solid var(--border);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        background: var(--bg-white);
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }

    .import-mode-option:hover {
        border-color: var(--primary);
        background: rgba(37, 99, 235, 0.05);
    }

    .import-mode-option.selected {
        border-color: var(--primary);
        background: rgba(37, 99, 235, 0.1);
    }

    .import-mode-option input[type="radio"] {
        margin-top: 3px;
    }

    .import-mode-option .mode-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .import-mode-option .mode-content strong {
        color: var(--text);
    }

    .import-mode-option .mode-content span {
        font-size: 0.85rem;
        color: var(--text-light);
    }

    .import-mode-option.selected .mode-content strong {
        color: var(--primary);
    }
`;
document.head.appendChild(importStyles);
