"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, TrendingUp, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  orderId: string;
  orderProductId: string;
  productName: string;
  inServiceDate: string;
  outServiceDate: string | null;
  plan: string;
  status: string;
  createDate: string;
}

interface OrderAnalysisProps {
  userId: string;
  onUpsellClick: (productName: string, lastPlan: string) => void;
}

export default function OrderAnalysis({ userId, onUpsellClick }: OrderAnalysisProps) {
  const [mostUsedProduct, setMostUsedProduct] = useState<{
    productName: string;
    count: number;
    lastPlan: string;
    lastPurchaseDate: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserOrders() {
      try {
        const response = await fetch(`/api/users/${userId}`);
        if (response.ok) {
          const data = await response.json();
          const orders = data.orders || [];

          // Analyze orders to find most used product
          const productCounts = new Map<string, { 
            count: number; 
            lastPlan: string;
            lastPurchaseDate: string;
          }>();
          
          orders.forEach((order: Order) => {
            if (order.outServiceDate) { // Only consider completed/expired orders
              const current = productCounts.get(order.productName) || { 
                count: 0, 
                lastPlan: order.plan,
                lastPurchaseDate: order.inServiceDate
              };
              productCounts.set(order.productName, {
                count: current.count + 1,
                lastPlan: order.plan,
                lastPurchaseDate: order.inServiceDate > current.lastPurchaseDate ? 
                  order.inServiceDate : current.lastPurchaseDate
              });
            }
          });

          // Find the most used product
          let maxCount = 0;
          let mostUsed = null;
          
          productCounts.forEach((value, productName) => {
            if (value.count > maxCount) {
              maxCount = value.count;
              mostUsed = {
                productName,
                count: value.count,
                lastPlan: value.lastPlan,
                lastPurchaseDate: value.lastPurchaseDate
              };
            }
          });

          setMostUsedProduct(mostUsed);
        }
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUserOrders();
    }
  }, [userId]);

  const handleUpsell = () => {
    if (mostUsedProduct) {
      onUpsellClick(mostUsedProduct.productName, mostUsedProduct.lastPlan);
    }
  };

  if (loading) {
    return (
      <Card className="mt-4 bg-gray-50 animate-pulse">
        <div className="p-6 flex items-center justify-center">
          <div className="h-6 w-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!mostUsedProduct) {
    return null;
  }

  const lastPurchaseDate = new Date(mostUsedProduct.lastPurchaseDate).toLocaleDateString();

  return (
    <Card className="shadow-md border-0 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
      <div className="py-3 px-5 bg-blue-600 text-white">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-blue-100" />
          <h1 className="text-sm font-semibold tracking-wide">UPSELL OPPORTUNITY</h1>
        </div>
      </div>
      
      <CardContent className="">
        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
                <ShoppingCart size={16} />
              </div>
              <span className="font-medium text-gray-700">Purchase Analysis</span>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border-0">
              {mostUsedProduct.count} {mostUsedProduct.count === 1 ? "purchase" : "purchases"}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="text-gray-500">Most purchased:</div>
            <div className="font-medium text-gray-800 break-words">{mostUsedProduct.productName}</div>
            
            <div className="text-gray-500">Last purchase:</div>
            <div className="font-medium text-gray-800">{lastPurchaseDate}</div>
            
            <div className="text-gray-500">Current plan:</div>
            <div className="font-medium text-gray-800">{mostUsedProduct.lastPlan}</div>
          </div>
        </div>
        
        {/* <Button 
          onClick={handleUpsell}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 flex items-center justify-center gap-2 rounded-lg"
        >
          <span>View Upsell Options</span>
          <ArrowRight size={16} />
        </Button> */}
      </CardContent>
    </Card>
  );
}