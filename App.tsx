import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";


import HomeScreen from "./screens/HomeScreen";
import PlayListScreen from "./screens/PlayListScreen";
import LoginScreen from "./screens/LoginScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator id={undefined} initialRouteName="Login">
         <Stack.Screen
          name="Login"
          component={LoginScreen
          }
          options={{ title: "Seja bem-vindo!" }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Tela de Início"}}
        />
        <Stack.Screen
          name="PlayList"
          component={PlayListScreen}
          options={{ title: "Sua Playlist"}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

  
