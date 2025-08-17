import { LastMessageStatus } from "@/src/definitions/enums/LastMessageStatus.enum";
import { Chat } from "@/src/domain/entities/Chat";
import { Message } from "@/src/domain/entities/Message";
import {
  AddMessageToChatRequest,
  ChatResponse,
  CreateChatRequest,
  MessageResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";

export function mapSingleChatResponseToChatEntity(singleChatResponse: ChatResponse): Chat {
  return {
    chatId: "",
    name: "",
    image: "",
    description: "",
    type: "private",
    lastMessageContent: "",
    lastMessageId: "",
    lastMessageStatus: LastMessageStatus.SENT,
    lastMessageCreatedAt: new Date(),
    lastMessageUpdatedAt: new Date(),
    unreadedCount: "",
    participants: [],
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mapSingleMessageResponseToMessageEntity(message: MessageResponse): Message {
  return {
    messageId: "",
    chatId: "",
    senderId: "",
    type: "image",
    readed: false,
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function mapPartialChatToCreateChatRequestData(partialChat: Partial<Chat>): CreateChatRequest {
  return {
    type: "private",
    participants: [],
  };
}

export function mapPartialChatToUpdateChatRequestData(partialChat: Partial<Chat>): UpdateChatRequest {
  return {
    participants: [],
  };
}

export default function mapPartialMessageToCreateSendMessageData(
  partialMessage: Partial<Message>
): Omit<AddMessageToChatRequest, "chatId"> {
  return {
    type: "text",
    parentId: "",
  };
}
