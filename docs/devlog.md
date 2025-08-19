## 2025-08-19 - Add Unilateral Distance Selector to Onboarding

- Implemented a unilateral (single-thumb) slider in the onboarding form to let users select the search radius for nearby people, from 10km to 1010km (with 1010km labeled as "infinito").
- The slider uses the Gluestack UI component and matches the application's style.
- The selected value is stored in the onboarding store (`maxDistancePreference`) and is used for user search preferences.
- Updated files: [`app/onboarding/basicinfo.tsx`](app/onboarding/basicinfo.tsx), [`docs/2025-08-19-onboarding-distance-slider.md`](2025-08-19-onboarding-distance-slider.md)
- See [2025-08-19-onboarding-distance-slider.md](2025-08-19-onboarding-distance-slider.md) for full details and rationale.

## 2025-08-19 - Enforce Default Avatar Fallback Globally

- Updated the main avatar component ([`components/ui/avatar/index.tsx`](components/ui/avatar/index.tsx)) to ensure that if a user's avatar is missing or fails to load, the default image `assets/images/avatar-placeholder.png` is always shown.
- The fallback logic is now centralized and robust, using a helper to detect missing/invalid sources and an `onError` handler for load failures.
- Searched the codebase to confirm all avatar rendering uses this component, ensuring global consistency.
- No direct usage of the `Image` component for avatars was found in screens; all avatar displays now benefit from this fallback.
- This change improves user experience and visual consistency across the app.

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

## 2025-08-19 - Fix User Location Update Flow

- Fixed an issue where user latitude and longitude were undefined when updating the profile, causing errors in the radar feature.
- Refactored `useUpdateMyUserCurrentLocation` to internally obtain the device's location using a new utility, and to synchronize the update with the user profile store and backend.
- Updated all usages to use the new `updateLocation()` method.
- See [2025-08-19-fix-location-update-flow.md](2025-08-19-fix-location-update-flow.md) for full details and rationale.

## 2025-08-19 - Fix Infinite Update Loop in Chat Screen

- Fixed a "Maximum update depth exceeded" error when entering the chat view, caused by an auto-scroll effect depending on the entire messages array reference.
- Updated the effect in `app/dashboard/chats/[chatId]/index.tsx` to depend only on the messages length, preventing unnecessary re-renders and infinite loops.
- See [2025-08-19-fix-infinite-update-chat-screen.md](2025-08-19-fix-infinite-update-chat-screen.md) for full details and rationale.
