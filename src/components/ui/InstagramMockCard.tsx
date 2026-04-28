import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

interface Props {
  caption: string;
  hashtags: string[];
  imageBase64: string | null;
  mimeType: string | null;
  username?: string;
}

export default function InstagramMockCard({
  caption,
  hashtags,
  imageBase64,
  mimeType,
  username = "your_brand",
}: Props) {
  const imgSrc =
    imageBase64 && mimeType ? `data:${mimeType};base64,${imageBase64}` : null;

  return (
    <div className="w-full max-w-sm mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden font-sans select-none">
      {/* Profile row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-purple to-brand-blue shrink-0" />
        <div className="flex flex-col gap-0">
          <span className="text-xs font-semibold text-text-primary leading-tight">
            {username}
          </span>
          <span className="text-[10px] text-text-subtle">Sponsored</span>
        </div>
        <span className="ml-auto text-xs font-semibold text-brand-blue border border-brand-blue/40 rounded px-2 py-0.5">
          Follow
        </span>
      </div>

      {/* Image area — 1:1 */}
      <div className="aspect-square w-full overflow-hidden bg-bg-elevated relative">
        {imgSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt="AI generated Instagram post visual"
            className="w-full h-full object-cover"
          />
        ) : (
          // Gradient placeholder when image generation failed/unavailable
          <div className="w-full h-full bg-linear-to-br from-brand-purple/30 via-bg-elevated to-brand-blue/20 flex items-center justify-center">
            <span className="text-xs text-text-subtle">Visual not available</span>
          </div>
        )}
      </div>

      {/* Action row */}
      <div className="flex items-center gap-4 px-4 py-3">
        <Heart size={22} className="text-text-primary" aria-label="Like" />
        <MessageCircle size={22} className="text-text-primary" aria-label="Comment" />
        <Send size={22} className="text-text-primary" aria-label="Share" />
        <Bookmark size={22} className="text-text-primary ml-auto" aria-label="Save" />
      </div>

      {/* Caption + hashtags */}
      <div className="px-4 pb-4 flex flex-col gap-1">
        <p className="text-xs text-text-primary leading-relaxed">
          <span className="font-semibold mr-1">{username}</span>
          {caption}
        </p>
        <p className="text-xs text-brand-blue leading-relaxed wrap-break-word">
          {hashtags.join(" ")}
        </p>
      </div>
    </div>
  );
}
