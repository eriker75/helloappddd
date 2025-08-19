import {
  AddMessageToChatRequest,
  ChatListResponse,
  ChatResponse,
  CreateChatRequest,
  MessageListResponse,
  UpdateChatRequest,
} from "@/src/domain/models/chat.models";

export class ChatController {
  async findMyChatById(id: string): Promise<ChatResponse | null> {
    throw new Error("Method not implemented.");
  }

  async findMyChats(page: number, perPage: number): Promise<ChatListResponse> {
    throw new Error("Method not implemented.");
  }

  async createChat(chat: CreateChatRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async updateChat(chat: UpdateChatRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async deleteChat(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async getAllMyChatMessages(chatId: string, page: number, perPage: number): Promise<MessageListResponse> {
    throw new Error("Method not implemented.");
  }

  async sendMessageToChat(messageToAddData: AddMessageToChatRequest): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  async markAllMessagesFromChatAsRead(chatId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
