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

export interface DynamicRecord {
  _id?: string;
  imageUrl?: string;
  imageFileId?: string;
  heading: string;
  description?: string;
  link?: string;
  tags?: string[];
}

export interface DynamicSection {
  _id?: string;
  name: string;
  description?: string;
  order: number;
  records: DynamicRecord[];
}

export interface Cheatsheet {
  _id?: string;
  title: string;
  pdfUrl: string;
  pdfFileId: string;
  logoUrl?: string;
  logoFileId?: string;
  createdAt?: string;
  updatedAt?: string;
}

