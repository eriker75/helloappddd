import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";
import { Image } from "@/components/ui/image";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import type { MessageContentType } from "@/src/definitions/types/MessageContent.type";
import type { Message } from "@/src/domain/entities/Message";
import { useGetChatMessagesService, useSendMessageToChatService } from "@/src/presentation/services/ChatService";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useCurrentChatMessagesStore } from "@/src/presentation/stores/current-chat-messages.store";
import formatMessageTime from "@/src/utils/formatMessageTime";
import { pickAndUploadChatImageS3 } from "@/src/utils/uploadImageToSupabase";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from "react-native";

// --- New: Image handler logic ---


const ChatHeader = () => (
  <Box style={styles.header}>
    <HStack
      space="md"
      style={{
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
      }}
    >
      <Pressable
        onPress={() => {
          router.replace({ pathname: "/dashboard/chats" });
        }}
      >
        <MaterialIcons name="arrow-back" size={24} color="#222" />
      </Pressable>
      <VStack style={{ flex: 1, alignItems: "center" }}>
        <Text style={styles.headerName}>Chat</Text>
      </VStack>
      <Pressable>
        <MaterialIcons name="more-vert" size={24} color="#222" />
      </Pressable>
    </HStack>
  </Box>
);

const DateSeparator = ({ label }: { label: string }) => (
  <Box style={styles.dateSeparator}>
    <Text style={styles.dateSeparatorText}>{label}</Text>
  </Box>
);

const ChatBubble = ({
  children,
  text,
  fromMe,
  time,
}: {
  children?: React.ReactNode;
  text?: string;
  fromMe: boolean;
  time: string;
}) => (
  <HStack
    space="md"
    style={{
      marginVertical: 2,
      marginHorizontal: 8,
      justifyContent: fromMe ? "flex-end" : "flex-start",
    }}
  >
    <Box
      style={[
        styles.bubble,
        fromMe ? styles.bubbleMe : styles.bubbleOther,
        { alignSelf: fromMe ? "flex-end" : "flex-start" },
      ]}
    >
      {children ?? (
        <>
          <Text style={fromMe ? styles.bubbleTextMe : styles.bubbleTextOther}>{text}</Text>
        </>
      )}
      <Text
        style={{
          fontSize: 11,
          color: fromMe ? "#e0f7fa" : "#b0bfc6",
          marginTop: 2,
          textAlign: "right",
        }}
      >
        {formatMessageTime(time)}
      </Text>
    </Box>
  </HStack>
);

const ChatInputBar = ({
  value,
  onChangeText,
  onSend,
  sending,
  onSendImage,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  onSendImage?: () => void;
}) => {
  const [inputHeight, setInputHeight] = React.useState(40);

  return (
    <HStack style={[styles.inputBar, { alignItems: "center" }]} space="md">
      <Box style={styles.inputContainer}>
        <Textarea
          size="md"
          variant="default"
          className="text-base px-1 py-1 outline-none border-none"
          style={{ borderColor: "transparent", minHeight: 40, height: inputHeight, maxHeight: 120 }}
        >
          <TextareaInput
            placeholder="Escribe algo genial..."
            value={value}
            onChangeText={onChangeText}
            editable={!sending}
            onSubmitEditing={onSend}
            returnKeyType="send"
            numberOfLines={1}
            className="outline-none border-none"
            multiline
            onContentSizeChange={(e) => {
              const newHeight = Math.max(40, Math.min(e.nativeEvent.contentSize.height, 120));
              setInputHeight(newHeight);
            }}
            style={{ minHeight: 40, height: inputHeight, maxHeight: 120 }}
          />
        </Textarea>
      </Box>
      <Pressable style={styles.imageButton} onPress={onSendImage}>
        <MaterialIcons name="image" size={22} color="#666" />
      </Pressable>
      <Pressable style={styles.sendButton} onPress={onSend} disabled={sending || !value.trim()}>
        <MaterialIcons name="send" size={22} color="#fff" />
      </Pressable>
    </HStack>
  );
};

