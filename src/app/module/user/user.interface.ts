export interface createUserInput {
  name: string;
  email: string;
  password: string;
  fullName?: string;
  profileImage?: string;
  role?: "USER" | "MODERATOR" | "ADMIN";
}

export interface updateUserInput {
  name?: string;
  fullName?: string;
  bio?: string;
  currentLocation?: string;
  profileImage?: string;
    role?: "USER" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN";
}
