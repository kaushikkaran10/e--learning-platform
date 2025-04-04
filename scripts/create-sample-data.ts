import { storage } from '../server/storage';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function createSampleData() {
  try {
    console.log('Starting to create sample data...');
    
    // Create instructor
    const existingInstructor = await storage.getUserByUsername('instructor');
    
    let instructor;
    if (existingInstructor) {
      console.log('Instructor already exists:', existingInstructor.username);
      instructor = existingInstructor;
    } else {
      const hashedPassword = await hashPassword('instructor123');
      instructor = await storage.createUser({
        username: 'instructor',
        password: hashedPassword,
        email: 'instructor@example.com',
        fullName: 'John Smith',
        bio: 'Experienced educator with 10+ years in teaching computer science',
        avatarUrl: 'https://randomuser.me/api/portraits/men/42.jpg',
        role: 'instructor'
      });
      console.log('Instructor created successfully:', instructor.username);
    }
    
    // Create some courses
    const existingCourses = await storage.getCourses({ instructorId: instructor.id });
    
    if (existingCourses.length > 0) {
      console.log(`Found ${existingCourses.length} existing courses for instructor`);
    } else {
      const courses = [
        {
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript for building modern websites.',
          imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
          instructorId: instructor.id,
          category: 'Web Development',
          subcategory: 'Frontend',
          price: 49.99,
          level: 'beginner',
          totalLectures: 20,
          totalDuration: 600,
          status: 'published'
        },
        {
          title: 'Advanced React Programming',
          description: 'Master React hooks, context API, Redux, and advanced patterns for building scalable applications.',
          imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
          instructorId: instructor.id,
          category: 'Web Development',
          subcategory: 'React',
          price: 89.99,
          level: 'advanced',
          totalLectures: 30,
          totalDuration: 900,
          status: 'published'
        },
        {
          title: 'Node.js Backend Development',
          description: 'Build fast and scalable server-side applications with Node.js and Express.',
          imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479',
          instructorId: instructor.id,
          category: 'Web Development',
          subcategory: 'Backend',
          price: 79.99,
          level: 'intermediate',
          totalLectures: 25,
          totalDuration: 750,
          status: 'published'
        }
      ];
      
      for (const courseData of courses) {
        const course = await storage.createCourse(courseData);
        console.log('Course created:', course.title);
        
        // Create course sections
        if (course.title === 'Introduction to Web Development') {
          const sections = [
            { courseId: course.id, title: 'HTML Fundamentals', order: 1 },
            { courseId: course.id, title: 'CSS Styling', order: 2 },
            { courseId: course.id, title: 'JavaScript Basics', order: 3 }
          ];
          
          for (const sectionData of sections) {
            const section = await storage.createSection(sectionData);
            console.log('  Section created:', section.title);
            
            // Create lectures for the first section
            if (section.title === 'HTML Fundamentals') {
              const lectures = [
                { 
                  sectionId: section.id, 
                  title: 'Introduction to HTML', 
                  description: 'Learn about HTML tags and structure',
                  videoUrl: 'https://example.com/videos/intro-html',
                  duration: 15,
                  order: 1
                },
                { 
                  sectionId: section.id, 
                  title: 'HTML Elements and Attributes', 
                  description: 'Understanding the building blocks of web pages',
                  videoUrl: 'https://example.com/videos/html-elements',
                  duration: 20,
                  order: 2
                }
              ];
              
              for (const lectureData of lectures) {
                const lecture = await storage.createLecture(lectureData);
                console.log('    Lecture created:', lecture.title);
              }
            }
          }
        }
      }
    }
    
    // Create a student
    const existingStudent = await storage.getUserByUsername('student');
    
    let student;
    if (existingStudent) {
      console.log('Student already exists:', existingStudent.username);
      student = existingStudent;
    } else {
      const hashedPassword = await hashPassword('student123');
      student = await storage.createUser({
        username: 'student',
        password: hashedPassword,
        email: 'student@example.com',
        fullName: 'Jane Doe',
        bio: 'Learning to code to change my career',
        avatarUrl: 'https://randomuser.me/api/portraits/women/36.jpg',
        role: 'student'
      });
      console.log('Student created successfully:', student.username);
    }
    
    // Enroll student in first course
    const courses = await storage.getCourses({ instructorId: instructor.id });
    if (courses.length > 0) {
      const firstCourse = courses[0];
      const existingEnrollment = await storage.getEnrollment(student.id, firstCourse.id);
      
      if (existingEnrollment) {
        console.log('Student already enrolled in course:', firstCourse.title);
      } else {
        const enrollment = await storage.createEnrollment({
          userId: student.id,
          courseId: firstCourse.id
        });
        console.log('Enrolled student in course:', firstCourse.title);
      }
    }
    
    console.log('Sample data creation complete!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData();