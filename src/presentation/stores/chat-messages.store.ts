import { Message } from "@/src/domain/entities/Message";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface ChatMessagesState {
  chatId: string;
  chatName: string;
  chatImage: string;
  chatIsActive: boolean;
  messages: Record<string, Message>;
  orderedMessageIds: string[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface ChatMessagesActions {
  setChat: (
    chat: Omit<ChatMessagesState, "messages" | "orderedMessageIds" | "page" | "perPage" | "total" | "hasMore"> & {
      messages?: Message[];
      page?: number;
      perPage?: number;
      total?: number;
      hasMore?: boolean;
      loadingMessages?: boolean;
    }
  ) => void;
  clearChat: () => void;
  setInitialMessages: (messages: Message[], page?: number, perPage?: number, total?: number, hasMore?: boolean) => void;
  appendMessages: (messages: Message[], page?: number, perPage?: number) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, update: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setLoadingMessages: (loading: boolean) => void;
  setPagination: (pagination: { page: number; perPage: number; total: number; hasMore: boolean }) => void;
  getOrderedMessages: () => Message[];
}

export type ChatMessagesStore = ChatMessagesState & ChatMessagesActions;

const initialState: ChatMessagesState = {
  chatId: "",
  chatName: "",
  chatImage: "",
  chatIsActive: false,
  messages: {},
  orderedMessageIds: [],
  page: 1,
  perPage: 20,
  total: 0,
  hasMore: false,
};

function sortMessageIdsDesc(messages: Record<string, Message>): string[] {
  return Object.values(messages)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((m) => m.messageId);
}

const chatMessagesStoreCreator: StateCreator<
  ChatMessagesStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set, get) => ({
  ...initialState,
  setChat: (chat) =>
    set((state) => {
      state.chatId = chat.chatId;
      state.chatName = chat.chatName;
      state.chatImage = chat.chatImage;
      state.chatIsActive = chat.chatIsActive;
      state.messages = {};
      state.orderedMessageIds = [];
      if (chat.messages) {
        state.messages = Object.fromEntries(chat.messages.map((m) => [m.messageId, m]));
        state.orderedMessageIds = sortMessageIdsDesc(state.messages);
      }
      state.page = typeof chat.page === "number" ? chat.page : 1;
      state.perPage = typeof chat.perPage === "number" ? chat.perPage : 20;
      state.total = typeof chat.total === "number" ? chat.total : 0;
      state.hasMore = typeof chat.hasMore === "boolean" ? chat.hasMore : false;
      if (typeof chat.loadingMessages === "boolean") {
        state.loadingMessages = chat.loadingMessages;
      }
    }),
  clearChat: () =>
    set((state) => {
      state.chatId = "";
      state.chatName = "";
      state.chatImage = "";
      state.chatIsActive = false;
      state.messages = {};
      state.orderedMessageIds = [];
      state.loadingMessages = false;
      state.page = 1;
      state.perPage = 20;
      state.total = 0;
      state.hasMore = false;
    }),
  setInitialMessages: (messages, page = 1, perPage = 20, total = 0, hasMore = false) =>
    set((state) => {
      state.messages = Object.fromEntries(messages.map((m) => [m.messageId, m]));
      state.orderedMessageIds = sortMessageIdsDesc(state.messages);
      state.page = typeof page === "number" ? page : 1;
      state.perPage = typeof perPage === "number" ? perPage : 20;
      state.total = typeof total === "number" ? total : 0;
      state.hasMore = typeof hasMore === "boolean" ? hasMore : false;
    }),
  appendMessages: (messages, page, perPage) =>
    set((state) => {
      for (const m of messages) {
        state.messages[m.messageId] = m;
      }
      state.orderedMessageIds = sortMessageIdsDesc(state.messages);
      if (typeof page === "number") state.page = page;
      if (typeof perPage === "number") state.perPage = perPage;
    }),
  addMessage: (message) =>
    set((state) => {
      state.messages[message.messageId] = message;
      // Insertar al principio si es el más reciente
      state.orderedMessageIds = sortMessageIdsDesc(state.messages);
    }),
  updateMessage: (messageId, update) =>
    set((state) => {
      if (state.messages[messageId]) {
        const prevCreatedAt = state.messages[messageId].createdAt;
        state.messages[messageId] = { ...state.messages[messageId], ...update };
        // Solo reordenar si cambia createdAt
        if (update.createdAt && update.createdAt !== prevCreatedAt) {
          state.orderedMessageIds = sortMessageIdsDesc(state.messages);
        }
      }
    }),
  removeMessage: (messageId) =>
    set((state) => {
      delete state.messages[messageId];
      state.orderedMessageIds = state.orderedMessageIds.filter((id: string) => id !== messageId);
    }),
  setLoadingMessages: (loading) =>
    set((state) => {
      state.loadingMessages = loading;
    }),
  setPagination: (pagination) =>
    set((state) => {
      state.page = pagination.page;
      state.perPage = pagination.perPage;
      state.total = pagination.total;
      state.hasMore = pagination.hasMore;
    }),
  getOrderedMessages: () => {
    const state = get();
    return state.orderedMessageIds.map((id) => state.messages[id]);
  },
});

export const useChatMessagesStore = create<ChatMessagesStore>()(
  persist(immer(chatMessagesStoreCreator), {
    name: "chat-messages-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
