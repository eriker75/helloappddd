import { ChatType } from "@/src/definitions/types/ChatType.type";
import { MessageType } from "@/src/definitions/types/MessageType.type";

export interface CreateChatRequest {
  type: ChatType;
  description?: string;
  name?: string;
  image?: string;
  participants: string[];
}

export interface UpdateChatRequest {
  description?: string;
  name?: string;
  image?: string;
  participants?: string[];
}

export interface ChatResponse {
  id: string;
}

export interface ChatListResponse {
  chats: ChatResponse[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface AddMessageToChatRequest {
  content?: string;
  draftContent?: string;
  type: MessageType;
  chatId: string;
  parentId: string;
}

export interface MessageResponse {
  type: ChatType;
  chat_id: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}
