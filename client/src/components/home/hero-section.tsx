import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function HeroSection() {
  const { user } = useAuth();
  const isInstructor = user?.role === "instructor";

  return (
    <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-accent mb-8">
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 lg:py-20 text-white">
        <div className="max-w-2xl">
          {isInstructor ? (
            // Instructor-specific banner content
            <>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Share your expertise & empower students
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Create engaging courses and build your teaching reputation on eduNest!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/instructor/dashboard">
                  <Button 
                    size="lg" 
                    variant="default" 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl text-lg px-8 py-6 font-semibold"
                  >
                    Create a Course
                  </Button>
                </Link>
                <Link href="/instructor/dashboard">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600 shadow-md transition-all hover:shadow-lg text-lg px-8 py-6 font-semibold"
                  >
                    Manage Courses
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <span className="text-white text-sm font-medium">Inspire students around the world</span>
                </div>
                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full flex items-center">
                  <span className="text-white text-sm font-medium">Earn recognition for your expertise</span>
                </div>
              </div>
            </>
          ) : (
            // Default banner content for students and non-logged in users
            <>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Master new skills & boost your career
              </h1>
              <p className="text-lg opacity-90 mb-8">
                Learn from experts today!
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/courses">
                  <Button 
                    size="lg" 
                    variant="default" 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition-all hover:shadow-xl text-lg px-8 py-6 font-semibold"
                  >
                    Explore Courses
                  </Button>
                </Link>
                {!user && (
                  <Link href="/auth">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600 shadow-md transition-all hover:shadow-lg text-lg px-8 py-6 font-semibold"
                    >
                      Join for Free
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
