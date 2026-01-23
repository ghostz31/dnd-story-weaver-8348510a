import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Character = {
    id: string;
    name: string;
    class: string;
    level: number;
    race: string;
    hp: number;
    maxHp: number;
    ac: number;
};

const sampleParty: Character[] = [
    { id: '1', name: 'Thorin', class: 'Guerrier', level: 5, race: 'Nain', hp: 52, maxHp: 52, ac: 18 },
    { id: '2', name: 'Elara', class: 'Magicienne', level: 5, race: 'Elfe', hp: 28, maxHp: 28, ac: 12 },
    { id: '3', name: 'Bran', class: 'Roublard', level: 5, race: 'Halfelin', hp: 38, maxHp: 38, ac: 15 },
    { id: '4', name: 'Kira', class: 'Clerc', level: 5, race: 'Humaine', hp: 42, maxHp: 42, ac: 16 },
];

const classColors: Record<string, string> = {
    'Guerrier': '#e94560',
    'Magicienne': '#7b2cbf',
    'Roublard': '#2ec4b6',
    'Clerc': '#ff9800',
    'Barbare': '#c0392b',
    'Barde': '#9b59b6',
    'Druide': '#27ae60',
    'Moine': '#3498db',
    'Paladin': '#f1c40f',
    'Rôdeur': '#1abc9c',
    'Ensorceleur': '#e74c3c',
    'Sorcier': '#8e44ad',
};

export default function PartyScreen() {
    const [party, setParty] = useState<Character[]>(sampleParty);
    const [showAddModal, setShowAddModal] = useState(false);

    const totalLevel = party.reduce((sum, c) => sum + c.level, 0);
    const averageLevel = party.length > 0 ? (totalLevel / party.length).toFixed(1) : 0;

    const renderCharacter = ({ item }: { item: Character }) => (
        <View style={styles.characterCard}>
            <View style={[styles.classIndicator, { backgroundColor: classColors[item.class] || '#666' }]} />

            <View style={styles.characterInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.characterName}>{item.name}</Text>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>Niv. {item.level}</Text>
                    </View>
                </View>

                <Text style={styles.classRace}>{item.race} • {item.class}</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Ionicons name="shield" size={14} color="#4361ee" />
                        <Text style={styles.statText}>CA {item.ac}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="heart" size={14} color="#e94560" />
                        <Text style={styles.statText}>{item.hp}/{item.maxHp} PV</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={20} color="#888" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.partyStats}>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>Joueurs</Text>
                        <Text style={styles.statBoxValue}>{party.length}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>Niveau Moyen</Text>
                        <Text style={styles.statBoxValue}>{averageLevel}</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxLabel}>XP Seuil</Text>
                        <Text style={styles.statBoxValue}>2,500</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={party}
                renderItem={renderCharacter}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListFooterComponent={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}
                    >
                        <Ionicons name="add-circle" size={24} color="#4361ee" />
                        <Text style={styles.addButtonText}>Ajouter un personnage</Text>
                    </TouchableOpacity>
                }
            />

            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouveau Personnage</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Nom</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Nom du personnage"
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Classe</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder="Ex: Guerrier, Magicien..."
                                placeholderTextColor="#666"
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.formLabel}>Niveau</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="1"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.formLabel}>CA</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="10"
                                    placeholderTextColor="#666"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={() => setShowAddModal(false)}
                        >
                            <Ionicons name="checkmark" size={20} color="#fff" />
                            <Text style={styles.saveButtonText}>Ajouter</Text>
                        </TouchableOpacity>
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
    header: {
        backgroundColor: '#1a1a2e',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    partyStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    statBoxLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 4,
    },
    statBoxValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    list: {
        padding: 16,
    },
    characterCard: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
    },
    classIndicator: {
        width: 4,
    },
    characterInfo: {
        flex: 1,
        padding: 14,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    characterName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginRight: 8,
    },
    levelBadge: {
        backgroundColor: '#333',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    levelText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '500',
    },
    classRace: {
        fontSize: 13,
        color: '#888',
        marginBottom: 8,
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
    editButton: {
        padding: 14,
        justifyContent: 'center',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#333',
        borderStyle: 'dashed',
        gap: 8,
    },
    addButtonText: {
        color: '#4361ee',
        fontSize: 16,
        fontWeight: '500',
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    formGroup: {
        marginBottom: 16,
    },
    formLabel: {
        fontSize: 13,
        color: '#888',
        marginBottom: 6,
    },
    formInput: {
        backgroundColor: '#16213e',
        borderRadius: 8,
        padding: 12,
        color: '#fff',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4361ee',
        padding: 14,
        borderRadius: 10,
        marginTop: 8,
        gap: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
