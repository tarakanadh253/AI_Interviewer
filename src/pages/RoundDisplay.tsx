import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiService, Round, InterviewSession } from "@/lib/api";
import { ArrowLeft, CheckCircle, Lock, Play, Star, ChevronDown, Trophy, Loader2 } from "lucide-react";

const RoundDisplay = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { courseId, level } = location.state || {};

    const [rounds, setRounds] = useState<Round[]>([]);
    const [sessions, setSessions] = useState<InterviewSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!courseId || !level) {
            toast({
                title: "Missing Information",
                description: "Please select a course and level first.",
                variant: "destructive",
            });
            navigate("/topic-selection");
            return;
        }

        const fetchData = async () => {
            try {
                const username = localStorage.getItem('username');

                // Fetch rounds and sessions in parallel
                const promises: Promise<any>[] = [
                    apiService.getRounds(courseId, level),
                ];

                if (username) {
                    promises.push(apiService.getSessionsByUsername(username));
                }

                const results = await Promise.all(promises);
                const fetchedRounds = results[0];
                const fetchedSessions = username ? results[1] : [];

                setRounds(fetchedRounds);
                setSessions(fetchedSessions);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load rounds. Please try again.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [courseId, level, navigate, toast]);

    const isRoundCompleted = (roundId: number) => {
        return sessions.some(s => s.round === roundId && s.status === 'COMPLETED');
    };

    const activeRoundSession = (roundId: number) => {
        return sessions.find(s => s.round === roundId && (s.status === 'CREATED' || s.status === 'IN_PROGRESS'));
    };

    const handleStartRound = async (roundId: number) => {
        const username = localStorage.getItem('username');
        if (!username) {
            navigate("/login");
            return;
        }

        // Check if there is already an active session for this round
        const active = activeRoundSession(roundId);
        if (active) {
            localStorage.setItem('session_id', active.id.toString());
            navigate("/interview");
            return;
        }

        try {
            const session = await apiService.createSession(username, [courseId], roundId);

            // Reset Exam Proctoring
            localStorage.removeItem('exam_is_banned');
            localStorage.removeItem('exam_tab_switch_count');

            localStorage.setItem('session_id', session.id.toString());
            navigate("/interview");
        } catch (error: any) {
            console.error("Error starting round:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to start round",
                variant: "destructive"
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-ohg-orange" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center relative overflow-hidden text-ohg-grey">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ohg-navy/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ohg-orange/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl w-full relative z-10">
                <div className="mb-8 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/level-selection", { state: { courseId } })}
                        className="text-muted-foreground hover:text-ohg-navy"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Levels
                    </Button>

                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-ohg-navy/10 text-ohg-navy font-semibold text-xs uppercase tracking-wider">
                            {level}
                        </span>
                    </div>
                </div>

                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-ohg-navy mb-6 tracking-tight">
                        Interview Roadmap
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Complete each round to unlock the next challenge.
                    </p>
                </div>

                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 top-8 bottom-8 w-1 bg-gray-200 -translate-x-1/2 z-0 hidden md:block" />

                    <div className="space-y-12 relative z-10 px-4">
                        {rounds.map((round, index) => {
                            const isCompleted = isRoundCompleted(round.id);
                            const isUnlocked = index === 0 || isRoundCompleted(rounds[index - 1].id);
                            const isActive = activeRoundSession(round.id);

                            return (
                                <div key={round.id} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="flex-1 w-full md:w-auto">
                                        <Card className={`p-6 border-0 shadow-lg transition-all duration-300 ${!isUnlocked ? 'opacity-50 grayscale' : 'hover:scale-105'} 
                                    ${isCompleted ? 'bg-emerald-50/50' : 'bg-white/80 backdrop-blur'}
                                 `}>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    Round {index + 1}
                                                </span>
                                                {isCompleted && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                                {!isUnlocked && <Lock className="h-5 w-5 text-gray-400" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-ohg-navy mb-2">{round.name}</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {round.question_count} Questions
                                            </p>
                                            <Button
                                                className={`w-full ${isCompleted ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-ohg-orange hover:bg-ohg-orange-hover'}`}
                                                disabled={!isUnlocked}
                                                onClick={() => handleStartRound(round.id)}
                                            >
                                                {isCompleted ? "Review Results" : isActive ? "Resume Round" : "Start Round"}
                                                {!isCompleted && <Play className="ml-2 h-4 w-4" />}
                                            </Button>
                                        </Card>
                                    </div>

                                    {/* Center Node */}
                                    <div className={`relative flex-shrink-0 hidden md:flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-xl z-20 
                                ${isCompleted ? 'bg-emerald-500' : isUnlocked ? 'bg-ohg-orange' : 'bg-gray-200'}
                             `}>
                                        {isCompleted ? (
                                            <Trophy className="h-5 w-5 text-white" />
                                        ) : (
                                            <span className={`font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{index + 1}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 hidden md:block" />
                                </div>
                            );
                        })}

                        {rounds.length === 0 && (
                            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-dashed text-muted-foreground">
                                No rounds found for this level. Please contact admin.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoundDisplay;
