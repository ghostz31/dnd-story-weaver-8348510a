// Proxy API pour contourner les restrictions CORS
// Ce fichier doit être utilisé avec un serveur backend ou un service serverless

export interface ProxyRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface ProxyResponse {
  data: string;
  status: number;
  headers: Record<string, string>;
}

// Configuration pour différents services de proxy
const PROXY_SERVICES = {
  // Service proxy local (développement)
  local: {
    baseUrl: '/api/proxy',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  
  // Service proxy via CORS Anywhere (développement uniquement)
  corsAnywhere: {
    baseUrl: 'https://cors-anywhere.herokuapp.com/',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  },
  
  // Service proxy via AllOrigins (gratuit mais limité)
  allOrigins: {
    baseUrl: 'https://api.allorigins.win/get?url=',
    headers: {}
  }
};

// Fonction principale pour faire des requêtes via proxy
export const proxyFetch = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  // Essayer d'abord le proxy local
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    if (response.ok) {
      return response;
    }
  } catch (error) {
    console.warn('Proxy local non disponible, essai avec AllOrigins:', error);
  }
  
  // Fallback vers AllOrigins
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const data = await response.json();
      
      // Créer une réponse simulée avec le contenu
      return new Response(data.contents, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
  } catch (error) {
    console.warn('AllOrigins non disponible:', error);
  }
  
  throw new Error('Aucun service proxy disponible');
};

// Fonction spécialisée pour D&D Beyond
export const fetchDnDBeyondPage = async (characterUrl: string): Promise<string> => {
  try {
    const response = await proxyFetch(characterUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Erreur lors de la récupération de la page D&D Beyond:', error);
    throw new Error('Impossible de récupérer la page D&D Beyond');
  }
};

// Fonction pour tester la connectivité des services proxy
export const testProxyServices = async (): Promise<{
  local: boolean;
  allOrigins: boolean;
  corsAnywhere: boolean;
}> => {
  const results = {
    local: false,
    allOrigins: false,
    corsAnywhere: false
  };
  
  // Test proxy local
  try {
    const response = await fetch('/api/proxy?url=https://httpbin.org/status/200', {
      method: 'HEAD'
    });
    results.local = response.ok;
  } catch {
    // Service non disponible
  }
  
  // Test AllOrigins
  try {
    const response = await fetch('https://api.allorigins.win/get?url=https://httpbin.org/status/200');
    results.allOrigins = response.ok;
  } catch {
    // Service non disponible
  }
  
  // Test CORS Anywhere
  try {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://httpbin.org/status/200', {
      method: 'HEAD'
    });
    results.corsAnywhere = response.ok;
  } catch {
    // Service non disponible
  }
  
  return results;
};

// Configuration pour le développement local
export const setupLocalProxy = () => {
  // Cette fonction peut être utilisée pour configurer un proxy local
  // dans un environnement de développement
  
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Mode développement détecté - proxy local disponible');
    return true;
  }
  
  return false;
}; 