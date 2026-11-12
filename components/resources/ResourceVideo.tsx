/**
 * A YouTube video in an article, in the same glass frame as the charts.
 * Plays from youtube-nocookie.com (YouTube's privacy-enhanced mode), so no
 * YouTube cookies are set until the reader presses play. Lazy-loaded so the
 * player doesn't cost anything for readers who never scroll that far.
 */
export default function ResourceVideo({
  youtubeId,
  title,
  caption,
}: {
  youtubeId: string;
  title: string;
  caption?: string;
}) {
  return (
    <figure className="res-video">
      <div className="res-video-frame">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      {caption && <figcaption className="res-video-caption">{caption}</figcaption>}
    </figure>
  );
}
