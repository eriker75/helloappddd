# Devlog

## 2025-08-17 - Mapper Fixes

- Refactored `UserProfileMapper.ts` and `ChatMapper.ts` to remove hardcoded data.
- All mappers now use their parameters and map fields according to the domain models and entities.
- Type conversions and null/undefined handling were implemented for robust mapping.
- Ensured that request mappers only include present fields and handle type conversions as needed.
- This improves maintainability and correctness of the data flow between layers.
