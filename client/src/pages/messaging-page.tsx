import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import PageLayout from "@/components/layout/page-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Send, Search, MoreHorizontal, Users, Clock, UserPlus, MessageSquare } from "lucide-react";

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

interface ChatUser {
  id: number;
  fullName: string;
  username: string;
  avatarUrl?: string;
  role: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  online?: boolean;
}

export default function MessagingPage() {
  const { user } = useAuth();
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [chats, setChats] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Example users data - In a real app, this would come from an API
  useEffect(() => {
    // Simulate loading chat users
    const mockChats: ChatUser[] = [
      {
        id: 1,
        fullName: "John Doe",
        username: "john",
        role: "instructor",
        lastMessage: "When is the next assignment due?",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        online: true
      },
      {
        id: 2,
        fullName: "Sarah Wilson",
        username: "sarah",
        role: "student",
        lastMessage: "Thank you for your feedback!",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        online: false
      },
      {
        id: 3,
        fullName: "Michael Brown",
        username: "mike",
        role: "instructor",
        lastMessage: "The video lecture is now available",
        lastMessageTime: "2 days ago",
        unreadCount: 0,
        online: true
      }
    ];
    
    setChats(mockChats);
  }, []);

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      // Simulate loading messages for the selected chat
      const mockMessages: Message[] = [
        {
          id: 1,
          senderId: activeChat,
          receiverId: user?.id || 0,
          content: "Hi there! How can I help you with the course?",
          timestamp: "2025-04-03T10:30:00Z",
          read: true
        },
        {
          id: 2,
          senderId: user?.id || 0,
          receiverId: activeChat,
          content: "I had a question about the assignment due next week.",
          timestamp: "2025-04-03T10:32:00Z",
          read: true
        },
        {
          id: 3,
          senderId: activeChat,
          receiverId: user?.id || 0,
          content: "Sure, what would you like to know about it?",
          timestamp: "2025-04-03T10:33:00Z",
          read: true
        },
        {
          id: 4,
          senderId: user?.id || 0,
          receiverId: activeChat,
          content: "Is it possible to get an extension on the deadline?",
          timestamp: "2025-04-03T10:34:00Z",
          read: true
        },
        {
          id: 5,
          senderId: activeChat,
          receiverId: user?.id || 0,
          content: "Yes, I can give you a 2-day extension. Would that work for you?",
          timestamp: "2025-04-03T10:36:00Z",
          read: true
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [activeChat, user]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChat) return;
    
    // In a real app, this would send the message to an API
    const newMessage: Message = {
      id: messages.length + 1,
      senderId: user?.id || 0,
      receiverId: activeChat,
      content: messageInput,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput("");
  };

  const filteredChats = chats.filter(chat => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return (chat.unreadCount || 0) > 0;
    if (activeTab === "instructors") return chat.role === "instructor";
    if (activeTab === "students") return chat.role === "student";
    return true;
  });

  const activeChatUser = chats.find(chat => chat.id === activeChat);

  return (
    <PageLayout>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Connect with your instructors and fellow students</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex h-[calc(80vh-2rem)]">
          {/* Chat sidebar */}
          <div className="w-80 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Search messages" 
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-4 p-1 mx-2 mt-3">
                <TabsTrigger value="all" className="text-xs py-1.5">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs py-1.5">Unread</TabsTrigger>
                <TabsTrigger value="instructors" className="text-xs py-1.5">Instructors</TabsTrigger>
                <TabsTrigger value="students" className="text-xs py-1.5">Students</TabsTrigger>
              </TabsList>
              
              <ScrollArea className="flex-1 p-2">
                <TabsContent value="all" className="m-0 p-0">
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer gap-3 transition-colors ${
                          activeChat === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveChat(chat.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.avatarUrl} />
                            <AvatarFallback>{chat.fullName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">{chat.fullName}</p>
                            <p className="text-xs text-gray-500">{chat.lastMessageTime}</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                        
                        {chat.unreadCount ? (
                          <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{chat.unreadCount}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                {/* Other tab contents are identical in structure */}
                <TabsContent value="unread" className="m-0 p-0">
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer gap-3 transition-colors ${
                          activeChat === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveChat(chat.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.avatarUrl} />
                            <AvatarFallback>{chat.fullName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">{chat.fullName}</p>
                            <p className="text-xs text-gray-500">{chat.lastMessageTime}</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                        
                        {chat.unreadCount ? (
                          <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{chat.unreadCount}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="instructors" className="m-0 p-0">
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer gap-3 transition-colors ${
                          activeChat === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveChat(chat.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.avatarUrl} />
                            <AvatarFallback>{chat.fullName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">{chat.fullName}</p>
                            <p className="text-xs text-gray-500">{chat.lastMessageTime}</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                        
                        {chat.unreadCount ? (
                          <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{chat.unreadCount}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="students" className="m-0 p-0">
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className={`flex items-center p-3 rounded-md cursor-pointer gap-3 transition-colors ${
                          activeChat === chat.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveChat(chat.id)}
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.avatarUrl} />
                            <AvatarFallback>{chat.fullName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {chat.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <p className="font-medium text-sm truncate">{chat.fullName}</p>
                            <p className="text-xs text-gray-500">{chat.lastMessageTime}</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                        
                        {chat.unreadCount ? (
                          <div className="flex-shrink-0 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-xs text-white">{chat.unreadCount}</span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
              
              <div className="p-3 border-t mt-auto">
                <Button className="w-full flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  <span>New Message</span>
                </Button>
              </div>
            </Tabs>
          </div>
          
          {/* Chat main area */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activeChatUser?.avatarUrl} />
                      <AvatarFallback>{activeChatUser?.fullName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{activeChatUser?.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {activeChatUser?.online ? 'Online' : 'Offline'} • {activeChatUser?.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Users size={18} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Clock size={18} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View profile</DropdownMenuItem>
                        <DropdownMenuItem>Clear chat</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Block contact</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                {/* Chat messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isMe = message.senderId === user?.id;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[75%] ${
                            isMe ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
                          } rounded-lg px-4 py-2`}>
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              isMe ? 'text-primary-foreground/70' : 'text-gray-500'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit', 
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
                
                {/* Chat input */}
                <div className="p-4 border-t mt-auto">
                  <form 
                    className="flex gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Input 
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="shrink-0" disabled={!messageInput.trim()}>
                      <Send size={18} />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Select a conversation or start a new one to begin messaging with instructors or fellow students.
                </p>
                <Button className="flex items-center gap-2">
                  <UserPlus size={16} />
                  <span>Start a Conversation</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}