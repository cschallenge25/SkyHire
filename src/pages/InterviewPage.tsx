import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import recruiterAnim from "../assets/recruiter.json";
import SkyRecruiterContainer from "./skyrecruiter/SkyRecruiterContainer";

interface FeedbackItem {
  label: string;
  score: number;
  color: string;
}

const InterviewPage: React.FC = () => {
  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const [feedback] = useState<FeedbackItem[]>([
    { label: "Well-groomed", score: 8.9, color: "#6D5AE6" },
    { label: "Warmth", score: 8.9, color: "#E7C64A" },
    { label: "Confidence", score: 9.3, color: "#E86D4A" },
    { label: "Emotions", score: 9.5, color: "#4AE8C1" },
    { label: "Relevance", score: 8.7, color: "#5AA2E6" },
  ]);

  const startInterview = async () => {
      setIsInterviewActive(true);
  };

  // simulate elapsed time
  useEffect(() => {
    if (!isInterviewActive) return;
    // Timer logic can be added here if needed
  }, [isInterviewActive]);

  return (
    
      <div className="max-w-7xl mx-auto py-10">
        {/* --- Header --- */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 font-emirates mb-2">
            A.I. interview simulator
          </h2>
          <p className="text-gray-600 font-montessart">
            Practice real aviation industry interviews with A.I. feedback
          </p>
        </div>

        {/* --- Main content (video + feedback) --- */}
        <div className="flex flex-col lg:flex-row justify-center gap-8">
          {/* Left panel (Recruiter + preview + control bar) */}
          <div className="relative bg-white border border-gray-200 rounded-2xl shadow-lg flex-1 h-[460px] flex items-center justify-center overflow-hidden">
            {/* --- Lottie Animation stays always --- */}
            {!isInterviewActive && (<div className="w-full h-full flex items-center justify-center">
              <Lottie animationData={recruiterAnim} loop={true} />
            </div>)}

            {isInterviewActive && (
                <SkyRecruiterContainer/>
            )}

            {/* --- Start button (only when inactive) --- */}
            {!isInterviewActive && (
              <div className="absolute bottom-8 flex flex-col items-center">
                <p className="font-montessart text-gray-700 mb-3">
                  Ready to start your mock interview?
                </p>
                <button
                  onClick={startInterview}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-montessart hover:bg-secondary transition-colors"
                >
                  Start Interview
                </button>
              </div>
            )}
          </div>

          {/* --- Feedback section (identical style) --- */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-md w-full lg:w-80 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 font-emirates">
              A.I. Feedback
            </h3>

            <div className="flex flex-col gap-5">
              {feedback.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 font-montessart">
                      {item.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.color }}
                    >
                      {item.score}/10
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${(item.score / 10) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default InterviewPage;
