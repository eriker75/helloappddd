> **Nota:** Antes de modificar cualquier método de un controlador, revisa siempre la estructura de la base de datos en `database.md` en la raíz del proyecto.
> **Tipos de chat soportados:**  
>
> - `private`: chat individual de dos personas. El arreglo `participants` debe tener exactamente un usuario (el otro es el creador, que se agrega automáticamente por trigger).  
> - `group`: chat grupal, el arreglo `participants` puede tener varios usuarios.
>
# Task: Fix `createChat` Method to Use `CreateChatRequest` Parameters and Return Correct Interface

**Date:** 2025-08-19

## Context

The `createChat` method in `ChatController` was only using the `name` and `creator_id` fields, and returned a `boolean`. The `CreateChatRequest` interface includes additional fields (`type`, `description`, `name`, `image`, `participants`), and the method should return a `ChatResponse` object.

## Action Plan

- Review the `CreateChatRequest` and `ChatResponse` interfaces in `src/domain/models/chat.models.ts`.
- Update the `createChat` method in `src/infraestructure/api/ChatController.ts` to:
  - Accept all fields from `CreateChatRequest`.
  - Insert all relevant fields into the `chats` table.
  - Return the created chat as a `ChatResponse` object.

## Implementation

- Modified the method signature to `Promise<ChatResponse>`.
- Inserted all fields from `CreateChatRequest` into the `chats` table.
- Returned the created chat as a `ChatResponse`, filling in default values where necessary.

## Files Modified

- `src/infraestructure/api/ChatController.ts`

## Observations

- Assumes the `participants` field is stored as an array/JSON in the `chats` table.
- No evidence of a separate `chat_participants` table in the codebase.
- No changes needed in mappers or models for this fix.

## Status

Completed.

## 2025-08-19 (update)

- Extracted the logic for obtaining the authenticated user into a reusable helper: [`src/utils/getAuthenticatedUser.ts`](../src/utils/getAuthenticatedUser.ts).
- Refactored `createChat` to use this helper for improved code reuse and maintainability.
