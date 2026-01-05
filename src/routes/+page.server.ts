import type { Semester } from "$lib/models";
import { getActiveSemester, getNextSemester, getLastSemester, sql } from "$lib/server/postgres";
import type { PageServerLoad } from "./$types";

type SemesterType = "active" | "awaiting" | "past";

export const load: PageServerLoad = async () => {
    const now = new Date();

    // Check for active semester first
    const active = await getActiveSemester(false).catch(() => undefined);
    if (active) {
        const stats = await getSemesterStats(active);
        return {
            stats: {
                type: "active" as SemesterType,
                ...stats,
                daysLeft: Math.ceil((new Date(active.ends).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            },
        };
    }

    // No active semester - check for future semester
    const future = await getNextSemester();
    if (future) {
        // Show past semester stats with countdown to future semester
        const past = await getLastSemester();
        if (past) {
            const stats = await getSemesterStats(past);
            return {
                stats: {
                    type: "awaiting" as SemesterType,
                    ...stats,
                    daysLeft: Math.ceil((new Date(future.starts).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                },
            };
        }
    }

    // Fallback to past semester only (no future semester exists)
    const past = await getLastSemester();
    if (past) {
        const stats = await getSemesterStats(past);
        return {
            stats: {
                type: "past" as SemesterType,
                ...stats,
                daysLeft: 0,
            },
        };
    }

    return { stats: null };
};

async function getSemesterStats(semester: Semester) {
    const [pointEarnersResult, pointsEarnedResult, upcomingEventsResult, totalEventsResult] = await Promise.all([
        sql`
            SELECT COUNT(DISTINCT t.student_id)
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE starts_at > now() AND semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*)
            FROM events
            WHERE semester_id = ${semester.id}
        `,
    ]);

    return {
        semesterName: semester.code,
        pointEarners: Number(pointEarnersResult[0]?.count ?? 0),
        pointsEarned: Number(pointsEarnedResult[0]?.total_points ?? 0),
        upcomingEvents: Number(upcomingEventsResult[0]?.count ?? 0),
        totalEvents: Number(totalEventsResult[0]?.count ?? 0),
    };
}
