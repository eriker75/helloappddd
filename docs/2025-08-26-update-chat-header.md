# Task: Enhance Chat Header with Other User Profile Info

## Date

2025-08-26

## Objective

Display the other user's avatar and alias in the chat header for private chats (`type === "private"`), right next to the back arrow. The whole header area with avatar and alias should be pressable and route to the other user's profile view by id.

## Motivation

- Improves chat UX and aligns with modern messaging app conventions.
- Provides quick access to the profile of the person you're chatting with.

## Design/Technical Plan

1. **Locate chat info:**
   - Use `useChatListStore((s) => s.chats[chatId])` to obtain the Chat object inside `app/dashboard/chats/[chatId]/index.tsx`.

2. **Determine other user:**
   - If chat.type is `"private"`, find the userId in `chat.participants` which is not the current user's (`useAuthUserProfileStore`).
   - For group chats, keep existing header.

3. **Obtain profile info:**
   - Use `useGetCurrentUserProfileByUserId(otherUserId)` (from `UserProfileService.ts`) to load avatar and alias of the other user.

4. **Show in header:**
   - Replace the static Chat label with an `HStack` containing:
     - Back arrow
     - Avatar (large)
     - Alias (text)
   - Whole header box (excluding back arrow) should be pressable; onPress navigates to `/dashboard/profile/[otherUserId]`.

5. **Components impacted:**
   - `app/dashboard/chats/[chatId]/index.tsx` (header part)
   - Possibly: Import/apply Avatar from `components/ui/avatar`.

6. **Edge Cases:**
   - Fallback to placeholder avatar or "Desconocido" if loading or profile not found.
   - Avoid showing for group chats.

## Files to modify

- `app/dashboard/chats/[chatId]/index.tsx`
- (Possibly update styles or Avatar import if not already used.)

## Testing

- Open private chat. See avatar + alias in header, tap to navigate to profile.
- Open group chat: header unchanged.
- Confirm works with network delays, missing profiles, and navigation edge cases.

## Observations

- Current Chat object only has participant userIds, so fetching user profiles on demand is optimal.
- This keeps the code modular and reuses existing stores and services.

## Next Steps (Post-implementation)

- Update `devlog.md` with summary and any notable issues/solutions.
- Update `README.md` if chat UI reference images/docs exist.
