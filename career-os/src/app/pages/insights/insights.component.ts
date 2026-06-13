import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { CareerAnalysisService, CareerPrediction, PredictedRole } from '../../services/career-analysis.service';
import { ProfileService, Experience, Education } from '../../services/profile.service';

interface RoadmapNode {
  x: number;
  y: number;
  label: string;
  experience?: Experience | null;
  education?: Education | null;
  prediction?: PredictedRole | null;
  type: 'history' | 'prediction';
  yearsRange: string;
}

interface RoadmapPath {
  d: string;
  type: 'history' | 'prediction';
}

@Component({
  selector: 'app-insights',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="career-analysis-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Your Career Roadmap</h1>
          <p>Visualize your career journey from past achievements to future possibilities.</p>
        </div>
        <div class="header-icon">
          <i class="ph-fill ph-map-trifold"></i>
        </div>
      </div>

      <!-- Error Banner -->
      <div *ngIf="error" class="error-banner" style="margin: 0 40px 20px; padding: 12px 16px; border-radius: 8px; background: #fee2e2; border: 1px solid #fca5a5; color: #b91c1c; font-size: 14px; display: flex; align-items: center; gap: 8px;">
        <span>⚠️</span> {{ error }}
      </div>

      <div class="analysis-content">
        <div class="roadmap-section">
          <h2>Career Trajectory</h2>
          <div class="roadmap-container">
            <!-- Loading State -->
            <div *ngIf="isLoading" class="trajectory-empty-state">
              <div class="spinner"></div>
              <h3>Running Career Analysis...</h3>
              <p>Gemini is predicting your future career paths based on your experience and profile. This may take a few seconds...</p>
            </div>

            <!-- Trajectory Empty State -->
            <div *ngIf="!isLoading && roadmapNodes.length === 0" class="trajectory-empty-state">
              <div class="empty-icon-wrapper">
                <i class="ph ph-graduation-cap"></i>
                <i class="ph ph-suitcase-simple"></i>
              </div>
              <h3>Your Trajectory is Empty</h3>
              <p>Add your education background or work experience in your profile settings, and we will map out your career roadmap and future predictions here.</p>
              <button class="btn-primary-action" (click)="navigateToProfile()">
                <i class="ph ph-plus-circle"></i> Complete Your Profile
              </button>
            </div>

            <svg *ngIf="!isLoading && roadmapNodes.length > 0" class="roadmap-canvas" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid meet">
              <g class="connection-lines">
                <path *ngFor="let path of paths" 
                      [attr.d]="path.d" 
                      [attr.class]="path.type === 'history' ? 'main-path' : 'shadow-path'"
                      [attr.stroke]="path.type === 'history' ? '#059669' : '#d1fae5'"
                      stroke-dasharray="8,5" fill="none" stroke-width="3" />
              </g>

              <g class="main-nodes">
                <g *ngFor="let node of roadmapNodes; let i = index" 
                   (mouseenter)="onNodeHover(i)" 
                   (mouseleave)="hoveredNode = null" 
                   (click)="onNodeClick(node)"
                   class="node-group">
                  <circle [attr.cx]="node.x" [attr.cy]="node.y" 
                          [attr.r]="node.type === 'history' ? 20 : 16" 
                          class="node"
                          [ngClass]="[
                            node.type === 'prediction' ? 'shadow-node' : 
                            (node.education ? 'education-node' : 'primary-node'),
                            hoveredNode === i ? 'hovered' : ''
                          ]" />
                  <text [attr.x]="node.x" [attr.y]="node.y + 5" text-anchor="middle" 
                        class="node-label"
                        [ngClass]="node.education ? 'education-label' : 'experience-label'">
                    {{ node.type === 'history' ? i + 1 : '?' }}
                  </text>
                </g>
              </g>
            </svg>

            <div *ngIf="roadmapNodes.length > 0 && hoveredNode !== null && nodeTooltip" class="node-tooltip">
              <div class="tooltip-header">
                <h4>{{ nodeTooltip.label }}</h4>
                <span class="years-badge">{{ nodeTooltip.yearsRange }}</span>
              </div>
              
              <div *ngIf="nodeTooltip.type === 'history' && nodeTooltip.experience" class="tooltip-content">
                <div class="tooltip-row">
                  <span class="company">@ {{ nodeTooltip.experience.company }}</span>
                </div>
                <p class="description">{{ nodeTooltip.experience.description }}</p>
              </div>

              <div *ngIf="nodeTooltip.type === 'history' && nodeTooltip.education" class="tooltip-content">
                <div class="tooltip-row">
                  <span class="field-info">Major: {{ nodeTooltip.education.field }}</span>
                  <span class="company">@ {{ nodeTooltip.education.institution }}</span>
                </div>
              </div>

              <div *ngIf="nodeTooltip.type === 'prediction'" class="tooltip-content">
                <div class="tooltip-row" *ngIf="nodeTooltip.prediction">
                  <span class="company">{{ nodeTooltip.prediction.likelihood }}% Match Likelihood</span>
                </div>
                <p class="description">
                  {{ nodeTooltip.prediction ? 'Based on your current trajectory and skill sets.' : 'Click to predict your suitable career pathway' }}
                </p>
                <div class="prediction-hint">
                  {{ nodeTooltip.prediction ? 'Click "Run Analysis" for details' : 'Click to run analysis now' }}
                </div>
              </div>
            </div>

            <div *ngIf="roadmapNodes.length > 0" class="roadmap-legend">
              <div class="legend-item">
                <div class="legend-indicator education"></div>
                <span>Education History</span>
              </div>
              <div class="legend-item">
                <div class="legend-indicator primary"></div>
                <span>Career History</span>
              </div>
              <div class="legend-item">
                <div class="legend-indicator shadow"></div>
                <span>Predicted Paths</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .career-analysis-container { background: var(--color-background); min-height: 100vh; }
    .page-header { display: flex; justify-content: space-between; align-items: center; padding: 40px; background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%); border-radius: 24px; color: white; box-shadow: 0 10px 30px -10px rgba(5, 150, 105, 0.4); margin-bottom: 40px; }
    .header-content h1 { font-size: 2.25rem; font-weight: 800; margin: 0; }
    .header-icon { font-size: 5rem; opacity: 1.0; transform: rotate(15deg); }
    
    .roadmap-container { background: var(--color-surface); border-radius: 16px; padding: 32px; border: 1px solid var(--color-border); position: relative; }
    
    .trajectory-empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
      background-color: var(--color-surface-secondary);
      border-radius: 12px;
      border: 2px dashed var(--color-border);
      min-height: 350px;
    }

    .empty-icon-wrapper {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      color: var(--color-text-secondary);
      font-size: 3rem;
      opacity: 0.6;
    }

    .empty-icon-wrapper i {
      animation: pulseIcon 2s infinite ease-in-out;
    }

    .empty-icon-wrapper i:last-child {
      animation-delay: 1s;
    }

    @keyframes pulseIcon {
      0%, 100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.9;
        color: var(--color-primary);
      }
    }

    .trajectory-empty-state h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-text);
      margin: 0 0 12px 0;
    }

    .trajectory-empty-state p {
      max-width: 500px;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--color-text-secondary);
      margin: 0 0 24px 0;
    }

    .btn-primary-action {
      background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(5, 150, 105, 0.2);
    }

    .btn-primary-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(5, 150, 105, 0.3);
    }

    .btn-primary-action i {
      font-size: 1.2rem;
    }

    .roadmap-canvas { width: 100%; height: auto; cursor: crosshair; }
    
    .node { fill: white; stroke-width: 3; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .primary-node { stroke: #059669; fill: #d1fae5; }
    .education-node { stroke: #2563eb; fill: #dbeafe; }
    .shadow-node { stroke: #10b981; fill: white; opacity: 0.8; }
    .node-group { cursor: pointer; }
    .node-group:hover .node { r: 24; filter: drop-shadow(0 0 12px rgba(5, 150, 105, 0.4)); stroke-width: 5; }
    
    .node-label { font-size: 12px; font-weight: 700; pointer-events: none; }
    .education-label { fill: #1e40af; }
    .experience-label { fill: #065f46; }
    .main-path { filter: drop-shadow(0 2px 4px rgba(5, 150, 105, 0.1)); }
    
    .node-tooltip { background: var(--color-surface); border: 2px solid #059669; border-radius: 12px; padding: 16px; position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); z-index: 10; min-width: 280px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15); animation: tooltipIn 0.2s ease-out; }
    @keyframes tooltipIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
    
    .years-badge { background: #d1fae5; color: #059669; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
    .tooltip-content { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
    .prediction-hint { font-size: 11px; color: #059669; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
    
    .roadmap-legend { display: flex; gap: 24px; padding-top: 24px; border-top: 1px solid var(--color-border); margin-top: 24px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--color-text-secondary); }
    .legend-indicator { width: 12px; height: 12px; border-radius: 50%; }
    .legend-indicator.primary { background: #059669; }
    .legend-indicator.education { background: #2563eb; }
    .legend-indicator.shadow { border: 2px solid #10b981; }
    
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class InsightsComponent implements OnInit {
  prediction: CareerPrediction | null = null;
  experiences: Experience[] = [];
  education: Education[] = [];
  roadmapNodes: RoadmapNode[] = [];
  paths: RoadmapPath[] = [];
  hoveredNode: number | null = null;
  nodeTooltip: RoadmapNode | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private profileService: ProfileService,
    private careerAnalysisService: CareerAnalysisService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadExperienceData();
      this.loadCareerAnalysis();
    }
  }

  loadExperienceData() {
    this.profileService.getUserProfile().subscribe({
      next: (profile) => {
        this.experiences = profile.experiences || [];
        this.education = profile.education || [];
        this.generateRoadmap();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load user profile', err);
        this.error = 'Failed to load profile data';
        this.cdr.detectChanges();
      }
    });
  }

  generateRoadmap() {
    const nodes: RoadmapNode[] = [];
    const paths: RoadmapPath[] = [];
    const stepX = 180;
    const startX = 80;
    const centerY = 300;

    // 1. Combine and Sort History
    const historyItems: Array<{
      type: 'education' | 'experience';
      startDate: string;
      data: any;
    }> = [];

    this.education.forEach(edu => {
      historyItems.push({
        type: 'education',
        startDate: edu.startDate,
        data: edu
      });
    });

    this.experiences.forEach(exp => {
      historyItems.push({
        type: 'experience',
        startDate: exp.startDate,
        data: exp
      });
    });

    // Sort by start date ascending
    historyItems.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // 2. Generate History Path
    let historyD = '';
    historyItems.forEach((item, i) => {
      const x = startX + (i * stepX);
      const y = centerY;

      if (item.type === 'education') {
        const edu: Education = item.data;
        nodes.push({
          x, y,
          label: edu.degree,
          education: edu,
          type: 'history',
          yearsRange: this.formatYearsRange(edu.startDate, edu.endDate, edu.current)
        });
      } else {
        const exp: Experience = item.data;
        nodes.push({
          x, y,
          label: exp.jobTitle,
          experience: exp,
          type: 'history',
          yearsRange: this.formatYearsRange(exp.startDate, exp.endDate, exp.current)
        });
      }

      historyD += (i === 0 ? 'M ' : ' L ') + `${x} ${y}`;
    });

    if (historyD) paths.push({ d: historyD, type: 'history' });

    // 3. Branch Prediction from Latest Role
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      const hasPrediction = this.prediction && this.prediction.predictedRoles && this.prediction.predictedRoles.length > 0;
      const branchingOffsets = hasPrediction ? [-100, 0, 100] : [0]; // 3 predicted branches if success, 1 if fail

      branchingOffsets.forEach((offset, idx) => {
        const targetX = lastNode.x + stepX;
        const targetY = centerY + offset;

        // Add prediction paths
        paths.push({
          d: `M ${lastNode.x} ${lastNode.y} L ${targetX} ${targetY}`,
          type: 'prediction'
        });

        // Add placeholder prediction nodes
        nodes.push({
          x: targetX,
          y: targetY,
          label: hasPrediction ? (this.prediction?.predictedRoles[idx]?.role || 'Future Opportunity') : 'Predict Future Path',
          type: 'prediction',
          yearsRange: hasPrediction ? ((idx + 2) + '-5 yrs') : 'Next Step',
          prediction: hasPrediction ? (this.prediction?.predictedRoles[idx] || null) : null
        });
      });
    }

    this.roadmapNodes = nodes;
    this.paths = paths;
  }

  onNodeHover(index: number) {
    this.hoveredNode = index;
    this.nodeTooltip = this.roadmapNodes[index];
  }

  onNodeClick(node: RoadmapNode) {
    if (node.type === 'prediction' && (!this.prediction || !this.prediction.predictedRoles || this.prediction.predictedRoles.length === 0)) {
      this.error = null;
      this.loadCareerAnalysis();
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-MY', { year: 'numeric', month: 'short' });
  }

  formatYearsRange(startDate: string, endDate?: string, current?: boolean): string {
    const start = this.formatDate(startDate);
    const end = current ? 'Present' : (endDate ? this.formatDate(endDate) : 'Present');
    return `${start} - ${end}`;
  }

  loadCareerAnalysis() {
    this.isLoading = true;
    this.careerAnalysisService.analyzeCareer().subscribe({
      next: (prediction) => {
        this.prediction = prediction;
        this.generateRoadmap();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to run fresh career analysis, loading fallback list...', err);
        this.careerAnalysisService.getCareerPredictions().subscribe({
          next: (predictions) => {
            if (predictions.length > 0) {
              this.prediction = predictions[0];
              this.generateRoadmap();
            } else {
              this.error = 'Failed to run analysis, and no previous predictions exist.';
            }
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (fetchErr) => {
            console.error('Failed to load predictions fallback', fetchErr);
            this.error = 'Failed to load career analysis';
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}