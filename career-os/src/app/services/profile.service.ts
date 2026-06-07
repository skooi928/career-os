import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
}

export interface Experience {
  id: number;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id: number;
  name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  endorsed: number;
}

export interface QuickTask {
  id?: number;
  description: string;
  status: string; // 'added' or 'closed'
  priority: string; // 'high', 'medium', 'low'
}

export interface UserProfileDTO {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImageUrl?: string;
  experiences?: Experience[];
  education?: Education[];
  projects?: Project[];
  skills?: Skill[];
  quickTasks?: QuickTask[];
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = 'http://localhost:8080/api/profile';

  private profileUpdatedSource = new Subject<UserProfileDTO>();
  profileUpdated$ = this.profileUpdatedSource.asObservable();

  announceProfileUpdate(profile: UserProfileDTO) {
    this.profileUpdatedSource.next(profile);
  }

  constructor(private http: HttpClient) {}

  // User Profile Methods
  getUserProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(this.API_URL);
  }

  getProfile(userId: string): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.API_URL}?userId=${userId}`);
  }

  updateUserProfile(profileDTO: Partial<UserProfileDTO>): Observable<UserProfileDTO> {
    return this.http.put<UserProfileDTO>(this.API_URL, profileDTO);
  }

  // Experience Methods
  addExperience(experience: Experience): Observable<Experience> {
    return this.http.post<Experience>(`${this.API_URL}/experience`, experience);
  }

  updateExperience(id: number, experience: Experience): Observable<Experience> {
    return this.http.put<Experience>(`${this.API_URL}/experience/${id}`, experience);
  }

  deleteExperience(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/experience/${id}`);
  }

  // Education Methods
  addEducation(education: Education): Observable<Education> {
    return this.http.post<Education>(`${this.API_URL}/education`, education);
  }

  updateEducation(id: number, education: Education): Observable<Education> {
    return this.http.put<Education>(`${this.API_URL}/education/${id}`, education);
  }

  deleteEducation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/education/${id}`);
  }

  // Project Methods
  addProject(project: Project): Observable<Project> {
    return this.http.post<Project>(`${this.API_URL}/project`, project);
  }

  updateProject(id: number, project: Project): Observable<Project> {
    return this.http.put<Project>(`${this.API_URL}/project/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/project/${id}`);
  }

  // Skill Methods
  addSkill(skill: Skill): Observable<Skill> {
    return this.http.post<Skill>(`${this.API_URL}/skill`, skill);
  }

  updateSkill(id: number, skill: Skill): Observable<Skill> {
    return this.http.put<Skill>(`${this.API_URL}/skill/${id}`, skill);
  }

  deleteSkill(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/skill/${id}`);
  }

  // Quick Task Methods
  addQuickTask(task: QuickTask): Observable<QuickTask> {
    return this.http.post<QuickTask>(`${this.API_URL}/tasks`, task);
  }

  updateQuickTask(id: number, task: QuickTask): Observable<QuickTask> {
    return this.http.put<QuickTask>(`${this.API_URL}/tasks/${id}`, task);
  }

  deleteQuickTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/tasks/${id}`);
  }
}
