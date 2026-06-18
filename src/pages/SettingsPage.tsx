import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Sparkles, RotateCcw, ArrowLeft, Info } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import type { EffectsSettings } from '@trame-besace/shared-types/use-effects';

// Liste des 21 effets visuels disponibles (label + hint affichés dans l'UI)
const EFFECT_LABELS: { key: keyof EffectsSettings; label: string; hint: string }[] = [
  { key: 'dice3d', label: 'Dé 3D', hint: "Animation de tumble lors du lancer" },
  { key: 'critFlash', label: 'Flash critique (nat 20)', hint: 'Flash doré + vibration sur jet critique' },
  { key: 'chatToast', label: 'Notifications de jet', hint: 'Toast compact affichant le résultat du dé' },
  { key: 'haloActive', label: 'Halo combattant actif', hint: "Glow pulsant sur le combattant dont c'est le tour" },
  { key: 'sortGlow', label: 'Lueur des orbes de sort', hint: 'Les emplacements disponibles pulsent doucement' },
  { key: 'legendaryBorder', label: 'Bordure objets légendaires', hint: 'Liseré doré animé sur les objets légendaires' },
  { key: 'enluminure', label: 'Enluminures', hint: 'Bordures ornementales sur les stat blocks' },
  { key: 'separators', label: 'Séparateurs ornés', hint: 'Ornements entre les sections' },
  { key: 'dropCaps', label: 'Lettrines', hint: 'Première lettre agrandie en début de description' },
  { key: 'parchment', label: 'Texture parchemin', hint: 'Texture subtile sur les cartes (mode clair)' },
  { key: 'aurora', label: 'Aurora vignette', hint: 'Gradient conique animé en arrière-plan' },
  { key: 'pageTransition', label: 'Transitions de page', hint: 'Fade + slide au changement de page' },
  { key: 'hpCounter', label: 'Compteur PV animé', hint: "Le chiffre des PV s'anime lors des changements" },
  { key: 'cardPress', label: 'Pression des cartes', hint: 'Légère compression au tap (mobile)' },
  { key: 'hoverLift', label: 'Élévation au survol', hint: 'Les cartes se soulèvent au hover' },
  { key: 'ripple', label: 'Ondulation au tap', hint: 'Effet ripple au tap des boutons' },
  { key: 'ordinals', label: 'Ordinaux typographiques', hint: '1er, 2e, 3e en exposant automatique' },
  { key: 'smallCaps', label: 'Petites capitales', hint: 'Labels de stats en petites majuscules' },
  { key: 'ligatures', label: 'Ligatures', hint: 'Ligatures contextuelles (ff, fi, fl)' },
  { key: 'animatedConditions', label: 'Conditions animées', hint: 'Icônes de condition qui pulse doucement' },
  { key: 'ornateRound', label: 'Compteur de rounds orné', hint: 'Ornement ◇ Round N ◇ dans le tracker' },
];

const SettingsPage: React.FC = () => {
  const { settings, toggleEffect, resetEffects } = useSettings();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Button variant="ghost" size="icon" asChild className="touch-target">
          <Link to="/" aria-label="Retour à l'accueil">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-cinzel flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" />
            Paramètres
          </h1>
          <p className="text-sm text-muted-foreground">
            Personnalisez l'expérience visuelle de Trame.
          </p>
        </div>
      </div>

      {/* Section Effets & animations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Effets &amp; animations</CardTitle>
                <CardDescription>
                  Activez ou désactivez les effets visuels selon vos préférences.
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetEffects}
              className="flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Réinitialiser
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Note prefers-reduced-motion */}
          <div className="flex items-start gap-2 rounded-md border border-border/50 bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              Les réglages système <code className="px-1 rounded bg-muted text-foreground">prefers-reduced-motion</code> sont
              respectés automatiquement : les animations les plus distrayantes sont désactivées si votre appareil
              demande moins de mouvement.
            </p>
          </div>

          {/* Liste des toggles */}
          <div className="space-y-1">
            {EFFECT_LABELS.map(({ key, label, hint }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3 py-2 border-b border-border/40 last:border-0"
              >
                <Label
                  htmlFor={`effect-${key}`}
                  className="flex-1 cursor-pointer text-sm font-medium leading-tight"
                >
                  {label}
                  <span className="block text-[11px] font-normal text-muted-foreground mt-0.5">
                    {hint}
                  </span>
                </Label>
                <Switch
                  id={`effect-${key}`}
                  checked={settings.effects[key]}
                  onCheckedChange={() => toggleEffect(key)}
                  aria-label={`${label}: ${settings.effects[key] ? 'activé' : 'désactivé'}`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
