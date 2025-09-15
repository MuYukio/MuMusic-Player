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

  useEffect(() =>{
    return () => {
      if(som){
        (async () => {
          try {
            await som.unloadAsync();         
          } catch (e){
            console.log("Erro ao descarregar som:",e)
          }
        })();
      }
    };
    
  },[som])

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

        if (!status.isLoaded){
          return;
        }


        if (status.didJustFinish && status.isLoaded && !status.isLooping){
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
          <View style={styles.listItem}>
            <TouchableOpacity onPress={() => tocarMusica(index)}>
              {incremento === index ? (
                <View style={styles.musicTocando}>
                  <Text>{item.nome}</Text>
                </View>
              ) : (
                <View style={styles.view}>
                  <Text>{item.nome}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.buttonNext} onPress={anterior}>
        <Feather name="skip-back" size={20} color="#000000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonPlay} onPress={togglePlayPause}>
        {tocando ? (
          <View style={styles.view}>
            <Feather name="pause" size={20} color={"black"} />
            <Text>Pausar</Text>
          </View>
        ) : (
          <View style={styles.view}>
            <Feather name="play" size={20} color={"black"} />
            <Text>Play</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonNext} onPress={proxima}>
        <Feather name="skip-forward" size={20} color="#000000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 100,
    gap: 10,
  },
  buttonPlay: {
    padding: 20,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  buttonNext: {
    padding: 20,
    backgroundColor: "#ccc",
    borderRadius: 10,
  },
  view: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
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
  musicTocando: {
    backgroundColor: "#15fa00ff",
  },
});
