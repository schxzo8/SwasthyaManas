// Common type definitions for the application
export type ContentType = "page" | "resource" | "blog" | "mental_health";
export type PageType = "about" | "services" | "faq" | "meditation";

export interface ContentItem {
  _id: string;
  title: string;
  body: string;
  contentType: ContentType;
  pageType?: PageType | null;
  topic?: string | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecodedToken {
  role: string;
  userId?: string;
  email?: string;
  [key: string]: any;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "expert" | "admin";
  expertise?: string;
}

export interface AssessmentData {
  _id?: string;
  name: string;
  description: string;
  questions: Question[];
}

export interface AssessmentRecord {
  _id: string;
  assessmentType: string;
  totalScore: number;
  severity: string;
  createdAt: string;
  answers?: any[];
}

export interface Assessment {
  _id: string;
  type: string;
  score: number;
  severity: string;
  answers: number[];
  createdAt: string;
}

export interface Expert {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise?: string;
  // optional future fields
  image?: string;
  rating?: number;
  location?: string;
  available?: boolean;
  specialties?: string[];
}

export interface Consultation {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expert: Expert;
  reason: string;
  status: "pending" | "accepted" | "rejected" | "closed";
  expertReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  text: string;
  options: Option[];
}

export interface Option {
  label: string;
  value: number;
}
