/**
 * Cette fonction simule la récupération des données d'un monstre via un iframe caché
 * pour contourner les restrictions CORS sans avoir besoin d'un serveur backend.
 * 
 * Elle crée un iframe temporaire qui charge la page AideDD du monstre,
 * puis extrait les données du HTML avant de supprimer l'iframe.
 */
export function createMonsterDataIframe(monsterUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let isResolved = false;

    // Créer un iframe invisible pour extraire les données
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    
    // Activer tous les permissions nécessaires
    iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups');
    
    // Ajouter l'iframe au document
    document.body.appendChild(iframe);

    // Une fois que l'iframe est chargée, extraire les données du monstre
    iframe.onload = () => {
      try {
        // Accéder au contenu de l'iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          throw new Error('Impossible d\'accéder au contenu de l\'iframe');
        }

        console.log('Iframe chargée, extraction des données');
        
        // Extraire les données du monstre
        const monsterHtml = iframeDoc.documentElement.outerHTML;
        
        // Marquer comme résolu pour éviter une résolution multiple
        isResolved = true;
        
        // Supprimer l'iframe du DOM
        document.body.removeChild(iframe);
        
        // Résoudre la promesse avec le HTML du monstre
        resolve(monsterHtml);
      } catch (error) {
        console.error('Erreur lors de l\'extraction des données du monstre:', error);
        
        // Supprimer l'iframe en cas d'erreur
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        
        // Rejeter la promesse avec l'erreur
        reject(error);
      }
    };

    // Gérer les erreurs de chargement
    iframe.onerror = (error) => {
      console.error('Erreur de chargement de l\'iframe:', error);
      
      // Supprimer l'iframe en cas d'erreur
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      
      // Rejeter la promesse avec l'erreur
      reject(error);
    };

    // Définir la source de l'iframe après avoir configuré les gestionnaires d'événements
    iframe.src = monsterUrl;

    // Configurer un timeout au cas où la page ne se charge pas
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        
        if (!isResolved) {
          console.warn(`Timeout lors du chargement de l'iframe pour: ${monsterUrl}`);
          reject(new Error("Timeout lors du chargement de l'iframe"));
        }
      }
    }, 10000);
  });
} 