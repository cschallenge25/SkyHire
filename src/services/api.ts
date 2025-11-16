import axios from 'axios';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('📤 Requête avec token:', config.method?.toUpperCase(), config.url, 'Token:', token.substring(0, 20) + '...');
  }
  return config;
});

// Intercepteur de réponse pour gérer les erreurs 401 globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si erreur 401, logger les détails pour débogage
    if (error.response?.status === 401) {
      const token = localStorage.getItem('auth_token');
      const url = error.config?.url || 'unknown';
      
      console.error('❌ Erreur 401 sur', url);
      console.error('Token présent:', !!token);
      console.error('Message:', error.response?.data?.message || 'Aucun message');
      console.error('Response complète:', error.response?.data);
      
      // Ne pas rediriger automatiquement - laisser les pages gérer individuellement
      // Pour réactiver la redirection automatique, décommenter le code ci-dessous
      /*
      if (token) {
        console.log('🔒 Session expirée, nettoyage des données d\'authentification');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
          setTimeout(() => {
            window.location.href = '/login?session_expired=true';
          }, 100);
        }
      }
      */
    }
    return Promise.reject(error);
  }
);

export default api;
