import CheckDone from "@/assets/images/check_done.svg";
import CheckDouble from "@/assets/images/check_double.svg";
import CheckSmall from "@/assets/images/check_small.svg";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useGetChatsService } from "@/src/presentation/services/ChatService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import formatMessageTime from "@/src/utils/formatMessageTime";
import { logWithColor } from "@/src/utils/logWithColor";
import { useRouter } from "expo-router";
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ChatsNotFound = require("@/assets/images/ChatsNotFound.png");
const DefaultProfileImg = require("@/assets/images/avatar-placeholder.png");

const MessageStatusIcon = ({ status }: { status: string }) => {
  if (status === "sent") return <CheckSmall />;
  if (status === "delivered") return <CheckDouble />;
  if (status === "read") return <CheckDone />;
  return null;
};

type ChatListItemProps = {
  id: string;
  name: string;
  avatar: string;
  loading?: boolean;
  lastMessage: string;
  lastMessageStatus: "sent" | "delivered" | "read" | "none";
  time: string;
  unread: number;
  isMe: boolean;
  onPress: (id: string) => void;
};

const ChatListItem = ({
  id,
  name,
  avatar,
  loading,
  lastMessage,
  lastMessageStatus,
  time,
  unread,
  isMe,
  onPress,
}: ChatListItemProps) => (
  <TouchableOpacity onPress={() => onPress(id)} activeOpacity={0.7} className="bg-[#eaf8fc] pt-3">
    <HStack
      style={{
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        backgroundColor: "#fff",
      }}
    >
      <Avatar size="lg" style={{ marginRight: 12 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#4fc3f7" />
        ) : typeof avatar === "string" ? (
          <AvatarImage source={{ uri: avatar }} />
        ) : (
          <AvatarImage source={avatar} />
        )}
      </Avatar>
      <VStack style={{ flex: 1 }}>
        <HStack style={{ alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>{name}</Text>
          <Text style={{ color: "#b0b0b0", fontSize: 12 }}>
            {time && !isNaN(new Date(time).getTime()) ? formatMessageTime(time) : "—"}
          </Text>
        </HStack>
        <HStack style={{ alignItems: "center", marginTop: 2 }}>
          {/* Check de estado alineado a la derecha */}
          <View style={{ marginLeft: 6, minWidth: 20 }}>
            <MessageStatusIcon status={lastMessageStatus} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: "#757575",
              fontSize: 13,
              flex: 1,
            }}
          >
            {lastMessage}
          </Text>

          {unread > 0 && (
            <View
              style={{
                backgroundColor: "#4fc3f7",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 8,
                paddingHorizontal: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>{unread}</Text>
            </View>
          )}
        </HStack>
      </VStack>
    </HStack>
  </TouchableOpacity>
);

const ChatScreen = () => {
  const router = useRouter();
  const { avatar, isLoading: isUserLoading } = useAuthUserProfileStore();
  const { chats, isLoading, isError } = useGetChatsService();

  logWithColor(chats, "red");

  const handleChatPress = (id: string) => {
    // Use object navigation if supported by Expo Router, otherwise fallback to any
    // @ts-expect-error: dynamic navigation
    router.push({ pathname: "/dashboard/chats/[id]", params: { id } });
  };

  const { width } = Dimensions.get("window");
  const imageWidth = width * 0.5;
  const imageHeight = imageWidth * 1.1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eaf8fc" }}>
      {/* Header */}
      <HStack
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          backgroundColor: "#eaf8fc",
        }}
      >
        <Text style={{ fontWeight: "bold", fontSize: 26, color: "#222" }}>Chats</Text>
        <Pressable onPress={() => router.push("/dashboard/profile")}>
          <Avatar size="md">
            <AvatarImage source={avatar ? { uri: avatar } : DefaultProfileImg} />
          </Avatar>
        </Pressable>
      </HStack>
      {/* Chat List or Empty State */}
      {isUserLoading || isLoading ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          {/* Circular progress spinner */}
          <Spinner size="large" color="#4fc3f7" />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text>{"Error cargando chats"}</Text>
        </View>
      ) : !chats || chats.length === 0 ? (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          <Image
            source={ChatsNotFound}
            style={{
              width: imageWidth,
              height: imageHeight,
              resizeMode: "contain",
              marginBottom: 32,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              color: "#444",
              textAlign: "center",
              marginBottom: 0,
            }}
          >
            ¡Tu bandeja está vacía! Pero no por mucho... empieza a conectar 😉
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(chat: any, index: number) => chat.chatId}
          renderItem={({ item: chat }: { item: any }) => {
            // Show profile alias/avatar for private chats if available
            let name;
            let avatar;
            if (
              chat.type === "private" &&
              chat.otherUserProfile &&
              typeof chat.otherUserProfile === "object" &&
              chat.otherUserProfile.alias
            ) {
              name = chat.otherUserProfile.alias;
              avatar =
                chat.otherUserProfile.avatar && typeof chat.otherUserProfile.avatar === "string"
                  ? chat.otherUserProfile.avatar
                  : DefaultProfileImg;
            } else {
              name = chat.name || "Chat";
              avatar =
                chat.image && typeof chat.image === "string" && chat.image.length > 0
                  ? chat.image
                  : DefaultProfileImg;
            }
            const last = {
              text: chat.lastMessageContent,
              // isMe cannot be determined in chat list, unless we have last message sender info (optional: add logic with your user id)
              status: chat.lastMessageStatus as "sent" | "delivered" | "read" | "none",
              time: chat.lastMessageCreatedAt,
            };
            const unread = chat.unreadedCount || 0;

            return (
              <ChatListItem
                id={chat.chatId}
                name={name}
                avatar={avatar}
                loading={false}
                lastMessage={last.text && last.text.trim() !== "" ? last.text : "No messages yet"}
                lastMessageStatus={last.status}
                time={last.time}
                unread={unread}
                isMe={false}
                onPress={handleChatPress}
              />
            );
          }}
          style={{ flex: 1, backgroundColor: "#fff" }}
        />
      )}
    </SafeAreaView>
  );
};

export default ChatScreen;
