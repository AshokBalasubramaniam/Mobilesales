import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import Avatar from '../common/Avatar';
import type { useVideoCall } from '../../hooks/useVideoCall';
import type { User } from '../../types/models';

export interface VideoCallModalProps {
  call: ReturnType<typeof useVideoCall>;
  otherUser?: Pick<User, 'name' | 'avatar'>;
}

const VideoCallModal = ({ call, otherUser }: VideoCallModalProps) => {
  const { status, localStream, remoteStream, incomingOffer, answerCall, endCall, declineCall } = call;
  const localRef = useRef<HTMLVideoElement | null>(null);
  const remoteRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white">
      {status === 'ringing' && !remoteStream ? (
        <div className="flex flex-col items-center gap-4">
          <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xl" />
          <p className="text-lg font-semibold">{otherUser?.name} is calling...</p>
          <div className="flex gap-4">
            <button onClick={() => incomingOffer && answerCall(incomingOffer)} className="rounded-full bg-green-600 p-4">
              <Phone className="size-6" />
            </button>
            <button onClick={declineCall} className="rounded-full bg-red-600 p-4">
              <PhoneOff className="size-6" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-gray-900">
            {remoteStream ? (
              <video ref={remoteRef} autoPlay playsInline className="size-full object-cover" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-3">
                <Avatar src={otherUser?.avatar} name={otherUser?.name} size="xl" />
                <p>Calling {otherUser?.name}...</p>
              </div>
            )}
            <video ref={localRef} autoPlay playsInline muted className="absolute right-3 bottom-3 h-28 w-20 rounded-lg object-cover ring-2 ring-white/50" />
          </div>
          <button onClick={() => endCall(true)} className="mt-6 flex items-center gap-2 rounded-full bg-red-600 px-6 py-3">
            <PhoneOff className="size-5" /> End Call
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
  <button onClick={onClick} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Video call">
    <Video className="size-5" />
  </button>
);

export default VideoCallModal;
