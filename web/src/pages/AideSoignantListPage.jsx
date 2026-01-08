import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import AlertsPanel from '../components/AlertsPanel';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const AideSoignantListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const id_aide_soignant = user?.id || "test";

  // États pour la liste de patients
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le modal de création de patient
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    nomFamille: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    adresse_postale: '',
    adresse_electronique: ''
  });
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');
  const [creatingPatient, setCreatingPatient] = useState(false);

  // États pour la suppression
  const [deletingPatient, setDeletingPatient] = useState(null);

  useEffect(() => {
    chargerPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const chargerPatients = async () => {
    try {
      const res = await fetch(
        `${API_URL_BASE}/patients?fk_aide_soignant=${id_aide_soignant}`,
        { headers: { "api_key": API_KEY } }
      );

      if (!res.ok) throw new Error("Erreur API");
      const data = await res.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (e) {
      console.error("Erreur chargement patients :", e);
    }
  };

  const filterPatients = () => {
    const search = searchTerm.toLowerCase();
    const filtered = patients.filter(p =>
      p.nomFamille.toLowerCase().includes(search) ||
      p.prenom.toLowerCase().includes(search)
    );
    setFilteredPatients(filtered);
  };

  // Gestion du formulaire patient
  const handlePatientFormChange = (e) => {
    setPatientForm({
      ...patientForm,
      [e.target.name]: e.target.value
    });
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setPatientError('');
    setPatientSuccess('');

    if (!patientForm.nomFamille || !patientForm.prenom) {
      setPatientError('Le nom et le prénom sont obligatoires');
      return;
    }

    setCreatingPatient(true);

    try {
      const serverUrl = await SERVER_CONFIG.getServerUrl();
      const response = await fetch(`${serverUrl}/api/patients/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_key': API_KEY,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          ...patientForm,
          fk_aide_soignant: user.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setPatientSuccess(`✅ Patient créé avec succès ! 
        
ID: ${data.id}
Mot de passe temporaire: ${data.tempPassword}

⚠️ Notez bien ces informations !`);
        
        setPatientForm({
          nomFamille: '',
          prenom: '',
          date_naissance: '',
          sexe: '',
          adresse_postale: '',
          adresse_electronique: ''
        });
        
        // Recharger la liste sans fermer le modal
        chargerPatients();
      } else {
        setPatientError(data.error || 'Erreur lors de la création du patient');
      }
    } catch (err) {
      console.error('Erreur création patient:', err);
      setPatientError('Erreur de connexion au serveur');
    } finally {
      setCreatingPatient(false);
    }
  };

  // Fonction de suppression de patient
  const handleDeletePatient = async (patient) => {
    const confirmation = window.confirm(
      `⚠️ ATTENTION ⚠️\n\nVoulez-vous vraiment supprimer le patient :\n\n${patient.prenom} ${patient.nomFamille}\n(ID: ${patient.id_patient})\n\nCette action supprimera définitivement :\n• Son compte\n• Ses données médicales\n• Son historique\n\nCette action est IRRÉVERSIBLE !`
    );

    if (!confirmation) {
      return;
    }

    setDeletingPatient(patient.id_patient);

    try {
      const serverUrl = await SERVER_CONFIG.getServerUrl();
      const response = await fetch(`${serverUrl}/api/patients/${patient.id_patient}`, {
        method: 'DELETE',
        headers: {
          'api_key': API_KEY,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        alert(`✅ Le patient ${patient.prenom} ${patient.nomFamille} a été supprimé avec succès.`);
        // Recharger la liste
        chargerPatients();
      } else {
        const error = await response.json();
        alert(`❌ Erreur lors de la suppression : ${error.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      console.error('Erreur suppression patient:', err);
      alert('❌ Erreur de connexion au serveur');
    } finally {
      setDeletingPatient(null);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f8f8f8' }}>
      <style>{`
        body { margin: 0; padding: 0; }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        header h1 {
          margin: 0;
          font-size: 22px;
          color: #2b4c7e;
        }
        header img {
          height: 50px;
        }
        .container {
          padding: 20px;
          text-align: center;
        }
        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          max-width: 60%;
          margin-left: auto;
          margin-right: auto;
        }
        h2 {
          margin: 0;
          color: #1e3d59;
        }
        .btn-add-patient {
          backgroundColor: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          borderRadius: 6px;
          cursor: pointer;
          fontWeight: bold;
          fontSize: 14px;
        }
        .btn-add-patient:hover {
          background-color: #218838;
        }
        .search-bar {
          width: 80%;
          padding: 10px 40px 10px 15px;
          border-radius: 25px;
          border: 1px solid #ccc;
          font-size: 16px;
        }
        .search-bar::placeholder {
          color: #999;
        }
        .search-container {
          position: relative;
          display: inline-block;
          margin-bottom: 30px;
        }
        .search-icon {
          position: absolute;
          right: 15px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #888;
        }
        .patient-list {
          max-height: 400px;
          min-width: 400px
          width: 60%;
          margin: 0 auto;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 12px;
          padding: 10px;
          background-color: white;
        }
        .patient-item {
          padding: 15px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }
        .patient-item:hover {
          background-color: #f0f8ff;
        }
        .patient-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex: 1;
        }
        .delete-btn {
          background-color: transparent;
          border: none;
          cursor: pointer;
          font-size: 20px;
          padding: 5px;
          color: #dc3545;
          transition: all 0.3s;
        }
        .delete-btn:hover:not(:disabled) {
          color: #c82333;
          transform: scale(1.2);
        }
        .delete-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .profile-btn {
          background-color: white;
          border: 1px solid #888;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
        }
        .profile-btn:hover {
          background-color: #e8e8e8;
        }
      `}</style>

      <header>
        <img src="/image/logoMedibox.png" alt="Logo Medibox" />
        <h1>Espace Aide-Soignant</h1>
        <LogoutButton />
      </header>

      <div className="container">
        <div className="header-section">
          <h2>Liste de vos patients</h2>
          <button
            className="btn-add-patient"
            onClick={() => setShowPatientModal(true)}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            + Ajouter un patient
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">&#128269;</span>
        </div>

        <div className="patient-list">
          {filteredPatients.length === 0 ? (
            <p style={{ padding: '20px', color: '#999' }}>
              Aucun patient trouvé. Cliquez sur "Ajouter un patient" pour commencer.
            </p>
          ) : (
            filteredPatients.map(p => (
              <div key={p.id_patient} className="patient-item">
                <div className="patient-info">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePatient(p)}
                    disabled={deletingPatient === p.id_patient}
                    title="Supprimer ce patient"
                  >
                    {deletingPatient === p.id_patient ? '⏳' : '🗑️'}
                  </button>
                  <span>{p.prenom} {p.nomFamille}</span>
                </div>
                <button
                  className="profile-btn"
                  onClick={() => navigate(`/aide-soignant/profile?id=${p.id_patient}`)}
                >
                  Afficher profil
                </button>
              </div>
            ))
          )}
        </div>

        <div id="legend" style={{ marginTop: '15px', display: filteredPatients.length > 0 ? 'block' : 'none' }}>
        </div>
      </div>

      {/* Modal création patient */}
      {showPatientModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0, color: '#1e3d59' }}>Créer un nouveau patient</h2>
            
            <form onSubmit={handleCreatePatient}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Nom <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="nomFamille"
                  value={patientForm.nomFamille}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Prénom <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={patientForm.prenom}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="date_naissance"
                  value={patientForm.date_naissance}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Sexe
                </label>
                <select
                  name="sexe"
                  value={patientForm.sexe}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                >
                  <option value="">Non spécifié</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Adresse postale
                </label>
                <input
                  type="text"
                  name="adresse_postale"
                  value={patientForm.adresse_postale}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                  placeholder="Ex: 123 Rue de la Santé, 75000 Paris"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Adresse électronique
                </label>
                <input
                  type="email"
                  name="adresse_electronique"
                  value={patientForm.adresse_electronique}
                  onChange={handlePatientFormChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box',
                    fontSize: '14px'
                  }}
                  disabled={creatingPatient}
                  placeholder="patient@email.com"
                />
              </div>

              {patientError && (
                <div style={{
                  backgroundColor: '#fee',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  border: '1px solid #fcc'
                }}>
                  ❌ {patientError}
                </div>
              )}

              {patientSuccess && (
                <div style={{
                  backgroundColor: '#d4edda',
                  color: '#155724',
                  padding: '15px',
                  borderRadius: '6px',
                  marginBottom: '15px',
                  fontSize: '13px',
                  border: '1px solid #c3e6cb',
                  whiteSpace: 'pre-line'
                }}>
                  {patientSuccess}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="submit"
                  disabled={creatingPatient}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: creatingPatient ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: creatingPatient ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  {creatingPatient ? '⏳ Création...' : '✓ Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPatientModal(false);
                    setPatientError('');
                    setPatientSuccess('');
                    setPatientForm({
                      nomFamille: '',
                      prenom: '',
                      date_naissance: '',
                      sexe: '',
                      adresse_postale: '',
                      adresse_electronique: ''
                    });
                  }}
                  disabled={creatingPatient}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: creatingPatient ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  ✕ Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {user && (
        <AlertsPanel 
          aideId={user.id} 
          password={user.data?.mot_de_passe} 
        />
      )}
    </div>
  );
};

export default AideSoignantListPage;