import React from 'react';
import { useAlerts } from '../hooks/useAlerts';

/**
 * Panneau d'affichage des alertes pour les aides-soignants
 * À intégrer plus tard (si besoin) dans AideSoignantListPage ou AideSoignantProfilePage
 */
const AlertsPanel = ({ aideId, password }) => {
  const { 
    alerts, 
    isConnected, 
    error, 
    unreadCount, 
    markAsRead, 
    removeAlert,
    clearAlerts,
    refreshAlerts
  } = useAlerts(aideId, password);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      maxHeight: '500px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        .alerts-header {
          padding: 15px 20px;
          background-color: #4a73d9;
          color: white;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alerts-body {
          flex: 1;
          overflow-y: auto;
          max-height: 400px;
        }
        .alert-item {
          padding: 15px;
          border-bottom: 1px solid #eee;
          cursor: pointer;
          transition: background 0.2s;
        }
        .alert-item:hover {
          background-color: #f8f9fa;
        }
        .alert-item.unread {
          background-color: #e7f3ff;
          border-left: 4px solid #4a73d9;
        }
        .alert-type {
          font-weight: bold;
          color: #dc3545;
          font-size: 14px;
          margin-bottom: 5px;
        }
        .alert-message {
          font-size: 13px;
          color: #666;
          margin-bottom: 5px;
        }
        .alert-time {
          font-size: 11px;
          color: #999;
        }
        .connection-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${isConnected ? '#28a745' : '#dc3545'};
        }
        .badge {
          background-color: #dc3545;
          color: white;
          border-radius: 10px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: bold;
        }
        .no-alerts {
          padding: 40px 20px;
          text-align: center;
          color: #999;
        }
        .alert-actions {
          display: flex;
          gap: 10px;
          padding: 10px 15px;
          border-top: 1px solid #eee;
        }
        .btn-alert {
          flex: 1;
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }
        .btn-clear {
          background-color: #dc3545;
          color: white;
        }
        .btn-clear:hover {
          background-color: #c82333;
        }
        .btn-refresh {
          background-color: #4a73d9;
          color: white;
        }
        .btn-refresh:hover {
          background-color: #365dbf;
        }
        .error-message {
          padding: 10px;
          background-color: #f8d7da;
          color: #721c24;
          font-size: 12px;
          border-bottom: 1px solid #eee;
        }
      `}</style>

      {/* Header */}
      <div className="alerts-header">
        <div>
          <strong>🔔 Alertes</strong>
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </div>
        <div className="connection-status">
          <span className="status-dot"></span>
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Liste des alertes */}
      <div className="alerts-body">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            📭<br/>
            Aucune alerte
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.alertId}
              className={`alert-item ${!alert.read ? 'unread' : ''}`}
              onClick={() => markAsRead(alert.alertId)}
            >
              <div className="alert-type">
                {getAlertTypeLabel(alert.alertType)}
              </div>
              <div className="alert-message">
                Patient: {alert.patientId}<br/>
                {alert.message || 'Alerte de la boîte'}
              </div>
              <div className="alert-time">
                {formatTime(alert.timestamp)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAlert(alert.alertId);
                }}
                style={{
                  marginTop: '5px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      {alerts.length > 0 && (
        <div className="alert-actions">
          <button className="btn-alert btn-refresh" onClick={refreshAlerts}>
            🔄 Actualiser
          </button>
          <button className="btn-alert btn-clear" onClick={clearAlerts}>
            🗑️ Tout effacer
          </button>
        </div>
      )}
    </div>
  );
};

// Helpers
function getAlertTypeLabel(alertType) {
  const labels = {
    'empty': '📦 Boîte vide',
    'late': '⏰ Retard de prise',
    'error': '❌ Erreur système',
    'low': '⚠️ Stock faible',
    'default': '🔔 Alerte'
  };
  
  return labels[alertType] || labels.default;
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // Moins d'une minute
  if (diff < 60000) return 'À l\'instant';
  
  // Moins d'une heure
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `Il y a ${mins} min`;
  }
  
  // Moins d'un jour
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `Il y a ${hours}h`;
  }
  
  // Format complet
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default AlertsPanel;