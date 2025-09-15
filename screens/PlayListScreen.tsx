import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
} from "react-native";
import { carregarDados } from "../config/database";
import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { globalStyles, colors, typography, spacing } from '../src/theme' 

export default function PlayListScreen() {
  const [lista, setLista] = useState<any[]>([]);
  const [som, setSom] = useState<Audio.Sound | null>(null);
  const [incremento, setIncremento] = useState(0);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const buscarMusicas = async () => {
      const resposta = await carregarDados();
      setLista(resposta);
    };
    buscarMusicas();
  }, []);

  useEffect(() => {
    return () => {
      if (som) {
        (async () => {
          try {
            await som.unloadAsync();
          } catch (e) {
            console.log("Erro ao descarregar som:", e);
          }
        })();
      }
    };
  }, [som]);

  const tocarMusica = async (index: number) => {
    try {
      if (som) {
        await som.unloadAsync();
        setSom(null);
        setTocando(false);
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: lista[index].uri });
      setSom(sound);
      setIncremento(index);
      setTocando(true)

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }

        if (status.didJustFinish && status.isLoaded && !status.isLooping) {
          const proximoIndex = (index + 1) % lista.length
          tocarMusica(proximoIndex);
        }
      })

      await sound.playAsync();
    } catch (error) {
      console.error("Erro ao tocar música:", error);
    }
  };

  const togglePlayPause = async () => {
    if (!som) {
      if (lista.length > 0) {
        tocarMusica(incremento);
      }
      return;
    }

    if (tocando) {
      await som.pauseAsync();
      setTocando(false);
    } else {
      await som.playAsync();
      setTocando(true);
    }
  };

  const proxima = async () => {
    if (lista.length === 0) return;
    const proximoIndex = (incremento + 1) % lista.length;
    tocarMusica(proximoIndex);
  };

  const anterior = async () => {
    if (lista.length === 0) return;
    const anteriorIndex = (incremento - 1 + lista.length) % lista.length;
    tocarMusica(anteriorIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={lista}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.listItem, incremento === index && styles.musicPlaying]}
            onPress={() => tocarMusica(index)}
          >
            <Text
              style={[
                typography.text,
                incremento === index ? styles.musicPlayingText : null
              ]}
            >
              {item.nome}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.nowPlayingContainer}>
        <Text style={styles.nowPlayingText}>
          {lista.length > 0 ? lista[incremento].nome : "Nenhuma música"}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.buttonNext} onPress={anterior}>
          <Feather name="skip-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPlay} onPress={togglePlayPause}>
          <Feather name={tocando ? "pause" : "play"} size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonNext} onPress={proxima}>
          <Feather name="skip-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, 
    padding: spacing.medium,
  },
  listContainer: {
    paddingBottom: 180, 
  },
  listItem: {
    padding: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  musicPlaying: {
    backgroundColor: colors.primary,
  },
  musicPlayingText: {
    color: "#fff",
    fontWeight: "bold",
  },
  nowPlayingContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.large,
  },
  nowPlayingText: {
    ...typography.title,
    textAlign: "center",
    marginBottom:300,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    bottom: 50,
  },
  buttonPlay: {
    padding: spacing.medium,
    backgroundColor: colors.button,
    borderRadius: 50,
    marginHorizontal: spacing.medium,
  },
  buttonNext: {
    padding: spacing.medium,
    backgroundColor: colors.secondary,
    borderRadius: 50,
  },
});