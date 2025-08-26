## 2025-08-26 - Support Visual Display of Image Messages in Chat

- Added conditional rendering for messages of type `image` in the chat view ([`app/dashboard/chats/[chatId]/index.tsx`]), using the custom UI Image component for visual display.
- The change allows users to see image content directly in chat bubbles, styled and aligned with the existing UI, with text fallback for missing images.
- Core message logic, store, and networking were unchanged.
- See [2025-08-26-chat-image-message-support.md](2025-08-26-chat-image-message-support.md) for implementation details and design notes.

## 2025-08-25 - Fix Infinite Update Loop in Chat Messages Screen

- Fixed a "Maximum update depth exceeded" error in the individual chat messages view at [`app/dashboard/chats/[chatId]/index.tsx`](app/dashboard/chats/[chatId]/index.tsx).
- Root cause: An unstable selector against the Zustand store was used (`useCurrentChatMessagesStore(s => s.orderedMessageIds.map(id => s.messages[id]))`), which produced a new array each render and created an infinite re-render loop. The service effect in [`src/presentation/services/ChatService.ts`](src/presentation/services/ChatService.ts) also aggressively re-initialized the message list without proper guards.
- Solution:
  - Refactored `app/dashboard/chats/[chatId]/index.tsx` to use stable selectors for messages and message IDs, `useMemo` for array derivation, and memoized handlers for FlatList.
  - Updated `useGetChatMessagesService` in `src/presentation/services/ChatService.ts` to initialize messages only once per chat change, using `useRef` guards and a chatId-tracking reset effect.
  - Fixed TypeScript errors and ensured proper string conversion for `createdAt` in message display.
- Result: No more infinite rendering, error gone, correct message initialization, and improved performance/user experience.
- See [2025-08-25-fix-infinite-render-in-chat.md](2025-08-25-fix-infinite-render-in-chat.md) for action log and technical rationale.

## 2025-08-25 - Refactor findMyChats to Return Full ChatResponse Data

- Problem: The function `findMyChats` in [`src/infraestructure/api/ChatController.ts`](../src/infraestructure/api/ChatController.ts) was returning only raw chat table rows, lacking participants, unreadedCount, the last message, and `other_user_profile` for private chats.
- Solution: Refactored logic to, for each chat in the paginated result, fetch participant IDs, count unread messages for the authenticated user, fetch the most recent message, and (for private chats) retrieve the full user profile of the other participant. The controller now returns fully composed `ChatResponse` objects.
- Impact: UI and service layers now receive complete chat information as expected by the domain model, enabling accurate badge counts, conversation previews, and other features.
- See [`docs/2025-08-25-chat-list-rich-response.md`](2025-08-25-chat-list-rich-response.md) for rationale and implementation plan.

## 2025-08-26 - Swipe Screen: Make Images and Overlay Fill Full Device Height/Width

- Fixed bug where the image and overlay in the swipe screen (`app/dashboard/swipe.tsx`) did not cover the whole device screen.
- All image/overlay containers now directly use window width/height from `Dimensions`, with overlays applied by `StyleSheet.absoluteFillObject`.
- Now both image and semi-transparent overlay always stretch to screen edges, regardless of device.
- See [`2025-08-26-fix-swipe-fullscreen.md`](2025-08-26-fix-swipe-fullscreen.md) for technical details and before/after rationale.
