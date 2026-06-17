import { Monster } from '../types';
import { v4 as uuid } from 'uuid';
import { calculateXPFromCR } from './xpCalculator';
import { MONSTERS_KEY, getDefaultMonsters } from './monstersCache';

// API AideDD ou DnD 5e API
const API_URL = 'https://www.dnd5eapi.co/api';

// Récupérer les monstres depuis l'API
export const fetchMonstersFromAPI = async (): Promise<Monster[]> => {
  try {
    const response = await fetch(`${API_URL}/monsters`);
    const data = await response.json();

    // Récupérer les détails de chaque monstre
    const monsterPromises = data.results.map(async (monster: any) => {
      const detailResponse = await fetch(`${API_URL}${monster.url}`);
      const monsterDetail = await detailResponse.json();

      // Convertir les données au format attendu
      return {
        id: uuid(),
        name: monsterDetail.name,
        cr: monsterDetail.challenge_rating,
        xp: calculateXPFromCR(monsterDetail.challenge_rating),
        type: monsterDetail.type,
        size: monsterDetail.size,
        alignment: monsterDetail.alignment,
        environment: monsterDetail.environment || [],
        source: 'SRD',
        ac: monsterDetail.armor_class[0]?.value || 10,
        hp: monsterDetail.hit_points,
        speed: {
          walk: monsterDetail.speed.walk ? parseInt(monsterDetail.speed.walk.replace(' ft.', '')) : 0,
          fly: monsterDetail.speed.fly ? parseInt(monsterDetail.speed.fly.replace(' ft.', '')) : 0,
          swim: monsterDetail.speed.swim ? parseInt(monsterDetail.speed.swim.replace(' ft.', '')) : 0,
          climb: monsterDetail.speed.climb ? parseInt(monsterDetail.speed.climb.replace(' ft.', '')) : 0,
        },
        str: monsterDetail.strength,
        dex: monsterDetail.dexterity,
        con: monsterDetail.constitution,
        int: monsterDetail.intelligence,
        wis: monsterDetail.wisdom,
        cha: monsterDetail.charisma,
        legendary: monsterDetail.legendary_actions?.length > 0
      };
    });

    const monsters = await Promise.all(monsterPromises);
    // Sauvegarder dans le localStorage
    localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters));
    return monsters;
  } catch (error) {
    console.error('Erreur lors de la récupération des monstres:', error);
    return getDefaultMonsters();
  }
};
