import { OnboardingScreenLayout } from "@/components/layouts/OnboardingScreenLayout";
import { router } from "expo-router";
import { ScrollView, Text, View } from "react-native";

const TermsAndConditionsScreen = () => {
  return (
    <OnboardingScreenLayout
      showBackButton
      footerButtonText="Aceptar"
      isStepValidated={true}
      onFooterButtonPress={() => router.back()}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-6 text-center">
          Términos y Condiciones
        </Text>

        <Text className="text-sm text-gray-500 mb-6 text-center">
          Última actualización: [colocar fecha de lanzamiento de la app]
        </Text>

        <Text className="text-base mb-6">
          Bienvenido a Hola, una aplicación diseñada para ayudarte a conocer
          nuevas personas cerca de ti. Al usar esta aplicación, aceptas los
          siguientes términos:
        </Text>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            1. ACEPTACIÓN DE LOS TÉRMINOS
          </Text>
          <Text className="text-base">
            Al descargar, registrarte o usar Hola, aceptas cumplir con estos
            Términos y Condiciones. Si no estás de acuerdo, por favor no uses la
            app.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            2. USO DE LA APLICACIÓN
          </Text>
          <Text className="text-base">
            Hola es una app para conocer personas mediante geolocalización. El
            servicio está dirigido a personas mayores de 18 años. No está
            permitido usar la app si eres menor de edad.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">3. REGISTRO Y ACCESO</Text>
          <Text className="text-base">
            Para usar Hola, puedes registrarte mediante tu cuenta de Google. Al
            hacerlo, aceptas compartir datos como tu nombre, foto de perfil,
            correo electrónico y ubicación aproximada.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            4. PRIVACIDAD Y UBICACIÓN
          </Text>
          <Text className="text-base">
            Usamos tu ubicación únicamente para mostrarte personas cercanas.
            Esta información no será compartida con otros usuarios ni con
            terceros sin tu consentimiento. Consulta nuestra Política de
            Privacidad para más detalles.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            5. CONDUCTA DEL USUARIO
          </Text>
          <Text className="text-base mb-2">
            Te comprometes a usar Hola de forma respetuosa. Está prohibido:
          </Text>
          <Text className="text-base ml-4 mb-1">
            • Publicar contenido ofensivo, sexual, violento o discriminatorio
          </Text>
          <Text className="text-base ml-4 mb-1">• Suplantar identidades</Text>
          <Text className="text-base ml-4 mb-2">
            • Usar la app para actividades ilegales
          </Text>
          <Text className="text-base">
            Nos reservamos el derecho de suspender o eliminar cuentas que violen
            estas normas.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            6. CONTENIDO DE USUARIOS
          </Text>
          <Text className="text-base">
            Eres responsable del contenido que publiques (fotos, descripciones,
            etc.). Nos autorizas a mostrar dicho contenido dentro de la app para
            el funcionamiento del servicio.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            7. LIMITACIÓN DE RESPONSABILIDAD
          </Text>
          <Text className="text-base">
            Hola no garantiza que vayas a conocer personas específicas ni se
            responsabiliza por interacciones fuera de la plataforma. El uso de
            la app es bajo tu propio riesgo.
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">
            8. CAMBIOS EN LOS TÉRMINOS
          </Text>
          <Text className="text-base">
            Podemos actualizar estos Términos en cualquier momento. Te
            notificaremos sobre cambios importantes. El uso continuo de la app
            implica la aceptación de las modificaciones.
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">9. CONTACTO</Text>
          <Text className="text-base">
            Si tienes preguntas o sugerencias, puedes escribirnos a:
          </Text>
          <Text className="text-base font-medium mt-2">
            📧 contacto@holaapp.com
          </Text>
          <Text className="text-xs text-gray-500 mt-1">
            (ejemplo, cambia por el real)
          </Text>
        </View>
      </ScrollView>
    </OnboardingScreenLayout>
  );
};

export default TermsAndConditionsScreen;
