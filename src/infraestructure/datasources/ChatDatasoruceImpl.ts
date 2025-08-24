import { AbastractChatDatasoruce } from "@/src/domain/datasoruces/AbastractChatDatasoruce";
import { Chat, PaginatedChats } from "@/src/domain/entities/Chat";
import { Message, PaginatedMessages } from "@/src/domain/entities/Message";
import { ChatController } from "../api/ChatController";
import mapPartialMessageToCreateSendMessageData, {
  mapPartialChatToCreateChatRequestData,
  mapPartialChatToUpdateChatRequestData,
  mapSingleChatResponseToChatEntity,
  mapSingleMessageResponseToMessageEntity,
} from "../mappers/ChatMapper";

export class ChatDatasourceImpl implements AbastractChatDatasoruce {
  private controller: ChatController;

  constructor() {
    this.controller = new ChatController();
  }

  async findMyChatById(id: string): Promise<Chat | null> {
    const singleChatResponse = await this.controller.findMyChatById(id);
    if (!singleChatResponse) return null;
    return mapSingleChatResponseToChatEntity(singleChatResponse);
  }

  async findMyChats(page: number, perPage: number): Promise<PaginatedChats> {
    const allMyChats = await this.controller.findMyChats(page, perPage);
    const chats = allMyChats.chats.map((chat) => mapSingleChatResponseToChatEntity(chat));
    return {
      chats,
      page,
      perPage,
      hasMore: allMyChats.hasMore,
      total: allMyChats.total,
    };
  }

  async createChat(chat: Partial<Chat>): Promise<boolean> {
    const chatRequestData = mapPartialChatToCreateChatRequestData(chat);
    return await this.controller.createChat(chatRequestData);
  }

  async updateChat(chatId: string, chat: Partial<Chat>): Promise<boolean> {
    const updateChatData = mapPartialChatToUpdateChatRequestData(chat);
    return await this.controller.updateChat(chatId, updateChatData);
  }

  async deleteChat(id: string): Promise<boolean> {
    return await this.controller.deleteChat(id);
  }

  async getAllMyChatMessages(chatId: string, page: number, perPage: number): Promise<PaginatedMessages> {
    const allMyChatsMessages = await this.controller.getAllMyChatMessages(chatId, page, perPage);
    const messages = allMyChatsMessages.messages.map((message) => mapSingleMessageResponseToMessageEntity(message));
    return {
      messages,
      chatId,
      page,
      perPage,
      hasMore: allMyChatsMessages.hasMore,
      total: allMyChatsMessages.total,
    };
  }

  async sendMessageToChat(chatId: string, message: Partial<Message>): Promise<boolean> {
    const createMessageToSendData = mapPartialMessageToCreateSendMessageData(message);
    return await this.controller.sendMessageToChat({
      ...createMessageToSendData,
      chatId,
    });
  }

  async markAllMessagesFromChatAsRead(chatId: string): Promise<boolean> {
    return await this.controller.markAllMessagesFromChatAsRead(chatId);
  }
}
