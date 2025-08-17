import { ChatEntity } from "@/src/domain/entities/Chat.entity";
import { ChatMessageEntity } from "@/src/domain/entities/ChatMessage.entity";
import { ParticipantEntity } from "@/src/domain/entities/Participant.entity";
import { ChatDatasourceImpl } from "@/src/infraestructure/datasources/ChatDatasourceImpl";
import { chatListStore } from "@/src/presentation/stores/chat-list.store";
import { currentChatStore } from "@/src/presentation/stores/current-chat.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

// React Query + store sync hook for user chats
import { useFindByParticipant } from "@/src/infraestructure/repositories/ChatRepositoryImpl";

export interface CreateChatService {
  chat: ChatEntity;
  participants: ParticipantEntity[];
}

export interface UpdateChatService {
  chat: ChatEntity;
}

export interface DeleteChatService {
  chatId: string;
}

export interface SendMessageService {
  chatId: string;
  message: ChatMessageEntity;
}

export interface MarkMessageAsReadService {
  chatId: string;
  messageId: string;
  userId: string;
}

const chatDatasource = new ChatDatasourceImpl();

/**
 * Fetches chats for a user using React Query and syncs with the chat list store.
 * Returns the React Query result (data, isLoading, error, etc.).
 */
export function useUserChatsService(userId: string) {
  const query = useFindByParticipant(userId);
  const setChats = chatListStore((s) => s.setChats);

  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      const mapped = query.data.map((chat) => {
        const lastMsg = Array.isArray(chat.messages) && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;
        return {
          chatId: chat.id,
          chatImage: "", // Could be derived from participants or left empty
          chatDescription: chat.description ?? "",
          chatParticipants: chat.participants?.map((p) => p.userId) ?? [],
          chatIsActive: chat.isActive,
          chatLastMessageId: chat.lastMessageId ?? (lastMsg ? lastMsg.id : ""),
          chatLastMessageContent: lastMsg ? lastMsg.content : "",
          chatLastMessageStatus: "", // Not available, left empty
          chatLastMessageIsByMe: false, // Not available, left false
          unreadedCount: 0, // Not available, left 0
          chatType: chat.type,
          chatLastMessageCreatedAt: lastMsg
            ? (typeof lastMsg.createdAt === "string"
                ? lastMsg.createdAt
                : lastMsg.createdAt?.toISOString?.() ?? "")
            : (typeof chat.createdAt === "string"
                ? chat.createdAt
                : chat.createdAt?.toISOString?.() ?? ""),
        };
      });
      setChats(mapped);
    }
  }, [query.data, setChats]);

  return query;
}
// Plain async function to fetch chats for a user (for use outside React Query)
export async function getChatsForUser(userId: string): Promise<ChatEntity[]> {
  return chatDatasource.findByParticipant(userId);
}
// --- Chat List Store Actions ---

export function useSetChats() {
  const setChats = chatListStore((s) => s.setChats);
  return useCallback(setChats, [setChats]);
}

export function useAppendChats() {
  const appendChats = chatListStore((s) => s.appendChats);
  return useCallback(appendChats, [appendChats]);
}

export function useAddChat() {
  const addChat = chatListStore((s) => s.addChat);
  return useCallback(addChat, [addChat]);
}

export function useRemoveChat() {
  const removeChat = chatListStore((s) => s.removeChat);
  return useCallback(removeChat, [removeChat]);
}

export function useSetLoadingChats() {
  const setLoadingChats = chatListStore((s) => s.setLoadingChats);
  return useCallback(setLoadingChats, [setLoadingChats]);
}

export function useSetPage() {
  const setPage = chatListStore((s) => s.setPage);
  return useCallback(setPage, [setPage]);
}

export function useSetPerPage() {
  const setPerPage = chatListStore((s) => s.setPerPage);
  return useCallback(setPerPage, [setPerPage]);
}

export function useSetTotal() {
  const setTotal = chatListStore((s) => s.setTotal);
  return useCallback(setTotal, [setTotal]);
}

export function useSetHasMore() {
  const setHasMore = chatListStore((s) => s.setHasMore);
  return useCallback(setHasMore, [setHasMore]);
}

export function useUpdateChatLastMessage() {
  const updateChatLastMessage = chatListStore((s) => s.updateChatLastMessage);
  return useCallback(updateChatLastMessage, [updateChatLastMessage]);
}

// --- Current Chat Store Actions ---

export function useSetCurrentChat() {
  const setCurrentChat = currentChatStore((s) => s.setCurrentChat);
  return useCallback(setCurrentChat, [setCurrentChat]);
}

export function useClearCurrentChat() {
  const clearCurrentChat = currentChatStore((s) => s.clearCurrentChat);
  return useCallback(clearCurrentChat, [clearCurrentChat]);
}

export function useSetMessages() {
  const setMessages = currentChatStore((s) => s.setMessages);
  return useCallback(setMessages, [setMessages]);
}

export function useAppendMessages() {
  const appendMessages = currentChatStore((s) => s.appendMessages);
  return useCallback(appendMessages, [appendMessages]);
}

export function useAddMessage() {
  const addMessage = currentChatStore((s) => s.addMessage);
  return useCallback(addMessage, [addMessage]);
}

