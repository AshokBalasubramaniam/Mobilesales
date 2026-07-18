import {
  useRef,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ImagePlus, Video, X } from "lucide-react";
import toast from "react-hot-toast";
import type { SellPhoneForm } from "./StepIdentity";

export interface StepMediaProps {
  form: SellPhoneForm;
  setForm: Dispatch<SetStateAction<SellPhoneForm>>;
}

const classes = {
  container: "space-y-6",
  heading: "text-lg font-bold",
  description: "mb-3 text-sm text-gray-500",
  photoGrid: "grid grid-cols-3 gap-3 sm:grid-cols-4",
  photoTile:
    "relative aspect-square overflow-hidden rounded-lg bg-gray-100",
  photoImg: "size-full object-cover",
  removeButton:
    "absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white",
  removeIcon: "size-3",
  addPhotoButton:
    "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400",
  addIcon: "size-6",
  addLabel: "text-xs",
  videoPreviewWrap: "relative w-fit",
  video: "h-40 rounded-lg",
  addVideoButton:
    "flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400",
};

const StepMedia = ({ form, setForm }: StepMediaProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImages = (files: FileList) => {
    const list = Array.from(files);
    if (form.photos.length + list.length > 15)
      return toast.error("Maximum 15 photos allowed");
    setForm({ ...form, photos: [...form.photos, ...list] });
  };

  const removeImage = (idx: number) =>
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== idx) });

  const onImagesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) handleImages(files);
  };

  const onVideoSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm({ ...form, video: file });
  };

  return (
    <div className={classes.container}>
      <div>
        <h2 className={classes.heading}>Add photos</h2>
        <p className={classes.description}>
          Upload at least 3 clear photos (up to 15). More angles help it sell
          faster.
        </p>

        <div className={classes.photoGrid}>
          {form.photos.map((file, idx) => (
            <div key={idx} className={classes.photoTile}>
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className={classes.photoImg}
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className={classes.removeButton}
              >
                <X className={classes.removeIcon} />
              </button>
            </div>
          ))}
          {form.photos.length < 15 && (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className={classes.addPhotoButton}
            >
              <ImagePlus className={classes.addIcon} />
              <span className={classes.addLabel}>Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onImagesSelected}
        />
      </div>

      <div>
        <h2 className={classes.heading}>Add a video (optional)</h2>
        <p className={classes.description}>
          A short walkthrough video builds buyer trust.
        </p>
        {form.video ? (
          <div className={classes.videoPreviewWrap}>
            <video
              src={URL.createObjectURL(form.video)}
              className={classes.video}
              controls
            />
            <button
              type="button"
              onClick={() => setForm({ ...form, video: null })}
              className={classes.removeButton}
            >
              <X className={classes.removeIcon} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className={classes.addVideoButton}
          >
            <Video className={classes.addIcon} />
            <span className={classes.addLabel}>Add video</span>
          </button>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={onVideoSelected}
        />
      </div>
    </div>
  );
};

export default StepMedia;
