import React from "react";
import { Command, ChevronUp, ChevronDown } from "lucide-react"; // Import icons from Lucide

const ShortcutKey = ({ keys }: { keys: string[] }) => {
  return (
    <div className="flex items-center space-x-1">
      {keys.map((key, index) => (
        <div
          key={index}
          className="flex items-center justify-center px-2 py-1 bg-gray-200 text-gray-800 rounded-md shadow-sm text-sm font-medium"
        >
          {key === "⌘" ? (
            <Command className="w-4 h-4 text-primary" />
          ) : key === "ArrowUp" ? (
            <ChevronUp className="w-4 h-4 text-primary" />
          ) : key === "ArrowDown" ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            key
          )}
        </div>
      ))}
    </div>
  );
};

export default ShortcutKey;
