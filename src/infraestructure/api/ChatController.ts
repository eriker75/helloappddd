import {
  AddMessageToChatRequest,
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
  MessageListResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";

export class ChatController {
  findMyChatById(id: string): Promise<ChatResponse | null> {
    throw new Error("Method not implemented.");
  }

  findAllMyChats(): Promise<ChatListResponse> {
    throw new Error("Method not implemented.");
  }

  createChat(chat: CreateChatRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  updateChat(chat: UpdateChatRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteChat(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getAllMyChatMessages(chatId: string): Promise<MessageListResponse> {
    throw new Error("Method not implemented.");
  }

  sendMessageToChat(
    messageToAddData: AddMessageToChatRequest
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  markAllMessagesFromChatAsRead(chatId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
