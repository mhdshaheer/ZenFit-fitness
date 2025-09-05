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
  imports: [CommonModule, ReactiveFormsModule],
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

    this.profileService.uploadProfileImage(file, 'user', 'profile').subscribe({
      next: (res) => {
        this.profileImageUrl = res.key;
        this.isUploading = false;
        this.profileImageUrl = res.url;
        console.log('Image url from : ', this.profileImageUrl);
        // this.profileService.getFile(res.key).subscribe((fileRes) => {
        //   console.log('url from the backend :', fileRes.url);
        //   this.profileImageUrl = fileRes.url;
        // });
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
}
