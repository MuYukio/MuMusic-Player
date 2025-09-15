import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "./screens/HomeScreen";
import PlayListScreen from "./screens/PlayListScreen";
import LoginScreen from "./screens/LoginScreen";

import { colors, typography } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        id={undefined} // Added this back to fix the TypeScript error
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            ...typography.title,
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: "Seja bem-vindo!" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Tela de Início" }}
        />
        <Stack.Screen
          name="PlayList"
          component={PlayListScreen}
          options={{ title: "Sua Playlist" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}