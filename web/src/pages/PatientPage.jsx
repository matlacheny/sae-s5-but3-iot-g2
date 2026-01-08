import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import LogoutButton from '../LogoutButton.jsx';
import SERVER_CONFIG from '../config/serverConfig';

const API_KEY = SERVER_CONFIG.API_KEY;
const API_URL_BASE = "https://apidatabasesae-aee3egcmdke2b6a2.germanywestcentral-01.azurewebsites.net/api";

const PatientPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const idPatient = user?.id;

  const [patient, setPatient] = useState(null);
  const [aideSoignant, setAideSoignant] = useState(null);
  const [showInfoAS, setShowInfoAS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ date: '', medications: [] });
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour la prescription
  const [prescriptionUrl, setPrescriptionUrl] = useState('');

  useEffect(() => {
    console.log('=== DEBUG PatientPage ===');
    console.log('User complet:', user);
    console.log('ID Patient:', idPatient);
    
    if (idPatient) {
      chargerDonneesPatient();
      chargerPrescription();
    } else {
      console.error('ERREUR: Pas d\'ID patient trouvé');
      setError('Impossible de récupérer l\'identifiant du patient');
      setLoading(false);
    }
  }, [idPatient]);

  // Charger la prescription du patient
  const chargerPrescription = () => {
    const prescKey = `prescription_patient_${idPatient}`;
    const savedPrescription = localStorage.getItem(prescKey);
    
    if (savedPrescription) {
      setPrescriptionUrl(savedPrescription);
      console.log('Prescription trouvée pour le patient:', idPatient);
    } else {
      console.log('Aucune prescription pour ce patient');
    }
  };

  const chargerDonneesPatient = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Tentative de chargement du patient:', idPatient);
      console.log('URL appelée:', `${API_URL_BASE}/patients/${idPatient}`);
      
      const response = await fetch(`${API_URL_BASE}/patients/${idPatient}`, {
        headers: { "api_key": API_KEY }
      });
      
      console.log('Status response:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const patientData = await response.json();
      console.log('Patient chargé avec succès:', patientData);
      setPatient(patientData);

      if (patientData.fk_aide_soignant) {
        setShowInfoAS(true);
        await chargerInfoAideSoignant(patientData.fk_aide_soignant);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('ERREUR lors du chargement:', error);
      setError('Erreur lors du chargement du patient: ' + error.message);
      setLoading(false);
    }
  };

  const chargerInfoAideSoignant = async (idAS) => {
    try {
      console.log('Chargement aide-soignant:', idAS);
      const response = await fetch(`${API_URL_BASE}/aidesoignants/${idAS}`, {
        headers: { "api_key": API_KEY }
      });
      
      if (response.ok) {
        const asData = await response.json();
        console.log('Aide-soignant chargé:', asData);
        setAideSoignant(asData);
      }
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

  if (loading) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Chargement des données...</h2>
          <p>Patient ID: {idPatient || 'Non trouvé'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        fontFamily: 'Arial, sans-serif', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f8f8f8'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#dc3545' }}>⚠️ Erreur</h2>
          <p>{error}</p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Informations de débogage:</strong>
            <pre style={{ fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify({ 
                idPatient, 
                user: user ? { id: user.id, role: user.role } : 'null' 
              }, null, 2)}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4a73d9',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { monthName, weekDays, offset, daysInMonth } = renderCalendar(month, year);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, backgroundColor: '#f8f8f8' }}>
      <style>{`
        html, body {
          overflow-x: hidden; /* Empêche le défilement horizontal */
          width: 100%;
          max-width: 100vw;
        }

        /* Pour votre élément racine */
        #root {
          max-width: 100%;
          overflow-x: hidden;
        }
        
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
          max-width: 90%;
        }
        .infos {
          display: flex;
          gap: 30px;
          margin-bottom: 30px;
          max-width: 80%;
        }
        .bloc-info {
          max-width: 40%;
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
          max-width: 80%;
        }
        .pdf-viewer {
          width: 100%;
          height: 500px;
          border: 2px solid #ddd;
          border-radius: 8px;
          margin-bottom: 40px;
          background-color: #f9f9f9;
        }
        .no-prescription {
          width: 90%;
          height: 400px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          margin-bottom: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          background-color: #fafafa;
          color: #999;
          font-style: italic;
        }
        .no-prescription-icon {
          font-size: 64px;
          margin-bottom: 15px;
        }
        .calendar {
          background-color: white;
          padding: 20px;
          max-width: 90%;
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
          max-width: 85%;
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
          max-width: 80%;
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
        .prescription-status {
          display: inline-block;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .prescription-status.available {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .prescription-status.unavailable {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>

      <header>
        <img src="/image/Logo.webp" alt="Logo Medibox" />
        <h1>Espace Patient</h1>
        <LogoutButton />
      </header>

      <div className="container">
        <div className="infos">
          <div className="bloc-info">
            <h2>Médecin</h2>
            <p>Nom : {patient?.fk_medecin_traitant || 'Non assigné'}</p>
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
        
        {prescriptionUrl ? (
          <>
            <span className="prescription-status available">
              ✓ Prescription disponible
            </span>
            <iframe 
              className="pdf-viewer" 
              src={prescriptionUrl}
              title="Votre prescription médicale"
            />
          </>
        ) : (
          <>
            <span className="prescription-status unavailable">
              ⚠ Aucune prescription
            </span>
            <div className="no-prescription">
              <div className="no-prescription-icon">📋</div>
              <p style={{ fontSize: '16px', margin: '10px 0' }}>
                Aucune prescription n'a encore été ajoutée par votre médecin
              </p>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Votre prescription apparaîtra ici dès que votre médecin l'aura téléversée
              </p>
            </div>
          </>
        )}

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