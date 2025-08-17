import { showMessage as flashMessage } from "react-native-flash-message";

type MessageType = "success" | "warning" | "danger" | "info";

interface NotificationColors {
  [key: string]: {
    background: string;
    text: string;
  };
}

const COLORS: NotificationColors = {
  success: {
    background: "#4CAF50",
    text: "#FFFFFF",
  },
  warning: {
    background: "#FF9800",
    text: "#FFFFFF",
  },
  danger: {
    background: "#F44336",
    text: "#FFFFFF",
  },
  info: {
    background: "#2196F3",
    text: "#FFFFFF",
  },
};

export const showMessage = (
  type: MessageType,
  title: string,
  message: string,
  duration: number = 3000,
  showAlert: boolean = true
) => {
  // Console logs only in development
  if (__DEV__) {
    const timestamp = new Date().toISOString();
    const icons = {
      success: "✅",
      warning: "⚠️",
      danger: "❌",
      info: "ℹ️",
    };
    console.log(
      `${
        icons[type]
      } [${timestamp}] ${type.toUpperCase()}: ${title} - ${message}`
    );
  }

  // Visual alert if show is true
  if (showAlert) {
    flashMessage({
      message: title,
      description: message,
      type: type === "danger" ? "danger" : type, // mapping of type
      duration: duration,
      statusBarHeight: 50,
      icon: type === "danger" ? "danger" : type, // icon based in type
      backgroundColor: COLORS[type].background,
      color: COLORS[type].text,
      style: {
        borderRadius: 8,
        marginHorizontal: 8,
        marginTop: 8,
      },
      titleStyle: {
        fontSize: 16,
        fontWeight: "bold",
      },
      textStyle: {
        fontSize: 14,
      },
      floating: true,
    });
  }
};

// Función helper para mostrar errores
export const showError = (
  title: string,
  message: string = "Ha ocurrido un error inesperado"
) => {
  showMessage("danger", title, message, 4000);
};

// Función helper para mostrar éxitos
export const showSuccess = (
  title: string,
  message: string = "Operación completada con éxito"
) => {
  showMessage("success", title, message, 2000);
};

// Función helper para mostrar advertencias
export const showWarning = (
  title: string,
  message: string = "Presta atención a esta advertencia"
) => {
  showMessage("warning", title, message, 3000);
};

// Función helper para mostrar información
export const showInfo = (
  title: string,
  message: string = "Información importante"
) => {
  showMessage("info", title, message, 2000);
};
