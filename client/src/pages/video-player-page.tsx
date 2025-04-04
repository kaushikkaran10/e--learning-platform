import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, ChevronLeft, Settings, PlayCircle, PauseCircle, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function VideoPlayerPage() {
  const { courseId, lectureId } = useParams<{ courseId: string, lectureId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State for video player
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  
  // Fetch lecture details
  const {
    data: lecture,
    isLoading: isLoadingLecture,
    error: lectureError,
  } = useQuery({
    queryKey: [`/api/lectures/${lectureId}`],
    enabled: !!lectureId,
  });
  
  // Fetch course structure and progress
  const {
    data: courseProgress,
    isLoading: isLoadingProgress,
    error: progressError,
  } = useQuery({
    queryKey: [`/api/courses/${courseId}/progress`],
    enabled: !!courseId,
  });
  
  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ completed, lastWatchedPosition }: { completed: boolean, lastWatchedPosition: number }) => {
      const res = await apiRequest("POST", `/api/lectures/${lectureId}/progress`, {
        completed,
        lastWatchedPosition,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/courses/${courseId}/progress`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Initialize video with saved progress
  useEffect(() => {
    if (courseProgress && lectureId) {
      // Find the current lecture in the course progress data
      for (const section of courseProgress.sections) {
        for (const item of section.lectures) {
          if (item.lecture.id === parseInt(lectureId)) {
            if (videoRef.current && item.progress?.lastWatchedPosition) {
              videoRef.current.currentTime = item.progress.lastWatchedPosition;
              setCurrentTime(item.progress.lastWatchedPosition);
            }
            // Set the active section in the sidebar
            setActiveSection(section.section.id);
            break;
          }
        }
      }
    }
  }, [courseProgress, lectureId]);
  
  // Handle video events
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Save progress every 10 seconds
      if (Math.floor(videoRef.current.currentTime) % 10 === 0) {
        updateProgressMutation.mutate({
          completed: false,
          lastWatchedPosition: Math.floor(videoRef.current.currentTime),
        });
      }
      
      // Mark as completed when 95% watched
      const completionThreshold = videoRef.current.duration * 0.95;
      if (videoRef.current.currentTime >= completionThreshold) {
        updateProgressMutation.mutate({
          completed: true,
          lastWatchedPosition: Math.floor(videoRef.current.currentTime),
        });
      }
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };
  
  const handleEnded = () => {
    setPlaying(false);
    updateProgressMutation.mutate({
      completed: true,
      lastWatchedPosition: Math.floor(duration),
    });
    
    // Find and navigate to the next lecture
    if (courseProgress) {
      let foundCurrent = false;
      let nextLectureId = null;
      
      for (const section of courseProgress.sections) {
        for (const item of section.lectures) {
          if (foundCurrent) {
            nextLectureId = item.lecture.id;
            break;
          }
          if (item.lecture.id === parseInt(lectureId)) {
            foundCurrent = true;
          }
        }
        if (nextLectureId) break;
      }
      
      if (nextLectureId) {
        // Delay navigation to allow progress update to complete
        setTimeout(() => {
          navigate(`/courses/${courseId}/learn/${nextLectureId}`);
        }, 1000);
      }
    }
  };
  
  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };
  
  const handleSeek = (newTime: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume[0];
      setVolume(newVolume[0]);
      if (newVolume[0] === 0) {
        setMuted(true);
      } else {
        setMuted(false);
      }
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };
  
  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };
  
  // Navigate to a specific lecture
  const navigateToLecture = (lectureId: number) => {
    // Save current progress before navigating
    if (videoRef.current) {
      updateProgressMutation.mutate({
        completed: false,
        lastWatchedPosition: Math.floor(videoRef.current.currentTime),
      });
    }
    
    navigate(`/courses/${courseId}/learn/${lectureId}`);
  };
  
  // Toggle section in the sidebar
  const toggleSection = (sectionId: number) => {
    if (activeSection === sectionId) {
      setActiveSection(null);
    } else {
      setActiveSection(sectionId);
    }
  };
  
  if (isLoadingLecture || isLoadingProgress) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (lectureError || progressError || !lecture) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Failed to load lecture</h2>
          <p className="mb-6">There was an error loading this lecture. Please try again.</p>
          <Button onClick={() => navigate(`/courses/${courseId}`)}>
            Return to Course
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-white mr-4 hover:text-gray-300"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-white font-medium truncate">{lecture.title}</h1>
        </div>
        <div>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <div className="w-full max-w-4xl mx-auto px-4 relative">
            <div className="w-full h-0 pb-[56.25%] relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              )}
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full"
                src={lecture.videoUrl || undefined}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlaying={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={handleEnded}
              >
                Your browser does not support video playback.
              </video>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-gray-900/70 p-2 rounded-lg">
                  <Slider
                    value={[currentTime]}
                    max={duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="w-full h-1 mb-2"
                  />
                  <div className="flex items-center justify-between text-white text-sm">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={togglePlay}
                      >
                        {playing ? (
                          <PauseCircle className="h-6 w-6" />
                        ) : (
                          <PlayCircle className="h-6 w-6" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={toggleMute}
                      >
                        {muted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="w-20">
                        <Slider
                          value={[muted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="h-1"
                        />
                      </div>
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Curriculum */}
        <div className="w-80 bg-gray-800 text-white overflow-y-auto hidden lg:block">
          <div className="p-4 border-b border-gray-700">
            <h3 className="font-medium">Course Content</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {courseProgress?.sections.map((sectionData) => (
              <div 
                key={sectionData.section.id} 
                className={activeSection === sectionData.section.id ? "bg-gray-700" : ""}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleSection(sectionData.section.id)}
                >
                  <h4 className="font-medium mb-1">
                    {sectionData.section.orderIndex}. {sectionData.section.title}
                  </h4>
                  <div className="text-sm text-gray-400">
                    {sectionData.lectures.length} lectures • 
                    {' '}
                    {formatTime(
                      sectionData.lectures.reduce((total, l) => total + l.lecture.duration, 0)
                    )}
                  </div>
                </div>
                
                {activeSection === sectionData.section.id && (
                  <ul>
                    {sectionData.lectures.map((lectureData) => {
                      const isCurrentLecture = lectureData.lecture.id === parseInt(lectureId);
                      const isCompleted = lectureData.progress?.completed;
                      
                      return (
                        <li 
                          key={lectureData.lecture.id}
                          className={`border-b border-gray-700 ${isCurrentLecture ? 'bg-gray-600' : ''}`}
                        >
                          <div 
                            className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-600/50"
                            onClick={() => navigateToLecture(lectureData.lecture.id)}
                          >
                            <div className="flex items-center">
                              {lectureData.lecture.lectureType === 'video' ? (
                                <PlayCircle className={`mr-3 h-5 w-5 ${isCurrentLecture ? 'text-primary' : 'text-gray-500'}`} />
                              ) : (
                                <i className={`fas fa-file-alt mr-3 ${isCurrentLecture ? 'text-primary' : 'text-gray-500'}`}></i>
                              )}
                              <span className={isCurrentLecture ? 'text-primary' : ''}>
                                {lectureData.lecture.title}
                              </span>
                            </div>
                            <div className="flex items-center">
                              {isCompleted && (
                                <span className="mr-2 text-xs bg-green-800 text-green-100 px-1.5 py-0.5 rounded-full">
                                  ✓
                                </span>
                              )}
                              <span className="text-sm text-gray-400">
                                {formatTime(lectureData.lecture.duration)}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
