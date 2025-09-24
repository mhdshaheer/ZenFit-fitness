import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { optionalPhoneValidator } from '../../../../shared/validators/phone.validator';
import { CustomValidators } from '../../../../shared/validators/custom.validator';
import { getErrorMessages } from '../../../../shared/utils.ts/form-error.util';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { ToastService } from '../../../../core/services/toast.service';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';
import { Subject, takeUntil } from 'rxjs';

interface UploadFile {
  name?: string;
  size?: number;
  type?: string;
  file: File;
  uploadedAt?: Date;
  id?: string;
}

interface ProfileUser {
  fullName: string;
  username: string;
  dob: string;
  gender: 'male' | 'female' | null;
  email: string;
  phone: string;
  role: string;
}
type TabKey = 'personal' | 'security' | 'upload';
interface Tab {
  key: TabKey;
  label: string;
  icon: string;
}
@Component({
  selector: 'app-trainer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.css',
})
export class TrainerProfileComponent implements OnInit, OnDestroy {
  profileImageUrl: string | null = null;
  defaultImage = 'landing_page/user.png';
  isUploading = false;
  profileService = inject(ProfileService);
  toastService = inject(ToastService);
  isEditMode = false;

  private destroy$ = new Subject<void>();

  // ========= CV UPLOAD ========
  uploadedFile: UploadFile | null = null;
  resumeVerified!: boolean;
  errorMessage: string = '';
  isDragging = false;
  isCvUploading = false;
  uploadProgress = 0;
  selectedFileName = '';
  maxFileSize = 5 * 1024 * 1024;
  resumeKey!: string;
  isDeleting = false;
  // ========= *CV UPLOAD ========

