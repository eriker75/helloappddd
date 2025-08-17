import { MessageContentType } from "@/src/definitions/types/MessageContent.type";
import { UserProfile } from "./UserProfile";

export interface Message {
  messageId: string;
  chatId: string;
  content?: string;
  draftContent?: string;
  parentId?: string;
  senderId: string;
  recipientId?: string;
  type: MessageContentType;
  readed: boolean;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedMessages {
  messages: Message[];
  chatId: string;
  otherUserProfile?: UserProfile,
  page: number;
  perPage: number;
  hasMore: boolean;
  total: number;
}
