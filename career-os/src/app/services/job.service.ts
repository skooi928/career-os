import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface RoleTechnicalSkillRequirement {
  roleTechnicalSkillId?: string;
  technicalSkillText: string;
}

export interface RoleMustHaveRequirement {
  mustHaveId?: string;
  requirementText: string;
}

export interface RoleRequirement {
  requirementId?: string;
  seniorityLevel: string;
  requiredExperienceYears: number;
  jobDescription: string;
  technicalSkills: RoleTechnicalSkillRequirement[];
  mustHaveRequirements: RoleMustHaveRequirement[];
}

export interface JobQuestion {
  id?: string;
  questionText: string;
  questionType: 'TEXT' | 'MULTIPLE_CHOICE';
  options?: string[];
}

export interface JobBenefit {
  id?: string;
  benefitText: string;
}

export interface Job {
  id?: string;
  employerId?: string;
  organisationId?: string;
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
  isSaved?: boolean;
  applicantsCount?: number;
  createdAt?: string;
  roleRequirements: RoleRequirement[];
  questions?: JobQuestion[];
  benefits?: JobBenefit[];
}

import { EventService } from './event.service';
import { environment } from '../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly API_URL = `${environment.apiUrl}/api/jobs`;
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  public jobs$ = this.jobsSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService, private eventService: EventService) {
    this.eventService.newJobPosted$.subscribe(newJob => {
      const currentJobs = this.jobsSubject.value;
      // Ensure we don't duplicate if we created it ourselves
      if (!currentJobs.find(j => j.id === newJob.id)) {
        this.jobsSubject.next([{...newJob, isNew: true}, ...currentJobs]);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  loadJobs(): void {
    this.loadingSubject.next(true);
    const token = this.authService.getToken();
    if (!token) {
      this.http.get<Job[]>(this.API_URL).subscribe({
        next: (jobsData) => {
          const now = new Date().getTime();
          const mapped = jobsData.map(j => {
            const createdTime = j.createdAt ? new Date(j.createdAt).getTime() : 0;
            return { ...j, isNew: (now - createdTime) < (24 * 60 * 60 * 1000), isSaved: false };
          });
          this.jobsSubject.next(mapped);
          this.loadingSubject.next(false);
        },
        error: (err) => {
          console.error('Failed to load jobs', err);
          this.loadingSubject.next(false);
        }
      });
      return;
    }

    combineLatest([
      this.http.get<Job[]>(this.API_URL, { headers: this.getHeaders() }),
      this.http.get<Job[]>(`${environment.apiUrl}/api/saved-jobs`, { headers: this.getHeaders() })
    ]).subscribe({
      next: ([jobsData, savedJobs]) => {
        const savedIds = new Set((savedJobs || []).map(sj => sj.id));
        const now = new Date().getTime();
        const mappedJobs = jobsData.map(j => {
          let isNew = false;
          if (j.createdAt) {
            const createdTime = new Date(j.createdAt).getTime();
            isNew = (now - createdTime) < (24 * 60 * 60 * 1000);
          }
          return {
            ...j,
            isNew: isNew,
            isSaved: savedIds.has(j.id)
          };
        });
        this.jobsSubject.next(mappedJobs);
        this.loadingSubject.next(false);
      },
      error: (err) => {
        console.error('Failed to load jobs with bookmarks', err);
        this.http.get<Job[]>(this.API_URL, { headers: this.getHeaders() }).subscribe({
          next: (jobsData) => {
            const now = new Date().getTime();
            const mapped = jobsData.map(j => {
              const createdTime = j.createdAt ? new Date(j.createdAt).getTime() : 0;
              return { ...j, isNew: (now - createdTime) < (24 * 60 * 60 * 1000), isSaved: false };
            });
            this.jobsSubject.next(mapped);
            this.loadingSubject.next(false);
          },
          error: (error) => {
            console.error('Failed to load jobs second try', error);
            this.loadingSubject.next(false);
          }
        });
      }
    });
  }

  saveJob(jobId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/saved-jobs`, { jobId }, { headers: this.getHeaders() });
  }

  unsaveJob(jobId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/api/saved-jobs/${jobId}`, { headers: this.getHeaders() });
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

  getJobsByEmployerId(employerId: string): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.API_URL}/employer/${employerId}`, { headers: this.getHeaders() });
  }

  updateJob(id: string, job: Partial<Job>): Observable<Job> {
    return this.http.put<Job>(`${this.API_URL}/${id}`, job, { headers: this.getHeaders() });
  }
}
