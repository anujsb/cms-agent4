// components/UserOrders.tsx
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserOrder {
  orderId: string;
  productName: string;
  inServiceDate: string;
  outServiceDate: string | null;
  plan: string;
  status: string;
}

interface UserOrdersProps {
  userId: string;
  refreshTrigger?: string; // Trigger refresh when this value changes
}

export default function UserOrders({ userId, refreshTrigger }: UserOrdersProps) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders?userId=${userId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId, refreshTrigger]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'expired':
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Orders</CardTitle>
          <CardDescription>View and manage your current services</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={fetchOrders} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-red-500 text-center py-6">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No orders found. Place your first order to get started.
          </div>
        ) : (
          <Table>
            <TableCaption>A list of your recent orders and services.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell className="font-medium">{order.orderId}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>{order.plan}</TableCell>
                  <TableCell>{order.inServiceDate}</TableCell>
                  <TableCell>{order.outServiceDate || "—"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}