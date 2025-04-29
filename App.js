import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from './src/screens/Main';
import Settings from './src/screens/Settings';
import Account from './src/screens/Account';
import LoginScreen from './src/screens/LoginScreen';
import LkChuvsu from './src/screens/LkChuvsu';

const Stack = createNativeStackNavigator();

import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import Schedule from './src/screens/Schedule'; // путь к файлу


export default function App() {
  return (
      <ThemeProvider>
        <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={Main} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="Account" component={Account} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="LkChuvsu" component={LkChuvsu} />
            <Stack.Screen name="Schedule" component={Schedule} />
          </Stack.Navigator>
        </NavigationContainer>
        </AuthProvider>
      </ThemeProvider>
  );
}
