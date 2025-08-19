import { Text } from "@/components/ui";
import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//import { useUpdateUserLocation } from "@/src/hooks/useUpdateUserLocation";

export default function DashboardLayout() {
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const [isRadarActive, setIsRadarActive] = useState(false);

  //const updateUserLocation = useUpdateUserLocation();

  useEffect(() => {
    const currentSegment = segments[segments.length - 1];
    console.log("[DashboardLayout] segments:", segments, "currentSegment:", currentSegment);
    setIsRadarActive(currentSegment === "radar");
  }, [segments]);

  useEffect(() => {
    console.log("[DashboardLayout] isRadarActive changed:", isRadarActive);
    if (isRadarActive) {
      console.log("[DashboardLayout] Calling updateUserLocation()");
      //updateUserLocation();
    }
    // Only run when radar becomes active
    /// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRadarActive]);

  const radarTabBarStyle = {
    backgroundColor: "#5BC6EA", // Fondo azul claro
    borderTopWidth: 0, // Eliminar borde superior
  };

  // Estilos normales
  const normalTabBarStyle = {
    backgroundColor: colorScheme === "dark" ? "#121212" : "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colorScheme === "dark" ? "#333" : "#E5E7EB",
  };

  // Dynamic tab bar style with safe area insets
  // Raise the tab bar further to avoid overlap with system navigation
  const extraBottomPadding = 10;
  const dynamicTabBarStyle = {
    paddingBottom: insets.bottom + extraBottomPadding,
    paddingTop: 8,
    minHeight: 56 + insets.bottom + extraBottomPadding,
    height: undefined, // Let content and minHeight control the height
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isRadarActive ? "white" : "#5BC6EA",
        tabBarInactiveTintColor: isRadarActive
          ? "rgba(255,255,255,0.7)" // Mejor contraste para iconos inactivos
          : colorScheme === "dark"
          ? "#9CA3AF"
          : "#64748B",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          marginBottom: 4,
          // color removed for coherence, handled in custom label
        },
        tabBarStyle: [
          dynamicTabBarStyle,
          isRadarActive ? radarTabBarStyle : normalTabBarStyle,
        ],
      }}
    >
      <Tabs.Screen
        name="swipe"
        options={{
          title: "Swipe",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                isRadarActive && !focused ? styles.inactiveIcon : undefined
              }
            >
              <MaterialIcons
                name="web-stories"
                size={24}
                color={isRadarActive ? "white" : color}
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Swipe
            </Text>
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="radar"
        options={{
          title: "Radar",
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.radarIconContainer}>
              <MaterialIcons
                name="radar"
                size={focused ? 32 : 24}
                color={isRadarActive ? "white" : color}
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Radar
            </Text>
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={
                isRadarActive && !focused ? styles.inactiveIcon : undefined
              }
            >
              <MaterialIcons
                name="chat-bubble"
                size={24}
                color={isRadarActive ? "white" : color}
              />
            </View>
          ),
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={{
                color,
                fontWeight: "bold",
                fontSize: 12,
                marginBottom: 4,
              }}
            >
              Chat
            </Text>
          ),
          headerShown: false,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="[chatId]/index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  radarIconContainer: {
    marginTop: -10, // Levanta el ícono
  },
  inactiveIcon: {
    opacity: 0.7, // Transparencia para iconos inactivos en vista radar
  },
});
