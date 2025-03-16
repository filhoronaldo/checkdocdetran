
import { ChecklistItem as ChecklistItemType } from "@/types";
import { motion } from "framer-motion";
import { Check, FileText, Copy, FileDigit, Files } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  alternativeItems?: ChecklistItemType[];
}

export default function ChecklistItem({ item, onToggle, alternativeItems = [] }: ChecklistItemProps) {
  const hasAlternatives = alternativeItems.length > 0;
  const isAnyAlternativeCompleted = alternativeItems.some(alt => alt.isCompleted);
  
  // If this item has alternatives and any of them are completed,
  // we consider the whole group completed
  const effectivelyCompleted = item.isCompleted || 
    (hasAlternatives && isAnyAlternativeCompleted);

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
    if (!tags || tags.length === 0) return null;

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

  const renderAlternatives = () => {
    if (!hasAlternatives) return null;

    return (
      <div className="ml-6 pl-3 border-l-2 border-gray-200 mt-2 space-y-1">
        <div className="text-xs text-gray-500 mb-1">Qualquer uma destas opções atende:</div>
        {alternativeItems.map(alt => (
          <motion.div
            key={alt.id}
            layout
            className={cn(
              "rounded-md p-2 mb-1 flex items-start gap-3 cursor-pointer transition-all duration-300",
              alt.isCompleted 
                ? "bg-completed/10" 
                : "bg-card/50 hover:bg-card"
            )}
            onClick={() => onToggle(alt.id)}
          >
            <div 
              className={cn(
                "mt-0.5 w-4 h-4 rounded-full flex-shrink-0 border transition-colors duration-300",
                alt.isCompleted 
                  ? "bg-completed border-completed" 
                  : "border-muted-foreground/30"
              )}
            >
              {alt.isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="flex items-center justify-center w-full h-full"
                >
                  <Check className="h-2.5 w-2.5 text-white" />
                </motion.div>
              )}
            </div>
            <div className="flex-1">
              <div 
                className={cn(
                  "text-sm transition-colors duration-300",
                  alt.isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                )}
              >
                {alt.text}
              </div>
              {renderTags(alt.tags)}
              {alt.observation && (
                <div 
                  className={cn(
                    "text-xs mt-1",
                    alt.isCompleted ? "text-muted-foreground/70 line-through" : "text-muted-foreground"
                  )}
                >
                  {alt.observation}
                </div>
              )}
            </div>
          </motion.div>
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
        "border border-border/50 rounded-lg p-4 mb-2 flex flex-col cursor-pointer transition-all duration-300",
        effectivelyCompleted 
          ? "bg-completed/10 border-completed/30" 
          : "bg-card/50 hover:bg-card",
        item.isOptional ? "border-l-4 border-l-amber-400" : ""
      )}
      onClick={() => onToggle(item.id)}
    >
      <div className="flex items-start gap-3">
        <div 
          className={cn(
            "mt-0.5 w-5 h-5 rounded-full flex-shrink-0 border transition-colors duration-300",
            effectivelyCompleted 
              ? "bg-completed border-completed" 
              : "border-muted-foreground/30"
          )}
        >
          {effectivelyCompleted && (
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
                effectivelyCompleted ? "text-muted-foreground line-through" : "text-foreground"
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
                effectivelyCompleted ? "text-muted-foreground/70 line-through" : "text-muted-foreground"
              )}
            >
              {item.observation}
            </div>
          )}
        </div>
      </div>
      
      {renderAlternatives()}
    </motion.div>
  );
}
