# 2025-08-26 - Scroll to Bottom Only If User Is at Bottom When Sending/Receiving Chat Message

## Context

When sending or receiving a new message in a chat (`app/dashboard/chats/[chatId]/index.tsx`), the UI always scrolls to the last message, regardless of the user's current scroll position. This leads to a poor user experience when reading older messages, as any new message will force the scroll to the bottom.

## Objective

Update the chat message list to only auto-scroll to the bottom (latest message) if the user is already at or near the bottom when the new message is added. This ensures that reading historical messages is not interrupted by new incoming or outgoing messages.

## Implementation Plan

- Track the user’s scroll position in the FlatList, using onScroll, viewabilityConfig, or calculate visible indices.
- On change to the messages list (specifically when new messages are added or sent), check if the user is at (or very near) the bottom.
- If yes, auto-scroll to the bottom (using scrollToEnd, scrollToIndex({last}), or scrollToOffset as appropriate).
- If user is not at the bottom, do not auto-scroll.
- Refactor the useEffect responsible for scrolling to respect the new condition.
- Keep existing behaviour for initial load (auto-scroll).

## Files to Update

- app/dashboard/chats/[chatId]/index.tsx (main chat screen)

## Related Documentation

- Update this file with observations after task completion.
- Summarize changes in docs/devlog.md when done.
