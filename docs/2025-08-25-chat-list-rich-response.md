# Refactor ChatController.findMyChats to Return Rich ChatResponse Objects

## Context

The function `findMyChats` in [`src/infraestructure/api/ChatController.ts`](../src/infraestructure/api/ChatController.ts) is currently returning only raw `chats` table rows. This causes the API to return incomplete chat information in the `ChatResponse[]`, missing:

- List of participant user IDs (`participants`)
- Unread messages count per chat (`unreadedCount`)
- The latest message as `last_message`
- For private chats, the `other_user_profile` object
- (And any additional derived/linked fields)

Client code and UI expect the full `ChatResponse` structure as described in [`src/domain/models/chat.models.ts`](../src/domain/models/chat.models.ts).

## Plan of Action

1. **Update ChatController.findMyChats**  
   After fetching and paginating raw chat rows:
   - For each chat:
     - Fetch chat participants (`participants` table, collect user IDs)
     - Count unread messages for the current user (`messages` table, `readed = false AND sender_id ≠ currentUser`)
     - Fetch latest message for the chat, if any (order messages by `created_at DESC`, limit 1)
     - For private chats:
       - Determine the "other" participant (not the authenticated user)
       - Fetch that user's profile (`profiles` or equivalent table)
     - Compose and return full `ChatResponse` object for each chat.

2. **Adjust Mapping Logic (if needed)**
   - Ensure the mapping layer consumes this richer structure correctly.

3. **Testing and Validation**
   - Validate via direct API call and in UI
   - Tests: Chats with/without messages, edge of pagination, private/group, etc.

## Files Involved

- [`src/infraestructure/api/ChatController.ts`](../src/infraestructure/api/ChatController.ts) (main logic)
- [`src/infraestructure/mappers/ChatMapper.ts`](../src/infraestructure/mappers/ChatMapper.ts) (consume updated ChatResponse)
- This doc

## Notes

- This approach favors correctness over minimal queries; optimization (e.g. batched or join queries) may follow if performance is impacted.
- All supplemental data (`participants`, `unreadedCount`, `last_message`, `other_user_profile`) are dynamically fetched alongside each result chat.
