/**
 * Module de Rapports - Arrêt Annuel
 * Génération de rapports PDF et visualisations
 */

const ReportsManager = {
    // Rendu de l'écran Rapports
    renderReportsScreen() {
        const stats = DataManager.getGlobalStats();

        return `
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Rapport Synthèse Globale</h3>
                    </div>
                    <p>Vue d'ensemble de l'arrêt annuel avec tous les indicateurs clés.</p>
                    <button class="btn btn-primary" onclick="ReportsManager.generateSynthese()">
                        📄 Générer Rapport Synthèse
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Rapport Préparation</h3>
                    </div>
                    <p>État détaillé de la préparation de tous les travaux.</p>
                    <button class="btn btn-primary" onclick="ReportsManager.generatePreparation()">
                        📄 Générer Rapport Préparation
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Rapport Exécution</h3>
                    </div>
                    <p>Avancement de l'exécution avec analyse des heures.</p>
                    <button class="btn btn-primary" onclick="ReportsManager.generateExecution()">
                        📄 Générer Rapport Exécution
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Rapport Post-Mortem</h3>
                    </div>
                    <p>Liste des actions et retours d'expérience.</p>
                    <button class="btn btn-primary" onclick="ReportsManager.generatePostMortem()">
                        📄 Générer Rapport Post-Mortem
                    </button>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Rapport Personnalisé</h3>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label>Disciplines à inclure</label>
                        <select class="form-control" id="reportDisciplines" multiple style="height: 100px;">
                            ${DataManager.getDisciplines().map(d => `<option value="${d}" selected>${d}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sections</label>
                        <div>
                            <label><input type="checkbox" id="incStats" checked> Statistiques globales</label><br>
                            <label><input type="checkbox" id="incPrepa" checked> Préparation</label><br>
                            <label><input type="checkbox" id="incExec" checked> Exécution</label><br>
                            <label><input type="checkbox" id="incPM"> Actions Post-Mortem</label><br>
                            <label><input type="checkbox" id="incList"> Liste détaillée travaux</label>
                        </div>
                    </div>
                </div>
                <button class="btn btn-success" onclick="ReportsManager.generateCustom()">
                    🔧 Générer Rapport Personnalisé
                </button>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Aperçu Statistiques</h3>
                </div>
                <div id="statsPreview">
                    ${this.renderStatsPreview(stats)}
                </div>
            </div>
        `;
    },

    renderStatsPreview(stats) {
        return `
            <div class="grid-3">
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--primary);">${stats.preparation.total}</div>
                    <div>Travaux Total</div>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--success);">${stats.preparation.pourcentage}%</div>
                    <div>Préparation</div>
                </div>
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 3rem; font-weight: bold; color: var(--info);">${stats.execution.pourcentage}%</div>
                    <div>Exécution</div>
                </div>
            </div>
            <hr style="margin: 20px 0;">
            <h4>Par Discipline</h4>
            <table style="width: 100%;">
                <thead>
                    <tr>
                        <th>Discipline</th>
                        <th>Total</th>
                        <th>Terminés</th>
                        <th>%</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(stats.parDiscipline).map(([disc, data]) => `
                        <tr>
                            <td>${disc || 'Non défini'}</td>
                            <td>${data.total}</td>
                            <td>${data.termine}</td>
                            <td>${Math.round(data.termine/data.total*100)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    // Génération du rapport synthèse
    generateSynthese() {
        const stats = DataManager.getGlobalStats();
        const travaux = DataManager.getTravaux();
        const date = new Date().toLocaleDateString('fr-FR');

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Synthèse - Arrêt Annuel</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Rapport Synthèse - Arrêt Annuel</h1>
                    <p>Généré le ${date}</p>
                </div>

                <div class="section">
                    <h2>Vue Globale</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">${stats.preparation.total}</div>
                            <div class="stat-label">Travaux Total</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.preparation.pourcentage}%</div>
                            <div class="stat-label">Préparation</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.execution.pourcentage}%</div>
                            <div class="stat-label">Exécution</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.execution.heuresReelles}h</div>
                            <div class="stat-label">Heures Consommées</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Avancement Préparation</h2>
                    <div class="progress-info">
                        <span>Prêt: ${stats.preparation.pret}</span>
                        <span>En cours: ${stats.preparation.enCours}</span>
                        <span>Non commencé: ${stats.preparation.nonCommence}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.preparation.pourcentage}%"></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Avancement Exécution</h2>
                    <div class="progress-info">
                        <span>Terminé: ${stats.execution.termine}</span>
                        <span>En cours: ${stats.execution.enCours}</span>
                        <span>Non démarré: ${stats.execution.nonDemarre}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill blue" style="width: ${stats.execution.pourcentage}%"></div>
                    </div>
                </div>

                <div class="section">
                    <h2>Par Discipline</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Discipline</th>
                                <th>Total</th>
                                <th>Terminés</th>
                                <th>Avancement</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(stats.parDiscipline).map(([disc, data]) => `
                                <tr>
                                    <td>${disc || 'Non défini'}</td>
                                    <td>${data.total}</td>
                                    <td>${data.termine}</td>
                                    <td>${Math.round(data.termine/data.total*100)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <h2>Actions Post-Mortem</h2>
                    <p>Total: ${stats.actionsPostMortem} actions</p>
                    <p>Ouvertes: ${stats.actionsOuvertes}</p>
                </div>

                <div class="footer">
                    <p>Rapport généré automatiquement - Gestion Arrêt Annuel v2.0</p>
                </div>
            </body>
            </html>
        `;

        this.openReport(content, 'Rapport_Synthese');
    },

    // Génération rapport préparation
    generatePreparation() {
        const stats = DataManager.getPreparationStats();
        const travaux = DataManager.getTravaux();
        const date = new Date().toLocaleDateString('fr-FR');

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Préparation - Arrêt Annuel</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Rapport Préparation</h1>
                    <p>Généré le ${date}</p>
                </div>

                <div class="section">
                    <h2>Statistiques</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">${stats.pret}</div>
                            <div class="stat-label">Prêts</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.enCours}</div>
                            <div class="stat-label">En Cours</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.nonCommence}</div>
                            <div class="stat-label">Non Commencés</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Liste Détaillée</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>OT</th>
                                <th>Description</th>
                                <th>Mat.</th>
                                <th>Permis</th>
                                <th>Cons.</th>
                                <th>PJ</th>
                                <th>Gamme</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${travaux.map(t => `
                                <tr>
                                    <td>${t.ot}</td>
                                    <td>${t.description.substring(0, 40)}...</td>
                                    <td>${t.preparation.materielCommande ? '✓' : '✗'}</td>
                                    <td>${t.preparation.permisSecurite ? '✓' : '✗'}</td>
                                    <td>${t.preparation.consignationPrevue ? '✓' : '✗'}</td>
                                    <td>${t.preparation.pieceJointe ? '✓' : '✗'}</td>
                                    <td>${t.preparation.gammeValidee ? '✓' : '✗'}</td>
                                    <td>${Screens.getPreparationScore(t)}%</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Rapport généré automatiquement - Gestion Arrêt Annuel v2.0</p>
                </div>
            </body>
            </html>
        `;

        this.openReport(content, 'Rapport_Preparation');
    },

    // Génération rapport exécution
    generateExecution() {
        const stats = DataManager.getExecutionStats();
        const travaux = DataManager.getTravaux();
        const date = new Date().toLocaleDateString('fr-FR');

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Exécution - Arrêt Annuel</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Rapport Exécution</h1>
                    <p>Généré le ${date}</p>
                </div>

                <div class="section">
                    <h2>Statistiques</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">${stats.termine}</div>
                            <div class="stat-label">Terminés</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.enCours}</div>
                            <div class="stat-label">En Cours</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.nonDemarre}</div>
                            <div class="stat-label">Non Démarrés</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Analyse des Heures</h2>
                    <table>
                        <tr>
                            <td><strong>Heures Estimées:</strong></td>
                            <td>${stats.heuresEstimees.toLocaleString('fr-FR')} h</td>
                        </tr>
                        <tr>
                            <td><strong>Heures Réelles:</strong></td>
                            <td>${stats.heuresReelles.toLocaleString('fr-FR')} h</td>
                        </tr>
                        <tr>
                            <td><strong>Écart:</strong></td>
                            <td style="color: ${stats.heuresReelles > stats.heuresEstimees ? 'red' : 'green'}">
                                ${(stats.heuresReelles - stats.heuresEstimees).toLocaleString('fr-FR')} h
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="section">
                    <h2>Liste Détaillée</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>OT</th>
                                <th>Description</th>
                                <th>Statut</th>
                                <th>H. Est.</th>
                                <th>H. Réel.</th>
                                <th>Écart</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${travaux.filter(t => t.execution.statutExec !== 'Non démarré').map(t => {
                                const ecart = t.execution.heuresReelles - t.estimationHeures;
                                return `
                                    <tr>
                                        <td>${t.ot}</td>
                                        <td>${t.description.substring(0, 40)}...</td>
                                        <td>${t.execution.statutExec}</td>
                                        <td>${t.estimationHeures}h</td>
                                        <td>${t.execution.heuresReelles}h</td>
                                        <td style="color: ${ecart > 0 ? 'red' : 'green'}">${ecart > 0 ? '+' : ''}${ecart}h</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    <p>Rapport généré automatiquement - Gestion Arrêt Annuel v2.0</p>
                </div>
            </body>
            </html>
        `;

        this.openReport(content, 'Rapport_Execution');
    },

    // Génération rapport post-mortem
    generatePostMortem() {
        const actions = DataManager.getPostMortemActions();
        const date = new Date().toLocaleDateString('fr-FR');

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Post-Mortem - Arrêt Annuel</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Rapport Post-Mortem</h1>
                    <p>Généré le ${date}</p>
                </div>

                <div class="section">
                    <h2>Résumé</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">${actions.length}</div>
                            <div class="stat-label">Total Actions</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${actions.filter(a => a.statut === 'Ouvert').length}</div>
                            <div class="stat-label">Ouvertes</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${actions.filter(a => a.statut === 'Fermé').length}</div>
                            <div class="stat-label">Fermées</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2>Liste des Actions</h2>
                    ${actions.length === 0 ? '<p>Aucune action enregistrée</p>' : ''}
                    ${actions.map(a => `
                        <div class="action-card">
                            <h3>${a.titre}</h3>
                            <p><strong>Type:</strong> ${a.type}</p>
                            <p><strong>Responsable:</strong> ${a.responsable || 'Non assigné'}</p>
                            <p><strong>Statut:</strong> ${a.statut}</p>
                            <p><strong>Échéance:</strong> ${a.echeance ? new Date(a.echeance).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                            <p>${a.description || ''}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="footer">
                    <p>Rapport généré automatiquement - Gestion Arrêt Annuel v2.0</p>
                </div>
            </body>
            </html>
        `;

        this.openReport(content, 'Rapport_PostMortem');
    },

    // Génération rapport personnalisé
    generateCustom() {
        const stats = DataManager.getGlobalStats();
        const travaux = DataManager.getTravaux();
        const actions = DataManager.getPostMortemActions();
        const date = new Date().toLocaleDateString('fr-FR');

        const incStats = document.getElementById('incStats').checked;
        const incPrepa = document.getElementById('incPrepa').checked;
        const incExec = document.getElementById('incExec').checked;
        const incPM = document.getElementById('incPM').checked;
        const incList = document.getElementById('incList').checked;

        let sections = '';

        if (incStats) {
            sections += `
                <div class="section">
                    <h2>Statistiques Globales</h2>
                    <div class="stats-row">
                        <div class="stat-box">
                            <div class="stat-value">${stats.preparation.total}</div>
                            <div class="stat-label">Total Travaux</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.preparation.pourcentage}%</div>
                            <div class="stat-label">Préparation</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${stats.execution.pourcentage}%</div>
                            <div class="stat-label">Exécution</div>
                        </div>
                    </div>
                </div>
            `;
        }

        if (incPrepa) {
            sections += `
                <div class="section">
                    <h2>Préparation</h2>
                    <p>Prêts: ${stats.preparation.pret} | En cours: ${stats.preparation.enCours} | Non commencés: ${stats.preparation.nonCommence}</p>
                </div>
            `;
        }

        if (incExec) {
            sections += `
                <div class="section">
                    <h2>Exécution</h2>
                    <p>Terminés: ${stats.execution.termine} | En cours: ${stats.execution.enCours} | Non démarrés: ${stats.execution.nonDemarre}</p>
                    <p>Heures estimées: ${stats.execution.heuresEstimees}h | Heures réelles: ${stats.execution.heuresReelles}h</p>
                </div>
            `;
        }

        if (incPM) {
            sections += `
                <div class="section">
                    <h2>Actions Post-Mortem</h2>
                    <p>Total: ${stats.actionsPostMortem} | Ouvertes: ${stats.actionsOuvertes}</p>
                </div>
            `;
        }

        if (incList) {
            sections += `
                <div class="section page-break">
                    <h2>Liste des Travaux</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>OT</th>
                                <th>Description</th>
                                <th>Discipline</th>
                                <th>Prépa</th>
                                <th>Exec</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${travaux.map(t => `
                                <tr>
                                    <td>${t.ot}</td>
                                    <td>${t.description.substring(0, 40)}...</td>
                                    <td>${t.discipline || '-'}</td>
                                    <td>${Screens.getPreparationScore(t)}%</td>
                                    <td>${t.execution.statutExec}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Rapport Personnalisé - Arrêt Annuel</title>
                <style>
                    ${this.getReportStyles()}
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>Rapport Personnalisé</h1>
                    <p>Généré le ${date}</p>
                </div>
                ${sections}
                <div class="footer">
                    <p>Rapport généré automatiquement - Gestion Arrêt Annuel v2.0</p>
                </div>
            </body>
            </html>
        `;

        this.openReport(content, 'Rapport_Personnalise');
    },

    // Styles CSS pour les rapports
    getReportStyles() {
        return `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .report-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #2563eb; }
            .report-header h1 { color: #2563eb; margin-bottom: 10px; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #1e293b; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #e2e8f0; }
            .stats-row { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat-box { flex: 1; text-align: center; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .stat-value { font-size: 2rem; font-weight: bold; color: #2563eb; }
            .stat-label { color: #64748b; }
            .progress-bar { height: 20px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
            .progress-fill { height: 100%; background: #22c55e; }
            .progress-fill.blue { background: #2563eb; }
            .progress-info { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background: #f8fafc; font-weight: 600; }
            .action-card { background: #f8fafc; padding: 15px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
            .action-card h3 { margin-bottom: 10px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 0.9rem; }
            .page-break { page-break-before: always; }
            @media print {
                body { padding: 0; }
                .section { page-break-inside: avoid; }
            }
        `;
    },

    // Ouvrir le rapport dans une nouvelle fenêtre
    openReport(content, filename) {
        const win = window.open('', '_blank');
        win.document.write(content);
        win.document.close();

        // Bouton d'impression
        const printBtn = win.document.createElement('button');
        printBtn.textContent = '🖨️ Imprimer / PDF';
        printBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; z-index: 1000;';
        printBtn.onclick = () => win.print();
        win.document.body.appendChild(printBtn);

        App.showToast(`Rapport "${filename}" généré`, 'success');
    }
};
