import React from 'react';

const DetailsPanel = ({ date, medications, show }) => {
  if (!show) return null;

  return (
    <aside className="details-panel">
      <h3>Détails du {date}</h3>
      <div className="details-content">
        {medications && medications.length > 0 ? (
          medications.map((med, index) => (
            <div key={index} className="medoc-item">
              <b>{med.nom}</b> – {med.heure}<br />
              Quantité : {med.quantite}<br />
              Compartiment : {med.compartiment}
            </div>
          ))
        ) : (
          <p className="empty-text">Aucun médicament prévu ce jour</p>
        )}
      </div>
    </aside>
  );
};

export default DetailsPanel;