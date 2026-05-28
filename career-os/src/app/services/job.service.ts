import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RoleSkillRequirement {
  roleSkillId?: string;
  skillText: string;
}

export interface RoleRequirement {
  requirementId?: string;
  seniorityLevel: string;
  requiredExperienceYears: number;
  jobDescription: string;
  skills: RoleSkillRequirement[];
}

export interface JobQuestion {
  id?: string;
  questionText: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE';
  options?: string[];
}

export interface Job {
  id?: string;
  title: string;
  company: string;
  initials: string;
  location: string;
  employmentType: string;
  minSalary: number;
  maxSalary: number;
  deadline: string;
  vacancies: number;
  website?: string;
  isNew?: boolean;
  createdAt?: string;
  roleRequirements: RoleRequirement[];
  questions?: JobQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly API_URL = 'http://localhost:8080/api/jobs';
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  public jobs$ = this.jobsSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadJobs(): void {
    this.http.get<Job[]>(this.API_URL, { headers: this.getHeaders() }).subscribe({
      next: (jobsData) => {
        const now = new Date().getTime();
        const mappedJobs = jobsData.map(j => {
          let isNew = false;
          if (j.createdAt) {
            const createdTime = new Date(j.createdAt).getTime();
            // True if created within the last 24 hours
            isNew = (now - createdTime) < (24 * 60 * 60 * 1000);
          }
          return {
            ...j,
            isNew: isNew
          };
        });
        this.jobsSubject.next(mappedJobs);
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  addJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.API_URL, job, { headers: this.getHeaders() }).pipe(
      tap(savedJob => {
        const newJob = {
          ...savedJob,
          isNew: true
        };
        const currentJobs = this.jobsSubject.value;
        this.jobsSubject.next([newJob, ...currentJobs]);
      })
    );
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }
}
