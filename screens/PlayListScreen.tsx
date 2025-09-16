import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  StatusBar,
  Platform
} from "react-native";
import { carregarDados } from "../config/database";
import { Audio } from "expo-av";
import { Feather, MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { globalStyles, colors, typography, spacing } from '../src/theme';
import Slider from '@react-native-community/slider';
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get('window');

// Verifica se é iPhone com notch
const isIphoneWithNotch = Platform.OS === 'ios' &&
  (height === 812 || width === 812 || height === 896 || width === 896 ||
    height === 844 || width === 844 || height === 926 || width === 926);

// Altura segura para evitar áreas de sistema
const SAFE_AREA_TOP = isIphoneWithNotch ? 44 : 30;
const SAFE_AREA_BOTTOM = isIphoneWithNotch ? 34 : 20;

export default function PlayListScreen() {
  const [lista, setLista] = useState<any[]>([]);
  const [som, setSom] = useState<Audio.Sound | null>(null);
  const [incremento, setIncremento] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [posicao, setPosicao] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const nav = useNavigation();



  const obterDuracaoMusica = async (uri: string): Promise<number> => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: false });
      const status = await sound.getStatusAsync();
      await sound.unloadAsync();
      
      if (status.isLoaded) {
        return status.durationMillis || 0;
      }
      return 0;
    } catch (error) {
      console.error("Erro ao obter duração:", error);
      return 0;
    }
  };

  useEffect(() => {
    const buscarMusicas = async () => {
      const resposta = await carregarDados();
      
      // Obter duração para cada música
      if (resposta) {
        const musicasComDuracao = await Promise.all(
          resposta.map(async (musica) => {
            const duracao = await obterDuracaoMusica(musica.uri);
            return { ...musica, duracao };
          })
        );
        
        setLista(musicasComDuracao);
      } else {
        setLista([]);
      }
      
      // Animação de entrada
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    };
    buscarMusicas();
  }, []);


  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (tocando && som) {
      interval = setInterval(async () => {
        if (som) {
          const status = await som.getStatusAsync();
          if (status.isLoaded) {
            setPosicao(status.positionMillis);
            setDuracao(status.durationMillis || 0);
          }
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tocando, som]);

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
        { uri: lista[index].uri }
      );

      setSom(sound);
      setIncremento(index);
      setTocando(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          return;
        }

        if (status.didJustFinish && status.isLoaded && !status.isLooping) {
          const proximoIndex = (index + 1) % lista.length;
          tocarMusica(proximoIndex);
        } else if (status.isLoaded) {
          setPosicao(status.positionMillis);
          setDuracao(status.durationMillis || 0);
        }
      });

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

  const formatTime = (millis: number) => {
    if (!millis) return "0:00";
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSliderChange = async (value: number) => {
    if (som) {
      await som.setPositionAsync(value);
      setPosicao(value);
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Icon name="playlist-music" size={60} color={colors.secondary} style={styles.emptyIcon} />
      <Text style={styles.emptyText}>Sua playlist está vazia</Text>
      <Text style={styles.emptySubtext}>Adicione músicas na tela inicial para começar</Text>
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
            <Text style={styles.title}>Playlist</Text>
            <View style={styles.borderDecoration} />
          </View>
        </View>

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <FlatList
            data={lista}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={lista.length === 0 ? styles.emptyListContainer : styles.listContainer}
            ListEmptyComponent={renderEmptyList}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.listItem,
                  index === 0 && styles.firstListItem,
                  index === lista.length - 1 && styles.lastListItem,
                  incremento === index && styles.musicPlaying
                ]}
                onPress={() => tocarMusica(index)}
              >
                <View style={styles.musicInfo}>
                  <View style={styles.musicIconContainer}>
                    {incremento === index ? (
                      <Icon name="play" size={16} color={colors.primary} style={styles.playingIcon} />
                    ) : (
                      <Text style={styles.trackNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.musicDetails}>
                    <Text
                      style={[
                        styles.musicText,
                        incremento === index && styles.musicPlayingText
                      ]}
                      numberOfLines={1}
                    >
                      {item.nome}
                    </Text>
                    <Text style={styles.trackDuration}>
                      {item.duracao ? formatTime(item.duracao) : "--:--"}
                    </Text>

                  </View>
                </View>
                {incremento === index && (
                  <Icon name="equalizer" size={20} color={colors.primary} style={styles.equalizerIcon} />
                )}
              </TouchableOpacity>
            )}
            style={styles.flatList}
          />
        </Animated.View>

        {/* Player Fixo na Parte Inferior */}
        {lista.length > 0 && (
          <View style={styles.playerContainer}>
            <View style={styles.nowPlayingContainer}>
              <Text style={styles.nowPlayingLabel}>TOCANDO AGORA</Text>
              <Text style={styles.nowPlayingText} numberOfLines={1}>
                {lista[incremento]?.nome || "Nenhuma música"}
              </Text>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(posicao)}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duracao}
                value={posicao}
                onSlidingComplete={handleSliderChange}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor="rgba(106, 93, 80, 0.3)"
                thumbTintColor={colors.primary}
              />
              <Text style={styles.timeText}>{formatTime(duracao)}</Text>
            </View>

            <View style={styles.controlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={anterior}>
                <Feather name="skip-back" size={28} color={colors.text} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                <Feather
                  name={tocando ? "pause" : "play"}
                  size={28}
                  color={colors.background}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={proxima}>
                <Feather name="skip-forward" size={28} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    paddingVertical: spacing.small,
    marginBottom: spacing.small,
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
    width: 60,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
    padding: spacing.medium,
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
    paddingBottom: 220,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.large * 2,
  },
  emptyIcon: {
    opacity: 0.7,
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
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.medium,
    marginBottom: spacing.small,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(106, 93, 80, 0.1)',
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
  musicPlaying: {
    backgroundColor: 'rgba(163, 59, 50, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  musicInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.small,
  },
  playingIcon: {
    marginRight: spacing.small,
  },
  trackNumber: {
    fontSize: 14,
    color: colors.secondary,
    opacity: 0.7,
  },
  musicDetails: {
    flex: 1,
  },
  musicText: {
    fontSize: 16,
    color: colors.text,
  },
  trackDuration: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: 2,
    opacity: 0.7,
  },
  musicPlayingText: {
    color: colors.primary,
    fontWeight: '600',
  },
  equalizerIcon: {
    marginLeft: spacing.small,
  },
  playerContainer: {
    position: 'absolute',
    bottom: SAFE_AREA_BOTTOM,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(242, 232, 215, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.large,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  nowPlayingContainer: {
    marginBottom: spacing.medium,
    alignItems: 'center',
  },
  nowPlayingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.secondary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  nowPlayingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: spacing.small,
  },
  timeText: {
    fontSize: 12,
    color: colors.secondary,
    width: 40,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: spacing.medium,
    backgroundColor: 'rgba(106, 93, 80, 0.1)',
    borderRadius: 30,
    marginHorizontal: spacing.small,
  },
  playButton: {
    padding: spacing.medium,
    backgroundColor: colors.primary,
    borderRadius: 30,
    marginHorizontal: spacing.small,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});