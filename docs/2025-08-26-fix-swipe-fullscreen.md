# 2025-08-26 - [Swipe Screen] Fix: Image and Overlay cover full screen height/width

## Context

Feedback showed that on some devices, the image and its semi-transparent overlay in the main swipe (discover) screen did **not** stretch to fill the entire screen, but appeared boxed or letterboxed. The product objective is a full-bleed user profile visual: both image and its dark overlay must always reach all screen edges, regardless of device.

## Actions

- Refactored `app/dashboard/swipe.tsx` (main SwipeScreen component).
- All containers and image/overlay blocks now use `Dimensions.get("window").width/height` directly instead of percent or flex values.
- Avatar and all secondary images render in a `View` with **exact device width/height**; overlays apply via `StyleSheet.absoluteFillObject` (guarantees coverage).
- Removed percentage/relative styling from image and overlay containers.
- Checked for any unused imports or code but found none to remove.

## Result

- Both main and secondary user images now stretch edge-to-edge and top-to-bottom on all devices, with the overlay properly applied.
- No regressions or loss of UI stacking/zSpace for buttons/labels.
- No unused code detected for removal; component is lean.
- This resolves the visual bug and closes this UI refinement feedback.
