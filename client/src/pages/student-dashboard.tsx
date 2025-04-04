import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertCircle,
  BookOpen,
  Check,
  Clock,
  Loader2,
  PlayCircle,
  Trophy,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch user's enrolled courses
  const {
    data: enrollments,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  if (isLoadingEnrollments) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (enrollmentsError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-6">Failed to load your enrolled courses. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group enrollments by progress
  const inProgress = enrollments?.filter(
    (enrollment) => enrollment.enrollment.progressPercent > 0 && enrollment.enrollment.progressPercent < 100
  ) || [];
  
  const completed = enrollments?.filter(
    (enrollment) => enrollment.enrollment.completed
  ) || [];
  
  const notStarted = enrollments?.filter(
    (enrollment) => enrollment.enrollment.progressPercent === 0
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Learning</h1>
          <p className="text-gray-600 mt-1">Track your progress and continue learning</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/courses")}>
            Browse More Courses
          </Button>
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
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <h3 className="text-2xl font-bold">{enrollments?.length || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <h3 className="text-2xl font-bold">{inProgress.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center pt-6">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold">{completed.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course lists */}
      {enrollments?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">No courses yet</h2>
            <p className="text-gray-600 mb-6">You haven't enrolled in any courses yet.</p>
            <Button onClick={() => navigate("/courses")}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="in-progress" className="space-y-8">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {/* In Progress Courses */}
          <TabsContent value="in-progress">
            {inProgress.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Clock className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No courses in progress</h2>
                  <p className="text-gray-600 mb-2">
                    {notStarted.length > 0 
                      ? "You have courses waiting to be started."
                      : "Enroll in a course to begin learning."}
                  </p>
                  {notStarted.length > 0 ? (
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="not-started"]')?.click()}>
                      View Not Started Courses
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/courses")}>
                      Browse Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {inProgress.map((item) => (
                  <Card key={item.enrollment.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <img 
                        src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                        alt={item.course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="font-bold text-lg">{item.course.title}</h3>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-sm font-medium">{Math.round(item.enrollment.progressPercent)}%</p>
                      </div>
                      <Progress value={item.enrollment.progressPercent} className="h-2" />
                      <div className="flex justify-between mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/courses/${item.course.id}`)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Course Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Navigate to the first incomplete lecture
                            navigate(`/courses/${item.course.id}`);
                          }}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Continue
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Not Started Courses */}
          <TabsContent value="not-started">
            {notStarted.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <BookOpen className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No pending courses</h2>
                  <p className="text-gray-600 mb-6">You've started all your enrolled courses.</p>
                  <Button onClick={() => navigate("/courses")}>
                    Browse More Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {notStarted.map((item) => (
                  <Card key={item.enrollment.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <img 
                        src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                        alt={item.course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="font-bold text-lg">{item.course.title}</h3>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="text-sm text-gray-600">Not started yet</p>
                      </div>
                      <Progress value={0} className="h-2" />
                      <div className="flex justify-between mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/courses/${item.course.id}`)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Course Details
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => {
                            // Navigate to the first lecture
                            navigate(`/courses/${item.course.id}`);
                          }}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Start Learning
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Completed Courses */}
          <TabsContent value="completed">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Trophy className="h-10 w-10 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">No completed courses yet</h2>
                  <p className="text-gray-600 mb-6">
                    {inProgress.length > 0 
                      ? "Keep learning to complete your courses."
                      : "Start learning to achieve your first completion."}
                  </p>
                  {inProgress.length > 0 ? (
                    <Button variant="outline" onClick={() => document.querySelector('[data-value="in-progress"]')?.click()}>
                      View In-Progress Courses
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/courses")}>
                      Browse Courses
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completed.map((item) => (
                  <Card key={item.enrollment.id} className="overflow-hidden">
                    <div className="relative h-40">
                      <img 
                        src={item.course.thumbnailUrl || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"} 
                        alt={item.course.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-4 text-white">
                          <h3 className="font-bold text-lg">{item.course.title}</h3>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        <Check className="mr-1 h-3 w-3" />
                        Completed
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-600">Progress</p>
                        <p className="text-sm font-medium">100%</p>
                      </div>
                      <Progress value={100} className="h-2" />
                      <div className="flex justify-between mt-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/courses/${item.course.id}`)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Course Details
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to the first lecture for review
                            navigate(`/courses/${item.course.id}`);
                          }}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Review Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
