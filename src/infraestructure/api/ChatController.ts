import {
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
  MessageListResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";
import { getAuthenticatedUser } from "@/src/utils/getAuthenticatedUser";
import { logWithColor } from "@/src/utils/logWithColor";
import { supabase } from "@/src/utils/supabase";

export class ChatController {
  // --- Helper: Fetch full user profile (public info) by userId ---
  private async fetchUserProfileByUserId(user_id: string): Promise<any | null> {
    const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user_id).single();
    if (error || !data) return null;
    // Could map/normalize if needed
    return data;
  }

  // The following methods are restored to match datasource/repository dependencies

  async findMyChatById(id: string): Promise<ChatResponse | null> {
    console.log('\x1b[33m\n[ChatController] ====> START findMyChatById ====\n\x1b[0m');
    const user = await getAuthenticatedUser();
    const { data: participantRows } = await supabase
      .from("participants")
      .select("chat_id, user_id")
      .eq("chat_id", id);

    if (!participantRows || participantRows.length === 0) return null;

    const { data: chats } = await supabase.from("chats").select("*").eq("id", id).eq("is_active", true);

    if (!chats || chats.length === 0) return null;

    let chat = chats[0] as ChatResponse;

    // --- PATCH: always populate chat.participants from participants table! ---
    const { data: chatParticipants, error: participantsError } = await supabase
      .from("participants")
      .select("user_id")
      .eq("chat_id", chat.id);
    if (Array.isArray(chatParticipants)) {
      chat.participants = chatParticipants.map((pr: any) => pr.user_id);
    } else {
      chat.participants = [];
    }

    logWithColor(participantsError, "red");

    // For private chats: attach other_user_profile
    if (chat.type === "private" && Array.isArray(chat.participants)) {
      // Find other participant
      const myId = user.id;
      const otherUserId = chat.participants.find(pid => pid !== myId);
      if (otherUserId) {
        const otherProfile = await this.fetchUserProfileByUserId(otherUserId);
        if (otherProfile) {
          chat.other_user_profile = otherProfile;
          console.log(
            `\n\x1b[32m[ChatController] findMyChatById id=${chat.id} type=private, attached other_user_profile:\n${JSON.stringify(
              {
                alias: otherProfile.alias,
                avatar: otherProfile.avatar,
                user_id: otherProfile.user_id,
                full_profile: otherProfile,
              },
              null,
              2,
            )}\x1b[0m\n`
          );
        } else {
          console.warn(`[ChatController] findMyChatById id=${chat.id} type=private, FAILED to attach other_user_profile`);
        }
      }
    } else {
      console.log(`[ChatController] findMyChatById id=${chat.id} type=${chat.type}, no other_user_profile relevant`);
    }
    return chat;
  }

  async findMyChats(page: number, perPage: number): Promise<ChatListResponse> {
    console.log('\x1b[33m\n[ChatController] ====> START findMyChats ====\n\x1b[0m');
    // Dummy pagination logic
    const user = await getAuthenticatedUser();
    const { data: participantRows } = await supabase.from("participants").select("chat_id").eq("user_id", user.id);
    const chatIds = (participantRows ?? []).map((row: any) => row.chat_id);

    const { data: chats } = await supabase.from("chats").select("*").in("id", chatIds).eq("is_active", true);

    // Compose other_user_profile for each private chat
    let chatsWithProfiles: ChatResponse[] = Array.isArray(chats) ? [...chats] : [];

    // --- PATCH: get participants for all chats in parallel, then inject! ---
    const chatIdList = chatsWithProfiles.map(chat => chat.id);
    let allParticipants: { [chatId: string]: string[] } = {};
    if (chatIdList.length > 0) {
      const { data: participantsData } = await supabase
        .from("participants")
        .select("chat_id, user_id")
        .in("chat_id", chatIdList);

      if (Array.isArray(participantsData)) {
        for (const p of participantsData) {
          if (!allParticipants[p.chat_id]) allParticipants[p.chat_id] = [];
          allParticipants[p.chat_id].push(p.user_id);
        }
      }
    }
    // Inject participants into each chat
    chatsWithProfiles.forEach(chat => {
      chat.participants = allParticipants[chat.id] || [];
    });

    // Prepare a mapping of private chat indexes to other user ids
    const privateChatIndexes: [number, string][] = [];
    chatsWithProfiles.forEach((chat, idx) => {
      if (chat.type === "private" && Array.isArray(chat.participants)) {
        const myId = user.id;
        const otherUserId = chat.participants.find((pid: string) => pid !== myId);
        if (otherUserId) {
          privateChatIndexes.push([idx, otherUserId]);
        }
      }
    });

    // Batch fetch all required profiles
    const otherUserIds = privateChatIndexes.map(([, uid]) => uid);
    const profilesByUserId: Record<string, any> = {};
    if (otherUserIds.length > 0) {
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", otherUserIds);
      if (Array.isArray(profiles)) {
        for (const profile of profiles) {
          profilesByUserId[profile.user_id] = profile;
        }
      }
    }
    // Attach to result
    for (const [idx, uid] of privateChatIndexes) {
      if (profilesByUserId[uid]) {
        (chatsWithProfiles[idx] as any).other_user_profile = profilesByUserId[uid];
        console.log(
          `\n\x1b[32m[ChatController] findMyChats chatId=${chatsWithProfiles[idx].id} attached other_user_profile:\n${JSON.stringify(
            {
              alias: profilesByUserId[uid].alias,
              avatar: profilesByUserId[uid].avatar,
              user_id: profilesByUserId[uid].user_id,
              full_profile: profilesByUserId[uid],
            },
            null,
            2,
          )}\x1b[0m\n`
        );
      } else {
        console.warn(`[ChatController] findMyChats chatId=${chatsWithProfiles[idx].id} FAILED to attach other_user_profile`);
      }
    }

    // --- PATCH: Batch fetch last messages for ALL chats and attach as last_message ---
    const lastMessageIds = chatsWithProfiles
      .map(chat => chat.last_message_id)
      .filter((id: string | undefined) => !!id);

    let lastMessagesById: Record<string, any> = {};
    if (lastMessageIds.length > 0) {
      const { data: lastMessagesData } = await supabase
        .from("messages")
        .select("*")
        .in("id", lastMessageIds);
      if (Array.isArray(lastMessagesData)) {
        for (const message of lastMessagesData) {
          lastMessagesById[message.id] = message;
        }
      }
    }

    // Attach last_message to each chat (if available)
    chatsWithProfiles.forEach(chat => {
      if (chat.last_message_id && lastMessagesById[chat.last_message_id]) {
        chat.last_message = lastMessagesById[chat.last_message_id];
      }
    });

    return {
      chats: chatsWithProfiles,
      page,
      perPage,
      total: chatsWithProfiles.length,
      hasMore: false,
    };
  }

  async createChat(req: CreateChatRequest): Promise<ChatResponse> {
    const user = await getAuthenticatedUser();
    const { type, description, name, participants } = req;

    // Validate participants per chat type (private=1 other, groupal>=1 other)
    if (!type || !participants) throw new Error("type and participants required");
    if (type === "private" && participants.length !== 1) {
      throw new Error("Private chat must have exactly one participant (other user)");
    }
    if (type === "group" && participants.length < 1) {
      throw new Error("Group chat must have at least one other participant");
    }

    // For private, prevent duplicate chat between two users
    if (type === "private") {
      const existingChat = await this.findPrivateChatWithUser(participants[0]);
      if (existingChat) return existingChat;
    }

    // Insert chat (creator_id will be added as participant by DB trigger)
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          type,
          description: description ?? "",
          name: name ?? "",
          creator_id: user.id,
        },
      ])
      .select();

    if (error || !data || data.length === 0) throw new Error("Error creating chat: " + error?.message);

    const chat = data[0];

    // Insert participants (other than the creator, who is inserted by trigger)
    const participantsToAdd = participants.filter((id) => id !== user.id);
    if (participantsToAdd.length > 0) {
      const participantRows = participantsToAdd.map((user_id) => ({
        chat_id: chat.id,
        user_id,
        role: "member",
      }));
      const { error: participantsError } = await supabase.from("participants").insert(participantRows);

      if (participantsError) {
        throw new Error("Error adding participants: " + participantsError.message);
      }
    }

    return chat as ChatResponse;
  }

  async updateChat(chatId: string, req: UpdateChatRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
      .from("chats")
      .update({ ...req, updated_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("creator_id", user.id);

    if (error) throw new Error("Error updating chat: " + error.message);
    return true;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { error } = await supabase
      .from("chats")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("creator_id", user.id);

    if (error) throw new Error("Error deactivating chat: " + error.message);
    return true;
  }

  async getAllMyChatMessages(chatId: string, page: number, perPage: number): Promise<MessageListResponse> {
    await getAuthenticatedUser();
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const {
      data: messages,
      error,
      count,
    } = await supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })
      .range(from, to);

    if (error) throw new Error("Error listing messages: " + error.message);

    return {
      messages: messages ?? [],
      page,
      perPage,
      total: typeof count === "number" ? count : messages ? messages.length : 0,
      hasMore: to + 1 < (count ?? 0),
    };
  }

  async sendMessageToChat(req: any): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { content, draftContent, type, chatId, parentId } = req;

    if (!type || !chatId) throw new Error("type and chatId are required");

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: chatId,
          content: content ?? "",
          draft_content: draftContent ?? "",
          type,
          sender_id: user.id,
          parent_id: parentId ?? null,
          readed: false,
          deleted: false,
          status: "sent",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error || !data || data.length === 0) throw new Error("Error posting message: " + error?.message);
    const message_id = data[0].id;

    // Update last_message_id in the chat
    const { error: updateError } = await supabase
      .from("chats")
      .update({ last_message_id: message_id })
      .eq("id", chatId);

    if (updateError) throw new Error("Message inserted but failed to update last_message_id: " + updateError.message);

    return true;
  }

  async markAllMessagesFromChatAsRead(chatId: string): Promise<boolean> {
    await getAuthenticatedUser(); // Ensure user is authenticated

    const { error } = await supabase
      .from("messages")
      .update({ readed: true, updated_at: new Date().toISOString() })
      .eq("chat_id", chatId);

    if (error) {
      throw new Error("Error marking messages as read: " + error.message);
    }

    return true;
  }

  /**
   * Finds a private chat between the current user and another user, or null.
   * Returns the raw ChatResponse object for mapping at higher layers.
   */
  async findPrivateChatWithUser(otherUserId: string): Promise<ChatResponse | null> {
    const user = await getAuthenticatedUser();
    if (!user?.id || !otherUserId) return null;

    const { data: participantRows, error } = await supabase
      .from("participants")
      .select("chat_id")
      .in("user_id", [user.id, otherUserId]);
    if (error) return null;

    const chatIdCount: Record<string, number> = {};
    for (const row of participantRows ?? []) {
      chatIdCount[row.chat_id] = (chatIdCount[row.chat_id] || 0) + 1;
    }
    const pairChatIds = Object.entries(chatIdCount)
      .filter(([, count]) => count === 2)
      .map(([chat_id]) => chat_id);

    if (pairChatIds.length > 0) {
      const { data: chats, error: chatsError } = await supabase
        .from("chats")
        .select("*")
        .in("id", pairChatIds)
        .eq("type", "private")
        .eq("is_active", true);
      if (chatsError || !chats || chats.length === 0) return null;
      return chats[0] as ChatResponse;
    }
    return null;
  }
}
