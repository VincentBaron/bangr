import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useUser();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubscribe = async () => {
    setShowTooltip(true);
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
              subject: `Bangr | Subscription Interest from ${
                user?.username || "Anonymous"
              }`,
              message: `User ${user?.username || "Anonymous"} (ID: ${
                user?.id || "Unknown"
              }) wants to subscribe to the premium plan.`,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Failed to send subscription notification:", error);
    }

    // Hide tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-black/95 backdrop-blur-md border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple to-pink-500 bg-clip-text text-transparent">
            Win Concert Tickets & Support Artists
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Join our community of music lovers and support emerging artists
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Music Supporter
            </h3>
            <div className="text-purple font-bold">€5/month</div>
          </div>

          <ul className="space-y-3 mb-6">
            {[
              "Enter monthly concert ticket prize pools",
              "Unlimited access to all playlists",
              "Support emerging artists directly",
              "Exclusive access to private shows",
              "Early access to new features",
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-white/80">
                <Check className="w-5 h-5 text-purple" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <TooltipProvider>
            <Tooltip open={showTooltip}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSubscribe}
                  className={cn(
                    "relative w-full py-2.5 rounded-lg font-medium transition-all duration-300 overflow-hidden",
                    "bg-gradient-to-r from-purple via-purple/80 to-pink-500/50",
                    "hover:from-purple/90 hover:via-purple/70 hover:to-pink-500/40",
                    "before:absolute before:inset-0 before:bg-black/40 before:backdrop-blur-md",
                    "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:to-transparent"
                  )}
                >
                  <span className="relative z-10 text-white/90">
                    Subscribe Now
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className={cn(
                  "px-4 py-2 rounded-lg relative overflow-hidden",
                  "bg-black/40 backdrop-blur-md border border-white/5",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple/20 before:via-purple/10 before:to-transparent",
                  "after:absolute after:inset-0 after:bg-gradient-to-b after:from-purple/20 after:via-transparent after:to-purple/10"
                )}
              >
                <div className="relative z-10">
                  <p className="text-white/90 font-medium">
                    Pricing is coming soon but thanks for your interest ;)
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="mt-4 text-center text-sm text-white/50">
          Cancel anytime. No commitment required.
        </div>
      </DialogContent>
    </Dialog>
  );
};
