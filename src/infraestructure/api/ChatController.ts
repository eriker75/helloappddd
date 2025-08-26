import {
  AddMessageToChatRequest,
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
  MessageListResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";
import { getAuthenticatedUser } from "@/src/utils/getAuthenticatedUser";
import { supabase } from "@/src/utils/supabase";

export class ChatController {
  async findMyChatById(id: string): Promise<ChatResponse | null> {
    const user = await getAuthenticatedUser();

    // Check if user is a participant in the chat
    const { data: participantRows, error: partError } = await supabase
      .from("participants")
      .select("chat_id")
      .eq("user_id", user.id)
      .eq("chat_id", id);

    if (partError) {
      throw new Error("Error checking chat participation: " + partError.message);
    }

    if (!participantRows || participantRows.length === 0) {
      return null;
    }

    // Fetch the chat
    const { data: chats, error } = await supabase.from("chats").select("*").eq("id", id).eq("is_active", true);

    if (error) {
      throw new Error("Error fetching chat: " + error.message);
    }

    if (!chats || chats.length === 0) {
      return null;
    }

    return chats[0] as ChatResponse;
  }

  async findMyChats(page: number, perPage: number): Promise<ChatListResponse> {
    const user = await getAuthenticatedUser();

    // Get all chat_ids where user is a participant
    const { data: participantRows, error: partError } = await supabase
      .from("participants")
      .select("chat_id")
      .eq("user_id", user.id);

    if (partError) {
      throw new Error("Error fetching user chats: " + partError.message);
    }

    const chatIds = (participantRows ?? []).map((row: any) => row.chat_id);

    if (chatIds.length === 0) {
      return {
        chats: [],
        page,
        perPage,
        total: 0,
        hasMore: false,
      };
    }

    // Pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get total count
    const { count, error: countError } = await supabase
      .from("chats")
      .select("*", { count: "exact", head: true })
      .in("id", chatIds)
      .eq("is_active", true);

    if (countError) {
      throw new Error("Error counting chats: " + countError.message);
    }

    // Get paginated chats
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .in("id", chatIds)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error("Error fetching chats: " + error.message);
    }

    // For each chat, enrich with participants, unreadedCount, last_message, other_user_profile
    const enrichedChats: ChatResponse[] = await Promise.all(
      (chats ?? []).map(async (chat: any) => {
        // Fetch participants
        const { data: participantsRows, error: participantsError } = await supabase
          .from("participants")
          .select("user_id")
          .eq("chat_id", chat.id);

        if (participantsError) {
          throw new Error("Error fetching chat participants: " + participantsError.message);
        }

        const participants = (participantsRows ?? []).map((row: any) => row.user_id);

        // Count unread messages for current user (from other users)
        const { count: unreadedCount, error: unreadError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("chat_id", chat.id)
          .eq("readed", false)
          .neq("sender_id", user.id);

        if (unreadError) {
          throw new Error("Error fetching unread message count: " + unreadError.message);
        }

        // Fetch last message
        let last_message: any = undefined;
        if (chat.last_message_id) {
          const { data: lastMsgArr, error: lastMsgError } = await supabase
            .from("messages")
            .select("*")
            .eq("id", chat.last_message_id)
            .maybeSingle();

          if (lastMsgError) {
            throw new Error("Error fetching last message: " + lastMsgError.message);
          }
          last_message = lastMsgArr || undefined;
        }

        // For private chat, fetch other user's profile
        let other_user_profile: any = undefined;
        if (chat.type === "private" && participants.length === 2) {
          const otherUserId = participants.find((uid: string) => uid !== user.id);
          if (otherUserId) {
            const { data: profileRow, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", otherUserId)
              .maybeSingle();

            if (profileError) {
              throw new Error("Error fetching other user profile: " + profileError.message);
            }
            other_user_profile = profileRow || undefined;
          }
        }

        return {
          id: chat.id,
          name: chat.name,
          creator_id: chat.creator_id,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          participants,
          type: chat.type,
          image: chat.image,
          description: chat.description ?? "",
          unreadedCount: unreadedCount ?? 0,
          last_message_id: chat.last_message_id ?? undefined,
          is_active: chat.is_active ?? true,
          last_message,
          other_user_profile,
        } as ChatResponse;
      })
    );

    return {
      chats: enrichedChats,
      page,
      perPage,
      total: count ?? 0,
      hasMore: to + 1 < (count ?? 0),
    };
  }

  async createChat(req: CreateChatRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();

    const { type, description, name, image, participants } = req;
    const creator_id = user.id;

    if (!type || !participants || participants.length === 0) {
      throw new Error("type and participants are required");
    }
    // Enforce chat type rules
    if (type === "private" && participants.length !== 1) {
      throw new Error("A private chat must have exactly one participant (besides the creator).");
    }

    // Insert chat (without participants)
    const { data, error } = await supabase
      .from("chats")
      .insert([
        {
          type,
          description: description ?? "",
          name: name ?? "",
          image: image ?? "",
          creator_id,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      throw new Error("Error creating chat: " + (error?.message || "Unknown error"));
    }

    const chat = data[0];

    // Insert participants (excluding creator, who is added by trigger)
    const participantsToAdd = participants.filter((id) => id !== creator_id);
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

    // Compose ChatResponse (participants will be resolved elsewhere)
    const response: ChatResponse = {
      id: chat.id,
      name: chat.name,
      creator_id: chat.creator_id,
      created_at: chat.created_at,
      updated_at: chat.updated_at,
      participants: participants, // This may need to be resolved via a join in a real query
      type: chat.type,
      image: chat.image,
      description: chat.description ?? "",
      unreadedCount: 0,
      last_message_id: chat.last_message_id ?? undefined,
      is_active: chat.is_active ?? true,
      last_message: undefined,
      other_user_profile: undefined,
    };
    console.log(response);

    return true;
  }

  async updateChat(chatId: string, req: UpdateChatRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();
    const { description, name, image, participants } = req;

    // Only allow update if the authenticated user is the creator
    const { error: updateError } = await supabase
      .from("chats")
      .update({
        ...(description !== undefined && { description }),
        ...(name !== undefined && { name }),
        ...(image !== undefined && { image }),
        updated_at: new Date().toISOString(),
      })
      .eq("id", chatId)
      .eq("creator_id", user.id);

    if (updateError) {
      throw new Error("Error updating chat: " + updateError.message);
    }

    // Update participants if provided
    if (participants) {
      // Remove all non-creator participants
      const { error: deleteError } = await supabase
        .from("participants")
        .delete()
        .eq("chat_id", chatId)
        .neq("user_id", user.id);

      if (deleteError) {
        throw new Error("Error removing old participants: " + deleteError.message);
      }

      // Insert new participants (excluding creator)
      const participantsToAdd = participants.filter((id) => id !== user.id);
      if (participantsToAdd.length > 0) {
        const participantRows = participantsToAdd.map((user_id) => ({
          chat_id: chatId,
          user_id,
          role: "member",
        }));
        const { error: insertError } = await supabase.from("participants").insert(participantRows);

        if (insertError) {
          throw new Error("Error adding new participants: " + insertError.message);
        }
      }
    }

    return true;
  }

  async deleteChat(chatId: string): Promise<boolean> {
    const user = await getAuthenticatedUser();

    const { error } = await supabase
      .from("chats")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", chatId)
      .eq("creator_id", user.id);

    if (error) {
      throw new Error("Error deactivating chat: " + error.message);
    }

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

    if (error) {
      throw new Error("Error listing messages: " + error.message);
    }

    const total = typeof count === "number" ? count : messages ? messages.length : 0;
    const hasMore = to + 1 < total;

    return {
      messages: messages as any, // Should be MessageResponse[]
      page,
      perPage,
      total,
      hasMore,
    };
  }

  async sendMessageToChat(req: AddMessageToChatRequest): Promise<boolean> {
    const user = await getAuthenticatedUser();

    const { content, draftContent, type, chatId, parentId } = req;

    if (!type || !chatId) {
      throw new Error("type and chatId are required");
    }

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

    if (error || !data || data.length === 0) {
      throw new Error("Error posting message: " + (error?.message || "Unknown error"));
    }
    const message_id = data[0].id;
    // Update last_message_id in the chat
    const { error: updateError } = await supabase
      .from("chats")
      .update({ last_message_id: message_id })
      .eq("id", chatId);
    if (updateError) {
      throw new Error("Message inserted but failed to update last_message_id: " + updateError.message);
    }
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
}
