import { useRef, useState } from 'react';
import { Image, Mic, Send, Square, Tag, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { chatApi } from '../../api/chat.api';
import { getSocket } from '../../lib/socket';

const ChatComposer = ({ conversationId, onOfferClick }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const imageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const emitTyping = (isTyping) => {
    getSocket()?.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await chatApi.sendText(conversationId, text.trim());
      setText('');
      emitTyping(false);
    } catch {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await chatApi.sendMedia(conversationId, file);
    } catch {
      toast.error('Could not send image');
    }
  };

  const handleLocationShare = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await chatApi.sendLocation(conversationId, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch {
          toast.error('Could not share location');
        }
      },
      () => toast.error('Could not get your location')
    );
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        try {
          await chatApi.sendMedia(conversationId, file);
        } catch {
          toast.error('Could not send voice message');
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  return (
    <form onSubmit={handleSendText} className="flex items-center gap-1.5 border-t border-gray-200 p-3 dark:border-gray-800">
      <button type="button" onClick={() => imageInputRef.current.click()} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Image className="size-5" />
      </button>
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />

      <button type="button" onClick={onOfferClick} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Send offer">
        <Tag className="size-5" />
      </button>

      <button type="button" onClick={handleLocationShare} className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Share location">
        <MapPin className="size-5" />
      </button>

      <button
        type="button"
        onClick={toggleRecording}
        className={`rounded-full p-2 ${recording ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        title="Record voice message"
      >
        {recording ? <Square className="size-5" /> : <Mic className="size-5" />}
      </button>

      <input
        value={text}
        onChange={handleTextChange}
        placeholder="Type a message..."
        className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
      />
      <button type="submit" disabled={sending || !text.trim()} className="rounded-full bg-brand-600 p-2.5 text-white disabled:opacity-50">
        <Send className="size-4" />
      </button>
    </form>
  );
};

export default ChatComposer;
