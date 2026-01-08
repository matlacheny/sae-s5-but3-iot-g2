import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";
 
const AssignAideSoignantPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
const { user } = useAuth();

  const idPatient = user?.id || '';

  const [aidesSoignants, setAidesSoignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAidesSoignants();
  }, []);

  const fetchAidesSoignants = async () => {
    try {
      const response = await fetch(`${API_BASE}/aidesoignants`, {
        method: "GET",
        headers: { "api_key": API_KEY, "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setAidesSoignants(data);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lecture AS :", error);
      setError('Impossible de charger la liste.');
      setLoading(false);
    }
  };

  const assignerAideSoignant = async (idAS, nom, prenom) => {
/*if (!window.confirm(`Confirmer l'assignation de ${prenom} ${nom} (ID: ${idAS}) au patient ${idPatient} ?`)) {
      return;
    }*/

    try {
      const getResp = await fetch(`${API_BASE}/patients/${idPatient}`, {
        method: "GET",
        headers: { "api_key": API_KEY }
      });

      if (!getResp.ok) throw new Error(`Patient introuvable (ID: ${idPatient})`);
      const patientData = await getResp.json();

      patientData.fk_aide_soignant = idAS;

      const updateResp = await fetch(`${API_BASE}/patients/${idPatient}`, {
        method: "PUT",
        headers: {
          "api_key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(patientData)
      });

      if (updateResp.ok) {
        alert("Aide-soignant assigné avec succès !");
        navigate(`/patient?idPatient=${idPatient}`);
      } else {
        const errTxt = await updateResp.text();
        console.error("Erreur API PUT:", errTxt);
        alert("Erreur lors de la sauvegarde : " + updateResp.status + "\n" + errTxt);
      }
    } catch (error) {
      console.error("Erreur update :", error);
      alert("Erreur technique : " + error.message);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial', backgroundColor: '#f8f8f8', margin: 0, padding: '20px', color: '#333', minHeight: '100vh' }}>
      <style>{`
        h1 {
          color: #2b4c7e;
          text-align: center;
          margin-bottom: 30px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .card-as {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 5px solid #4a73d9;
          margin-bottom: 15px;
        }
        .nom-complet {
          font-weight: bold;
          font-size: 1.1em;
          color: #1e3d59;
          display: block;
        }
        .info-detail {
          color: #666;
          font-size: 0.9em;
          display: block;
          margin-top: 5px;
        }
        .btn-assigner {
          background-color: #4a73d9;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s;
        }
        .btn-assigner:hover {
          background-color: #365dbf;
        }
        .loading {
          text-align: center;
          font-style: italic;
          color: #888;
        }
        .error {
          color: red;
          text-align: center;
          font-weight: bold;
        }
      `}</style>

      <div className="container">
        <h1>Choisir un Aide-Soignant</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
          Patient concerné : <strong>{idPatient}</strong>
        </p>

        {loading && <p className="loading">Chargement des aides-soignants...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div>
            {aidesSoignants.length === 0 ? (
              <p className="loading">Aucun aide-soignant trouvé.</p>
            ) : (
              aidesSoignants.map(as => {
                const nom = as.nomFamille || 'Inconnu';
                const prenom = as.prenom || '';
                const email = as.adresse_electronique || 'Email non renseigné';
                const adresse = as.adresse_postale || 'Adresse non renseignée';
                const idAS = as.id_aide_soignant;

                return (
                  <div key={idAS} className="card-as">
                    <div>
                      <span className="nom-complet">{nom} {prenom}</span>
                      <span className="info-detail">📧 {email}</span>
                      <span className="info-detail">📍 {adresse}</span>
                    </div>
                    <button
                      className="btn-assigner"
                      onClick={() => assignerAideSoignant(idAS, nom, prenom)}
                    >
                      Choisir
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignAideSoignantPage;