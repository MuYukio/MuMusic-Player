import React, { useCallback } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { Alert, SafeAreaView, TouchableOpacity, Text, StyleSheet } from "react-native";
import { globalStyles, colors, typography, spacing } from '../src/theme'; 

export default function LoginScreen({ navigation }: any) {

  const autenticar = useCallback(async () => {
    try {
      const temLeitor = await LocalAuthentication.hasHardwareAsync();
      const temBiometria = await LocalAuthentication.isEnrolledAsync();
      const validacaoBiometrica = await LocalAuthentication.authenticateAsync();

      if (!temLeitor) return Alert.alert('Dispositivo não possui autenticação biométrica.');
      if (!temBiometria) return Alert.alert('Nenhuma biometria cadastrada neste dispositivo.');
      if (validacaoBiometrica.success) return navigation.navigate('Home');
    } catch (err) {
      Alert.alert("Ocorreu um erro no processo biométrico!", "Por favor, tente novamente mais tarde.");
      console.error(err);
    }
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Acesso seguro com biometria</Text>

      <TouchableOpacity style={styles.fingerprintButton} onPress={autenticar}>
        <Icon name="fingerprint" size={90} color={"white"} />
      </TouchableOpacity>

      <Text style={styles.infoText}>Toque no ícone para autenticar</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.medium,
  },
  title: {
    ...typography.title,
    color: colors.text,
    marginBottom: spacing.large * 2,
    textAlign: "center",
  },
  fingerprintButton: {
    backgroundColor: colors.secondary,
    padding: spacing.large * 2,
    borderRadius: 100,
    marginBottom: spacing.large,
    elevation: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  infoText: {
    ...typography.text,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.medium,
  },
});