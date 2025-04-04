import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCourseSchema } from "@shared/schema";
import PageLayout from "@/components/layout/page-layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  PlusCircle, 
  Users, 
  BookOpen, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Loader2, 
  ChartBarStacked,
  ChevronRight
} from "lucide-react";
import { z } from "zod";

export default function InstructorDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Redirect if not an instructor
  useEffect(() => {
    if (user && user.role !== "instructor") {
      setLocation("/");
      toast({
        title: "Access denied",
        description: "Only instructors can access this dashboard",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch instructor courses
  const { data: courses, isLoading: isLoadingCourses } = useQuery({
    queryKey: ["/api/courses", { instructorId: user?.id }],
    enabled: !!user && user.role === "instructor",
  });

  // Create course form
  const courseForm = useForm<z.infer<typeof insertCourseSchema>>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      instructorId: user?.id,
      category: "",
      subcategory: "",
      price: 0,
      level: "Beginner",
      totalLectures: 0,
      totalDuration: 0,
    },
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertCourseSchema>) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Course created successfully",
        description: "Your new course has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setActiveTab("courses");
      courseForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateCourseSubmit = (values: z.infer<typeof insertCourseSchema>) => {
    createCourseMutation.mutate({
      ...values,
      instructorId: user!.id,
      totalLectures: parseInt(values.totalLectures.toString()),
      totalDuration: parseInt(values.totalDuration.toString()),
      price: 0, // All courses are free
    });
  };

  // Simple dashboard stats
  const stats = {
    totalStudents: courses?.reduce((acc: number, course: any) => acc + (course.studentCount || 0), 0) || 0,
    totalCourses: courses?.length || 0,
    totalLectures: courses?.reduce((acc: number, course: any) => acc + (course.totalLectures || 0), 0) || 0,
    averageRating: courses?.reduce((acc: number, course: any) => acc + course.rating, 0) / (courses?.length || 1) || 0,
  };

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Instructor Portal</h1>
            <p className="text-gray-600">Create and manage your courses, assignments, and student progress</p>
          </div>
          <Button 
            onClick={() => setActiveTab("create")} 
            className="mt-4 md:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="dashboard">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="create">Create Course</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Overview */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Students</p>
                      <p className="text-3xl font-bold">{stats.totalStudents.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Courses</p>
                      <p className="text-3xl font-bold">{stats.totalCourses}</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Lectures</p>
                      <p className="text-3xl font-bold">{stats.totalLectures.toLocaleString()}</p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Avg. Rating</p>
                      <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</p>
                    </div>
                    <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Activity Chart */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Course Activity Overview</CardTitle>
                  <CardDescription>Student enrollments over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <ChartBarStacked className="h-16 w-16 text-gray-300" />
                    <p className="ml-4 text-gray-500">Enrollment data visualization will appear here</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Top performing courses */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Courses</CardTitle>
                  <CardDescription>Based on enrollments this month</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCourses ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">Loading courses...</p>
                    </div>
                  ) : courses && (courses as any[]).length > 0 ? (
                    <ul className="space-y-4">
                      {(courses as any[]).slice(0, 3).map((course: any) => (
                        <li key={course.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{course.title}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Users className="h-3.5 w-3.5 mr-1" />
                              <span>{course.studentCount || 0} students</span>
                            </div>
                          </div>
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No courses found</p>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <Button variant="ghost" size="sm" className="w-full text-primary justify-between" onClick={() => setActiveTab("courses")}>
                    View all courses
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* My Courses */}
          <TabsContent value="courses">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Courses</h2>
                <Button onClick={() => setActiveTab("create")}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Course
                </Button>
              </div>
              
              {isLoadingCourses ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="flex p-6">
                          <div className="w-32 h-24 bg-gray-200 rounded mr-6"></div>
                          <div className="flex-1">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                          <div className="w-24 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses && (courses as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(courses as any[]).map((course: any) => (
                    <Card key={course.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row items-center sm:items-stretch">
                          <div className="w-full sm:w-48 h-32 bg-gray-200">
                            <img 
                              src={course.imageUrl || "https://images.unsplash.com/photo-1580894894513-541e068a3e2b"} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 p-6">
                            <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
                            <div className="flex items-center mb-2 text-sm text-gray-500">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                              <span>{course.rating.toFixed(1)}</span>
                              <span className="mx-2">•</span>
                              <Users className="h-4 w-4 mr-1" />
                              <span>{course.studentCount || 0} students</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-1">{course.description}</p>
                            <div className="flex gap-2">
                              <Link href={`/courses/${course.id}`}>
                                <Button variant="outline" size="sm">View</Button>
                              </Link>
                              <Button variant="outline" size="sm">Edit</Button>
                              <Link href={`/instructor/course/${course.id}/curriculum`}>
                                <Button variant="outline" size="sm">Manage Content</Button>
                              </Link>
                            </div>
                          </div>
                          <div className="p-6 bg-gray-50 flex flex-col justify-center items-center">
                            <p className="text-lg font-bold mb-1">{course.totalLectures} lectures</p>
                            <p className="text-sm text-gray-500">{course.level}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 bg-gray-50 rounded-lg">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                  <p className="text-gray-600 mb-6">Start creating your first course to share your knowledge</p>
                  <Button onClick={() => setActiveTab("create")}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Create Course */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Create New Course</CardTitle>
                <CardDescription>Fill in the details to create your new course</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...courseForm}>
                  <form onSubmit={courseForm.handleSubmit(onCreateCourseSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={courseForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter course title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Programming">Programming</SelectItem>
                                <SelectItem value="Data Science">Data Science</SelectItem>
                                <SelectItem value="Design">Design</SelectItem>
                                <SelectItem value="Marketing">Marketing</SelectItem>
                                <SelectItem value="Business">Business</SelectItem>
                                <SelectItem value="Photography">Photography</SelectItem>
                                <SelectItem value="Music">Music</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="subcategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subcategory</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter subcategory (optional)" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <input type="hidden" name="price" value="0" />
                      
                      <FormField
                        control={courseForm.control}
                        name="level"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Difficulty Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="All levels">All Levels</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="totalLectures"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Lectures</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter total lectures" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="totalDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter total duration in minutes" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={courseForm.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Course Image URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter image URL" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={courseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter a detailed description of your course"
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => courseForm.reset()}
                      >
                        Reset
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createCourseMutation.isPending}
                      >
                        {createCourseMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Course...
                          </>
                        ) : (
                          "Create Course"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
