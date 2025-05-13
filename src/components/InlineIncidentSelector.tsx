"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InlineIncidentSelectorProps {
  onIncidentSelected: (category: string, description: string) => void;
  onCancel: () => void;
}

const incidentCategories = [
  {
    id: "internet",
    name: "Internet Issues",
    icon: "📶",
    commonIssues: [
      "Slow internet connection",
      "No internet connection",
      "Intermittent connection",
      "WiFi not working"
    ]
  },
  {
    id: "tv",
    name: "TV Service Issues",
    icon: "📺",
    commonIssues: [
      "No signal",
      "Poor picture quality",
      "Channel not available",
      "TV box not working"
    ]
  },
  {
    id: "phone",
    name: "Phone Issues",
    icon: "📱",
    commonIssues: [
      "No signal",
      "Can't make calls",
      "Poor call quality",
      "SMS not working"
    ]
  },
  {
    id: "other",
    name: "Other Issues",
    icon: "❓",
    commonIssues: []
  }
];

export default function InlineIncidentSelector({ onIncidentSelected, onCancel }: InlineIncidentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [customIssue, setCustomIssue] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedIssue(null);
    setShowCustomInput(categoryId === "other");
  };

  const handleIssueSelect = (issue: string) => {
    setSelectedIssue(issue);
    setShowCustomInput(false);
  };

  const handleSubmit = () => {
    if (selectedCategory) {
      const category = incidentCategories.find(c => c.id === selectedCategory)?.name || selectedCategory;
      const description = showCustomInput ? customIssue : (selectedIssue || "");
      if (description) {
        onIncidentSelected(category, description);
      }
    }
  };

  return (
    <Card className="w-full border border-yellow-100 bg-yellow-50/50 mt-2">
      <CardContent className="p-3">
        <div className="text-sm font-medium mb-2">Select the type of issue you're experiencing:</div>
        
        <div className="grid grid-cols-2 gap-2 mb-3">
          {incidentCategories.map(category => (
            <div
              key={category.id}
              className={`
                relative p-2 border rounded cursor-pointer
                ${selectedCategory === category.id
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-200 hover:border-yellow-300'
                }
              `}
              onClick={() => handleCategorySelect(category.id)}
            >
              <div className="flex items-center">
                <span className="mr-2">{category.icon}</span>
                <span className="font-medium text-sm">{category.name}</span>
              </div>
              {selectedCategory === category.id && (
                <CheckCircle size={14} className="absolute top-2 right-2 text-yellow-600" />
              )}
            </div>
          ))}
        </div>

        {selectedCategory && selectedCategory !== "other" && (
          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Select the specific issue:</div>
            <div className="grid grid-cols-2 gap-2">
              {incidentCategories
                .find(c => c.id === selectedCategory)
                ?.commonIssues.map(issue => (
                  <div
                    key={issue}
                    className={`
                      relative p-2 border rounded cursor-pointer text-sm
                      ${selectedIssue === issue
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-300'
                      }
                    `}
                    onClick={() => handleIssueSelect(issue)}
                  >
                    {issue}
                    {selectedIssue === issue && (
                      <CheckCircle size={14} className="absolute top-2 right-2 text-yellow-600" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {showCustomInput && (
          <div className="mt-3">
            <div className="text-sm font-medium mb-2">Describe your issue:</div>
            <Input
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
              placeholder="Please describe your issue..."
              className="mb-2"
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="text-gray-600"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedCategory || (!selectedIssue && !customIssue)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <AlertCircle size={14} className="mr-2" />
            Submit Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 