import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-accent mb-8">
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 lg:py-20 text-white">
        <div className="max-w-2xl">
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
            <Link href="/auth">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600 shadow-md transition-all hover:shadow-lg text-lg px-8 py-6 font-semibold"
              >
                Join for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
