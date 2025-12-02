import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import InfoCard from '../components/common/InfoCard';
import Calendar from '../components/common/Calendar';
import DetailsPanel from '../components/common/DetailsPanel';
import apiService from '../services/api';

const PatientPage = () => {
  const [searchParams] = useSearchParams();
  const idPatient = searchParams.get('idPatient') || 'pat1';

  const [patient, setPatient] = useState(null);
  const [aideSoignant, setAideSoignant] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const patientData = await apiService.getPatient(idPatient);
        setPatient(patientData);

        if (patientData.fk_aide_soignant) {
          const asData = await apiService.getAideSoignant(patientData.fk_aide_soignant);
          setAideSoignant(asData);
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
      }
    };

    loadData();
  }, [idPatient]);

  const handleDayClick = (day, month, year) => {
    setSelectedDate(`${day}/${month + 1}/${year}`);
    setShowDetails(true);
  };

  // Medications fictives (à remplacer par API)
  const mockMedications = [
    { nom: "Doliprane", heure: "08:00", quantite: 1, compartiment: 2 },
    { nom: "Ibuprofène", heure: "14:00", quantite: 1, compartiment: 1 }
  ];

  return (
    <div>
      <Header title="Espace Patient" />
      
      <div className="container">
        <div className="infos">
          <InfoCard title="Médecin" data={patient} />
          <InfoCard title="Aide-Soignant" data={aideSoignant} />
        </div>

        <h2 className="section-title">Prescription</h2>
        <iframe className="pdf-viewer" src=""></iframe>

        <h2 className="section-title">Suivi du traitement</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Calendar onDayClick={handleDayClick} />
          <DetailsPanel 
            date={selectedDate} 
            medications={mockMedications}
            show={showDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientPage;