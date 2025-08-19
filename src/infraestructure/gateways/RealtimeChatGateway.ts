import { RealtimeChannel } from "@supabase/supabase-js";
import { subscribeTable } from "../../utils/subscribeTable";
import { RealtimeChatHandler } from "../handlers/RealtimeChatHandlers";

/**
 * RealtimeChatGateway: Subscribes to realtime events and delegates to the service.
 */
export class RealtimeChatGateway {
  private service: RealtimeChatHandler;

  constructor(service: RealtimeChatHandler) {
    this.service = service;
  }

  // Listen for new messages in any chat
  onNewMessage(): RealtimeChannel {
    console.log("🎧 Setting up new message listener...");
    return subscribeTable("messages", ["INSERT"], (payload) => {
      console.log("💬 New message payload:", payload);
      const { new: message } = payload;
      if (message) {
        this.service.handleNewMessage({
          id: message.id,
          chatId: message.chat_id,
          senderId: message.sender_id,
          content: message.content,
          createdAt: message.created_at,
        });
      }
    });
  }

  // Listen for new chat creation
  onNewChat(): RealtimeChannel {
    console.log("🎧 Setting up new chat listener...");
    return subscribeTable("chats", ["INSERT"], (payload) => {
      console.log("💭 New chat payload:", payload);
      const { new: chat } = payload;
      if (chat) {
        this.service.handleNewChat({
          id: chat.id,
          name: chat.name,
          creatorId: chat.creator_id,
          createdAt: chat.created_at,
        });
      }
    });
  }

  // Listen for typing events (is_typing changes)
  onTypingEvent(): RealtimeChannel {
    console.log("🎧 Setting up typing listener...");
    return subscribeTable("typing_events", ["INSERT", "UPDATE"], (payload) => {
      console.log("⌨️ Typing event payload:", payload);
      const { new: typing } = payload;
      if (typing) {
        this.service.handleTypingEvent({
          chatId: typing.chat_id,
          userId: typing.user_id,
          isTyping: typing.is_typing,
          updatedAt: typing.updated_at,
        });
      }
    });
  }

  // Listen for user online/offline status changes
  onUserOnlineEvent(): RealtimeChannel {
    console.log("🎧 Setting up user online listener...");
    return subscribeTable("users", ["UPDATE"], (payload) => {
      console.log("👤 User online payload:", payload);
      const { new: user } = payload;
      if (user) {
        this.service.handleUserOnlineEvent({
          userId: user.id,
          isOnline: user.is_online,
          lastOnline: user.last_online,
        });
      }
    });
  }

  // Listen for unread message count changes
  onUnreadCountEvent(): RealtimeChannel {
    console.log("🎧 Setting up unread count listener...");
    return subscribeTable("messages", ["INSERT", "UPDATE"], (payload) => {
      console.log("📊 Unread count payload:", payload);
      const { new: message } = payload;
      if (message) {
        this.service.handleUnreadCountEvent({
          chatId: message.chat_id,
          userId: message.sender_id,
          unreadCount: -1,
          updatedAt: message.updated_at || message.created_at,
        });
      }
    });
  }

  /**
   * Start all listeners and return an unsubscribe function.
   */
  startAllRealtimeListeners(): () => void {
    const channels: RealtimeChannel[] = [
      this.onNewMessage(),
      this.onNewChat(),
      this.onTypingEvent(),
      this.onUserOnlineEvent(),
      this.onUnreadCountEvent(),
    ];
    return () => {
      console.log("🛑 Unsubscribing from all channels...");
      channels.forEach((ch) => ch.unsubscribe());
    };
  }
}
