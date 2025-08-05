import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderOpen, Video } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FolderPickerProps {
  onFolderSelected: (videoFiles: File[]) => void;
}

export const FolderPicker = ({ onFolderSelected }: FolderPickerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFolderSelect = async () => {
    setIsLoading(true);
    try {
      // Use the File System Access API for folder selection
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker();
        const videoFiles: File[] = [];
        
        // Supported video formats
        const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
        
        for await (const [name, handle] of directoryHandle) {
          if (handle.kind === 'file') {
            const file = await handle.getFile();
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (videoExtensions.includes(extension)) {
              videoFiles.push(file);
            }
          }
        }
        
        if (videoFiles.length === 0) {
          toast({
            title: "Tidak ada video ditemukan",
            description: "Pilih folder yang berisi file video",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Folder berhasil dipilih",
            description: `Ditemukan ${videoFiles.length} video`,
          });
          onFolderSelected(videoFiles);
        }
      } else {
        // Fallback for browsers that don't support Directory API
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'video/*';
        input.webkitdirectory = true;
        
        input.onchange = (event) => {
          const files = Array.from((event.target as HTMLInputElement).files || []);
          const videoFiles = files.filter(file => file.type.startsWith('video/'));
          
          if (videoFiles.length === 0) {
            toast({
              title: "Tidak ada video ditemukan",
              description: "Pilih folder yang berisi file video",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Folder berhasil dipilih",
              description: `Ditemukan ${videoFiles.length} video`,
            });
            onFolderSelected(videoFiles);
          }
        };
        
        input.click();
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Gagal memilih folder",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-card to-background">
      <Card className="video-container p-8 max-w-md w-full text-center animate-slide-up">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4 animate-pulse-glow">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Local Clip Shuffle
          </h1>
          <p className="text-muted-foreground">
            Pilih folder yang berisi video untuk memulai
          </p>
        </div>
        
        <Button 
          variant="tiktok" 
          size="lg" 
          className="w-full animate-float"
          onClick={handleFolderSelect}
          disabled={isLoading}
        >
          <FolderOpen className="w-5 h-5 mr-2" />
          {isLoading ? "Memproses..." : "Pilih Folder Video"}
        </Button>
        
        <div className="mt-6 text-xs text-muted-foreground">
          <p>Format yang didukung:</p>
          <p>MP4, MOV, AVI, MKV, WebM, M4V</p>
        </div>
      </Card>
    </div>
  );
};