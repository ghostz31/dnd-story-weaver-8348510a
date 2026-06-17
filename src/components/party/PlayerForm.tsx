import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player } from '@/lib/types';
import { CHARACTER_CLASSES } from './utils';
import DndBeyondImportSection from './DndBeyondImportSection';
import BesaceCodeSection from './BesaceCodeSection';

interface PlayerFormProps {
  newPlayer: Omit<Player, 'id'>;
  setNewPlayer: React.Dispatch<React.SetStateAction<Omit<Player, 'id'>>>;
  isEditingPlayer: boolean;
  dndBeyondUrl: string;
  onDndBeyondUrlChange: (url: string) => void;
}

const PlayerForm: React.FC<PlayerFormProps> = ({
  newPlayer,
  setNewPlayer,
  isEditingPlayer,
  dndBeyondUrl,
  onDndBeyondUrlChange,
}) => {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">Général</TabsTrigger>
        <TabsTrigger value="stats">Caractéristiques</TabsTrigger>
        <TabsTrigger value="proficiencies">Maîtrises</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 pt-4">
        <div className="space-y-4">
          <Label className="text-base font-semibold">Source du personnage</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={newPlayer.syncSource === 'beyond' ? 'default' : 'outline'}
              className={newPlayer.syncSource === 'beyond' ? 'bg-red-600 hover:bg-red-700 border-red-600' : 'border-border'}
              onClick={() => setNewPlayer({...newPlayer, syncSource: 'beyond'})}
            >
              D&D Beyond
            </Button>
            <Button
              type="button"
              variant={newPlayer.syncSource === 'besace' ? 'default' : 'outline'}
              className={newPlayer.syncSource === 'besace' ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600' : 'border-border'}
              onClick={() => setNewPlayer({...newPlayer, syncSource: 'besace'})}
            >
              Besace
            </Button>
            <Button
              type="button"
              variant={newPlayer.syncSource === 'none' ? 'default' : 'outline'}
              className={newPlayer.syncSource === 'none' ? 'bg-slate-700 hover:bg-slate-800' : 'border-border'}
              onClick={() => setNewPlayer({...newPlayer, syncSource: 'none'})}
            >
              Manuel
            </Button>
          </div>

          {newPlayer.syncSource === 'beyond' && (
            <DndBeyondImportSection
              dndBeyondUrl={dndBeyondUrl}
              onDndBeyondUrlChange={onDndBeyondUrlChange}
              isEditingPlayer={isEditingPlayer}
              dndBeyondId={newPlayer.dndBeyondId || ''}
              onImportSuccess={(extracted, characterId) => setNewPlayer(prev => ({
                ...prev,
                name: extracted.name,
                level: extracted.level,
                characterClass: extracted.characterClass,
                race: extracted.race,
                ac: extracted.ac,
                maxHp: extracted.maxHp,
                currentHp: extracted.currentHp,
                str: extracted.str,
                dex: extracted.dex,
                con: extracted.con,
                int: extracted.int,
                wis: extracted.wis,
                cha: extracted.cha,
                speed: extracted.speed,
                initiative: extracted.initiative,
                dndBeyondId: characterId,
                syncSource: 'beyond' as const,
                proficiencies: extracted.proficiencies,
                subclass: extracted.subclass,
              }))}
            />
          )}

          {newPlayer.syncSource === 'besace' && (
            <BesaceCodeSection
              besaceShareCode={newPlayer.besaceShareCode || ''}
              onBesaceShareCodeChange={(code) => setNewPlayer({...newPlayer, besaceShareCode: code})}
              onCodeValid={(data, code) => setNewPlayer(prev => ({
                ...prev,
                besaceShareCode: code,
                syncSource: 'besace',
                name: data.characterName || prev.name || '',
                race: data.race || prev.race || '',
                characterClass: data.className || prev.characterClass,
                level: data.level || prev.level,
                ac: data.ac || prev.ac,
                maxHp: data.maxHp || prev.maxHp,
                currentHp: data.currentHp || prev.currentHp,
                avatarUrl: data.avatarUrl || prev.avatarUrl,
              }))}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="playerName">Nom du personnage</Label>
          <Input
            id="playerName"
            placeholder="Bruenor Battlehammer"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="playerRace">Race</Label>
          <Input
            id="playerRace"
            placeholder="Nain des montagnes"
            value={newPlayer.race || ''}
            onChange={(e) => setNewPlayer({ ...newPlayer, race: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dndBeyondId">ID D&D Beyond (Optionnel)</Label>
          <div className="text-xs text-muted-foreground mb-1">
            ID du personnage pour la synchronisation (ex: 123456)
          </div>
          <Input
            id="dndBeyondId"
            placeholder="ex: 123456"
            value={newPlayer.dndBeyondId || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setNewPlayer({ ...newPlayer, dndBeyondId: val });
            }}
            disabled={newPlayer.syncSource === 'besace'}
          />
        </div>

        <div className="space-y-2">
          <Label>Source de synchronisation</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={newPlayer.syncSource === 'beyond' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'beyond', besaceShareCode: '' })}
            >
              D&D Beyond
            </Button>
            <Button
              type="button"
              variant={newPlayer.syncSource === 'besace' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'besace', dndBeyondId: '' })}
            >
              Besace
            </Button>
            <Button
              type="button"
              variant={(!newPlayer.syncSource || newPlayer.syncSource === 'none') ? 'default' : 'outline'}
              size="sm"
              onClick={() => setNewPlayer({ ...newPlayer, syncSource: 'none', dndBeyondId: '', besaceShareCode: '' })}
            >
              Aucune
            </Button>
          </div>
        </div>

        {newPlayer.syncSource === 'besace' && (
          <div className="space-y-2">
            <Label htmlFor="besaceShareCode">Code de partage Besace</Label>
            <div className="text-xs text-muted-foreground mb-1">
              Le joueur obtient ce code dans son application Besace (bouton Partager)
            </div>
            <Input
              id="besaceShareCode"
              placeholder="ex: ABC123"
              value={newPlayer.besaceShareCode || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                setNewPlayer({ ...newPlayer, besaceShareCode: val });
              }}
              maxLength={6}
              className="font-mono text-center text-lg tracking-widest"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="playerClass">Classe</Label>
            <Select
              value={newPlayer.characterClass}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, characterClass: value })}
            >
              <SelectTrigger id="playerClass">
                <SelectValue placeholder="Choisir une classe" />
              </SelectTrigger>
              <SelectContent>
                {CHARACTER_CLASSES.map(characterClass => (
                  <SelectItem key={characterClass} value={characterClass}>
                    {characterClass}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerLevel">Niveau</Label>
            <Select
              value={newPlayer.level.toString()}
              onValueChange={(value) => setNewPlayer({ ...newPlayer, level: parseInt(value) })}
            >
              <SelectTrigger id="playerLevel">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="playerAC">Classe d'Armure (CA)</Label>
            <Input
              id="playerAC"
              type="number"
              min="0"
              placeholder="10"
              value={newPlayer.ac || 10}
              onChange={(e) => setNewPlayer({ ...newPlayer, ac: parseInt(e.target.value) || 10 })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerMaxHP">PV Maximum</Label>
            <Input
              id="playerMaxHP"
              type="number"
              min="1"
              placeholder="10"
              value={newPlayer.maxHp || 10}
              onChange={(e) => {
                const maxHp = parseInt(e.target.value) || 10;
                // Ajuster le PV actuel si nécessaire
                const currentHp = newPlayer.currentHp && newPlayer.currentHp > maxHp
                  ? maxHp
                  : newPlayer.currentHp || maxHp;
                setNewPlayer({ ...newPlayer, maxHp, currentHp });
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playerCurrentHP">PV Actuels</Label>
            <Input
              id="playerCurrentHP"
              type="number"
              min="0"
              max={newPlayer.maxHp || 10}
              placeholder="10"
              value={newPlayer.currentHp || 10}
              onChange={(e) => {
                const currentHp = parseInt(e.target.value) || 0;
                // S'assurer que le PV actuel ne dépasse pas le maximum
                const validCurrentHp = Math.min(currentHp, newPlayer.maxHp || 10);
                setNewPlayer({ ...newPlayer, currentHp: validCurrentHp });
              }}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="stats" className="space-y-4 pt-4">
        <div className="grid grid-cols-3 gap-4">
          {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => (
            <div key={stat} className="space-y-1">
              <Label htmlFor={`stat-${stat}`} className="uppercase text-xs font-bold text-muted-foreground">
                {stat}
              </Label>
              <Input
                id={`stat-${stat}`}
                type="number"
                min="1"
                max="30"
                value={(newPlayer as any)[stat] || 10}
                onChange={(e) => setNewPlayer({ ...newPlayer, [stat]: parseInt(e.target.value) || 10 })}
                className="text-center"
              />
              <div className="text-[10px] text-center text-muted-foreground">
                {Math.floor(((newPlayer as any)[stat] || 10) - 10) / 2 >= 0 ? '+' : ''}
                {Math.floor(((newPlayer as any)[stat] || 10) - 10) / 2}
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="proficiencies" className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="playerProficiencies">Maîtrises & Aptitudes</Label>
          <Textarea
            id="playerProficiencies"
            value={newPlayer.proficiencies || ''}
            onChange={(e) => setNewPlayer({ ...newPlayer, proficiencies: e.target.value })}
            placeholder="Armures légères, épées courtes, outils de voleur, Elfique...&#10;Dons : Tireur d'élite..."
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Listez ici les maîtrises d'armes, d'armures, d'outils, les langues connues et les dons importants.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default PlayerForm;
