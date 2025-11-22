import { Component, OnInit, OnDestroy, inject, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MeetingService, MeetingState } from '../../../core/services/meeting.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { ProfileService } from '../../../core/services/profile.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'zenfit-meeting-room',
  standalone: true,
  imports: [CommonModule, ConfirmationDialogComponent],
  templateUrl: './meeting-room.component.html',
  styleUrl: './meeting-room.component.css'
})
export class MeetingRoomComponent implements OnInit, OnDestroy {
  private readonly _meetingService = inject(MeetingService);
  private readonly _socketService = inject(SocketService);
  private readonly _toastService = inject(ToastService);
  private readonly _profileService = inject(ProfileService);
  private readonly _destroy$ = new Subject<void>();

  @Input() meetingId!: string;
  @Input() slotId!: string;
  @Input() isHost = false;
  @Input() sessionTitle = 'Training Session';
  @Output() meetingClose = new EventEmitter<void>();

  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;

  meetingState: MeetingState = 'idle';
  participantCount = 0;
  isVideoEnabled = true;
  isAudioEnabled = true;
  errorMessage = '';
  isInitializing = false;
  remoteStreams: Map<string, MediaStream> = new Map();
  currentUserId = ''; // Will be set during initialization
  currentUserName = 'Guest'; // Will be fetched from database
  participantIds: Set<string> = new Set();
  participantNames: Map<string, string> = new Map(); // Map userId to name

  // Confirmation dialog properties
  showLeaveConfirmation = false;
  showEndConfirmation = false;

  ngOnInit(): void {
    this.loadCurrentUserName();
    this.subscribeToMeetingState();
    this.setupMeetingSocketListeners();
    this.setupWebRTCSignaling();
  }

  ngOnDestroy(): void {
    // Perform cleanup without confirmation dialog since this is automatic
    if (this.currentUserId && this.meetingId) {
      try {
        // Emit leave event to notify other participants
        this._socketService.emit('meeting:leave', {
          meetingId: this.meetingId,
          userId: this.currentUserId
        });
      } catch (error) {
        console.error('❌ Error emitting leave event on destroy:', error);
      }
    }

    // Clean up resources
    this._meetingService.cleanup();

    // Complete observables
    this._destroy$.next();
    this._destroy$.complete();
  }

