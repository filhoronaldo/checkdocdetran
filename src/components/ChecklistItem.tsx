
import { ChecklistItem as ChecklistItemType } from "@/types";
import { motion } from "framer-motion";
import { Check, FileText, Copy, FileDigit, Files, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  isInOptionalSection?: boolean;
  isInAlternativeSection?: boolean;
  isSectionCompleted?: boolean;
}

export default function ChecklistItem({ 
  item, 
  onToggle, 
  isInOptionalSection = false,
  isInAlternativeSection = false,
  isSectionCompleted = false
}: ChecklistItemProps) {
  // If this item is in an alternative section and the section is completed,
  // we should display it as effectively completed even if this specific item is not completed
  const effectivelyCompleted = item.isCompleted || 
    (isInAlternativeSection && isSectionCompleted);

  const getTagIcon = (tag: string) => {
    switch (tag) {
      case 'Original':
        return <FileText className="h-3.5 w-3.5 text-blue-500" />;
      case 'Físico':
        return <Copy className="h-3.5 w-3.5 text-amber-500" />;
      case 'Digital':
        return <FileDigit className="h-3.5 w-3.5 text-green-500" />;
      case 'Original e Cópia':
        return <Files className="h-3.5 w-3.5 text-purple-500" />;
      case 'Digital ou Físico':
        return <FileDigit className="h-3.5 w-3.5 text-teal-500" />;
      default:
        return null;
    }
  };

  const renderTags = (tags?: string[]) => {
    // Make sure tags is an array, even if it's undefined or null
    if (!tags || !Array.isArray(tags) || tags.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {tags.map((tag) => (
          <span key={tag} className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
            effectivelyCompleted ? "opacity-50" : "opacity-100",
            tag === 'Original' ? "bg-blue-100 text-blue-700" :
            tag === 'Físico' ? "bg-amber-100 text-amber-700" :
            tag === 'Digital' ? "bg-green-100 text-green-700" :
            tag === 'Digital ou Físico' ? "bg-teal-100 text-teal-700" :
            "bg-purple-100 text-purple-700"
          )}>
            {getTagIcon(tag)}
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "border border-border/50 rounded-lg p-4 mb-2 transition-all duration-300",
        effectivelyCompleted 
          ? "bg-completed/10 border-completed/30" 
          : "bg-card/50 hover:bg-card",
        item.isOptional ? "border-l-4 border-l-amber-400" : "",
        isInAlternativeSection ? "border-l-4 border-l-blue-400" : ""
      )}
    >
      {isInOptionalSection && (
        <div className="mb-2 text-xs font-medium flex items-center text-amber-600 gap-1">
          <AlertCircle className="h-3.5 w-3.5" />
          Só em casos específicos
        </div>
      )}
      
      <div className="flex items-start gap-3 cursor-pointer" onClick={() => onToggle(item.id)}>
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
          <div className="flex items-start gap-2">
            <div 
              className={cn(
                "text-sm transition-colors duration-300 flex-1",
                effectivelyCompleted 
                  ? "text-completed line-through"
                  : "text-foreground"
              )}
            >
              {item.text}
              {item.isOptional && (
                <span className="ml-2 text-xs text-amber-500 font-medium">(Opcional)</span>
              )}
            </div>
          </div>
          
          {renderTags(item.tags)}
          
          {item.observation && (
            <div 
              className={cn(
                "text-xs mt-1",
                effectivelyCompleted 
                  ? "text-completed/70 line-through"
                  : "text-muted-foreground"
              )}
            >
              {item.observation}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
