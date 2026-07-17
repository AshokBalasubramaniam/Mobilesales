import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";
import api from "../api/api";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export type CallStatus = "idle" | "calling" | "ringing" | "active";

export interface UseVideoCallArgs {
  conversationId: string;
  otherUserId?: string;
}

interface CallInvitePayload {
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

interface CallAnswerPayload {
  fromUserId: string;
  sdp: RTCSessionDescriptionInit;
}

interface CallIceCandidatePayload {
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

interface CallEndPayload {
  fromUserId: string;
}

/**
 * Minimal WebRTC signaling via the existing chat socket events
 * (call:invite/answer/ice-candidate/end/decline). Media is negotiated
 * peer-to-peer; the server only relays SDP/ICE payloads.
 */
export const useVideoCall = ({
  conversationId,
  otherUserId,
}: UseVideoCallArgs) => {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setStatus("idle");
  }, [localStream]);

  const createPeerConnection = useCallback(
    (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pc.onicecandidate = (e) => {
        if (e.candidate)
          getSocket()?.emit("call:ice-candidate", {
            toUserId: otherUserId,
            candidate: e.candidate,
          });
      };
      pcRef.current = pc;
      return pc;
    },
    [otherUserId],
  );

  const startCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    getSocket()?.emit("call:invite", {
      conversationId,
      toUserId: otherUserId,
      sdp: offer,
    });
    startedAtRef.current = Date.now();
    setStatus("calling");
  }, [conversationId, otherUserId, createPeerConnection]);

  const answerCall = useCallback(
    async (offerSdp: RTCSessionDescriptionInit) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      const pc = createPeerConnection(stream);
      await pc.setRemoteDescription(offerSdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      getSocket()?.emit("call:answer", { toUserId: otherUserId, sdp: answer });
      startedAtRef.current = Date.now();
      setStatus("active");
    },
    [otherUserId, createPeerConnection],
  );

  const logEvent = useCallback(
    (event: string) => {
      const durationSeconds = startedAtRef.current
        ? Math.round((Date.now() - startedAtRef.current) / 1000)
        : undefined;
      api
        .post(`/chat/conversations/${conversationId}/call-events`, {
          event,
          durationSeconds,
        })
        .catch(() => {});
    },
    [conversationId],
  );

  const endCall = useCallback(
    (notify = true) => {
      if (notify)
        getSocket()?.emit("call:end", {
          toUserId: otherUserId,
          conversationId,
        });
      logEvent(status === "active" ? "ended" : "missed");
      cleanup();
    },
    [otherUserId, conversationId, status, logEvent, cleanup],
  );

  const declineCall = useCallback(() => {
    getSocket()?.emit("call:decline", {
      toUserId: otherUserId,
      conversationId,
    });
    logEvent("declined");
    cleanup();
  }, [otherUserId, conversationId, logEvent, cleanup]);

  const [incomingOffer, setIncomingOffer] =
    useState<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return undefined;

    const onInvite = ({ fromUserId, sdp }: CallInvitePayload) => {
      if (fromUserId !== otherUserId) return;
      setIncomingOffer(sdp);
      setStatus("ringing");
    };
    const onAnswer = ({ fromUserId, sdp }: CallAnswerPayload) => {
      if (fromUserId !== otherUserId || !pcRef.current) return;
      pcRef.current.setRemoteDescription(sdp);
      setStatus("active");
    };
    const onIceCandidate = ({
      fromUserId,
      candidate,
    }: CallIceCandidatePayload) => {
      if (fromUserId !== otherUserId || !pcRef.current) return;
      pcRef.current.addIceCandidate(candidate).catch(() => {});
    };
    const onEnd = ({ fromUserId }: CallEndPayload) => {
      if (fromUserId !== otherUserId) return;
      cleanup();
      setIncomingOffer(null);
    };
    const onDecline = ({ fromUserId }: CallEndPayload) => {
      if (fromUserId !== otherUserId) return;
      cleanup();
      setIncomingOffer(null);
    };

    socket.on("call:invite", onInvite);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:end", onEnd);
    socket.on("call:decline", onDecline);

    return () => {
      socket.off("call:invite", onInvite);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:end", onEnd);
      socket.off("call:decline", onDecline);
    };
  }, [otherUserId, cleanup]);

  return {
    status,
    localStream,
    remoteStream,
    incomingOffer,
    startCall,
    answerCall,
    endCall,
    declineCall,
  };
};
