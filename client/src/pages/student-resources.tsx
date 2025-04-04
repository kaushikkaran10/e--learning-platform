import { AlertCircle, Book, BookOpen, Brain, FileText, GraduationCap, HelpCircle, Laptop, Library, Lightbulb, LifeBuoy, PenTool, Search, Timer, VideoIcon, Wrench } from "lucide-react";
import { Link } from "wouter";
import PageLayout from "@/components/layout/page-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentResources() {
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Resources</h1>
          <p className="text-muted-foreground text-lg">
            Find helpful learning materials, tutorials, and support to enhance your educational journey.
          </p>
        </div>

        <Tabs defaultValue="study-materials" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
            <TabsTrigger value="study-materials" className="py-2 flex flex-col items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Study Materials</span>
            </TabsTrigger>
            <TabsTrigger value="tech-tools" className="py-2 flex flex-col items-center gap-1">
              <Laptop className="h-4 w-4" />
              <span>Tech & Tools</span>
            </TabsTrigger>
            <TabsTrigger value="academic-support" className="py-2 flex flex-col items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Academic Support</span>
            </TabsTrigger>
            <TabsTrigger value="exam-help" className="py-2 flex flex-col items-center gap-1">
              <PenTool className="h-4 w-4" />
              <span>Assignments & Exams</span>
            </TabsTrigger>
            <TabsTrigger value="career" className="py-2 flex flex-col items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              <span>Career Development</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="py-2 flex flex-col items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              <span>FAQ & Support</span>
            </TabsTrigger>
          </TabsList>

          {/* STUDY MATERIALS TAB */}
          <TabsContent value="study-materials">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Book className="h-12 w-12 text-primary" />}
                title="Lecture Notes & PDFs"
                description="Access course-specific lecture notes, slides, and supplementary PDFs to reinforce your learning."
              >
                <p>Access supplementary lecture notes, slides, and reading materials that align with your course curriculum.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Course-specific notes</li>
                  <li>Lecture slides</li>
                  <li>Supplementary reading materials</li>
                  <li>Instructor-recommended resources</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Library className="h-12 w-12 text-primary" />}
                title="Recommended Books & Articles"
                description="Discover curated reading lists with essential books and articles for comprehensive subject knowledge."
              >
                <p>Find curated reading lists with essential books and articles for each subject area.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Textbook recommendations</li>
                  <li>Academic journals and articles</li>
                  <li>Digital library access</li>
                  <li>E-book collections</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Past Year Question Papers"
                description="Practice with previous examination papers to familiarize yourself with question patterns and assessment styles."
              >
                <p>Prepare effectively by reviewing past examination papers and sample answers.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Previous examination papers</li>
                  <li>Sample answers and solutions</li>
                  <li>Examination patterns</li>
                  <li>Assessment guidelines</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<BookOpen className="h-12 w-12 text-primary" />}
                title="Open-Source Learning Platforms"
                description="Explore free educational resources from platforms like MIT OpenCourseWare and Coursera to complement your studies."
              >
                <p>Supplement your learning with free educational resources from reputable platforms.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>MIT OpenCourseWare</li>
                  <li>Coursera free courses</li>
                  <li>Khan Academy</li>
                  <li>Open Educational Resources (OER)</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* TECH & TOOLS TAB */}
          <TabsContent value="tech-tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Laptop className="h-12 w-12 text-primary" />}
                title="Platform Tutorials"
                description="Learn how to navigate the eduNest platform, submit assignments, and access course materials effectively."
              >
                <p>Get familiar with navigating eduNest to make the most of your learning experience.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Platform navigation guides</li>
                  <li>Assignment submission tutorials</li>
                  <li>Quiz and assessment tools</li>
                  <li>Progress tracking features</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Wrench className="h-12 w-12 text-primary" />}
                title="Downloadable Software & Tools"
                description="Access recommended software applications and tools for your specific courses and subject areas."
              >
                <p>Find recommended software and tools specific to your course requirements.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Programming tools (Python, Java, etc.)</li>
                  <li>Design applications (Photoshop, Figma)</li>
                  <li>Data analysis tools</li>
                  <li>Productivity software</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<VideoIcon className="h-12 w-12 text-primary" />}
                title="Video Playback Help"
                description="Troubleshoot common video playback issues with our comprehensive guides to ensure uninterrupted learning."
              >
                <p>Resolve common video playback issues to ensure smooth learning experiences.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Buffering troubleshooting</li>
                  <li>Audio sync solutions</li>
                  <li>Video quality settings</li>
                  <li>Offline viewing options</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* ACADEMIC SUPPORT TAB */}
          <TabsContent value="academic-support">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Research Paper Writing Guide"
                description="Learn the fundamentals of academic research and how to structure and write effective research papers."
              >
                <p>Master the process of researching, structuring, and writing effective academic papers.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Research methodologies</li>
                  <li>Paper structure guidelines</li>
                  <li>Thesis development</li>
                  <li>Academic writing style</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Citation & Referencing Guides"
                description="Access comprehensive guides on various citation styles including APA, MLA, and IEEE formats."
              >
                <p>Learn how to properly cite sources and create reference lists in various academic styles.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>APA style guide</li>
                  <li>MLA formatting</li>
                  <li>IEEE citation rules</li>
                  <li>Reference management tools</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<AlertCircle className="h-12 w-12 text-primary" />}
                title="Plagiarism Guidelines"
                description="Understand what constitutes plagiarism and how to avoid academic misconduct in your assignments."
              >
                <p>Understand what constitutes plagiarism and learn strategies to maintain academic integrity.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Types of plagiarism</li>
                  <li>Proper paraphrasing techniques</li>
                  <li>Plagiarism checking tools</li>
                  <li>Academic integrity policies</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* ASSIGNMENTS & EXAMS TAB */}
          <TabsContent value="exam-help">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<Lightbulb className="h-12 w-12 text-primary" />}
                title="Study Tips & Techniques"
                description="Explore effective learning strategies and study methods to improve retention and understanding."
              >
                <p>Discover evidence-based study techniques to enhance your learning efficiency and retention.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Active recall techniques</li>
                  <li>Spaced repetition methods</li>
                  <li>Note-taking strategies</li>
                  <li>Memory enhancement techniques</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Timer className="h-12 w-12 text-primary" />}
                title="Time Management Guides"
                description="Learn how to effectively manage your study schedule and balance academic responsibilities."
              >
                <p>Master the art of managing your study time efficiently to maximize productivity.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Study schedule templates</li>
                  <li>Pomodoro technique</li>
                  <li>Prioritization methods</li>
                  <li>Deadline management</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<GraduationCap className="h-12 w-12 text-primary" />}
                title="Exam Preparation Strategies"
                description="Get comprehensive guides on preparing for different types of examinations and assessment formats."
              >
                <p>Prepare methodically for exams with strategic approaches to different assessment types.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Exam-specific preparation</li>
                  <li>Test anxiety management</li>
                  <li>Question prediction techniques</li>
                  <li>Last-minute revision strategies</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<PenTool className="h-12 w-12 text-primary" />}
                title="Sample Quizzes & Practice Tests"
                description="Test your knowledge with practice quizzes and sample examinations to identify areas for improvement."
              >
                <p>Reinforce your understanding and identify knowledge gaps through practice assessments.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Subject-specific practice tests</li>
                  <li>Self-assessment quizzes</li>
                  <li>Timed mock examinations</li>
                  <li>Question banks with solutions</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* CAREER DEVELOPMENT TAB */}
          <TabsContent value="career">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ResourceCard 
                icon={<FileText className="h-12 w-12 text-primary" />}
                title="Resume & CV Writing"
                description="Learn how to create compelling resumes and CVs that highlight your academic achievements and skills."
              >
                <p>Create effective resumes that showcase your academic achievements and professional potential.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Resume templates</li>
                  <li>CV formatting guidelines</li>
                  <li>Achievement highlighting techniques</li>
                  <li>Personal statement writing</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Search className="h-12 w-12 text-primary" />}
                title="Internship & Job Search Portals"
                description="Explore curated lists of internship opportunities and job search resources relevant to your field."
              >
                <p>Find internship and job opportunities aligned with your field of study and career goals.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Internship databases</li>
                  <li>Industry-specific job boards</li>
                  <li>Campus recruitment information</li>
                  <li>Alumni network connections</li>
                </ul>
              </ResourceCard>

              <ResourceCard 
                icon={<Brain className="h-12 w-12 text-primary" />}
                title="Soft Skills Training"
                description="Develop essential communication, leadership, and professional skills for workplace success."
              >
                <p>Develop the essential interpersonal and professional skills sought by employers.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Communication skills</li>
                  <li>Public speaking techniques</li>
                  <li>Team collaboration methods</li>
                  <li>Leadership development</li>
                </ul>
              </ResourceCard>
            </div>
          </TabsContent>

          {/* FAQ & SUPPORT TAB */}
          <TabsContent value="faq">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find answers to common questions about using eduNest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                        <AccordionContent>
                          You can reset your password by clicking on the "Forgot Password" link on the login page. Follow the instructions sent to your registered email to create a new password.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>How do I submit an assignment?</AccordionTrigger>
                        <AccordionContent>
                          Navigate to your course page, find the assignment section, and click on the assignment you wish to complete. Use the submission form to upload your work and submit it for grading.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Can I download lectures for offline viewing?</AccordionTrigger>
                        <AccordionContent>
                          Yes, if the instructor has enabled this feature. Look for the download icon next to lecture videos to save them for offline access.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>How do I track my course progress?</AccordionTrigger>
                        <AccordionContent>
                          Your course progress is automatically tracked on the course dashboard. You can see completion percentages, completed lectures, and pending assignments.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>How do I contact my instructor?</AccordionTrigger>
                        <AccordionContent>
                          You can message your instructor directly through the course page using the "Message Instructor" button or through the platform's messaging system.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-6">
                        <AccordionTrigger>What should I do if a video won't play?</AccordionTrigger>
                        <AccordionContent>
                          First, check your internet connection and try refreshing the page. If the issue persists, try using a different browser or clearing your browser cache. If problems continue, contact technical support.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>We're here to help with any issues</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <LifeBuoy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Technical Support</h4>
                        <p className="text-sm text-muted-foreground">For platform issues and technical difficulties</p>
                        <a href="mailto:support@edunest.edu" className="text-sm text-primary hover:underline">support@edunest.edu</a>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <GraduationCap className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium">Academic Support</h4>
                        <p className="text-sm text-muted-foreground">For course-related questions</p>
                        <a href="mailto:academic@edunest.edu" className="text-sm text-primary hover:underline">academic@edunest.edu</a>
                      </div>
                    </div>
                    <div className="pt-4">
                      <h4 className="font-medium">Community Forums</h4>
                      <p className="text-sm text-muted-foreground mb-2">Connect with fellow students and get help</p>
                      <Link href="/community">
                        <div className="w-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors rounded-md py-2 px-4 text-center text-sm font-medium">
                          Join the Discussion
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