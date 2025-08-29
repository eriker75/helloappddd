import { Chat } from "@/src/domain/entities/Chat";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface ChatListState {
  chats: Record<string, Chat>; // Hash table: chatId -> Chat
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface ChatListAction {
  setChats: (chats: Chat[], page?: number, perPage?: number, total?: number, hasMore?: boolean) => void;
  appendChats: (chats: Chat[], page: number, perPage: number, total: number, hasMore: boolean) => void;
  addChat: (chat: Chat) => void;
  removeChat: (chatId: string) => void;
  setLoadingChats: (loading: boolean) => void;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setTotal: (total: number) => void;
  setHasMore: (hasMore: boolean) => void;
  updateChatLastMessage: (
    chatId: string,
    lastMessage: {
      id: string;
      content: string;
      status: string;
      isByMe: boolean;
      createdAt: string;
    }
  ) => void;
  getSortedChats: () => Chat[]; // Para obtener los chats ordenados

  /**
   * Set the unread count for a specific chat.
   */
  setChatUnreadCount: (chatId: string, count: number) => void;
}

export type ChatListStore = ChatListState & ChatListAction;

const initialState: ChatListState = {
  chats: {},
  page: 1,
  perPage: 20,
  total: 0,
  hasMore: false,
};

function sortChatsDesc(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) => new Date(b.lastMessageCreatedAt).getTime() - new Date(a.lastMessageCreatedAt).getTime()
  );
}

const chatListStoreCreator: StateCreator<ChatListStore, [["zustand/immer", never]], [["zustand/persist", unknown]]> = (
  set,
  get
) => ({
  ...initialState,
  setChats: (chats: Chat[], page = 1, perPage = 20, total = 0, hasMore = false) =>
    set((state) => {
      // Ensure all fields from API payload are preserved and date fields are stringified
      state.chats = Object.fromEntries(
        chats.map((c) => [
          c.chatId,
          {
            ...c,
            lastMessageCreatedAt: c.lastMessageCreatedAt ? new Date(c.lastMessageCreatedAt) : new Date(0),
            lastMessageUpdatedAt: c.lastMessageUpdatedAt ? new Date(c.lastMessageUpdatedAt) : new Date(0),
            createdAt: c.createdAt ? new Date(c.createdAt) : new Date(0),
            updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(0),
          }
        ])
      );
      state.page = page;
      state.perPage = perPage;
      state.total = total;
      state.hasMore = hasMore;
    }),
  appendChats: (chats: Chat[], page: number, perPage: number, total: number, hasMore: boolean) =>
    set((state) => {
      for (const c of chats) {
        state.chats[c.chatId] = {
          ...c,
          lastMessageCreatedAt: c.lastMessageCreatedAt ? new Date(c.lastMessageCreatedAt) : new Date(0),
          lastMessageUpdatedAt: c.lastMessageUpdatedAt ? new Date(c.lastMessageUpdatedAt) : new Date(0),
          createdAt: c.createdAt ? new Date(c.createdAt) : new Date(0),
          updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(0),
        };
      }
      state.page = page;
      state.perPage = perPage;
      state.total = total;
      state.hasMore = hasMore;
    }),
  addChat: (chat: Chat) =>
    set((state) => {
      state.chats[chat.chatId] = chat;
    }),
  removeChat: (chatId: string) =>
    set((state) => {
      delete state.chats[chatId];
    }),
  setLoadingChats: (loading: boolean) =>
    set((_state) => {
      // No-op (remove if not needed)
    }),
  setPage: (page: number) =>
    set((state) => {
      state.page = page;
    }),
  setPerPage: (perPage: number) =>
    set((state) => {
      state.perPage = perPage;
    }),
  setTotal: (total: number) =>
    set((state) => {
      state.total = total;
    }),
  setHasMore: (hasMore: boolean) =>
    set((state) => {
      state.hasMore = hasMore;
    }),
  updateChatLastMessage: (chatId, lastMessage) =>
    set((state) => {
      const chat = state.chats[chatId];
      if (chat) {
        // Only update last message fields, preserve ALL other existing and extra fields
        state.chats[chatId] = {
          ...chat,
          lastMessageId: lastMessage.id,
          lastMessageContent: lastMessage.content,
          lastMessageStatus: lastMessage.status as any,
          lastMessageCreatedAt: lastMessage.createdAt ? new Date(lastMessage.createdAt) : new Date(0)
          // No other props are touched, so all extra fields remain
        };
      }
    }),
  getSortedChats: () => {
    const chatsArray = Object.values(get().chats);
    return sortChatsDesc(chatsArray);
  },
  setChatUnreadCount: (chatId, count) =>
    set((state) => {
      const chat = state.chats[chatId];
      if (chat) {
        // Only update unreadedCount, preserve ALL other existing and extra fields
        state.chats[chatId] = {
          ...chat,
          unreadedCount: count,
        };
      }
    }),
});

export const useChatListStore = create<ChatListStore>()(
  persist(immer(chatListStoreCreator), {
    name: "chat-list-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
