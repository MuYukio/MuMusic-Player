import React, { useCallback, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Easing
} from "react-native";
import { globalStyles, colors, typography, spacing } from '../src/theme'; 

export default function LoginScreen({ navigation }: any) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start(() => pulse());
  };

  React.useEffect(() => {
    pulse();
  }, []);

  const autenticar = useCallback(async () => {
    if (isAuthenticating) return;
    
    setIsAuthenticating(true);
    try {
      const temLeitor = await LocalAuthentication.hasHardwareAsync();
      const temBiometria = await LocalAuthentication.isEnrolledAsync();
      
      if (!temLeitor) {
        Alert.alert('Dispositivo não possui autenticação biométrica.');
        setIsAuthenticating(false);
        return;
      }
      
      if (!temBiometria) {
        Alert.alert('Nenhuma biometria cadastrada neste dispositivo.');
        setIsAuthenticating(false);
        return;
      }
      
      const validacaoBiometrica = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentique-se para acessar',
        fallbackLabel: 'Usar senha'
      });
      
      if (validacaoBiometrica.success) {
        navigation.navigate('Home');
      }
    } catch (err) {
      Alert.alert("Ocorreu um erro no processo biométrico!", "Por favor, tente novamente mais tarde.");
      console.error(err);
    } finally {
      setIsAuthenticating(false);
    }
  }, [navigation, isAuthenticating]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Icon name="music" size={50} color={colors.primary} style={styles.musicIcon} />
          <Text style={styles.appName}>MuMusic</Text>
          <Text style={styles.subtitle}>Sua coleção musical pessoal</Text>
        </View>
        
        <View style={styles.authContainer}>
          <Text style={styles.title}>Acesso Seguro</Text>
          <Text style={styles.description}>
            Use sua biometria para acessar sua coleção de músicas de forma segura
          </Text>
          
          <Animated.View style={[styles.fingerprintContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity 
              style={[styles.fingerprintButton, isAuthenticating && styles.fingerprintButtonDisabled]} 
              onPress={autenticar}
              disabled={isAuthenticating}
            >
              <Icon 
                name="fingerprint" 
                size={80} 
                color={isAuthenticating ? colors.secondary : colors.primary} 
              />
            </TouchableOpacity>
          </Animated.View>
          
          {isAuthenticating ? (
            <Text style={styles.authenticatingText}>Autenticando...</Text>
          ) : (
            <Text style={styles.infoText}>Toque no sensor para autenticar</Text>
          )}
        </View>
        
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.large,
    marginTop:25
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.large * 2,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.small,
  },
  subtitle: {
    ...typography.text,
    color: colors.secondary,
    marginTop: 4,
  },
  musicIcon: {
    marginBottom: spacing.small,
  },
  authContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...typography.title,
    fontSize: 24,
    color: colors.text,
    marginBottom: spacing.small,
  },
  description: {
    ...typography.text,
    textAlign: 'center',
    color: colors.secondary,
    marginBottom: spacing.large * 2,
    paddingHorizontal: spacing.large,
  },
  fingerprintContainer: {
    marginBottom: spacing.large,
  },
  fingerprintButton: {
    backgroundColor: 'rgba(163, 59, 50, 0.1)',
    padding: spacing.large,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  fingerprintButtonDisabled: { 
    borderColor: colors.secondary,
  },
  authenticatingText: {
    ...typography.text,
    color: colors.primary,
    fontWeight: '600',
  },
  infoText: {
    ...typography.text,
    color: colors.secondary,
    textAlign: "center",
    marginBottom:120
  },
 
});