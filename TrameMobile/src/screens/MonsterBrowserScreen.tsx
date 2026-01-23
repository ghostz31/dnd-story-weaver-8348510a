import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Monster = {
    id: string;
    name: string;
    type: string;
    cr: string;
    hp: string;
    ac: number;
};

const sampleMonsters: Monster[] = [
    { id: '1', name: 'Gobelin', type: 'Humanoïde', cr: '1/4', hp: '7 (2d6)', ac: 15 },
    { id: '2', name: 'Orc', type: 'Humanoïde', cr: '1/2', hp: '15 (2d8+6)', ac: 13 },
    { id: '3', name: 'Hobgobelin', type: 'Humanoïde', cr: '1/2', hp: '11 (2d8+2)', ac: 18 },
    { id: '4', name: 'Loup', type: 'Bête', cr: '1/4', hp: '11 (2d8+2)', ac: 13 },
    { id: '5', name: 'Loup sanguinaire', type: 'Bête', cr: '1', hp: '37 (5d10+10)', ac: 14 },
    { id: '6', name: 'Squelette', type: 'Mort-vivant', cr: '1/4', hp: '13 (2d8+4)', ac: 13 },
    { id: '7', name: 'Zombie', type: 'Mort-vivant', cr: '1/4', hp: '22 (3d8+9)', ac: 8 },
    { id: '8', name: 'Ogre', type: 'Géant', cr: '2', hp: '59 (7d10+21)', ac: 11 },
    { id: '9', name: 'Troll', type: 'Géant', cr: '5', hp: '84 (8d10+40)', ac: 15 },
    { id: '10', name: 'Dragon rouge adulte', type: 'Dragon', cr: '17', hp: '256 (19d12+133)', ac: 19 },
];

export default function MonsterBrowserScreen() {
    const [search, setSearch] = useState('');
    const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);

    const filteredMonsters = sampleMonsters.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.type.toLowerCase().includes(search.toLowerCase())
    );

    const getCrColor = (cr: string) => {
        const numCr = cr.includes('/') ? 0.5 : parseFloat(cr);
        if (numCr <= 1) return '#4caf50';
        if (numCr <= 5) return '#ff9800';
        if (numCr <= 10) return '#e94560';
        return '#7b2cbf';
    };

    const renderMonster = ({ item }: { item: Monster }) => (
        <TouchableOpacity
            style={styles.monsterCard}
            onPress={() => setSelectedMonster(item)}
        >
            <View style={styles.monsterHeader}>
                <Text style={styles.monsterName}>{item.name}</Text>
                <View style={[styles.crBadge, { backgroundColor: getCrColor(item.cr) }]}>
                    <Text style={styles.crText}>FP {item.cr}</Text>
                </View>
            </View>

            <Text style={styles.monsterType}>{item.type}</Text>

            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Ionicons name="shield" size={14} color="#4361ee" />
                    <Text style={styles.statText}>CA {item.ac}</Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons name="heart" size={14} color="#e94560" />
                    <Text style={styles.statText}>{item.hp}</Text>
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
                    placeholder="Rechercher un monstre..."
                    placeholderTextColor="#666"
                    value={search}
                    onChangeText={setSearch}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => setSearch('')}>
                        <Ionicons name="close-circle" size={20} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                data={filteredMonsters}
                renderItem={renderMonster}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="paw" size={48} color="#666" />
                        <Text style={styles.emptyText}>Aucun monstre trouvé</Text>
                    </View>
                }
            />

            <Modal
                visible={selectedMonster !== null}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedMonster(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedMonster && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{selectedMonster.name}</Text>
                                    <TouchableOpacity onPress={() => setSelectedMonster(null)}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.modalType}>{selectedMonster.type}</Text>

                                <View style={styles.modalStats}>
                                    <View style={styles.modalStatBox}>
                                        <Text style={styles.modalStatLabel}>Classe d'Armure</Text>
                                        <Text style={styles.modalStatValue}>{selectedMonster.ac}</Text>
                                    </View>
                                    <View style={styles.modalStatBox}>
                                        <Text style={styles.modalStatLabel}>Points de Vie</Text>
                                        <Text style={styles.modalStatValue}>{selectedMonster.hp}</Text>
                                    </View>
                                    <View style={styles.modalStatBox}>
                                        <Text style={styles.modalStatLabel}>Facteur de Puissance</Text>
                                        <Text style={styles.modalStatValue}>{selectedMonster.cr}</Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setSelectedMonster(null)}
                                >
                                    <Ionicons name="add" size={20} color="#fff" />
                                    <Text style={styles.addButtonText}>Ajouter au combat</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    monsterCard: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#e94560',
    },
    monsterHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    monsterName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    crBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    crText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    monsterType: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
        fontStyle: 'italic',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: '#ccc',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
        marginTop: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1a1a2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    modalType: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    modalStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalStatBox: {
        flex: 1,
        backgroundColor: '#16213e',
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    modalStatLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    modalStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4361ee',
        padding: 14,
        borderRadius: 10,
        gap: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
