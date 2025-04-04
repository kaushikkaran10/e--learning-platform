import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import PageLayout from "@/components/layout/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage, 
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon,
  Users,
  MapPin,
  AlarmCheck,
  BookOpen,
  PenTool,
  Download
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'assignment' | 'exam' | 'lecture' | 'meeting' | 'other';
  courseId?: number;
  courseName?: string;
  location?: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeView, setActiveView] = useState<'month' | 'week' | 'day'>('month');
  const [showNewEventDialog, setShowNewEventDialog] = useState(false);
  
  // Mock events data
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Web Development Assignment Due",
      description: "Submit your final project for the Web Development course",
      date: new Date(2025, 3, 10), // April 10, 2025
      startTime: "23:59",
      endTime: "23:59",
      type: "assignment",
      courseId: 1,
      courseName: "Introduction to Web Development"
    },
    {
      id: 2,
      title: "Data Structures Exam",
      description: "Mid-term examination covering arrays, linked lists, and trees",
      date: new Date(2025, 3, 15), // April 15, 2025
      startTime: "10:00",
      endTime: "12:00",
      type: "exam",
      courseId: 2,
      courseName: "Data Structures and Algorithms",
      location: "Room 305"
    },
    {
      id: 3,
      title: "Database Design Group Meeting",
      description: "Weekly meeting to discuss project progress",
      date: new Date(2025, 3, 8), // April 8, 2025
      startTime: "14:00",
      endTime: "15:30",
      type: "meeting",
      courseId: 3,
      courseName: "Database Management Systems"
    },
    {
      id: 4,
      title: "Guest Lecture: AI Ethics",
      description: "Special lecture by Dr. Smith on ethical considerations in AI development",
      date: new Date(2025, 3, 12), // April 12, 2025
      startTime: "16:00",
      endTime: "18:00",
      type: "lecture",
      courseId: 4,
      courseName: "Artificial Intelligence Fundamentals",
      location: "Auditorium B"
    }
  ]);

  const currentMonthName = selectedDate.toLocaleString('default', { month: 'long' });
  const currentYear = selectedDate.getFullYear();

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  // Get events for the selected date
  const getEventsForSelectedDate = () => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === selectedDate.getDate() && 
             eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });
  };

  // Get dates with events for the calendar
  const getDatesWithEvents = () => {
    return events.map(event => {
      const date = new Date(event.date);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  };

  // New event form schema
  const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters" }),
    description: z.string().optional(),
    date: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    type: z.enum(['assignment', 'exam', 'lecture', 'meeting', 'other']),
    courseId: z.string().optional(),
    location: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      date: new Date(),
      startTime: "12:00",
      endTime: "13:00",
      type: "other",
      courseId: "",
      location: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Add the new event
    const newEvent: Event = {
      id: events.length + 1,
      title: values.title,
      description: values.description || "",
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      type: values.type as 'assignment' | 'exam' | 'lecture' | 'meeting' | 'other',
      courseId: values.courseId ? parseInt(values.courseId) : undefined,
      courseName: values.courseId ? "Selected Course" : undefined, // In a real app, you'd get this from the API
      location: values.location,
    };
    
    setEvents([...events, newEvent]);
    setShowNewEventDialog(false);
    form.reset();
  };

  const getEventTypeIcon = (type: string) => {
    switch(type) {
      case 'assignment':
        return <PenTool className="h-4 w-4" />;
      case 'exam':
        return <AlarmCheck className="h-4 w-4" />;
      case 'lecture':
        return <BookOpen className="h-4 w-4" />;
      case 'meeting':
        return <Users className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch(type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-600';
      case 'exam':
        return 'bg-red-100 text-red-600';
      case 'lecture':
        return 'bg-green-100 text-green-600';
      case 'meeting':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendar</h1>
            <p className="text-gray-600">Manage your schedule and keep track of important dates</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                  <DialogDescription>
                    Create a new event or deadline in your calendar.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <div className="grid">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  className="rounded-md border"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Type</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="assignment">Assignment</SelectItem>
                                  <SelectItem value="exam">Exam</SelectItem>
                                  <SelectItem value="lecture">Lecture</SelectItem>
                                  <SelectItem value="meeting">Meeting</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="courseId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Course (Optional)</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a course" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">Web Development</SelectItem>
                                  <SelectItem value="2">Data Structures</SelectItem>
                                  <SelectItem value="3">Database Design</SelectItem>
                                  <SelectItem value="4">AI Fundamentals</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-2">
                          <FormField
                            control={form.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Add details about this event" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowNewEventDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Save Event</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button 
                variant="ghost" 
                size="sm"
                className={activeView === 'month' ? 'bg-gray-100' : ''}
                onClick={() => setActiveView('month')}
              >
                Month
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={activeView === 'week' ? 'bg-gray-100' : ''}
                onClick={() => setActiveView('week')}
              >
                Week
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className={activeView === 'day' ? 'bg-gray-100' : ''}
                onClick={() => setActiveView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold px-2">
                    {currentMonthName} {currentYear}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md"
                  modifiers={{
                    marked: getDatesWithEvents()
                  }}
                  modifiersStyles={{
                    marked: { fontWeight: 'bold', color: 'var(--primary)' }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Events for selected date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </CardTitle>
              <CardDescription>
                {getEventsForSelectedDate().length} events scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {getEventsForSelectedDate().length > 0 ? (
                  <div className="space-y-4">
                    {getEventsForSelectedDate().map((event) => (
                      <div key={event.id} className="border rounded-lg overflow-hidden">
                        <div className={`px-4 py-3 ${getEventTypeColor(event.type)}`}>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.type)}
                            <span className="font-medium">{event.title}</span>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-white space-y-3">
                          {event.description && (
                            <p className="text-sm text-gray-600">{event.description}</p>
                          )}
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                {event.startTime} - {event.endTime}
                              </span>
                            </div>
                            
                            {event.courseName && (
                              <div className="flex items-center text-sm text-gray-500">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>{event.courseName}</span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="flex items-center text-sm text-gray-500">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{event.location}</span>
                              </div>
                            )}
                          </div>
                          
                          {event.type === 'assignment' && (
                            <Button variant="outline" size="sm" className="w-full mt-2">
                              <Download className="h-4 w-4 mr-2" />
                              View Assignment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Events Scheduled</h3>
                    <p className="text-gray-500 mb-4">You don't have any events scheduled for this day.</p>
                    <Button onClick={() => setShowNewEventDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Your upcoming assignments and exams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {events
                .filter(event => ['assignment', 'exam'].includes(event.type))
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .slice(0, 5)
                .map((event) => (
                  <div 
                    key={event.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        event.type === 'assignment' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {event.type === 'assignment' ? (
                          <PenTool className="h-4 w-4 text-blue-600" />
                        ) : (
                          <AlarmCheck className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.courseName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{event.date.toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">{event.startTime}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}