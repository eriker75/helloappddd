## 2025-08-19 - Refactor Chat List Screen to Use Store/Service Layer

- Refactored `app/dashboard/chats/index.tsx` to remove all incorrect or direct repository usage and leverage the presentation layer's store and service for chat lists.
- Now uses `useGetChatsService` for fetching and syncing the chat list, and the store for all chat list state and rendering.
- All chat list logic is handled via the service/store, ensuring reactivity and proper separation of concerns.
- Improved code clarity, maintainability, and adherence to project architecture.
- See [2025-08-19-refactor-chat-list-screen-use-store-service.md](2025-08-19-refactor-chat-list-screen-use-store-service.md) for full details and rationale.
