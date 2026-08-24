import { form, getRequestEvent, command } from "$app/server";
import { Event, Scan } from "$lib/models";
import { sql } from "$lib/server/postgres";
import { sgaOrAbove } from "$lib/utils/permissions";
import { error } from "@sveltejs/kit";

export const scan = form(Scan.omit({ id: true, created_at: true }), async ({ wallet_pass_id, event_id }) => {
  return await submitScan(wallet_pass_id, event_id);
});

export const manualScan = command(Scan.omit({ id: true, created_at: true }), async ({ wallet_pass_id, event_id }) => {
  return await submitScan(wallet_pass_id, event_id);
});

async function submitScan(wallet_pass_id: string, event_id: string) {
  const { locals } = getRequestEvent();
  if (!locals.user) error(401, { message: "Unauthorized" });
  if (!sgaOrAbove(locals.user.role)) error(403, { message: "Forbidden" });

  // TODO: confirm pass here
  // TODO: also try to get user if theres an attached one

  const [_event] = await sql`
    SELECT *
    FROM events
    WHERE id = ${event_id}
    LIMIT 1
`;
  if (!_event) error(404, { message: "Event not found." });

  const event = Event.parse(_event);

  if (event.approval_status !== "accepted") error(403, { message: "Cannot tap into an event that is not accepted." });

  const result = await sql`
    INSERT INTO scans (wallet_pass_id, event_id)
    VALUES (${wallet_pass_id}, ${event_id})
    ON CONFLICT (wallet_pass_id, event_id) DO NOTHING
    RETURNING *
`;
  if (result.length === 0)
    error(500, { message: `${wallet_pass_id} has already been tapped for ${event.name}.` });

  return { scan: Scan.parse(result[0]) };
}
