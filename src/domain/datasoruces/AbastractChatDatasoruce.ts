import { Chat } from "../entities/Chat";
import { Message } from "../entities/Message";

export abstract class AbastractChatDatasoruce {
  // CRUD
  abstract findMyChatById(id: string): Promise<Chat | null>;
  abstract findAllMyChats(): Promise<Chat[]>;
  abstract createChat(chat: Partial<Chat>): Promise<boolean>;
  abstract updateChat(chat: Partial<Chat>): Promise<boolean>;
  abstract deleteChat(id: string): Promise<boolean>;
  // Messages
  abstract getAllMyChatMessages(chatId: string): Promise<Message[]>;
  abstract sendMessageToChat(chatId: string, message: Message): Promise<Message>;
  abstract markAllMessagesFromChatAsRead(chatId: string): Promise<boolean>;
}
