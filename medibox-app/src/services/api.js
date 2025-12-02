const API_CONFIG = {
  key: "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63",
  baseUrl: "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api"
};

const apiService = {
  // Headers communs
  getHeaders: () => ({
    "api_key": API_CONFIG.key,
    "Content-Type": "application/json"
  }),

  // PATIENTS
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

  // AIDES-SOIGNANTS
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

  // MEDECINS
  async getMedecin(id) {
    const response = await fetch(`${API_CONFIG.baseUrl}/medecins/${id}`, {
      headers: { "api_key": API_CONFIG.key }
    });
    if (!response.ok) throw new Error("Médecin introuvable");
    return response.json();
  }
};

export default apiService;