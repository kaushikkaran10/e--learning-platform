import { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCourseSchema, 
  insertSectionSchema, 
  insertLectureSchema, 
  insertEnrollmentSchema, 
  insertProgressSchema, 
  insertReviewSchema,
  insertTestimonialSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isInstructor(req, res, next) {
  if (req.isAuthenticated() && req.user.role === "instructor") {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Instructor role required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // =========== Categories API ===========
  
  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Get a specific category
  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Error fetching category" });
    }
  });

  // =========== Courses API ===========
  
  // Get all courses
  app.get("/api/courses", async (req, res) => {
    try {
      let courses;
      
      if (req.query.category) {
        courses = await storage.getCoursesByCategory(parseInt(req.query.category as string));
      } else if (req.query.instructor) {
        courses = await storage.getCoursesByInstructor(parseInt(req.query.instructor as string));
      } else if (req.query.search) {
        courses = await storage.searchCourses(req.query.search as string);
      } else {
        courses = await storage.getAllCourses();
      }
      
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  // Get a specific course
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  // Create a new course (instructors only)
  app.post("/api/courses", isInstructor, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        instructorId: req.user.id // Set the current user as instructor
      });
      
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error creating course" });
    }
  });

  // =========== Sections API ===========
  
  // Get sections for a course
  app.get("/api/courses/:courseId/sections", async (req, res) => {
    try {
      const sections = await storage.getSectionsByCourse(parseInt(req.params.courseId));
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sections" });
    }
  });

  // Create a section for a course (instructors only)
  app.post("/api/courses/:courseId/sections", isInstructor, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Verify course exists and belongs to the instructor
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only add sections to your own courses" });
      }
      
      // Get current sections to determine order
      const sections = await storage.getSectionsByCourse(courseId);
      const orderIndex = sections.length > 0 ? Math.max(...sections.map(s => s.orderIndex)) + 1 : 1;
      
      const sectionData = insertSectionSchema.parse({
        ...req.body,
        courseId,
        orderIndex
      });
      
      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error creating section" });
    }
  });

  // =========== Lectures API ===========
  
  // Get lectures for a section
  app.get("/api/sections/:sectionId/lectures", async (req, res) => {
    try {
      const lectures = await storage.getLecturesBySection(parseInt(req.params.sectionId));
      res.json(lectures);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lectures" });
    }
  });

  // Create a lecture for a section (instructors only)
  app.post("/api/sections/:sectionId/lectures", isInstructor, async (req, res) => {
    try {
      const sectionId = parseInt(req.params.sectionId);
      
      // Verify section exists
      const section = await storage.getSection(sectionId);
      if (!section) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Verify course belongs to instructor
      const course = await storage.getCourse(section.courseId);
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only add lectures to your own courses" });
      }
      
      // Get current lectures to determine order
      const lectures = await storage.getLecturesBySection(sectionId);
      const orderIndex = lectures.length > 0 ? Math.max(...lectures.map(l => l.orderIndex)) + 1 : 1;
      
      const lectureData = insertLectureSchema.parse({
        ...req.body,
        sectionId,
        orderIndex
      });
      
      const lecture = await storage.createLecture(lectureData);
      res.status(201).json(lecture);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error creating lecture" });
    }
  });

  // Get a specific lecture
  app.get("/api/lectures/:id", isAuthenticated, async (req, res) => {
    try {
      const lecture = await storage.getLecture(parseInt(req.params.id));
      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }
      
      // Get the section and course to verify enrollment
      const section = await storage.getSection(lecture.sectionId);
      
      // Check if user is instructor of the course
      const course = await storage.getCourse(section.courseId);
      const isInstructor = course.instructorId === req.user.id;
      
      // If not instructor, check enrollment
      if (!isInstructor) {
        const enrollment = await storage.getEnrollmentByCourseAndUser(section.courseId, req.user.id);
        if (!enrollment) {
          return res.status(403).json({ message: "You must be enrolled in this course to view this lecture" });
        }
      }
      
      res.json(lecture);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lecture" });
    }
  });

  // =========== Enrollments API ===========
  
  // Get user's enrolled courses
  app.get("/api/enrollments", isAuthenticated, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByUser(req.user.id);
      
      // Get full course details for each enrollment
      const enrolledCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return {
            enrollment,
            course
          };
        })
      );
      
      res.json(enrolledCourses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  });

  // Enroll in a course
  app.post("/api/courses/:courseId/enroll", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollmentByCourseAndUser(courseId, req.user.id);
      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }
      
      const enrollmentData = insertEnrollmentSchema.parse({
        userId: req.user.id,
        courseId
      });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error enrolling in course" });
    }
  });

  // =========== Progress API ===========
  
  // Update progress for a lecture
  app.post("/api/lectures/:lectureId/progress", isAuthenticated, async (req, res) => {
    try {
      const lectureId = parseInt(req.params.lectureId);
      const { lastWatchedPosition, completed } = req.body;
      
      // Verify lecture exists
      const lecture = await storage.getLecture(lectureId);
      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }
      
      // Get section and course to verify enrollment
      const section = await storage.getSection(lecture.sectionId);
      const enrollment = await storage.getEnrollmentByCourseAndUser(section.courseId, req.user.id);
      
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in this course to track progress" });
      }
      
      // Check if progress record exists
      let progress = await storage.getProgressByUserAndLecture(req.user.id, lectureId);
      
      if (progress) {
        // Update existing progress
        progress = await storage.updateProgress(progress.id, {
          lastWatchedPosition,
          completed,
        });
      } else {
        // Create new progress record
        const progressData = insertProgressSchema.parse({
          userId: req.user.id,
          lectureId
        });
        
        progress = await storage.createProgress(progressData);
        
        // Update with the provided data
        progress = await storage.updateProgress(progress.id, {
          lastWatchedPosition,
          completed,
        });
      }
      
      // Update course progress percentage
      // Get all lectures for the course
      const sections = await storage.getSectionsByCourse(section.courseId);
      let totalLectures = 0;
      let completedLectures = 0;
      
      for (const sect of sections) {
        const lectures = await storage.getLecturesBySection(sect.id);
        totalLectures += lectures.length;
        
        for (const lect of lectures) {
          const prog = await storage.getProgressByUserAndLecture(req.user.id, lect.id);
          if (prog && prog.completed) {
            completedLectures++;
          }
        }
      }
      
      const progressPercent = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
      const isCompleted = progressPercent === 100;
      
      // Update enrollment progress
      await storage.updateEnrollment(enrollment.id, {
        progressPercent,
        completed: isCompleted
      });
      
      res.json(progress);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error updating progress" });
    }
  });

  // Get progress for a course
  app.get("/api/courses/:courseId/progress", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Verify enrollment
      const enrollment = await storage.getEnrollmentByCourseAndUser(courseId, req.user.id);
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in this course to view progress" });
      }
      
      // Get all sections and lectures
      const sections = await storage.getSectionsByCourse(courseId);
      const courseProgress = [];
      
      for (const section of sections) {
        const lectures = await storage.getLecturesBySection(section.id);
        const lectureProgress = [];
        
        for (const lecture of lectures) {
          const progress = await storage.getProgressByUserAndLecture(req.user.id, lecture.id);
          lectureProgress.push({
            lecture,
            progress: progress || { completed: false, lastWatchedPosition: 0 }
          });
        }
        
        courseProgress.push({
          section,
          lectures: lectureProgress
        });
      }
      
      res.json({
        enrollment,
        sections: courseProgress
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching progress" });
    }
  });

  // =========== Reviews API ===========
  
  // Get reviews for a course
  app.get("/api/courses/:courseId/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const reviews = await storage.getReviewsByCourse(courseId);
      
      // Add user details to reviews
      const reviewsWithUser = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return {
            ...review,
            user: user ? {
              id: user.id,
              name: user.name,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(reviewsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  // Add a review to a course
  app.post("/api/courses/:courseId/reviews", isAuthenticated, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      
      // Verify course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Verify user is enrolled
      const enrollment = await storage.getEnrollmentByCourseAndUser(courseId, req.user.id);
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in a course to review it" });
      }
      
      // Check if user already reviewed this course
      const existingReview = await storage.getReviewByUserAndCourse(req.user.id, courseId);
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this course" });
      }
      
      const reviewData = insertReviewSchema.parse({
        userId: req.user.id,
        courseId,
        rating: req.body.rating,
        comment: req.body.comment
      });
      
      const review = await storage.createReview(reviewData);
      
      // Add user details to review response
      const reviewWithUser = {
        ...review,
        user: {
          id: req.user.id,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl
        }
      };
      
      res.status(201).json(reviewWithUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Error creating review" });
    }
  });

  // =========== Testimonials API ===========
  
  // Get featured testimonials
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getFeaturedTestimonials();
      
      // Add user details to testimonials
      const testimonialsWithUser = await Promise.all(
        testimonials.map(async (testimonial) => {
          const user = await storage.getUser(testimonial.userId);
          return {
            ...testimonial,
            user: user ? {
              id: user.id,
              name: user.name,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(testimonialsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Error fetching testimonials" });
    }
  });

  // =========== Instructors API ===========
  
  // Get all instructors
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getAllInstructors();
      
      // Remove sensitive data
      const instructorsData = instructors.map(({ password, ...instructor }) => instructor);
      
      res.json(instructorsData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching instructors" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
