import { AbastractChatDatasoruce } from "@/src/domain/datasoruces/AbastractChatDatasoruce";
import { Chat } from "@/src/domain/entities/Chat";
import { Message } from "@/src/domain/entities/Message";
import { ChatController } from "../api/ChatController";

export class ChatDatasourceImpl implements AbastractChatDatasoruce {
  private controller: ChatController;

  constructor() {
    this.controller = new ChatController();
  }

  findMyChatById(id: string): Promise<Chat | null> {
    throw new Error("Method not implemented.");
  }

  findAllMyChats(): Promise<Chat[]> {
    throw new Error("Method not implemented.");
  }

  createChat(chat: Partial<Chat>): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  updateChat(chat: Partial<Chat>): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  deleteChat(id: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  getAllMyChatMessages(chatId: string): Promise<Message[]> {
    throw new Error("Method not implemented.");
  }

  sendMessageToChat(chatId: string, message: Message): Promise<Message> {
    throw new Error("Method not implemented.");
  }

  markAllMessagesFromChatAsRead(chatId: string): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
}
