import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { getAideDDMonsterSlug } from '../lib/utils';

// Traduire les tailles
const sizeTranslation: { [key: string]: string } = {
  'TP': 'Très Petit',
  'P': 'Petit',
  'M': 'Moyen',
  'G': 'Grand',
  'TG': 'Très Grand',
  'Gig': 'Gigantesque'
};

// Traduire les types
const typeTranslation: { [key: string]: string } = {
  'Aberration': 'Aberration',
  'Bête': 'Bête',
  'Céleste': 'Céleste',
  'Artificiel': 'Artificiel',
  'Dragon': 'Dragon',
  'Élémentaire': 'Élémentaire',
  'Fée': 'Fée',
  'Fiélon': 'Fiélon',
  'Géant': 'Géant',
  'Humanoïde': 'Humanoïde',
  'Monstruosité': 'Monstruosité',
  'Plante': 'Plante',
  'Mort-vivant': 'Mort-vivant',
  'Vase': 'Vase'
};

// Images génériques par type de monstre
const monsterTypeImages: { [key: string]: string } = {
  'Aberration': '/images/monsters/aberration.jpg',
  'Bête': '/images/monsters/beast.jpg',
  'Céleste': '/images/monsters/celestial.jpg',
  'Artificiel': '/images/monsters/construct.jpg',
  'Dragon': '/images/monsters/dragon.jpg',
  'Élémentaire': '/images/monsters/elemental.jpg',
  'Fée': '/images/monsters/fey.jpg',
  'Fiélon': '/images/monsters/fiend.jpg',
  'Géant': '/images/monsters/giant.jpg',
  'Humanoïde': '/images/monsters/humanoid.jpg',
  'Monstruosité': '/images/monsters/monstrosity.jpg',
  'Plante': '/images/monsters/plant.jpg',
  'Mort-vivant': '/images/monsters/undead.jpg',
  'Vase': '/images/monsters/ooze.jpg'
};

// Fonction pour obtenir l'URL de l'image du monstre
const getMonsterImageUrl = (monster: any): string => {
  // Essayer de trouver une image spécifique par nom
  const slugName = monster.name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  // Essayer d'utiliser une image spécifique (si elle existe)
  const specificImageUrl = `/images/monsters/${slugName}.jpg`;
  
  // Sinon utiliser une image générique basée sur le type
  const genericImageUrl = monsterTypeImages[monster.type] || '/images/monsters/unknown.jpg';
  
  // Si une image spécifique existe, l'utiliser, sinon utiliser l'image générique
  // Note: ceci est une approximation, en production on vérifierait vraiment si le fichier existe
  return specificImageUrl;
};

// Fonction pour formater les points de vie
const formatHP = (hp: string | number | undefined): string => {
  if (!hp) return '10 (1d8 + 2)';
  if (typeof hp === 'string') return hp;
  
  // Ces valeurs sont des estimations basées sur les formules DnD
  const hitDieSize = {
    'TP': 4,
    'P': 6,
    'M': 8,
    'G': 10,
    'TG': 12,
    'Gig': 20
  };
  
  // Estimation basique du nombre de dés et du modificateur
  let size = 'M';
  const estimatedHitDie = hitDieSize[size as keyof typeof hitDieSize] || 8;
  const estimatedDiceCount = Math.max(1, Math.floor(hp / (estimatedHitDie / 2 + 2)));
  const estimatedModifier = hp - (estimatedDiceCount * (estimatedHitDie / 2 + 0.5));
  
  return `${hp} (${estimatedDiceCount}d${estimatedHitDie}${estimatedModifier > 0 ? ` + ${Math.floor(estimatedModifier)}` : estimatedModifier < 0 ? ` - ${Math.abs(Math.floor(estimatedModifier))}` : ''})`;
};

