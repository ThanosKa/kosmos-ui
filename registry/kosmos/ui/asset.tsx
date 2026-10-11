'use client';

import { ImageOff, Pause, Play } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/registry/kosmos/lib/cn';
import { Button } from '@/registry/kosmos/ui/button';

type AssetStatus = 'loading' | 'loaded' | 'error';
type AssetFit = 'cover' | 'contain';

const AssetContext = React.createContext<React.Dispatch<React.SetStateAction<AssetStatus>> | null>(null);

function useAssetStatus() {
  const setStatus = React.use(AssetContext);
  if (!setStatus) throw new Error('AssetImage and AssetVideo must be used inside an Asset.');
  return setStatus;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

type AssetProps = React.ComponentProps<'div'> & {
  /** Width divided by height, such as `16 / 9` or `1`. The frame keeps this shape before and after the media loads. */
  ratio?: number;
  /** What shows when the media fails to load. An icon by default. */
  fallback?: React.ReactNode;
};

/**
 * A frame with a fixed aspect ratio for one image or video. It shows a pulsing placeholder while
 * the media loads, fades the media in once it has loaded, and shows a fallback if it fails, so the
 * layout never jumps.
 */
function Asset({ ratio = 16 / 9, fallback, className, style, children, ...props }: AssetProps) {
  const [status, setStatus] = React.useState<AssetStatus>('loading');

  return (
    <AssetContext value={setStatus}>
      <div
        data-slot="asset"
        data-status={status}
        aria-busy={status === 'loading' || undefined}
        style={{ '--asset-ratio': ratio, ...style } as React.CSSProperties}
        className={cn(
          'group/asset relative isolate aspect-(--asset-ratio) w-full overflow-hidden rounded-xl bg-muted data-[status=loading]:bg-transparent',
          'outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10',
          // A video's own controls take focus; the frame draws the outline, which its overflow would otherwise clip.
          'has-[video:focus-visible]:outline-2 has-[video:focus-visible]:outline-offset-2 has-[video:focus-visible]:outline-ring',
          className,
        )}
        {...props}
      >
        {status === 'loading' && (
          <div data-slot="asset-skeleton" aria-hidden className="absolute inset-0 -z-1 animate-pulse bg-muted" />
        )}
        {children}
        {status === 'error' && (
          <div
            data-slot="asset-fallback"
            className="absolute inset-0 flex items-center justify-center p-4 text-center text-small text-muted-foreground"
          >
            {fallback ?? <ImageOff aria-hidden className="size-5" />}
          </div>
        )}
      </div>
    </AssetContext>
  );
}

const mediaClasses = (fit: AssetFit) =>
  cn(
    'absolute inset-0 size-full opacity-0 transition-[opacity] duration-base group-data-[status=loaded]/asset:opacity-100',
    fit === 'cover' ? 'object-cover' : 'object-contain',
  );

type AssetImageProps = Omit<React.ComponentProps<'img'>, 'alt'> & {
  /** Describes the image. Pass `""` for an image that is only decoration. */
  alt: string;
  /** `cover` fills the frame and crops; `contain` shows the whole image inside it. */
  fit?: AssetFit;
};

function AssetImage({ alt, className, fit = 'cover', loading = 'lazy', decoding = 'async', ref, onLoad, onError, ...props }: AssetImageProps) {
  const setStatus = useAssetStatus();
  const imageRef = React.useRef<HTMLImageElement>(null);
  const { src } = props;

  // The image may finish loading before hydration, when React's onLoad is not listening yet.
  React.useEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    if (image.complete) setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    else setStatus('loading');
  }, [src, setStatus]);

  return (
    // A plain <img>, so the component works in any React app, not only with next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      data-slot="asset-image"
      alt={alt}
      ref={(node) => {
        imageRef.current = node;
        setRef(ref, node);
      }}
      loading={loading}
      decoding={decoding}
      className={cn(mediaClasses(fit), className)}
      onLoad={(event) => {
        setStatus('loaded');
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus('error');
        onError?.(event);
      }}
      {...props}
    />
  );
}

