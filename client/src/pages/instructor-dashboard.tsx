import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  BookOpen,
  Edit,
  Loader2,
  PlusCircle,
  Users,
} from "lucide-react";

// Form schema for creating a new course
const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  price: z.string().min(1, "Price is required"),
  level: z.string().min(1, "Please select a level"),
  durationHours: z.string().min(1, "Duration is required"),
  thumbnailUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form handling
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      price: "",
      level: "",
      durationHours: "",
      thumbnailUrl: "",
    },
  });

  // Fetch instructor's courses
  const {
    data: courses,
    isLoading: isLoadingCourses,
    error: coursesError,
  } = useQuery({
    queryKey: [`/api/courses?instructor=${user?.id}`],
    enabled: !!user,
  });

  // Fetch all categories for the select input
  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormValues) => {
      const formattedData = {
        ...data,
        price: parseFloat(data.price),
        durationHours: parseInt(data.durationHours),
        categoryId: parseInt(data.categoryId),
      };
      
      const res = await apiRequest("POST", "/api/courses", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Course created",
        description: "Your course has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/courses?instructor=${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create course",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CourseFormValues) => {
    createCourseMutation.mutate(values);
  };

  // Function to handle dialog close (reset form)
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setIsCreateDialogOpen(open);
  };

  // Check if user is an instructor
  if (user && user.role !== "instructor") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Instructor Access Required</h2>
            <p className="text-gray-600 mb-6 text-center max-w-lg">
              This dashboard is only available to instructors. If you'd like to become an instructor,
              please contact our support team.
            </p>
            <Button onClick={() => navigate("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoadingCourses) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">Failed to load your courses. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your courses and track student progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={isCreateDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details below to create a new course.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter course description" 
                            className="resize-none min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {isLoadingCategories ? (
                                <div className="flex justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                              ) : (
                                categories?.map((category) => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.id.toString()}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Level</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Beginner">Beginner</SelectItem>
                              <SelectItem value="Intermediate">Intermediate</SelectItem>
                              <SelectItem value="Advanced">Advanced</SelectItem>
                              <SelectItem value="All Levels">All Levels</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              step="0.01"
                              placeholder="29.99" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="durationHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (Hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              placeholder="10" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createCourseMutation.isPending}
                    >
                      {createCourseMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Course
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="p-3 rounded-full bg-primary/10 mr-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <h3 className="text-2xl font-bold">{courses?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold">
                {courses?.reduce((total, course) => total + course.totalStudents, 0) || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <i className="fas fa-star h-6 w-6 text-yellow-500 flex items-center justify-center"></i>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Rating</p>
              <h3 className="text-2xl font-bold">
                {courses && courses.length > 0
                  ? (
                      courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length
                    ).toFixed(1)
                  : "N/A"}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course list */}
      <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
      {courses?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-6">You haven't created any courses yet.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses?.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48 flex-shrink-0">
                  <img 
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div>
                      <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <span className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs mr-2">
                          {course.level}
                        </span>
                        <span className="mr-2">•</span>
                        <span>{course.durationHours} hours</span>
                        <span className="mx-2">•</span>
                        <span>${course.price.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-700 mb-4 line-clamp-2">{course.description}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="flex items-center mb-2">
                        <Users className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{course.totalStudents} students</span>
                      </div>
                      <div className="flex items-center mb-4">
                        <i className="fas fa-star text-yellow-400 mr-1"></i>
                        <span className="text-sm text-gray-600">
                          {course.averageRating.toFixed(1)} ({course.ratingCount} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      View Course
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Student Progress
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
