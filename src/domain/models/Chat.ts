import { ChatType } from "@/src/definitions/enums/ChatType.enum";
import { LastMessageStatus } from "@/src/definitions/enums/LastMessageStatus.enum";

export interface Chat {
  chatId: string;
  name: string;
  image: string;
  description: string;
  type: ChatType;
  lastMessageContent: string;
  lastMessageId: string;
  lastMessageTime: string;
  lastMessageStatus: LastMessageStatus;
  lastMessageCreatedAt: Date;
  lastMessageUpdatedAt: Date;
  unreadedCount: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
