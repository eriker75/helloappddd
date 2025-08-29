import { Message } from "@/src/domain/entities/Message";
import { UserProfile } from "@/src/domain/entities/UserProfile";
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
  unreadMessageIds: string[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
  lastMarkedAsReadMessageIds: string[];
  loadingMessages: boolean;
  otherUserProfile?: UserProfile;
  participants?: string[];
  type?: string;
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
  markAllAsRead: () => void;
  revertMarkAllAsRead: () => void;
}

export type ChatMessagesStore = ChatMessagesState & ChatMessagesActions;

const initialState: ChatMessagesState = {
  chatId: "",
  chatName: "",
  chatImage: "",
  chatIsActive: false,
  messages: {},
  orderedMessageIds: [],
  unreadMessageIds: [],
  page: 1,
  perPage: 20,
  total: 0,
  hasMore: false,
  lastMarkedAsReadMessageIds: [],
  loadingMessages: false,
};

function sortMessageIdsAsc(messages: Record<string, Message>): string[] {
  return Object.values(messages)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m) => m.messageId);
}

const currentChatMessagesStoreCreator: StateCreator<
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
      // Only update profile if new value is defined
      if (chat.otherUserProfile !== undefined) {
        state.otherUserProfile = chat.otherUserProfile;
      }
      state.participants = chat.participants;
      state.type = chat.type;
      state.messages = {};
      state.orderedMessageIds = [];
      if (chat.messages) {
        state.messages = Object.fromEntries(chat.messages.map((m) => [m.messageId, m]));
        const messageIds = sortMessageIdsAsc(state.messages);
        state.orderedMessageIds = messageIds;
        state.unreadMessageIds = messageIds;
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
      state.unreadMessageIds = [];
      state.loadingMessages = false;
      state.page = 1;
      state.perPage = 20;
      state.total = 0;
      state.hasMore = false;
    }),
  setInitialMessages: (messages, page = 1, perPage = 20, total = 0, hasMore = false) =>
    set((state) => {
      state.messages = Object.fromEntries(messages.map((m) => [m.messageId, m]));
      const messageIds = sortMessageIdsAsc(state.messages);
      state.orderedMessageIds = messageIds;
      state.unreadMessageIds = messageIds;
      state.page = typeof page === "number" ? page : 1;
      state.perPage = typeof perPage === "number" ? perPage : 20;
      state.total = typeof total === "number" ? total : 0;
      state.hasMore = typeof hasMore === "boolean" ? hasMore : false;
    }),
  appendMessages: (messages, page, perPage) =>
    set((state) => {
      for (const m of messages) {
        state.messages[m.messageId] = m;
        if (!state.unreadMessageIds.includes(m.messageId)) {
          state.unreadMessageIds.push(m.messageId);
        }
      }
      state.orderedMessageIds = sortMessageIdsAsc(state.messages);
      if (typeof page === "number") state.page = page;
      if (typeof perPage === "number") state.perPage = perPage;
    }),
  addMessage: (message) =>
    set((state) => {
      // Prevent duplicate messages (e.g. optimistic insert + RT update)
      if (state.messages[message.messageId]) return;
      state.messages[message.messageId] = message;
      state.orderedMessageIds = sortMessageIdsAsc(state.messages);
      if (!state.unreadMessageIds.includes(message.messageId)) {
        state.unreadMessageIds.push(message.messageId);
      }
    }),
  updateMessage: (messageId, update) =>
    set((state) => {
      if (state.messages[messageId]) {
        const prevCreatedAt = state.messages[messageId].createdAt;
        state.messages[messageId] = { ...state.messages[messageId], ...update };
        // Solo reordenar si cambia createdAt
        if (update.createdAt && update.createdAt !== prevCreatedAt) {
          state.orderedMessageIds = sortMessageIdsAsc(state.messages);
        }
      }
    }),
  removeMessage: (messageId) =>
    set((state) => {
      delete state.messages[messageId];
      state.orderedMessageIds = state.orderedMessageIds.filter((id: string) => id !== messageId);
      state.unreadMessageIds = state.unreadMessageIds.filter((id: string) => id !== messageId);
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
  markAllAsRead: () =>
    set((state) => {
      // Store the IDs that are being marked as read for potential rollback
      state.lastMarkedAsReadMessageIds = [...state.unreadMessageIds];
      for (const id of state.unreadMessageIds) {
        if (state.messages[id]) {
          state.messages[id].readed = true;
        }
      }
      state.unreadMessageIds = [];
    }),

  revertMarkAllAsRead: () =>
    set((state) => {
      for (const id of state.lastMarkedAsReadMessageIds) {
        if (state.messages[id]) {
          state.messages[id].readed = false;
        }
        // Only add back to unreadMessageIds if not already present
        if (!state.unreadMessageIds.includes(id)) {
          state.unreadMessageIds.push(id);
        }
      }
      state.lastMarkedAsReadMessageIds = [];
    }),
});

export const useCurrentChatMessagesStore = create<ChatMessagesStore>()(
  persist(immer(currentChatMessagesStoreCreator), {
    name: "current-chat-messages-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