// Fonction pour formater la vitesse
const formatSpeed = (speeds: any): string => {
  if (!speeds) return '9 m';
  
  // Si speeds est déjà une chaîne formatée, la retourner directement
  if (typeof speeds === 'string') return speeds;
  
  // Si speeds est un tableau
  if (Array.isArray(speeds)) {
    return speeds.join(', ').replace(/(\d+) feet/g, (match, p1) => `${Math.round(parseInt(p1) * 0.3)} m`);
  }
  
  // Si speeds est un objet avec des valeurs structurées
  if (typeof speeds === 'object') {
    const formattedSpeeds = [];
    
    // Traiter les différentes propriétés possibles
    if (speeds.walk || speeds.marche) formattedSpeeds.push(`${speeds.walk || speeds.marche} m`);
    if (speeds.fly || speeds.vol) formattedSpeeds.push(`vol ${speeds.fly || speeds.vol} m`);
    if (speeds.swim || speeds.nage) formattedSpeeds.push(`nage ${speeds.swim || speeds.nage} m`);
    if (speeds.burrow || speeds.creusement) formattedSpeeds.push(`creusement ${speeds.burrow || speeds.creusement} m`);
    if (speeds.climb || speeds.escalade) formattedSpeeds.push(`escalade ${speeds.climb || speeds.escalade} m`);
    
    // Si nous n'avons rien trouvé, retourner une valeur par défaut
    if (formattedSpeeds.length === 0) return '9 m';
    
    return formattedSpeeds.join(', ');
  }
  
  return '9 m';
};

// Estimation de la difficulté basée sur le CR
const getCRDescription = (cr: number): string => {
  if (cr <= 0.25) return 'Facile';
  if (cr <= 1) return 'Modéré';
  if (cr <= 5) return 'Difficile';
  if (cr <= 10) return 'Très difficile';
  if (cr <= 15) return 'Épique';
  return 'Légendaire';
};

// Formater l'alignement
const formatAlignment = (alignment: string): string => {
  if (!alignment) return 'Sans alignement';
  if (alignment === 'sans alignement') return 'Sans alignement';
  if (alignment === 'tout alignement') return 'Tout alignement';
  return alignment.charAt(0).toUpperCase() + alignment.slice(1);
};

// Générer des actions génériques basées sur le type de monstre
const generateGenericActions = (monster: any): { name: string, description: string }[] => {
  // Si le monstre a déjà des actions définies, les utiliser
  if (monster.actions && Array.isArray(monster.actions) && monster.actions.length > 0) {
    return monster.actions;
  }
  
  const actions: { name: string, description: string }[] = [];
  
  // Ajouter une attaque de base pour tous les monstres
  actions.push({
    name: "Attaque au corps à corps",
    description: `Le monstre effectue une attaque au corps à corps. +${Math.max(1, Math.floor(monster.cr / 2) + 2)} au toucher, allonge 1,50 m, une cible. Touché : ${Math.max(1, Math.floor(monster.cr) + 2)} dégâts.`
  });
  
  // Ajouter des actions spécifiques selon le type
  switch (monster.type) {
    case 'Dragon':
      actions.push({
        name: "Souffle",
        description: `Le dragon exhale un souffle destructeur dans un cône de 9 mètres. Chaque créature dans cette zone doit effectuer un jet de sauvegarde de Dextérité DD ${12 + Math.floor(monster.cr / 4)}, subissant ${Math.floor(monster.cr * 2) + 4}d6 dégâts en cas d'échec, ou la moitié en cas de réussite.`
      });
      break;
    case 'Mort-vivant':
      actions.push({
        name: "Drain de vie",
        description: `Le monstre effectue une attaque au corps à corps. +${Math.max(1, Math.floor(monster.cr / 2) + 2)} au toucher, allonge 1,50 m, une cible. Touché : ${Math.max(1, Math.floor(monster.cr) + 1)}d6 dégâts nécrotiques. La cible doit réussir un jet de sauvegarde de Constitution DD ${10 + Math.floor(monster.cr / 3)} ou voir son maximum de points de vie réduit d'un montant égal aux dégâts subis.`
      });
      break;
    case 'Élémentaire':
      actions.push({
        name: "Forme élémentaire",
        description: `Le monstre peut se déplacer à travers un espace aussi étroit que 2,5 cm de large sans se faufiler. De plus, il peut entrer dans l'espace d'une créature hostile et s'y arrêter.`
      });
      break;
    case 'Aberration':
      actions.push({
        name: "Attaque mentale",
        description: `Le monstre cible une créature qu'il peut voir dans un rayon de 18 mètres. La cible doit réussir un jet de sauvegarde d'Intelligence DD ${10 + Math.floor(monster.cr / 3)} ou subir ${Math.max(1, Math.floor(monster.cr))}d8 dégâts psychiques.`
      });
      break;
    case 'Bête':
      if (monster.speed && (typeof monster.speed === 'string' ? monster.speed.includes('vol') : Array.isArray(monster.speed) && monster.speed.includes('vol'))) {
        actions.push({
          name: "Piqué",
          description: `Si le monstre vole et plonge d'au moins 9 mètres vers une cible puis la touche avec une attaque, l'attaque inflige ${Math.max(1, Math.floor(monster.cr / 2))}d6 dégâts supplémentaires.`
        });
      } else {
        actions.push({
          name: "Charge",
          description: `Si le monstre se déplace d'au moins 6 mètres en ligne droite vers une cible puis la touche avec une attaque au corps à corps, l'attaque inflige ${Math.max(1, Math.floor(monster.cr / 2))}d6 dégâts supplémentaires.`
        });
      }
      break;
    case 'Géant':
      actions.push({
        name: "Lancer de rocher",
        description: `Le monstre lance un rocher. Attaque à distance avec une arme : +${Math.max(1, Math.floor(monster.cr / 2) + 2)} au toucher, portée 18/72 m, une cible. Touché : ${Math.max(2, Math.floor(monster.cr))}d10 + ${Math.max(1, Math.floor(monster.cr / 3))} dégâts contondants.`
      });
      break;
    default:
      if (monster.cr >= 5) {
        actions.push({
          name: "Attaques multiples",
          description: `Le monstre effectue ${Math.min(3, Math.max(2, Math.floor(monster.cr / 5)))} attaques.`
        });
      }
  }
  
  return actions;
};

