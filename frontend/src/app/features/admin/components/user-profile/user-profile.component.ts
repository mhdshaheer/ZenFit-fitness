import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../../core/services/profile.service';

interface TrainerProfile {
  id: string;
  image: string;
  name: string;
  email: string;
  phone: string;
  languages: string[];
  gender: string;
  dob: string;
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
export class UserProfileComponent {
  uploadedFile: UploadFile | null = null;
  profileImage: string = '';
  private route = inject(ActivatedRoute);
  private profileService = inject(ProfileService);
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

  // verifyResume() {
  //   if (this.trainer.resume) {
  //     this.trainer.resume.isVerified = true;
  //     // Here you would typically make an API call to update the verification status
  //     console.log('Resume verified for trainer:', this.trainer.id);
  //   }
  // }

  // unverifyResume() {
  //   if (this.trainer.resume) {
  //     this.trainer.resume.isVerified = false;
  //     // Here you would typically make an API call to update the verification status
  //     console.log('Resume unverified for trainer:', this.trainer.id);
  //   }
  // }

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
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.loadProfile(id!);
      console.log('id on ngONInit profile side :', id);
    });
  }

  loadProfile(id: string) {
    this.profileService.getProfile(id).subscribe((res) => {
      console.log('profile details:', res);
      if (res.profileImage) {
        this.profileService
          .getFile(res.profileImage, id)
          .subscribe((fileRes) => {
            this.profileImage = fileRes.url;
            console.log('profileimage :', fileRes.url);
          });
      }
      if (res.resume) {
        this.profileService
          .getFile(res.resume, id)
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
      this.trainer = {
        id: res.id,
        name: res.fullName || res.username,
        image: this.profileImage,
        email: res.email,
        dob: res.dob,
        gender: res.gender,
        languages: [],
        phone: res.phone,
      };
      console.log('pdf :', this.uploadedFile);
    });
  }
}
