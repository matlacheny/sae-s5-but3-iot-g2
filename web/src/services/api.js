
import SERVER_CONFIG from '../config/serverConfig';

// Note : Votre serveur fait office de proxy vers l'API Azure
// Il gère l'authentification et les connexions MQTT/WebSocket

const API_CONFIG = {
  key: SERVER_CONFIG.API_KEY,
  baseUrl: "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api",
  serverUrl: SERVER_CONFIG.SERVER_URL
};

const apiService = {
  // Headers communs
  getHeaders: () => ({
    "api_key": API_CONFIG.key,
    "Content-Type": "application/json"
  }),

  // ==========================================
  // PATIENTS - Via API Azure directement
  // ==========================================
  async getPatients(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_CONFIG.baseUrl}/patients?${params}`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Erreur chargement patients");
    return response.json();
  },

  async getPatient(id) {
    const response = await fetch(`${API_CONFIG.baseUrl}/patients/${id}`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Patient introuvable");
    return response.json();
  },

  async updatePatient(id, data) {
    const response = await fetch(`${API_CONFIG.baseUrl}/patients/${id}`, {
      method: "PUT",
      headers: apiService.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Erreur mise à jour patient");
    return response.json();
  },

  async patchPatient(id, data) {
    const response = await fetch(`${API_CONFIG.baseUrl}/patients/${id}`, {
      method: "PATCH",
      headers: apiService.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error("Erreur modification patient");
    return response.json();
  },

  // ==========================================
  // AIDES-SOIGNANTS - Via API Azure
  // ==========================================
  async getAllAidesSoignants() {
    const response = await fetch(`${API_CONFIG.baseUrl}/aidesoignants`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Erreur chargement AS");
    return response.json();
  },

  async getAideSoignant(id) {
    const response = await fetch(`${API_CONFIG.baseUrl}/aidesoignants/${id}`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Aide-soignant introuvable");
    return response.json();
  },

  // ==========================================
  // MEDECINS - Via API Azure
  // ==========================================
  async getMedecin(id) {
    const response = await fetch(`${API_CONFIG.baseUrl}/medecins/${id}`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Médecin introuvable");
    return response.json();
  },

  // ==========================================
  // PRESCRIPTIONS - Via le SERVEUR (nouveaux endpoints)
  // ==========================================
  
  // Récupérer les prescriptions d'un patient via le serveur
  async getPrescriptions(patientId) {
    const response = await fetch(`${API_CONFIG.serverUrl}/api/prescriptions/${patientId}`, {
      headers: apiService.getHeaders()
    });
    if (!response.ok) throw new Error("Erreur chargement prescriptions");
    return response.json();
  },

  // Ajouter une prescription via le serveur
  async addPrescription(patientId, prescriptionData) {
    const response = await fetch(`${API_CONFIG.serverUrl}/api/prescriptions`, {
      method: "POST",
      headers: apiService.getHeaders(),
      body: JSON.stringify({
        patientId,
        ...prescriptionData
      })
    });
    if (!response.ok) throw new Error("Erreur ajout prescription");
    return response.json();
  },

  // ==========================================
  // SANTÉ DU SERVEUR
  // ==========================================
  async getServerHealth() {
    try {
      const response = await fetch(`${API_CONFIG.serverUrl}/api/health`);
      if (!response.ok) throw new Error("Serveur non disponible");
      return response.json();
    } catch (error) {
      console.error("Erreur de connexion au serveur:", error);
      throw error;
    }
  },

  // ==========================================
  // PATIENTS D'UN AIDE-SOIGNANT - Via le serveur
  // ==========================================
  async getPatientsForAide(aideId) {
    const response = await fetch(`${API_CONFIG.serverUrl}/api/patients/of/${aideId}`, {
      headers: apiService.getHeaders()
    });
    if (!response.ok) throw new Error("Erreur chargement patients de l'aide");
    return response.json();
  },

  // ==========================================
  // ENVOI MANUEL D'ALERTE (pour tests)
  // ==========================================
  async sendManualAlert(aideId, patientId, alertType, message) {
    const response = await fetch(`${API_CONFIG.serverUrl}/api/send-alert`, {
      method: "POST",
      headers: apiService.getHeaders(),
      body: JSON.stringify({
        aideId,
        patientId,
        alertType,
        message
      })
    });
    if (!response.ok) throw new Error("Erreur envoi alerte");
    return response.json();
  }
};

export default apiService;
