import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TutorialOverlayProps {
  tutorialStep: number;
  setTutorialStep: (step: number) => void;
}

const tutorialSteps = [
  "This is your live TradingView chart. Change tickers and timeframes here.",
  "AI Insights appear below — support, resistance, anomalies, filings, and news.",
  "Click 📌 to pin any insight to the chart as a line or flag.",
  "Clear All Overlays resets the chart instantly.",
  "Use the Market Scan tab to monitor system-wide market anomalies.",
  "Configure alerts and thresholds in the scan settings.",
  "You're ready — start analyzing with real-time AI insights!"
];

export function TutorialOverlay({ tutorialStep, setTutorialStep }: TutorialOverlayProps) {
  if (tutorialStep === 0 || tutorialStep > tutorialSteps.length) {
    return null;
  }

  const nextTutorial = () => {
    if (tutorialStep < tutorialSteps.length) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setTutorialStep(0);
    }
  };

  const skipTutorial = () => setTutorialStep(0);

  const progress = (tutorialStep / tutorialSteps.length) * 100;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="max-w-lg mx-4 shadow-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tutorial</span>
                <span>Step {tutorialStep} of {tutorialSteps.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <p className="text-foreground leading-relaxed">
              {tutorialSteps[tutorialStep - 1]}
            </p>
            
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={skipTutorial}>
                Skip Tutorial
              </Button>
              <Button onClick={nextTutorial}>
                {tutorialStep === tutorialSteps.length ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}