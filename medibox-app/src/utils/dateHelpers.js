/**
 * Utilitaires pour la manipulation des dates
 * Utilisé par le calendrier et les autres composants nécessitant des dates
 */

/**
 * Formate une date au format DD/MM/YYYY
 * @param {Date|string} date - La date à formater
 * @returns {string} La date formatée
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formate une date au format français long (ex: "15 janvier 2024")
 * @param {Date|string} date - La date à formater
 * @returns {string} La date formatée
 */
export const formatDateLong = (date) => {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Retourne le nom du mois en français
 * @param {number} monthIndex - Index du mois (0-11)
 * @returns {string} Nom du mois
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex];
};

/**
 * Retourne le nom court du jour de la semaine
 * @param {number} dayIndex - Index du jour (0-6, 0 = Dimanche)
 * @returns {string} Nom court du jour
 */
export const getDayShortName = (dayIndex) => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days[dayIndex];
};

/**
 * Retourne les noms des jours de la semaine (Lundi à Dimanche)
 * @returns {string[]} Tableau des noms de jours
 */
export const getWeekDays = () => {
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
};

/**
 * Calcule le nombre de jours dans un mois
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {number} Nombre de jours
 */
export const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * Retourne le premier jour du mois (0 = Dimanche, 6 = Samedi)
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {number} Jour de la semaine
 */
export const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay();
};

/**
 * Convertit le premier jour pour commencer à Lundi (au lieu de Dimanche)
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {number} Décalage pour calendrier commençant le lundi
 */
export const getMonthOffset = (month, year) => {
  const firstDay = getFirstDayOfMonth(month, year);
  return firstDay === 0 ? 6 : firstDay - 1;
};

/**
 * Vérifie si une date est aujourd'hui
 * @param {number} day - Jour
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {boolean} true si c'est aujourd'hui
 */
export const isToday = (day, month, year) => {
  const today = new Date();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
};

/**
 * Vérifie si une date est dans le passé
 * @param {number} day - Jour
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {boolean} true si c'est dans le passé
 */
export const isPastDate = (day, month, year) => {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Vérifie si une date est dans le futur
 * @param {number} day - Jour
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {boolean} true si c'est dans le futur
 */
export const isFutureDate = (day, month, year) => {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

/**
 * Ajoute des jours à une date
 * @param {Date} date - Date de départ
 * @param {number} days - Nombre de jours à ajouter
 * @returns {Date} Nouvelle date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Soustrait des jours d'une date
 * @param {Date} date - Date de départ
 * @param {number} days - Nombre de jours à soustraire
 * @returns {Date} Nouvelle date
 */
export const subtractDays = (date, days) => {
  return addDays(date, -days);
};

/**
 * Calcule la différence en jours entre deux dates
 * @param {Date} date1 - Première date
 * @param {Date} date2 - Deuxième date
 * @returns {number} Différence en jours
 */
export const daysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d1 - d2) / oneDay);
};

/**
 * Formate une heure au format HH:MM
 * @param {string|Date} time - Heure à formater
 * @returns {string} Heure formatée
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  if (typeof time === 'string') {
    return time.substring(0, 5);
  }
  
  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Convertit une date API (ISO) en objet Date
 * @param {string} isoString - Date au format ISO
 * @returns {Date} Objet Date
 */
export const parseISODate = (isoString) => {
  if (!isoString) return null;
  return new Date(isoString);
};

/**
 * Convertit une date en format ISO pour l'API
 * @param {Date} date - Date à convertir
 * @returns {string} Date au format ISO
 */
export const toISODate = (date) => {
  if (!date) return '';
  return date.toISOString();
};

/**
 * Obtient le jour de la semaine en français
 * @param {Date} date - Date
 * @returns {string} Jour de la semaine
 */
export const getDayName = (date) => {
  const days = [
    'Dimanche', 'Lundi', 'Mardi', 'Mercredi', 
    'Jeudi', 'Vendredi', 'Samedi'
  ];
  return days[date.getDay()];
};

/**
 * Crée un objet Date à partir de composants
 * @param {number} day - Jour
 * @param {number} month - Mois (0-11)
 * @param {number} year - Année
 * @returns {Date} Objet Date
 */
export const createDate = (day, month, year) => {
  return new Date(year, month, day);
};

/**
 * Retourne la date du jour au format YYYY-MM-DD
 * @returns {string} Date du jour
 */
export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Vérifie si une année est bissextile
 * @param {number} year - Année
 * @returns {boolean} true si bissextile
 */
export const isLeapYear = (year) => {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export default {
  formatDate,
  formatDateLong,
  getMonthName,
  getDayShortName,
  getWeekDays,
  getDaysInMonth,
  getFirstDayOfMonth,
  getMonthOffset,
  isToday,
  isPastDate,
  isFutureDate,
  addDays,
  subtractDays,
  daysDifference,
  formatTime,
  parseISODate,
  toISODate,
  getDayName,
  createDate,
  getTodayString,
  isLeapYear
};