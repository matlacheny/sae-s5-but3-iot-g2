import { useState, useEffect, useCallback } from 'react';
import wsService from '../services/WebSocketService';

/**
 * Hook personnalisé pour gérer les alertes WebSocket
 * À utiliser dans les composants des aides-soignants
 */
export const useAlerts = (aideId, password) => {
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  // Initialiser la connexion WebSocket
  useEffect(() => {
    if (!aideId || !password) {
      setError('ID ou mot de passe manquant pour la connexion WebSocket');
      return;
    }

    // Se connecter au WebSocket
    wsService.connect(aideId, password);

    // Handler pour les nouveaux messages
    const unsubscribeMessage = wsService.onMessage((data) => {
      console.log('Nouvelle alerte reçue:', data);
      
      // Ajouter l'alerte à la liste
      setAlerts(prev => {
        // Éviter les doublons (basé sur alertId)
        const exists = prev.some(a => a.alertId === data.alertId);
        if (exists) return prev;
        
        return [data, ...prev]; // Ajouter au début
      });
    });

    // Handler pour les changements de connexion
    const unsubscribeConnection = wsService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (!connected) {
        setError('Connexion WebSocket perdue');
      } else {
        setError(null);
      }
    });

    // Nettoyage à la destruction du composant
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      wsService.disconnect();
    };
  }, [aideId, password]);

  // Fonction pour marquer une alerte comme lue
  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.alertId === alertId 
          ? { ...alert, read: true }
          : alert
      )
    );
  }, []);

  // Fonction pour supprimer une alerte
  const removeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.filter(a => a.alertId !== alertId));
  }, []);

  // Fonction pour vider toutes les alertes
  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Fonction pour demander le renvoi des alertes en attente
  const refreshAlerts = useCallback(() => {
    wsService.requestPendingAlerts();
  }, []);

  // Compteur d'alertes non lues
  const unreadCount = alerts.filter(a => !a.read).length;

  return {
    alerts,
    isConnected,
    error,
    unreadCount,
    markAsRead,
    removeAlert,
    clearAlerts,
    refreshAlerts
  };
};

export default useAlerts;