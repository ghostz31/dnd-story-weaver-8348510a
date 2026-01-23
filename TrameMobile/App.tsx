import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import EncounterTrackerScreen from './src/screens/EncounterTrackerScreen';
import MonsterBrowserScreen from './src/screens/MonsterBrowserScreen';
import SpellBrowserScreen from './src/screens/SpellBrowserScreen';
import PartyScreen from './src/screens/PartyScreen';

export type RootStackParamList = {
  Home: undefined;
  EncounterTracker: { encounterId?: string };
  MonsterBrowser: undefined;
  SpellBrowser: undefined;
  Party: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#1a1a2e',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#16213e',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'D&D Story Weaver' }}
          />
          <Stack.Screen
            name="EncounterTracker"
            component={EncounterTrackerScreen}
            options={{ title: 'Combat Tracker' }}
          />
          <Stack.Screen
            name="MonsterBrowser"
            component={MonsterBrowserScreen}
            options={{ title: 'Bestiaire' }}
          />
          <Stack.Screen
            name="SpellBrowser"
            component={SpellBrowserScreen}
            options={{ title: 'Sorts' }}
          />
          <Stack.Screen
            name="Party"
            component={PartyScreen}
            options={{ title: 'Groupe' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
