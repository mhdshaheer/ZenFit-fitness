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

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
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
