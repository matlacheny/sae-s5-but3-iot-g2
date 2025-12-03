import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_KEY = "9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63";
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const PatientPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const idPatient = searchParams.get('idPatient') || 'pat1';

  const [patient, setPatient] = useState(null);
  const [aideSoignant, setAideSoignant] = useState(null);
  const [showInfoAS, setShowInfoAS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ date: '', medications: [] });
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    chargerDonneesPatient();
  }, [idPatient]);

  const chargerDonneesPatient = async () => {
    try {
      const response = await fetch(`${API_URL_BASE}/patients/${idPatient}`, {
        headers: { "api_key": API_KEY }
      });
      
      if (!response.ok) throw new Error("Erreur récupération patient");
      const patientData = await response.json();
      setPatient(patientData);

      if (patientData.fk_aide_soignant) {
        setShowInfoAS(true);
        await chargerInfoAideSoignant(patientData.fk_aide_soignant);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const chargerInfoAideSoignant = async (idAS) => {
    try {
      const response = await fetch(`${API_URL_BASE}/aidesoignants/${idAS}`, {
        headers: { "api_key": API_KEY }
      });
      const asData = await response.json();
      setAideSoignant(asData);
    } catch (error) {
      console.error("Erreur chargement AS", error);
    }
  };

  const renderCalendar = (m, y) => {
    const current = new Date(y, m, 1);
    const monthName = current.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    let offset = firstDay === 0 ? 6 : firstDay - 1;
    
    return { monthName, weekDays, offset, daysInMonth };
  };

  const changeMonth = (step) => {
    let m = month + step;
    let y = year;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setMonth(m);
    setYear(y);
  };

  const openDetails = (day, month, year) => {
    const medications = [
      { nom: "Doliprane", heure: "08:00", quantite: 1, compartiment: 2 },
      { nom: "Ibuprofène", heure: "14:00", quantite: 1, compartiment: 1 }
    ];
    
    setModalContent({
      date: `${day}/${month + 1}/${year}`,
      medications
    });
    setShowModal(true);
  };

  const { monthName, weekDays, offset, daysInMonth } = renderCalendar(month, year);

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
        }
        .infos {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
        }
        .bloc-info {
          flex: 1;
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .bloc-info h2 {
          margin-top: 0;
          color: #1e3d59;
        }
        h2.section-title {
          margin-top: 40px;
          color: #1e3d59;
        }
        .pdf-viewer {
          width: 100%;
          height: 400px;
          border: 1px solid #ccc;
          border-radius: 8px;
          margin-bottom: 40px;
        }
        .calendar {
          background-color: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .modal-overlay {
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.4);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-box {
          background: #fff;
          padding: 20px;
          width: 400px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        .modal-box h3 {
          margin-top: 0;
          font-size: 20px;
          margin-bottom: 10px;
        }
        .close-btn {
          float: right;
          cursor: pointer;
          font-size: 22px;
          margin-top: -10px;
        }
        .medoc-item {
          background: #f2f6ff;
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          border-left: 4px solid #4a73d9;
        }
        .os-calendar {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          width: 350px;
        }
        .cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
        }
        .nav-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }
        .cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          text-align: center;
        }
        .day-name {
          font-weight: bold;
          color: #444;
        }
        .empty {
          height: 40px;
        }
        .day {
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          background: #f2f2f2;
          transition: 0.2s;
        }
        .day:hover {
          background: #cfe3ff;
        }
      `}</style>

      <header>
        <img src="/image/Logo.webp" alt="Logo Medibox" />
        <h1>Espace Patient</h1>
      </header>

      <div className="container">
        <div className="infos">
          <div className="bloc-info">
            <h2>Médecin</h2>
            <p>Nom : </p>
            <p>Prénom : </p>
            <p>Date de naissance : </p>
            <p>Sexe : </p>
            <p>Adresse : </p>
            <p>Email : </p>
          </div>

          <div className="bloc-info">
            <h2>Aide-soignant</h2>
            
            {showInfoAS && aideSoignant ? (
              <div>
                <p>Nom : {aideSoignant.nomFamille || aideSoignant.nom || ''}</p>
                <p>Prénom : {aideSoignant.prenom || ''}</p>
                <p>Date de naissance : {aideSoignant.date_naissance || ''}</p>
                <p>Sexe : {aideSoignant.sexe || ''}</p>
                <p>Adresse : {aideSoignant.adresse_postale || ''}</p>
                <p>Email : {aideSoignant.adresse_electronique || ''}</p>
                <button 
                  onClick={() => navigate(`/assign?idPatient=${idPatient}`)}
                  style={{
                    marginTop: '15px',
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#f0ad4e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Changer d'aide-soignant
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
                  Aucun aide-soignant n'est encore assigné à votre dossier.
                </p>
                <button 
                  onClick={() => navigate(`/assign?idPatient=${idPatient}`)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4a73d9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Assigner un aide-soignant
                </button>
              </div>
            )}
          </div>
        </div>

        <h2 className="section-title">Prescription</h2>
        <iframe className="pdf-viewer" src=""></iframe>

        <h2 className="section-title">Suivi du traitement</h2>
        <div className="calendar">
          <div className="os-calendar">
            <div className="cal-header">
              <button className="nav-btn" onClick={() => changeMonth(-1)}>◀</button>
              <span className="month-title">{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</span>
              <button className="nav-btn" onClick={() => changeMonth(1)}>▶</button>
            </div>
            <div className="cal-grid">
              {weekDays.map(d => <div key={d} className='day-name'>{d}</div>)}
              {[...Array(offset)].map((_, i) => <div key={`empty-${i}`} className='empty'></div>)}
              {[...Array(daysInMonth)].map((_, i) => (
                <div
                  key={i + 1}
                  className='day'
                  onClick={() => openDetails(i + 1, month, year)}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
            <h3>Détails du {modalContent.date}</h3>
            <div>
              {modalContent.medications.map((med, index) => (
                <div key={index} className="medoc-item">
                  <b>{med.nom}</b> – {med.heure}<br />
                  Quantité : {med.quantite}<br />
                  Compartiment : {med.compartiment}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientPage;