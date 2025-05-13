// components/ProductSelector.tsx
"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Smartphone, Wifi, Tv, CreditCard } from "lucide-react";

interface ProductSelectorProps {
  onProductSelected: (product: string, plan: string) => void;
  onCancel: () => void;
}

type Plan = {
  id: string;
  name: string;
  price: string;
  data?: string;
  calls?: string;
  speed?: string;
  channels?: string;
  extras?: string;
};

export default function ProductSelector({ onProductSelected, onCancel }: ProductSelectorProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const products = [
    { id: "SIM", name: "SIM Card", icon: CreditCard, description: "Mobile SIM card for your phone" },
    { id: "Phone", name: "Mobile Phone", icon: Smartphone, description: "Latest smartphones with plans" },
    { id: "Internet", name: "Internet", icon: Wifi, description: "High-speed internet for your home" },
    { id: "TV", name: "Television", icon: Tv, description: "TV packages with premium channels" },
  ];

  const plans: Record<string, Plan[]> = {
    SIM: [
      { id: "Basic", name: "Basic", price: "€10/month", data: "5GB", calls: "100 min" },
      { id: "Premium", name: "Premium", price: "€20/month", data: "20GB", calls: "500 min" },
      { id: "Unlimited", name: "Unlimited", price: "€30/month", data: "Unlimited", calls: "Unlimited" },
      { id: "Family", name: "Family", price: "€45/month", data: "50GB shared", calls: "Unlimited" },
    ],
    Phone: [
      { id: "Basic", name: "Basic", price: "€25/month", data: "5GB", calls: "100 min" },
      { id: "Premium", name: "Premium", price: "€35/month", data: "20GB", calls: "500 min" },
      { id: "Unlimited", name: "Unlimited", price: "€45/month", data: "Unlimited", calls: "Unlimited" },
      { id: "Family", name: "Family", price: "€60/month", data: "50GB shared", calls: "Unlimited" },
    ],
    Internet: [
      { id: "Basic", name: "Basic", price: "€30/month", speed: "50 Mbps" },
      { id: "Premium", name: "Premium", price: "€45/month", speed: "300 Mbps" },
      { id: "Unlimited", name: "Unlimited", price: "€60/month", speed: "1 Gbps" },
      { id: "Family", name: "Family", price: "€70/month", speed: "1 Gbps", extras: "+ Wi-Fi mesh system" },
    ],
    TV: [
      { id: "Basic", name: "Basic", price: "€15/month", channels: "30+ channels" },
      { id: "Premium", name: "Premium", price: "€25/month", channels: "100+ channels" },
      { id: "Unlimited", name: "Unlimited", price: "€40/month", channels: "150+ channels + sports" },
      { id: "Family", name: "Family", price: "€50/month", channels: "200+ channels + kids + movies" },
    ]
  };

  const handleConfirm = () => {
    if (selectedProduct && selectedPlan) {
      onProductSelected(selectedProduct, selectedPlan);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Select a Product</CardTitle>
        <CardDescription>Choose the product and plan you want to order</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="product" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="product">Step 1: Choose Product</TabsTrigger>
            <TabsTrigger value="plan" disabled={!selectedProduct}>Step 2: Choose Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="product" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <Card 
                    key={product.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProduct === product.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {product.name}
                      </CardTitle>
                      <Icon size={18} className="text-blue-500" />
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-gray-500">{product.description}</p>
                    </CardContent>
                    {selectedProduct === product.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
            
            {selectedProduct && (
              <div className="flex justify-end mt-4">
                <Button onClick={() => (document.querySelector('[data-value="plan"]') as HTMLElement)?.click()}>
                  Next: Choose Plan
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plan" className="space-y-4">
            {selectedProduct && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans[selectedProduct as keyof typeof plans].map((plan) => (
                  <Card 
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {plan.name}
                      </CardTitle>
                      <div className="text-sm font-bold text-blue-600">
                        {plan.price}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs space-y-1">
                        {plan.data && <p>Data: {plan.data}</p>}
                        {plan.calls && <p>Calls: {plan.calls}</p>}
                        {plan.speed && <p>Speed: {plan.speed}</p>}
                        {plan.channels && <p>TV: {plan.channels}</p>}
                        {plan.extras && <p>Extras: {plan.extras}</p>}
                      </div>
                    </CardContent>
                    {selectedPlan === plan.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => (document.querySelector('[data-value="product"]') as HTMLElement)?.click()}>
                Back to Products
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={!selectedPlan}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Selection
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <div className="text-sm">
          {selectedProduct && selectedPlan ? (
            <span className="font-medium">
              Selected: <span className="text-blue-600">{selectedProduct}</span> with <span className="text-blue-600">{selectedPlan}</span> plan
            </span>
          ) : (
            <span className="text-gray-500">No selection yet</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}