import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface StartSessionRequest {
  userId: string;
  targetRole: string;
  industry: string;
  department: string;
  seniorityLevel: string;
  language: string;
  interviewMode: string;
  interviewType: string;
  skills: string[];
}

export interface MockInterviewSession {
  sessionId: string;
  userId: string;
  targetRole: string;
  status: string;
  overallScore?: number;
  evaluationSummary?: string;
}

export interface InterviewQuestion {
  questionId: string;
  sessionId: string;
  questionText: string;
  questionTag: string;
  questionType: string;
  difficultyLevel: string;
  sequenceNumber: number;
}

export interface InterviewEvaluation {
  evaluationId: string;
  answerId: string;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  roleFitScore: number;
  overallAnswerScore: number;
  feedbackText: string;
  strengths: string;
  weaknesses: string;
  improvedSampleAnswer: string;
  skillGapDetected: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockInterviewService {
  private readonly API_URL = 'http://localhost:8080/api/mock-interview';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  startSession(request: StartSessionRequest): Observable<MockInterviewSession> {
    return this.http.post<MockInterviewSession>(`${this.API_URL}/start`, request, { headers: this.getHeaders() });
  }

  getQuestions(sessionId: string): Observable<InterviewQuestion[]> {
    return this.http.get<InterviewQuestion[]>(`${this.API_URL}/${sessionId}/questions`, { headers: this.getHeaders() });
  }

  submitAnswer(
    questionId: string, 
    userId: string, 
    answerText: string, 
    questionText: string, 
    targetRole: string,
    transcriptText?: string,
    audioBlob?: Blob,
    videoBlob?: Blob,
    responseDuration?: number
  ): Observable<InterviewEvaluation> {
    const formData = new FormData();
    formData.append('questionId', questionId);
    formData.append('userId', userId);
    formData.append('answerText', answerText);
    formData.append('questionText', questionText);
    formData.append('targetRole', targetRole);
    
    if (transcriptText) {
      formData.append('transcriptText', transcriptText);
    }
    
    if (audioBlob) {
      let ext = 'webm';
      if (audioBlob.type.includes('mp4')) ext = 'mp4';
      else if (audioBlob.type.includes('ogg')) ext = 'ogg';
      else if (audioBlob.type.includes('wav')) ext = 'wav';
      
      formData.append('audioFile', audioBlob, `answer.${ext}`);
    }
    
    if (videoBlob) {
      formData.append('videoFile', videoBlob, 'answer.webm');
    }
    
    if (responseDuration) {
      formData.append('responseDuration', responseDuration.toString());
    }

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    }); // Do not set Content-Type for FormData, browser will set it with boundary

    return this.http.post<InterviewEvaluation>(`${this.API_URL}/answer`, formData, { headers });
  }
}
