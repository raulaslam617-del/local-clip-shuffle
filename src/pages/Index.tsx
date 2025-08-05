import { useState, useEffect } from 'react';
import { FolderPicker } from '@/components/FolderPicker';
import { VideoPlayer } from '@/components/VideoPlayer';

const Index = () => {
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);

  // Force dark mode for mobile app
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleFolderSelected = (files: File[]) => {
    setVideoFiles(files);
    setShowPlayer(true);
  };

  const handleRestart = () => {
    setShowPlayer(false);
    setVideoFiles([]);
  };

  if (showPlayer && videoFiles.length > 0) {
    return (
      <VideoPlayer 
        videoFiles={videoFiles} 
        onRestart={handleRestart}
      />
    );
  }

  return (
    <FolderPicker onFolderSelected={handleFolderSelected} />
  );
};

export default Index;
