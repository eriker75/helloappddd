# Task: Fix Maximum Update Depth/Infinite Render Bug in Chat Messages View

**Date:** 2025-08-25  
**Status:** completed

## Context

A bug was detected when accessing the chat messages view (`/dashboard/chats/[chatId]`). The error shown:

```
Warning: Error: Maximum update depth exceeded.
This can happen when a component repeatedly calls setState ... [truncated]
```

## Cause

- The view used an unstable, in-line selector against the Zustand store:

  ```js
  useCurrentChatMessagesStore(s => s.orderedMessageIds.map(id => s.messages[id]))
  ```

  This creates a new array on every render, causing endless re-renders and effect triggers.

- The `useGetChatMessagesService` effect had insufficient guards and could reinitialize messages on every state change, possibly leading to further render loops.

## Fixes Implemented

1. **Stable Selectors and Memoization in ChatScreen**
   - Use separate selectors (for `messages` and `orderedMessageIds`) and `useMemo` to compute `storeMessages`, ensuring a stable reference.
   - Memoize renderItem, keyExtractor, and event handlers for performance.
   - Optimize scroll-to-bottom logic.

2. **Idempotent Initialization of Chat Messages**
   - The hook now uses a `useRef` guard (`hasInitialized`) and an effect on `chatId` to only sync initial messages once per chat ID.
   - Resets are performed on chat change, ensuring no redundant updates.

## Files Modified

- `app/dashboard/chats/[chatId]/index.tsx`:  
  Stable selector pattern, useMemo, memoized handlers.
- `src/presentation/services/ChatService.ts`:  
  Robust guards, one-time per chatId effect in message service hook.

## References

- [devlog.md](./devlog.md)
- [src/presentation/stores/current-chat-messages.store.ts]
- [src/domain/entities/Message.ts]

## Impact

- Eliminates the "Maximum update depth exceeded" error.
- Prevents infinite rendering and improves chat view performance.
- Ensures compatibility with the expected Zustand patterns in project.

## Next Steps

- Validate fix via manual/automated test in the chat UI.
