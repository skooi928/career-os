import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganisationService } from '../../../services/organisation.service';
import { StatusPillComponent } from '../../../components/status-pill/status-pill.component';
import { OrganisationMember, OrgMemberRole } from '../../../types/upskilling.types';

@Component({
  selector: 'app-org-members',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusPillComponent],
  template: `
    <div class="page">
      <div class="page-header">
        <div><h1>Team Members</h1><p>Manage who has access to your organisation</p></div>
        <button class="btn-primary" (click)="showInvite = !showInvite"><i class="ph ph-user-plus"></i> Invite Member</button>
      </div>

      <div class="invite-form card" *ngIf="showInvite">
        <h3>Invite New Member</h3>
        <form (ngSubmit)="inviteMember()" #f="ngForm">
          <div class="form-row">
            <div class="field"><label>Email <span class="req">*</span></label><input type="email" [(ngModel)]="inviteEmail" name="email" required placeholder="colleague@company.com"></div>
            <div class="field"><label>Role</label><select [(ngModel)]="inviteRole" name="role"><option value="ORG_ADMIN">Admin</option><option value="HR">HR</option><option value="MENTOR">Mentor</option><option value="REVIEWER">Reviewer</option></select></div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="showInvite = false">Cancel</button>
            <button type="submit" class="btn-primary" [disabled]="isInviting() || !f.valid">{{ isInviting() ? 'Inviting…' : 'Send Invite' }}</button>
          </div>
        </form>
      </div>

      <div class="loading-state" *ngIf="isLoading()"><div class="spinner"></div></div>

      <div class="members-table card" *ngIf="!isLoading()">
        <div class="table-header">{{ members().length }} member{{ members().length !== 1 ? 's' : '' }}</div>
        <div class="empty-table" *ngIf="members().length === 0"><i class="ph ph-users"></i><p>No members yet. Invite your team!</p></div>
        <table *ngIf="members().length > 0">
          <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let m of members()">
              <td><span class="email">{{ m.userId }}</span></td>
              <td><app-status-pill [status]="m.role" [customLabel]="roleLabel(m.role)"></app-status-pill></td>
              <td>{{ m.joinedAt | date:'mediumDate' }}</td>
              <td>
                <div class="row-actions">
                  <select class="role-select" [value]="m.role" (change)="changeRole(m, $any($event.target).value)">
                    <option value="ORG_ADMIN">Admin</option><option value="HR">HR</option><option value="MENTOR">Mentor</option><option value="REVIEWER">Reviewer</option>
                  </select>
                  <button class="act-btn remove" (click)="removeMember(m)"><i class="ph ph-user-minus"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="toast" [class.show]="toast()">{{ toast() }}</div>
    </div>
  `,
  styles: [`
    .page { padding: 32px 40px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin: 0 0 4px; }
    .page-header p { font-size: 0.9rem; color: var(--color-text-secondary); margin: 0; }
    .btn-primary { display: flex; align-items: center; gap: 6px; padding: 10px 16px; background: var(--color-primary); color: white; border: none; border-radius: 9px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }
    .btn-primary:hover:not(:disabled) { opacity: 0.9; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 10px 16px; background: var(--color-surface); border: 1px solid var(--color-border); color: var(--color-text); border-radius: 9px; font-weight: 600; font-size: 0.875rem; cursor: pointer; }
    .card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 16px; padding: 22px; margin-bottom: 22px; }
    .invite-form h3 { font-size: 0.95rem; font-weight: 700; color: var(--color-text); margin: 0 0 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .field { margin-bottom: 14px; }
    .field label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--color-text); margin-bottom: 5px; }
    .req { color: #ef4444; }
    .field input, .field select { width: 100%; padding: 9px 12px; border-radius: 9px; border: 1px solid var(--color-input-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.875rem; outline: none; box-sizing: border-box; }
    .field input:focus, .field select:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px; }
    .table-header { font-size: 0.8rem; color: var(--color-text-secondary); margin-bottom: 14px; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; font-size: 0.75rem; font-weight: 700; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; padding: 9px 10px; border-bottom: 1px solid var(--color-border); }
    tbody tr { border-bottom: 1px solid var(--color-border); }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 13px 10px; font-size: 0.875rem; color: var(--color-text); vertical-align: middle; }
    .email { font-size: 0.875rem; }
    .row-actions { display: flex; gap: 7px; align-items: center; }
    .role-select { padding: 5px 9px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-input-bg); color: var(--color-text); font-size: 0.75rem; cursor: pointer; outline: none; }
    .act-btn { padding: 5px 9px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; border: none; }
    .act-btn.remove { background: #fee2e2; color: #ef4444; }
    .empty-table { display: flex; flex-direction: column; align-items: center; padding: 36px; gap: 7px; color: var(--color-text-tertiary); }
    .empty-table i { font-size: 2.2rem; }
    .loading-state { display: flex; justify-content: center; padding: 40px; }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast { position: fixed; bottom: 24px; right: 24px; background: #1f2937; color: white; padding: 12px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 500; opacity: 0; transform: translateY(8px); transition: all 0.3s; pointer-events: none; z-index: 9999; }
    .toast.show { opacity: 1; transform: translateY(0); }
    @media (max-width: 768px) { .page { padding: 20px; } .form-row { grid-template-columns: 1fr; } }
  `]
})
export class OrgMembersComponent implements OnInit {
  isLoading = signal(true);
  members = signal<OrganisationMember[]>([]);
  isInviting = signal(false);
  toast = signal('');
  showInvite = false;
  inviteEmail = '';
  inviteRole: OrgMemberRole = 'MENTOR';
  orgId = '';

  constructor(private orgService: OrganisationService) {}

  ngOnInit() {
    this.orgService.getMyOrganisations().subscribe({
      next: orgs => { if (orgs.length > 0) { this.orgId = orgs[0].id; this.orgService.getMembers(this.orgId).subscribe({ next: m => { this.members.set(m); this.isLoading.set(false); }, error: () => this.isLoading.set(false) }); } else { this.isLoading.set(false); } },
      error: () => this.isLoading.set(false)
    });
  }

  roleLabel(r: OrgMemberRole): string { return { ORG_ADMIN: 'Admin', HR: 'HR', MENTOR: 'Mentor', REVIEWER: 'Reviewer' }[r]; }

  inviteMember() {
    if (!this.inviteEmail || !this.orgId) return;
    this.isInviting.set(true);
    this.orgService.inviteMember(this.orgId, { email: this.inviteEmail, role: this.inviteRole }).subscribe({
      next: m => { this.members.update(l => [...l, m]); this.inviteEmail = ''; this.showInvite = false; this.isInviting.set(false); this.showToast('Invitation sent!'); },
      error: () => { this.isInviting.set(false); this.showToast('Failed to invite member.'); }
    });
  }

  changeRole(m: OrganisationMember, role: OrgMemberRole) {
    this.orgService.updateMemberRole(this.orgId, m.id, role).subscribe({
      next: u => {
        this.members.update(l => l.map(x => x.id === u.id ? u : x));
        this.showToast('Role updated.');
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to update role.';
        this.showToast(msg);
      }
    });
  }

  removeMember(m: OrganisationMember) {
    if (!confirm('Remove this member?')) return;
    this.orgService.removeMember(this.orgId, m.id).subscribe({ next: () => { this.members.update(l => l.filter(x => x.id !== m.id)); this.showToast('Member removed.'); }, error: () => this.showToast('Failed to remove.') });
  }

  private showToast(msg: string) { this.toast.set(msg); setTimeout(() => this.toast.set(''), 3000); }
}
