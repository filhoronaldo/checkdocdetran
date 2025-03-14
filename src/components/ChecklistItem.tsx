
import { ChecklistItem as ChecklistItemType } from "@/types";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
}

export default function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "border border-border/50 rounded-lg p-4 mb-2 flex items-start gap-3 cursor-pointer transition-all duration-300",
        item.isCompleted 
          ? "bg-completed/10 border-completed/30" 
          : "bg-card/50 hover:bg-card"
      )}
      onClick={() => onToggle(item.id)}
    >
      <div 
        className={cn(
          "mt-0.5 w-5 h-5 rounded-full flex-shrink-0 border transition-colors duration-300",
          item.isCompleted 
            ? "bg-completed border-completed" 
            : "border-muted-foreground/30"
        )}
      >
        {item.isCompleted && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center justify-center w-full h-full"
          >
            <Check className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </div>
      <div 
        className={cn(
          "text-sm transition-colors duration-300",
          item.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
        )}
      >
        {item.text}
      </div>
    </motion.div>
  );
}
