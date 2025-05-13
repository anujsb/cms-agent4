// // components/InlinePlanSelector.tsx
// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { CheckCircle, ShoppingCart } from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// interface InlinePlanSelectorProps {
//   onPlanSelected: (product: string, plan: string) => void;
//   initialProduct?: string;
// }

// const productIcons: Record<string, string> = {
//   SIM: "📱",
//   Phone: "📲",
//   Internet: "📶",
//   TV: "📺"
// };

// export default function InlinePlanSelector({ onPlanSelected, initialProduct }: InlinePlanSelectorProps) {
//   const [selectedProduct, setSelectedProduct] = useState<string>(initialProduct || "SIM");
//   const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

//   const products = ["SIM", "Phone", "Internet", "TV"];

//   const plans: Record<string, Array<{id: string, name: string, price: string, feature: string}>> = {
//     SIM: [
//       { id: "Basic", name: "Basic", price: "€10/mo", feature: "5GB data" },
//       { id: "Premium", name: "Premium", price: "€20/mo", feature: "20GB data" },
//       { id: "Unlimited", name: "Unlimited", price: "€30/mo", feature: "Unlimited data" },
//       { id: "Family", name: "Family", price: "€45/mo", feature: "50GB shared" }
//     ],
//     Phone: [
//       { id: "Basic", name: "Basic", price: "€25/mo", feature: "5GB data" },
//       { id: "Premium", name: "Premium", price: "€35/mo", feature: "20GB data" },
//       { id: "Unlimited", name: "Unlimited", price: "€45/mo", feature: "Unlimited data" },
//       { id: "Family", name: "Family", price: "€60/mo", feature: "50GB shared" }
//     ],
//     Internet: [
//       { id: "Basic", name: "Basic", price: "€30/mo", feature: "50 Mbps" },
//       { id: "Premium", name: "Premium", price: "€45/mo", feature: "300 Mbps" },
//       { id: "Unlimited", name: "Unlimited", price: "€60/mo", feature: "1 Gbps" },
//       { id: "Family", name: "Family", price: "€70/mo", feature: "1 Gbps + mesh" }
//     ],
//     TV: [
//       { id: "Basic", name: "Basic", price: "€15/mo", feature: "30+ channels" },
//       { id: "Premium", name: "Premium", price: "€25/mo", feature: "100+ channels" },
//       { id: "Unlimited", name: "Unlimited", price: "€40/mo", feature: "150+ sports" },
//       { id: "Family", name: "Family", price: "€50/mo", feature: "200+ channels" }
//     ]

//   };

//   return (
//     <Card className="w-full border border-blue-100 bg-blue-50/50 mt-2 overflow-hidden">
//       <CardContent className="p-3">
//         <Tabs defaultValue={selectedProduct} onValueChange={(val) => setSelectedProduct(val)}>
//           <TabsList className="grid grid-cols-4 mb-3 h-8 bg-blue-100/50">
//             {products.map(product => (
//               <TabsTrigger
//                 key={product}
//                 value={product}
//                 className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
//               >
//                 <span className="mr-1">{productIcons[product]}</span> {product}
//               </TabsTrigger>
//             ))}
//           </TabsList>

//           {products.map(product => (
//             <TabsContent key={product} value={product} className="mt-0">
//               <div className="grid grid-cols-2 gap-2">
//                 {plans[product].map(plan => (
//                   <div
//                     key={plan.id}
//                     className={`
//                       relative p-2 border rounded cursor-pointer text-xs
//                       ${selectedPlan === plan.id && selectedProduct === product
//                         ? 'border-blue-500 bg-blue-50'
//                         : 'border-gray-200 hover:border-blue-300'
//                       }
//                     `}
//                     onClick={() => setSelectedPlan(plan.id)}
//                   >
//                     <div className="font-medium">{plan.name}</div>
//                     <div className="flex justify-between items-center mt-1">
//                       <div className="text-gray-600">{plan.feature}</div>
//                       <div className="font-bold text-blue-600">{plan.price}</div>
//                     </div>
//                     {selectedPlan === plan.id && selectedProduct === product && (
//                       <CheckCircle size={14} className="absolute top-2 right-2 text-blue-600" />
//                     )}
//                   </div>
//                 ))}
//               </div>
//               <div className="flex justify-end mt-3">
//                 <Button
//                   size="sm"
//                   disabled={!selectedPlan}
//                   onClick={() => onPlanSelected(selectedProduct, selectedPlan!)}
//                   className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
//                 >
//                   <ShoppingCart size={12} className="mr-1" />
//                   Order {selectedProduct} {selectedPlan || ""}
//                 </Button>
//               </div>
//             </TabsContent>
//           ))}
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// }

