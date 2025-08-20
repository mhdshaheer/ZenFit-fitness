import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProfileService } from '../../../../core/services/profile.service';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  profileImageUrl: string | null = null;
  defaultImage = 'landing_page/user.png';
  isUploading = false;
  profileService = inject(ProfileService);
  isEditMode = false;

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
      .uploadProfileImage(file, 'user', 'profile', '1234')
      .subscribe({
        next: (res) => {
          this.profileImageUrl = res.key;
          console.log('Response:', res);
          this.isUploading = false;
          this.profileService.getFile(res.key).subscribe((fileRes) => {
            console.log('url from the backend :', fileRes.url);
            this.profileImageUrl = fileRes.url;
          });
        },
        error: () => {
          alert('Image upload failed');
          this.isUploading = false;
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
      console.log(res);
      this.profileData = res;
      this.profileForm = this.fb.group({
        fullName: [res.fullName],
        username: [res.username],
        dob: [res.dob],
        gender: [res.gender],
        email: [res.email],
        phone: [res.phone],
        role: [res.role],
      });
    });
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.profileService
        .updateProfile(this.profileForm.value)
        .subscribe((res) => {
          this.profileData = res;
          this.isEditMode = false;
        });
    }
  }
}
