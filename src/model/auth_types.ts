export type LoginData = {
    id: string;
    password: string;
    role: "doctor" | "patient";
}
export type AuthResponse = {
    token: string;
    userId: string;
    role: "doctor" | "patient";
}