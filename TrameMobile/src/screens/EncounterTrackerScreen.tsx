import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Combatant = {
    id: string;
    name: string;
    initiative: number;
    hp: number;
    maxHp: number;
    isPlayer: boolean;
    conditions: string[];
};

const sampleCombatants: Combatant[] = [
    { id: '1', name: 'Aragorn', initiative: 18, hp: 45, maxHp: 45, isPlayer: true, conditions: [] },
    { id: '2', name: 'Gobelin 1', initiative: 14, hp: 7, maxHp: 7, isPlayer: false, conditions: [] },
    { id: '3', name: 'Legolas', initiative: 22, hp: 38, maxHp: 38, isPlayer: true, conditions: [] },
    { id: '4', name: 'Gobelin 2', initiative: 10, hp: 5, maxHp: 7, isPlayer: false, conditions: ['effrayé'] },
];

export default function EncounterTrackerScreen() {
    const [combatants, setCombatants] = useState<Combatant[]>(
        [...sampleCombatants].sort((a, b) => b.initiative - a.initiative)
    );
    const [currentTurn, setCurrentTurn] = useState(0);
    const [round, setRound] = useState(1);

    const nextTurn = () => {
        if (currentTurn >= combatants.length - 1) {
            setCurrentTurn(0);
            setRound(r => r + 1);
        } else {
            setCurrentTurn(c => c + 1);
        }
    };

    const updateHp = (id: string, delta: number) => {
        setCombatants(prev =>
            prev.map(c =>
                c.id === id
                    ? { ...c, hp: Math.max(0, Math.min(c.maxHp, c.hp + delta)) }
                    : c
            )
        );
    };

    const getHpColor = (hp: number, maxHp: number) => {
        const ratio = hp / maxHp;
        if (ratio > 0.5) return '#4caf50';
        if (ratio > 0.25) return '#ff9800';
        return '#f44336';
    };

    const renderCombatant = ({ item, index }: { item: Combatant; index: number }) => {
        const isActive = index === currentTurn;

        return (
            <View style={[styles.combatantCard, isActive && styles.activeCard]}>
                <View style={styles.initiativeBox}>
                    <Text style={styles.initiativeText}>{item.initiative}</Text>
                </View>

                <View style={styles.combatantInfo}>
                    <View style={styles.nameRow}>
                        <Ionicons
                            name={item.isPlayer ? 'person' : 'skull'}
                            size={16}
                            color={item.isPlayer ? '#4361ee' : '#e94560'}
                        />
                        <Text style={styles.combatantName}>{item.name}</Text>
                        {isActive && (
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>Tour actuel</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.hpRow}>
                        <View style={styles.hpBarContainer}>
                            <View
                                style={[
                                    styles.hpBar,
                                    {
                                        width: `${(item.hp / item.maxHp) * 100}%`,
                                        backgroundColor: getHpColor(item.hp, item.maxHp),
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.hpText}>{item.hp}/{item.maxHp}</Text>
                    </View>

                    {item.conditions.length > 0 && (
                        <View style={styles.conditionsRow}>
                            {item.conditions.map((cond, idx) => (
                                <View key={idx} style={styles.conditionBadge}>
                                    <Text style={styles.conditionText}>{cond}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.hpControls}>
                    <TouchableOpacity
                        style={styles.hpButton}
                        onPress={() => updateHp(item.id, -1)}
                    >
                        <Ionicons name="remove" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.hpButton, styles.healButton]}
                        onPress={() => updateHp(item.id, 1)}
                    >
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.roundInfo}>
                    <Text style={styles.roundLabel}>Round</Text>
                    <Text style={styles.roundNumber}>{round}</Text>
                </View>

                <TouchableOpacity style={styles.nextButton} onPress={nextTurn}>
                    <Text style={styles.nextButtonText}>Tour suivant</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={combatants}
                renderItem={renderCombatant}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#1a1a2e',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    roundInfo: {
        alignItems: 'center',
    },
    roundLabel: {
        fontSize: 12,
        color: '#888',
    },
    roundNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4361ee',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    combatantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    activeCard: {
        borderColor: '#4361ee',
        backgroundColor: '#1e2a4a',
    },
    initiativeBox: {
        width: 40,
        height: 40,
        backgroundColor: '#333',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    initiativeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    combatantInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    combatantName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    activeBadge: {
        backgroundColor: '#4361ee',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    activeBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '600',
    },
    hpRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    hpBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: '#333',
        borderRadius: 3,
        overflow: 'hidden',
    },
    hpBar: {
        height: '100%',
        borderRadius: 3,
    },
    hpText: {
        fontSize: 12,
        color: '#888',
        width: 50,
        textAlign: 'right',
    },
    conditionsRow: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 6,
    },
    conditionBadge: {
        backgroundColor: '#7b2cbf',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    conditionText: {
        fontSize: 10,
        color: '#fff',
    },
    hpControls: {
        flexDirection: 'row',
        gap: 6,
    },
    hpButton: {
        width: 36,
        height: 36,
        backgroundColor: '#e94560',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    healButton: {
        backgroundColor: '#4caf50',
    },
});
