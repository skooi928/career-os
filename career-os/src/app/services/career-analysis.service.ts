import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProfileService, UserProfileDTO } from './profile.service';

export interface CareerPrediction {
  id?: number;
  userId?: string;
  predictedRoles: PredictedRole[];
  skillGaps: SkillGap[];
  recommendedLearningPaths: LearningPath[];
  careerTrajectory: CareerTrajectoryPoint[];
  analysisDate: string;
  confidence: number;
}

export interface PredictedRole {
  role: string;
  likelihood: number;
  yearsToAchieve: number;
  requiredSkills: string[];
  salaryRange: {
    min: number;
    max: number;
  };
}

export interface SkillGap {
  skillName: string;
  currentLevel: string;
  requiredLevel: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LearningPath {
  title: string;
  description: string;
  duration: string;
  provider?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
}

export interface CareerTrajectoryPoint {
  year: number;
  role: string;
  description: string;
  estimatedSalary: number;
}

@Injectable({
  providedIn: 'root'
})
export class CareerAnalysisService {
  private readonly API_URL = 'http://localhost:8080/api/career-analysis';

  constructor(
    private http: HttpClient,
    private profileService: ProfileService
  ) {}

  /**
   * Analyze career path by finding the most similar career paths
   * based on user's current experience, skills, education, and projects.
   * Backend will match against known career trajectories and similar profiles.
   */
  analyzeCareer(): Observable<CareerPrediction> {
    // First fetch the user's profile to send to backend for analysis
    return new Observable(observer => {
      this.profileService.getUserProfile().subscribe({
        next: (userProfile) => {
          // Send user profile to backend for similarity matching
          this.http.post<CareerPrediction>(`${this.API_URL}/analyze`, {
            userProfile: userProfile
          }).subscribe({
            next: (prediction) => observer.next(prediction),
            error: (err) => observer.error(err),
            complete: () => observer.complete()
          });
        },
        error: (err) => {
          console.error('Failed to fetch user profile', err);
          // Fallback: send empty profile request
          this.http.post<CareerPrediction>(`${this.API_URL}/analyze`, {
            userProfile: {}
          }).subscribe({
            next: (prediction) => observer.next(prediction),
            error: (error) => observer.error(error),
            complete: () => observer.complete()
          });
        }
      });
    });
  }

  /**
   * Get previous career analysis predictions for the current user
   */
  getCareerPredictions(): Observable<CareerPrediction[]> {
    return this.http.get<CareerPrediction[]>(`${this.API_URL}/predictions`);
  }

  /**
   * Get a specific career prediction by ID
   */
  getCareerPrediction(id: number): Observable<CareerPrediction> {
    return this.http.get<CareerPrediction>(`${this.API_URL}/predictions/${id}`);
  }
}
