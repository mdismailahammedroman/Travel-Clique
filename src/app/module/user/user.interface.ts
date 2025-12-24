import { Role } from "@prisma/client";

export interface createUserInput {
  name: string;
  email: string;
  password: string;
  fullName?: string;
  profileImage?: string;
  role?: Role;
}

export interface updateUserInput {
  name?: string;
  fullName?: string;
  bio?: string;
  currentLocation?: string;
  profileImage?: string;
  role?: Role;
}

export interface updateProfileInput {
  fullName?: string;
  bio?: string;
  currentLocation?: string;
  profileImage?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
}
