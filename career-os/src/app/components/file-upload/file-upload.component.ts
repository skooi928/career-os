import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-zone"
         [class.drag-over]="isDragOver"
         (dragover)="$event.preventDefault(); isDragOver = true"
         (dragleave)="isDragOver = false"
         (drop)="onDrop($event)"
         (click)="fileInput.click()">
      <input #fileInput type="file" [accept]="accept" (change)="onFileChange($event)" hidden>

      <div class="upload-content" *ngIf="!selectedFile">
        <i class="ph ph-upload-simple"></i>
        <span class="label">{{ label }}</span>
        <span class="hint">{{ hint }}</span>
      </div>

      <div class="file-preview" *ngIf="selectedFile" (click)="$event.stopPropagation()">
        <i class="ph ph-file"></i>
        <div class="file-info">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
        </div>
        <button class="remove-btn" (click)="removeFile()"><i class="ph ph-x"></i></button>
      </div>
    </div>
  `,
  styles: [`
    .upload-zone {
      border: 2px dashed var(--color-input-border);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--color-input-bg);
    }
    .upload-zone:hover, .drag-over {
      border-color: var(--color-primary);
      background: var(--color-secondary);
    }
    .upload-content { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .upload-content i { font-size: 1.8rem; color: var(--color-text-tertiary); }
    .label { font-size: 0.85rem; font-weight: 600; color: var(--color-text); }
    .hint { font-size: 0.75rem; color: var(--color-text-tertiary); }
    .file-preview {
      display: flex; align-items: center; gap: 10px;
      background: var(--color-surface); border-radius: 8px; padding: 10px 12px;
    }
    .file-preview > i { font-size: 1.4rem; color: var(--color-primary); }
    .file-info { display: flex; flex-direction: column; flex: 1; text-align: left; }
    .file-name { font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
    .file-size { font-size: 0.72rem; color: var(--color-text-tertiary); }
    .remove-btn {
      background: none; border: none; cursor: pointer;
      color: var(--color-text-tertiary); font-size: 1rem; padding: 2px;
    }
    .remove-btn:hover { color: #ef4444; }
  `]
})
export class FileUploadComponent {
  @Input() label = 'Click or drag file to upload';
  @Input() hint = 'PDF, PNG, JPG up to 10MB';
  @Input() accept = '*';
  @Output() fileSelected = new EventEmitter<File | null>();

  selectedFile: File | null = null;
  isDragOver = false;

  onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0] ?? null;
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragOver = false;
    const file = e.dataTransfer?.files?.[0] ?? null;
    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.fileSelected.emit(null);
  }
}
