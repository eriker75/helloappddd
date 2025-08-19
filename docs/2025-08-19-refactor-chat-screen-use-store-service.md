# Refactor Chat Screen to Use Store/Service Layer

**Date:** 2025-08-19

## Summary

Refactor the mobile chat screen at `app/dashboard/chats/[chatId]/index.tsx` to remove direct repository usage and leverage the presentation layer's store and service for chat messages. This ensures proper separation of concerns, reactivity, and maintainability.

## Motivation

- The screen currently imports `useGetMessages` from a repository implementation, which is incorrect and breaks architectural boundaries.
- The correct approach is to use the store (`useCurrentChatMessagesStore`) and service hooks (`ChatService.ts`) that internally handle repository access, React Query, and store synchronization.

## Action Plan

1. Remove all direct repository imports/usages from the screen.
2. Use `useGetChatMessagesService` for fetching and syncing messages.
3. Use `useSendMessageToChatService` for sending messages.
4. Ensure all message state and rendering is handled via the store.
5. Refactor and improve code for clarity and maintainability.
6. Update documentation and devlog.

## Affected Files

- `app/dashboard/chats/[chatId]/index.tsx`
- `docs/2025-08-19-refactor-chat-screen-use-store-service.md`
- `docs/devlog.md` (to be updated after completion)
- `README.md` (if necessary)

## Observations

- The store provides a robust API for managing chat state, including pagination, message addition, and read status.
- The service hooks in `ChatService.ts` ensure all data fetching and mutations are handled via React Query and keep the store in sync.
- This refactor will improve code quality, maintainability, and adherence to the project's architectural standards.
