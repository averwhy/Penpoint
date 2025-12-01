export function clubOrAbove(role: string): boolean {
    const allowedRoles = ["club", "sga", "admin"];
    return allowedRoles.includes(role);
}

export function sgaOrAbove(role: string): boolean {
    const allowedRoles = ["sga", "admin"];
    return allowedRoles.includes(role);
}