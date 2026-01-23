import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Spell = {
    id: string;
    name: string;
    level: number;
    school: string;
    castingTime: string;
    range: string;
    components: string;
};

const sampleSpells: Spell[] = [
    { id: '1', name: 'Boule de feu', level: 3, school: 'Évocation', castingTime: '1 action', range: '45 m', components: 'V, S, M' },
    { id: '2', name: 'Projectile magique', level: 1, school: 'Évocation', castingTime: '1 action', range: '36 m', components: 'V, S' },
    { id: '3', name: 'Bouclier', level: 1, school: 'Abjuration', castingTime: '1 réaction', range: 'Personnelle', components: 'V, S' },
    { id: '4', name: 'Invisibilité', level: 2, school: 'Illusion', castingTime: '1 action', range: 'Contact', components: 'V, S, M' },
    { id: '5', name: 'Soins', level: 1, school: 'Évocation', castingTime: '1 action', range: 'Contact', components: 'V, S' },
    { id: '6', name: 'Lumière', level: 0, school: 'Évocation', castingTime: '1 action', range: 'Contact', components: 'V, M' },
    { id: '7', name: 'Rayon de givre', level: 0, school: 'Évocation', castingTime: '1 action', range: '18 m', components: 'V, S' },
    { id: '8', name: 'Détection de la magie', level: 1, school: 'Divination', castingTime: '1 action', range: 'Personnelle', components: 'V, S' },
    { id: '9', name: 'Télékinésie', level: 5, school: 'Transmutation', castingTime: '1 action', range: '18 m', components: 'V, S' },
    { id: '10', name: 'Éclair', level: 3, school: 'Évocation', castingTime: '1 action', range: '30 m (ligne)', components: 'V, S, M' },
];

const schoolColors: Record<string, string> = {
    'Évocation': '#e94560',
    'Abjuration': '#4361ee',
    'Illusion': '#7b2cbf',
    'Divination': '#2ec4b6',
    'Transmutation': '#ff9800',
    'Nécromancie': '#333',
    'Enchantement': '#e91e63',
    'Invocation': '#00bcd4',
};

export default function SpellBrowserScreen() {
    const [search, setSearch] = useState('');
    const [levelFilter, setLevelFilter] = useState<number | null>(null);

    const filteredSpells = sampleSpells.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.school.toLowerCase().includes(search.toLowerCase());
        const matchesLevel = levelFilter === null || s.level === levelFilter;
        return matchesSearch && matchesLevel;
    });

    const getLevelText = (level: number) => level === 0 ? 'Cantrip' : `Niv. ${level}`;

    const renderSpell = ({ item }: { item: Spell }) => (
        <TouchableOpacity style={styles.spellCard}>
            <View style={styles.spellHeader}>
                <View style={styles.spellTitleRow}>
                    <View style={[styles.levelBadge, { backgroundColor: item.level === 0 ? '#666' : '#4361ee' }]}>
                        <Text style={styles.levelText}>{getLevelText(item.level)}</Text>
                    </View>
                    <Text style={styles.spellName}>{item.name}</Text>
                </View>
                <View style={[styles.schoolBadge, { backgroundColor: schoolColors[item.school] || '#666' }]}>
                    <Text style={styles.schoolText}>{item.school}</Text>
                </View>
            </View>

            <View style={styles.spellDetails}>
                <View style={styles.detailItem}>
                    <Ionicons name="time" size={12} color="#888" />
                    <Text style={styles.detailText}>{item.castingTime}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="locate" size={12} color="#888" />
                    <Text style={styles.detailText}>{item.range}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Ionicons name="construct" size={12} color="#888" />
                    <Text style={styles.detailText}>{item.components}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un sort..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={[styles.filterChip, levelFilter === null && styles.filterChipActive]}
                    onPress={() => setLevelFilter(null)}
                >
                    <Text style={[styles.filterText, levelFilter === null && styles.filterTextActive]}>Tous</Text>
                </TouchableOpacity>
                {[0, 1, 2, 3, 4, 5].map(level => (
                    <TouchableOpacity
                        key={level}
                        style={[styles.filterChip, levelFilter === level && styles.filterChipActive]}
                        onPress={() => setLevelFilter(level)}
                    >
                        <Text style={[styles.filterText, levelFilter === level && styles.filterTextActive]}>
                            {level === 0 ? 'C' : level}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredSpells}
                renderItem={renderSpell}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16213e',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        margin: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#333',
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        color: '#fff',
        fontSize: 16,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#1a1a2e',
        borderWidth: 1,
        borderColor: '#333',
    },
    filterChipActive: {
        backgroundColor: '#4361ee',
        borderColor: '#4361ee',
    },
    filterText: {
        color: '#888',
        fontSize: 13,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#fff',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    spellCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
    },
    spellHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    spellTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    levelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    levelText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    spellName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flex: 1,
    },
    schoolBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 4,
    },
    schoolText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '500',
    },
    spellDetails: {
        flexDirection: 'row',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 12,
        color: '#888',
    },
});
