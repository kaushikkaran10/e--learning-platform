import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertLectureSchema, insertSectionSchema, insertQuizQuestionSchema } from "@shared/schema";
import PageLayout from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Loader2, 
  PlusCircle, 
  Trash2, 
  FileText, 
  Video as VideoIcon, 
  Edit, 
  X,
  CheckCircle,
  AlertCircle,
  ListPlus,
  ListChecks,
  Book
} from "lucide-react";

// Create custom schemas with validation
const lectureFormSchema = insertLectureSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  videoUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  duration: z.number().min(1, "Duration must be greater than 0"),
});

const sectionFormSchema = insertSectionSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const quizQuestionSchema = insertQuizQuestionSchema.extend({
  questionText: z.string().min(3, "Question must be at least 3 characters"),
  options: z.array(z.string()).min(2, "You must provide at least 2 options"),
  correctOption: z.number().min(0, "You must select a correct answer"),
});

const assignmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  dueDate: z.string().min(1, "You must provide a due date"),
  courseId: z.number(),
  maxScore: z.number().min(1, "Maximum score must be greater than 0"),
  fileUrl: z.string().optional(),
});

export default function CourseManagePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sections");
  
  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course");
      return res.json();
    },
  });

  // Fetch course sections
  const { 
    data: sections = [], 
    isLoading: isLoadingSections 
  } = useQuery({
    queryKey: ["/api/courses", courseId, "sections"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/sections`);
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });

  // Fetch course lectures
  const { 
    data: lectures = [], 
    isLoading: isLoadingLectures 
  } = useQuery({
    queryKey: ["/api/courses", courseId, "lectures"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/lectures`);
      if (!res.ok) throw new Error("Failed to fetch lectures");
      return res.json();
    },
  });

  // Fetch course assignments
  const { 
    data: assignments = [], 
    isLoading: isLoadingAssignments 
  } = useQuery({
    queryKey: ["/api/courses", courseId, "assignments"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/assignments`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
  });

  // Check if the current user is the course instructor
  const isInstructor = user?.id === course?.instructorId;

  // Forms setup
  const sectionForm = useForm<z.infer<typeof sectionFormSchema>>({
    resolver: zodResolver(sectionFormSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: courseId,
      order: sections?.length || 0,
    },
  });

  const lectureForm = useForm<z.infer<typeof lectureFormSchema>>({
    resolver: zodResolver(lectureFormSchema),
    defaultValues: {
      title: "",
      content: "",
      videoUrl: "",
      fileUrl: "",
      order: 0,
      duration: 0,
      isPublished: true,
      sectionId: 0,
    },
  });

  const assignmentForm = useForm<z.infer<typeof assignmentSchema>>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      courseId: courseId,
      maxScore: 100,
      fileUrl: "",
    },
  });

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", ""],
    correctOption: 0,
    explanation: "",
  });
  const [selectedSection, setSelectedSection] = useState<number | null>(null);

  // Mutations
  const createSectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof sectionFormSchema>) => {
      const res = await apiRequest("POST", "/api/sections", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Section created",
        description: "Your new section has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "sections"] });
      sectionForm.reset({
        title: "",
        description: "",
        courseId: courseId,
        order: sections?.length || 0,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create section",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createLectureMutation = useMutation({
    mutationFn: async (data: z.infer<typeof lectureFormSchema>) => {
      const res = await apiRequest("POST", "/api/lectures", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Lecture created",
        description: "Your new lecture has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "lectures"] });
      lectureForm.reset({
        title: "",
        content: "",
        videoUrl: "",
        fileUrl: "",
        order: 0,
        duration: 0,
        isPublished: true,
        sectionId: selectedSection || 0,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create lecture",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof assignmentSchema>) => {
      const res = await apiRequest("POST", "/api/assignments", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Assignment created",
        description: "Your new assignment has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "assignments"] });
      assignmentForm.reset({
        title: "",
        description: "",
        dueDate: "",
        courseId: courseId,
        maxScore: 100,
        fileUrl: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create assignment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const addOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, ""]
    });
  };

  const removeOption = (index: number) => {
    const newOptions = [...currentQuestion.options];
    newOptions.splice(index, 1);
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
      correctOption: currentQuestion.correctOption >= index ? 
        Math.max(0, currentQuestion.correctOption - 1) : 
        currentQuestion.correctOption
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions
    });
  };

  const addQuestion = () => {
    if (
      currentQuestion.questionText.length < 3 || 
      currentQuestion.options.some(option => option.length < 1)
    ) {
      toast({
        title: "Invalid question",
        description: "Make sure your question and all options have content",
        variant: "destructive",
      });
      return;
    }

    setQuizQuestions([...quizQuestions, { ...currentQuestion, assignmentId: 0 }]);
    setCurrentQuestion({
      questionText: "",
      options: ["", ""],
      correctOption: 0,
      explanation: "",
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...quizQuestions];
    newQuestions.splice(index, 1);
    setQuizQuestions(newQuestions);
  };

  const handleCreateSection = (data: z.infer<typeof sectionFormSchema>) => {
    createSectionMutation.mutate(data);
  };

  const handleCreateLecture = (data: z.infer<typeof lectureFormSchema>) => {
    if (!selectedSection) {
      toast({
        title: "No section selected",
        description: "Please select a section to add this lecture to",
        variant: "destructive",
      });
      return;
    }

    createLectureMutation.mutate({
      ...data,
      sectionId: selectedSection,
      order: lectures.filter(lecture => lecture.sectionId === selectedSection).length
    });
  };

  const handleCreateAssignment = (data: z.infer<typeof assignmentSchema>) => {
    createAssignmentMutation.mutate(data);
  };

  // Effect to update selectedSection when sections load
  useEffect(() => {
    if (sections && sections.length > 0 && !selectedSection) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);
  
  if (isLoadingCourse) {
    return (
      <PageLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-2 text-xl font-semibold">Course not found</h2>
                <p className="mt-1 text-muted-foreground">
                  The course you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/instructor/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (!isInstructor) {
    return (
      <PageLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <h2 className="mt-2 text-xl font-semibold">Access Denied</h2>
                <p className="mt-1 text-muted-foreground">
                  You don't have permission to manage this course.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
            <Button asChild variant="outline">
              <Link href={`/courses/${courseId}`}>
                View Public Course Page
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="border-b">
            <TabsList className="bg-transparent -mb-px rounded-none">
              <TabsTrigger
                value="sections"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="assignments"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
              >
                Assignments & Quizzes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SECTIONS & LECTURES TAB */}
          <TabsContent value="sections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left sidebar: Sections list */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Course Sections</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span>Add</span>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingSections ? (
                      <div className="py-4 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : sections.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        <p>No sections created yet</p>
                        <p className="text-sm mt-1">Create your first section below</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {sections.map((section: any) => (
                          <div 
                            key={section.id}
                            className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
                              selectedSection === section.id 
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-secondary'
                            }`}
                            onClick={() => setSelectedSection(section.id)}
                          >
                            <div>
                              <p className="font-medium truncate">{section.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lectures.filter((l: any) => l.sectionId === section.id).length} lectures
                              </p>
                            </div>
                            {selectedSection === section.id && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Create new section form */}
                <Card className="mt-6" id="create-section">
                  <CardHeader>
                    <CardTitle>Create New Section</CardTitle>
                    <CardDescription>Add a new section to your course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...sectionForm}>
                      <form onSubmit={sectionForm.handleSubmit(handleCreateSection)} className="space-y-4">
                        <FormField
                          control={sectionForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Section Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Introduction to the Course" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={sectionForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Provide a brief overview of this section" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit"
                          className="w-full"
                          disabled={createSectionMutation.isPending}
                        >
                          {createSectionMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Create Section
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>

              {/* Right main area: Selected section lectures and forms */}
              <div className="md:col-span-2">
                {selectedSection ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {sections.find((s: any) => s.id === selectedSection)?.title} Content
                        </CardTitle>
                        <CardDescription>
                          Manage lectures for this section
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isLoadingLectures ? (
                          <div className="py-4 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {lectures
                              .filter((lecture: any) => lecture.sectionId === selectedSection)
                              .sort((a: any, b: any) => a.order - b.order)
                              .map((lecture: any, index: number) => (
                                <div key={lecture.id} className="border rounded-md p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-primary/10 rounded-full p-2">
                                        {lecture.videoUrl ? (
                                          <VideoIcon className="h-4 w-4 text-primary" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-primary" />
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-medium">{index + 1}. {lecture.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {lecture.duration} min
                                          {lecture.isPublished ? 
                                            <span className="ml-2 text-green-600">• Published</span> : 
                                            <span className="ml-2 text-orange-600">• Draft</span>
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="icon">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  {(lecture.videoUrl || lecture.fileUrl) && (
                                    <div className="mt-3 text-sm">
                                      {lecture.videoUrl && (
                                        <div className="flex items-center text-primary">
                                          <VideoIcon className="h-3 w-3 mr-1" />
                                          <span className="truncate">{lecture.videoUrl}</span>
                                        </div>
                                      )}
                                      {lecture.fileUrl && (
                                        <div className="flex items-center text-primary mt-1">
                                          <FileText className="h-3 w-3 mr-1" />
                                          <span className="truncate">{lecture.fileUrl}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            
                            {lectures.filter((l: any) => l.sectionId === selectedSection).length === 0 && (
                              <div className="text-center py-4 text-muted-foreground">
                                <FileText className="mx-auto h-8 w-8 mb-2 text-muted-foreground/60" />
                                <p>No lectures in this section yet</p>
                                <p className="text-sm mt-1">Create your first lecture below</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Create new lecture form */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle>Add New Lecture</CardTitle>
                        <CardDescription>
                          Create a new lecture for {sections.find((s: any) => s.id === selectedSection)?.title}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...lectureForm}>
                          <form onSubmit={lectureForm.handleSubmit(handleCreateLecture)} className="space-y-4">
                            <FormField
                              control={lectureForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Lecture Title</FormLabel>
                                  <FormControl>
                                    <Input placeholder="e.g. Introduction to Variables" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={lectureForm.control}
                              name="content"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Content</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      placeholder="Lecture content and notes" 
                                      className="min-h-[150px]" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={lectureForm.control}
                                name="videoUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Video URL (optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://example.com/video.mp4" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormDescription>Link to your video lecture</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={lectureForm.control}
                                name="fileUrl"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Resources/PDF URL (optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="https://example.com/resources.pdf" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormDescription>Additional materials for this lecture</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={lectureForm.control}
                                name="duration"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Duration (minutes)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        placeholder="15" 
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={lectureForm.control}
                                name="isPublished"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col mt-6">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                      />
                                      <Label htmlFor="isPublished">Publish immediately</Label>
                                    </div>
                                    <FormDescription className="ml-6">
                                      If unchecked, this lecture will be saved as a draft
                                    </FormDescription>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <Button 
                              type="submit"
                              className="w-full"
                              disabled={createLectureMutation.isPending}
                            >
                              {createLectureMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <PlusCircle className="mr-2 h-4 w-4" />
                                  Add Lecture
                                </>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <Book className="mx-auto h-12 w-12 text-muted-foreground/60" />
                        <h3 className="mt-2 text-lg font-medium">No Section Selected</h3>
                        <p className="mt-1 text-muted-foreground">
                          Select a section from the left or create a new one to manage its content
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ASSIGNMENTS & QUIZZES TAB */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignments & Quizzes</CardTitle>
                    <CardDescription>
                      Manage assessments for your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAssignments ? (
                      <div className="py-4 flex justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : assignments.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground">
                        <p>No assignments created yet</p>
                        <p className="text-sm mt-1">Create your first assignment using the form</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Accordion type="multiple" className="w-full">
                          {assignments.map((assignment: any) => (
                            <AccordionItem key={assignment.id} value={`assignment-${assignment.id}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center">
                                    {assignment.type === 'quiz' ? (
                                      <ListChecks className="h-4 w-4 mr-2 text-primary" />
                                    ) : (
                                      <FileText className="h-4 w-4 mr-2 text-primary" />
                                    )}
                                    <span>{assignment.title}</span>
                                  </div>
                                  <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                                    {assignment.type === 'quiz' ? 'Quiz' : 'Assignment'}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="p-2 text-sm">
                                  <p className="text-muted-foreground mb-2">{assignment.description}</p>
                                  <div className="flex justify-between text-xs">
                                    <span>Max Score: {assignment.maxScore}</span>
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="mt-3 flex justify-end space-x-2">
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Assignment</CardTitle>
                    <CardDescription>Add a new assignment to your course</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...assignmentForm}>
                      <form onSubmit={assignmentForm.handleSubmit(handleCreateAssignment)} className="space-y-4">
                        <FormField
                          control={assignmentForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignment Title</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Midterm Project" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={assignmentForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Assignment instructions and requirements" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={assignmentForm.control}
                            name="dueDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={assignmentForm.control}
                            name="maxScore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Maximum Score</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="100" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={assignmentForm.control}
                          name="fileUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Instructions File URL (optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/instructions.pdf" {...field} value={field.value || ''} />
                              </FormControl>
                              <FormDescription>Link to detailed assignment instructions or resources</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit"
                          className="w-full"
                          disabled={createAssignmentMutation.isPending}
                        >
                          {createAssignmentMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Create Assignment
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                {/* Quiz Creator Form */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Create Quiz Questions</CardTitle>
                    <CardDescription>
                      Add questions to your quiz assignment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Quiz question list */}
                      {quizQuestions.length > 0 && (
                        <div className="border rounded-md p-4 space-y-4">
                          <h3 className="font-medium">Quiz Questions ({quizQuestions.length})</h3>
                          <div className="space-y-3">
                            {quizQuestions.map((question, index) => (
                              <div key={index} className="border rounded-md p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">Q{index + 1}: {question.questionText}</p>
                                    <ul className="mt-2 space-y-1">
                                      {question.options.map((option: string, optIndex: number) => (
                                        <li key={optIndex} className="flex items-center text-sm">
                                          <span className={`w-4 h-4 flex-shrink-0 rounded-full mr-2 ${
                                            optIndex === question.correctOption ? 'bg-green-500' : 'bg-gray-200'
                                          }`} />
                                          {option}
                                        </li>
                                      ))}
                                    </ul>
                                    {question.explanation && (
                                      <p className="mt-2 text-xs text-muted-foreground">
                                        <span className="font-medium">Explanation:</span> {question.explanation}
                                      </p>
                                    )}
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeQuestion(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add question form */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="questionText">Question</Label>
                          <Textarea
                            id="questionText"
                            placeholder="Enter your question here"
                            value={currentQuestion.questionText}
                            onChange={(e) => setCurrentQuestion({
                              ...currentQuestion,
                              questionText: e.target.value
                            })}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label>Answer Options</Label>
                          <div className="space-y-2 mt-1">
                            {currentQuestion.options.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id={`option-${index}`}
                                  name="correctOption"
                                  checked={currentQuestion.correctOption === index}
                                  onChange={() => setCurrentQuestion({
                                    ...currentQuestion,
                                    correctOption: index
                                  })}
                                  className="h-4 w-4 text-primary focus:ring-primary"
                                />
                                <Input
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => updateOption(index, e.target.value)}
                                  className="flex-1"
                                />
                                {currentQuestion.options.length > 2 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(index)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="mt-2"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Option
                          </Button>
                        </div>

                        <div>
                          <Label htmlFor="explanation">Explanation (Optional)</Label>
                          <Textarea
                            id="explanation"
                            placeholder="Explain why the correct answer is right"
                            value={currentQuestion.explanation}
                            onChange={(e) => setCurrentQuestion({
                              ...currentQuestion,
                              explanation: e.target.value
                            })}
                            className="mt-1"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={addQuestion}
                          className="w-full"
                        >
                          <ListPlus className="mr-2 h-4 w-4" />
                          Add Question to Quiz
                        </Button>
                      </div>

                      {quizQuestions.length > 0 && (
                        <Button className="w-full" variant="default">
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Create Quiz with {quizQuestions.length} Questions
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}