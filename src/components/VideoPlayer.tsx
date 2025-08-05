import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  videoFiles: File[];
  onRestart: () => void;
}

export const VideoPlayer = ({ videoFiles, onRestart }: VideoPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [playedVideos, setPlayedVideos] = useState<Set<number>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Shuffle array function
  const shuffleArray = (array: number[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize shuffle on mount
  useEffect(() => {
    const indices = Array.from({ length: videoFiles.length }, (_, i) => i);
    const shuffled = shuffleArray(indices);
    setShuffledIndices(shuffled);
    setCurrentIndex(0);
    setPlayedVideos(new Set());
  }, [videoFiles]);

  // Load current video
  useEffect(() => {
    if (shuffledIndices.length > 0 && currentIndex < shuffledIndices.length) {
      const fileIndex = shuffledIndices[currentIndex];
      const file = videoFiles[fileIndex];
      
      if (currentVideoUrl) {
        URL.revokeObjectURL(currentVideoUrl);
      }
      
      const url = URL.createObjectURL(file);
      setCurrentVideoUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [currentIndex, shuffledIndices, videoFiles]);

  // Video event handlers
  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      
      // Mark as played
      const fileIndex = shuffledIndices[currentIndex];
      setPlayedVideos(prev => new Set([...prev, fileIndex]));
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < shuffledIndices.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(false);
    } else {
      // All videos played
      setShowCompleteDialog(true);
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    handleNext();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleRestart = () => {
    setShowCompleteDialog(false);
    const indices = Array.from({ length: videoFiles.length }, (_, i) => i);
    const shuffled = shuffleArray(indices);
    setShuffledIndices(shuffled);
    setCurrentIndex(0);
    setPlayedVideos(new Set());
    setIsPlaying(false);
    
    toast({
      title: "Video direset",
      description: "Urutan video telah diacak ulang",
    });
  };

  const currentVideoName = shuffledIndices.length > 0 && currentIndex < shuffledIndices.length 
    ? videoFiles[shuffledIndices[currentIndex]].name 
    : '';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative">
        {currentVideoUrl && (
          <video
            ref={videoRef}
            src={currentVideoUrl}
            className="w-full h-full object-cover"
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            controls={false}
          />
        )}
        
        {/* Video Overlay */}
        <div className="absolute inset-0 video-overlay pointer-events-none" />
        
        {/* Controls Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button
            variant="floating"
            size="circle"
            className="pointer-events-auto"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          <div className="flex items-center justify-between pointer-events-auto">
            <div className="flex-1">
              <p className="text-white font-medium text-sm mb-1 truncate">
                {currentVideoName}
              </p>
              <div className="flex items-center gap-2 text-white/70 text-xs">
                <span>{playedVideos.size + 1} / {videoFiles.length}</span>
                <span>•</span>
                <span>{videoFiles.length - playedVideos.size - 1} tersisa</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="floating"
                size="icon"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="floating"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex >= shuffledIndices.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              
              <Button
                variant="floating"
                size="icon"
                onClick={onRestart}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Dialog */}
      {showCompleteDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <Card className="video-container p-6 max-w-sm w-full text-center animate-slide-up">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Semua video sudah diputar
              </h2>
              <p className="text-muted-foreground text-sm">
                Anda telah menonton semua {videoFiles.length} video
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                variant="tiktok" 
                className="w-full"
                onClick={handleRestart}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Putar Ulang dengan Urutan Baru
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onRestart}
              >
                Pilih Folder Lain
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};