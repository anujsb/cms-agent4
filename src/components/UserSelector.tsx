// app/components/UserSelector.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCircle2, AlertCircle, Users, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
}

interface UserSelectorProps {
  onUserChange: (userId: string) => void;
}

export default function UserSelector({ onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);

  // Use useEffect with empty dependency array to fetch users only once
  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
          // Only set selected user and call onUserChange on initial load
          if (initialLoad) {
            setSelectedUser(data[0].id);
            onUserChange(data[0].id);
            setInitialLoad(false);
          }
        } else {
          setUsers([]);
          setError("No users available");
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError(error instanceof Error ? error.message : "Failed to load users");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []); // Empty dependency array to run only once

  // Create a stable handler function that doesn't change on re-renders
  const handleChange = useCallback((value: string) => {
    setSelectedUser(value);
    onUserChange(value);
  }, [onUserChange]);

  if (loading) {
    return (
      <div className="relative">
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="absolute top-2 left-4">
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 border border-red-200 rounded-md bg-red-50 text-red-700 shadow-sm">
        <AlertCircle size={16} className="flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 shadow-sm">
        <Users size={16} className="flex-shrink-0" />
        <p className="text-sm font-medium">No users available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Select value={selectedUser} onValueChange={handleChange}>
        <SelectTrigger className="w-full bg-white border-gray-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all duration-200 pl-9">
          <SelectValue placeholder="Select a customer" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          <div className="p-2 bg-gray-50 border-b flex items-center">
            <Search size={14} className="text-gray-500 mr-2" />
            <span className="text-sm text-gray-600 font-medium">Customer List</span>
          </div>
          {users.map((user) => (
            <SelectItem 
              key={user.id} 
              value={user.id}
              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCircle2 size={16} className="text-blue-600" />
                <span>{user.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <UserCircle2 size={16} />
      </div>
    </div>
  );
}