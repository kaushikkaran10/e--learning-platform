import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  onComplete?: () => void;
}

export default function VideoPlayer({ videoUrl, title, onComplete }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Effect to hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMovement = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMovement);
    
    return () => {
      document.removeEventListener('mousemove', handleMovement);
      clearTimeout(timeout);
    };
  }, [isPlaying]);
  
  // Load video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
      
      // Check if video completed
      if (video.currentTime >= video.duration * 0.9 && onComplete) {
        onComplete();
      }
    };
    
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [onComplete]);
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };
  
  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };
  
  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black rounded-lg"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full"
        onClick={togglePlay}
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Video Title Overlay */}
      <div className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="text-white font-medium">{title}</h3>
      </div>
      
      {/* Video Controls */}
      <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress Bar */}
        <div className="mb-2">
          <Slider
            value={[progress]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={togglePlay}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </Button>
            
            <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={skipBackward}>
              <SkipBack size={18} />
            </Button>
            
            <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={skipForward}>
              <SkipForward size={18} />
            </Button>
            
            <div className="flex items-center space-x-2 ml-2">
              <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={toggleMute}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </Button>
              
              <div className="w-24 hidden sm:block">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>
            </div>
            
            <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="icon" variant="ghost" className="text-white h-8 w-8">
              <Settings size={18} />
            </Button>
            
            <Button size="icon" variant="ghost" className="text-white h-8 w-8" onClick={toggleFullscreen}>
              <Maximize size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Play/Pause Big Button in center */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <div className="bg-primary/80 rounded-full p-5">
            <Play size={32} className="text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
