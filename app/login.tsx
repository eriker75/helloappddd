import GoogleLogo from "@/assets/images/GoogleLogo.svg";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { useGoogleAuth } from "@/src/presentation/hooks/useGoogleAuth";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const RadarLoginImg = require("@/assets/images/RadarLoginImg.png");

const Login = () => {
  const screenHeight = Dimensions.get("window").height;
  const {
    signIn: signInWithGoogle,
    isLoading: isLoadingGoogleLogin,
    error: googleError,
  } = useGoogleAuth();

  const userProfile = useAuthUserProfileStore((state) => state);

  const handleLoginWithGoogleBtn = async () => {
    const success = await signInWithGoogle();
    if (success) {
      console.log(JSON.stringify(userProfile, null, 2));
      setTimeout(() => {
        if (userProfile?.isOnboarded) {
          router.push("/dashboard/radar");
        } else {
          router.push("/onboarding");
        }
      }, 100);
    }
  };

  if (googleError) {
    console.log(googleError);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#7CDAF9] px-6 justify-between">
      <StatusBar style="dark" />

      <Box className="mt-10">
        <Text className="text-white text-4xl font-bold mb-2 font-poppins">
          ¡Hola!
        </Text>
        <Text className="text-white text-4xl font-semibold font-poppins">
          Tu nueva forma de{"\n"}conocer gente
        </Text>
      </Box>

      <Box className="items-center justify-center flex-grow max-w-full">
        <Image
          source={RadarLoginImg}
          style={{
            width: "100%",
            height: screenHeight * 0.5,
            maxHeight: 400,
          }}
          resizeMode="contain"
        />
      </Box>

      <Box className="mb-10 items-center">
        <Text className="text-white text-center text-lg mb-4 font-poppins font-normal">
          Haz nuevos amigos cerca de ti, sin presión,{"\n"}
          sin drama, solo buena onda.{"\n"}
          Somos para gente real, como tú.
        </Text>

        <Text className="text-white text-lg mb-2 font-poppins text-center font-bold w-full mt-4">
          Regístrate o inicia sesión
        </Text>

        <Pressable
          className="flex-row bg-white shadow max-w-96 mx-auto w-full h-14 px-6 py-3 rounded-full items-center justify-center"
          onPress={handleLoginWithGoogleBtn}
          disabled={isLoadingGoogleLogin}
        >
          <GoogleLogo />
          <Text className="font-medium text-lg text-black font-poppins ml-2">
            Iniciar con Google
          </Text>
        </Pressable>
      </Box>
    </SafeAreaView>
  );
};

export default Login;
