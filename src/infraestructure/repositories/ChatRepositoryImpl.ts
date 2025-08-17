import { Chat } from "@/src/domain/entities/Chat";
import { Message } from "@/src/domain/entities/Message";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChatDatasourceImpl } from "../datasources/ChatDatasoruceImpl";

// Singleton datasource instance for hooks
const datasource = new ChatDatasourceImpl();

// Queries
export function useFindMyChatById(id: string): UseQueryResult<Chat | null> {
  return useQuery({
    queryKey: ["chat", "findMyChatById", id],
    queryFn: () => datasource.findMyChatById(id),
    enabled: !!id,
  });
}

export function useFindAllMyChats(): UseQueryResult<Chat[]> {
  return useQuery({
    queryKey: ["chat", "findAllMyChats"],
    queryFn: () => datasource.findAllMyChats(),
  });
}

export function useGetAllMyChatMessages(
  chatId: string
): UseQueryResult<Message[]> {
  return useQuery({
    queryKey: ["chat", "getAllMyChatMessages", chatId],
    queryFn: () => datasource.getAllMyChatMessages(chatId),
    enabled: !!chatId,
  });
}

// Mutations
export function useCreateChat(): UseMutationResult<boolean, unknown, Chat> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chat: Chat) => datasource.createChat(chat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useUpdateChat(): UseMutationResult<boolean, unknown, Chat> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chat: Chat) => datasource.updateChat(chat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useDeleteChat(): UseMutationResult<boolean, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => datasource.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useSendMessageToChat(): UseMutationResult<
  Message,
  unknown,
  { chatId: string; message: Message }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, message }) =>
      datasource.sendMessageToChat(chatId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useMarkAllMessagesFromChatAsRead(): UseMutationResult<
  boolean,
  unknown,
  string
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) =>
      datasource.markAllMessagesFromChatAsRead(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}
