import { Chat, PaginatedChats } from "../entities/Chat";
import { Message, PaginatedMessages } from "../entities/Message";

export abstract class AbastractChatDatasoruce {
  // CRUD
  abstract findMyChatById(id: string): Promise<Chat | null>;
  abstract findAllMyChats(page: number, perPage: number): Promise<PaginatedChats>;
  abstract createChat(chat: Partial<Chat>): Promise<boolean>;
  abstract updateChat(chat: Partial<Chat>): Promise<boolean>;
  abstract deleteChat(id: string): Promise<boolean>;
  // Messages
  abstract getAllMyChatMessages(chatId: string, page: number, perPage: number): Promise<PaginatedMessages>;
  abstract sendMessageToChat(chatId: string, message: Message): Promise<boolean>;
  abstract markAllMessagesFromChatAsRead(chatId: string): Promise<boolean>;
}
