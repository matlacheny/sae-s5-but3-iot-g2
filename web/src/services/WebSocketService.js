import SERVER_CONFIG from '../config/serverConfig';

/**
 * Service WebSocket pour recevoir les alertes en temps réel
 * Utilisé principalement par les aides-soignants
 */
class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000; // 3 secondes
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.isManualClose = false;
    this.currentAideId = null;
    this.currentPassword = null;
  }

  /**
   * Se connecter au serveur WebSocket
   * @param {string} aideId - ID de l'aide-soignant
   * @param {string} password - Mot de passe de l'aide-soignant
   */
  async connect(aideId, password) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté');
      return;
    }

    this.isManualClose = false;
    this.currentAideId = aideId;
    this.currentPassword = password;
    
    // Récupérer l'URL WebSocket depuis le Gist
    let wsUrl;
    try {
      wsUrl = await SERVER_CONFIG.getWebSocketUrl();
      console.log(' [WebSocket] URL récupérée:', wsUrl);
    } catch (error) {
      console.error('❌ [WebSocket] Impossible de récupérer l\'URL:', error);
      this.notifyConnectionHandlers(false);
      return;
    }

    const fullWsUrl = `${wsUrl}?token=${encodeURIComponent(SERVER_CONFIG.API_KEY)}&id=${encodeURIComponent(aideId)}&pwd=${encodeURIComponent(password)}`;
    
    console.log('🔌 [WebSocket] Connexion pour aide-soignant:', aideId);

    try {
      this.ws = new WebSocket(fullWsUrl);

      this.ws.onopen = () => {
        console.log('✅ [WebSocket] Connecté');
        this.reconnectAttempts = 0;
        this.notifyConnectionHandlers(true);
        
        // Demander le renvoi des alertes en attente
        this.send({ type: 'resend_pending' });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 [WebSocket] Message reçu:', data);
          
          // Si c'est une erreur du serveur
          if (data.error) {
            console.error('❌ [WebSocket] Erreur serveur:', data.error);
            return;
          }

          // Notifier tous les handlers
          this.notifyMessageHandlers(data);

          // Envoyer un ACK si c'est une alerte
          if (data.alertId) {
            this.sendAck(data.alertId);
          }
        } catch (error) {
          console.error('❌ [WebSocket] Erreur parsing:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ [WebSocket] Erreur:', error);
      };

      this.ws.onclose = () => {
        console.log('🔌 [WebSocket] Déconnecté');
        this.notifyConnectionHandlers(false);

        // Tenter une reconnexion si ce n'est pas une fermeture manuelle
        if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`🔄 [WebSocket] Reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
          
          setTimeout(() => {
            if (!this.isManualClose && this.currentAideId && this.currentPassword) {
              this.connect(this.currentAideId, this.currentPassword);
            }
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };

    } catch (error) {
      console.error('❌ [WebSocket] Erreur création:', error);
    }
  }

  /**
   * Envoyer un message au serveur
   */
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('⚠️ [WebSocket] Non connecté, impossible d\'envoyer');
    }
  }

  /**
   * Envoyer un ACK (accusé de réception) pour une alerte
   */
  sendAck(alertId) {
    this.send({
      type: 'ack',
      alertId: alertId
    });
    console.log('✅ [WebSocket] ACK envoyé:', alertId);
  }

  /**
   * Demander le renvoi des alertes en attente
   */
  requestPendingAlerts() {
    this.send({ type: 'resend_pending' });
    console.log('🔄 [WebSocket] Demande de renvoi des alertes');
  }

  /**
   * Ajouter un handler pour les messages
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    
    // Retourner une fonction pour supprimer le handler
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Ajouter un handler pour les changements de connexion
   */
  onConnectionChange(handler) {
    this.connectionHandlers.push(handler);
    
    // Retourner une fonction pour supprimer le handler
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Notifier tous les handlers de message
   */
  notifyMessageHandlers(data) {
    this.messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('❌ [WebSocket] Erreur dans handler:', error);
      }
    });
  }

  /**
   * Notifier tous les handlers de connexion
   */
  notifyConnectionHandlers(isConnected) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(isConnected);
      } catch (error) {
        console.error('❌ [WebSocket] Erreur dans handler connexion:', error);
      }
    });
  }

  /**
   * Fermer la connexion WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.reconnectAttempts = 0;
    this.currentAideId = null;
    this.currentPassword = null;
    console.log('🔌 [WebSocket] Déconnecté manuellement');
  }

  /**
   * Vérifier si le WebSocket est connecté
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Instance singleton
const wsService = new WebSocketService();

export default wsService;