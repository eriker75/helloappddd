import { ChatType } from "@/src/definitions/types/ChatType.type";
import { MessageType } from "@/src/definitions/types/MessageType.type";
import { UserProfileResponse } from "./user-profile.models";

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
  name: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  participants: string[];
  type: string;
  image?: string;
  description: string;
  unreadedCount: number;
  last_message_id?: string;
  is_active: boolean;
  last_message?: MessageResponse;
  other_user_profile?: UserProfileResponse;
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
  id: string;
  type: ChatType;
  chat_id: string;
  status: string;
  sender_id: string;
  content: string;
  readed: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  messages: MessageResponse[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}