// Générer des capacités spéciales basées sur le type et l'environnement
const generateSpecialAbilities = (monster: any): { name: string, description: string }[] => {
  // Si le monstre a déjà des capacités définies, les utiliser
  if (monster.traits && Array.isArray(monster.traits) && monster.traits.length > 0) {
    return monster.traits;
  }
  
  const abilities: { name: string, description: string }[] = [];
  
  // Capacités basées sur le type
  switch (monster.type) {
    case 'Dragon':
      abilities.push({
        name: "Résistance légendaire",
        description: "Si le dragon rate un jet de sauvegarde, il peut choisir de le réussir à la place."
      });
      break;
    case 'Mort-vivant':
      abilities.push({
        name: "Résistance aux nécrotiques",
        description: "Le monstre a une résistance aux dégâts nécrotiques."
      });
      break;
    case 'Fée':
      abilities.push({
        name: "Incantation innée",
        description: "La caractéristique d'incantation du monstre est le Charisme. Il peut lancer les sorts suivants de manière innée, sans composantes matérielles : détection de la magie (à volonté), charme-personne (3/jour)."
      });
      break;
  }
  
  // Capacités basées sur l'environnement
  if (monster.environment) {
    if (typeof monster.environment === 'string') {
      if (monster.environment.includes('aquatique')) {
        abilities.push({
          name: "Amphibie",
          description: "Le monstre peut respirer à l'air libre et sous l'eau."
        });
      }
      if (monster.environment.includes('souterrain')) {
        abilities.push({
          name: "Vision dans le noir",
          description: "Le monstre a une vision dans le noir sur 18 mètres."
        });
      }
    } else if (Array.isArray(monster.environment)) {
      if (monster.environment.some((env: string) => env.includes('aquatique'))) {
        abilities.push({
          name: "Amphibie",
          description: "Le monstre peut respirer à l'air libre et sous l'eau."
        });
      }
      if (monster.environment.some((env: string) => env.includes('souterrain'))) {
        abilities.push({
          name: "Vision dans le noir",
          description: "Le monstre a une vision dans le noir sur 18 mètres."
        });
      }
    }
  }
  
  // Capacités basées sur le CR
  if (monster.cr >= 10) {
    abilities.push({
      name: "Résistance à la magie",
      description: `Le monstre a l'avantage aux jets de sauvegarde contre les sorts et autres effets magiques.`
    });
  }
  
  return abilities;
};

// Formater les listes comme les résistances, immunités, etc.
const formatList = (list: string[] | string | null | undefined): string => {
  if (!list) return 'aucune';
  if (typeof list === 'string') return list;
  if (Array.isArray(list) && list.length > 0) return list.join(', ');
  return 'aucune';
};

interface MonsterCardProps {
  monster: any;
}

