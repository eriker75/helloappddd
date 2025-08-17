# Devlog

## 2025-08-17 - Mapper Fixes

- Refactored `UserProfileMapper.ts` and `ChatMapper.ts` to remove hardcoded data.
- All mappers now use their parameters and map fields according to the domain models and entities.
- Type conversions and null/undefined handling were implemented for robust mapping.
- Ensured that request mappers only include present fields and handle type conversions as needed.
- This improves maintainability and correctness of the data flow between layers.

## 2025-08-17 - UserProfileService Refactor

- Refactored `UserProfileService.ts` to fully synchronize with repositories and all relevant stores.
- Added/updated all CRUD, onboarding, geospatial, swipe, and match methods.
- Introduced explicit mapping for swipeable profiles to ensure type safety and store compatibility.
- Removed legacy and duplicated code, and simplified service usage for React views.
- See [2025-08-17-user-profile-service-refactor.md](2025-08-17-user-profile-service-refactor.md) for full details and rationale.
