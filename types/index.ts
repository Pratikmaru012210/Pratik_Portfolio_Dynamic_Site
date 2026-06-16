export interface SocialMediaLink {
  url: string;
  icon: string;
  iconFileId?: string;
}

export interface Skill {
  _id?: string;
  skill: string;
  icon: string;
  iconFileId?: string;
}

export interface Service {
  _id?: string;
  service: string;
  icon: string;
  iconFileId?: string;
  description: string;
}

export interface Project {
  _id?: string;
  projectName: string;
  imageUrl: string;
  imageFileId?: string;
  description: string;
  gitHubLink?: string;
  liveLink?: string;
  techStack?: string[];
  problemSolve?: string;
}

export interface ProfileData {
  firstName: string;
  lastName: string;
  emailId?: string;
  phoneNumber?: string;
  tagline: string;
  shortIntro: string;
  profilePicUrl: string;
  profilePicFileId?: string;
  resumeUrl: string;
  resumeFileId?: string;
  socialMediaLinks: SocialMediaLink[];
}
