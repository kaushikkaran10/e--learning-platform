import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Course } from "@shared/schema";
import PageLayout from "@/components/layout/page-layout";
import CourseCard from "@/components/course/course-card";
import CourseFilter from "@/components/course/course-filter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FluidSpinner } from "@/components/ui/fluid-spinner";
import { ThemedSkeleton } from "@/components/ui/themed-spinner";

export default function CoursesPage() {
  const search = useSearch();
  const [filters, setFilters] = useState({
    category: "",
    subcategory: "",
    level: "",
    search: "",
    free: false,
    priceRange: [0, 100]
  });
  
  // Parse URL search params to set initial filters
  useEffect(() => {
    const params = new URLSearchParams(search);
    const newFilters = { ...filters };
    
    if (params.has("category")) {
      newFilters.category = params.get("category") || "";
    }
    
    if (params.has("subcategory")) {
      newFilters.subcategory = params.get("subcategory") || "";
    }
    
    if (params.has("level")) {
      newFilters.level = params.get("level") || "";
    }
    
    if (params.has("search")) {
      newFilters.search = params.get("search") || "";
    }
    
    if (params.has("free")) {
      newFilters.free = params.get("free") === "true";
    }
    
    setFilters(newFilters);
  }, [search]);

  // Fetch courses with filters
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", filters],
    enabled: true,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
  };

  // Determine page title based on filters
  const getPageTitle = () => {
    if (filters.search) {
      return `Search results for "${filters.search}"`;
    } else if (filters.category) {
      return filters.subcategory 
        ? `${filters.subcategory} - ${filters.category} Courses` 
        : `${filters.category} Courses`;
    } else {
      return "All Courses";
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="newest">Newest</TabsTrigger>
              <TabsTrigger value="popular">Most Popular</TabsTrigger>
              <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <CourseFilter onFilterChange={handleFilterChange} />
          </div>
          
          {/* Course list */}
          <div className="flex-1">
            {isLoading ? (
              <>
                <div className="flex flex-col items-center justify-center p-8">
                  <FluidSpinner 
                    theme="book" 
                    size={80} 
                    text="Loading course catalog..." 
                    className="mb-10"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Themed loading skeletons */}
                  {Array(6).fill(0).map((_, i) => {
                    // Randomly select a theme for each card to make it more playful
                    const themes = ["book", "pencil", "science", "math", "art", "code", "graduate", "lightbulb"];
                    const randomTheme = themes[Math.floor(Math.random() * themes.length)] as any;
                    
                    return (
                      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <ThemedSkeleton theme={randomTheme} className="h-40" />
                        <div className="p-4 space-y-3">
                          <ThemedSkeleton theme={randomTheme} className="h-4 rounded" />
                          <ThemedSkeleton theme={randomTheme} className="h-8 rounded" />
                          <ThemedSkeleton theme={randomTheme} className="h-4 rounded w-3/4" />
                          <ThemedSkeleton theme={randomTheme} className="h-10 rounded" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : courses && courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    // In a real application, this would be fetched from the API
                    instructorName="Instructor Name"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-gray-500 mb-4">
                  We couldn't find any courses matching your criteria.
                </p>
                <button 
                  onClick={() => setFilters({
                    category: "",
                    subcategory: "",
                    level: "",
                    search: "",
                    free: false,
                    priceRange: [0, 100]
                  })}
                  className="text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
