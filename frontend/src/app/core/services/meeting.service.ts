import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MeetingRoutes } from '../constants/api-routes.const';

export type MeetingState = 'idle' | 'waiting' | 'connecting' | 'active' | 'ended';

export interface MeetingParticipant {
  userId: string;
  name: string;
  isHost: boolean;
  stream?: MediaStream;
}

export interface MeetingSession {
  meetingId: string;
  slotId: string;
  hostId: string;
  participants: MeetingParticipant[];
  state: MeetingState;
  startTime?: Date;
  endTime?: Date;
}

export interface MeetingValidation {
  isValid: boolean;
  canJoin: boolean;
  message: string;
  meetingId?: string;
}

@Injectable({ providedIn: 'root' })
export class MeetingService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = environment.apiUrl;

  // Meeting state
  private _currentMeeting$ = new BehaviorSubject<MeetingSession | null>(null);
  private _meetingState$ = new BehaviorSubject<MeetingState>('idle');
  private _participants$ = new BehaviorSubject<MeetingParticipant[]>([]);

  // WebRTC
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteStreams: Map<string, MediaStream> = new Map();
  private _remoteStreams$ = new BehaviorSubject<Map<string, MediaStream>>(new Map());

  // WebRTC Configuration
  private rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Observables
  currentMeeting$ = this._currentMeeting$.asObservable();
  meetingState$ = this._meetingState$.asObservable();
  participants$ = this._participants$.asObservable();
  remoteStreams$ = this._remoteStreams$.asObservable();

  /**
   * Validate if user can join a meeting for a specific slot
   */
  validateMeetingAccess(slotId: string, bookingId?: string): Observable<MeetingValidation> {
    const url = `${this._apiUrl}${MeetingRoutes.BASE}/validate`;
    return this._http.post<MeetingValidation>(url, { slotId, bookingId });
  }

  /**
   * Create a new meeting (trainer only)
   */
  createMeeting(slotId: string): Observable<{ meetingId: string }> {
    const url = `${this._apiUrl}${MeetingRoutes.BASE}/create`;
    return this._http.post<{ meetingId: string }>(url, { slotId });
  }

  /**
   * Join an existing meeting
   */
  joinMeeting(meetingId: string, slotId: string): Observable<MeetingSession> {
    const url = `${this._apiUrl}${MeetingRoutes.BASE}/join`;
    return this._http.post<MeetingSession>(url, { meetingId, slotId });
  }

  /**
   * End a meeting (host only)
   */
  endMeeting(meetingId: string): Observable<void> {
    const url = `${this._apiUrl}${MeetingRoutes.BASE}/${meetingId}/end`;
    return this._http.post<void>(url, {});
  }

  /**
   * Initialize local media stream
   */
  async initializeLocalStream(audioOnly: boolean = false): Promise<MediaStream> {
    try {
      this._meetingState$.next('connecting');

      const constraints: MediaStreamConstraints = {
        audio: true,
        video: !audioOnly ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Local stream initialized');
      return this.localStream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      this._meetingState$.next('idle');
      throw error;
    }
  }

  /**
   * Get local stream
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Update meeting state
   */
  updateMeetingState(state: MeetingState): void {
    this._meetingState$.next(state);
  }

  /**
   * Add participant
   */
  addParticipant(participant: MeetingParticipant): void {
    const current = this._participants$.value;
    this._participants$.next([...current, participant]);
  }

  /**
   * Remove participant
   */
  removeParticipant(userId: string): void {
    const current = this._participants$.value;
    this._participants$.next(current.filter(p => p.userId !== userId));

    // Clean up peer connection for removed participant
    this.closePeerConnection(userId);
  }

  /**
   * Create peer connection for a participant
   */
  async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const peerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📹 Received remote stream from:', userId);
      const [remoteStream] = event.streams;
      this.remoteStreams.set(userId, remoteStream);
      this._remoteStreams$.next(new Map(this.remoteStreams));
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', userId);
        // This will be handled by the component through socket
        this.onIceCandidate?.(userId, event.candidate);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${userId}:`, peerConnection.connectionState);
      if (peerConnection.connectionState === 'disconnected' ||
        peerConnection.connectionState === 'failed') {
        this.closePeerConnection(userId);
      }
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  /**
   * Create and send offer to participant
   */
  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.createPeerConnection(userId);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('📤 Created offer for:', userId);
    return offer;
  }

  /**
   * Handle received offer and create answer
   */
  async handleOffer(userId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    const peerConnection = await this.createPeerConnection(userId);
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log('📤 Created answer for:', userId);
    return answer;
  }

  /**
   * Handle received answer
   */
  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.setRemoteDescription(answer);
      console.log('✅ Set remote description for:', userId);
    }
  }

  /**
   * Handle received ICE candidate
   */
  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(candidate);
      console.log('🧊 Added ICE candidate from:', userId);
    }
  }

  /**
   * Close peer connection for a participant
   */
  private closePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
    }

    // Remove remote stream
    if (this.remoteStreams.has(userId)) {
      this.remoteStreams.delete(userId);
      this._remoteStreams$.next(new Map(this.remoteStreams));
    }
  }

  /**
   * Get remote stream for a participant
   */
  getRemoteStream(userId: string): MediaStream | undefined {
    return this.remoteStreams.get(userId);
  }

  /**
   * ICE candidate callback (to be set by component)
   */
  onIceCandidate?: (userId: string, candidate: RTCIceCandidate) => void;

  /**
   * Clean up meeting resources
   */
  cleanup(): void {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Clear remote streams
    this.remoteStreams.clear();
    this._remoteStreams$.next(new Map());

    // Reset state
    this._currentMeeting$.next(null);
    this._meetingState$.next('idle');
    this._participants$.next([]);

    console.log('🧹 Meeting resources cleaned up');
  }

  /**
   * Get participant count
   */
  getParticipantCount(): number {
    return this._participants$.value.length;
  }

  /**
   * Check if user is host
   */
  isHost(userId: string): boolean {
    const meeting = this._currentMeeting$.value;
    return meeting?.hostId === userId;
  }
}
