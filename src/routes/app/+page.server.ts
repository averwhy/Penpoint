import { getFirstClubFromUser } from "$lib/functions/club.remote";
import { getActiveSemester, getLastSemester, sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    const userClub = await getFirstClubFromUser(locals.user.id);

    // Get active semester, or fall back to last semester if none active
    const semester = (await getActiveSemester(false).catch(() => undefined)) ?? (await getLastSemester());

    // Platform-wide statistics
    const [
        upcomingEventsResult,
        uniqueClubsHostingEventsResult,
        platformSemesterEventsResult,
        platformSemesterPointsResult,
        platformSemesterAttendanceResult,
        platformAllTimeEventsResult,
        platformAllTimePointsResult,
        platformAllTimeAttendanceResult,
    ] = await Promise.all([
        semester ? sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE semester_id = ${semester.id}
        ` : undefined,
        semester ? sql`
            SELECT COUNT(DISTINCT club_id) as count
            FROM events
            WHERE semester_id = ${semester.id}
        ` : undefined,
        semester ? sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE semester_id = ${semester.id}
        ` : undefined,
        semester ? sql`
            SELECT SUM(e.point_value) as total_points
            FROM scans s
            JOIN events e ON s.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        ` : undefined,
        semester ? sql`
            SELECT COUNT(s.id) as count
            FROM scans s
            JOIN events e ON s.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        ` : undefined,
        sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE starts_at < now()
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM scans s
            JOIN events e ON s.event_id = e.id
        `,
        sql`
            SELECT COUNT(s.id) as count
            FROM scans s
            JOIN events e ON s.event_id = e.id
        `,
    ]);

    let clubStats:
        | {
              semester: {
                  eventsHosted: number;
                  pointsEarned: number;
                  attendanceCount: number;
                  upcomingEvents: number;
              };
              allTime: {
                  eventsHosted: number;
                  pointsEarned: number;
                  attendanceCount: number;
              };
              members: number;
          }
        | undefined;

    if (userClub) {
        const [
            clubMembersResult,
            clubSemesterEventsResult,
            clubSemesterPointsResult,
            clubSemesterAttendanceResult,
            clubUpcomingEventsResult,
            clubAllTimeEventsResult,
            clubAllTimePointsResult,
            clubAllTimeAttendanceResult,
        ] = await Promise.all([
            semester ? sql`
                SELECT COUNT(*) as count
                FROM club_users
                WHERE club_id = ${userClub.id}
                AND for_semester = ${semester.id}
            ` : undefined,
            semester ? sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            ` : undefined,
            semester ? sql`
                SELECT SUM(e.point_value) as total_points
                FROM scans s
                JOIN events e ON s.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            ` : undefined,
            semester ?  sql`
                SELECT COUNT(s.id) as count
                FROM scans s
                JOIN events e ON s.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            ` : undefined,
            semester ? sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
                AND e.starts_at > now() 
                AND e.semester_id = ${semester.id}
            ` : undefined,
            sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
            sql`
                SELECT SUM(e.point_value) as total_points
                FROM scans s
                JOIN events e ON s.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
            sql`
                SELECT COUNT(s.id) as count
                FROM scans s
                JOIN events e ON s.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
        ]);

        clubStats = {
            semester: {
                eventsHosted: clubSemesterEventsResult ? Number(clubSemesterEventsResult[0]?.count ?? 0) : 0,
                pointsEarned: clubSemesterPointsResult ? Number(clubSemesterPointsResult[0]?.total_points ?? 0) : 0,
                attendanceCount: clubSemesterAttendanceResult ? Number(clubSemesterAttendanceResult[0]?.count ?? 0) : 0,
                upcomingEvents: clubUpcomingEventsResult ? Number(clubUpcomingEventsResult[0]?.count ?? 0) : 0,
            },
            allTime: {
                eventsHosted: Number(clubAllTimeEventsResult[0]?.count ?? 0),
                pointsEarned: Number(clubAllTimePointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(clubAllTimeAttendanceResult[0]?.count ?? 0),
            },
            members: clubMembersResult ? Number(clubMembersResult[0]?.count ?? 0) : 0,
        };
    }

    return {
        club: clubStats,
        platform: {
            semester: {
                eventsHosted: platformSemesterEventsResult ? Number(platformSemesterEventsResult[0]?.count ?? 0) : 0,
                pointsEarned: platformSemesterPointsResult ? Number(platformSemesterPointsResult[0]?.total_points ?? 0) : 0,
                attendanceCount: platformSemesterAttendanceResult ? Number(platformSemesterAttendanceResult[0]?.count ?? 0) : 0,
                upcomingEvents: upcomingEventsResult ? Number(upcomingEventsResult[0]?.count ?? 0): 0,
                uniqueClubsHostingEvents: uniqueClubsHostingEventsResult ? (uniqueClubsHostingEventsResult[0]?.count ?? 0) : 0,
            },
            allTime: {
                eventsHosted: Number(platformAllTimeEventsResult[0]?.count ?? 0),
                pointsEarned: Number(platformAllTimePointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(platformAllTimeAttendanceResult[0]?.count ?? 0),
            },
        },
    };
};
