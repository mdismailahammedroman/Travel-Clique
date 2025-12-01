export interface createUserInput {
    name: string;
    email: string;
    password: string;
    fullName?: string;
    profileImage?: string;
    role?: "USER" | "MODERATOR" | "ADMIN";
}