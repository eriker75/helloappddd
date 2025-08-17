import type { Chat } from "@/src/domain/entities/Chat";
import type { Message } from "@/src/domain/entities/Message";
import {
  useCreateChat,
  useFindAllMyChats,
  useFindMyChatById,
  useGetAllMyChatMessages,
  useMarkAllMessagesFromChatAsRead,
  useSendMessageToChat,
} from "@/src/infraestructure/repositories/ChatRepositoryImpl";
import { chatListStore } from "@/src/presentation/stores/chat-list.store";
import { currentChatStore } from "@/src/presentation/stores/current-chat.store";
import { useEffect } from "react";

/**
 * Hook to fetch a chat by ID and sync with currentChatStore.
 */
export function useFindMyChatByIdService(id: string) {
  const query = useFindMyChatById(id);
  const setCurrentChat = currentChatStore((s) => s.setCurrentChat);

  useEffect(() => {
    if (query.data) {
      setCurrentChat({
        chatId: query.data.chatId,
        chatName: query.data.name,
        chatImage: query.data.image,
        chatIsActive: query.data.isActive,
        // messages are not part of Chat, handled by message service
        page: 1,
        perPage: 20,
        total: 0,
        hasMore: false,
      });
    }
  }, [query.data, setCurrentChat]);

  return query;
}

/**
 * Hook to fetch all chats and sync with chatListStore.
 */
export function useFindAllMyChatsService(page: number = 1, perPage: number = 20) {
  const query = useFindAllMyChats(page, perPage);
  const setChats = chatListStore((s) => s.setChats);

  useEffect(() => {
    if (query.data) {
      setChats(
        query.data.chats,
        query.data.page,
        query.data.perPage,
        query.data.total,
        query.data.hasMore
      );
    }
  }, [query.data, setChats]);

  return query;
}

/**
 * Hook to create a chat and sync with chatListStore.
 */
export function useCreateChatService() {
  const addChat = chatListStore((s) => s.addChat);
  const mutation = useCreateChat();

  const createChat = (chat: Partial<Chat>) => {
    mutation.mutate(chat as Chat, {
      onSuccess: () => {
        // Optionally, refetch chats or add to store if returned
        // addChat(chat as Chat);
      },
    });
  };

  return {
    ...mutation,
    createChat,
  };
}

/**
 * Hook to fetch all messages for a chat and sync with currentChatStore.
 */
export function useGetAllMyChatMessagesService(chatId: string, page: number = 1, perPage: number = 20) {
  const query = useGetAllMyChatMessages(chatId, page, perPage);
  const setMessages = currentChatStore((s) => s.setMessages);
  const setPagination = currentChatStore((s) => s.setPagination);

  useEffect(() => {
    if (query.data) {
      setMessages(query.data.messages);
      setPagination({
        page: query.data.page,
        perPage: query.data.perPage,
        total: query.data.total,
        hasMore: query.data.hasMore,
      });
    }
  }, [query.data, setMessages, setPagination]);

  return query;
}

/**
 * Hook to send a message to a chat and sync with currentChatStore and chatListStore.
 */
export function useSendMessageToChatService() {
  const addMessage = currentChatStore((s) => s.addMessage);
  const updateChatLastMessage = chatListStore((s) => s.updateChatLastMessage);
  const mutation = useSendMessageToChat();

  const sendMessage = (chatId: string, message: Message) => {
    addMessage(message);
    updateChatLastMessage(chatId, {
      id: message.messageId,
      content: message.content ?? "",
      status: "sent",
      isByMe: true,
      createdAt: typeof message.createdAt === "string"
        ? message.createdAt
        : message.createdAt?.toISOString?.() ?? "",
    });
    mutation.mutate({ chatId, message }, {
      // Optionally handle rollback on error
    });
  };

  return {
    ...mutation,
    sendMessage,
  };
}

/**
 * Hook to mark all messages from a chat as read and sync with currentChatStore.
 */
export function useMarkAllMessagesFromChatAsReadService() {
  const setMessages = currentChatStore((s) => s.setMessages);
  const mutation = useMarkAllMessagesFromChatAsRead();

  const markAllAsRead = (chatId: string, messages: Message[]) => {
    // Optimistically mark all as read in store
    setMessages(messages.map(m => ({ ...m, readed: true })));
    mutation.mutate(chatId, {
      // Optionally handle rollback on error
    });
  };

  return {
    ...mutation,
    markAllAsRead,
  };
}
