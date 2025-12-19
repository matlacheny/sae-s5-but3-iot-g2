
const SERVER_CONFIG = {
  API_KEY: '9769a0eab09284d4bfeef45e4103642cf00b1b17f15f65afeb4f336890e37e63',
  
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