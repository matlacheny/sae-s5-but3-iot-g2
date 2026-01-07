
const SERVER_CONFIG = {

  API_KEY: import.meta.env.VITE_API_KEY,
  async getServerUrl() {
    
    const url = 'https://heterotactic-unaccelerated-golden.ngrok-free.dev';
    console.log('🔧 [Config] URL forcée:', url);
    return url;
  },
  
  async getWebSocketUrl() {
    return 'wss://heterotactic-unaccelerated-golden.ngrok-free.dev';
  }
};

// Vérification
if (!SERVER_CONFIG.API_KEY) {
  console.error('❌ [Config] VITE_API_KEY manquante dans .env');
} else {
  console.log('✅ [Config] API_KEY chargée (longueur:', SERVER_CONFIG.API_KEY.length, ')');
}

export default SERVER_CONFIG;