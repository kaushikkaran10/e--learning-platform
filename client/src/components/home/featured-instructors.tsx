import InstructorCard from "@/components/instructor/instructor-card";

const instructors = [
  {
    id: 1,
    fullName: "Dr. Andrew Williams",
    specialty: "Web Development Expert",
    rating: 4.8,
    studentCount: 125430,
    courseCount: 12,
    bio: "Dr. Williams is a renowned web development expert with over 10 years of experience teaching programming.",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 2,
    fullName: "Sarah Johnson, PhD",
    specialty: "Data Science & AI",
    rating: 4.9,
    studentCount: 94212,
    courseCount: 8,
    bio: "AI researcher and data scientist with a passion for making complex topics accessible to everyone.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 3,
    fullName: "Mark Anderson",
    specialty: "Digital Marketing Strategist",
    rating: 4.7,
    studentCount: 78350,
    courseCount: 5,
    bio: "Former marketing director with expertise in SEO, social media marketing, and digital advertising.",
    avatarUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  },
  {
    id: 4,
    fullName: "Emma Rodriguez",
    specialty: "UI/UX Design Expert",
    rating: 4.6,
    studentCount: 62185,
    courseCount: 7,
    bio: "Award-winning designer helping students master Figma, Adobe XD, and UI/UX principles.",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  }
];

export default function FeaturedInstructors() {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Instructors</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {instructors.map((instructor) => (
          <InstructorCard
            key={instructor.id}
            instructor={instructor}
            rating={instructor.rating}
            studentCount={instructor.studentCount}
            courseCount={instructor.courseCount}
            specialty={instructor.specialty}
          />
        ))}
      </div>
    </section>
  );
}
