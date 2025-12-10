/**
 * JARVIS Integration pour Cath's Eyes
 * Assistant vocal connecté au backend PC
 */

const JARVIS = {
    // Configuration
    isListening: false,
    recognition: null,
    currentTranscript: '',

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

            this.recognition.onresult = (event) => {
                let fullTranscript = '';
                for (let i = 0; i < event.results.length; i++) {
                    fullTranscript += event.results[i][0].transcript;
                }
                this.currentTranscript = fullTranscript;
                document.getElementById('jarvisHint').textContent = fullTranscript + '...';
            };

            this.recognition.onerror = (event) => {
                this.addMessage('Erreur micro: ' + event.error, 'system');
                this.stopRecording();
            };

            this.recognition.onend = () => {
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
                    <button onclick="JARVIS.sendCommand('Montre les kittings')">📦 Kitting</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

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
                min-width: 80px;
                padding: 8px;
                border-radius: 8px;
                border: 1px solid rgba(0, 240, 255, 0.2);
                background: rgba(0, 0, 0, 0.3);
                color: #e0e0e0;
                font-size: 0.75rem;
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
        `;
        document.head.appendChild(style);
    },

    // Marquer comme en ligne
    checkBackend() {
        document.getElementById('jarvisStatus').textContent = 'En ligne';
        document.getElementById('jarvisStatus').classList.add('online');
    },

    // Modal
    openModal() {
        document.getElementById('jarvis-modal').classList.add('active');
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

            try {
                const response = await fetch(this.backendUrl + '/health', {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                const data = await response.json();
                if (data.status === 'online') {
                    this.addMessage('Backend connecté!', 'system');
                    document.getElementById('jarvisStatus').textContent = 'En ligne';
                    document.getElementById('jarvisStatus').classList.add('online');
                }
            } catch (e) {
                this.addMessage('Erreur connexion: ' + e.message, 'system');
            }
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

    async sendToBackend(text) {
        document.getElementById('jarvisHint').textContent = 'Réflexion...';

        // Traitement local des commandes
        const response = this.processCommand(text);
        this.addMessage(response, 'jarvis');
        this.speak(response);

        document.getElementById('jarvisHint').textContent = 'Appuyez pour parler';
    },

    // Intelligence locale pour comprendre les commandes
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

        // Lister
        if (lower.includes('liste') || lower.includes('montre') || lower.includes('travaux')) {
            return "Consultez la liste des travaux dans le menu à gauche, Madame.";
        }

        // Statut
        if (lower.includes('statut') || lower.includes('arrêt')) {
            return "Le statut des arrêts est disponible sur le Dashboard, Madame.";
        }

        // Heure
        if (lower.includes('heure')) {
            return `Il est ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}, Madame.`;
        }

        // Bonjour
        if (lower.includes('bonjour') || lower.includes('salut')) {
            return "Bonjour Madame, comment puis-je vous aider?";
        }

        // Aide
        if (lower.includes('aide') || lower.includes('faire')) {
            return "Je peux vous aider avec: les travaux, le statut des arrêts, les kittings, et répondre à vos questions.";
        }

        return "Je vous écoute, Madame. Que puis-je faire pour vous?";
    },

    speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 1.1;
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
    }
};

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    JARVIS.init();
});
