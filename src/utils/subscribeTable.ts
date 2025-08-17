import { supabase } from "@/src/utils/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribes to a table and emits events on INSERT/UPDATE/DELETE.
 * Returns the Supabase RealtimeChannel.
 */
export function subscribeTable(
  table: string,
  eventTypes: ("INSERT" | "UPDATE" | "DELETE")[],
  callback: (payload: any) => void
): RealtimeChannel {
  console.log(
    `🔗 Subscribing to table: ${table} for events: ${eventTypes.join(", ")}`
  );

  const channel = supabase
    .channel(`realtime:${table}:${Date.now()}`) // Unique channel name
    .on(
      "postgres_changes" as any,
      {
        event: "*", // Listen to all events first for debugging
        schema: "public",
        table,
      },
      (payload: any) => {
        console.log(`📡 Raw event received from ${table}:`, payload);

        // Filter events based on eventTypes
        if (eventTypes.includes(payload.eventType)) {
          callback(payload);
        }
      }
    )
    .subscribe((status: string) => {
      console.log(`📊 Subscription status for ${table}: ${status}`);
      if (status === "SUBSCRIBED") {
        console.log(`✅ Successfully subscribed to ${table}`);
      } else if (status === "CHANNEL_ERROR") {
        console.error(`❌ Error subscribing to ${table}`);
      }
    });

  return channel;
}
