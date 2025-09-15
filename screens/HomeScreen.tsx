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

import { carregarDados, inserir, limparBanco, remover } from "../config/database";

export default function Home({ navigation }) {

  const [musicas, setMusicas] = useState([]);


  useEffect(() => {
    const carregarMusicas = async () => {
      const salvas = await carregarDados();
      setMusicas(salvas || [])
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
        await inserir(arq.name, arq.uri)
    }

    const atualizadas = await carregarDados()
    setMusicas(atualizadas);
  }


  const removerMusica = async (id: number) => {
    await remover(id);
    const atualizadas = await carregarDados();
    setMusicas(atualizadas)
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topArea}>
        <TouchableOpacity onPress={escolherMusica}>
          <Text style={styles.addButtonText}>Escolher música</Text>
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
                <Text style={styles.removeButtonText}> X </Text>
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
          <Icon name="check" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  topArea: {
    flex: 1,
    padding: 20,
  },
  bottomArea: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFF",
    alignItems: "center",
    marginBottom: 40
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  addButtonText: {
    color: "#3519b4",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 20,
  },
  checkButton: {
    backgroundColor: "#2196F3",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 10,
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
    fontSize: 16,
    color: "#333",
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: "#E53935",
    borderRadius: 20,
    padding: 8,
  },
  removeButtonText: {
    color: "#FFF",
    fontSize: 16,
  },
});

