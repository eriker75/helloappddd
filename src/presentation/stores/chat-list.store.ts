import { Chat } from "@/src/domain/models/Chat";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface ChatListState {
  chats: Chat[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface ChatListAction {
  setChats: (
    chats: Chat[],
    page?: number,
    perPage?: number,
    total?: number,
    hasMore?: boolean
  ) => void;
  appendChats: (
    chats: Chat[],
    page: number,
    perPage: number,
    total: number,
    hasMore: boolean
  ) => void;
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
}

export type ChatListStore = ChatListState & ChatListAction;

const initialState: ChatListState = {
  chats: [],
  page: 1,
  perPage: 20,
  total: 0,
  hasMore: false,
};

function sortChatsDesc(chats: Chat[]): Chat[] {
  return [...chats].sort(
    (a, b) =>
      new Date(b.lastMessageCreatedAt).getTime() -
      new Date(a.lastMessageCreatedAt).getTime()
  );
}

const chatListStoreCreator: StateCreator<
  ChatListStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set) => ({
  ...initialState,
  setChats: (
    chats: Chat[],
    page = 1,
    perPage = 20,
    total = 0,
    hasMore = false
  ) =>
    set((state) => {
      state.chats = sortChatsDesc(chats);
      state.page = page;
      state.perPage = perPage;
      state.total = total;
      state.hasMore = hasMore;
    }),
  appendChats: (
    chats: Chat[],
    page: number,
    perPage: number,
    total: number,
    hasMore: boolean
  ) =>
    set((state) => {
      if (page === 1) {
        state.chats = sortChatsDesc(chats);
      } else {
        state.chats = sortChatsDesc([...state.chats, ...chats]);
      }
      state.page = page;
      state.perPage = perPage;
      state.total = total;
      state.hasMore = hasMore;
    }),
  addChat: (chat: Chat) =>
    set((state) => {
      state.chats = sortChatsDesc([chat, ...state.chats]);
    }),
  removeChat: (chatId: string) =>
    set((state) => {
      state.chats = state.chats.filter((c: Chat) => c.chatId !== chatId);
    }),
  setLoadingChats: (loading: boolean) =>
    set((state) => {
      state.loadingChats = loading;
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
      const idx = state.chats.findIndex((c: Chat) => c.chatId === chatId);
      if (idx !== -1) {
        const updatedChat = {
          ...state.chats[idx],
          lastMessageId: lastMessage.id,
          lastMessageContent: lastMessage.content,
          lastMessageStatus: lastMessage.status,
          lastMessageCreatedAt: lastMessage.createdAt,
        };
        state.chats.splice(idx, 1);
        state.chats.unshift(updatedChat);
      }
    }),
});

export const chatListStore = create<ChatListStore>()(
  persist(immer(chatListStoreCreator), {
    name: "chat-list-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
