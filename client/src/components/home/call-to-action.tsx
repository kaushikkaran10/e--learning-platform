import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="bg-gradient-to-r from-primary to-accent rounded-xl overflow-hidden shadow-lg mb-8">
      <div className="px-6 py-8 md:py-12 text-white relative">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Become an instructor</h2>
          <p className="text-white text-opacity-90 mb-6">
            Share your expertise with students around the world. Create courses, build your reputation, and earn revenue while making a difference in students' lives.
          </p>
          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/instructor/dashboard">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 border-2 border-white shadow-md transition-all hover:shadow-lg text-lg px-8 py-6 font-semibold"
              >
                Start Teaching Today
              </Button>
            </Link>
            <button className="text-white font-medium hover:underline flex items-center">
              Learn more 
              <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
