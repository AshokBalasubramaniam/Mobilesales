import { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import Avatar from "../common/Avatar";
import type { useVideoCall } from "../../hooks/useVideoCall";
import type { User } from "../../types/models";

export interface VideoCallModalProps {
  call: ReturnType<typeof useVideoCall>;
  otherUser?: Pick<User, "name" | "avatar">;
}

const classes = {
  overlay:
    "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white",
  ringingContainer: "flex flex-col items-center gap-4",
  callerName: "text-lg font-semibold",
  ringingActions: "flex gap-4",
  answerButton: "rounded-full bg-green-600 p-4",
  answerIcon: "size-6",
  declineButton: "rounded-full bg-red-600 p-4",
  declineIcon: "size-6",
  videoContainer:
    "relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-gray-900",
  remoteVideo: "size-full object-cover",
  remotePlaceholder:
    "flex size-full flex-col items-center justify-center gap-3",
  localVideo:
    "absolute right-3 bottom-3 h-28 w-20 rounded-lg object-cover ring-2 ring-white/50",
  endCallButton:
    "mt-6 flex items-center gap-2 rounded-full bg-red-600 px-6 py-3",
  endCallIcon: "size-5",
  callButton: "rounded-full p-2 text-gray-500 hover:bg-gray-100",
  callButtonIcon: "size-5",
};

const VideoCallModal = ({ call, otherUser }: VideoCallModalProps) => {
  const {
    status,
    localStream,
    remoteStream,
    incomingOffer,
    answerCall,
    endCall,
    declineCall,
  } = call;
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (status === "idle") return null;

  return (
    <div className={classes.overlay}>
      {status === "ringing" && !remoteStream ? (
        <div className={classes.ringingContainer}>
          <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xl" />
          <p className={classes.callerName}>{otherUser?.name} is calling...</p>
          <div className={classes.ringingActions}>
            <button
              onClick={() => incomingOffer && answerCall(incomingOffer)}
              className={classes.answerButton}
            >
              <Phone className={classes.answerIcon} />
            </button>
            <button onClick={declineCall} className={classes.declineButton}>
              <PhoneOff className={classes.declineIcon} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={classes.videoContainer}>
            {remoteStream ? (
              <video
                ref={remoteRef}
                autoPlay
                playsInline
                className={classes.remoteVideo}
              />
            ) : (
              <div className={classes.remotePlaceholder}>
                <Avatar
                  src={otherUser?.avatar}
                  name={otherUser?.name}
                  size="xl"
                />
                <p>Calling {otherUser?.name}...</p>
              </div>
            )}
            <video
              ref={localRef}
              autoPlay
              playsInline
              muted
              className={classes.localVideo}
            />
          </div>
          <button
            onClick={() => endCall(true)}
            className={classes.endCallButton}
          >
            <PhoneOff className={classes.endCallIcon} /> End Call
          </button>
        </>
      )}
    </div>
  );
};

export interface CallButtonProps {
  onClick: () => void;
}

export const CallButton = ({ onClick }: CallButtonProps) => (
  <button onClick={onClick} className={classes.callButton} title="Video call">
    <Video className={classes.callButtonIcon} />
  </button>
);

export default VideoCallModal;
