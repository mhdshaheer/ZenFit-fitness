import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';
import { Subject, takeUntil } from 'rxjs';

interface TrainerProfile {
  id: string;
  image: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  gender: string;
  role?: string;
  dob: string;
  isVerified?: boolean;
  resume?: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
    fileUrl: string;
    isVerified: boolean;
  };
}
interface UploadFile {
  name?: string;
  size?: number;
  type?: string;
  file: File;
  uploadedAt?: Date;
  id?: string;
}
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnDestroy, OnInit {
  uploadedFile: UploadFile | null = null;
  profileImage = '';
  private readonly _route = inject(ActivatedRoute);
  private readonly _profileService = inject(ProfileService);

  private readonly _destroy$ = new Subject<void>();
  trainer: TrainerProfile | null = null;

  onImageError(event: any) {
    event.target.src =
      'https://via.placeholder.com/150x150/e5e7eb/9ca3af?text=No+Image';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatUploadTime(dateString: Date): string {
    const date = new Date(dateString);
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

  downloadFile() {
    if (this.uploadedFile?.file) {
      const url = URL.createObjectURL(this.uploadedFile.file);

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = this.uploadedFile.name || 'download.pdf';
      link.click();

      // Free up memory
      URL.revokeObjectURL(url);
    }
  }

  verifyResume() {
    if (this.uploadedFile && this.trainer) {
      this._profileService
        .verifyResume(this.trainer.id)
        .pipe(takeUntil(this._destroy$))
        .subscribe((res) => {
          this.trainer!.isVerified = res.isVerified;
          console.log('response from verify :', res);
        });
    }
  }

  editProfile() {
    console.log('Edit profile for trainer:', this.trainer?.id);
    // Navigate to edit profile page or open modal
  }

  deactivateProfile() {
    if (confirm('Are you sure you want to deactivate this trainer profile?')) {
      console.log('Deactivate profile for trainer:', this.trainer?.id);
      // Make API call to deactivate profile
    }
  }

  ngOnInit() {
    this._route.paramMap.pipe(takeUntil(this._destroy$)).subscribe((params) => {
      const id = params.get('id');
      this.loadProfile(id!);
      console.log('id on ngONInit profile side :', id);
    });
  }

  loadProfile(id: string) {
    this._profileService
      .getProfile(id)
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        console.log('profile details:', res);
        if (res.profileImage) {
          this._profileService
            .getFile(res.profileImage, id)
            .subscribe((fileRes) => {
              this.profileImage = fileRes.url;
              console.log('profileimage :', fileRes.url);
            });
        }
        if (res.resume) {
          this._profileService
            .getFile(res.resume, id)
            .pipe(takeUntil(this._destroy$))
            .subscribe(async (fileRes) => {
              const fileDetails = JSON.parse(fileRes.url);
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
        this.trainer = {
          id: res.id,
          name: res.fullName || res.username,
          image: this.profileImage,
          email: res.email,
          dob: res.dob,
          gender: res.gender,
          languages: [],
          role: res.role,
          phone: res.phone,
          isVerified: res.resumeVerified,
        };
        console.log('pdf :', this.uploadedFile);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