// components/InlinePlanSelector.tsx
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { toast } from "@/components/ui/use-toast";
import { toast } from "sonner";

interface InlinePlanSelectorProps {
  onPlanSelected: (product: string, plan: string) => void;
  initialProduct?: string;
  userId: string;
  showToast?: boolean; // Add this optional prop with a default value of true
}

interface Product {
  id: number;
  productName: string;
  productTypeId: number;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  feature: string;
}

// Map for icons based on product name patterns
const getProductIcon = (productName: string): string => {
  if (productName.includes("Internet")) return "📶";
  if (productName.includes("TV")) return "📺";
  if (productName.includes("Phone")) return "📲";
  if (productName.includes("SIM")) return "📱";
  return "📦"; // Default icon
};

export default function InlinePlanSelector({
  onPlanSelected,
  initialProduct,
  userId,
  showToast = true 
}: InlinePlanSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [orderProcessing, setOrderProcessing] = useState<boolean>(false);

  // Plans for each product
  const getPlansForProduct = (productName: string): Plan[] => {
    if (productName.includes("Internet")) {
      return [
        { id: "Basic", name: "Basic", price: "€30/mo", feature: "50 Mbps" },
        {
          id: "Premium",
          name: "Premium",
          price: "€45/mo",
          feature: "300 Mbps",
        },
        {
          id: "Unlimited",
          name: "Unlimited",
          price: "€60/mo",
          feature: "1 Gbps",
        },
        {
          id: "Family",
          name: "Family",
          price: "€70/mo",
          feature: "1 Gbps + mesh",
        },
      ];
    } else if (productName.includes("TV")) {
      return [
        {
          id: "Basic",
          name: "Basic",
          price: "€15/mo",
          feature: "30+ channels",
        },
        {
          id: "Premium",
          name: "Premium",
          price: "€25/mo",
          feature: "100+ channels",
        },
        {
          id: "Sports",
          name: "Sports",
          price: "€40/mo",
          feature: "150+ sports",
        },
        {
          id: "Family",
          name: "Family",
          price: "€50/mo",
          feature: "200+ channels",
        },
      ];
    } else if (productName.includes("Phone") || productName.includes("SIM")) {
      return [
        { id: "Basic", name: "Basic", price: "€10/mo", feature: "5GB data" },
        {
          id: "Premium",
          name: "Premium",
          price: "€20/mo",
          feature: "20GB data",
        },
        {
          id: "Unlimited",
          name: "Unlimited",
          price: "€30/mo",
          feature: "Unlimited data",
        },
        {
          id: "Family",
          name: "Family",
          price: "€45/mo",
          feature: "50GB shared",
        },
      ];
    }
    return [
      { id: "Basic", name: "Basic", price: "€10/mo", feature: "Basic service" },
      {
        id: "Premium",
        name: "Premium",
        price: "€20/mo",
        feature: "Premium service",
      },
      {
        id: "Unlimited",
        name: "Unlimited",
        price: "€30/mo",
        feature: "Unlimited service",
      },
      {
        id: "Family",
        name: "Family",
        price: "€45/mo",
        feature: "Family service",
      },
    ];
  };

  // Fetch products from database on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // This would be your API endpoint to fetch products
        // For now, we'll use the data from the screenshot
        const mockProducts: Product[] = [
          { id: 1, productName: "Internet 200", productTypeId: 1 },
          { id: 2, productName: "TV 200", productTypeId: 2 },
          { id: 3, productName: "Entertainment TV package", productTypeId: 3 },
          { id: 4, productName: "ESPN TV package", productTypeId: 3 },
        ];

        setProducts(mockProducts);

        // Set default selected product
        if (
          initialProduct &&
          mockProducts.some((p) => p.productName === initialProduct)
        ) {
          setSelectedProduct(initialProduct);
        } else if (mockProducts.length > 0) {
          setSelectedProduct(mockProducts[0].productName);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialProduct]);

  // First verify if the user exists before trying to place an order
  const verifyUserExists = async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error verifying user:", error);
      return false;
    }
  };

  // Handle plan selection and API call
  const handleOrderSubmit = async () => {
    if (!selectedProduct || !selectedPlan || !userId) return;

    try {
      setOrderProcessing(true);

      // Verify user exists first
      const userExists = await verifyUserExists();

      if (!userExists) {
        // If user doesn't exist, create a new user first
        try {
          const createUserResponse = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "New Customer", // Default name
              email: `customer-${userId}@example.com`, // Generate an email
              phoneNumber: "123-456-7890", // Default phone
            }),
          });

          if (!createUserResponse.ok) {
            throw new Error("Failed to create user");
          }
        } catch (createUserError) {
          console.error("Error creating user:", createUserError);
          alert("Could not create a new user account. Please try again.");
          setOrderProcessing(false);
          return;
        }
      }

      // Now place the order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          productName: selectedProduct,
          plan: selectedPlan,
          status: "Active",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order");
      }

      // Call the parent's callback
      onPlanSelected(selectedProduct, selectedPlan);

      // Show success message
      if (showToast !== false && typeof toast === "function") {
        toast("Order placed successfully");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(
        "Failed to place order: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setOrderProcessing(false);
    }
  };
  if (loading) {
    return (
      <Card className="w-full border border-blue-100 bg-blue-50/50 mt-2">
        <CardContent className="p-3">
          <div className="text-center py-4">Loading products...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border border-blue-100 bg-blue-50/50 mt-2 overflow-hidden">
      <CardContent className="p-3">
        <Tabs
          value={selectedProduct}
          onValueChange={(val) => {
            setSelectedProduct(val);
            setSelectedPlan(null);
          }}
        >
          <TabsList className="grid grid-cols-4 mb-3 h-8 bg-blue-100/50">
            {products.map((product) => (
              <TabsTrigger
                key={product.id}
                value={product.productName}
                className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <span className="mr-1">
                  {getProductIcon(product.productName)}
                </span>
                {product.productName.length > 12
                  ? `${product.productName.substring(0, 10)}...`
                  : product.productName}
              </TabsTrigger>
            ))}
          </TabsList>

          {products.map((product) => (
            <TabsContent
              key={product.id}
              value={product.productName}
              className="mt-0"
            >
              <div className="grid grid-cols-2 gap-2">
                {getPlansForProduct(product.productName).map((plan) => (
                  <div
                    key={plan.id}
                    className={`
                      relative p-2 border rounded cursor-pointer text-xs
                      ${
                        selectedPlan === plan.id &&
                        selectedProduct === product.productName
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }
                    `}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    <div className="font-medium">{plan.name}</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-gray-600">{plan.feature}</div>
                      <div className="font-bold text-blue-600">
                        {plan.price}
                      </div>
                    </div>
                    {selectedPlan === plan.id &&
                      selectedProduct === product.productName && (
                        <CheckCircle
                          size={14}
                          className="absolute top-2 right-2 text-blue-600"
                        />
                      )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-3">
                <Button
                  size="sm"
                  disabled={!selectedPlan || orderProcessing}
                  onClick={handleOrderSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-xs h-8"
                >
                  {orderProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <ShoppingCart size={12} className="mr-1" />
                      Order {selectedProduct.split(" ")[0]} {selectedPlan || ""}
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
