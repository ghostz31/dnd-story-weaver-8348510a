/**
 * Convertisseur Aurora XML → JSON
 * 
 * Ce script convertit les données XML d'Aurora Builder en JSON pour Besace
 * Sources : https://github.com/aurorabuilder/elements
 */

import { parseSpells } from './parsers/parse-spells'
import { parseRaces } from './parsers/parse-races'
import { parseClasses } from './parsers/parse-classes'
import { parseItems } from './parsers/parse-items'

// URLs des fichiers sources Aurora
const AURORA_SOURCES = {
  spells: 'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/spells.xml',
  races: [
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-dwarf.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-elf.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-halfling.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-human.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-dragonborn.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-gnome.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-half-elf.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-half-orc.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/races/race-tiefling.xml',
  ],
  classes: [
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-barbarian.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-bard.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-cleric.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-druid.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-fighter.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-monk.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-paladin.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-ranger.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-rogue.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-sorcerer.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-warlock.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/classes/class-wizard.xml',
  ],
  items: [
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/items/items-weapons.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/items/items-armor.xml',
    'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/items/items-equipment.xml',
  ],
  feats: 'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/feats.xml',
  backgrounds: 'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook/backgrounds.xml',
}

async function fetchXML(url: string): Promise<string> {
  console.log(`📥 Téléchargement : ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} pour ${url}`)
  }
  return response.text()
}

async function convertAuroraData() {
  console.log('🚀 Démarrage de la conversion Aurora → Besace\n')
  
  try {
    // 1. Conversion des sorts
    console.log('✨ Conversion des sorts...')
    const spellsXML = await fetchXML(AURORA_SOURCES.spells)
    const spells = parseSpells(spellsXML)
    console.log(`   ${spells.length} sorts convertis\n`)
    
    // 2. Conversion des races
    console.log('👥 Conversion des races...')
    const racesXML = await Promise.all(
      AURORA_SOURCES.races.map(url => fetchXML(url))
    )
    const races = parseRaces(racesXML.join('\n'))
    console.log(`   ${races.length} races converties\n`)
    
    // 3. Conversion des classes
    console.log('⚔️  Conversion des classes...')
    const classesXML = await Promise.all(
      AURORA_SOURCES.classes.map(url => fetchXML(url))
    )
    const classes = parseClasses(classesXML.join('\n'))
    console.log(`   ${classes.length} classes converties\n`)
    
    // 4. Conversion de l'équipement
    console.log('🎒 Conversion de l\'équipement...')
    const itemsXML = await Promise.all(
      AURORA_SOURCES.items.map(url => fetchXML(url))
    )
    const items = parseItems(itemsXML.join('\n'))
    console.log(`   ${items.length} objets convertis\n`)
    
    // TODO : Générer les fichiers JSON
    console.log('✅ Conversion terminée !')
    console.log('\n📊 Résumé :')
    console.log(`   • ${spells.length} sorts`)
    console.log(`   • ${races.length} races`)
    console.log(`   • ${classes.length} classes`)
    console.log(`   • ${items.length} objets`)
    
    return {
      spells,
      races,
      classes,
      items,
    }
  } catch (error) {
    console.error('❌ Erreur lors de la conversion :', error)
    throw error
  }
}

// Exécution si lancé directement
if (import.meta.main) {
  convertAuroraData()
}

export { convertAuroraData }
