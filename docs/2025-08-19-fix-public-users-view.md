# 2025-08-19 - Fix "public.users does not exist" Error on Profile Fetch

## Problem

When navigating from the swipe page to a user profile by ID, the following error occurs:

```
Error fetching user info: relation "public.users" does not exist
```

This is caused by the code in [`UserProfileController.findUserProfileByUserId()`](../src/infraestructure/api/UserProfileController.ts) attempting to query a `"users"` table in the public schema. Supabase stores users in the `auth.users` table, which is not directly accessible as `"users"` in the public schema.

## Solution

Create a **view** in the public schema called `users` that exposes the necessary fields from `auth.users`. This allows the application code to query `public.users` as expected.

### SQL to Create the View

```sql
create or replace view public.users as
select
  id,
  email,
  phone,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  is_anonymous
from auth.users;
```

> **Note:** Adjust the selected fields as needed for your application.

### How to Apply

1. Open the SQL editor in your Supabase dashboard.
2. Run the SQL above to create the view.
3. Confirm that `public.users` now exists and is queryable.

## Impact

- The error will be resolved.
- The profile fetch will work as intended.
- No code changes are required if the view is created.

## Related Files

- [`src/infraestructure/api/UserProfileController.ts`](../src/infraestructure/api/UserProfileController.ts)
