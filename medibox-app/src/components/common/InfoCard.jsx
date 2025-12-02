import React from 'react';

const InfoCard = ({ title, data }) => {
  return (
    <div className="bloc-info">
      <h2>{title}</h2>
      {data ? (
        <>
          <p>Nom : {data.nomFamille || data.nom}</p>
          <p>Prénom : {data.prenom}</p>
          <p>Date de naissance : {data.date_naissance}</p>
          <p>Sexe : {data.sexe}</p>
          <p>Adresse : {data.adresse_postale}</p>
          <p>Email : {data.adresse_electronique}</p>
        </>
      ) : (
        <p className="empty-text">Aucune information disponible</p>
      )}
    </div>
  );
};

export default InfoCard;