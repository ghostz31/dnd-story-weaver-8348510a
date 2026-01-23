import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Copy, AlertCircle, Loader2, Check, Heart, Shield, Zap } from 'lucide-react';
import { getSharedMonster, copySharedMonster, SharedMonster } from '../lib/sharingApi';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SharedMonsterPage: React.FC = () => {
    const { shareCode } = useParams<{ shareCode: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();

    const [monster, setMonster] = useState<SharedMonster | null>(null);
    const [loading, setLoading] = useState(true);
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMonster = async () => {
            if (!shareCode) {
                setError('Code de partage manquant');
                setLoading(false);
                return;
            }

            try {
                const sharedMonster = await getSharedMonster(shareCode);
                if (!sharedMonster) {
                    setError('Créature non trouvée. Le lien est peut-être expiré ou invalide.');
                } else {
                    setMonster(sharedMonster);
                }
            } catch (err) {
                console.error('Erreur chargement monstre partagé:', err);
                setError('Erreur lors du chargement de la créature.');
            } finally {
                setLoading(false);
            }
        };

        loadMonster();
    }, [shareCode]);

    const handleCopyToLibrary = async () => {
        if (!shareCode) return;

        try {
            setCopying(true);
            const copiedMonster = await copySharedMonster(shareCode);

            if (copiedMonster) {
                // Sauvegarder dans localStorage (monstres custom)
                const existingMonsters = JSON.parse(localStorage.getItem('custom_monsters') || '[]');
                existingMonsters.push(copiedMonster);
                localStorage.setItem('custom_monsters', JSON.stringify(existingMonsters));

                setCopied(true);
                toast({
                    title: "Créature copiée !",
                    description: "La créature a été ajoutée à votre bestiaire custom."
                });
            }
        } catch (err) {
            console.error('Erreur copie:', err);
            toast({
                title: "Erreur",
                description: "Impossible de copier la créature.",
                variant: "destructive"
            });
        } finally {
            setCopying(false);
        }
    };

    const getSizeLabel = (size: string) => {
        const sizes: Record<string, string> = {
            'TP': 'Très Petit',
            'P': 'Petit',
            'M': 'Moyen',
            'G': 'Grand',
            'TG': 'Très Grand',
            'Gig': 'Gigantesque'
        };
        return sizes[size] || size;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement de la créature...</p>
                </div>
            </div>
        );
    }

    if (error || !monster) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Créature non trouvée</h2>
                        <p className="text-muted-foreground mb-4">
                            {error || 'Cette créature n\'existe pas ou a été supprimée.'}
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
                {/* Image du monstre si disponible */}
                {monster.image && (
                    <div className="w-full h-48 overflow-hidden">
                        <img
                            src={monster.image}
                            alt={monster.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Sword className="w-6 h-6 text-primary" />
                                {monster.name}
                            </CardTitle>
                            <CardDescription className="mt-2">
                                {monster.type} {monster.subtype && `(${monster.subtype})`} • {getSizeLabel(monster.size)}
                                <br />
                                Partagé par <span className="font-medium">{monster.ownerName}</span>
                                {monster.copiedCount > 0 && (
                                    <span className="ml-2">• {monster.copiedCount} copie(s)</span>
                                )}
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            FP {monster.cr || monster.challengeRating || '?'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Stats principales */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <Shield className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                            <p className="text-2xl font-bold">{monster.ac || '?'}</p>
                            <p className="text-sm text-muted-foreground">CA</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <Heart className="w-5 h-5 mx-auto mb-1 text-red-500" />
                            <p className="text-2xl font-bold">{monster.hp || '?'}</p>
                            <p className="text-sm text-muted-foreground">PV</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                            <p className="text-2xl font-bold">{monster.xp || '?'}</p>
                            <p className="text-sm text-muted-foreground">XP</p>
                        </div>
                    </div>

                    {/* Caractéristiques */}
                    <div>
                        <h3 className="font-medium mb-3">Caractéristiques</h3>
                        <div className="grid grid-cols-6 gap-2 text-center">
                            {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => (
                                <div key={stat} className="bg-muted/30 p-2 rounded">
                                    <p className="text-xs uppercase text-muted-foreground">{stat}</p>
                                    <p className="font-bold">{(monster as any)[stat] || 10}</p>
                                    <p className="text-xs text-muted-foreground">
                                        ({Math.floor(((monster as any)[stat] || 10) / 2) - 5 >= 0 ? '+' : ''}
                                        {Math.floor(((monster as any)[stat] || 10) / 2) - 5})
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traits */}
                    {monster.traits && monster.traits.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Traits</h3>
                            <div className="space-y-2">
                                {monster.traits.map((trait, idx) => (
                                    <div key={idx} className="text-sm">
                                        <span className="font-medium">{trait.name}.</span>{' '}
                                        <span className="text-muted-foreground">{trait.desc || trait.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {monster.actions && monster.actions.length > 0 && (
                        <div>
                            <h3 className="font-medium mb-2">Actions</h3>
                            <div className="space-y-2">
                                {monster.actions.map((action, idx) => (
                                    <div key={idx} className="text-sm">
                                        <span className="font-medium">{action.name}.</span>{' '}
                                        <span className="text-muted-foreground">{action.desc || action.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                        Ajouter à mon bestiaire
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/monsters')}
                                className="w-full sm:w-auto"
                            >
                                Voir le bestiaire
                            </Button>
                        </>
                    ) : (
                        <div className="w-full text-center">
                            <p className="text-muted-foreground mb-3">
                                Connectez-vous pour ajouter cette créature à votre bestiaire.
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

export default SharedMonsterPage;
