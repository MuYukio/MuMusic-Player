import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { carregarDados, inserir, remover } from "../config/database";
import { globalStyles, colors, typography, spacing } from '../src/theme';

import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Verifica se é iPhone com notch
const isIphoneWithNotch = Platform.OS === 'ios' && 
  (height === 812 || width === 812 || height === 896 || width === 896 || 
   height === 844 || width === 844 || height === 926 || width === 926);

// Altura segura para evitar áreas de sistema
const SAFE_AREA_TOP = isIphoneWithNotch ? 44 : 25;
const SAFE_AREA_BOTTOM = isIphoneWithNotch ? 34 : 30

export default function Home({ navigation }) {
  const [musicas, setMusicas] = useState([]);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const nav = useNavigation();

  useEffect(() => {
    const carregarMusicas = async () => {
      const salvas = await carregarDados();
      setMusicas(salvas || []);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    };
    carregarMusicas();
  }, []);

  const escolherMusica = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
      multiple: true,
    });

    if (!resultado.canceled) {
      for (let arq of resultado.assets)
        await inserir(arq.name, arq.uri);
    }

    const atualizadas = await carregarDados();
    setMusicas(atualizadas);
  };

  const removerMusica = async (id: number) => {
    await remover(id);
    const atualizadas = await carregarDados();
    setMusicas(atualizadas);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="music-note-off" size={60} color={colors.secondary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Nenhuma música adicionada</Text>
      <Text style={styles.emptySubtext}>Toque no botão abaixo para adicionar músicas</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Header com Botão de Voltar */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => nav.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-left" size={24} color={colors.primary} />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Minhas Músicas</Text>
            <View style={styles.borderDecoration} />
          </View>
        </View>

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <TouchableOpacity 
            onPress={escolherMusica} 
            style={styles.addButton}
            activeOpacity={0.8}
          >
            <Icon name="plus-circle" size={24} color={colors.background} />
            <Text style={styles.addButtonText}>Adicionar Músicas</Text>
          </TouchableOpacity>

          <FlatList
            data={musicas}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={musicas.length === 0 ? styles.emptyListContainer : styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            renderItem={({ item, index }) => (
              <View style={[
                styles.listItem,
                index === 0 && styles.firstListItem,
                index === musicas.length - 1 && styles.lastListItem
              ]}>
                <View style={styles.musicInfo}>
                  <Icon name="music" size={18} color={colors.primary} style={styles.musicIcon} />
                  <Text style={styles.musicText} numberOfLines={1}>{item.nome}</Text>
                </View>

                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removerMusica(item.id)}
                  activeOpacity={0.7}
                >
                  <Icon name="close" size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            )}
            style={styles.flatList}
          />
        </Animated.View>

        {/* Área inferior fixa */}
        <View style={styles.bottomArea}>
          <TouchableOpacity
            onPress={() => navigation.navigate("PlayList")}
            style={[styles.checkButton, musicas.length === 0 && styles.checkButtonDisabled]}
            activeOpacity={0.8}
            disabled={musicas.length === 0}
          >
            <Icon name="play" size={28} color={colors.background} />
            <Text style={styles.playText}>Reproduzir</Text>
          </TouchableOpacity>
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
    paddingTop: SAFE_AREA_TOP,
  },
  headerContainer: {
    paddingHorizontal: spacing.medium,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(106, 93, 80, 0.1)',
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.medium,
    marginBottom: 1,
  },
  backButtonText: {
    marginLeft: spacing.small,
    color: colors.primary,
    fontWeight: '500',
    fontSize: 16,
  },
  titleContainer: {
    alignItems: 'center',

  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.small,
    textAlign: 'center',
  },
  borderDecoration: {
    height: 4,
    width: 80,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    padding: spacing.medium,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: 16,
    marginBottom: spacing.large,
    elevation: 4,
    shadowColor: colors.text,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonText: {
    ...typography.buttonText,
    marginLeft: spacing.small,
    fontSize: 16,
  },
  flatList: {
    flex: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 100, // Espaço para o botão inferior
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.large * 2,
  },
  emptyIcon: {
    opacity: 0.6,
    marginBottom: spacing.medium,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondary,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: spacing.large,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  firstListItem: {
    marginTop: spacing.small,
  },
  lastListItem: {
    marginBottom: spacing.medium,
  },
  musicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicIcon: {
    marginRight: spacing.small,
  },
  musicText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  removeButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.small,
  },
  bottomArea: {
    position: 'absolute',
    bottom: SAFE_AREA_BOTTOM,
    left: 0,
    right: 0,
    padding: spacing.medium,
    borderTopWidth: 1,
    borderColor: 'rgba(106, 93, 80, 0.1)',
    backgroundColor: colors.background,
    alignItems: "center",
  },
  checkButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.8,
    padding: spacing.medium,
    borderRadius: 30,
    elevation: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  checkButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  playText: {
    ...typography.buttonText,
    marginLeft: spacing.small,
    fontSize: 16,
  },
});