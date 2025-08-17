import * as Location from "expo-location";
import { Alert, Linking } from "react-native";
import { LocationPermissionStatuses } from "../definitions/enums/LocationPermissionStatuses.enum";

export const requestLocationPermission =
  async (): Promise<LocationPermissionStatuses> => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      if (status === "denied") {
        manualPermissionRequest();
      }
      return LocationPermissionStatuses.DENIED;
    }

    return LocationPermissionStatuses.GRANTED;
  };

export const checkLocationPermission = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();

  switch (status) {
    case "granted":
      return LocationPermissionStatuses.GRANTED;
    case "denied":
      return LocationPermissionStatuses.DENIED;
    default:
      return LocationPermissionStatuses.UNDETERMINED;
  }
};

export const manualPermissionRequest = async () => {
  Alert.alert(
    "Permiso de ubicacion necesario",
    "Para continuar debe habilitar el permiso de laclizacion",
    [
      {
        text: "Abrir ajustes",
        onPress: () => {
          Linking.openSettings();
        },
      },
      {
        text: "Cancel",
        style: "destructive",
      },
    ]
  );
};
