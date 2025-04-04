
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

export type OptionType = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: OptionType[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected = [],
  onChange,
  placeholder = "Select options",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (item: string) => {
    onChange((selected || []).filter((i) => i !== item));
  };

  const handleToggleItem = (value: string) => {
    // Create a safe copy of selected, ensuring it's never undefined
    const currentSelected = Array.isArray(selected) ? [...selected] : [];
    
    if (currentSelected.includes(value)) {
      onChange(currentSelected.filter((item) => item !== value));
    } else {
      onChange([...currentSelected, value]);
    }
  };

  // Ensure selected is always an array
  const safeSelected = Array.isArray(selected) ? selected : [];

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            className
          )}
        >
          {safeSelected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {safeSelected.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="mr-1 mb-1"
                >
                  {options.find((option) => option.value === item)?.label || item}
                  {!disabled && (
                    <button
                      className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(item);
                      }}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {!disabled && (
            <div className="ml-auto flex shrink-0 items-center self-center">
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No item found.</CommandEmpty>
          <ScrollArea className="h-60">
            <CommandGroup className="overflow-visible">
              {options.map((option) => {
                const isSelected = safeSelected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleToggleItem(option.value)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        id={`option-${option.value}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleItem(option.value)}
                      />
                      <label
                        htmlFor={`option-${option.value}`}
                        className="flex-grow cursor-pointer text-sm"
                      >
                        {option.label}
                      </label>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
