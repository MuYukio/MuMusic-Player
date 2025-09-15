import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

import { carregarDados, inserir, remover } from "../config/database";

// Importe os estilos do seu arquivo de tema
import { globalStyles, colors, typography, spacing } from '../src/theme';

export default function Home({ navigation }) {
  const [musicas, setMusicas] = useState([]);

  useEffect(() => {
    const carregarMusicas = async () => {
      const salvas = await carregarDados();
      setMusicas(salvas || []);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topArea}>
        <TouchableOpacity onPress={escolherMusica} style={styles.addButton}>
          <Text style={styles.addButtonText}>Escolher Música</Text>
        </TouchableOpacity>

        <FlatList
          data={musicas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={styles.musicInfo}>
                <Text style={styles.musicText}>{item.nome}</Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removerMusica(item.id)}
              >
                <Text style={styles.removeButtonText}>
                  <Icon name="close" size={16} color={colors.background} />
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          onPress={() => navigation.navigate("PlayList")}
          style={styles.checkButton}
        >
          <Icon name="play" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Fundo de pergaminho
  },
  topArea: {
    flex: 1,
    padding: spacing.medium,
  },
  bottomArea: {
    padding: spacing.medium,
    borderTopWidth: 1,
    borderColor: colors.secondary, // Borda sutil
    backgroundColor: colors.background,
    alignItems: "center",
    marginBottom: spacing.large,
  },
  addButton: {
    backgroundColor: colors.primary, // Vermelho de outono
    padding: spacing.medium,
    borderRadius: 8,
    marginBottom: spacing.medium,
    alignItems: "center",
    elevation: 4,
    shadowColor: colors.text,
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addButtonText: {
    ...typography.buttonText,
    color: colors.background,
  },
  checkButton: {
    backgroundColor: colors.primary, // Vermelho para o botão de "play"
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.text,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
  },
  listContainer: {
    paddingBottom: spacing.large,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.secondary, // Marrom claro para o item da lista
    padding: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  musicInfo: {
    flex: 1,
  },
  musicText: {
    ...typography.text,
    color: colors.background, 
  },
  removeButton: {
    marginLeft: spacing.small,
    backgroundColor: colors.primary, 
    borderRadius: 20,
    padding: spacing.small,
  },
  removeButtonText: {
    color: colors.background,
    fontSize: 16,
  },
});