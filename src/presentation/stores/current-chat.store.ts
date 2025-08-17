import { Message } from "@/src/domain/models/Message";
import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { zustandAsyncStorage } from "../../utils/zustandAsyncStorage";

export interface CurrentChatState {
  chatId: string;
  chatName: string;
  chatImage: string;
  chatIsActive: boolean;
  messages: Message[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface CurrentChatActions {
  setCurrentChat: (
    chat: Omit<
      CurrentChatState,
      "messages" | "page" | "perPage" | "total" | "hasMore"
    > & {
      messages?: Message[];
      page?: number;
      perPage?: number;
      total?: number;
      hasMore?: boolean;
    }
  ) => void;
  clearCurrentChat: () => void;
  setMessages: (messages: Message[]) => void;
  appendMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, update: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
  setLoadingMessages: (loading: boolean) => void;
  setPagination: (pagination: {
    page: number;
    perPage: number;
    total: number;
    hasMore: boolean;
  }) => void;
}

export type CurrentChatStore = CurrentChatState & CurrentChatActions;

const initialState: CurrentChatState = {
  chatId: "",
  chatName: "",
  chatImage: "",
  chatIsActive: false,
  messages: [],
  page: 1,
  perPage: 20,
  total: 0,
  hasMore: false,
};

function sortMessagesDesc(messages: Message[]): Message[] {
  return [...messages].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const currentChatStoreCreator: StateCreator<
  CurrentChatStore,
  [["zustand/immer", never]],
  [["zustand/persist", unknown]]
> = (set) => ({
  ...initialState,
  setCurrentChat: (chat) =>
    set((state) => {
      state.chatId = chat.chatId;
      state.chatName = chat.chatName;
      state.chatImage = chat.chatImage;
      state.chatIsActive = chat.chatIsActive;
      state.messages = sortMessagesDesc(chat.messages ?? []);
      state.page = chat.page ?? 1;
      state.perPage = chat.perPage ?? 20;
      state.total = chat.total ?? 0;
      state.hasMore = typeof chat.hasMore === "boolean" ? chat.hasMore : false;
    }),
  clearCurrentChat: () =>
    set((state) => {
      state.chatId = "";
      state.chatName = "";
      state.chatImage = "";
      state.chatIsActive = false;
      state.messages = [];
      state.loadingMessages = false;
      state.page = 1;
      state.perPage = 20;
      state.total = 0;
      state.hasMore = false;
    }),
  setMessages: (messages) =>
    set((state) => {
      state.messages = sortMessagesDesc(messages);
    }),
  appendMessages: (messages) =>
    set((state) => {
      state.messages = sortMessagesDesc([...state.messages, ...messages]);
    }),
  addMessage: (message) =>
    set((state) => {
      state.messages = sortMessagesDesc([message, ...state.messages]);
    }),
  updateMessage: (messageId, update) =>
    set((state) => {
      const idx = state.messages.findIndex(
        (m: Message) => m.messageId === messageId
      );
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], ...update };
        state.messages = sortMessagesDesc(state.messages);
      }
    }),
  removeMessage: (messageId) =>
    set((state) => {
      state.messages = state.messages.filter(
        (m: Message) => m.messageId !== messageId
      );
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
});

export const currentChatStore = create<CurrentChatStore>()(
  persist(immer(currentChatStoreCreator), {
    name: "current-chat-store",
    storage: zustandAsyncStorage,
    partialize: (state) => ({ ...state }),
  })
);
