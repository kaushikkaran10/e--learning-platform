import { Book, Camera, CheckCircle, FileText, GraduationCap, HelpCircle, Library, LifeBuoy, Lightbulb, MessageSquare, ScrollText, Settings, Video } from "lucide-react";
import { Link } from "wouter";
import PageLayout from "@/components/layout/page-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InstructorResources() {
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Instructor Resources</h1>
          <p className="text-muted-foreground text-lg">
            Access tools, guidelines, and best practices to create engaging courses and effectively manage your teaching.
          </p>
        </div>

        <Tabs defaultValue="guidelines" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="guidelines" className="py-2 flex items-center gap-1">
              <Book className="h-4 w-4" />
              <span>Guidelines</span>
            </TabsTrigger>
            <TabsTrigger value="course-creation" className="py-2 flex items-center gap-1">
              <Lightbulb className="h-4 w-4" />
              <span>Course Creation</span>
            </TabsTrigger>
            <TabsTrigger value="grading" className="py-2 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              <span>Grading</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="py-2 flex items-center gap-1">
              <Video className="h-4 w-4" />
              <span>Video & Media</span>
            </TabsTrigger>
            <TabsTrigger value="best-practices" className="py-2 flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Best Practices</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="py-2 flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>Help & Support</span>
            </TabsTrigger>
          </TabsList>

          {/* GUIDELINES TAB */}
          <TabsContent value="guidelines">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Book className="h-12 w-12 text-primary" />}
                title="Instructor Guidelines"
                description="Comprehensive information on how to create, manage, and deliver courses on eduNest."
              >
                <p>Learn about instructor responsibilities, platform policies, and course management.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Account setup and verification</li>
                  <li>Course management dashboard</li>
                  <li>Instructor roles and responsibilities</li>
                  <li>Platform terms of service</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Settings className="h-12 w-12 text-primary" />}
                title="Platform Policies"
                description="Important information about content standards, copyright guidelines, and code of conduct."
              >
                <p>Understand the platform's rules regarding course content, copyright, and student interaction.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Content quality standards</li>
                  <li>Copyright and intellectual property</li>
                  <li>Student interaction guidelines</li>
                  <li>Academic integrity policies</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<MessageSquare className="h-12 w-12 text-primary" />}
                title="Communication Guidelines"
                description="Best practices for effective communication with students and maintaining professional conduct."
              >
                <p>Maintain professional and effective communication with your students.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Response time expectations</li>
                  <li>Announcement best practices</li>
                  <li>Feedback communication</li>
                  <li>Professional conduct standards</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* COURSE CREATION TAB */}
          <TabsContent value="course-creation">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Lightbulb className="h-12 w-12 text-primary" />}
                title="Course Creation Tips"
                description="Strategic advice on structuring engaging courses that deliver clear learning outcomes."
              >
                <p>Design courses that engage students and deliver clear learning outcomes.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Learning objective development</li>
                  <li>Course structure planning</li>
                  <li>Content organization strategies</li>
                  <li>Engagement techniques</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Creating Effective Assignments"
                description="Guidelines for designing assessments that test comprehension and application of course material."
              >
                <p>Create assessments that effectively evaluate student learning and provide valuable feedback.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Assignment design principles</li>
                  <li>Quiz development strategies</li>
                  <li>Rubric creation</li>
                  <li>Project-based assessment</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<ScrollText className="h-12 w-12 text-primary" />}
                title="Course Description Writing Guide"
                description="Tips for writing compelling course descriptions that attract and inform potential students."
              >
                <p>Create compelling course descriptions that accurately represent your content and attract students.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Title optimization techniques</li>
                  <li>Learning outcomes presentation</li>
                  <li>Target audience specification</li>
                  <li>Course benefits articulation</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Library className="h-12 w-12 text-primary" />}
                title="Course Materials Guide"
                description="Advice on selecting and creating effective learning materials for different types of courses."
              >
                <p>Select and create effective learning materials aligned with educational objectives.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Reading material selection</li>
                  <li>Supplementary resource curation</li>
                  <li>Accessibility considerations</li>
                  <li>Interactive content creation</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* GRADING TAB */}
          <TabsContent value="grading">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<CheckCircle className="h-12 w-12 text-primary" />}
                title="Grading & Feedback Guide"
                description="Best practices for fair assessment and providing constructive feedback to students."
              >
                <p>Learn effective grading methods and constructive feedback techniques.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Objective grading methods</li>
                  <li>Constructive feedback techniques</li>
                  <li>Rubric implementation</li>
                  <li>Grading consistency strategies</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Plagiarism Checker"
                description="Tools and guidelines for identifying and addressing academic misconduct in student work."
              >
                <p>Use effective tools to maintain academic integrity in your course assignments.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Plagiarism detection tools</li>
                  <li>Academic misconduct policies</li>
                  <li>Prevention strategies</li>
                  <li>Case handling procedures</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<GraduationCap className="h-12 w-12 text-primary" />}
                title="Assessment Design"
                description="Strategies for creating diverse and effective assessment methods for different learning styles."
              >
                <p>Design assessments that accommodate diverse learning styles and accurately measure achievement.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Alternative assessment methods</li>
                  <li>Formative vs. summative evaluation</li>
                  <li>Competency-based assessment</li>
                  <li>Learning style accommodation</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* VIDEO & MEDIA TAB */}
          <TabsContent value="media">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Video className="h-12 w-12 text-primary" />}
                title="Video Upload & Editing Guide"
                description="Technical guidance on creating, compressing, and uploading high-quality lecture videos."
              >
                <p>Master the technical aspects of creating and uploading professional lecture videos.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Video recording best practices</li>
                  <li>Compression techniques</li>
                  <li>Upload troubleshooting</li>
                  <li>File format guidelines</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Camera className="h-12 w-12 text-primary" />}
                title="Video Production Tips"
                description="Advice on creating engaging and professional-looking video content for your courses."
              >
                <p>Create engaging and professional-quality video content that enhances learning.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Lighting and audio setup</li>
                  <li>Presentation techniques</li>
                  <li>Visual aid integration</li>
                  <li>Engagement strategies</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Settings className="h-12 w-12 text-primary" />}
                title="Recommended Equipment"
                description="Suggestions for hardware and software to enhance your course content creation."
              >
                <p>Find recommendations for tools that can enhance your content creation process.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Camera and microphone options</li>
                  <li>Video editing software</li>
                  <li>Screen recording tools</li>
                  <li>Lighting equipment</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* BEST PRACTICES TAB */}
          <TabsContent value="best-practices">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<GraduationCap className="h-12 w-12 text-primary" />}
                title="Teaching Best Practices"
                description="Evidence-based strategies for effective online teaching and student engagement."
              >
                <p>Apply research-backed teaching strategies for online education environments.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Active learning techniques</li>
                  <li>Student engagement strategies</li>
                  <li>Discussion facilitation</li>
                  <li>Diverse learning styles adaptation</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<MessageSquare className="h-12 w-12 text-primary" />}
                title="Building Community"
                description="Techniques for fostering a supportive learning community within your courses."
              >
                <p>Create a supportive and interactive learning community in your virtual classroom.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Discussion forums management</li>
                  <li>Collaborative activities</li>
                  <li>Peer learning facilitation</li>
                  <li>Community building exercises</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Lightbulb className="h-12 w-12 text-primary" />}
                title="Student Motivation Strategies"
                description="Methods for maintaining student engagement and motivation throughout your course."
              >
                <p>Keep students motivated and engaged throughout the duration of your course.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Intrinsic motivation techniques</li>
                  <li>Recognition and reinforcement</li>
                  <li>Progress tracking methods</li>
                  <li>Milestone celebration</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* HELP & SUPPORT TAB */}
          <TabsContent value="help">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Common questions from instructors about using eduNest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How do I create a new course?</AccordionTrigger>
                        <AccordionContent>
                          Navigate to your instructor dashboard and click the "Create New Course" button. Fill in the required details including title, description, category, and learning objectives. Once you've created the course outline, you can add lectures, assignments, and resources.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>How do I upload lecture videos?</AccordionTrigger>
                        <AccordionContent>
                          Within your course, navigate to the lecture section where you want to add video content. Click "Add Content" and select "Video Lecture." You can then upload your video file or provide a link to an external hosting service. Support for MP4, MOV, and other common video formats is available.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>How do I create assignments and quizzes?</AccordionTrigger>
                        <AccordionContent>
                          In your course editor, navigate to the section where you want to add an assessment. Click "Add Assessment" and choose between assignment, quiz, or exam. For quizzes, you can create various question types including multiple choice, true/false, and short answer. For assignments, you can specify submission requirements and attach resource materials.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>How do I grade student submissions?</AccordionTrigger>
                        <AccordionContent>
                          Access the "Grading" section in your instructor dashboard to view all pending assignments. Click on a submission to review the student's work, provide feedback, and assign a grade. You can also download submissions, annotate them, and upload your annotated versions for student reference.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>How can I communicate with my students?</AccordionTrigger>
                        <AccordionContent>
                          You have several communication options: course announcements for class-wide messages, the messaging system for individual or group communication, and discussion forums for topic-based interaction. You can also schedule virtual office hours using the calendar integration.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-6">
                        <AccordionTrigger>How do I track student progress?</AccordionTrigger>
                        <AccordionContent>
                          The analytics dashboard provides comprehensive insights into student engagement, progress, and performance. You can view lecture completion rates, assignment submission statistics, and individual student activity. These analytics help identify areas where students may need additional support.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Instructor Support</CardTitle>
                    <CardDescription>Get help with course creation and management</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <LifeBuoy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Technical Support</h4>
                        <p className="text-sm text-muted-foreground">For platform features and content uploads</p>
                        <a href="mailto:instructor-support@edunest.edu" className="text-sm text-primary hover:underline">instructor-support@edunest.edu</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Educational Support</h4>
                        <p className="text-sm text-muted-foreground">For teaching methods and course design</p>
                        <a href="mailto:teaching@edunest.edu" className="text-sm text-primary hover:underline">teaching@edunest.edu</a>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium">Instructor Community</h4>
                      <p className="text-sm text-muted-foreground mb-2">Connect with fellow educators</p>
                      <Link href="/instructor-community">
                        <div className="w-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md py-2 px-4 text-center text-sm font-medium">
                          Join the Faculty Forum
                        </div>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}

function ResourceCard({ icon, title, description, children }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}