import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { extractCharacterFromBeyond, DndBeyondCharacterData } from '@/lib/dndBeyondUtils';

interface DndBeyondImportSectionProps {
  dndBeyondUrl: string;
  onDndBeyondUrlChange: (url: string) => void;
  isEditingPlayer: boolean;
  dndBeyondId: string;
  onImportSuccess: (extracted: DndBeyondCharacterData, characterId: string) => void;
}

// Fonction de fallback pour extraire les données depuis le HTML de la page
const tryHtmlScraping = async (url: string) => {
  const proxyServices = [
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
    `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  for (const proxyUrl of proxyServices) {
    try {
      console.log('Tentative de scraping HTML depuis:', proxyUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) continue;

      const html = await response.text();

      // Chercher les données JSON dans le HTML (D&D Beyond stocke souvent les données dans des scripts)
      const jsonMatch = html.match(/window\.characterData\s*=\s*({.*?});/s) ||
        html.match(/data-character\s*=\s*"([^"]*)"/) ||
        html.match(/"character":\s*({.*?})/s);

      if (jsonMatch) {
        let jsonStr = jsonMatch[1];
        if (jsonMatch[0].includes('data-character')) {
          jsonStr = jsonMatch[1].replace(/&quot;/g, '"');
        }

        const characterData = JSON.parse(jsonStr);
        console.log('Données extraites du HTML:', characterData);
        return characterData;
      }

      // Fallback: extraire des informations basiques depuis le HTML
      const nameMatch = html.match(/<h1[^>]*class="[^"]*character-name[^"]*"[^>]*>([^<]+)</i) ||
        html.match(/<title>([^-]+)\s*-\s*D&D Beyond</i);

      if (nameMatch) {
        return {
          data: {
            name: nameMatch[1].trim(),
            // Données par défaut quand on ne peut extraire que le nom
            classes: [{ level: 1, definition: { name: 'Fighter' } }],
            race: { fullName: '' },
            armorClass: 10,
            baseHitPoints: 10
          }
        };
      }

    } catch (error) {
      console.warn(`Échec du scraping avec ${proxyUrl}:`, error);
      continue;
    }
  }

  throw new Error('Impossible d\'extraire les données depuis le HTML');
};

const DndBeyondImportSection: React.FC<DndBeyondImportSectionProps> = ({
  dndBeyondUrl,
  onDndBeyondUrlChange,
  isEditingPlayer,
  dndBeyondId,
  onImportSuccess,
}) => {
  const [isImporting, setIsImporting] = useState(false);

  // Fonction pour extraire les données depuis D&D Beyond
  const importFromDndBeyond = async (url: string) => {
    try {
      setIsImporting(true);

      // Vérifier que l'URL est valide
      if (!url.includes('dndbeyond.com/characters/')) {
        throw new Error('URL D&D Beyond invalide. Utilisez une URL du type: https://www.dndbeyond.com/characters/[ID]');
      }

      // Extraire l'ID du personnage depuis l'URL
      const characterIdMatch = url.match(/\/characters\/(\d+)/);
      if (!characterIdMatch) {
        throw new Error('Impossible d\'extraire l\'ID du personnage depuis l\'URL');
      }

      const characterId = characterIdMatch[1];
      console.log('ID du personnage D&D Beyond:', characterId);

      // Utiliser le proxy local configuré dans Vite
      const apiUrl = `/api/dndbeyond/character/v5/character/${characterId}`;

      console.log('Tentative de récupération depuis le proxy local:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText} - Vérifiez que le personnage est PUBLIC sur D&D Beyond.`);
      }

      const characterData = await response.json();
      console.log('Données récupérées avec succès');

      // Utiliser l'utilitaire centralisé pour extraire les données
      const extracted = extractCharacterFromBeyond(characterData, characterId);

      console.log('Stats extraites:', extracted);

      // Mettre à jour le formulaire avec les données extraites
      onImportSuccess(extracted, characterId);

      toast({
        title: "Import réussi !",
        description: `Importé: ${extracted.name} (Niv ${extracted.level} ${extracted.characterClass}) - STR:${extracted.str} DEX:${extracted.dex}`,
        variant: "default"
      });

      // Effacer l'URL après l'import
      onDndBeyondUrlChange('');

    } catch (error) {
      console.error('Erreur lors de l\'import D&D Beyond:', error);
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Impossible d'importer les données. Vérifiez l'URL.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-2 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
      <Label htmlFor="dndBeyondUrl" className="text-destructive font-semibold">
        URL ou ID du personnage Beyond
      </Label>
      <div className="flex gap-2">
        <Input
          id="dndBeyondUrl"
          placeholder="ex: https://www.dndbeyond.com/characters/..."
          value={dndBeyondUrl}
          onChange={(e) => onDndBeyondUrlChange(e.target.value)}
          className="flex-1 border-destructive/20 focus-visible:ring-red-500"
        />
        <Button
          type="button"
          onClick={() => importFromDndBeyond(dndBeyondUrl)}
          disabled={!dndBeyondUrl || isImporting}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isImporting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            isEditingPlayer && dndBeyondId ? 'Rafraîchir' : 'Importer'
          )}
        </Button>
      </div>
      <p className="text-xs text-destructive/80">
        Synchronisation en direct des PV et de la CA pendant le combat.
      </p>
    </div>
  );
};

export default DndBeyondImportSection;
