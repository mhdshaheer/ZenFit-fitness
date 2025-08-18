import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
  profileImageUrl: string | null = null;
  defaultImage = 'landing_page/user.png';
  isUploading = false;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.isUploading = true;

    // this.http.post<{ url: string }>('/api/profile/upload-profile', formData)
    //   .subscribe({
    //     next: (res) => {
    //       this.profileImageUrl = res.url; // save the S3 URL
    //       this.isUploading = false;
    //     },
    //     error: () => {
    //       alert('Image upload failed');
    //       this.isUploading = false;
    //     }
    //   });
  }
  get displayImage(): string {
    return this.profileImageUrl || this.defaultImage;
  }
}
