import { format, isToday, isYesterday } from "date-fns";
import { es } from "date-fns/locale";

export default function formatMessageTime(dateString: string) {
  // Always parse as UTC
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) {
    return "Ahora";
  }
  if (diffMin < 5) {
    return `Hace ${diffMin} min.`;
  }
  if (diffMin < 60 && isToday(date)) {
    return `Hace ${diffMin} min.`;
  }
  if (isToday(date)) {
    return format(date, "HH:mm", { locale: es });
  }
  if (isYesterday(date)) {
    return "Ayer";
  }
  return format(date, "dd/MM/yy HH:mm", { locale: es });
}
