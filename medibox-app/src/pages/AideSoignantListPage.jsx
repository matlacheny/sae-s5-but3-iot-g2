import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_KEY = "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63";
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const AideSoignantListPage = () => {
  const navigate = useNavigate();
  const id_aide_soignant = "test";

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

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
          cursor: pointer;
        }
        .patient-item:hover {
          background-color: #f0f8ff;
        }
        .profile-btn {
          background-color: white;
          border: 1px solid #888;
          padding: 5px 10px;
          border-radius: 6px;
          cursor: pointer;
          float: right;
        }
      `}</style>

      <header>
        <img src="/image/logoMedibox.png" alt="Logo Medibox" />
        <h1>Espace Aide-Soignant</h1>
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
            <div key={p.id_patient} className="patient-item">
              <span>{p.prenom} {p.nomFamille}</span>
              <button
                className="profile-btn"
                onClick={() => navigate(`/aide-soignant/profile?id=${p.id_patient}`)}
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
    </div>
  );
};

export default AideSoignantListPage;