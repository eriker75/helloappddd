import { LastMessageStatus } from "@/src/definitions/enums/LastMessageStatus.enum";
import { ChatType } from "@/src/definitions/types/ChatType.type";

export interface Chat {
  chatId: string;
  name: string;
  image: string;
  description: string;
  type: ChatType;
  lastMessageContent: string;
  lastMessageId: string;
  lastMessageStatus: LastMessageStatus;
  lastMessageCreatedAt: Date;
  lastMessageUpdatedAt: Date;
  unreadedCount: string;
  participants: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
