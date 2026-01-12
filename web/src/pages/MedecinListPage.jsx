import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const MedecinListPage = () => {
  const navigate = useNavigate();
  const idMedecin = "med1";

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);

  useEffect(() => {
    chargerPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

 const chargerPatients = async () => {
  try {
    const response = await fetch(`${API_URL_BASE}/patients`, {
      headers: { "api_key": API_KEY }
    });

    if (!response.ok) throw new Error("Erreur lors du chargement des patients");

    const data = await response.json();

    setPatients(data);
    setFilteredPatients(data);

  } catch (error) {
    console.error("Erreur :", error);
  }
};


  const filterPatients = () => {
    const search = searchTerm.toLowerCase();
    const filtered = patients.filter(p =>
      p.prenom.toLowerCase().includes(search) ||
      p.nomFamille.toLowerCase().includes(search)
    );
    setFilteredPatients(filtered);
  };

  const toggleAssign = (p) => {
    if (p.fk_medecin_traitant === idMedecin) {
      setCurrentPatient(p);
      setShowPopup(true);
    } else {
      mettreAJourAssignation(p.id_patient, idMedecin);
      const updated = patients.map(pat =>
        pat.id_patient === p.id_patient
          ? { ...pat, fk_medecin_traitant: idMedecin }
          : pat
      );
      setPatients(updated);
    }
  };

  const confirmUnassign = () => {
    if (currentPatient) {
      mettreAJourAssignation(currentPatient.id_patient, null);
      const updated = patients.map(p =>
        p.id_patient === currentPatient.id_patient
          ? { ...p, fk_medecin_traitant: null }
          : p
      );
      setPatients(updated);
    }
    setShowPopup(false);
    setCurrentPatient(null);
  };

  const mettreAJourAssignation = async (idPatient, nouveauMedecin) => {
    try {
      await fetch(`${API_URL_BASE}/patients/${idPatient}`, {
        method: "PATCH",
        headers: {
          "api_key": API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ fk_medecin_traitant: nouveauMedecin })
      });
    } catch (e) {
      console.error("Erreur API assignation :", e);
    }
  };

  const handleViewProfile = (p) => {
    if (p.fk_medecin_traitant === idMedecin) {
      navigate(`/medecin/profile?id=${p.id_patient}`);
    } else {
      alert("Vous ne pouvez pas accéder à ce profil tant que vous ne vous êtes pas assigné à ce patient.");
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
        h2 {
          margin-bottom: 20px;
          color: #1e3d59;
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
          min-width: 70%;
          max-width: 90%;
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
          cursor: pointer;
        }
        .patient-item:hover {
          background-color: #f0f8ff;
        }
        .selected-patient {
          background-color: #cfe3ff !important;
          border-left: 5px solid #4a73d9;
        }
        .assign-btn {
          background-color: #e6f0ff;
          border: 1px solid #4a73d9;
          padding: 5px 8px;
          border-radius: 5px;
          cursor: pointer;
          margin-right: 10px;
        }
        .profile-btn {
          background-color: white;
          border: 1px solid #888;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
          float: right;
        }
        .popup-overlay {
          position: fixed;
          top:0; left:0;
          width:100%; height:100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .popup-box {
          background: white;
          padding: 20px;
          border-radius: 12px;
          width: 350px;
          text-align: center;
        }
        .btn-non {
          background-color: rgb(230,60,60);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
        }
        .btn-oui {
          background-color: white;
          border: 1px solid #4a73d9;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
        }
      `}</style>

      <header>
        <img src="/image/logoMedibox.png" alt="Logo Medibox" />
        <h1>Espace Medecin</h1>
        <LogoutButton/>
      </header>

      <div className="container">
        <h2>Liste de vos patients</h2>

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
          {filteredPatients.map(p => (
            <div
              key={p.id_patient}
              className={`patient-item ${p.fk_medecin_traitant === idMedecin ? 'selected-patient' : ''}`}
            >
              <button
                className="assign-btn"
                onClick={() => toggleAssign(p)}
              >
                {p.fk_medecin_traitant === idMedecin ? 'Assigné' : 'S\'assigner'}
              </button>

              <span>{p.prenom} {p.nomFamille}</span>

              <button
                className="profile-btn"
                onClick={() => handleViewProfile(p)}
              >
                Afficher profil
              </button>
            </div>
          ))}
        </div>

        <div id="legend" style={{ marginTop: '15px', display: filteredPatients.length > 0 ? 'block' : 'none' }}>
          <span style={{ width: '15px', height: '15px', background: '#cfe3ff', display: 'inline-block', borderRadius: '4px' }}></span>
          <span style={{ marginLeft: '8px' }}>Vos patients</span>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>Voulez-vous vraiment ne plus être assigné à ce patient ?<br /><br />
              (Vous n'aurez plus accès à ses informations)</p>
            <br />
            <button className="btn-non" onClick={() => setShowPopup(false)}>Non</button>
            {' '}
            <button className="btn-oui" onClick={confirmUnassign}>Oui</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedecinListPage;