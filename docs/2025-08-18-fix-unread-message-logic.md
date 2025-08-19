# Fix unread message logic in current-chat-messages-store

**Date:** 2025-08-18

## Summary

This task fixes the logic for tracking unread messages in the chat message store and adds a method to mark all messages as read.

## Motivation

- The property `unreadedMessageIds` was incorrectly named and inconsistently updated.
- There was no method to mark all messages as read.
- The logic for updating unread message IDs was prone to duplication and did not always remove IDs when messages were deleted.

## Action Plan

1. Rename `unreadedMessageIds` to `unreadMessageIds` throughout the store.
2. Ensure all logic updating this array is correct:
   - No duplicates are added.
   - IDs are removed when messages are deleted.
   - All relevant methods use the correct property.
3. Add a method `markAllAsRead` to clear the unread message IDs.
4. Update the interface and implementation accordingly.

## Files Modified

- `src/presentation/stores/current-chat-messages.store.ts`

## Observations

- The stray line in `addMessage` was removed to fix a TypeScript error.
- The new method `markAllAsRead` allows clearing all unread message IDs at once.
- All usages of the old property name were updated for consistency.
