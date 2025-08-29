import { Chat } from "@/src/domain/entities/Chat";
import { Message } from "@/src/domain/entities/Message";
import {
  fetchMyChatMessages,
  fetchMyChats,
  findPrivateChatWithUser,
  useCreateChat,
  useFindMyChats,
  useGetMyChatMessages,
  useMarkAllMessagesFromChatAsRead as useRepoMarkAllMessagesFromChatAsRead,
  useSendMessageToChat,
} from "@/src/infraestructure/repositories/ChatRepositoryImpl";
import { logWithColor } from "@/src/utils/logWithColor";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChatListStore } from "../stores/chat-list.store";
import { useCurrentChatMessagesStore } from "../stores/current-chat-messages.store";

/**
 * Hook to mark all messages from a chat as read and sync with currentChatStore.
 */
export function useGetChatsService(page: number = 1, perPage: number = 20) {
  const { data: myFetchedChats, isLoading, isError } = useFindMyChats(page, perPage);
  const setChats = useChatListStore((s) => s.setChats);
  const total = useChatListStore((s) => s.total);

  logWithColor(myFetchedChats, "orange");

  // Use ref to track if we've already initialized the chat list for this screen session
  const hasInitialized = useRef(false);

  useEffect(() => {
    logWithColor("loading chats", "cyan");
    if (myFetchedChats && Array.isArray(myFetchedChats.chats)) {
      setChats(
        myFetchedChats.chats,
        myFetchedChats.page,
        myFetchedChats.perPage,
        myFetchedChats.total,
        myFetchedChats.hasMore
      );
      hasInitialized.current = true; // retain for possible pagination logic
    }
  }, [myFetchedChats, setChats]);

  // Get the chats object from the store and memoize sorted chats
  const chatsObject = useChatListStore((s) => s.chats);

  const sortedChats = useMemo(() => {
    const chatsArr = Object.values(chatsObject);
    // Optional: sort in descending order by last message time, null-failsafe
    return chatsArr.sort(
      (a, b) => new Date(b.lastMessageCreatedAt || 0).getTime() - new Date(a.lastMessageCreatedAt || 0).getTime()
    );
  }, [chatsObject]);

  return {
    chats: sortedChats,
    isLoading,
    isError,
    total,
  };
}

