import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const isLoading = useAuthUserProfileStore((s) => s.isLoading);
  const isAuthenticated = useAuthUserProfileStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthUserProfileStore((s) => s.isOnboarded);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.message}>Cargando...</Text>
      </View>
    );
  }

  if (isAuthenticated) {
    if (isOnboarded) {
      return <Redirect href="/dashboard/radar" />;
      // return <Redirect href="/queries" />;
    } else {
      return <Redirect href="/onboarding" />;
    }
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  message: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
});
