import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import PageLayout from "@/components/layout/page-layout";
import CourseProgressCard from "@/components/course/course-progress-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Clock, AlertTriangle } from "lucide-react";

export default function MyLearningPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch user enrollments
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Filter courses based on search term and active tab
  const filteredEnrollments = enrollments?.filter((enrollment) => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by tab
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "in-progress") {
      return matchesSearch && enrollment.progress > 0 && enrollment.progress < 100;
    } else if (activeTab === "completed") {
      return matchesSearch && enrollment.progress === 100;
    } else if (activeTab === "not-started") {
      return matchesSearch && enrollment.progress === 0;
    }
    
    return matchesSearch;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied through the filter above
  };

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          
          <form onSubmit={handleSearch} className="max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search your courses"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
        </div>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="not-started">Not Started</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-300 h-48"></div>
                    <div className="p-6 md:w-2/3 space-y-4">
                      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-300 rounded w-full"></div>
                      <div className="h-10 bg-gray-300 rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <CourseProgressCard
                key={enrollment.id}
                course={enrollment.course}
                progress={enrollment.progress}
                instructorName={enrollment.instructorName}
                instructorAvatar={enrollment.instructorAvatar}
                nextLecture={enrollment.nextLecture}
                timeRemaining={enrollment.timeRemaining || `${Math.ceil((100 - enrollment.progress) / 10)} hours left`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm border border-gray-200">
            {enrollments && enrollments.length === 0 ? (
              <>
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">You're not enrolled in any courses yet</h2>
                <p className="text-gray-600 mb-6">Start your learning journey today by exploring our courses</p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </>
            ) : (
              <>
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-medium text-gray-900 mb-2">No courses match your search</h2>
                <p className="text-gray-600 mb-6">Try adjusting your search or browse all your courses</p>
                <Button variant="outline" onClick={() => setSearchTerm("")}>Clear Search</Button>
              </>
            )}
          </div>
        )}
        
        <div className="mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start">
                <Clock className="h-10 w-10 text-primary mr-4 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-medium mb-2">Learning Tips</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      Set aside time each day for learning to build a consistent habit.
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      Take notes while watching lectures to improve retention.
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      Practice what you learn with exercises and personal projects.
                    </li>
                    <li className="flex items-start">
                      <span className="font-medium mr-2">•</span>
                      Join course discussions to engage with other learners.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
