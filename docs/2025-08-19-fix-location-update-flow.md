# Task: Fix User Location Update Flow

**Date:** 2025-08-19

## Problem

When updating the user profile from the edit view, the latitude and longitude fields were undefined, causing errors in the radar feature. The hook `useUpdateMyUserCurrentLocation` required latitude and longitude as parameters, which was not ideal. Instead, it should internally obtain the current location using a utility and synchronize the update with the user profile store and backend.

## Action Plan

- Add a `getCurrentLocation` function to `src/utils/location.ts` to obtain the device's current latitude and longitude.
- Refactor `useUpdateMyUserCurrentLocation` in `src/presentation/services/UserProfileService.ts` to:
  - Internally call `getCurrentLocation`.
  - Handle permission and location errors.
  - Update the store and synchronize with the backend.
- Update all usages of `useUpdateMyUserCurrentLocation` to use the new API (call `updateLocation()` method).
- Document the changes and update the devlog.

## Files Modified

- `src/utils/location.ts`
- `src/presentation/services/UserProfileService.ts`
- `app/dashboard/_layout.tsx`
- `docs/2025-08-19-fix-location-update-flow.md` (this file)

## Implementation Notes

- The new `getCurrentLocation` utility requests permission and returns `{ latitude, longitude }` using Expo Location.
- The `useUpdateMyUserCurrentLocation` hook now exposes an `updateLocation()` method that handles the full flow: permission, location fetch, mutation, and store update.
- All usages of the hook must now destructure and call `updateLocation()` instead of calling the hook result directly.
- Error handling is included for permission denied and location fetch failures.

## Observations

- This change ensures that the user's location is always up-to-date and synchronized with the backend and store, preventing undefined values and related errors in features like radar.
- The update flow is now more robust and easier to use from the UI, reducing the risk of developer misuse.
