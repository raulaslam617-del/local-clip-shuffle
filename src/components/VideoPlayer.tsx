import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ArrowLeft, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoFiles: File[];
  onRestart: () => void;
}

export const VideoPlayer = ({ videoFiles, onRestart }: VideoPlayerProps) => {
  const [shuffledVideos, setShuffledVideos] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Shuffle videos on mount
  useEffect(() => {
    const shuffled = [...videoFiles].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
    toast({
      title: "Video diacak",
      description: `${videoFiles.length} video siap diputar`,
    });
  }, [videoFiles]);

  // Auto play current video when in view
  const playVideoInView = useCallback(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentIndex) {
          video.currentTime = 0;
          video.play().catch(console.log);
        } else {
          video.pause();
        }
      }
    });
  }, [currentIndex]);

  useEffect(() => {
    playVideoInView();
  }, [currentIndex, playVideoInView]);

  // Handle scroll snap
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const scrollPosition = container.scrollTop;
    const windowHeight = window.innerHeight;
    const newIndex = Math.round(scrollPosition / windowHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < shuffledVideos.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, shuffledVideos.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    videoRefs.current.forEach(video => {
      if (video) video.muted = newMuted;
    });
  };

  const handleRestart = () => {
    const shuffled = [...videoFiles].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
    setCurrentIndex(0);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    toast({
      title: "Video direset",
      description: "Urutan video telah diacak ulang",
    });
  };

  if (shuffledVideos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Memuat video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollBehavior: 'smooth' }}
      >
        {shuffledVideos.map((video, index) => (
          <div
            key={`${video.name}-${index}`}
            className="relative w-full h-screen snap-start flex items-center justify-center"
          >
            <video
              ref={(el) => (videoRefs.current[index] = el)}
              src={URL.createObjectURL(video)}
              className="w-full h-full object-cover"
              loop
              muted={isMuted}
              playsInline
              preload="metadata"
              onLoadedData={() => {
                if (index === currentIndex) {
                  videoRefs.current[index]?.play().catch(console.log);
                }
              }}
            />
            
            {/* Video overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            
            {/* Video info */}
            <div className="absolute bottom-20 left-4 right-20 text-white">
              <h3 className="font-medium text-sm mb-1 truncate">
                {video.name.replace(/\.[^/.]+$/, "")}
              </h3>
              <p className="text-xs text-white/70">
                {index + 1} dari {shuffledVideos.length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right side controls */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-4">
        <Button
          variant="floating"
          size="icon"
          onClick={toggleMute}
          className="bg-black/30 hover:bg-black/50"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
        </Button>
        
        <Button
          variant="floating"
          size="icon"
          onClick={handleRestart}
          className="bg-black/30 hover:bg-black/50"
        >
          <RotateCcw className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <Button
          variant="floating"
          size="icon"
          onClick={onRestart}
          className="bg-black/30 hover:bg-black/50"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        
        <div className="text-white text-sm font-medium">
          Local Clip Shuffle
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col gap-1">
        {shuffledVideos.map((_, index) => (
          <div
            key={index}
            className={`w-1 h-8 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};