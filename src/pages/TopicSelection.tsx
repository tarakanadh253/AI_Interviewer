import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Cpu, Database, Code, Network, Terminal, Clock, Play } from "lucide-react";
<<<<<<< HEAD
import { apiService, type Course, type InterviewSession } from "@/lib/api";
=======
import { apiService, type Topic, type InterviewSession } from "@/lib/api";
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
import { useToast } from "@/hooks/use-toast";

// Icon mapping for topics
const topicIcons: Record<string, any> = {
  python: Terminal,
  sql: Database,
  dsa: Code,
  javascript: Code,
  'system design': Cpu,
  default: Brain,
};

const TopicSelection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
<<<<<<< HEAD
  const [topics, setTopics] = useState<Course[]>([]);
=======
  const [topics, setTopics] = useState<Topic[]>([]);
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
<<<<<<< HEAD
        const fetchedTopics = await apiService.getCourses();
=======
        const fetchedTopics = await apiService.getTopics();
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
        // Ensure we always have an array
        if (Array.isArray(fetchedTopics)) {
          setTopics(fetchedTopics);
          if (fetchedTopics.length === 0) {
            toast({
<<<<<<< HEAD
              title: "No Courses Available",
              description: "Courses are not seeded in the database. Please run: python manage.py seed_data",
=======
              title: "No Topics Available",
              description: "Topics are not seeded in the database. Please run: python manage.py seed_data",
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
              variant: "destructive",
            });
          }
        } else {
          console.error('Invalid topics response:', fetchedTopics);
          setTopics([]);
          toast({
            title: "Error",
            description: "Invalid response from server. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('Error fetching topics:', error);
        setTopics([]); // Ensure topics is always an array
        const errorMessage = error.message || "Unknown error";
        const isConnectionError = errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('ERR_CONNECTION_REFUSED');

        toast({
          title: "Connection Error",
          description: isConnectionError
            ? "Backend server is not running. Please start it with: python manage.py runserver (in the backend folder)"
            : errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();

    // Check for active session
    const checkActiveSession = async () => {
      const username = localStorage.getItem('username');
      if (username) {
        try {
          const sessions = await apiService.getSessionsByUsername(username);
          // Find active sessions (CREATED or IN_PROGRESS)
          const active = sessions.find((s: InterviewSession) =>
            s.status === 'CREATED' || s.status === 'IN_PROGRESS'
          );

          if (active) {
            // Check if session is still valid (within 30 minutes)
            const startedAt = new Date(active.started_at);
            const now = new Date();
            const elapsedMinutes = (now.getTime() - startedAt.getTime()) / (1000 * 60);

            if (elapsedMinutes < 30) {
              setActiveSession(active);
              setShowResumeDialog(true);
            }
          }
        } catch (error) {
          console.error('Error checking active session:', error);
          // Silently fail - don't block user from starting new interview
        }
      }
    };

    checkActiveSession();
  }, [toast]);

  const toggleTopic = (id: number) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleResume = () => {
    if (activeSession) {
      localStorage.setItem('session_id', activeSession.id.toString());
      setShowResumeDialog(false);
      navigate("/interview");
    }
  };

  const handleStartNew = async () => {
    if (selectedTopics.length === 0) {
      toast({
<<<<<<< HEAD
        title: "No Courses Selected",
        description: "Please select at least one course to continue.",
=======
        title: "No Topics Selected",
        description: "Please select at least one topic to continue.",
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
        variant: "destructive",
      });
      return;
    }

    const username = localStorage.getItem('username');
    if (!username) {
      toast({
        title: "Not Signed In",
        description: "Please sign in first.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

<<<<<<< HEAD
    setIsLoading(true);

    const createSessionWithRetry = async (retryCount = 0) => {
      try {
        // Create interview session
        const session = await apiService.createSession(username, selectedTopics);

        // Clear exam proctoring state from previous sessions
        localStorage.removeItem('exam_is_banned');
        localStorage.removeItem('exam_tab_switch_count');

        localStorage.setItem('session_id', session.id.toString());
        setShowResumeDialog(false);
        navigate("/interview");
      } catch (error: any) {
        console.error('Error creating session:', error);
        const errorMsg = error.message?.toLowerCase() || "";

        // Handle Active Session Error - Auto Cancel and Retry
        if ((errorMsg.includes('active session') || errorMsg.includes('complete it first')) && retryCount < 1) {
          console.log("Active session found, cancelling and retrying...");
          try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/sessions/cancel-active/`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username }),
            });
            // Retry creation once
            await createSessionWithRetry(retryCount + 1);
            return;
          } catch (cancelError) {
            console.error("Failed to cancel active session:", cancelError);
          }
        }

        // Handle User Not Found - Auto Repair
        if (errorMsg.includes('user not found') && retryCount < 1) {
          try {
            console.log('Attempting to create missing user...');
            const userStr = localStorage.getItem('user');
            if (userStr) {
              const userObj = JSON.parse(userStr);
              if (userObj.email) {
                await apiService.createUser({
                  username: userObj.email,
                  email: userObj.email,
                  password: "synced_password_placeholder",
                  role: 'USER',
                  access_type: 'TRIAL'
                });
                await createSessionWithRetry(retryCount + 1);
                return;
              }
            }
          } catch (retryError) {
            console.error('Critical: Failed to auto-create user on retry:', retryError);
          }
        }

        // Final Error Handling
        setIsLoading(false);
        let errorTitle = "Unable to Start Interview";
        let errorDescription = "Could not start interview. Please try again.";

        if (errorMsg.includes('trial') || errorMsg.includes('already used')) {
          errorTitle = "Trial Interview Already Used";
          errorDescription = "You've already completed your free trial interview.";
=======
    try {
      // Cancel active session first if exists
      if (activeSession) {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/sessions/cancel-active/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });
        } catch (err) {
          console.error('Error cancelling active session:', err);
        }
      }

      // Create interview session
      const session = await apiService.createSession(username, selectedTopics);
      localStorage.setItem('session_id', session.id.toString());
      setShowResumeDialog(false);
      navigate("/interview");
    } catch (error: any) {
      console.error('Error creating session:', error);

      // Make error messages more user-friendly
      let errorTitle = "Unable to Start Interview";
      let errorDescription = "Could not start interview. Please try again.";

      if (error.message) {
        const errorMsg = error.message.toLowerCase();

        if (errorMsg.includes('trial') || errorMsg.includes('already used')) {
          errorTitle = "Trial Interview Already Used";
          errorDescription = "You've already completed your free trial interview. To continue practicing, please contact the administrator to reset your trial status or upgrade your account.";
        } else if (errorMsg.includes('active session') || errorMsg.includes('complete it first')) {
          errorTitle = "Active Interview Found";
          errorDescription = "You have an interview in progress. Please complete it or wait 30 minutes for it to expire automatically before starting a new one.";
        } else if (errorMsg.includes('user not found') || errorMsg.includes('create user')) {
          errorTitle = "Account Issue";
          errorDescription = "Please sign in again to continue.";
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
        } else if (errorMsg.includes('inactive') || errorMsg.includes('account')) {
          errorTitle = "Account Inactive";
          errorDescription = "Your account is inactive. Please contact the administrator.";
        } else {
          errorDescription = error.message;
        }
<<<<<<< HEAD

        toast({
          title: errorTitle,
          description: errorDescription,
          variant: "destructive",
        });
      }
    };

    await createSessionWithRetry();
=======
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    }
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
  };

  const handleStart = handleStartNew;

  const calculateRemainingTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000);
    const totalSeconds = 30 * 60; // 30 minutes
    const remaining = Math.max(0, totalSeconds - elapsedSeconds);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center relative overflow-hidden text-ohg-grey">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ohg-navy/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ohg-orange/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Resume Session Dialog */}
      {showResumeDialog && activeSession && (
        <div className="fixed inset-0 bg-ohg-navy/20 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <Card className="p-8 max-w-md w-full mx-4 bg-white border-border shadow-2xl rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-ohg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-ohg-teal" />
              </div>
              <h2 className="text-2xl font-bold text-ohg-navy mb-2">
                Resume Interview?
              </h2>
              <p className="text-muted-foreground">
=======
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Resume Session Dialog */}
      {showResumeDialog && activeSession && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <Card className="p-8 max-w-md w-full mx-4 bg-slate-900 border-slate-800 shadow-2xl rounded-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Resume Interview?
              </h2>
              <p className="text-slate-400">
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                You have an active interview session in progress.
              </p>
            </div>

            <div className="space-y-4 mb-8">
<<<<<<< HEAD
              <div className="p-4 bg-ohg-grey-light rounded-xl border border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">Time Remaining</span>
                <span className="text-ohg-navy font-mono font-bold text-lg">
                  {calculateRemainingTime(activeSession.started_at)}
                </span>
              </div>
              <div className="p-4 bg-ohg-grey-light rounded-xl border border-border flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 capitalize">
=======
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400">Time Remaining</span>
                <span className="text-white font-mono font-medium text-lg">
                  {calculateRemainingTime(activeSession.started_at)}
                </span>
              </div>
              <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400">Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 capitalize">
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                  {activeSession.status.toLowerCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowResumeDialog(false)}
                variant="outline"
<<<<<<< HEAD
                className="flex-1 bg-white border-border text-ohg-grey hover:bg-gray-50 hover:text-ohg-navy h-12 font-medium"
=======
                className="flex-1 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
              >
                Start New
              </Button>
              <Button
                onClick={handleResume}
<<<<<<< HEAD
                className="flex-1 bg-ohg-orange hover:bg-ohg-orange-hover text-white h-12 shadow-lg hover:shadow-ohg-orange/20 font-semibold"
=======
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-12 shadow-lg shadow-primary/20"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16 animate-fade-in">
<<<<<<< HEAD
          <h1 className="text-4xl md:text-5xl font-bold text-ohg-navy mb-6 tracking-tight">
            Choose Your Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Select up to 5 courses to customize your technical interview.
          </p>
          <div className="mt-8">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 ${selectedTopics.length > 0 ? "bg-ohg-orange/10 text-ohg-orange border border-ohg-orange/20" : "bg-gray-100 text-muted-foreground border border-gray-200"
              }`}>
              {selectedTopics.length} / 5 courses selected
=======
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Choose Your Topics
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Select up to 5 domains to customize your technical interview.
          </p>
          <div className="mt-8">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${selectedTopics.length > 0 ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-800/50 text-slate-500 border border-slate-800"
              }`}>
              {selectedTopics.length} / 5 topics selected
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20">
<<<<<<< HEAD
            <div className="w-12 h-12 border-4 border-gray-200 border-t-ohg-orange rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Loading courses...</p>
          </div>
        ) : !Array.isArray(topics) || topics.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-muted-foreground mb-4 text-lg">No courses available.</p>
            <p className="text-sm text-gray-400 mb-6">
              Please ensure the backend is running and data is seeded.
            </p>
=======
            <div className="w-12 h-12 border-4 border-slate-800 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 animate-pulse">Loading topics...</p>
          </div>
        ) : !Array.isArray(topics) || topics.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <p className="text-slate-400 mb-4 text-lg">No topics available.</p>
            <p className="text-sm text-slate-500 mb-6">
              Please ensure the backend is running and data is seeded.
            </p>
            <div className="inline-block text-left bg-slate-950 p-6 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
              <div className="mb-2">$ python manage.py runserver</div>
              <div>$ python manage.py seed_data</div>
            </div>
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 px-4">
            {topics.map((topic, index) => {
              const topicNameLower = topic.name.toLowerCase();
              const Icon = topicIcons[topicNameLower] || topicIcons.default;
              const isSelected = selectedTopics.includes(topic.id);

<<<<<<< HEAD
=======
              // Map old colors to accessible semantic colors if needed, or just use a standard accent
              // We'll stick to a clean blue/primary accent for selection to keep it "classic premium"

>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
              return (
                <button
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`
                    group relative p-6 rounded-2xl border transition-all duration-300 text-left
<<<<<<< HEAD
                    flex items-start gap-4 hover:shadow-xl hover:-translate-y-1
                    ${isSelected
                      ? "bg-ohg-navy border-ohg-navy shadow-lg shadow-ohg-navy/20"
                      : "bg-white border-gray-100 hover:border-ohg-teal/30 hover:bg-white"
=======
                    flex items-start gap-4 hover:shadow-lg
                    ${isSelected
                      ? "bg-slate-900 border-primary shadow-[0_0_20px_-10px_rgba(var(--primary),0.3)]"
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                    }
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div
                    className={`
                    p-3 rounded-xl transition-all duration-300 shrink-0
                    ${isSelected
<<<<<<< HEAD
                        ? "bg-white/10 text-white"
                        : "bg-ohg-teal/10 text-ohg-teal group-hover:bg-ohg-teal group-hover:text-white"
=======
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                      }
                  `}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3
<<<<<<< HEAD
                        className={`text-lg font-bold truncate pr-2 transition-colors ${isSelected ? "text-white" : "text-ohg-navy group-hover:text-ohg-navy"
=======
                        className={`text-lg font-semibold truncate pr-2 transition-colors ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                          }`}
                      >
                        {topic.name}
                      </h3>
                      {isSelected && (
<<<<<<< HEAD
                        <div className="w-5 h-5 rounded-full bg-ohg-orange flex items-center justify-center shrink-0 animate-scale-in shadow-sm">
                          <span className="text-white text-[10px] font-bold">✓</span>
=======
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 animate-scale-in">
                          <span className="text-primary-foreground text-[10px] font-bold">✓</span>
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                        </div>
                      )}
                    </div>

                    {topic.question_count > 0 && (
<<<<<<< HEAD
                      <p className={`text-xs mt-1 font-medium ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
=======
                      <p className="text-xs text-slate-500 mt-1 font-medium">
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
                        {topic.question_count} question{topic.question_count !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pb-12">
          <Button
            onClick={handleStart}
            disabled={selectedTopics.length === 0}
            className={`
<<<<<<< HEAD
              px-16 py-8 text-xl rounded-full font-bold transition-all duration-300
              ${selectedTopics.length === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-ohg-orange text-white hover:bg-ohg-orange-hover shadow-xl hover:shadow-ohg-orange/30 hover:scale-105"
=======
              px-16 py-8 text-xl rounded-full font-semibold transition-all duration-300
              ${selectedTopics.length === 0
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-white text-slate-950 hover:bg-slate-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:scale-105"
>>>>>>> 7319702edcefb52fb24d75d05142ff3ef6bb30ad
              }
            `}
          >
            Start Interview
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelection;
