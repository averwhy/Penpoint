import type { Semester } from "$lib/models";
import { getActiveSemester, getNextSemester, getLastSemester, sql } from "$lib/server/postgres";
import type { PageServerLoad } from "./$types";

type SemesterType = "active" | "awaiting" | "past";

export const load: PageServerLoad = async () => {
    let state: SemesterType = "active";
    let semester: Semester | undefined = await getActiveSemester();
    if (!semester) {
        semester = await getNextSemester();
        state = "awaiting";
        if (!semester) {
            semester = await getLastSemester();
            state = "past";
        }
    }
    
    return {
        semesterState : state,
        currentSemester: semester ?? undefined
    };
}