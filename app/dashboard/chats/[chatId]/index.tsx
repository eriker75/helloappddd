import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { useGetChatMessagesService, useSendMessageToChatService } from "@/src/presentation/services/ChatService";
import { useCurrentChatMessagesStore } from "@/src/presentation/stores/current-chat-messages.store";
import formatMessageTime from "@/src/utils/formatMessageTime";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet } from "react-native";

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

const ChatBubble = ({ text, fromMe, time }: { text: string; fromMe: boolean; time: string }) => (
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
      <Text style={fromMe ? styles.bubbleTextMe : styles.bubbleTextOther}>{text}</Text>
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
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
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
      <Pressable style={styles.imageButton}>
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

  // Use service hook for fetching and syncing messages
  // Use a selector that returns a stable array reference
  const storeMessages = useCurrentChatMessagesStore(
    (s: any) => s.orderedMessageIds.map((id: string) => s.messages[id])
  );
  const { isLoading, isError } = useGetChatMessagesService(chatId || "");

  // Use service hook for sending messages
  const { sendMessage, status } = useSendMessageToChatService(chatId || "");
  const isSending = status === "pending";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!storeMessages || storeMessages.length === 0) return;
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  }, [storeMessages, storeMessages.length]);

  const [input, setInput] = useState("");

  // Send handler using service
  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage({
      content: input.trim(),
      createdAt: new Date(),
      // Add other required fields as needed
    });
    setInput("");
  };

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
              keyExtractor={(item, idx) => item?.messageId ? String(item.messageId) : `msg-${idx}`}
              renderItem={({ item, index }) => (
                <Box>
                  {index === 0 && <DateSeparator label="Hoy" />}
                  <ChatBubble text={item.content || ""} fromMe={false} time={item.createdAt} />
                </Box>
              )}
              contentContainerStyle={styles.messagesContainer}
              showsVerticalScrollIndicator={false}
              inverted={true}
            />
          )}
          <ChatInputBar value={input} onChangeText={setInput} onSend={handleSend} sending={isSending} />
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