export function useUpdateMessage() {
  const updateMessage = currentChatStore((s) => s.updateMessage);
  return useCallback(updateMessage, [updateMessage]);
}

export function useRemoveMessage() {
  const removeMessage = currentChatStore((s) => s.removeMessage);
  return useCallback(removeMessage, [removeMessage]);
}

export function useSetLoadingMessages() {
  const setLoadingMessages = currentChatStore((s) => s.setLoadingMessages);
  return useCallback(setLoadingMessages, [setLoadingMessages]);
}

export function useSetPagination() {
  const setPagination = currentChatStore((s) => s.setPagination);
  return useCallback(setPagination, [setPagination]);
}

// --- Async Service Hooks (with optimistic updates) ---

export function useCreateChatService() {
  const addChat = useAddChat();
  const removeChat = useRemoveChat();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ chat, participants }: CreateChatService) => {
      return await chatDatasource.createWithParticipants(chat, participants);
    },
    onMutate: async ({ chat, participants }) => {
      addChat({
        chatId: chat.id,
        chatImage: "",
        chatDescription: chat.description ?? "",
        chatParticipants: participants.map((p) => p.userId),
        chatIsActive: chat.isActive,
        chatLastMessageId: chat.lastMessageId ?? "",
        chatLastMessageContent: "",
        chatLastMessageStatus: "",
        chatLastMessageIsByMe: false,
        unreadedCount: 0,
        chatType: chat.type,
        chatLastMessageCreatedAt: chat.createdAt.toISOString(),
      });
      return { chatId: chat.id };
    },
    onError: (err, { chat }, context) => {
      if (context?.chatId) {
        removeChat(context.chatId);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useUpdateChatService() {
  const removeChat = useRemoveChat();
  const addChat = useAddChat();
  const queryClient = useQueryClient();
  const chats = chatListStore((s) => s.chats);
  return useMutation({
    mutationFn: async (chat: ChatEntity) => {
      return await chatDatasource.update(chat);
    },
    onMutate: async (chat) => {
      const prev = chats.find((c) => c.chatId === chat.id);
      removeChat(chat.id);
      addChat({
        chatId: chat.id,
        chatImage: "",
        chatDescription: chat.description ?? "",
        chatParticipants: chat.participants.map((p) => p.userId),
        chatIsActive: chat.isActive,
        chatLastMessageId: chat.lastMessageId ?? "",
        chatLastMessageContent: "",
        chatLastMessageStatus: "",
        chatLastMessageIsByMe: false,
        unreadedCount: 0,
        chatType: chat.type,
        chatLastMessageCreatedAt: chat.createdAt.toISOString(),
      });
      return { chatId: chat.id, prev };
    },
    onError: (err, chat, context) => {
      if (context?.prev) {
        removeChat(context.chatId);
        addChat(context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useDeleteChatService() {
  const removeChat = useRemoveChat();
  const addChat = useAddChat();
  const queryClient = useQueryClient();
  const chats = chatListStore((s) => s.chats);
  return useMutation({
    mutationFn: async (chatId: string) => {
      return await chatDatasource.delete(chatId);
    },
    onMutate: async (chatId) => {
      const prev = chats.find((c) => c.chatId === chatId);
      removeChat(chatId);
      return { chatId, prev };
    },
    onError: (err, chatId, context) => {
      if (context?.prev) {
        addChat(context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useSendMessageService() {
  const addMessage = useAddMessage();
  const updateChatLastMessage = useUpdateChatLastMessage();
  const removeMessage = useRemoveMessage();
  const addChat = useAddChat();
  const queryClient = useQueryClient();
  const chats = chatListStore((s) => s.chats);
  return useMutation({
    mutationFn: async ({ chatId, message }: SendMessageService) => {
      return await chatDatasource.sendMessage(chatId, message);
    },
    onMutate: async ({ chatId, message }) => {
      const prevChat = chats.find((c) => c.chatId === chatId);
      addMessage({
        messageId: message.id,
        createdAt: message.createdAt.toISOString(),
        updatedAt: message.updatedAt.toISOString(),
        content: message.content,
        draftContent: message.draftContent ?? "",
        senderId: message.senderId,
        parentId: message.parentId ?? "",
        type: message.type,
        readed: false,
        deleted: false,
      });
      updateChatLastMessage(chatId, {
        chatLastMessageId: message.id,
        chatLastMessageContent: message.content,
        chatLastMessageStatus: "sending",
        chatLastMessageIsByMe: true,
        chatLastMessageCreatedAt: message.createdAt.toISOString(),
      });
      return { chatId, messageId: message.id, prevChat };
    },
    onError: (err, { chatId, message }, context) => {
      removeMessage(message.id);
      if (context?.prevChat) {
        addChat(context.prevChat);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useMarkMessageAsReadService() {
  const updateMessage = useUpdateMessage();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      chatId,
      messageId,
      userId,
    }: MarkMessageAsReadService) => {
      return await chatDatasource.markMessageAsRead(chatId, messageId, userId);
    },
    onMutate: async ({ messageId }: MarkMessageAsReadService) => {
      updateMessage(messageId, { readed: true });
      return { messageId };
    },
    onError: (err, { messageId }: MarkMessageAsReadService, context) => {
      updateMessage(messageId, { readed: false });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}
