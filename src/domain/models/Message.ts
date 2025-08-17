import { MessageContentType } from "@/src/definitions/types/MessageContent.type";

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