  // ==============
  profileForm!: FormGroup;
  profileData!: ProfileUser;
  private fb = inject(FormBuilder);
  // ==============

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];
    this.isUploading = true;

    this.profileService
      .uploadfile(file, 'profile')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // this.progress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.profileImageUrl = event.body?.url ?? null;
            this.isUploading = false;
            console.log('Profile image uploaded, key:', event.body?.url);
            // this.progress = 0; // reset after upload
          }
        },
        error: () => {
          alert('Image upload failed');
          this.isUploading = false;
          // this.progress = 0;
        },
      });
  }

  get displayImage(): string {
    return this.profileImageUrl || this.defaultImage;
  }

  // ========= Personal details =========
  editToggle() {
    this.isEditMode = !this.isEditMode;
  }

  ngOnInit() {
    this.loadProfile();
    this.initializePasswordForm();
  }
  loadProfile() {
    this.profileService
      .getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        console.log('Response of profile: ', res);
        this.profileData = res;

        if (res.profileImage) {
          this.profileService
            .getFile(res.profileImage)
            .pipe(takeUntil(this.destroy$))
            .subscribe((fileRes) => {
              this.profileImageUrl = fileRes.url;
            });
        }
        if (res.resume) {
          this.resumeKey = res.resume;
          this.profileService
            .getFile(res.resume)
            .pipe(takeUntil(this.destroy$))
            .subscribe(async (fileRes) => {
              let fileDetails = JSON.parse(fileRes.url);
              const response = await fetch(fileDetails.url);
              const blob = await response.blob();
              const file = new File([blob], fileDetails.name || 'resume.pdf', {
                type: fileDetails.type,
              });

              this.uploadedFile = {
                name: file.name,
                size: file.size,
                type: file.type,
                file,
                uploadedAt: new Date(fileDetails.uploadedAt),
              };
            });
        }
        this.resumeVerified = res.resumeVerified;

        this.profileForm = this.fb.group({
          fullName: [res.fullName],
          username: [res.username, Validators.required],
          dob: [res.dob ? res.dob.split('T')[0] : ''],
          gender: [res.gender],
          email: [res.email, [CustomValidators.email()]],
          phone: [res.phone, optionalPhoneValidator],
          role: [res.role, Validators.required],
        });
      });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('profile data:', this.profileForm.value);
      this.profileService
        .updateProfile(this.profileForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log('response from the backend :', res);
            this.profileData = res;
            this.isEditMode = false;
          },
          error: (err) => {
            console.log('Failed to saved profile ', err);
          },
        });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
  getError(field: string): string {
    return getErrorMessages(this.profileForm, field);
  }

  // ============= CV UPLOAD ====================

  // Drag and drop event handlers
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    this.errorMessage = '';

    if (this.validateFile(file)) {
      this.uploadFile(file);
    }
  }
  private validateFile(file: File): boolean {
    // Check file type
    if (file.type !== 'application/pdf') {
      this.errorMessage = 'Only PDF files are allowed for CV upload';
      return false;
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      this.errorMessage = 'File size exceeds 5MB limit';
      return false;
    }

    return true;
  }

  // Upload file with progress tracking
  private uploadFile(file: File): void {
    this.isCvUploading = true;
    this.uploadProgress = 0;
    this.selectedFileName = file.name;

    this.simulateUpload(file);

    this.profileService
      .uploadfile(file, 'resume')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event instanceof HttpResponse) {
            this.uploadedFile = {
              name: file.name,
              size: file.size,
              type: file.type,
              file: file,
              uploadedAt: new Date(),
              id: event.body?.key, // store S3 key or Mongo _id if returned
            };
            this.isCvUploading = false;
            this.uploadProgress = 0;
            console.log('Resume uploaded:', this.uploadedFile);
          }
        },
        error: () => {
          this.errorMessage = 'PDF upload failed';
          this.isCvUploading = false;
          this.uploadProgress = 0;
        },
      });
  }
  private simulateUpload(file: File): void {
    const uploadInterval = setInterval(() => {
      this.uploadProgress += Math.random() * 20 + 5; // Progress between 5-25%

      if (this.uploadProgress >= 100) {
        this.uploadProgress = 100;
        clearInterval(uploadInterval);

        // Create uploaded file object
        this.uploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          file: file,
          uploadedAt: new Date(),
          id: this.generateFileId(),
        };

        this.isUploading = false;
        this.uploadProgress = 0;
        this.selectedFileName = '';
      }
    }, 300);
  }
  private generateFileId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
  onCvFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.processFile(file);
    }
    event.target.value = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatUploadTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;

    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  }

  previewFile(): void {
    if (this.uploadedFile) {
      const url = URL.createObjectURL(this.uploadedFile.file);
      const newWindow = window.open(url, '_blank');

      if (newWindow) {
        newWindow.onunload = () => URL.revokeObjectURL(url);
      }
    }
  }

  resetUploadedFile() {
    this.uploadedFile = null;
  }

  deleteFile() {
    if (this.uploadedFile) {
      this.isDeleting = true;
      console.log('Uploaded file is : ', this.uploadedFile);
      this.profileService
        .deleteS3File(this.resumeKey, 'resume')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log('resume is deleted :', res);
            this.toastService.success('Resume deleted Successfully');
            this.resumeKey = '';
            this.resetUploadedFile();
            this.isDeleting = false;
          },
          error: (err) => {
            console.log('Failed to delete resume :', err);
            this.toastService.error('Failed to delete resume');
            this.isDeleting = false;
          },
        });
    }
  }
  // ============= *CV UPLOAD ====================

  activeTab: TabKey = 'personal';
  passwordForm!: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  mobileMenuOpen = false;

  tabs: Tab[] = [
    {
      key: 'personal',
      label: 'Personal Information',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    },
    {
      key: 'security',
      label: 'Security',
      icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    },
    {
      key: 'upload',
      label: 'Upload Document',
      icon: 'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5',
    },
  ];

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      let passwords = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
      };
      console.log('submitted data :', passwords);
      this.profileService
        .changePassword(passwords)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res) => {
            console.log(res);
            this.toastService.success('Password changed successfully');
            this.resetPasswordForm();
            this.activeTab = 'personal';
          },
          error: (err) => {
            console.log(err);
            this.toastService.error('Failed to change password');
          },
        });
    }
  }
  initializePasswordForm() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
  setActiveTab(tabKey: TabKey) {
    this.activeTab = tabKey;
  }
  get f() {
    return this.passwordForm.controls;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
