// src/modules/profile/profile.interface.ts

export interface createProfileInput {
  fullName: string;
  bio?: string;
  currentLocation?: string;
  profileImage?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
}

export interface updateProfileInput {
  fullName?: string;
  bio?: string;
  currentLocation?: string;
  profileImage?: string;
  travelInterests?: string[];
  visitedCountries?: string[];
}
