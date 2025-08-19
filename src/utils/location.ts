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

/**
 * Gets the current device location (latitude, longitude).
 * Requests permission if needed.
 * Throws an error if permission is denied or location cannot be obtained.
 */
export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  const permissionStatus = await requestLocationPermission();
  if (permissionStatus !== LocationPermissionStatuses.GRANTED) {
    throw new Error("Location permission not granted");
  }
  const location = await Location.getCurrentPositionAsync({});
  if (!location?.coords) {
    throw new Error("Unable to obtain location");
  }
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
