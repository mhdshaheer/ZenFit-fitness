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
import { HttpEventType } from '@angular/common/http';
import { passwordStrengthValidator } from '../../../../shared/validators/password.validator';
import { ToastService } from '../../../../core/services/toast.service';
import { Subject, takeUntil } from 'rxjs';

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
export class UserProfileComponent implements OnInit, OnDestroy {
  profileImageUrl: string | null = null;
  defaultImage = 'landing_page/user.png';
  isUploading = false;
  profileService = inject(ProfileService);
  toastService = inject(ToastService);
  isEditMode = false;

  private _destroy$ = new Subject<void>();

  // ==============
  profileForm!: FormGroup;
  profileData!: ProfileUser;
  private _fb = inject(FormBuilder);
  // ==============

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file: File = input.files[0];
    this.isUploading = true;
    this.profileService
      .uploadfile(file, 'profile')
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // this.progress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            this.profileImageUrl = event.body?.url ?? null;
            this.isUploading = false;
            console.log('Profile image uploaded, key:', event.body?.key);
            this.toastService.success('Profile image is updated successfully');
            // this.progress = 0; // reset after upload
          }
        },
        error: () => {
          this.toastService.error('Image upload failed');
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
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        console.log('Response of profile: ', res);
        this.profileData = res;

        if (res.profileImage) {
          this.profileService
            .getFile(res.profileImage)
            .pipe(takeUntil(this._destroy$))
            .subscribe((fileRes) => {
              this.profileImageUrl = fileRes.url;
            });
        }

        this.profileForm = this._fb.group({
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

  get f() {
    return this.passwordForm.controls;
  }

  saveProfile() {
    if (this.profileForm.valid) {
      console.log('profile data:', this.profileForm.value);
      this.profileService
        .updateProfile(this.profileForm.value)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (res) => {
            console.log('response from the backend :', res);
            this.toastService.success('Profile data is updated Successfully');
            this.profileData = res;
            this.isEditMode = false;
          },
          error: (err) => {
            console.error('Error updating profile:', err);
            this.toastService.error(
              'Failed to update profile. Please try again later.'
            );
          },
          complete: () => {
            console.log('Profile update request completed.');
          },
        });
    } else {
      this.profileForm.markAllAsTouched();
    }
  }
  getError(field: string): string {
    return getErrorMessages(this.profileForm, field);
  }

  // New
  activeTab: 'personal' | 'security' = 'personal';
  passwordForm!: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  mobileMenuOpen = false;

  onPasswordSubmit(): void {
    if (this.passwordForm.valid) {
      const passwords = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
      };
      console.log('submitted data :', passwords);
      this.profileService
        .changePassword(passwords)
        .pipe(takeUntil(this._destroy$))
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
    this.passwordForm = this._fb.group({
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

  setActiveTab(tab: 'personal' | 'security'): void {
    this.activeTab = tab;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
