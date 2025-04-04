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
          price: 0,
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
          price: 0,
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
          price: 0,
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
    
    // Create an admin
    const existingAdmin = await storage.getUserByUsername('admin');
    
    let admin;
    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.username);
      admin = existingAdmin;
    } else {
      const hashedPassword = await hashPassword('admin123');
      admin = await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
        fullName: 'Admin User',
        bio: 'Platform administrator',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        role: 'admin'
      });
      console.log('Admin created successfully:', admin.username);
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
      
      // Create assignments for the first course
      const assignments = await storage.getAssignmentsByCourseId(firstCourse.id);
      if (assignments.length === 0) {
        // Add an assignment
        const assignment = await storage.createAssignment({
          courseId: firstCourse.id,
          title: 'Build a Personal Portfolio Page',
          description: 'Create a personal portfolio page using HTML, CSS, and basic JavaScript. The page should include your bio, education, skills, and a contact form.',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
          totalPoints: 100,
          assignmentType: 'project',
          attachmentUrl: 'https://example.com/assignment-resources/portfolio-instructions.pdf'
        });
        console.log('Assignment created:', assignment.title);
        
        // Add a quiz assignment
        const quizAssignment = await storage.createAssignment({
          courseId: firstCourse.id,
          title: 'HTML Fundamentals Quiz',
          description: 'Test your knowledge of HTML fundamentals with this quiz.',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          totalPoints: 50,
          assignmentType: 'quiz'
        });
        console.log('Quiz assignment created:', quizAssignment.title);
        
        // Add quiz questions
        const questions = [
          {
            assignmentId: quizAssignment.id,
            questionText: 'Which HTML tag is used to create a hyperlink?',
            options: JSON.stringify(['<a>', '<link>', '<href>', '<url>']),
            correctAnswer: '<a>',
            points: 10
          },
          {
            assignmentId: quizAssignment.id,
            questionText: 'Which of the following is NOT a semantic HTML5 tag?',
            options: JSON.stringify(['<div>', '<article>', '<section>', '<header>']),
            correctAnswer: '<div>',
            points: 10
          },
          {
            assignmentId: quizAssignment.id,
            questionText: 'What does HTML stand for?',
            options: JSON.stringify([
              'Hyper Text Markup Language',
              'Hyperlinks and Text Markup Language',
              'Home Tool Markup Language',
              'Hyper Technology Modern Language'
            ]),
            correctAnswer: 'Hyper Text Markup Language',
            points: 10
          },
          {
            assignmentId: quizAssignment.id,
            questionText: 'Which attribute is used to specify an alternate text for an image if it cannot be displayed?',
            options: JSON.stringify(['alt', 'title', 'src', 'href']),
            correctAnswer: 'alt',
            points: 10
          },
          {
            assignmentId: quizAssignment.id,
            questionText: 'Which HTML element defines the title of a document?',
            options: JSON.stringify(['<title>', '<head>', '<meta>', '<header>']),
            correctAnswer: '<title>',
            points: 10
          }
        ];
        
        for (const questionData of questions) {
          const quizQuestion = await storage.createQuizQuestion(questionData);
          console.log('Quiz question created:', quizQuestion.questionText.substring(0, 30) + '...');
        }
      } else {
        console.log('Assignments already exist for course:', firstCourse.title);
      }
    }
    
    console.log('Sample data creation complete!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

createSampleData();