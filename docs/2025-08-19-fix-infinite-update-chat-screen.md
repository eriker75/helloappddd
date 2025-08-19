# 2025-08-19: Fix Infinite Update Loop in Chat Screen

## Context

A "Maximum update depth exceeded" error was occurring when entering the chat view. This was traced to an infinite render loop in the chat screen.

## Analysis

- The error was triggered by the auto-scroll `useEffect` in `app/dashboard/chats/[chatId]/index.tsx`.
- The effect depended on both `storeMessages` and `storeMessages.length`. Since the messages array could be a new instance on every render (due to store updates), this caused the effect to run on every render, leading to an infinite loop.

## Solution

- The dependency array of the auto-scroll effect was changed to depend only on `storeMessages.length` instead of the entire array reference.
- This ensures the effect only runs when the number of messages changes, preventing unnecessary re-renders.

## Files Modified

- `app/dashboard/chats/[chatId]/index.tsx`

## Observations

- No changes were needed in the service or store logic.
- The fix is minimal and does not affect other chat functionality.

## Status

Completed.