  private loadCurrentUserName(): void {
    this._profileService.getProfile()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (profile) => {
          this.currentUserName = profile?.fullName || 'Guest';
          // Initialize meeting after getting user name
          this.initializeMeeting();
        },
        error: (error) => {
          console.error('❌ Error loading user profile:', error);
          this.currentUserName = 'Guest';
          // Initialize meeting even if profile loading fails
          this.initializeMeeting();
        }
      });
  }

  private fetchParticipantName(userId: string): void {
    // Extract the actual user ID from the generated userId (remove prefix and timestamp)
    // For now, we'll use the name sent via socket, but this could be enhanced
    // to fetch from database if we had the actual user ID
  }

  private subscribeToMeetingState(): void {
    this._meetingService.meetingState$
      .pipe(takeUntil(this._destroy$))
      .subscribe(state => {
        this.meetingState = state;
      });

    this._meetingService.participants$
      .pipe(takeUntil(this._destroy$))
      .subscribe(participants => {
        this.participantCount = participants.length;
      });

    // Subscribe to remote streams
    this._meetingService.remoteStreams$
      .pipe(takeUntil(this._destroy$))
      .subscribe(streams => {
        this.remoteStreams = streams;
      });
  }

  private setupMeetingSocketListeners(): void {
    // Listen for new participants joining
    this._socketService.on('meeting:participant-joined').pipe(
      takeUntil(this._destroy$)
    ).subscribe(async (data: { userId: string; name?: string }) => {
      // Add to participant tracking
      this.participantIds.add(data.userId);

      // Store participant name
      this.participantNames.set(data.userId, data.name || 'Guest');

      this._meetingService.addParticipant({
        userId: data.userId,
        name: data.name || 'Guest',
        isHost: false
      });

      // Show toast notification for new participant
      if (data.userId !== this.currentUserId) {
        this._toastService.info(`${data.name || 'A participant'} joined the meeting`);
      }

      // If this is not our own join event, initiate WebRTC connection
      if (data.userId !== this.currentUserId) {
        try {
          const offer = await this._meetingService.createOffer(data.userId);
          this._socketService.emit('webrtc:offer', {
            meetingId: this.meetingId,
            targetUserId: data.userId,
            fromUserId: this.currentUserId,
            offer
          });
        } catch (error) {
          console.error('❌ Error creating offer for new participant:', error);
        }
      }
    });

    // Listen for participants leaving
    this._socketService.on('meeting:participant-left').pipe(
      takeUntil(this._destroy$)
    ).subscribe((data: { userId: string }) => {
      this.participantIds.delete(data.userId);
      this.participantNames.delete(data.userId); // Remove name mapping
      this._meetingService.removeParticipant(data.userId);
      this._toastService.info('A participant left the meeting');
    });

    // Listen for participant count updates
    this._socketService.on('meeting:participant-count').pipe(
      takeUntil(this._destroy$)
    ).subscribe((data: { count: number }) => {
      this.participantCount = data.count;
    });

    // Listen for meeting ended
    this._socketService.on('meeting:ended').pipe(
      takeUntil(this._destroy$)
    ).subscribe(() => {
      this._meetingService.updateMeetingState('ended');
      // Close immediately when meeting is ended by host
      this.closeMeeting();
    });
  }

  private setupWebRTCSignaling(): void {
    // Set up ICE candidate callback
    this._meetingService.onIceCandidate = (userId: string, candidate: RTCIceCandidate) => {
      this._socketService.emit('webrtc:ice-candidate', {
        meetingId: this.meetingId,
        targetUserId: userId,
        fromUserId: this.currentUserId,
        candidate: candidate.toJSON()
      });
    };

    // Listen for WebRTC offer
    this._socketService.on('webrtc:offer').pipe(
      takeUntil(this._destroy$)
    ).subscribe(async (data: { fromUserId: string; offer: RTCSessionDescriptionInit }) => {
      try {
        const answer = await this._meetingService.handleOffer(data.fromUserId, data.offer);
        this._socketService.emit('webrtc:answer', {
          meetingId: this.meetingId,
          targetUserId: data.fromUserId,
          fromUserId: this.currentUserId,
          answer
        });
      } catch (error) {
        console.error('❌ Error handling offer:', error);
      }
    });

    // Listen for WebRTC answer
    this._socketService.on('webrtc:answer').pipe(
      takeUntil(this._destroy$)
    ).subscribe(async (data: { fromUserId: string; answer: RTCSessionDescriptionInit }) => {
      try {
        await this._meetingService.handleAnswer(data.fromUserId, data.answer);
      } catch (error) {
        console.error('❌ Error handling answer:', error);
      }
    });

    // Listen for ICE candidates
    this._socketService.on('webrtc:ice-candidate').pipe(
      takeUntil(this._destroy$)
    ).subscribe(async (data: { fromUserId: string; candidate: RTCIceCandidateInit }) => {
      try {
        await this._meetingService.handleIceCandidate(data.fromUserId, data.candidate);
      } catch (error) {
        console.error('❌ Error handling ICE candidate:', error);
      }
    });
  }

  private async initializeMeeting(): Promise<void> {
    try {
      this.isInitializing = true;
      this._meetingService.updateMeetingState('waiting');

      // Set current user ID (generate unique ID for this session)
      this.currentUserId = this.isHost ? 'host-' + Date.now() : 'user-' + Date.now();

      // Store current user's name
      this.participantNames.set(this.currentUserId, this.currentUserName);

      // Initialize local stream
      const stream = await this._meetingService.initializeLocalStream();

      // Attach to video element
      setTimeout(() => {
        if (this.localVideo?.nativeElement) {
          this.localVideo.nativeElement.srcObject = stream;
        }
      }, 100);

      // Join the meeting room via Socket.IO
      this._socketService.emit('meeting:join', {
        meetingId: this.meetingId,
        slotId: this.slotId,
        isHost: this.isHost,
        userId: this.currentUserId,
        name: this.currentUserName
      });

      this._meetingService.updateMeetingState('active');
      this.isInitializing = false;
    } catch (error: unknown) {
      console.error('❌ Failed to initialize meeting:', error);
      this.errorMessage = 'Failed to access camera/microphone. Please check permissions.';
      this._meetingService.updateMeetingState('ended');
      this.isInitializing = false;
    }
  }

  toggleVideo(): void {
    this.isVideoEnabled = !this.isVideoEnabled;
    this._meetingService.toggleVideo(this.isVideoEnabled);
  }

  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
    this._meetingService.toggleAudio(this.isAudioEnabled);
  }

  async endMeeting(): Promise<void> {
    if (this.isHost) {
      // Show confirmation dialog for ending meeting
      this.showEndConfirmation = true;
    } else {
      this.leaveMeeting();
    }
  }

  onEndConfirmed(): void {
    this.showEndConfirmation = false;
    this.performEndMeeting();
  }

  onEndCancelled(): void {
    this.showEndConfirmation = false;
  }

  private async performEndMeeting(): Promise<void> {
    try {
      await this._meetingService.endMeeting(this.meetingId).toPromise();

      // Emit socket event to notify all participants
      this._socketService.emit('meeting:end', {
        meetingId: this.meetingId
      });

      // Clean up and close immediately
      this._meetingService.cleanup();
      this.closeMeeting();
    } catch (error) {
      console.error('Error ending meeting:', error);
      // Even if API call fails, still close the meeting
      this.closeMeeting();
    }
  }

  leaveMeeting(): void {
    // Show confirmation dialog
    this.showLeaveConfirmation = true;
  }

  onLeaveConfirmed(): void {
    this.showLeaveConfirmation = false;
    this.performLeaveMeeting();
  }

  onLeaveCancelled(): void {
    this.showLeaveConfirmation = false;
  }

  private performLeaveMeeting(): void {
    try {
      // Emit leave event to notify other participants
      this._socketService.emit('meeting:leave', {
        meetingId: this.meetingId,
        userId: this.currentUserId
      });

      // Clean up WebRTC connections and streams
      this._meetingService.cleanup();

      // Clear local participant tracking
      this.participantIds.clear();
      this.participantNames.clear();
      this.remoteStreams.clear();
    } catch (error) {
      console.error('❌ Error leaving meeting:', error);
    } finally {
      // Always close the meeting component
      this.closeMeeting();
    }
  }

  closeMeeting(): void {
    try {
      // Clean up the meeting first
      this._meetingService.cleanup();

      // Clear local tracking
      this.participantIds.clear();
      this.participantNames.clear();
      this.remoteStreams.clear();
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }

    // Emit the close event to parent component (this will navigate back)
    this.meetingClose.emit();
  }

  getParticipantName(userId: string): string {
    const name = this.participantNames.get(userId);
    if (name && name !== 'Guest') {
      return name;
    }
    // Fallback to role-based names if no real name available
    if (userId.startsWith('host-')) {
      return 'Trainer';
    } else if (userId.startsWith('user-')) {
      return 'Participant';
    }
    return 'Guest';
  }

  getStateMessage(): string {
    switch (this.meetingState) {
      case 'waiting':
        return 'Initializing meeting...';
      case 'connecting':
        return 'Connecting to meeting...';
      case 'active':
        return 'Meeting in progress';
      case 'ended':
        return 'Meeting has ended';
      default:
        return 'Preparing meeting...';
    }
  }

  getStateIcon(): string {
    switch (this.meetingState) {
      case 'waiting':
      case 'connecting':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'active':
        return 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z';
      case 'ended':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z';
    }
  }
}
