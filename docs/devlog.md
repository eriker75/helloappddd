## 2025-08-19 - Fix "public.users does not exist" Error on Profile Fetch

- Documented and resolved the error caused by missing `public.users` table when fetching user profiles.
- Added instructions and SQL to create a `public.users` view exposing fields from `auth.users` for Supabase compatibility.
- No code changes required; fix is a database migration.
- See [2025-08-19-fix-public-users-view.md](2025-08-19-fix-public-users-view.md) for full details and rationale.

## 2025-08-19 - Fix Swipe Queue Prefetch to Prevent "No Profiles" Flash

- Implemented prefetch and append logic for the swipeable profiles queue to avoid the "no profiles available" flash after several swipes.
- Added `appendProfiles` to the swipeable profiles store and updated the service to prefetch when the queue is low.
- User experience is now seamless and circular as intended.
- See [2025-08-19-fix-swipe-queue-prefetch.md](2025-08-19-fix-swipe-queue-prefetch.md) for full details and rationale.

## 2025-08-19 - Refactor Chat List Screen to Use Store/Service Layer

- Refactored `app/dashboard/chats/index.tsx` to remove all incorrect or direct repository usage and leverage the presentation layer's store and service for chat lists.
- Now uses `useGetChatsService` for fetching and syncing the chat list, and the store for all chat list state and rendering.
- All chat list logic is handled via the service/store, ensuring reactivity and proper separation of concerns.
- Improved code clarity, maintainability, and adherence to project architecture.
- See [2025-08-19-refactor-chat-list-screen-use-store-service.md](2025-08-19-refactor-chat-list-screen-use-store-service.md) for full details and rationale.
