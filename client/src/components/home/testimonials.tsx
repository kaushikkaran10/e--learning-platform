import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "John Cooper",
    role: "Software Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The Complete Web Development Bootcamp completely changed my career trajectory. I went from a retail job to a full-stack developer in just 6 months. The course content was comprehensive and the instructor was always available to answer questions.",
    rating: 5,
    course: "Complete Web Development Bootcamp 2023"
  },
  {
    id: 2,
    name: "Rebecca Wong",
    role: "Marketing Manager",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "The Digital Marketing Mastery course helped me take our company's online presence to the next level. The strategies I learned allowed us to increase our organic traffic by 215% and double our conversion rates. Highly recommended for any marketing professional.",
    rating: 5,
    course: "Digital Marketing Mastery: SEO, Social Media & More"
  }
];

export default function Testimonials() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Success Stories</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-6">
            <div className="flex items-center mb-4">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={testimonial.image} alt={testimonial.name} />
                <AvatarFallback>{testimonial.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={i < testimonial.rating ? "fill-yellow-500" : ""} size={16} />
                ))}
              </div>
            </div>
            <blockquote className="text-gray-700 mb-4">
              "{testimonial.content}"
            </blockquote>
            <div className="text-sm text-gray-500 flex items-center">
              <span>Course: </span>
              <a href="#" className="ml-1 text-primary hover:underline">{testimonial.course}</a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
