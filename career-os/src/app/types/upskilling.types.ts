// ─── Enums ───────────────────────────────────────────────────────────────────
// NOTE: all field names use camelCase to match Spring Boot / Jackson defaults

export type OrgType = 'INDUSTRY' | 'UNIVERSITY';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';
export type OrgMemberRole = 'ORG_ADMIN' | 'HR' | 'MENTOR' | 'REVIEWER' | 'MEMBER';
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
  status: string;
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

export interface PendingMembership {
  id: string;
  organisationId: string;
  organisationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  joinedAt: string;
}

// ─── Industry Project Marketplace ─────────────────────────────────────────────

export type ProjectStatus = 'DRAFT' | 'OPEN' | 'CLOSED';
export type ProjectApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface IndustryProject {
  id: string;
  organisationId: string;
  organisation?: Organisation;
  title: string;
  description?: string;
  skillsRequired?: string;
  maxCandidates: number;
  status: ProjectStatus;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequiredBadge {
  id: string;
  projectId: string;
  badgeId: string;
  badge?: Badge;
}

export interface ProjectApplication {
  id: string;
  projectId: string;
  userId: string;
  status: ProjectApplicationStatus;
  note?: string;
  appliedAt: string;
  reviewedAt?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  missingBadges: Badge[];
  recommendedCourses: Course[];
}

export interface CreateProjectRequest {
  title: string;
  description?: string;
  skillsRequired?: string;
  maxCandidates?: number;
  deadline?: string;
}

// ─── Course Recognition ───────────────────────────────────────────────────────

export type RecognitionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED';

export interface CourseRecognitionRequest {
  id: string;
  courseId: string;
  course?: Course;
  submittingOrgId: string;
  submittingOrg?: Organisation;
  reviewingUniversityId?: string;
  reviewingUniversity?: Organisation;
  status: RecognitionStatus;
  syllabusUrl?: string;
  learningOutcomes?: string;
  creditHours?: number;
  reviewerNotes?: string;
  submittedAt: string;
  reviewedAt?: string;
  updatedAt: string;
}

export interface SubmitRecognitionRequest {
  reviewingUniversityId?: string;
  syllabusUrl?: string;
  learningOutcomes?: string;
  creditHours?: number;
}

export interface ReviewDecisionRequest {
  status: string;
  notes?: string;
}

// ─── Employee Feedback Surveys ────────────────────────────────────────────────

export type SurveyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type QuestionType = 'RATING' | 'SCALE' | 'TEXT';
export type QuestionCategory =
  | 'JOB_SATISFACTION' | 'WORK_ENVIRONMENT' | 'WORK_LIFE_BALANCE'
  | 'TEAM_COLLABORATION' | 'COMMUNICATION' | 'LEADERSHIP'
  | 'CAREER_GROWTH' | 'COMPENSATION' | 'MENTAL_WELLBEING'
  | 'EMPLOYEE_ENGAGEMENT' | 'RETENTION_LIKELIHOOD';

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  JOB_SATISFACTION:    'Job Satisfaction',
  WORK_ENVIRONMENT:    'Work Environment',
  WORK_LIFE_BALANCE:   'Work-Life Balance',
  TEAM_COLLABORATION:  'Team Collaboration',
  COMMUNICATION:       'Communication',
  LEADERSHIP:          'Leadership & Management',
  CAREER_GROWTH:       'Career Growth',
  COMPENSATION:        'Compensation & Benefits',
  MENTAL_WELLBEING:    'Mental Well-being',
  EMPLOYEE_ENGAGEMENT: 'Employee Engagement',
  RETENTION_LIKELIHOOD:'Retention Likelihood',
};

export interface EmployeeSurvey {
  id: string;
  organisationId: string;
  title: string;
  description?: string;
  createdByUserId: string;
  status: SurveyStatus;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyWithCount {
  survey: EmployeeSurvey;
  responseCount: number;
}

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  questionText: string;
  category: QuestionCategory;
  questionType: QuestionType;
  orderIndex: number;
}

export interface AnswerInput {
  questionId: string;
  ratingValue?: number | null;
  textAnswer?: string | null;
}

export interface SurveyAnalytics {
  totalResponses: number;
  overallScore: number;
  scoreByCategory: Record<string, number>;
  openTextResponses: string[];
  responseRate: number;
}

export interface AiInsight {
  id: string;
  surveyId: string;
  insightJson: string;
  generatedAt: string;
}

export interface AiInsightReport {
  overall_sentiment: string;
  satisfaction_analysis: string;
  burnout_indicators: string;
  team_morale: string;
  retention_risk: 'low' | 'moderate' | 'high' | 'critical';
  retention_risk_explanation: string;
  culture_assessment: string;
  top_strengths: string[];
  critical_concerns: string[];
  recommendations: Array<{ priority: string; action: string; rationale: string }>;
  low_score_categories: string[];
  high_score_categories: string[];
  manager_action_plan: string;
  pulse_survey_suggested: boolean;
  ai_available: boolean;
}
