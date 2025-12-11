import { getFirstClubFromUser } from "$lib/functions/club.remote";
import { getMostRecentSemesterIncludingActive, sql } from "$lib/server/postgres";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) redirect(303, "/login");

    const userClub = await getFirstClubFromUser(locals.user.id);
    const semester = await getMostRecentSemesterIncludingActive();

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
        sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(DISTINCT club_id) as count
            FROM events
            WHERE semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE semester_id = ${semester.id}
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(t.id) as count
            FROM taps t
            JOIN events e ON t.event_id = e.id
            WHERE e.semester_id = ${semester.id}
        `,
        sql`
            SELECT COUNT(*) as count
            FROM events
            WHERE starts_at < now()
        `,
        sql`
            SELECT SUM(e.point_value) as total_points
            FROM taps t
            JOIN events e ON t.event_id = e.id
        `,
        sql`
            SELECT COUNT(t.id) as count
            FROM taps t
            JOIN events e ON t.event_id = e.id
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
            sql`
                SELECT COUNT(*) as count
                FROM club_users
                WHERE club_id = ${userClub.id}
                AND for_semester = ${semester.id}
            `,
            sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            `,
            sql`
                SELECT SUM(e.point_value) as total_points
                FROM taps t
                JOIN events e ON t.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            `,
            sql`
                SELECT COUNT(t.id) as count
                FROM taps t
                JOIN events e ON t.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id} AND e.semester_id = ${semester.id}
            `,
            sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
                AND e.starts_at > now() 
                AND e.semester_id = ${semester.id}
            `,
            sql`
                SELECT COUNT(*) as count
                FROM events e
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
            sql`
                SELECT SUM(e.point_value) as total_points
                FROM taps t
                JOIN events e ON t.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
            sql`
                SELECT COUNT(t.id) as count
                FROM taps t
                JOIN events e ON t.event_id = e.id
                JOIN club_users cu ON e.club_id = cu.club_id
                WHERE cu.user_id = ${locals.user.id}
            `,
        ]);

        clubStats = {
            semester: {
                eventsHosted: Number(clubSemesterEventsResult[0]?.count ?? 0),
                pointsEarned: Number(clubSemesterPointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(clubSemesterAttendanceResult[0]?.count ?? 0),
                upcomingEvents: Number(clubUpcomingEventsResult[0]?.count ?? 0),
            },
            allTime: {
                eventsHosted: Number(clubAllTimeEventsResult[0]?.count ?? 0),
                pointsEarned: Number(clubAllTimePointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(clubAllTimeAttendanceResult[0]?.count ?? 0),
            },
            members: Number(clubMembersResult[0]?.count ?? 0),
        };
    }

    const nameGreetings = [
        "Hey there, ",
        "Welcome back, ",
        "Good to see you, ",
        "Sup, ",
        "Hi there, ",
        "Howdy, ",
        "What's up, ",
        "Ahoy, ",
        "Today's a good day, ",
    ];

    return {
        greeting: nameGreetings[Math.floor(Math.random() * nameGreetings.length)],
        club: clubStats,
        platform: {
            semester: {
                eventsHosted: Number(platformSemesterEventsResult[0]?.count ?? 0),
                pointsEarned: Number(platformSemesterPointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(platformSemesterAttendanceResult[0]?.count ?? 0),
                upcomingEvents: Number(upcomingEventsResult[0]?.count ?? 0),
                uniqueClubsHostingEvents: Number(uniqueClubsHostingEventsResult[0]?.count ?? 0),
            },
            allTime: {
                eventsHosted: Number(platformAllTimeEventsResult[0]?.count ?? 0),
                pointsEarned: Number(platformAllTimePointsResult[0]?.total_points ?? 0),
                attendanceCount: Number(platformAllTimeAttendanceResult[0]?.count ?? 0),
            },
        },
    };
};
