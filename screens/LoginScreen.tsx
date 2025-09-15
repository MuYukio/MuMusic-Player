import React, { useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { Alert, SafeAreaView, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }: any) {

  const autenticar = useCallback(async () => {
    try {
      const temLeitor = await LocalAuthentication.hasHardwareAsync();
      const temBiometria = await LocalAuthentication.isEnrolledAsync();
      const validacaoBiometrica = await LocalAuthentication.authenticateAsync();

      if (!temLeitor) return Alert.alert('nao tem leitor');
      if (!temBiometria) return Alert.alert('Sem digital');
      if (validacaoBiometrica) return navigation.navigate('Home');
    } catch (err) {
      Alert.alert("Ocorreu um erro no processo de biométrico!" + err);
    }

  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Acesse com sua biometria</Text>

      <TouchableOpacity style={styles.fingerprintButton} onPress={autenticar}>
        <Icon name="fingerprint" size={90} color="#4CAF50" />
      </TouchableOpacity>

      <Text style={styles.infoText}>Toque no ícone para autenticar</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    width: "100%",
  },
  fingerprintButton: {
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 100,
    marginBottom: 20,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  infoText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    width: "100%",
  },
});