const ChatScreen = () => {
  const flatListRef = useRef<FlatList>(null);
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  // Current authenticated userId for my/other bubble
  const myUserId = useAuthUserProfileStore((s) => s.userId);

  // Use service hook for fetching and syncing messages
  // Use a selector that returns a stable array reference
  // FIX 1: Use stable selectors and memoized messages array
  const messagesObject = useCurrentChatMessagesStore((s) => s.messages);
  const orderedMessageIds = useCurrentChatMessagesStore((s) => s.orderedMessageIds);

  // FIX 2: Memoize storeMessages to avoid unstable array refs
  const storeMessages = React.useMemo(
    () => orderedMessageIds.map((id: string) => messagesObject[id]).filter(Boolean),
    [messagesObject, orderedMessageIds]
  );

  const { isLoading, isError } = useGetChatMessagesService(chatId || "");

  // Use service hook for sending messages
  const { sendMessage, status } = useSendMessageToChatService(chatId || "");
  const isSending = status === "pending";

  // FIX 3: Memoize scrollToBottom callback
  const scrollToBottom = React.useCallback(() => {
    if (storeMessages.length > 0) {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  }, [storeMessages.length]);

  // FIX 4: Auto-scroll effect with small delay
  const messagesLength = storeMessages.length;
  React.useEffect(() => {
    if (messagesLength > 0) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messagesLength, scrollToBottom]);

  const [input, setInput] = useState("");

  // FIX 5: Memoize send handler
  const handleSend = React.useCallback(() => {
    console.log("[ChatScreen] handleSend called", { input, isSending, chatId });
    if (!input.trim() || isSending) {
      console.log("[ChatScreen] Aborted send, empty input or already sending.");
      return;
    }
    const messageToSend = {
      content: input.trim(),
      createdAt: new Date(),
      messageId: `temp-${Date.now()}`,
      status: "sending",
      type: "text" as MessageContentType,
      chatId: chatId || "",
      senderId: myUserId,
    };
    console.log("[ChatScreen] sendMessage invoked with:", messageToSend);
    sendMessage(messageToSend);
    setInput("");
  }, [input, isSending, chatId, myUserId, sendMessage]);

  // Image send handler (inside ChatScreen for correct scope)
  // Image send handler using DRY helper
  const handleSendImage = React.useCallback(async () => {
    try {
      const imageUrl = await pickAndUploadChatImageS3(chatId || "", myUserId);
      if (!imageUrl) return;
      // Send image chat message as before
      sendMessage({
        content: imageUrl,
        createdAt: new Date(),
        messageId: `temp-${Date.now()}`,
        status: "sending",
        type: "image" as MessageContentType,
        chatId: chatId || "",
        senderId: myUserId,
      });
    } catch (err) {
      console.error("Image message send error:", err);
    }
  }, [chatId, myUserId, sendMessage]);

  // FIX: Memoized FlatList item/keys to comply with hooks rules and static typing
  const keyExtractor = React.useCallback(
    (item: Message, idx: number) => (item && item.messageId ? String(item.messageId) : `msg-${idx}`),
    []
  );

  const renderItem = React.useCallback(
    ({ item, index }: { item: Message; index: number }) =>
      item ? (
        <Box>
          {index === 0 && <DateSeparator label="Hoy" />}
          {item.type === "image" ? (
            <ChatBubble
              fromMe={item.senderId === myUserId}
              time={
                item.createdAt instanceof Date
                  ? item.createdAt.toISOString()
                  : typeof item.createdAt === "string"
                  ? item.createdAt
                  : String(item.createdAt)
              }
            >
              {item.content ? (
                <Image
                  source={{ uri: item.content }}
                  size="md"
                  style={{
                    borderRadius: 12,
                    maxWidth: 240,
                    maxHeight: 240,
                    aspectRatio: 1,
                    backgroundColor: "#d3eaf5",
                  }}
                  resizeMode="cover"
                  alt="Imagen enviada"
                />
              ) : (
                <Text style={{ color: '#f00', fontStyle: 'italic' }}>Imagen no disponible</Text>
              )}
            </ChatBubble>
          ) : (
            <ChatBubble
              text={item.content || ""}
              fromMe={item.senderId === myUserId}
              time={
                item.createdAt instanceof Date
                  ? item.createdAt.toISOString()
                  : typeof item.createdAt === "string"
                  ? item.createdAt
                  : String(item.createdAt)
              }
            />
          )}
        </Box>
      ) : null,
    [myUserId]
  );

  console.log(JSON.stringify(storeMessages, null, 2));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={8}
      >
        <Box style={styles.container}>
          <ChatHeader />
          {isLoading ? (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Cargando mensajes...</Text>
            </Box>
          ) : isError ? (
            <Box
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text>Error cargando mensajes</Text>
            </Box>
          ) : (
            <FlatList
              ref={flatListRef}
              data={storeMessages}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              // Standard top-down chat: show from top, newest at bottom
              inverted={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={10}
              initialNumToRender={20}
            />
          )}
          <ChatInputBar
            value={input}
            onChangeText={setInput}
            onSend={handleSend}
            sending={isSending}
            onSendImage={handleSendImage}
          />
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    backgroundColor: "#EAF9FE",
    borderBottomWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    elevation: 0,
    zIndex: 2,
  },
  headerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginLeft: 8,
    fontFamily: "Poppins-SemiBold",
  },
  dateSeparator: {
    alignSelf: "center",
    backgroundColor: "#f2f6f8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginVertical: 8,
  },
  dateSeparatorText: {
    color: "#b0bfc6",
    fontSize: 13,
    fontFamily: "Poppins-Regular",
  },
  messagesContainer: {
    paddingVertical: 8,
    paddingBottom: 60,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 2,
  },
  bubbleMe: {
    backgroundColor: "#5BC6EA",
    borderTopRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#F7F9FA",
    borderTopLeftRadius: 4,
  },
  bubbleTextMe: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  bubbleTextOther: {
    color: "#222",
    fontSize: 15,
    fontFamily: "Poppins-Regular",
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    zIndex: 3,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#e0e7ef",
  },
  textInput: {
    fontSize: 15,
    color: "#222",
    fontFamily: "Poppins-Regular",
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  imageButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 24,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#e0e7ef",
  },
  sendButton: {
    backgroundColor: "#5BC6EA",
    borderRadius: 24,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;
