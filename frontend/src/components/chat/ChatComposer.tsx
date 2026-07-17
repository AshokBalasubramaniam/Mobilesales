import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Image, Mic, Send, Square, Tag, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/api";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../../hooks/useAuth";
import EmailVerificationNotice from "../auth/EmailVerificationNotice";

export interface ChatComposerProps {
  conversationId: string;
  onOfferClick: () => void;
}

const classes = {
  unverifiedWrapper: "border-t border-gray-200 p-3 dark:border-gray-800",
  form: "flex items-center gap-1.5 border-t border-gray-200 p-3 dark:border-gray-800",
  iconButton:
    "rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800",
  icon: "size-5",
  recordingButtonBase: "rounded-full p-2",
  recordingActive: "bg-red-100 text-red-600",
  recordingInactive: "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800",
  textInput:
    "flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900",
  sendButton: "rounded-full bg-brand-600 p-2.5 text-white disabled:opacity-50",
  sendIcon: "size-4",
};

const ChatComposer = ({ conversationId, onOfferClick }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const { user } = useAuth();

  const emitTyping = (isTyping: boolean) => {
    getSocket()?.emit(isTyping ? "typing:start" : "typing:stop", {
      conversationId,
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSendText = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (!user?.isEmailVerified)
      return toast.error("Please verify your email before sending messages");
    setSending(true);
    try {
      await api.post(`/chat/conversations/${conversationId}/messages/text`, {
        content: text.trim(),
      });
      setText("");
      emitTyping(false);
    } catch {
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user?.isEmailVerified)
      return toast.error("Please verify your email before sending messages");
    try {
      const mediaForm = new FormData();
      mediaForm.append("file", file);
      await api.post(
        `/chat/conversations/${conversationId}/messages/media`,
        mediaForm,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
    } catch {
      toast.error("Could not send image");
    }
  };

  const handleLocationShare = () => {
    if (!user?.isEmailVerified)
      return toast.error("Please verify your email before sending messages");
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.post(
            `/chat/conversations/${conversationId}/messages/location`,
            { lat: pos.coords.latitude, lng: pos.coords.longitude },
          );
        } catch {
          toast.error("Could not share location");
        }
      },
      () => toast.error("Could not get your location"),
    );
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!user?.isEmailVerified)
      return toast.error("Please verify your email before sending messages");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        try {
          const mediaForm = new FormData();
          mediaForm.append("file", file);
          await api.post(
            `/chat/conversations/${conversationId}/messages/media`,
            mediaForm,
            { headers: { "Content-Type": "multipart/form-data" } },
          );
        } catch {
          toast.error("Could not send voice message");
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  if (!user?.isEmailVerified) {
    return (
      <div className={classes.unverifiedWrapper}>
        <EmailVerificationNotice />
      </div>
    );
  }

  return (
    <form onSubmit={handleSendText} className={classes.form}>
      <button
        type="button"
        onClick={() => imageInputRef.current?.click()}
        className={classes.iconButton}
      >
        <Image className={classes.icon} />
      </button>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleImageSelect}
      />

      <button
        type="button"
        onClick={onOfferClick}
        className={classes.iconButton}
        title="Send offer"
      >
        <Tag className={classes.icon} />
      </button>

      <button
        type="button"
        onClick={handleLocationShare}
        className={classes.iconButton}
        title="Share location"
      >
        <MapPin className={classes.icon} />
      </button>

      <button
        type="button"
        onClick={toggleRecording}
        className={`${classes.recordingButtonBase} ${recording ? classes.recordingActive : classes.recordingInactive}`}
        title="Record voice message"
      >
        {recording ? (
          <Square className={classes.icon} />
        ) : (
          <Mic className={classes.icon} />
        )}
      </button>

      <input
        value={text}
        onChange={handleTextChange}
        placeholder="Type a message..."
        className={classes.textInput}
      />
      <button
        type="submit"
        disabled={sending || !text.trim()}
        className={classes.sendButton}
      >
        <Send className={classes.sendIcon} />
      </button>
    </form>
  );
};

export default ChatComposer;
