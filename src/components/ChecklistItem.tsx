
import { ChecklistItem as ChecklistItemType } from "@/types";
import { motion } from "framer-motion";
import { Check, FileText, Copy, FileDigit, Files } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
}

export default function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  const getTagIcon = () => {
    switch (item.tag) {
      case 'Original':
        return <FileText className="h-3.5 w-3.5 text-blue-500" />;
      case 'Físico':
        return <Copy className="h-3.5 w-3.5 text-amber-500" />;
      case 'Digital':
        return <FileDigit className="h-3.5 w-3.5 text-green-500" />;
      case 'Original e Cópia':
        return <Files className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return null;
    }
  };

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
      <div className="flex-1">
        <div 
          className={cn(
            "text-sm transition-colors duration-300 flex items-center gap-2",
            item.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {item.text}
          {item.tag && (
            <span className={cn(
              "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
              item.isCompleted ? "opacity-50" : "opacity-100",
              item.tag === 'Original' ? "bg-blue-100 text-blue-700" :
              item.tag === 'Físico' ? "bg-amber-100 text-amber-700" :
              item.tag === 'Digital' ? "bg-green-100 text-green-700" :
              "bg-purple-100 text-purple-700"
            )}>
              {getTagIcon()}
              {item.tag}
            </span>
          )}
        </div>
        {item.observation && (
          <div 
            className={cn(
              "text-xs mt-1",
              item.isCompleted ? "text-muted-foreground/70 line-through" : "text-muted-foreground"
            )}
          >
            {item.observation}
          </div>
        )}
      </div>
    </motion.div>
  );
}
