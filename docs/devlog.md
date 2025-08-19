## 2025-08-18 - Fix Unread Message Logic in Chat Store

- Renamed `unreadedMessageIds` to `unreadMessageIds` for clarity and consistency.
- Fixed logic to prevent duplicates and ensure IDs are removed when messages are deleted.
- Added `markAllAsRead` method to clear all unread message IDs at once.
- Removed stray code causing a TypeScript error in `addMessage`.
- See [2025-08-18-fix-unread-message-logic.md](2025-08-18-fix-unread-message-logic.md) for full details and rationale.

# Devlog

## 2025-08-17 - Mapper Fixes

- Refactored `UserProfileMapper.ts` and `ChatMapper.ts` to remove hardcoded data.
- All mappers now use their parameters and map fields according to the domain models and entities.
- Type conversions and null/undefined handling were implemented for robust mapping.
- Ensured that request mappers only include present fields and handle type conversions as needed.
- This improves maintainability and correctness of the data flow between layers.

## 2025-08-17 - UserProfileService Refactor

- Refactored `UserProfileService.ts` to fully synchronize with repositories and all relevant stores.
- Added/updated all CRUD, onboarding, geospatial, swipe, and match methods.
- Introduced explicit mapping for swipeable profiles to ensure type safety and store compatibility.
- Removed legacy and duplicated code, and simplified service usage for React views.
- See [2025-08-17-user-profile-service-refactor.md](2025-08-17-user-profile-service-refactor.md) for full details and rationale.

## 2025-08-17 - Optimistic User Profile Update

- Implemented optimistic update logic for user profile changes in `UserProfileService.ts`.
- The store is updated immediately and reverted if the update request fails, ensuring a responsive UI and data consistency.
- See [2025-08-17-optimistic-user-profile-update.md](2025-08-17-optimistic-user-profile-update.md) for full details and rationale.

## 2025-08-17 - ChatService Refactor

- Refactored `ChatService.ts` to match the idiomatic patterns and best practices of `UserProfileService.ts`.
- Replaced all `.entity` imports with correct domain model imports (`Chat`, `Message`).
- Removed references to non-existent `Participant` type; used `any[]` as a fallback for participants.
- Updated all function signatures and interfaces to use the correct types.
- Ensured all store and mutation logic uses the correct identifiers (`chatId`).
- Used repository hooks for all async operations, matching the approach in `UserProfileService.ts`.
- Improved error handling and rollback logic in mutation hooks.
- See [2025-08-17-refactor-chat-service.md](2025-08-17-refactor-chat-service.md) for full details and rationale.
