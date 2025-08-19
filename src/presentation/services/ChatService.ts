import {
  fetchMyChats,
  useFindMyChats,
  useMarkAllMessagesFromChatAsRead as useRepoMarkAllMessagesFromChatAsRead,
} from "@/src/infraestructure/repositories/ChatRepositoryImpl";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatListStore } from "../stores/chat-list.store";

/**
 * Hook to mark all messages from a chat as read and sync with currentChatStore.
 */
import { useCurrentChatMessagesStore } from "../stores/current-chat-messages.store";

export function useGetChatsService(page: number = 1, perPage: number = 20) {
  const { data: myFetchedChats, isLoading, isError } = useFindMyChats(page, perPage);
  const setChats = useChatListStore((s) => s.setChats);
  const total = useChatListStore((s) => s.total);

  useEffect(() => {
    if (myFetchedChats && Array.isArray(myFetchedChats.chats) && total === 0) {
      setChats(
        myFetchedChats.chats,
        myFetchedChats.page,
        myFetchedChats.perPage,
        myFetchedChats.total,
        myFetchedChats.hasMore
      );
    }
  }, [myFetchedChats, setChats, total]);

  return {
    chats: useChatListStore((s) => s.getSortedChats()),
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
export function useCreateChatService() {}

/**
 * Hook to fetch all messages for a chat and sync with currentChatStore.
 */
export function useGetChatMessagesService(chatId: string, page: number = 1, perPage: number = 20) {}

/**
 * Hook to send a message to a chat and sync with currentChatStore and chatListStore.
 */
export function useSendMessageToChatService() {}

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
