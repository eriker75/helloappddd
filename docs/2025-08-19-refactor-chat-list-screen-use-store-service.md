# Refactor Chat List Screen to Use Store/Service Layer

**Date:** 2025-08-19

## Summary

Refactor the chat list screen at `app/dashboard/chats/index.tsx` to remove incorrect or direct repository usage and leverage the presentation layer's store and service for chat lists. This ensures proper separation of concerns, reactivity, and maintainability.

## Motivation

- The screen currently imports and uses a non-existent or incorrect hook (`useUserChatsService`) from the service layer.
- The correct approach is to use the store (`useChatListStore`) and service hooks (`ChatService.ts`) that internally handle repository access, React Query, and store synchronization.

## Action Plan

1. Remove all incorrect or direct repository imports/usages from the screen.
2. Use `useGetChatsService` for fetching and syncing the chat list.
3. Use the store for all chat list state and rendering.
4. Refactor and improve code for clarity and maintainability.
5. Update documentation and devlog.

## Affected Files

- `app/dashboard/chats/index.tsx`
- `docs/2025-08-19-refactor-chat-list-screen-use-store-service.md`
- `docs/devlog.md` (to be updated after completion)
- `README.md` (if necessary)

## Observations

- The store provides a robust API for managing chat list state, including pagination and unread counts.
- The service hooks in `ChatService.ts` ensure all data fetching and mutations are handled via React Query and keep the store in sync.
- This refactor will improve code quality, maintainability, and adherence to the project's architectural standards.
