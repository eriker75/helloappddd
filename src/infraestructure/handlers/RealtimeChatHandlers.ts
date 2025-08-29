/**
 * RealtimeChatHandler: Contains business logic for handling realtime chat events.
 * NOTE: Uses Zustand store getState() methods for imperative state updates outside React components.
 */
import { LastMessageStatus } from "@/src/definitions/enums/LastMessageStatus.enum";
import { ChatType } from "@/src/definitions/types/ChatType.type";
import { MessageContentType } from "@/src/definitions/types/MessageContent.type";
import { useAuthUserProfileStore } from "@/src/presentation/stores/auth-user-profile.store";
import { useChatListStore } from "@/src/presentation/stores/chat-list.store";
import { useCurrentChatMessagesStore } from "@/src/presentation/stores/current-chat-messages.store";

export class RealtimeChatHandler {
  /**
   * Handle an incoming new message event from realtime backend.
   * Updates both messages store and chat list state.
   */
  /**
   * Handle an incoming new message event from realtime backend.
   * Only adds to state if the sender is NOT the current user.
   */
  handleNewMessage(newMessageEvent: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
    createdAt: string;
    type: string;
    // Optionally more fields possible (status, etc.)
  }) {
    console.log("🧠 [Handler] Handling new message event:", newMessageEvent);

    const myUserId = useAuthUserProfileStore.getState().userId;
    // Only handle messages written BY OTHERS
    if (newMessageEvent.senderId === myUserId) return;

    useCurrentChatMessagesStore.getState().addMessage({
      messageId: newMessageEvent.id,
      chatId: newMessageEvent.chatId,
      senderId: newMessageEvent.senderId,
      content: newMessageEvent.content,
      type: newMessageEvent.type as MessageContentType,
      readed: true,
      deleted: false,
      status: "received",
      createdAt: new Date(newMessageEvent.createdAt),
      updatedAt: new Date(newMessageEvent.createdAt),
      // Add other required properties and handle event-provided extensions
    });

    useChatListStore.getState().updateChatLastMessage(newMessageEvent.chatId, {
      id: newMessageEvent.id,
      content: newMessageEvent.content,
      status: "received",
      isByMe: false,
      createdAt: newMessageEvent.createdAt,
    });
  }

  /**
   * Handle an incoming new chat event from realtime backend.
   * Adds the new chat to the chat list state.
   */
  handleNewChat(newChatEvent: {
    id: string;
    name: string;
    creatorId: string;
    createdAt: string;
    type: string;
    // Optionally more fields (participants, type, etc.)
  }) {
    console.log("🧠 [Handler] Handling new chat event:", newChatEvent);

    useChatListStore.getState().addChat({
      chatId: newChatEvent.id,
      name: newChatEvent.name,
      creatorId: newChatEvent.creatorId,
      createdAt: new Date(newChatEvent.createdAt),
      updatedAt: new Date(newChatEvent.createdAt),
      image: "",
      description: "",
      type: newChatEvent.type as ChatType,
      lastMessageId: "",
      lastMessageContent: "",
      lastMessageStatus: LastMessageStatus.SENT,
      lastMessageCreatedAt: new Date(newChatEvent.createdAt),
      lastMessageUpdatedAt: new Date(newChatEvent.createdAt),
      unreadedCount: 0,
      participants: [],
      isActive: true,
      // Add other required properties; adapt as event expands
    });
  }

  handleTypingEvent(newTypingEvent: { chatId: string; userId: string; isTyping: boolean; updatedAt: string }) {
    // Business logic for a typing event
    console.log("🧠 [Handler] Handling typing event:", newTypingEvent);
    // TODO: Implement typing state update if store exists
  }

  /**
   * Handle a realtime update that a user has come online or gone offline.
   * If you want to reflect this in the UI, consider extending the chat/user stores with online status per user.
   */
  handleUserOnlineEvent(newUserOnlineEvent: { userId: string; isOnline: boolean; lastOnline: string }) {
    console.log("🧠 [Handler] Handling user online event:", newUserOnlineEvent);
    // TODO: Implement state update for user online/offline in store if/when such field exists.
    // For now, this is logged only.
  }

  handleUnreadCountEvent(newUnreadedCountEvent: {
    chatId: string;
    userId: string;
    unreadCount: number;
    updatedAt: string;
  }) {
    // Business logic for an unread count event
    console.log("🧠 [Handler] Handling unread count event:", newUnreadedCountEvent);
    // TODO: Optionally, update unread counts in chatListStore with setChatUnreadCount if needed
    // useChatListStore.getState().setChatUnreadCount(newUnreadedCountEvent.chatId, newUnreadedCountEvent.unreadCount);
  }
}
