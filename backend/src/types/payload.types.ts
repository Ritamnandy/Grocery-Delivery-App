export type JwtPayload = {
    id: string;
    email: string;
    role: string;
};

export type JwtRefreshPayload = {
    id: string;
    email: string;
    role: string;
};