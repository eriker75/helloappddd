import { Chat, PaginatedChats } from "@/src/domain/entities/Chat";
import { Message, PaginatedMessages } from "@/src/domain/entities/Message";
import {
  QueryClient,
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ChatDatasourceImpl } from "../datasources/ChatDatasoruceImpl";

/**
 * Async function to fetch paginated chats for the current user using react-query.
 * @param page The page number (starting from 1)
 * @param perPage The number of chats per page
 * @returns Promise with paginated chats and metadata (from cache or network)
 */

export const queryClient = new QueryClient();
const datasource = new ChatDatasourceImpl();

/**
 * Returns paginated chats for the current user.
 * @param page The page number (starting from 1)
 * @param perPage The number of chats per page
 * @returns UseQueryResult with paginated chats and metadata
 */
export function useFindMyChats(page: number, perPage: number): UseQueryResult<PaginatedChats> {
  return useQuery({
    queryKey: ["chat", "findMyChats", page, perPage],
    queryFn: () => datasource.findMyChats(page, perPage),
    enabled: typeof page === "number" && typeof perPage === "number" && page > 0 && perPage > 0,
  });
}

export async function fetchMyChats(page: number, perPage: number): Promise<PaginatedChats> {
  const queryKey = ["chat", "findMyChats", page, perPage];
  // Usa el cache de react-query si existe, si no, hace fetch y lo cachea
  const data = queryClient.getQueryData<PaginatedChats>(queryKey);
  if (data) return data;
  return await queryClient.fetchQuery<PaginatedChats>({
    queryKey,
    queryFn: () => datasource.findMyChats(page, perPage),
  });
}

/**
 * Returns paginated messages for a chat.
 * @param chatId The chat ID
 * @param page The page number (starting from 1)
 * @param perPage The number of messages per page
 * @returns UseQueryResult with paginated messages and metadata
 */
export function useGetAllMyChatMessages(
  chatId: string,
  page: number,
  perPage: number
): UseQueryResult<PaginatedMessages> {
  return useQuery({
    queryKey: ["chat", "getAllMyChatMessages", chatId, page, perPage],
    queryFn: () => datasource.getAllMyChatMessages(chatId, page, perPage),
    enabled: !!chatId && typeof page === "number" && typeof perPage === "number" && page > 0 && perPage > 0,
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

/**
 * Sends a message to a chat.
 * @returns UseMutationResult with boolean indicating success
 */
export function useSendMessageToChat(): UseMutationResult<
  boolean,
  unknown,
  { chatId: string; message: Partial<Message> }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, message }) => datasource.sendMessageToChat(chatId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}

export function useMarkAllMessagesFromChatAsRead(): UseMutationResult<boolean, unknown, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => datasource.markAllMessagesFromChatAsRead(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat"] });
    },
  });
}
