import path from 'path';
import express, { Express, Request, Response } from 'express';
import fileUpload from 'express-fileupload';

// Setup file upload middleware
export function setupFileUpload(app: Express) {
  app.use(fileUpload({
    createParentPath: true,
    limits: { 
      fileSize: 50 * 1024 * 1024 // 50MB max file size
    },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));

  // Video uploads route
  app.post('/api/upload/video', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can upload videos' });
    }

    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
      }

      const videoFile = req.files.video as fileUpload.UploadedFile;
      
      // Validate file type
      const allowedExtensions = ['.mp4', '.webm', '.avi', '.mov'];
      const fileExt = path.extname(videoFile.name).toLowerCase();
      
      if (!allowedExtensions.includes(fileExt)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only video files are allowed (.mp4, .webm, .avi, .mov)' 
        });
      }

      // Create unique filename to prevent collisions
      const timestamp = new Date().getTime();
      const uniqueFilename = `${timestamp}-${videoFile.name}`;
      const uploadPath = path.join(process.cwd(), 'uploads/videos', uniqueFilename);
      
      // Move the file
      await videoFile.mv(uploadPath);
      
      // Return the relative path to be stored in the database
      const relativePath = `/uploads/videos/${uniqueFilename}`;
      
      res.status(200).json({
        message: 'Video uploaded successfully',
        fileUrl: relativePath
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ 
        message: 'Failed to upload video',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Document uploads route (for PDFs, notes, etc.)
  app.post('/api/upload/document', async (req: Request, res: Response) => {
    if (!req.isAuthenticated() || req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can upload documents' });
    }

    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No files were uploaded' });
      }

      const documentFile = req.files.document as fileUpload.UploadedFile;
      
      // Validate file type
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
      const fileExt = path.extname(documentFile.name).toLowerCase();
      
      if (!allowedExtensions.includes(fileExt)) {
        return res.status(400).json({ 
          message: 'Invalid file type. Only document files are allowed (.pdf, .doc, .docx, .txt, .ppt, .pptx)' 
        });
      }

      // Create unique filename to prevent collisions
      const timestamp = new Date().getTime();
      const uniqueFilename = `${timestamp}-${documentFile.name}`;
      const uploadPath = path.join(process.cwd(), 'uploads/documents', uniqueFilename);
      
      // Move the file
      await documentFile.mv(uploadPath);
      
      // Return the relative path to be stored in the database
      const relativePath = `/uploads/documents/${uniqueFilename}`;
      
      res.status(200).json({
        message: 'Document uploaded successfully',
        fileUrl: relativePath
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      res.status(500).json({ 
        message: 'Failed to upload document',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}