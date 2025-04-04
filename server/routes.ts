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
  insertReviewSchema,
  insertAdminLogSchema,
  insertPlatformSettingSchema,
  insertCourseApprovalSchema,
  insertAssignmentSchema,
  insertSubmissionSchema,
  insertQuizQuestionSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Debug endpoint
  app.get("/api/debug", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json({ 
        courses: courses,
        users: usersWithoutPasswords,
        courseCount: courses.length,
        userCount: users.length
      });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ message: "Debug error" });
    }
  });

  // === Admin middleware ===
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // === Course routes ===

  // Get all courses with optional filtering
  app.get("/api/courses", async (req, res) => {
    try {
      const { category, search, instructorId, status } = req.query;
      const options: {
        category?: string;
        search?: string;
        instructorId?: number;
        status?: string;
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
      
      if (status && typeof status === "string") {
        options.status = status;
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

  // === Admin routes ===

  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getAllUsers(typeof role === "string" ? role : undefined);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Update user (admin only)
  app.patch("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Log the admin action
      if (req.user) {
        await storage.createAdminLog({
          adminId: req.user.id,
          action: "update_user",
          entityType: "user",
          entityId: userId,
          details: `Updated user: ${user.username}`
        });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get all enrollments (admin only)
  app.get("/api/admin/enrollments", isAdmin, async (req, res) => {
    try {
      const enrollments = await storage.getAllEnrollments();
      
      // Get user and course details for each enrollment
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          const user = await storage.getUser(enrollment.userId);
          const course = await storage.getCourse(enrollment.courseId);
          return { 
            ...enrollment, 
            user: user ? { id: user.id, username: user.username, fullName: user.fullName } : null,
            course: course ? { id: course.id, title: course.title } : null
          };
        })
      );
      
      res.json(enrichedEnrollments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Get all reviews (admin only)
  app.get("/api/admin/reviews", isAdmin, async (req, res) => {
    try {
      const reviews = await storage.getAllReviews();
      
      // Get user and course details for each review
      const enrichedReviews = await Promise.all(
        reviews.map(async (review) => {
          const user = await storage.getUser(review.userId);
          const course = await storage.getCourse(review.courseId);
          return { 
            ...review, 
            user: user ? { id: user.id, username: user.username, fullName: user.fullName } : null,
            course: course ? { id: course.id, title: course.title } : null
          };
        })
      );
      
      res.json(enrichedReviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get admin logs (admin only)
  app.get("/api/admin/logs", isAdmin, async (req, res) => {
    try {
      const { adminId, entityType, entityId } = req.query;
      
      const logs = await storage.getAdminLogs(
        adminId && typeof adminId === "string" ? parseInt(adminId) : undefined,
        entityType && typeof entityType === "string" ? entityType : undefined,
        entityId && typeof entityId === "string" ? parseInt(entityId) : undefined
      );
      
      // Get admin details for each log
      const logsWithAdminDetails = await Promise.all(
        logs.map(async (log) => {
          const admin = await storage.getUser(log.adminId);
          return {
            ...log,
            admin: admin ? { id: admin.id, username: admin.username, fullName: admin.fullName } : null
          };
        })
      );
      
      res.json(logsWithAdminDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin logs" });
    }
  });

  // Get platform settings (admin only)
  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const { category } = req.query;
      const settings = await storage.getAllPlatformSettings(
        typeof category === "string" ? category : undefined
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform settings" });
    }
  });

  // Create or update platform setting (admin only)
  app.post("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const settingData = insertPlatformSettingSchema.parse({
        ...req.body,
        updatedBy: req.user.id
      });
      
      const setting = await storage.createOrUpdatePlatformSetting(settingData);
      
      // Log the admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: "update_setting",
        entityType: "platform_setting",
        details: `Updated setting: ${setting.key}`
      });
      
      res.status(201).json(setting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid setting data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update platform setting" });
    }
  });

  // Get course approvals (admin only)
  app.get("/api/admin/course-approvals", isAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const approvals = await storage.getCourseApprovals(
        typeof status === "string" ? status : undefined
      );
      
      // Get course details for each approval
      const approvalsWithDetails = await Promise.all(
        approvals.map(async (approval) => {
          const course = await storage.getCourse(approval.courseId);
          const reviewer = approval.reviewedBy ? await storage.getUser(approval.reviewedBy) : null;
          
          return {
            ...approval,
            course: course ? {
              id: course.id,
              title: course.title,
              instructorId: course.instructorId
            } : null,
            reviewer: reviewer ? {
              id: reviewer.id,
              username: reviewer.username,
              fullName: reviewer.fullName
            } : null
          };
        })
      );
      
      res.json(approvalsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch course approvals" });
    }
  });

  // Create course approval (instructor submitting course for review)
  app.post("/api/courses/:id/submit-for-approval", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can submit courses for approval" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only submit your own courses for approval" });
      }
      
      // Check if already submitted
      const existingApproval = await storage.getCourseApproval(courseId);
      if (existingApproval) {
        return res.status(400).json({ 
          message: "Course already submitted for approval",
          status: existingApproval.status
        });
      }
      
      const approvalData = insertCourseApprovalSchema.parse({
        courseId,
        status: "pending"
      });
      
      const approval = await storage.createCourseApproval(approvalData);
      
      // Update course status
      await storage.updateCourse(courseId, { status: "pending_approval" });
      
      res.status(201).json(approval);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit course for approval" });
    }
  });

  // Update course approval (admin only)
  app.patch("/api/admin/course-approvals/:courseId", isAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const { status, feedback } = req.body;
      
      if (!status || !["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved or rejected) is required" });
      }
      
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      const approval = await storage.getCourseApproval(courseId);
      if (!approval) {
        return res.status(404).json({ message: "Course approval request not found" });
      }
      
      if (approval.status !== "pending") {
        return res.status(400).json({ message: `Course already ${approval.status}` });
      }
      
      if (!req.user) {
        return res.status(401).json({ message: "User authentication required" });
      }

      const updatedApproval = await storage.updateCourseApproval(courseId, {
        status,
        feedback: feedback || null,
        reviewedBy: req.user.id
      });
      
      // Update course status based on approval decision
      await storage.updateCourse(courseId, { 
        status: status === "approved" ? "published" : "rejected" 
      });
      
      // Log the admin action
      await storage.createAdminLog({
        adminId: req.user.id,
        action: `course_${status}`,
        entityType: "course",
        entityId: courseId,
        details: `Course ${status}: ${course.title}`
      });
      
      res.json(updatedApproval);
    } catch (error) {
      res.status(500).json({ message: "Failed to update course approval" });
    }
  });

  // Get platform statistics (admin only)
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });
  
  // === Assignment routes ===
  
  // Get assignments for a course
  app.get("/api/courses/:id/assignments", async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      // Check if user is enrolled or is the instructor
      if (req.isAuthenticated()) {
        const isInstructor = course.instructorId === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isEnrolled = await storage.getEnrollment(req.user.id, courseId);
        
        if (!isInstructor && !isAdmin && !isEnrolled) {
          return res.status(403).json({ message: "You must be enrolled in this course to view assignments" });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const assignments = await storage.getAssignmentsByCourseId(courseId);
      res.json(assignments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });
  
  // Get a specific assignment
  app.get("/api/assignments/:id", async (req, res) => {
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user is enrolled or is the instructor
      if (req.isAuthenticated()) {
        const course = await storage.getCourse(assignment.courseId);
        if (!course) {
          return res.status(404).json({ message: "Course not found" });
        }
        
        const isInstructor = course.instructorId === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isEnrolled = await storage.getEnrollment(req.user.id, assignment.courseId);
        
        if (!isInstructor && !isAdmin && !isEnrolled) {
          return res.status(403).json({ message: "You must be enrolled in this course to view assignments" });
        }
        
        // If it's a quiz, fetch the quiz questions
        if (assignment.assignmentType === "quiz") {
          const quizQuestions = await storage.getQuizQuestionsByAssignmentId(assignmentId);
          
          // Hide correct answers if the user is a student
          if (!isInstructor && !isAdmin) {
            const sanitizedQuestions = quizQuestions.map(q => ({
              ...q,
              correctAnswer: undefined
            }));
            
            return res.json({
              ...assignment,
              questions: sanitizedQuestions
            });
          }
          
          return res.json({
            ...assignment,
            questions: quizQuestions
          });
        }
      } else {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      res.json(assignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assignment" });
    }
  });
  
  // Create a new assignment (instructor only)
  app.post("/api/courses/:id/assignments", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can create assignments" });
    }
    
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists and belongs to instructor
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only add assignments to your own courses" });
      }
      
      const assignmentData = insertAssignmentSchema.parse({
        ...req.body,
        courseId
      });
      
      const assignment = await storage.createAssignment(assignmentData);
      
      // If it's a quiz, create the quiz questions
      if (assignment.assignmentType === "quiz" && req.body.questions && Array.isArray(req.body.questions)) {
        const questionPromises = req.body.questions.map((question: any, index: number) => {
          return storage.createQuizQuestion({
            assignmentId: assignment.id,
            questionText: question.questionText,
            questionType: question.questionType || "multiple_choice",
            options: question.options,
            correctAnswer: question.correctAnswer,
            points: question.points || 1,
            order: index + 1
          });
        });
        
        const questions = await Promise.all(questionPromises);
        
        res.status(201).json({
          ...assignment,
          questions
        });
      } else {
        res.status(201).json(assignment);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assignment" });
    }
  });
  
  // Update an assignment (instructor only)
  app.patch("/api/assignments/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can update assignments" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if course belongs to instructor
      const course = await storage.getCourse(assignment.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only update assignments for your own courses" });
      }
      
      const updatedAssignment = await storage.updateAssignment(assignmentId, req.body);
      res.json(updatedAssignment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update assignment" });
    }
  });
  
  // Delete an assignment (instructor only)
  app.delete("/api/assignments/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can delete assignments" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if course belongs to instructor
      const course = await storage.getCourse(assignment.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only delete assignments for your own courses" });
      }
      
      await storage.deleteAssignment(assignmentId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assignment" });
    }
  });
  
  // === Submission routes ===
  
  // Get submissions for an assignment (instructor only)
  app.get("/api/assignments/:id/submissions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if course belongs to instructor or user is admin
      const course = await storage.getCourse(assignment.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only instructors can view all submissions" });
      }
      
      const submissions = await storage.getSubmissionsByAssignmentId(assignmentId);
      
      // Get user info for each submission
      const submissionsWithUsers = await Promise.all(
        submissions.map(async (submission) => {
          const user = await storage.getUser(submission.userId);
          return { 
            ...submission, 
            user: user ? {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email
            } : null 
          };
        })
      );
      
      res.json(submissionsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });
  
  // Get current user's submission for an assignment
  app.get("/api/assignments/:id/my-submission", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user is enrolled in the course
      const isEnrolled = await storage.getEnrollment(req.user.id, assignment.courseId);
      if (!isEnrolled) {
        return res.status(403).json({ message: "You must be enrolled in this course to view assignments" });
      }
      
      const submission = await storage.getUserSubmissionForAssignment(req.user.id, assignmentId);
      if (!submission) {
        return res.status(404).json({ message: "No submission found" });
      }
      
      res.json(submission);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });
  
  // Submit an assignment
  app.post("/api/assignments/:id/submit", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const assignmentId = parseInt(req.params.id);
      const assignment = await storage.getAssignment(assignmentId);
      
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if user is enrolled in the course
      const isEnrolled = await storage.getEnrollment(req.user.id, assignment.courseId);
      if (!isEnrolled) {
        return res.status(403).json({ message: "You must be enrolled in this course to submit assignments" });
      }
      
      // Check if assignment is already submitted
      const existingSubmission = await storage.getUserSubmissionForAssignment(req.user.id, assignmentId);
      if (existingSubmission) {
        return res.status(400).json({ message: "You have already submitted this assignment" });
      }
      
      const submissionData = insertSubmissionSchema.parse({
        ...req.body,
        userId: req.user.id,
        assignmentId
      });
      
      const submission = await storage.createSubmission(submissionData);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });
  
  // Grade a submission (instructor only)
  app.post("/api/submissions/:id/grade", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "instructor") {
      return res.status(403).json({ message: "Only instructors can grade submissions" });
    }
    
    try {
      const submissionId = parseInt(req.params.id);
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const assignment = await storage.getAssignment(submission.assignmentId);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }
      
      // Check if course belongs to instructor
      const course = await storage.getCourse(assignment.courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      if (course.instructorId !== req.user.id) {
        return res.status(403).json({ message: "You can only grade submissions for your own courses" });
      }
      
      const { grade, feedback } = req.body;
      
      if (typeof grade !== "number" || grade < 0 || grade > assignment.totalPoints) {
        return res.status(400).json({ 
          message: `Grade must be a number between 0 and ${assignment.totalPoints}` 
        });
      }
      
      if (typeof feedback !== "string") {
        return res.status(400).json({ message: "Feedback must be a string" });
      }
      
      const gradedSubmission = await storage.gradeSubmission(
        submissionId, 
        grade, 
        feedback, 
        req.user.id
      );
      
      res.json(gradedSubmission);
    } catch (error) {
      res.status(500).json({ message: "Failed to grade submission" });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
