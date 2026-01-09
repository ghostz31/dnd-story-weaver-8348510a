import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MonsterSchema } from '../lib/schemas';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { monsterTypes, monsterSizes, environments } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Plus, Trash2, Save, Wand2 } from 'lucide-react';
import { Monster } from '../lib/types';

type MonsterFormValues = z.infer<typeof MonsterSchema>;

interface MonsterEditorProps {
    initialData?: Partial<Monster>;
    onSave: (data: MonsterFormValues) => void;
    onCancel?: () => void;
}

export const MonsterEditor: React.FC<MonsterEditorProps> = ({ initialData, onSave, onCancel }) => {
    const defaultValues: Partial<MonsterFormValues> = {
        id: 'new-monster',
        name: '',
        type: 'Humanoïde',
        size: 'M',
        xp: 0,
        cr: 0,
        ac: 10,
        hp: 10,
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
        speed: { walk: 9 },
        alignment: 'Neutre',
        source: 'Custom',
        traits: [],
        actions: [],
        reactions: [],
        legendaryActions: [],
        ...initialData
    };

    const form = useForm<MonsterFormValues>({
        resolver: zodResolver(MonsterSchema),
        defaultValues
    });

    const { fields: traitFields, append: appendTrait, remove: removeTrait } = useFieldArray({
        control: form.control,
        name: "traits"
    });

    const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
        control: form.control,
        name: "actions"
    });

    const { fields: legendaryFields, append: appendLegendary, remove: removeLegendary } = useFieldArray({
        control: form.control,
        name: "legendaryActions"
    });

    const { fields: reactionFields, append: appendReaction, remove: removeReaction } = useFieldArray({
        control: form.control,
        name: "reactions"
    });

    const onSubmit = (data: MonsterFormValues) => {
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.error("Validation Errors:", errors))} className="space-y-6 max-w-4xl mx-auto pb-20">
                <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm sticky top-0 z-10">
                    <h2 className="text-2xl font-cinzel font-bold text-primary">Éditeur de Créature</h2>
                    <div className="flex gap-2">
                        {onCancel && (
                            <Button type="button" variant="outline" onClick={onCancel}>
                                Annuler
                            </Button>
                        )}
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">Général</TabsTrigger>
                        <TabsTrigger value="stats">Stats</TabsTrigger>
                        <TabsTrigger value="details">Détails</TabsTrigger>
                        <TabsTrigger value="actions">Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations de base</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nom de la créature" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selectionner un type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {monsterTypes.filter(t => t.value !== 'all').map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taille</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Taille" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {monsterSizes.filter(s => s.value !== 'all').map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="alignment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Alignement</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Chaotique Mauvais" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cr"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Challenge Rating (CR)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.125" {...field} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? 0 : v); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="xp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>XP</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? 0 : v); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="col-span-1 md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>URL de l'image (optionnel)</FormLabel>
                                                <div className="flex gap-4 items-start">
                                                    <FormControl className="flex-1">
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="flex-shrink-0 border rounded-md overflow-hidden bg-secondary/10">
                                                            <img
                                                                src={field.value}
                                                                alt="Aperçu"
                                                                className="max-h-[150px] max-w-[150px] object-contain"
                                                                onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistiques de Combat</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="ac"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Classe d'Armure (AC)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? 10 : v); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Points de Vie (HP)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? 10 : v); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="speed.walk"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vitesse (m)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => { const v = parseFloat(e.target.value); field.onChange(isNaN(v) ? 0 : v); }} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Caractéristiques</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => (
                                    <FormField
                                        key={stat}
                                        control={form.control}
                                        name={stat as any}
                                        render={({ field }) => (
                                            <FormItem className="text-center">
                                                <FormLabel className="uppercase">{stat}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" className="text-center" {...field} onChange={e => { const v = parseInt(e.target.value); field.onChange(isNaN(v) ? 10 : v); }} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Détails Techniques</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="savingThrows"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Jets de Sauvegarde</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Dex +5, Con +4" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skills"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Compétences</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Perception +4, Discrétion +6" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="damageVulnerabilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Vulnérabilités aux Dégâts</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: feu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="damageResistances"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Résistances aux Dégâts</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: froid, feu" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="damageImmunities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Immunités aux Dégâts</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: poison" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="conditionImmunities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Immunités aux États</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: charmé, empoisonné" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="senses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sens</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Vision dans le noir 18m, Perception passive 12" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="languages"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Langues</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ex: Commun, Elfique" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4 mt-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Traits & Capacités</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendTrait({ name: '', desc: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter Trait
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {traitFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-2 border rounded-md">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nom du trait"
                                                {...form.register(`traits.${index}.name`)}
                                                className="font-bold"
                                            />
                                            <Textarea
                                                placeholder="Description"
                                                {...form.register(`traits.${index}.desc`)}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTrait(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Actions</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendAction({ name: '', desc: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter Action
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {actionFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-2 border rounded-md">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nom de l'action"
                                                {...form.register(`actions.${index}.name`)}
                                                className="font-bold"
                                            />
                                            <Textarea
                                                placeholder="Description"
                                                {...form.register(`actions.${index}.desc`)}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAction(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Réactions</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendReaction({ name: '', desc: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter Réaction
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {reactionFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-2 border rounded-md">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nom de la réaction"
                                                {...form.register(`reactions.${index}.name`)}
                                                className="font-bold"
                                            />
                                            <Textarea
                                                placeholder="Description"
                                                {...form.register(`reactions.${index}.desc`)}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeReaction(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Actions Légendaires</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={() => appendLegendary({ name: '', desc: '' })}>
                                    <Plus className="w-4 h-4 mr-2" /> Ajouter Légendaire
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {legendaryFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-2 border rounded-md">
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder="Nom de l'action légendaire"
                                                {...form.register(`legendaryActions.${index}.name`)}
                                                className="font-bold"
                                            />
                                            <Textarea
                                                placeholder="Description"
                                                {...form.register(`legendaryActions.${index}.desc`)}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLegendary(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </form>
        </Form>
    );
};
