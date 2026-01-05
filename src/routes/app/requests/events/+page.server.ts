// import { sql } from "$lib/server/postgres";
// import type { PageServerLoad } from "./$types";
// import {Event, EventRequest} from "$lib/models";

// export const load: PageServerLoad = async ({ locals }) => {
//     const requestsResult = await sql`
//         SELECT *
//         FROM event_requests
//     `;

//     const eventsResult = await sql`
//         SELECT *
//         FROM events
//         WHERE id = ANY(${requestsResult.map(r => r.event_id)})
//     `;

//     const eventRequests = requestsResult.map(requestRow => {

//     return {
//         eventRequests,
//     };
// };