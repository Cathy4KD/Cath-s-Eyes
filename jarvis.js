/**
 * JARVIS Integration pour Cath's Eyes
 * Assistant vocal connecté au backend PC via Claude API
 * Version améliorée avec support backend
 */

const JARVIS = {
    // Configuration
    isListening: false,
    recognition: null,
    currentTranscript: '',
    backendUrl: localStorage.getItem('jarvis_backend_url') || 'http://localhost:5000',
    isBackendConnected: false,
    currentModel: 'sonnet',

    // Initialisation
    init() {
        this.createUI();
        this.initSpeechRecognition();
        this.checkBackend();
    },

    // Initialiser la reconnaissance vocale
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'fr-FR';
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.lastResultIndex = 0; // Suivre l'index du dernier résultat traité

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = this.currentTranscript || '';

                // Ne traiter que les nouveaux résultats (à partir de lastResultIndex)
                for (let i = this.lastResultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript + ' ';
                        this.lastResultIndex = i + 1; // Marquer comme traité
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                this.currentTranscript = finalTranscript.trim();
                const displayText = (finalTranscript + interimTranscript).trim();
                document.getElementById('jarvisHint').textContent = displayText ? displayText + '...' : 'Parlez...';
            };

            this.recognition.onerror = (event) => {
                this.addMessage('Erreur micro: ' + event.error, 'system');
                this.stopRecording();
            };

            this.recognition.onend = () => {
                // Réinitialiser l'index quand la reconnaissance se termine
                this.lastResultIndex = 0;
                if (this.isListening) this.recognition.start();
            };
        }
    },

    // Créer l'interface JARVIS
    createUI() {
        // Bouton flottant JARVIS
        const floatBtn = document.createElement('div');
        floatBtn.id = 'jarvis-float-btn';
        floatBtn.innerHTML = `
            <div class="jarvis-btn" onclick="JARVIS.openModal()">
                <div class="jarvis-arc">
                    <div class="arc-inner"></div>
                </div>
            </div>
        `;
        document.body.appendChild(floatBtn);

        // Modal JARVIS
        const modal = document.createElement('div');
        modal.id = 'jarvis-modal';
        modal.className = 'jarvis-modal';
        modal.innerHTML = `
            <div class="jarvis-modal-content">
                <div class="jarvis-header">
                    <h3>J.A.R.V.I.S</h3>
                    <span class="jarvis-status" id="jarvisStatus">Hors ligne</span>
                    <button class="jarvis-close" onclick="JARVIS.closeModal()">&times;</button>
                </div>
                <div class="jarvis-model-selector" id="jarvisModelSelector">
                    <button class="model-btn active" data-model="sonnet" onclick="JARVIS.switchModel('sonnet')">Sonnet</button>
                    <button class="model-btn" data-model="opus" onclick="JARVIS.switchModel('opus')">Opus</button>
                    <button class="model-btn" data-model="haiku" onclick="JARVIS.switchModel('haiku')">Haiku</button>
                </div>
                <div class="jarvis-conversation" id="jarvisConversation">
                    <div class="jarvis-msg system">Bonjour Madame. Comment puis-je vous aider?</div>
                </div>
                <div class="jarvis-controls">
                    <button class="jarvis-mic" id="jarvisMic" onclick="JARVIS.toggleVoice()">
                        🎤
                    </button>
                    <span class="jarvis-hint" id="jarvisHint">Appuyez pour parler</span>
                </div>
                <div class="jarvis-input-row">
                    <input type="text" id="jarvisInput" placeholder="Ou tapez votre message..." onkeypress="if(event.key==='Enter')JARVIS.sendText()">
                    <button onclick="JARVIS.sendText()">➤</button>
                </div>
                <div class="jarvis-quick-actions">
                    <button onclick="JARVIS.sendCommand('Liste des travaux')">📋 Travaux</button>
                    <button onclick="JARVIS.sendCommand('Statut des arrêts')">📊 Statut</button>
                    <button onclick="JARVIS.sendCommand('Pièces manquantes')">🔧 Pièces</button>
                    <button onclick="JARVIS.sendCommand('Montre les kittings')">📦 Kitting</button>
                </div>
                <div class="jarvis-settings">
                    <button onclick="JARVIS.openSettings()">⚙️ Configurer le backend</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Modal paramètres
        const settingsModal = document.createElement('div');
        settingsModal.id = 'jarvis-settings-modal';
        settingsModal.className = 'jarvis-modal';
        settingsModal.innerHTML = `
            <div class="jarvis-modal-content jarvis-settings-content">
                <h3>Configuration Backend</h3>
                <p>Entrez l'URL de votre backend JARVIS (PC)</p>
                <input type="text" id="jarvisBackendUrl" placeholder="http://localhost:5000 ou URL ngrok">
                <div class="jarvis-settings-buttons">
                    <button class="save" onclick="JARVIS.saveSettings()">Enregistrer</button>
                    <button class="cancel" onclick="JARVIS.closeSettings()">Annuler</button>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModal);

        // Styles
        this.addStyles();
    },

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Bouton flottant JARVIS */
            #jarvis-float-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 9999;
            }
            .jarvis-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
                border: 2px solid #00f0ff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
                transition: all 0.3s;
            }
            .jarvis-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
            }
            .jarvis-arc {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 2px solid #00f0ff;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .arc-inner {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: radial-gradient(circle, #00f0ff 0%, transparent 70%);
                box-shadow: 0 0 15px #00f0ff;
                animation: pulse-glow 2s infinite;
            }
            @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 15px #00f0ff; }
                50% { box-shadow: 0 0 25px #00f0ff, 0 0 40px #00f0ff; }
            }

            /* Modal JARVIS */
            .jarvis-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                justify-content: center;
                align-items: center;
            }
            .jarvis-modal.active {
                display: flex;
            }
            .jarvis-modal-content {
                background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%);
                border: 1px solid #00f0ff;
                border-radius: 15px;
                width: 90%;
                max-width: 400px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            .jarvis-header {
                padding: 15px;
                border-bottom: 1px solid rgba(0, 240, 255, 0.2);
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .jarvis-header h3 {
                color: #00f0ff;
                font-weight: 300;
                letter-spacing: 3px;
                flex: 1;
                margin: 0;
            }
            .jarvis-status {
                font-size: 0.7rem;
                padding: 3px 10px;
                border-radius: 10px;
                background: rgba(255, 50, 50, 0.2);
                color: #ff5050;
            }
            .jarvis-status.online {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
            }
            .jarvis-close {
                background: none;
                border: none;
                color: #888;
                font-size: 1.5rem;
                cursor: pointer;
            }

            /* Model selector */
            .jarvis-model-selector {
                display: flex;
                gap: 5px;
                padding: 10px 15px;
                border-bottom: 1px solid rgba(0, 240, 255, 0.1);
            }
            .model-btn {
                flex: 1;
                padding: 6px 10px;
                border-radius: 15px;
                border: 1px solid rgba(0, 240, 255, 0.3);
                background: transparent;
                color: #888;
                font-size: 0.7rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .model-btn.active {
                background: rgba(0, 240, 255, 0.2);
                border-color: #00f0ff;
                color: #00f0ff;
            }
            .model-btn:hover {
                border-color: #00f0ff;
            }

            /* Conversation */
            .jarvis-conversation {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                max-height: 250px;
                min-height: 150px;
            }
            .jarvis-msg {
                padding: 8px 12px;
                border-radius: 10px;
                margin-bottom: 10px;
                font-size: 0.9rem;
                color: #e0e0e0;
            }
            .jarvis-msg.user {
                background: rgba(0, 240, 255, 0.1);
                border-left: 3px solid #00f0ff;
            }
            .jarvis-msg.jarvis {
                background: rgba(0, 255, 136, 0.1);
                border-left: 3px solid #00ff88;
            }
            .jarvis-msg.system {
                background: rgba(255, 170, 0, 0.1);
                border-left: 3px solid #ffaa00;
                font-size: 0.8rem;
            }
            .jarvis-msg.error {
                background: rgba(255, 50, 50, 0.1);
                border-left: 3px solid #ff5050;
                font-size: 0.8rem;
            }

            /* Controls */
            .jarvis-controls {
                text-align: center;
                padding: 15px;
            }
            .jarvis-mic {
                width: 70px;
                height: 70px;
                border-radius: 50%;
                border: 3px solid #00f0ff;
                background: rgba(0, 240, 255, 0.1);
                font-size: 1.8rem;
                cursor: pointer;
                transition: all 0.3s;
            }
            .jarvis-mic:hover {
                background: rgba(0, 240, 255, 0.2);
            }
            .jarvis-mic.listening {
                background: #00f0ff;
                animation: pulse-btn 1s infinite;
            }
            @keyframes pulse-btn {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            .jarvis-hint {
                display: block;
                color: #888;
                font-size: 0.8rem;
                margin-top: 8px;
            }

            /* Input */
            .jarvis-input-row {
                display: flex;
                gap: 10px;
                padding: 0 15px 15px;
            }
            .jarvis-input-row input {
                flex: 1;
                padding: 10px 15px;
                border-radius: 20px;
                border: 1px solid rgba(0, 240, 255, 0.3);
                background: rgba(0, 0, 0, 0.3);
                color: #e0e0e0;
                font-size: 0.9rem;
            }
            .jarvis-input-row input:focus {
                outline: none;
                border-color: #00f0ff;
            }
            .jarvis-input-row button {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                border: none;
                background: #00f0ff;
                color: #0a0a1a;
                font-size: 1.2rem;
                cursor: pointer;
            }

            /* Quick Actions */
            .jarvis-quick-actions {
                display: flex;
                gap: 8px;
                padding: 0 15px 15px;
                flex-wrap: wrap;
            }
            .jarvis-quick-actions button {
                flex: 1;
                min-width: 70px;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid rgba(0, 240, 255, 0.2);
                background: rgba(0, 0, 0, 0.3);
                color: #e0e0e0;
                font-size: 0.7rem;
                cursor: pointer;
            }
            .jarvis-quick-actions button:hover {
                border-color: #00f0ff;
                background: rgba(0, 240, 255, 0.1);
            }

            /* Settings */
            .jarvis-settings {
                padding: 0 15px 15px;
            }
            .jarvis-settings button {
                width: 100%;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid rgba(0, 240, 255, 0.2);
                background: transparent;
                color: #888;
                font-size: 0.75rem;
                cursor: pointer;
            }
            .jarvis-settings-content {
                padding: 20px;
            }
            .jarvis-settings-content h3 {
                color: #00f0ff;
                margin-bottom: 10px;
            }
            .jarvis-settings-content p {
                color: #888;
                font-size: 0.85rem;
                margin-bottom: 15px;
            }
            .jarvis-settings-content input {
                width: 100%;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #00f0ff;
                background: rgba(0, 0, 0, 0.5);
                color: #e0e0e0;
                margin-bottom: 15px;
                box-sizing: border-box;
            }
            .jarvis-settings-buttons {
                display: flex;
                gap: 10px;
            }
            .jarvis-settings-buttons button {
                flex: 1;
                padding: 10px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
            }
            .jarvis-settings-buttons .save {
                background: #00ff88;
                color: #0a0a1a;
            }
            .jarvis-settings-buttons .cancel {
                background: #333;
                color: #e0e0e0;
            }

            /* Loading spinner */
            .jarvis-loading {
                display: inline-block;
                width: 12px;
                height: 12px;
                border: 2px solid #00f0ff;
                border-top-color: transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-right: 8px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    },

    // Vérifier la connexion au backend
    async checkBackend() {
        const statusEl = document.getElementById('jarvisStatus');

        try {
            const response = await fetch(this.backendUrl + '/health', {
                headers: { 'ngrok-skip-browser-warning': 'true' },
                mode: 'cors'
            });
            const data = await response.json();

            if (data.status === 'online') {
                this.isBackendConnected = true;
                statusEl.textContent = 'Claude ' + (data.model || 'Sonnet').split('-')[1];
                statusEl.classList.add('online');
                console.log('[JARVIS] Backend connecté:', data);
            }
        } catch (e) {
            console.log('[JARVIS] Backend non disponible, mode local activé');
            this.isBackendConnected = false;
            statusEl.textContent = 'Mode local';
            statusEl.classList.remove('online');
        }
    },

    // Changer le modèle Claude
    async switchModel(model) {
        // Update UI
        document.querySelectorAll('.model-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-model="${model}"]`).classList.add('active');
        this.currentModel = model;

        if (this.isBackendConnected) {
            try {
                const response = await fetch(this.backendUrl + '/model', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({ model: model })
                });
                const data = await response.json();
                this.addMessage(`Modèle changé: ${model.toUpperCase()}`, 'system');
            } catch (e) {
                this.addMessage('Erreur changement modèle', 'error');
            }
        }
    },

    // Modal
    openModal() {
        document.getElementById('jarvis-modal').classList.add('active');
        this.checkBackend();
    },

    closeModal() {
        document.getElementById('jarvis-modal').classList.remove('active');
        this.stopRecording();
    },

    openSettings() {
        document.getElementById('jarvis-settings-modal').classList.add('active');
        document.getElementById('jarvisBackendUrl').value = this.backendUrl;
    },

    closeSettings() {
        document.getElementById('jarvis-settings-modal').classList.remove('active');
    },

    async saveSettings() {
        const url = document.getElementById('jarvisBackendUrl').value.trim();
        if (url) {
            this.backendUrl = url.replace(/\/$/, '');
            localStorage.setItem('jarvis_backend_url', this.backendUrl);
            await this.checkBackend();
        }
        this.closeSettings();
    },

    // Reconnaissance vocale
    toggleVoice() {
        if (this.isListening) {
            // Envoyer et arrêter
            if (this.currentTranscript.trim()) {
                this.addMessage(this.currentTranscript, 'user');
                this.sendToBackend(this.currentTranscript);
                this.currentTranscript = '';
            }
            this.stopRecording();
        } else {
            this.startRecording();
        }
    },

    startRecording() {
        if (!this.recognition) {
            this.addMessage('Reconnaissance vocale non supportée', 'system');
            return;
        }

        this.isListening = true;
        this.currentTranscript = '';
        document.getElementById('jarvisMic').classList.add('listening');
        document.getElementById('jarvisHint').textContent = 'Parlez... (appuyez pour envoyer)';
        this.recognition.start();
    },

    stopRecording() {
        this.isListening = false;
        document.getElementById('jarvisMic').classList.remove('listening');
        document.getElementById('jarvisHint').textContent = 'Appuyez pour parler';
        if (this.recognition) this.recognition.stop();
    },

    // Envoyer au backend ou traitement local
    async sendToBackend(text) {
        const hintEl = document.getElementById('jarvisHint');
        hintEl.innerHTML = '<span class="jarvis-loading"></span>Réflexion...';

        if (this.isBackendConnected) {
            try {
                const response = await fetch(this.backendUrl + '/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'ngrok-skip-browser-warning': 'true'
                    },
                    body: JSON.stringify({
                        message: text,
                        model: this.getModelId()
                    })
                });

                const data = await response.json();

                if (data.success) {
                    this.addMessage(data.response, 'jarvis');
                    this.speak(data.response);
                } else {
                    throw new Error(data.error);
                }
            } catch (e) {
                console.error('[JARVIS] Erreur backend:', e);
                // Fallback au traitement local
                const localResponse = this.processCommand(text);
                this.addMessage(localResponse, 'jarvis');
                this.speak(localResponse);
            }
        } else {
            // Traitement local
            const response = this.processCommand(text);
            this.addMessage(response, 'jarvis');
            this.speak(response);
        }

        hintEl.textContent = 'Appuyez pour parler';
    },

    getModelId() {
        const models = {
            'opus': 'claude-opus-4-20250514',
            'sonnet': 'claude-sonnet-4-20250514',
            'haiku': 'claude-3-5-haiku-20241022'
        };
        return models[this.currentModel] || models.sonnet;
    },

    // Intelligence locale pour comprendre les commandes (fallback)
    processCommand(text) {
        const lower = text.toLowerCase();

        // Créer un kitting
        if (lower.includes('crée') || lower.includes('créer') || lower.includes('nouveau') || lower.includes('ajoute')) {
            if (lower.includes('kitting') || lower.includes('commande') || lower.includes('kit')) {
                const numMatch = text.match(/(\d+)/);
                if (numMatch) {
                    return `Je vais créer le kitting ${numMatch[1]}. Utilisez l'app Kitting pour finaliser.`;
                }
                return "Quel numéro de commande, Madame?";
            }
        }

        // Lister travaux
        if (lower.includes('liste') || lower.includes('montre') || lower.includes('travaux')) {
            if (typeof AppData !== 'undefined' && AppData.workItems) {
                const count = AppData.workItems.length;
                const enCours = AppData.workItems.filter(w => w.status === 'en_cours').length;
                return `Vous avez ${count} travaux, dont ${enCours} en cours. Consultez la liste dans le menu.`;
            }
            return "Consultez la liste des travaux dans le menu à gauche, Madame.";
        }

        // Statut
        if (lower.includes('statut') || lower.includes('arrêt')) {
            return "Le statut des arrêts est disponible sur le Dashboard, Madame.";
        }

        // Pièces manquantes
        if (lower.includes('pièce') || lower.includes('manquant')) {
            if (typeof AppData !== 'undefined' && AppData.workItems) {
                const manquantes = AppData.workItems.filter(w =>
                    w.pieces && w.pieces.some(p => p.status === 'manquante')
                ).length;
                return `${manquantes} travaux ont des pièces manquantes. Consultez l'écran Pièces manquantes.`;
            }
            return "Consultez l'écran des pièces manquantes, Madame.";
        }

        // Heure
        if (lower.includes('heure')) {
            return `Il est ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}, Madame.`;
        }

        // Date
        if (lower.includes('date') || lower.includes('jour')) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return `Nous sommes le ${new Date().toLocaleDateString('fr-FR', options)}, Madame.`;
        }

        // Bonjour
        if (lower.includes('bonjour') || lower.includes('salut')) {
            return "Bonjour Madame, comment puis-je vous aider avec l'arrêt annuel?";
        }

        // Aide
        if (lower.includes('aide') || lower.includes('faire')) {
            return "Je peux vous aider avec: les travaux, le statut des arrêts, les pièces manquantes, les kittings. Essayez de me poser une question!";
        }

        // Merci
        if (lower.includes('merci')) {
            return "Je vous en prie, Madame. À votre service!";
        }

        return "Je suis en mode local. Pour des réponses plus intelligentes, connectez-moi au backend PC via les paramètres.";
    },

    speak(text) {
        // Si backend connecté, essayer le TTS OpenAI
        if (this.isBackendConnected) {
            this.speakWithBackend(text);
        } else {
            // Fallback: Web Speech API
            this.speakLocal(text);
        }
    },

    async speakWithBackend(text) {
        try {
            const response = await fetch(this.backendUrl + '/speak', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({ text: text })
            });

            const data = await response.json();

            if (data.success && data.audio_base64) {
                const audio = new Audio('data:audio/mp3;base64,' + data.audio_base64);
                audio.play();
            } else {
                throw new Error('TTS failed');
            }
        } catch (e) {
            // Fallback
            this.speakLocal(text);
        }
    },

    speakLocal(text) {
        if ('speechSynthesis' in window) {
            // Annuler tout speech en cours
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 1.1;

            // Essayer de trouver une voix française
            const voices = speechSynthesis.getVoices();
            const frenchVoice = voices.find(v => v.lang.includes('fr'));
            if (frenchVoice) {
                utterance.voice = frenchVoice;
            }

            speechSynthesis.speak(utterance);
        }
    },

    // Messages
    addMessage(text, type) {
        const conversation = document.getElementById('jarvisConversation');
        const div = document.createElement('div');
        div.className = 'jarvis-msg ' + type;
        div.textContent = text;
        conversation.appendChild(div);
        conversation.scrollTop = conversation.scrollHeight;
    },

    sendText() {
        const input = document.getElementById('jarvisInput');
        const text = input.value.trim();
        if (text) {
            this.addMessage(text, 'user');
            this.sendToBackend(text);
            input.value = '';
        }
    },

    sendCommand(text) {
        this.addMessage(text, 'user');
        this.sendToBackend(text);
    },

    // Effacer l'historique
    async clearHistory() {
        if (this.isBackendConnected) {
            try {
                await fetch(this.backendUrl + '/history', {
                    method: 'DELETE',
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
            } catch (e) {}
        }

        const conversation = document.getElementById('jarvisConversation');
        conversation.innerHTML = '<div class="jarvis-msg system">Historique effacé. Comment puis-je vous aider?</div>';
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    JARVIS.init();
});