type AssetVideoProps = React.ComponentProps<'video'> & {
  /** `cover` fills the frame and crops; `contain` shows the whole video inside it. */
  fit?: AssetFit;
  /** Label of the pause button shown on a video that plays by itself without controls. */
  pauseLabel?: string;
  /** Label of the same button while the video is paused. */
  playLabel?: string;
};

// The play and pause icons cross-fade; with motion allowed they also scale and blur, as icon swaps do.
const iconSwap = cn(
  'opacity-0 transition-[opacity,scale,filter] duration-slow data-visible:opacity-100',
  'motion-safe:scale-25 motion-safe:blur-xs motion-safe:data-visible:scale-100 motion-safe:data-visible:blur-none',
);

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

/**
 * A video in the frame. With `autoPlay` it plays muted and inline, and only when the viewer has not
 * asked for reduced motion. Without `controls`, it gets a pause button, so motion can always be stopped.
 */
function AssetVideo({
  className,
  fit = 'cover',
  autoPlay = false,
  controls = false,
  muted,
  playsInline = true,
  poster,
  preload,
  pauseLabel = 'Pause video',
  playLabel = 'Play video',
  ref,
  onLoadedData,
  onLoadedMetadata,
  onError,
  onPlay,
  onPause,
  ...props
}: AssetVideoProps) {
  const setStatus = useAssetStatus();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  const { src } = props;
  // With a poster there is something to show as soon as the metadata is in; without one, the first frame.
  const readyState = poster ? 1 : 2;

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const failed = () => video.error !== null || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE;
    // The video may be ready, or have failed, before hydration, when React's handlers are not listening yet.
    if (failed()) setStatus('error');
    else setStatus(video.readyState >= readyState ? 'loaded' : 'loading');
    // With <source> children each failed source fires its own error, which does not bubble. The video
    // has failed once the last one has, and the browser then reports that no source is left.
    const onSourceError = (event: Event) => {
      if (event.target !== video) setTimeout(() => failed() && setStatus('error'));
    };
    video.addEventListener('error', onSourceError, true);
    return () => video.removeEventListener('error', onSourceError, true);
  }, [src, readyState, setStatus]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay || window.matchMedia(reducedMotionQuery).matches) return;
    video.play().catch(() => setPlaying(false));
  }, [src, autoPlay]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  return (
    <>
      <video
        data-slot="asset-video"
        ref={(node) => {
          videoRef.current = node;
          setRef(ref, node);
        }}
        controls={controls}
        // Browsers only play a video by itself when it is muted.
        muted={muted ?? autoPlay}
        playsInline={playsInline}
        poster={poster}
        preload={preload ?? (poster ? 'metadata' : 'auto')}
        className={cn(mediaClasses(fit), className)}
        onLoadedMetadata={(event) => {
          if (poster) setStatus('loaded');
          onLoadedMetadata?.(event);
        }}
        onLoadedData={(event) => {
          setStatus('loaded');
          onLoadedData?.(event);
        }}
        onError={(event) => {
          setStatus('error');
          onError?.(event);
        }}
        onPlay={(event) => {
          setPlaying(true);
          onPlay?.(event);
        }}
        onPause={(event) => {
          setPlaying(false);
          onPause?.(event);
        }}
        {...props}
      />
      {autoPlay && !controls && (
        <Button
          variant="secondary"
          size="icon"
          aria-label={playing ? pauseLabel : playLabel}
          className="absolute end-2 bottom-2 group-data-[status=error]/asset:hidden"
          onClick={toggle}
        >
          <span aria-hidden className="grid *:col-start-1 *:row-start-1">
            <Pause data-visible={playing || undefined} className={iconSwap} />
            <Play data-visible={!playing || undefined} className={iconSwap} />
          </span>
        </Button>
      )}
    </>
  );
}

export { Asset, AssetImage, AssetVideo, type AssetProps, type AssetImageProps, type AssetVideoProps };