export function useGetMoreChatsService() {
  const appendChats = useChatListStore((s) => s.appendChats);
  const page = useChatListStore((s) => s.page);
  const perPage = useChatListStore((s) => s.perPage);
  const hasMore = useChatListStore((s) => s.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreChats = useCallback(async () => {
    if (!hasMore) return;
    setIsLoading(true);
    setError(null);
    let myFetchedChats;
    try {
      myFetchedChats = await fetchMyChats(page + 1, perPage);
      if (myFetchedChats && Array.isArray(myFetchedChats.chats) && myFetchedChats.chats.length > 0) {
        appendChats(
          myFetchedChats.chats,
          myFetchedChats.page,
          myFetchedChats.perPage,
          myFetchedChats.total,
          myFetchedChats.hasMore
        );
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading more chats.");
    } finally {
      setIsLoading(false);
    }
  }, [appendChats, page, perPage, hasMore]);

  return { loadMoreChats, hasMore, page, perPage, isLoading, error };
}

/**
 * Hook to create a chat and sync with chatListStore.
 */
export function useCreateChatService() {
  const addChat = useChatListStore((s) => s.addChat);
  const mutation = useCreateChat();
  const createChat = (chatData: Partial<Chat>, onError?: (error: any) => void) => {
    mutation.mutate(chatData, {
      onSuccess: (newChat: any) => {
        console.log("CREATED CHAT", { newChat });
        if (newChat && newChat.chatId) {
          addChat(newChat);
          router.push(`/dashboard/chats/${newChat.chatId}`);
        }
      },
      onError: (error: any) => {
        if (onError) {
          onError(error);
        }
      },
    });
  };

  return {
    createChat,
    isLoading: mutation.status === "pending",
    isError: mutation.status === "error",
    error: mutation.error,
    isSuccess: mutation.status === "success",
    data: mutation.data,
  };
}

/**
 * Service to check if a private chat already exists with another user.
 */
export async function findPrivateChatWithUserService(otherUserId: string) {
  return await findPrivateChatWithUser(otherUserId);
}

/**
 * Hook to fetch initial messages for a chat and sync with currentChatStore.
 */
export function useGetChatMessagesService(chatId: string, page: number = 1, perPage: number = 20) {
  const { data: fetchedMessages, isLoading, isError } = useGetMyChatMessages(chatId, page, perPage);
  const setChat = useCurrentChatMessagesStore((s) => s.setChat);
  const total = useCurrentChatMessagesStore((s) => s.total);

  // FIX: Use ref to avoid re-initializations
  const hasInitialized = useRef(false);
  const lastChatId = useRef<string>("");

  // Reset when chatId changes
  useEffect(() => {
    if (chatId !== lastChatId.current) {
      hasInitialized.current = false;
      lastChatId.current = chatId;
    }
  }, [chatId]);

  // Only sync initial messages once per chat and when store is empty or different chat
  useEffect(() => {
    if (fetchedMessages && Array.isArray(fetchedMessages.messages)) {

      logWithColor(fetchedMessages, "pink");

      setChat({
        chatId: chatId,
        chatName: "",
        chatImage: "",
        chatIsActive: true,
        messages: fetchedMessages.messages,
        page: fetchedMessages.page,
        perPage: fetchedMessages.perPage,
        total: fetchedMessages.total,
        hasMore: fetchedMessages.hasMore,
        otherUserProfile: fetchedMessages.otherUserProfile,
        unreadMessageIds: [],
        lastMarkedAsReadMessageIds: [],
        loadingMessages: false,
      });
      hasInitialized.current = true;
    }
  }, [fetchedMessages, setChat, chatId]);

  // Expose all useful chat state, including meta and pagination, from store:
  const otherUserProfile = useCurrentChatMessagesStore((s) => s.otherUserProfile);
  const storePage = useCurrentChatMessagesStore((s) => s.page);
  const storePerPage = useCurrentChatMessagesStore((s) => s.perPage);
  const hasMore = useCurrentChatMessagesStore((s) => s.hasMore);

  const messagesObject = useCurrentChatMessagesStore((s) => s.messages);
  const orderedMessageIds = useCurrentChatMessagesStore((s) => s.orderedMessageIds);
  const messages = orderedMessageIds.map((id: string) => messagesObject[id]).filter(Boolean);

  return {
    isLoading,
    isError,
    total,
    otherUserProfile,
    messages,
    messagesObject,
    orderedMessageIds,
    page: storePage,
    perPage: storePerPage,
    hasMore,
  };
}

/**
 * Hook to fetch more messages for a chat and sync with currentChatStore.
 */
export function useGetMoreChatMessagesService(chatId: string, page: number = 1, perPage: number = 20) {
  const appendMessages = useCurrentChatMessagesStore((s) => s.appendMessages);
  const hasMore = useCurrentChatMessagesStore((s) => s.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoreMessages = useCallback(async () => {
    if (!hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetched = await fetchMyChatMessages(chatId, page, perPage);
      if (fetched && Array.isArray(fetched.messages) && fetched.messages.length > 0) {
        appendMessages(fetched.messages, fetched.page, fetched.perPage);
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while loading more messages.");
    } finally {
      setIsLoading(false);
    }
  }, [appendMessages, chatId, page, perPage, hasMore]);

  return { loadMoreMessages, hasMore, page, perPage, isLoading, error };
}

/**
 * Hook to send a message to a chat and sync with currentChatStore and chatListStore.
 */
export function useSendMessageToChatService(chatId: string) {
  const mutation = useSendMessageToChat();
  const addMessage = useCurrentChatMessagesStore((s) => s.addMessage);
  const updateChatLastMessage = useChatListStore((s) => s.updateChatLastMessage);
  const sendMessage = (message: Partial<Message>) => {
    console.log("[ChatService] sendMessage called with:", { chatId, message });
    // Flatten payload so backend finds all fields at root level
    const payload = { ...message, chatId };
    console.log("[ChatService] sendMessage FLATTENED payload:", payload);
    mutation.mutate(payload, {
      onSuccess: (_data, _variables, _context) => {
        console.log("[ChatService] mutation onSuccess", { _data, _variables, _context });
        addMessage(message as Message);
        updateChatLastMessage(chatId, {
          id: (message as any).messageId ?? "",
          content: message.content ?? "",
          status: message.status ?? "sent",
          isByMe: true,
          createdAt:
            typeof message.createdAt === "string"
              ? message.createdAt
              : message.createdAt instanceof Date
              ? message.createdAt.toISOString()
              : new Date().toISOString(),
        });
      },
      onError: (error, variables, context) => {
        console.log("[ChatService] mutation onError", { error, variables, context });
      },
    });
  };

  return {
    sendMessage,
    ...mutation,
  };
}

/**
 * Hook to mark all messages from a chat as read and sync with currentChatStore.
 * Handles optimistic update and rollback on error.
 */
export function useMarkAllMessagesFromChatAsReadService() {
  const chatId = useCurrentChatMessagesStore((s) => s.chatId);
  const markAllAsRead = useCurrentChatMessagesStore((s) => s.markAllAsRead);
  const revertMarkAllAsRead = useCurrentChatMessagesStore((s) => s.revertMarkAllAsRead);
  const setChatUnreadCount = useChatListStore((s) => s.setChatUnreadCount);
  const chatUnreadCount = useChatListStore((s) => (chatId ? s.chats[chatId]?.unreadedCount ?? 0 : 0));
  // Store previous unread count for rollback
  const prevUnreadCountRef = useRef<number | undefined>(undefined);
  // mutation request hook
  const mutation = useRepoMarkAllMessagesFromChatAsRead();
  // Optimistic update function
  const markAll = useCallback(() => {
    if (!chatId) return;
    prevUnreadCountRef.current = chatUnreadCount;
    markAllAsRead();
    setChatUnreadCount(chatId, 0);
    mutation.mutate(chatId, {
      onError: () => {
        revertMarkAllAsRead();
        setChatUnreadCount(chatId, prevUnreadCountRef.current ?? 0);
      },
    });
  }, [chatId, chatUnreadCount, markAllAsRead, setChatUnreadCount, mutation, revertMarkAllAsRead]);
  return {
    markAllMessagesAsRead: markAll,
    isLoading: mutation.status === "pending",
    isError: mutation.status === "error",
    error: mutation.error,
    isSuccess: mutation.status === "success",
  };
}
