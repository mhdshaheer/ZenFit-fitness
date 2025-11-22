import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { env } from "../../config/env.config";
import { container } from "../../inversify.config";
import { TYPES } from "../types/inversify.types";
import { IChatService } from "../../services/interface/chat.service.interface";

let io: Server;

export const initializeSocket = (server: HttpServer): Server => {
  io = new Server(server, {
    cors: {
      origin: env.frontend_url,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", ({ id, type }: { id: string; type: string }) => {
      const room = `${type}-${id}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on("chat:joinThread", async (data: { threadId: string; userId: string; role: "user" | "trainer" }) => {
      try {
        console.log('🔗 Socket joining thread:', data);
        const chatService = container.get<IChatService>(TYPES.ChatService);
        const ok = await chatService.canAccessThread(data.threadId, data.userId, data.role);
        if (!ok) {
          console.log('❌ Access denied to thread:', data.threadId);
          return;
        }
        socket.join(`thread-${data.threadId}`);
        console.log('✅ Socket joined thread room:', `thread-${data.threadId}`, 'Socket ID:', socket.id);
      } catch (e) {
        console.error("joinThread error", e);
      }
    });

    socket.on(
      "chat:sendMessage",
      async (data: { threadId: string; senderId: string; senderType: "user" | "trainer"; content: string }) => {
        try {
          const chatService = container.get<IChatService>(TYPES.ChatService);
          const message = await chatService.sendMessage(
            data.threadId,
            data.senderId,
            data.senderType,
            data.content
          );
          io.to(`thread-${data.threadId}`).emit("chat:newMessage", message);
          const participants = await chatService.getThreadParticipants(data.threadId);
          if (participants.userId)
            io.to(`user-${participants.userId}`).emit("chat:delivered", { threadId: data.threadId });
          if (participants.trainerId)
            io
              .to(`trainer-${participants.trainerId}`)
              .emit("chat:delivered", { threadId: data.threadId });
        } catch (e) {
          console.error("sendMessage error", e);
        }
      }
    );

    socket.on("chat:typing", (data: { threadId: string; senderType: "user" | "trainer" }) => {
      io.to(`thread-${data.threadId}`).emit("chat:typing", data);
    });

    socket.on(
      "chat:read",
      async (data: { threadId: string; readerId: string; readerType: "user" | "trainer" }) => {
        try {
          const chatService = container.get<IChatService>(TYPES.ChatService);
          await chatService.markThreadRead(data.threadId, data.readerType);
          io.to(`thread-${data.threadId}`).emit("chat:read", data);
        } catch (e) {
          console.error("read error", e);
        }
      }
    );

    // Meeting socket events
    socket.on("meeting:join", (data: { meetingId: string; slotId: string; isHost: boolean; userId?: string; name?: string }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        socket.join(meetingRoom);
        console.log(`👤 User joined meeting room: ${meetingRoom}, Socket: ${socket.id}`);

        // Notify other participants
        socket.to(meetingRoom).emit("meeting:participant-joined", {
          userId: data.userId || socket.id,
          name: data.name || 'Guest',
          isHost: data.isHost,
          socketId: socket.id
        });

        // Send current participants to the new joiner
        io.in(meetingRoom).allSockets().then((sockets) => {
          const participantCount = sockets.size;
          socket.emit("meeting:participant-count", { count: participantCount });
          console.log(`📊 Meeting ${data.meetingId} now has ${participantCount} participants`);
        });
      } catch (e) {
        console.error("meeting:join error", e);
      }
    });

    socket.on("meeting:leave", (data: { meetingId: string; userId?: string }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        socket.leave(meetingRoom);
        console.log(`👋 User left meeting room: ${meetingRoom}, User ID: ${data.userId || socket.id}`);

        // Notify other participants
        socket.to(meetingRoom).emit("meeting:participant-left", {
          userId: data.userId || socket.id,
          socketId: socket.id
        });

        // Update participant count for remaining participants
        io.in(meetingRoom).allSockets().then((sockets) => {
          const participantCount = sockets.size;
          io.to(meetingRoom).emit("meeting:participant-count", { count: participantCount });
          console.log(`📊 Meeting ${data.meetingId} now has ${participantCount} participants after leave`);
        });
      } catch (e) {
        console.error("meeting:leave error", e);
      }
    });

    socket.on("meeting:end", (data: { meetingId: string }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        console.log(`🛑 Meeting ended: ${data.meetingId}`);

        // Notify all participants
        io.to(meetingRoom).emit("meeting:ended", { meetingId: data.meetingId });
      } catch (e) {
        console.error("meeting:end error", e);
      }
    });

    // WebRTC signaling events
    socket.on("webrtc:offer", (data: { meetingId: string; targetUserId: string; fromUserId: string; offer: any }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        console.log(`📤 Forwarding WebRTC offer from ${data.fromUserId} to ${data.targetUserId}`);

        // Forward offer to target user
        socket.to(meetingRoom).emit("webrtc:offer", {
          fromUserId: data.fromUserId,
          offer: data.offer
        });
      } catch (e) {
        console.error("webrtc:offer error", e);
      }
    });

    socket.on("webrtc:answer", (data: { meetingId: string; targetUserId: string; fromUserId: string; answer: any }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        console.log(`📤 Forwarding WebRTC answer from ${data.fromUserId} to ${data.targetUserId}`);

        // Forward answer to target user
        socket.to(meetingRoom).emit("webrtc:answer", {
          fromUserId: data.fromUserId,
          answer: data.answer
        });
      } catch (e) {
        console.error("webrtc:answer error", e);
      }
    });

    socket.on("webrtc:ice-candidate", (data: { meetingId: string; targetUserId: string; fromUserId: string; candidate: any }) => {
      try {
        const meetingRoom = `meeting-${data.meetingId}`;
        console.log(`🧊 Forwarding ICE candidate from ${data.fromUserId} to ${data.targetUserId}`);

        // Forward ICE candidate to target user
        socket.to(meetingRoom).emit("webrtc:ice-candidate", {
          fromUserId: data.fromUserId,
          candidate: data.candidate
        });
      } catch (e) {
        console.error("webrtc:ice-candidate error", e);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

      // Clean up any meeting rooms this socket was in
      // Note: Socket.IO automatically removes the socket from all rooms on disconnect
      // but we should notify other participants in meeting rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('meeting-')) {
          const meetingId = room.replace('meeting-', '');
          console.log(`🧹 Cleaning up meeting room: ${room} for disconnected socket: ${socket.id}`);

          // Notify other participants that someone left
          socket.to(room).emit("meeting:participant-left", {
            userId: socket.id, // Use socket.id as fallback
            socketId: socket.id,
            reason: 'disconnect'
          });

          // Update participant count for remaining participants
          setTimeout(() => {
            io.in(room).allSockets().then((sockets) => {
              const participantCount = sockets.size;
              io.to(room).emit("meeting:participant-count", { count: participantCount });
              console.log(`📊 Meeting ${meetingId} now has ${participantCount} participants after disconnect cleanup`);
            });
          }, 100); // Small delay to ensure socket is fully removed
        }
      });
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
