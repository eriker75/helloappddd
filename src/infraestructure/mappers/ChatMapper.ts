import { LastMessageStatus } from "@/src/definitions/enums/LastMessageStatus.enum";
import { ChatType } from "@/src/definitions/types/ChatType.type";
import { MessageType } from "@/src/definitions/types/MessageType.type";
import { Chat } from "@/src/domain/entities/Chat";
import { Message } from "@/src/domain/entities/Message";
import {
  AddMessageToChatRequest,
  ChatResponse,
  CreateChatRequest,
  MessageResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";
import { mapUserProfileResponseToUserProfileEntity } from "./UserProfileMapper";

/**
 * Maps ChatResponse (API model) to Chat (domain entity).
 * Note: Fields like image, description, type, is_active, unreadedCount, and status must exist in the response for correct mapping.
 * If not present, ensure the model is updated or provide appropriate fallbacks here.
 */
export function mapSingleChatResponseToChatEntity(singleChatResponse: ChatResponse): Chat {
  console.log("\x1b[36m"+JSON.stringify(singleChatResponse, null, 2)+"\x1b[0m");

  let name: string = "";
  let image: string = "";
  if (singleChatResponse.type === "private") {
    name = singleChatResponse?.other_user_profile?.alias ?? "";
    image = singleChatResponse?.other_user_profile?.avatar ?? "";
  }

  return {
    chatId: singleChatResponse.id,
    name,
    image,
    description: singleChatResponse.description ?? "",
    type: (singleChatResponse.type as ChatType) ?? "private",
    lastMessageContent: singleChatResponse.last_message?.content ?? "",
    lastMessageId: singleChatResponse.last_message_id ?? "",
    lastMessageStatus: (singleChatResponse.last_message?.status as LastMessageStatus) ?? LastMessageStatus.UNKNOWN,
    lastMessageCreatedAt: singleChatResponse.last_message?.created_at
      ? new Date(singleChatResponse.last_message.created_at)
      : new Date(singleChatResponse.created_at),
    lastMessageUpdatedAt: singleChatResponse.last_message?.updated_at
      ? new Date(singleChatResponse.last_message.updated_at)
      : new Date(singleChatResponse.updated_at),
    unreadedCount: singleChatResponse.unreadedCount ?? 0,
    participants: singleChatResponse.participants ?? [],
    isActive: singleChatResponse.is_active,
    createdAt: new Date(singleChatResponse.created_at),
    updatedAt: new Date(singleChatResponse.updated_at),
    ...(singleChatResponse.other_user_profile
      ? {
          otherUserProfile: mapUserProfileResponseToUserProfileEntity(singleChatResponse.other_user_profile),
        }
      : {}),
  };
}

/**
 * Maps MessageResponse (API model) to Message (domain entity).
 * Note: Fields like readed, deleted, and status must exist in the response for correct mapping.
 * If not present, ensure the model is updated or provide appropriate fallbacks here.
 */
export function mapSingleMessageResponseToMessageEntity(message: MessageResponse): Message {
  return {
    messageId: message.id,
    chatId: message.chat_id,
    senderId: message.sender_id,
    type: message.type as MessageType,
    content: message.content,
    readed: message.readed,
    deleted: message.deleted,
    status: (message?.status as LastMessageStatus) ?? LastMessageStatus.UNKNOWN,
    createdAt: new Date(message.created_at),
    updatedAt: new Date(message.updated_at),
  };
}

export function mapPartialChatToCreateChatRequestData(partialChat: Partial<Chat>): CreateChatRequest {
  return {
    type: partialChat.type ?? "private",
    description: partialChat.description,
    name: partialChat.name,
    image: partialChat.image,
    participants: partialChat.participants ?? [],
  };
}

export function mapPartialChatToUpdateChatRequestData(partialChat: Partial<Chat>): UpdateChatRequest {
  return {
    description: partialChat.description,
    name: partialChat.name,
    image: partialChat.image,
    participants: partialChat.participants,
  };
}

export default function mapPartialMessageToCreateSendMessageData(
  partialMessage: Partial<Message>
): Omit<AddMessageToChatRequest, "chatId"> {
  return {
    content: partialMessage.content,
    draftContent: partialMessage.draftContent,
    type: partialMessage.type ?? "text",
    parentId: partialMessage.parentId ?? "",
  };
}
