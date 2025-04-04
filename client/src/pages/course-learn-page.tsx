import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from "@/components/course/video-player";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { 
  Menu,
  Play,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Clock,
  BookOpen,
  MessageSquare,
  HelpCircle
} from "lucide-react";

export default function CourseLearnPage() {
  const [, params] = useRoute("/learn/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeLectureId, setActiveLectureId] = useState<number | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);

  // Fetch course details with sections and lectures
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch enrollment and progress data
  const { data: enrollment, isLoading: isLoadingEnrollment } = useQuery({
    queryKey: [`/api/enrollments`, courseId],
    enabled: !!courseId && !!user,
  });

  // Set active lecture based on URL or first lecture
  useEffect(() => {
    if (course && course.sections && course.sections.length > 0) {
      // Get lecture ID from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const lectureId = urlParams.get('lecture');
      
      if (lectureId) {
        setActiveLectureId(parseInt(lectureId));
        
        // Find section that contains this lecture
        for (const section of course.sections) {
          if (section.lectures && section.lectures.some(l => l.id === parseInt(lectureId))) {
            setActiveSectionId(section.id);
            break;
          }
        }
      } else {
        // Default to first lecture in first section
        const firstSection = course.sections[0];
        setActiveSectionId(firstSection.id);
        
        if (firstSection.lectures && firstSection.lectures.length > 0) {
          setActiveLectureId(firstSection.lectures[0].id);
        }
      }
    }
  }, [course]);

  // Mark lecture as completed mutation
  const completeLectureMutation = useMutation({
    mutationFn: async (lectureId: number) => {
      if (!enrollment) return null;
      
      const res = await apiRequest("POST", "/api/progress", {
        enrollmentId: enrollment.id,
        lectureId,
        completed: true
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/enrollments`] });
      toast({
        title: "Progress saved",
        description: "This lecture has been marked as completed",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle lecture completion
  const handleLectureComplete = () => {
    if (activeLectureId) {
      completeLectureMutation.mutate(activeLectureId);
    }
  };

  // Handle lecture navigation
  const navigateToLecture = (lectureId: number, sectionId: number) => {
    setActiveLectureId(lectureId);
    setActiveSectionId(sectionId);
    
    // Update URL without refreshing
    const url = new URL(window.location.href);
    url.searchParams.set('lecture', lectureId.toString());
    window.history.pushState({}, '', url.toString());
  };

  // Find current lecture and section
  const getCurrentLecture = () => {
    if (!course || !activeLectureId) return null;
    
    for (const section of course.sections || []) {
      for (const lecture of section.lectures || []) {
        if (lecture.id === activeLectureId) {
          return lecture;
        }
      }
    }
    return null;
  };

  const getCurrentSection = () => {
    if (!course || !activeSectionId) return null;
    
    for (const section of course.sections || []) {
      if (section.id === activeSectionId) {
        return section;
      }
    }
    return null;
  };

  // Find next and previous lectures
  const getAdjacentLectures = () => {
    if (!course || !activeLectureId) return { next: null, prev: null };
    
    let found = false;
    let prev = null;
    let next = null;
    
    for (const section of course.sections || []) {
      for (const lecture of section.lectures || []) {
        if (found) {
          next = { lecture, sectionId: section.id };
          break;
        }
        
        if (lecture.id === activeLectureId) {
          found = true;
        } else {
          prev = { lecture, sectionId: section.id };
        }
      }
      if (next) break;
    }
    
    return { next, prev };
  };
  
  const currentLecture = getCurrentLecture();
  const currentSection = getCurrentSection();
  const { next, prev } = getAdjacentLectures();

  // Check if lecture is completed
  const isLectureCompleted = (lectureId: number) => {
    if (!enrollment || !enrollment.lectureProgress) return false;
    
    return enrollment.lectureProgress.some(
      progress => progress.lectureId === lectureId && progress.completed
    );
  };

  if (isLoadingCourse || isLoadingEnrollment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your course...</p>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-6">You are not enrolled in this course or it doesn't exist.</p>
          <Button onClick={() => setLocation("/courses")}>Browse Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Course Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{course.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">Your progress: {enrollment.progress}%</span>
            <Progress value={enrollment.progress} className="w-32" />
            
            <Button variant="outline" size="sm" onClick={() => setLocation(`/courses/${courseId}`)}>
              Course Home
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Curriculum */}
        <aside className={`border-r bg-gray-50 flex-shrink-0 overflow-y-auto ${isSidebarOpen ? 'w-80' : 'w-0'}`}>
          <div className="p-4">
            <h2 className="font-medium mb-4">Course Content</h2>
            
            <div className="mb-4">
              <Progress value={enrollment.progress} className="mb-1" />
              <div className="text-sm text-gray-600">
                {enrollment.progress}% complete
              </div>
            </div>
            
            <Accordion type="multiple" defaultValue={[activeSectionId?.toString() || ""]} className="w-full">
              {course.sections?.map((section, idx) => (
                <AccordionItem key={section.id} value={section.id.toString()}>
                  <AccordionTrigger className="py-3 px-4 hover:bg-gray-100">
                    <div className="text-left">
                      <div className="font-medium">Section {idx + 1}: {section.title}</div>
                      <div className="text-xs text-gray-500">
                        {section.lectures?.length || 0} lectures • {section.lectures?.reduce((acc, lecture) => acc + lecture.duration, 0) || 0} min
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-0">
                    <ul>
                      {section.lectures?.map((lecture) => {
                        const isActive = lecture.id === activeLectureId;
                        const isCompleted = isLectureCompleted(lecture.id);
                        
                        return (
                          <li 
                            key={lecture.id} 
                            className={`py-2 px-4 text-sm border-l-2 cursor-pointer ${
                              isActive 
                                ? 'border-primary bg-blue-50 font-medium' 
                                : isCompleted 
                                  ? 'border-green-500 hover:bg-gray-100' 
                                  : 'border-transparent hover:bg-gray-100'
                            }`}
                            onClick={() => navigateToLecture(lecture.id, section.id)}
                          >
                            <div className="flex items-center">
                              {isCompleted ? (
                                <Check className="h-4 w-4 mr-2 text-green-500" />
                              ) : (
                                <Play className={`h-4 w-4 mr-2 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                              )}
                              <span>{lecture.title}</span>
                            </div>
                            <div className="text-xs text-gray-500 pl-6">
                              {lecture.duration} min
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          {currentLecture ? (
            <>
              {/* Video Player */}
              <div className="flex-1 min-h-0">
                <VideoPlayer 
                  src={currentLecture.videoUrl} 
                  title={currentLecture.title}
                  onComplete={handleLectureComplete}
                />
              </div>
              
              {/* Lecture Info & Navigation */}
              <div className="p-6 border-t">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-1">{currentLecture.title}</h2>
                  {currentSection && (
                    <p className="text-sm text-gray-600">
                      From: {currentSection.title}
                    </p>
                  )}
                </div>
                
                {currentLecture.description && (
                  <div className="mb-6 text-gray-700">
                    <p>{currentLecture.description}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex gap-3">
                    {currentLecture.fileUrl ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={currentLecture.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download Resources
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        No Resources
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Discussion
                    </Button>
                    <Button variant="outline" size="sm">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Q&A
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    {prev && (
                      <Button 
                        variant="outline"
                        onClick={() => navigateToLecture(prev.lecture.id, prev.sectionId)}
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                    )}
                    
                    {!isLectureCompleted(currentLecture.id) && (
                      <Button onClick={handleLectureComplete}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Completed
                      </Button>
                    )}
                    
                    {next && (
                      <Button
                        onClick={() => navigateToLecture(next.lecture.id, next.sectionId)}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md p-8">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No lecture selected</h2>
                <p className="text-gray-600 mb-4">Please select a lecture from the course curriculum to start learning.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
