import { useRef, useEffect, useState, useCallback } from "react";

let apiLoadPromise = null;

function loadYouTubeAPI() {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });

  return apiLoadPromise;
}

export default function useYouTubePlayer(onEnded, onProgress) {
  const playerRef    = useRef(null);
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const progressInterval = useRef(null);

  useEffect(() => {
    let mounted = true;

    loadYouTubeAPI().then((YT) => {
      if (!mounted || !containerRef.current) return;

      playerRef.current = new YT.Player(containerRef.current, {
        height: "0",
        width:  "0",
        playerVars: { autoplay: 0, controls: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              onEnded?.();
            }
            if (e.data === YT.PlayerState.PLAYING) {
              clearInterval(progressInterval.current);
              progressInterval.current = setInterval(() => {
                const current  = playerRef.current?.getCurrentTime() || 0;
                const duration = playerRef.current?.getDuration() || 1;
                onProgress?.((current / duration) * 100, current, duration);
              }, 500);
            } else {
              clearInterval(progressInterval.current);
            }
          },
        },
      });
    });

    return () => {
      mounted = false;
      clearInterval(progressInterval.current);
    };
    // eslint-disable-next-line
  }, []);

  const loadVideo = useCallback((videoId) => {
    if (playerRef.current && ready) {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.playVideo();
    }
  }, [ready]);

  const play  = useCallback(() => playerRef.current?.playVideo(), []);
  const pause = useCallback(() => playerRef.current?.pauseVideo(), []);
  const seekTo = useCallback((seconds) => playerRef.current?.seekTo(seconds, true), []);

  return { containerRef, ready, loadVideo, play, pause, seekTo };
}