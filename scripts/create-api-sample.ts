import fetch from 'node-fetch';

async function loginAsInstructor() {
  const loginResponse = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'instructor',
      password: 'instructor123'
    }),
    credentials: 'include'
  });
  
  if (!loginResponse.ok) {
    const error = await loginResponse.text();
    throw new Error(`Login failed: ${error}`);
  }
  
  const userData = await loginResponse.json();
  const cookies = loginResponse.headers.get('set-cookie') || '';
  
  return { userData, cookies };
}

async function createCourse(cookies: string) {
  const courseResponse = await fetch('http://localhost:5000/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      title: 'Introduction to Web Development',
      description: 'Learn the basics of HTML, CSS, and JavaScript for building modern websites.',
      category: 'Web Development',
      subcategory: 'Frontend',
      price: 0, // Free course
      level: 'beginner',
      imageUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
      totalLectures: 20,
      totalDuration: 600,
      status: 'published'
    })
  });
  
  if (!courseResponse.ok) {
    const error = await courseResponse.text();
    throw new Error(`Failed to create course: ${error}`);
  }
  
  return await courseResponse.json();
}

async function createSection(courseId: number, cookies: string) {
  const sectionResponse = await fetch('http://localhost:5000/api/sections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      courseId,
      title: 'HTML Fundamentals',
      order: 1
    })
  });
  
  if (!sectionResponse.ok) {
    const error = await sectionResponse.text();
    throw new Error(`Failed to create section: ${error}`);
  }
  
  return await sectionResponse.json();
}

async function createLecture(sectionId: number, cookies: string) {
  const lectureResponse = await fetch('http://localhost:5000/api/lectures', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      sectionId,
      title: 'Introduction to HTML',
      description: 'Learn about HTML tags and structure',
      videoUrl: 'https://example.com/videos/intro-html',
      duration: 15,
      order: 1
    })
  });
  
  if (!lectureResponse.ok) {
    const error = await lectureResponse.text();
    throw new Error(`Failed to create lecture: ${error}`);
  }
  
  return await lectureResponse.json();
}

async function createAssignment(courseId: number, cookies: string) {
  const assignmentResponse = await fetch(`http://localhost:5000/api/courses/${courseId}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    },
    body: JSON.stringify({
      title: 'HTML Webpage Assignment',
      description: 'Create a basic HTML webpage with proper structure and semantic elements.',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
      maxScore: 100,
      type: 'project'
    })
  });
  
  if (!assignmentResponse.ok) {
    const error = await assignmentResponse.text();
    throw new Error(`Failed to create assignment: ${error}`);
  }
  
  return await assignmentResponse.json();
}

async function main() {
  try {
    console.log('Creating sample data via API...');
    
    // Register instructor if doesn't exist
    try {
      await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'instructor',
          password: 'instructor123',
          email: 'instructor@example.com',
          fullName: 'Demo Instructor',
          role: 'instructor'
        })
      });
      console.log('Instructor registered successfully');
    } catch (error) {
      console.log('Instructor might already exist:', error);
    }
    
    // Login as instructor
    const { userData, cookies } = await loginAsInstructor();
    console.log('Logged in as:', userData.username);
    
    // Create a course
    const course = await createCourse(cookies);
    console.log('Course created:', course.title, 'with ID:', course.id);
    
    // Create a section
    const section = await createSection(course.id, cookies);
    console.log('Section created:', section.title, 'with ID:', section.id);
    
    // Create a lecture
    const lecture = await createLecture(section.id, cookies);
    console.log('Lecture created:', lecture.title, 'with ID:', lecture.id);
    
    // Create an assignment
    const assignment = await createAssignment(course.id, cookies);
    console.log('Assignment created:', assignment.title, 'with ID:', assignment.id);
    
    console.log('Sample data creation via API complete!');
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

main();