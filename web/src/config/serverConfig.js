


const SERVER_CONFIG = {

  
  async getServerUrl() {
    
    const url = 'https://heterotactic-unaccelerated-golden.ngrok-free.dev';
    console.log('🔧 [Config] URL forcée:', url);
    return url;
  },
  
  async getWebSocketUrl() {
    return 'wss://heterotactic-unaccelerated-golden.ngrok-free.dev';
  }
};

export default SERVER_CONFIG;