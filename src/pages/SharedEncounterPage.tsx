import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Users, Copy, ExternalLink, AlertCircle, Loader2, Check, FolderOpen } from 'lucide-react';
import { getSharedEncounter, copySharedEncounter, SharedEncounter } from '../lib/sharingApi';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { EncounterMonster } from '../lib/types';

const SharedEncounterPage: React.FC = () => {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();

    const [encounter, setEncounter] = useState<SharedEncounter | null>(null);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadEncounter = async () => {
            if (!shareCode) {
                setError('Code de partage manquant');
                setLoading(false);
                return;
            }

            try {
                const sharedEncounter = await getSharedEncounter(shareCode);
                if (!sharedEncounter) {
                    setError('Rencontre non trouvée. Le lien est peut-être expiré ou invalide.');
                } else {
                    setEncounter(sharedEncounter);
                }
            } catch (err) {
                console.error('Erreur chargement rencontre partagée:', err);
                setError('Erreur lors du chargement de la rencontre.');
            } finally {
                setLoading(false);
            }
        };

        loadEncounter();
    }, [shareCode]);

    const handleCopyToLibrary = async () => {
        if (!shareCode || !isAuthenticated) return;

        try {
            setCopying(true);
            await copySharedEncounter(shareCode);
            setCopied(true);
            toast({
                title: "Rencontre copiée !",
                description: "La rencontre a été ajoutée à votre bibliothèque."
            });

            // Rediriger vers l'historique après 2 secondes
            setTimeout(() => {
                navigate('/history');
            }, 2000);
        } catch (err) {
            console.error('Erreur copie:', err);
            toast({
                title: "Erreur",
                description: "Impossible de copier la rencontre.",
                variant: "destructive"
            });
        } finally {
            setCopying(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-500';
            case 'medium': return 'bg-yellow-500';
            case 'hard': return 'bg-orange-500';
            case 'deadly': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Facile';
            case 'medium': return 'Moyen';
            case 'hard': return 'Difficile';
            case 'deadly': return 'Mortel';
            default: return difficulty;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement de la rencontre...</p>
                </div>
            </div>
        );
    }

    if (error || !encounter) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Rencontre non trouvée</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'Cette rencontre n\'existe pas ou a été supprimée.'}
                        </p>
                        <Button onClick={() => navigate('/')}>
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <Card className="relative overflow-hidden">
                {/* Barre de difficulté */}
                <div className={`absolute top-0 left-0 w-full h-1 ${getDifficultyColor(encounter.difficulty)}`} />

                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Sword className="w-6 h-6 text-primary" />
                                {encounter.name}
                            </CardTitle>
                            <CardDescription className="mt-2">
                                Partagée par <span className="font-medium">{encounter.ownerName}</span>
                                {encounter.copiedCount > 0 && (
                                    <span className="ml-2">• {encounter.copiedCount} copie(s)</span>
                                )}
                            </CardDescription>
                        </div>
                        <Badge className={getDifficultyColor(encounter.difficulty)}>
                            {getDifficultyLabel(encounter.difficulty)}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Description */}
                    {encounter.description && (
                        <div>
                            <h3 className="font-medium mb-2">Description</h3>
                            <p className="text-muted-foreground">{encounter.description}</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">{encounter.totalXP}</p>
                            <p className="text-sm text-muted-foreground">XP Total</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">{encounter.adjustedXP}</p>
                            <p className="text-sm text-muted-foreground">XP Ajusté</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <p className="text-2xl font-bold text-primary">
                                {encounter.monsters?.reduce((sum, m) => sum + m.quantity, 0) || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">Créatures</p>
                        </div>
                        {encounter.environment && (
                            <div className="bg-muted/50 p-3 rounded-lg text-center">
                                <p className="text-lg font-medium capitalize">{encounter.environment}</p>
                                <p className="text-sm text-muted-foreground">Environnement</p>
                            </div>
                        )}
                    </div>

                    {/* Liste des monstres */}
                    <div>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Créatures ({encounter.monsters?.length || 0})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {encounter.monsters?.map((monsterEntry: EncounterMonster, idx: number) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sword className="w-4 h-4 text-primary" />
                                        <span className="font-medium">{monsterEntry.monster.name}</span>
                                        {monsterEntry.quantity > 1 && (
                                            <Badge variant="outline">×{monsterEntry.quantity}</Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        FP {monsterEntry.monster.cr || monsterEntry.monster.challengeRating || '?'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-6">
                    {isAuthenticated ? (
                        <>
                            <Button
                                onClick={handleCopyToLibrary}
                                disabled={copying || copied}
                                className="w-full sm:w-auto"
                                size="lg"
                            >
                                {copying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Copie en cours...
                                    </>
                                ) : copied ? (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Copié !
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Ajouter à mes rencontres
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/history')}
                                className="w-full sm:w-auto"
                            >
                                <FolderOpen className="w-4 h-4 mr-2" />
                                Voir mes rencontres
                            </Button>
                        </>
                    ) : (
                        <div className="w-full text-center">
                            <p className="text-muted-foreground mb-3">
                                Connectez-vous pour ajouter cette rencontre à votre bibliothèque.
                            </p>
                            <Button onClick={() => navigate('/auth')} size="lg">
                                Se connecter
                            </Button>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
};

export default SharedEncounterPage;
