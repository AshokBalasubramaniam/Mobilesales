import { useState, type MouseEvent } from 'react';
import clsx from 'clsx';
import { Check, CheckCheck, MapPin, PhoneMissed, PhoneOff, Play, Video } from 'lucide-react';
import { formatDateTime } from '../../utils/format';
import { formatCurrency } from '../../utils/format';
import Button from '../common/Button';
import type { Message, OfferStatus } from '../../types/models';

export type RespondOfferHandler = (messageId: string, status: OfferStatus) => void;

interface OfferBubbleProps {
  message: Message;
  isOwn: boolean;
  onRespond: RespondOfferHandler;
}

const OfferBubble = ({ message, isOwn, onRespond }: OfferBubbleProps) => {
  if (!message.offer) return null;
  const { amount, status } = message.offer;
  return (
    <div className="rounded-xl border border-brand-200 bg-white p-3 dark:border-brand-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500">{isOwn ? 'You offered' : 'Offer received'}</p>
      <p className="text-lg font-bold text-brand-700 dark:text-brand-300">{formatCurrency(amount)}</p>
      <p className={clsx('mt-1 text-xs font-medium capitalize', status === 'accepted' && 'text-green-600', status === 'rejected' && 'text-red-500')}>
        {status}
      </p>
      {!isOwn && status === 'pending' && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => onRespond(message._id, 'accepted')}>
            Accept
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onRespond(message._id, 'rejected')}>
            Decline
          </Button>
        </div>
      )}
    </div>
  );
};

interface VoiceBubbleProps {
  url?: string;
}

const VoiceBubble = ({ url }: VoiceBubbleProps) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          const audio = e.currentTarget.nextSibling as HTMLAudioElement | null;
          if (!audio) return;
          playing ? audio.pause() : audio.play();
        }}
        className="rounded-full bg-brand-600 p-2 text-white"
      >
        <Play className="size-3.5" />
      </button>
      <audio src={url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <span className="text-xs text-gray-400">Voice message</span>
    </div>
  );
};

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderLabel?: string;
  onRespondOffer: RespondOfferHandler;
}

const MessageBubble = ({ message, isOwn, senderLabel, onRespondOffer }: MessageBubbleProps) => {
  if (message.type === 'system' || message.type === 'video_call_event') {
    const Icon = message.callEvent?.event === 'missed' ? PhoneMissed : message.callEvent?.event === 'declined' ? PhoneOff : Video;
    return (
      <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-gray-400">
        <Icon className="size-3.5" />
        {message.type === 'video_call_event' ? `Video call ${message.callEvent?.event}` : message.content}
      </div>
    );
  }

  return (
    <div className={clsx('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={clsx('max-w-xs sm:max-w-sm', isOwn ? 'items-end' : 'items-start')}>
        {senderLabel && <p className="mb-0.5 px-1 text-[11px] font-medium text-brand-600">{senderLabel}</p>}
        <div
          className={clsx(
            'rounded-2xl px-3.5 py-2 text-sm',
            message.type === 'offer'
              ? 'bg-transparent p-0'
              : isOwn
                ? 'rounded-br-sm bg-brand-600 text-white'
                : 'rounded-bl-sm bg-gray-100 dark:bg-gray-800'
          )}
        >
          {message.type === 'text' && message.content}
          {message.type === 'image' && <img src={message.mediaUrl} alt="Shared" className="max-h-60 rounded-lg" />}
          {message.type === 'voice' && <VoiceBubble url={message.mediaUrl} />}
          {message.type === 'location' && (
            <a
              href={`https://maps.google.com/?q=${message.location?.lat},${message.location?.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 underline"
            >
              <MapPin className="size-4" /> {message.location?.address || 'Shared location'}
            </a>
          )}
          {message.type === 'offer' && <OfferBubble message={message} isOwn={isOwn} onRespond={onRespondOffer} />}
        </div>
        <div className={clsx('mt-0.5 flex items-center gap-1 text-[10px] text-gray-400', isOwn ? 'justify-end' : 'justify-start')}>
          {formatDateTime(message.createdAt)}
          {isOwn && (message.isRead ? <CheckCheck className="size-3 text-brand-500" /> : <Check className="size-3" />)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
