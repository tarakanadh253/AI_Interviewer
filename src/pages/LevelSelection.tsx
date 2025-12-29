import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Layers, Trophy } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const LevelSelection = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const courseId = location.state?.courseId;

    // Verify we have a courseId
    useEffect(() => {
        if (!courseId) {
            toast({
                title: "Error",
                description: "No course selected. Please go back.",
                variant: "destructive",
            });
            navigate("/topic-selection");
        }
    }, [courseId, navigate, toast]);

    const levels = [
        {
            id: "BEGINNER",
            name: "Beginner",
            description: "Start your journey with fundamental concepts and basic problem solving.",
            icon: BookOpen,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "hover:border-emerald-500/50",
        },
        {
            id: "INTERMEDIATE",
            name: "Intermediate",
            description: "Challenge yourself with complex scenarios and real-world applications.",
            icon: Layers,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "hover:border-blue-500/50",
        },
        {
            id: "ADVANCED",
            name: "Advanced",
            description: "Master the subject with deep dives into architecture and edge cases.",
            icon: Trophy,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "hover:border-purple-500/50",
        },
    ];

    const handleLevelSelect = (level: string) => {
        navigate("/rounds", { state: { courseId, level } });
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 flex flex-col items-center justify-center relative overflow-hidden text-ohg-grey">
            {/* Background Ambience */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ohg-navy/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-ohg-orange/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl w-full relative z-10">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/topic-selection")}
                        className="text-muted-foreground hover:text-ohg-navy"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                </div>

                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-5xl font-bold text-ohg-navy mb-6 tracking-tight">
                        Select Difficulty Level
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        Choose a level that matches your expertise to proceed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                    {levels.map((level, index) => {
                        const Icon = level.icon;
                        return (
                            <button
                                key={level.id}
                                onClick={() => handleLevelSelect(level.id)}
                                className={`
                  group relative p-8 rounded-3xl border border-gray-100 bg-white/80 backdrop-blur-sm
                  transition-all duration-300 text-left hover:shadow-2xl hover:-translate-y-2
                  ${level.border} flex flex-col items-center text-center h-full
                `}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={`p-6 rounded-2xl mb-6 transition-all duration-300 ${level.bg} group-hover:scale-110`}>
                                    <Icon className={`h-12 w-12 ${level.color}`} />
                                </div>

                                <h3 className="text-2xl font-bold text-ohg-navy mb-4 group-hover:text-ohg-orange transition-colors">
                                    {level.name}
                                </h3>

                                <p className="text-muted-foreground leading-relaxed">
                                    {level.description}
                                </p>

                                <div className="mt-8 px-6 py-2 rounded-full bg-gray-50 text-sm font-semibold text-gray-500 group-hover:bg-ohg-navy group-hover:text-white transition-all">
                                    Select
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LevelSelection;
