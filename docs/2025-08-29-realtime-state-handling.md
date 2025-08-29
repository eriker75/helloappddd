# 2025-08-29 - Real-Time Chat State Handling Refactor

## Context and Motivation

Previously, `RealtimeChatHandler` methods (e.g. `handleNewMessage`, `handleNewChat`) only logged incoming events, without updating the local chat/message state. This meant real-time updates from other users or devices were not reflected in the conversation UI until a manual refresh. We aimed to provide live, robust chat state mirroring using the existing Zustand stores, ensuring a reactive and consistent user experience.

## Action Plan

- Analyze event payload shapes and store contracts for `Message` and `Chat`.
- Refactor `RealtimeChatHandler` to invoke Zustand store methods (`addMessage`, `addChat`, etc.) upon event reception.
- Ensure all required fields for both `Message` and `Chat` entities are supplied, filling in missing properties with sensible defaults.
- Handle date conversion from string to `Date` as dictated by store contract.
- Map enums (such as `LastMessageStatus`) using correct imported symbols.
- Document any limitations (e.g., user online status not yet supported in store).

## Implementation Details

**Files Changed**:

- [`src/infraestructure/handlers/RealtimeChatHandlers.ts`](../src/infraestructure/handlers/RealtimeChatHandlers.ts)

**Approach**:

- Imported `useChatListStore` and `useCurrentChatMessagesStore` directly, using `.getState()` for imperative updates outside React components.
- For message events, payloads are mapped to the required Message shape. Fallback/defaults are assigned for missing fields (e.g., `type: "text"`, `readed: false`).
- For new chat events, created full Chat objects with sane defaults for all required contract fields (e.g., `description: ""`, `participants: []`, `isActive: true`).
- All date fields (e.g., `createdAt`, `updatedAt`) are converted from string to Date instances as required by store.
- Enum fields (e.g., `lastMessageStatus`) use the specific imported type (`LastMessageStatus.SENT`).
- Left a TODO in `handleUserOnlineEvent` noting the current lack of store support for user presence tracking.

**Known Issues / Future Improvements**

- As event payloads expand, more fields should be mapped through.
- If online status is to be tracked per user, a store extension or new store is needed. Handler will require adaptation for this case.
- If message types vary (more than "text"), ensure `type` is mapped from the event, not always defaulted.
- Improve event validation and normalization as the contract matures.

## Observations

- Zustand's `getState()` method enables reliable event-driven mutations even outside React render cycles; recommended for real-time and subscription-based patterns.
- Defensive programming is important: always map/store required fields. Provide defaults where source data is incomplete.
- The system is now robust against most real-time data, correcting for gaps or missing fields, but will best benefit from richer backend events.

---

**Change Author:** [Automated Refactor, 2025-08-29]
