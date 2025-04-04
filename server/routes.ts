import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { 
  insertCourseSchema, 
  insertSectionSchema, 
  insertLectureSchema,
  insertEnrollmentSchema, 
  insertLectureProgressSchema,
  insertReviewSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // === Course routes ===

  // Get all courses with optional filtering
  app.get("/api/courses", async (req, res) => {
    try {
      const { category, search, instructorId } = req.query;
      const options: {
        category?: string;
        search?: string;
        instructorId?: number;
      } = {};

      if (category && typeof category === "string") {
        options.category = category;
      }

      if (search && typeof search === "string") {
        options.search = search;
      }

      if (instructorId && typeof instructorId === "string") {
        options.instructorId = parseInt(instructorId);
      }

      const courses = await storage.getCourses(options);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get a specific course with its sections and lectures
  app.get("/api/courses/:id", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const sections = await storage.getSectionsByCourseId(courseId);
      const sectionsWithLectures = await Promise.all(
        sections.map(async (section) => {
          const lectures = await storage.getLecturesBySectionId(section.id);
          return { ...section, lectures };
        })
      );

      const instructor = await storage.getUser(course.instructorId);
      const instructorInfo = instructor ? {
        id: instructor.id,
        fullName: instructor.fullName,
        bio: instructor.bio,
        avatarUrl: instructor.avatarUrl
      } : null;

      res.json({
        ...course,
        sections: sectionsWithLectures,
        instructor: instructorInfo
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course details" });
    }
  });

  // Create a new course (instructor only)
  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create courses" });
    }

    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        instructorId: req.user.id
      });

      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid course data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Update a course (instructor only)
  app.patch("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can update courses" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only update your own courses" });
      }

      const updatedCourse = await storage.updateCourse(courseId, req.body);
      res.json(updatedCourse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  // === Section routes ===

  // Create a new section (instructor only)
  app.post("/api/sections", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create sections" });
    }

    try {
      const sectionData = insertSectionSchema.parse(req.body);
      
      // Check if course exists and belongs to instructor
      const course = await storage.getCourse(sectionData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only add sections to your own courses" });
      }

      const section = await storage.createSection(sectionData);
      res.status(201).json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid section data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create section" });
    }
  });

  // === Lecture routes ===

  // Create a new lecture (instructor only)
  app.post("/api/lectures", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create lectures" });
    }

    try {
      const lectureData = insertLectureSchema.parse(req.body);
      
      // Check if section exists
      const section = await storage.getSectionsByCourseId(lectureData.sectionId);
      if (section.length === 0) {
        return res.status(404).json({ message: "Section not found" });
      }
      
      // Check if course belongs to instructor
      const course = await storage.getCourse(section[0].courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only add lectures to your own courses" });
      }

      const lecture = await storage.createLecture(lectureData);
      res.status(201).json(lecture);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lecture data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create lecture" });
    }
  });

  // Get a specific lecture
  app.get("/api/lectures/:id", async (req, res) => {
    try {
      const lectureId = parseInt(req.params.id);
      const lecture = await storage.getLecture(lectureId);

      if (!lecture) {
        return res.status(404).json({ message: "Lecture not found" });
      }

      res.json(lecture);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lecture" });
    }
  });

  // === Enrollment routes ===

  // Get current user's enrollments
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const enrollments = await storage.getEnrollmentsByUserId(req.user.id);
      
      // Get course details for each enrollment
      const enrollmentsWithCourses = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await storage.getCourse(enrollment.courseId);
          return { ...enrollment, course };
        })
      );

      res.json(enrollmentsWithCourses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Enroll in a course
  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user.id
      });

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(
        enrollmentData.userId,
        enrollmentData.courseId
      );

      if (existingEnrollment) {
        return res.status(400).json({ message: "Already enrolled in this course" });
      }

      // Check if course exists
      const course = await storage.getCourse(enrollmentData.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const enrollment = await storage.createEnrollment(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid enrollment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  // === Progress tracking routes ===

  // Update lecture progress
  app.post("/api/progress", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { enrollmentId, lectureId, completed } = req.body;
      
      // Verify enrollment belongs to user
      const enrollment = await storage.getEnrollmentById(enrollmentId);
      if (!enrollment || enrollment.userId !== req.user.id) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
      
      // Check if progress record exists
      let progress = await storage.getLectureProgress(enrollmentId, lectureId);
      
      if (progress) {
        // Update existing progress
        progress = await storage.updateLectureProgress(progress.id, completed);
      } else {
        // Create new progress record
        const progressData = insertLectureProgressSchema.parse({
          enrollmentId,
          lectureId,
          completed
        });
        
        progress = await storage.createLectureProgress(progressData);
      }
      
      // Update overall course progress
      const course = await storage.getCourse(enrollment.courseId);
      if (course) {
        const sections = await storage.getSectionsByCourseId(course.id);
        let totalLectures = 0;
        let completedLectures = 0;
        
        for (const section of sections) {
          const lectures = await storage.getLecturesBySectionId(section.id);
          totalLectures += lectures.length;
          
          for (const lecture of lectures) {
            const lectureProgress = await storage.getLectureProgress(enrollment.id, lecture.id);
            if (lectureProgress && lectureProgress.completed) {
              completedLectures++;
            }
          }
        }
        
        const progressPercentage = Math.round((completedLectures / totalLectures) * 100) || 0;
        await storage.updateEnrollmentProgress(enrollment.id, progressPercentage);
      }
      
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // === Review routes ===

  // Get reviews for a course
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const reviews = await storage.getReviewsByCourseId(courseId);
      
      // Get user info for each review
      const reviewsWithUsers = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          return { 
            ...review, 
            user: user ? {
              id: user.id,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl
            } : null 
          };
        })
      );
      
      res.json(reviewsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Add a review for a course
  app.post("/api/courses/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is enrolled in the course
      const enrollment = await storage.getEnrollment(req.user.id, courseId);
      if (!enrollment) {
        return res.status(403).json({ message: "You must be enrolled in the course to leave a review" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        courseId
      });
      
      const review = await storage.createReview(reviewData);
      
      // Get user info for the review
      const user = await storage.getUser(review.userId);
      const reviewWithUser = { 
        ...review, 
        user: {
          id: user!.id,
          fullName: user!.fullName,
          avatarUrl: user!.avatarUrl
        }
      };
      
      res.status(201).json(reviewWithUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
