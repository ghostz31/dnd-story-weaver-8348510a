// Utility pour exporter/importer un personnage en JSON

import type { Character } from '../types/character'

export interface ExportData {
    version: string
    exportedAt: string
    character: Character
}

/**
 * Exporte le personnage en JSON
 */
export function exportCharacterToJSON(character: Character): string {
    const exportData: ExportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        character,
    }
    
    return JSON.stringify(exportData, null, 2)
}

/**
 * Importe un personnage depuis JSON
 */
export function importCharacterFromJSON(json: string): Character | null {
    try {
        const data = JSON.parse(json) as ExportData
        
        // Validation basique
        if (!data.character || !data.character.name || !data.character.id) {
            console.error('Invalid character data')
            return null
        }
        
        // Retourner le personnage (les dates doivent être reconverties)
        return {
            ...data.character,
            createdAt: new Date(data.character.createdAt),
            updatedAt: new Date(data.character.updatedAt),
        }
    } catch (err) {
        console.error('Error parsing character JSON:', err)
        return null
    }
}

/**
 * Télécharge le JSON du personnage
 */
export function downloadCharacterJSON(character: Character, filename?: string): void {
    const json = exportCharacterToJSON(character)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `${character.name.replace(/\s+/g, '_')}_besace.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Lit un fichier JSON uploadé
 */
export async function readUploadedJSON(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(file)
    })
}