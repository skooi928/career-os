// ─── Enums ───────────────────────────────────────────────────────────────────
// NOTE: all field names use camelCase to match Spring Boot / Jackson defaults

export type OrgType = 'INDUSTRY' | 'UNIVERSITY';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type OrgMemberRole = 'ORG_ADMIN' | 'HR' | 'MENTOR' | 'REVIEWER';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EnrollmentStatus = 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
export type BadgeVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type ConversionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─── Job Badge Types ──────────────────────────────────────────────────────────

export interface JobRequiredBadge {
  id: string;
  jobId: string;
  badgeId?: string;
  badge?: Badge;
  skillTag?: string;
  isRequired: boolean; // true = mandatory, false = preferred
}

export interface CandidateMatchResponse {
  candidateId: string;
  candidateName: string;
  matchScore: number;       // 0–100
  matchedBadges: string[];  // badge IDs held
  missingBadges: string[];  // required badge IDs missing
}

/** Response from PUT /enrollments/:id/progress — includes optional badge award. */
export interface UpdateProgressResponse {
  enrollment: CourseEnrollment;
  awardedBadge: UserBadge | null; // non-null when badge auto-awarded on completion
}

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Organisation {
  id: string;
  name: string;
  type: OrgType;
  logoUrl?: string;
  website?: string;
  description?: string;
  emailDomain?: string;
  verificationStatus: VerificationStatus;
  verificationDocumentUrl?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganisationMember {
  id: string;
  organisationId: string;
  userId: string;
  role: OrgMemberRole;
  invitedBy?: string;
  joinedAt: string;
  organisation?: Organisation;
}

export interface Course {
  id: string;
  organisationId: string;
  title: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  durationHours?: number;
  isPublished?: boolean;
  createdAt: string;
  organisation?: Organisation;
  enrolledCount?: number;
  /** Badge awarded automatically upon 100% completion. Null = no badge. */
  badgeId?: string;
  badge?: Badge;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  progressPercentage: number;
  completionStatus: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  course?: Course;
}

export interface Badge {
  id: string;
  organisationId: string;
  name: string;
  description?: string;
  badgeImageUrl?: string;
  skillTag?: string;
  createdAt: string;
  organisation?: Organisation;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  verificationStatus: BadgeVerificationStatus;
  issuedAt: string;
  /** Populated when badge was auto-awarded by completing a course. */
  awardedByCourseId?: string;
  /** Eagerly loaded badge details. */
  badge?: Badge;
}

export interface UniversityCourseConversion {
  id: string;
  userId: string;
  universityName: string;
  courseName: string;
  uploadedDocumentUrl?: string;
  mappedBadgeId?: string;
  status: ConversionStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
  badge?: Badge;
}

// ─── Request / Response ───────────────────────────────────────────────────────

export interface CreateOrganisationRequest {
  name: string;
  type: OrgType;
  website?: string;
  description?: string;
  emailDomain?: string;
}

export interface UpdateOrganisationRequest {
  name?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  emailDomain?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: OrgMemberRole;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  category?: string;
  difficultyLevel?: string;
  durationHours?: number;
}

export interface UpdateProgressRequest {
  progressPercentage: number;
}

export interface CreateBadgeRequest {
  name: string;
  description?: string;
  skillTag?: string;
}

export interface IssueBadgeRequest {
  badgeId: string;
  userId: string;
}

export interface SubmitConversionRequest {
  universityName: string;
  courseName: string;
  uploadedDocumentUrl?: string;
  mappedBadgeId?: string;
}

export interface ReviewConversionRequest {
  status: 'APPROVED' | 'REJECTED';
  badgeId?: string;
  notes?: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface OrgDashboardStats {
  publishedCourses: number;
  totalEnrollments: number;
  totalBadgesIssued: number;
  pendingVerifications: number;
}

export interface LearnerStats {
  totalEnrolled: number;
  completed: number;
  inProgress: number;
}
