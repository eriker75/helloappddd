# 2025-08-24: Fix Infinite Update Loop in Chat List Screen

## Context / Bug

- Entering `app/dashboard/chats/index.tsx` would sometimes cause a “Maximum update depth exceeded” React error.
- Symptoms were a spinning indicator, blank screen, or the Expo error overlay (sometimes referencing `ChatsLayout`).

## Analysis

- The chat list screen was recently refactored to use store/service hooks exclusively (`useGetChatsService`).
- In `src/presentation/services/ChatService.ts`, the hook’s effect for syncing remote chats to the Zustand store used:

  ```js
  useEffect(() => {
    if (myFetchedChats && Array.isArray(myFetchedChats.chats) && total === 0) {
      setChats(...);
    }
  }, [myFetchedChats, setChats, total]);
  ```

- Because updating the store also changed `total`, the effect would be retriggered. This created an infinite loop if data remained unchanged.

## Solution

- Updated the effect to use a ref-based “run-once” guard, as follows:
  - Track initialization via `const hasInitialized = useRef(false)`.
  - Changed the sync effect to:

    ```js
    useEffect(() => {
      if (
        myFetchedChats &&
        Array.isArray(myFetchedChats.chats) &&
        !hasInitialized.current &&
        Object.keys(chats).length === 0
      ) {
        setChats(...);
        hasInitialized.current = true;
      }
    }, [myFetchedChats, setChats, chats]);
    ```

  - This ensures chats are set only when the store is empty and only once per session.

## Files Modified

- `src/presentation/services/ChatService.ts`

## Status

- Verified and completed.
- See also: [2025-08-19-fix-infinite-update-chat-screen.md] for similar fix logic.
