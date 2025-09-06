import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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

interface UploadFile {
  name: string;
  size: number;
  type: string;
  file: File;
  uploadedAt: Date;
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

@Component({
  selector: 'app-trainer-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './trainer-profile.component.html',
  styleUrl: './trainer-profile.component.css',
})
export class TrainerProfileComponent implements OnInit {
  profileImageUrl: string | null = null;
  defaultImage = 'landing_page/user.png';
  isUploading = false;
  profileService = inject(ProfileService);
  isEditMode = false;

  // ========= CV UPLOAD ========
  uploadedFile: UploadFile | null = null;
  errorMessage: string = '';
  isDragging = false;
  isCvUploading = false;
  uploadProgress = 0;
  selectedFileName = '';
  maxFileSize = 5 * 1024 * 1024;
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

    // this.profileService.uploadfile(file, 'profile').subscribe({
    //   next: (res) => {
    //     this.profileImageUrl = res.key;
    //     this.isUploading = false;
    //     this.profileImageUrl = res.url;
    //   },
    //   error: () => {
    //     alert('Image upload failed');
    //     this.isUploading = false;
    //   },
    // });
    this.profileService.uploadfile(file, 'profile').subscribe({
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
  }
  loadProfile() {
    this.profileService.getProfile().subscribe((res) => {
      console.log('Response of profile: ', res);
      this.profileData = res;

      if (res.profileImage) {
        this.profileService.getFile(res.profileImage).subscribe((fileRes) => {
          this.profileImageUrl = fileRes.url;
        });
      }

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
        .subscribe((res) => {
          console.log('response from the backend :', res);
          this.profileData = res;
          console.log('Profile data :', this.profileData);
          this.isEditMode = false;
        });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
  getError(field: string): string {
    return getErrorMessages(this.profileForm, field);
  }

  // ============= CV UPLOAD ====================

  clearFile(): void {
    console.log('Clear button clicked..');
    // Optional: Call API to delete file from server
    if (this.uploadedFile?.id) {
      // this.deleteFileFromServer(this.uploadedFile.id);
    }

    this.uploadedFile = null;
    this.errorMessage = '';
  }

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

    // Check file name (optional - you can add CV-specific validation)
    // const fileName = file.name.toLowerCase();
    // if (!fileName.includes('cv') && !fileName.includes('resume')) {
    //   // Optional warning - you can remove this if not needed
    //   console.warn('File name doesn\'t contain "cv" or "resume"');
    // }

    return true;
  }

  // Upload file with progress tracking
  private uploadFile(file: File): void {
    this.isCvUploading = true;
    this.uploadProgress = 0;
    this.selectedFileName = file.name;

    // Option 1: Simulated upload (for demo purposes)
    this.simulateUpload(file);

    // Option 2: Real HTTP upload (uncomment for actual implementation)
    // this.performHttpUpload(file);
    this.profileService.uploadfile(file, 'resume').subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round((100 * event.loaded) / event.total);
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
    // Reset input value
    event.target.value = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  replaceFile(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
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
  // ============= *CV UPLOAD ====================
}
