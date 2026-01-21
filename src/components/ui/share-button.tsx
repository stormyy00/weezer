import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { copyShareUrl, type ShareType } from "@/lib/share";
import { UploadIcon, CheckIcon } from "./icons";
import { updateEventSharedCount, updateOraganizationSharedCount } from "@/fn/stats";

interface ShareButtonProps {
  id: string;
  type: ShareType;
  variant?: "button" | "badge" | "icon";
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

/**
 * Reusable share button component for events and organizations
 * Copies share link to clipboard on click and updates share count
 */
export function ShareButton({
  id,
  type,
  variant = "button",
  className,
  size = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const success = await copyShareUrl({ id, type });

    if (success) {
      // Update share count in database
      type === 'event' ? 
        await updateEventSharedCount({ data: { eventId: id } }) :
        await updateOraganizationSharedCount({ data: { orgId: id } });

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Badge variant (used in event details)
  if (variant === "badge") {
    return (
      <Badge
        onClick={handleShare}
        variant="secondary"
        className={cn(
          "flex items-center gap-1 cursor-pointer hover:bg-secondary/80 dark:bg-ucr-blue/50 dark:hover:bg-ucr-blue/30 transition-colors",
          className
        )}
      >
        {copied ? (
          <CheckIcon size={16} className="text-ucr-blue dark:text-ucr-yellow shrink-0" />
        ) : (
          <UploadIcon size={16} className="text-ucr-blue dark:text-ucr-yellow shrink-0" />
        )}
        {copied ? "Copied" : "Share"}
      </Badge>
    );
  }

  // Icon only variant
  if (variant === "icon") {
    return (
      <button
        onClick={handleShare}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "h-9 w-9",
          className
        )}
        aria-label={copied ? "Copied" : "Share"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </button>
    );
  }

  // Default button variant
  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleShare}
      className={cn(
        "border-ucr-blue/40 text-ucr-blue hover:bg-ucr-blue/10 dark:border-ucr-gold/40 dark:text-ucr-yellow dark:hover:bg-ucr-gold/20 cursor-pointer duration-300",
        className
      )}
    >
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Copied
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </>
      )}
    </Button>
  );
}
