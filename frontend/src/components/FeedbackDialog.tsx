import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

export function FeedbackDialog() {
  const [feedback, setFeedback] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useUser();

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: import.meta.env.VITE_SERVICE_ID,
            template_id: import.meta.env.VITE_TEMPLATE_ID,
            user_id: import.meta.env.VITE_USER_ID,
            template_params: {
              subject: `Bangr | Feedback from ${user?.username || "Anonymous"}`,
              message: feedback,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      setFeedback("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="text-white/50 hover:text-white/70 p-1.5 hover:bg-white/5 rounded-md transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="sr-only">Send Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[425px] bg-black/40 backdrop-blur-md overflow-hidden rounded-xl border border-white/5",
          "before:absolute before:inset-0 before:bg-gradient-to-tr before:from-purple/5 before:via-transparent before:to-purple/10",
          "after:absolute after:inset-0 after:bg-gradient-to-bl after:from-purple/5 after:via-transparent after:to-purple/10 w-80"
        )}
      >
        <div className="relative z-10">
          <DialogHeader className="px-6 py-4">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple/20 to-transparent" />
            <DialogDescription className="text-white/70">
              Is there anything not working well? Do you have a feature
              suggestion for the next version?
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <textarea
              id="feedback"
              placeholder="Type your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px] w-full rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm text-white/90 placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-white/5">
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-purple/20 hover:bg-purple/30 text-purple border border-purple/20"
            >
              {isSubmitting ? "Sending..." : "Send Feedback"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
