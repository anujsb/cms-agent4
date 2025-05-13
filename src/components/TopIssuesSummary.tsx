// src/components/TopIssuesSummary.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IssueSummary {
  category: string;
  count: number;
  description: string;
  status: string;
  id: string;
}

interface TopIssuesSummaryProps {
  userId: string;
}

export default function TopIssuesSummary({ userId }: TopIssuesSummaryProps) {
  const [loading, setLoading] = useState(true);
  const [issuesSummary, setIssuesSummary] = useState<IssueSummary[]>([]);
  const [filterBy, setFilterBy] = useState<string>("all");

  useEffect(() => {
    if (!userId) return;

    async function fetchIssueSummary() {
      setLoading(true);
      try {
        // Fetch the raw user data first
        const userResponse = await fetch(`/api/users/${userId}`);
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await userResponse.json();

        // Call Gemini API to analyze and categorize the issues
        const analyzeResponse = await fetch("/api/analyze-issues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            incidents: userData.incidents,
          }),
        });

        if (!analyzeResponse.ok) {
          throw new Error("Failed to analyze issues");
        }

        const { categorizedIssues } = await analyzeResponse.json();
        setIssuesSummary(categorizedIssues);
      } catch (error) {
        console.error("Error in issue analysis:", error);
        setIssuesSummary([]);
      } finally {
        setLoading(false);
      }
    }

    fetchIssueSummary();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case "open":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "cancelled":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "billing":
        return "💰";
      case "network":
        return "🌐";
      case "plan":
      case "subscription":
        return "📅";
      case "hardware":
      case "device":
        return "💻";
      case "customer service":
      case "support":
        return "🛟";
      default:
        return "📋";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "billing":
        return "text-purple-500 border-purple-200 bg-purple-50";
      case "network":
        return "text-blue-500 border-blue-200 bg-blue-50";
      case "plan":
      case "subscription":
        return "text-green-500 border-green-200 bg-green-50";
      case "hardware":
      case "device":
        return "text-orange-500 border-orange-200 bg-orange-50";
      case "customer service":
      case "support":
        return "text-teal-500 border-teal-200 bg-teal-50";
      default:
        return "text-gray-500 border-gray-200 bg-gray-50";
    }
  };

  const filteredIssues =
    filterBy === "all"
      ? issuesSummary
      : issuesSummary.filter(
          (issue) => issue.status.toLowerCase() === filterBy
        );

  const uniqueStatuses = Array.from(
    new Set(issuesSummary.map((issue) => issue.status.toLowerCase()))
  );

  if (loading) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="py-3 px-4 border-b border-gray-100">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <TrendingUp size={16} className="text-gray-500" />
            TOP ISSUES SUMMARY
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!issuesSummary.length) {
    return (
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="py-3 px-4 border-b border-gray-100">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
            <TrendingUp size={16} className="text-gray-500" />
            TOP ISSUES SUMMARY
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center py-8">
          <div className="flex flex-col items-center justify-center text-gray-500">
            <AlertCircle className="mb-3" size={24} />
            <p className="font-medium">No issues found</p>
            <p className="text-sm text-gray-400 mt-1">
              Customer has no reported issues
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-gray-700">
          <TrendingUp size={16} className="text-gray-500" />
          TOP ISSUES SUMMARY
        </CardTitle>

        {issuesSummary.length > 0 && (
          <div className="flex items-center">
            <Filter size={12} className="mr-2 text-gray-400" />
            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {uniqueStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="capitalize"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">
                No issues match the selected filter
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setFilterBy("all")}
              >
                Clear filter
              </Button>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex flex-col p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="mr-1">
                      {getCategoryIcon(issue.category)}
                    </span>
                    <Badge
                      className={`${getCategoryColor(
                        issue.category
                      )} px-2 py-0.5 rounded-md font-medium`}
                    >
                      {issue.category}
                    </Badge>
                  </div>
                  <div className="flex flex-col  items-end justify-between gap-2">
                    <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-100 rounded-md">
                      {issue.count} {issue.count === 1 ? "issue" : "issues"}
                    </span>
                    <Badge
                      className={`${getStatusColor(
                        issue.status
                      )} px-2 py-0.5 font-normal`}
                    >
                      {issue.status}
                    </Badge>
                  </div>
                </div>
                <p
                  className="text-sm text-gray-700 line-clamp-2"
                  title={issue.description}
                >
                  {issue.description}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
