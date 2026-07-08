import { useRef } from 'react';
import { ImagePlus, Video, X } from 'lucide-react';
import toast from 'react-hot-toast';

const StepMedia = ({ form, setForm }) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImages = (files) => {
    const list = Array.from(files);
    if (form.photos.length + list.length > 15) return toast.error('Maximum 15 photos allowed');
    setForm({ ...form, photos: [...form.photos, ...list] });
  };

  const removeImage = (idx) => setForm({ ...form, photos: form.photos.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">Add photos</h2>
        <p className="mb-3 text-sm text-gray-500">Upload at least 3 clear photos (up to 15). More angles help it sell faster.</p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {form.photos.map((file, idx) => (
            <div key={idx} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
              <img src={URL.createObjectURL(file)} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {form.photos.length < 15 && (
            <button
              type="button"
              onClick={() => imageInputRef.current.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 dark:border-gray-700"
            >
              <ImagePlus className="size-6" />
              <span className="text-xs">Add photo</span>
            </button>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files.length && handleImages(e.target.files)}
        />
      </div>

      <div>
        <h2 className="text-lg font-bold">Add a video (optional)</h2>
        <p className="mb-3 text-sm text-gray-500">A short walkthrough video builds buyer trust.</p>
        {form.video ? (
          <div className="relative w-fit">
            <video src={URL.createObjectURL(form.video)} className="h-40 rounded-lg" controls />
            <button
              type="button"
              onClick={() => setForm({ ...form, video: null })}
              className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white"
            >
              <X className="size-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current.click()}
            className="flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 dark:border-gray-700"
          >
            <Video className="size-6" />
            <span className="text-xs">Add video</span>
          </button>
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => e.target.files[0] && setForm({ ...form, video: e.target.files[0] })}
        />
      </div>
    </div>
  );
};

export default StepMedia;
