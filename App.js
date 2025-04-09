import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Text, View } from 'react-native';

// Import Screens (we will create them next!)
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import AnonymousLoginScreen from './screens/AnonymousLoginScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AnonymousLogin" component={AnonymousLoginScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />


      </Stack.Navigator>
    </NavigationContainer>
  );
}
