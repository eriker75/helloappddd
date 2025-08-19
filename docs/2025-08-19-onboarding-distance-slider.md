# Task: Add Unilateral Distance Selector Slider to Onboarding

**Date:** 2025-08-19

## Description

Implement a unilateral (single-thumb) slider in the onboarding form to allow users to select the search radius for nearby people, from 10km to 1010km (with 1010km labeled as "infinito"). The slider must use the Gluestack UI component and match the application's style. The value should be stored in the onboarding store (`maxDistancePreference`).

## Action Plan

1. Review onboarding form structure and onboarding store.
2. Use the custom Gluestack slider (`components/ui/slider/`) for the new selector.
3. Add a new section to the onboarding form (`app/onboarding/basicinfo.tsx`) for the distance selector.
4. Configure the slider: min=10, max=1010, step=1, label 1010 as "infinito".
5. Sync the slider value with the onboarding store (`maxDistancePreference`).
6. Ensure the UI matches the app's style and is accessible.
7. Update documentation and `devlog.md` after implementation.

## Files to Modify

- `app/onboarding/basicinfo.tsx`
- `src/presentation/stores/onboarding.store.ts` (if further adjustments needed)
- `components/ui/slider/index.tsx` (if customizations are required)
- `docs/devlog.md` (after implementation)

## Observations

- The onboarding store already supports `maxDistancePreference` and its setter.
- The Gluestack slider is available and styled for the app.
- No previous onboarding distance selector exists.
- The slider must be clear, accessible, and visually consistent with the rest of the onboarding UI.
