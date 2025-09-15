// src/styles/theme.ts
import { StyleSheet } from "react-native";

export const colors = {
  // Ocre ou bege de pergaminho, como base.
  background: "#F2E8D7", 

  // Vermelho escuro das folhas de outono e portões.
  primary: "#A33B32", 

  // Marrom acinzentado de tinta ou madeira.
  secondary: "#6A5D50", 

  // Marrom bem escuro para textos, para um contraste suave.
  text: "#3A2B20", 

  // Vermelho vibrante para botões e ações.
  button: "#BF4937", 
};

export const typography = {
  title: {
    fontSize: 22,
    fontWeight: "bold" as "bold",
    color: colors.text,
  },
  text: {
    fontSize: 16,
    color: colors.text,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold" as "bold",
    color: "#fff",
  },
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.medium,
  },
  button: {
    backgroundColor: colors.button,
    padding: spacing.medium,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    ...typography.buttonText,
  },
});