export function MonsterCard({ monster }: MonsterCardProps) {
  const [loading, setLoading] = useState(false);

  // Obtenir l'URL de la page AideDD du monstre
  const getMonsterUrl = (monsterName: string) => {
    const slug = getAideDDMonsterSlug(monsterName);
    return `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
  };

  // Utiliser le nom original s'il existe, sinon le nom standard
  const monsterName = monster.originalName || monster.name;
  const monsterUrl = getMonsterUrl(monsterName);
  
  // Calculer le modificateur d'une caractéristique
  const getAbilityModifier = (value: number): string => {
    if (!value) return '+0';
    const modifier = Math.floor((value - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };
  
  return (
    <div className="bg-white border border-gray-300 rounded-md overflow-hidden">
      <div className="p-2 bg-gray-100 border-b flex justify-between items-center">
        <h3 className="font-bold text-lg">{monster.name}</h3>
        <a 
          href={monsterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm"
        >
          Ouvrir dans AideDD
        </a>
      </div>
      
      <div className="p-4">
        <div className="text-sm italic mb-4">
          {monster.size || 'M'} {monster.type || 'créature'}, {monster.alignment || 'non aligné'}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="font-semibold">Classe d'armure</div>
            <div>{monster.ac || 10}</div>
          </div>
          
              <div>
            <div className="font-semibold">Points de vie</div>
            <div>{monster.hp || 10}</div>
              </div>
            </div>
            
        <div className="mb-4">
          <div className="font-semibold">Vitesse</div>
          <div>{typeof monster.speed === 'string' ? monster.speed : 
              Array.isArray(monster.speed) ? monster.speed.join(', ') : '9 m'}</div>
            </div>
            
        {/* Caractéristiques */}
        <div className="grid grid-cols-6 gap-2 mb-4 border p-2 rounded">
          <div className="text-center">
            <div className="font-semibold">FOR</div>
            <div>{monster.str || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.str || 10)})</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">DEX</div>
            <div>{monster.dex || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.dex || 10)})</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">CON</div>
            <div>{monster.con || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.con || 10)})</div>
                  </div>
          <div className="text-center">
            <div className="font-semibold">INT</div>
            <div>{monster.int || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.int || 10)})</div>
                </div>
          <div className="text-center">
            <div className="font-semibold">SAG</div>
            <div>{monster.wis || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.wis || 10)})</div>
            </div>
          <div className="text-center">
            <div className="font-semibold">CHA</div>
            <div>{monster.cha || 10}</div>
            <div className="text-xs">({getAbilityModifier(monster.cha || 10)})</div>
              </div>
              </div>
        
        {/* Compétences et immunités */}
        {monster.skills && (
          <div className="mb-3">
            <div className="font-semibold">Compétences</div>
            <div>{monster.skills}</div>
              </div>
            )}
            
        {monster.damageResistances && (
          <div className="mb-3">
            <div className="font-semibold">Résistances aux dégâts</div>
            <div>{monster.damageResistances}</div>
              </div>
            )}
            
        {monster.damageImmunities && (
          <div className="mb-3">
            <div className="font-semibold">Immunités aux dégâts</div>
            <div>{monster.damageImmunities}</div>
              </div>
            )}
            
        {monster.conditionImmunities && (
          <div className="mb-3">
            <div className="font-semibold">Immunités aux états</div>
            <div>{monster.conditionImmunities}</div>
              </div>
            )}
            
        {monster.senses && (
          <div className="mb-3">
            <div className="font-semibold">Sens</div>
            <div>{monster.senses}</div>
              </div>
            )}
            
        {monster.languages && (
          <div className="mb-3">
            <div className="font-semibold">Langues</div>
            <div>{monster.languages}</div>
              </div>
            )}
            
        <div className="mb-4">
          <div className="font-semibold">Puissance</div>
          <div>{monster.cr} ({monster.xp || 0} PX)</div>
            </div>
            
        {/* Traits */}
        {monster.traits && monster.traits.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold border-b pb-1 mb-2">Traits</h4>
            {monster.traits.map((trait: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="font-semibold">{trait.name}</div>
                <div>{trait.description}</div>
              </div>
            ))}
              </div>
            )}
            
        {/* Actions */}
        {monster.actions && monster.actions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold border-b pb-1 mb-2">Actions</h4>
            {monster.actions.map((action: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="font-semibold">{action.name}</div>
                <div>{action.description}</div>
                    </div>
                  ))}
              </div>
            )}
            
        {/* Actions légendaires */}
        {monster.legendaryActions && monster.legendaryActions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold border-b pb-1 mb-2">Actions légendaires</h4>
            {monster.legendaryActions.map((action: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="font-semibold">{action.name}</div>
                <div>{action.description}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open(monsterUrl, '_blank')}
          >
            Voir la fiche complète sur AideDD
          </Button>
            </div>
          </div>
        </div>
  );
} 