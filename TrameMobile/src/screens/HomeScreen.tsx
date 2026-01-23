import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type MenuItem = {
    title: string;
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: keyof RootStackParamList;
    color: string;
};

const menuItems: MenuItem[] = [
    {
        title: 'Combat Tracker',
        subtitle: 'Gérer vos rencontres en cours',
        icon: 'skull',
        screen: 'EncounterTracker',
        color: '#e94560',
    },
    {
        title: 'Bestiaire',
        subtitle: 'Parcourir les monstres',
        icon: 'paw',
        screen: 'MonsterBrowser',
        color: '#7b2cbf',
    },
    {
        title: 'Sorts',
        subtitle: 'Rechercher des sorts',
        icon: 'flash',
        screen: 'SpellBrowser',
        color: '#4361ee',
    },
    {
        title: 'Mon Groupe',
        subtitle: 'Gérer vos personnages',
        icon: 'people',
        screen: 'Party',
        color: '#2ec4b6',
    },
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>D&D Story Weaver</Text>
                <Text style={styles.subtitle}>Version Mobile</Text>
            </View>

            <View style={styles.grid}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.card, { borderLeftColor: item.color }]}
                        onPress={() => navigation.navigate(item.screen as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                            <Ionicons name={item.icon} size={28} color="#fff" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Donjons & Dragons 5e - Outil du Maître du Jeu
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#16213e',
    },
    header: {
        padding: 24,
        alignItems: 'center',
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#888',
    },
    grid: {
        padding: 16,
        gap: 12,
    },
    card: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 4,
        marginBottom: 12,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#888',
    },
    footer: {
        padding: 24,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#666',
    },
});
