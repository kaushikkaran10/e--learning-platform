import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative rounded-xl overflow-hidden bg-gradient-to-r from-primary to-accent mb-8">
      <div className="absolute inset-0 opacity-10 bg-pattern"></div>
      <div className="relative max-w-5xl mx-auto px-4 py-12 md:py-16 lg:py-20 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Expand your skills and advance your career
          </h1>
          <p className="text-lg opacity-90 mb-8">
            Access over 5,000 courses from top instructors and industry experts. Start learning today!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/courses">
              <Button size="lg" variant="default" className="bg-white text-primary hover:bg-gray-100">
                Explore Courses
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white">
                Join for Free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
