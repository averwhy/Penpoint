import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
    let semester: any;
    try {
        semester = await getMostRecentSemesterIncludingActive();
    } catch (err: unknown) {
        const e = err as any;
        const isConnRefused =
            err instanceof AggregateError
                ? Array.isArray(err.errors) && err.errors.some((inner: any) => inner?.code === "ECONNREFUSED")
                : e?.code === "ECONNREFUSED" || String(e?.message).includes("ECONNREFUSED");

        if (isConnRefused) return undefined;
        throw err;
    }

    const [pointEarnersResult, pointsEarnedResult, upcomingEventsResult] = await Promise.all([
        sql`
            SELECT COUNT(DISTINCT student_id)
            FROM taps
            WHERE semester_id = ${semester.id}
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE t.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at > now() AND starts_at < ${semester.ends}
        `,
    ]);

    const pointEarners = Number(pointEarnersResult[0]?.count ?? 0);
    const pointsEarned = Number(pointsEarnedResult[0]?.total_points ?? 0);
    const upcomingEvents = Number(upcomingEventsResult[0]?.count ?? 0);

    const now = new Date();
    const semesterEnd = new Date(semester.ends);
    const daysLeft = Math.ceil((semesterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return { pointEarners, pointsEarned, upcomingEvents, daysLeft };
};
