// app/page.tsx
"use client";
import ChatWindow from "@/components/ChatWindow";
import UserSelector from "@/components/UserSelector";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Calendar,
  Package,
  ShieldCheck,
  UserCircle2,
  MessageSquare,
  LayoutGrid,
  History,
  BarChart3,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import TopIssuesSummary from "@/components/TopIssuesSummary";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import OrderAnalysis from "@/components/OrderAnalysis";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    orderProductId: string;
    productName: string;
    inServiceDate: string;
    outServiceDate: string | null;
    plan: string;
    status: string;
    createDate: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
  }[];
}

// New interface for order products
interface OrderProduct {
  orderProductId: string;
  productName: string;
  inServiceDate: string;
  outServiceDate: string | null;
  plan: string;
}

// New interface for orders with their products
interface OrderWithProducts {
  orderId: string;
  status: string;
  createDate: string;
  products: OrderProduct[];
}

export default function Home() {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersWithProducts, setOrdersWithProducts] = useState<OrderWithProducts[]>([]);
  const [input, setInput] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{
    product: string;
    plan: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!selectedUser) return;

    async function fetchUserDetails() {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${selectedUser}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          
          // Process orders to group by orderId
          if (data.orders && data.orders.length > 0) {
            const orderMap = new Map<string, OrderWithProducts>();
            
            data.orders.forEach((order: any) => {
              if (!orderMap.has(order.orderId)) {
                orderMap.set(order.orderId, {
                  orderId: order.orderId,
                  status: order.status,
                  createDate: order.createDate || new Date().toISOString().split('T')[0],
                  products: []
                });
              }
              
              const orderWithProducts = orderMap.get(order.orderId)!;
              orderWithProducts.products.push({
                orderProductId: order.orderProductId,
                productName: order.productName,
                inServiceDate: order.inServiceDate,
                outServiceDate: order.outServiceDate,
                plan: order.plan
              });
            });
            
            setOrdersWithProducts(Array.from(orderMap.values()));
          } else {
            setOrdersWithProducts([]);
          }
        } else {
          console.error("Failed to fetch user details");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [selectedUser]);

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const handleUpsellClick = (productName: string, lastPlan: string) => {
    console.log("Upsell button clicked with:", { productName, lastPlan });
    const message = `Based on the customer's purchase history, they have purchased ${productName} multiple times. Their last plan was ${lastPlan}. Consider suggesting an upgrade to the latest plan.`;
    console.log("Prepared message:", message);
    setInput(message);
    
    // Automatically send the message after a short delay to ensure state updates
    setTimeout(() => {
      const chatWindow = document.querySelector('[data-chat-window]');
      if (chatWindow) {
        const sendButton = chatWindow.querySelector('button[type="submit"]');
        if (sendButton) {
          (sendButton as HTMLButtonElement).click();
        }
      }
    }, 100);
  };

  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Remove token cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    // Redirect to login
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Customer Care Portal
            </h1>
            <p className="text-gray-500">
              Manage customer interactions and support tickets efficiently
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </header>

        <div className="flex flex-col md:flex-row gap-2">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 border-r border-gray-300 pr-4">
            <Card className="shadow-lg border-gray-200 rounded-xl mb-6 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4">
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2" size={20} />
                  <span>Customer Care Agent.</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-6">
                  <h3 className="text-xs uppercase font-semibold mb-2 text-gray-500 tracking-wider">
                    Select Customer
                  </h3>
                  <UserSelector onUserChange={handleUserChange} />
                </div>

                {loading ? (
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg animate-pulse">
                      <Skeleton className="h-6 w-32 mb-4" />
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-20 w-full mt-4" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="space-y-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <UserCircle2 size={20} className="mr-2 text-blue-600" />
                        {user.name}
                      </h2>
                      <div className="flex items-center mt-2 text-gray-600 bg-gray-50 p-2 rounded-md">
                        <Phone size={16} className="mr-2 text-blue-600" />
                        <span className="font-medium">{user.phoneNumber}</span>
                      </div>

                      <div className="mt-4">
                        <h3 className="text-xs uppercase font-semibold mb-2 text-gray-500 tracking-wider flex items-center">
                          <ShieldCheck
                            size={14}
                            className="mr-1 text-blue-600"
                          />{" "}
                          Active Plan
                        </h3>
                        {user.orders.find((o) => o.status === "Active") ? (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-gray-800">
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.productName
                                }
                              </span>
                              
                              <div>
                                {" "}
                                {
                                  user.orders.find((o) => o.status === "Active")
                                    ?.plan
                                }
                              </div>
                            </div>
                            {/* <div className="flex items-center mt-2 text-sm text-gray-600"> */}
                            <div className="flex justify-between items-center mt-2 ">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar
                                  size={14}
                                  className="mr-1 text-blue-600"
                                />
                                <span>
                                  From{" "}
                                  {
                                    user.orders.find(
                                      (o) => o.status === "Active"
                                    )?.inServiceDate
                                  }
                                  {user.orders.find(
                                    (o) => o.status === "Active"
                                  )?.outServiceDate
                                    ? ` to ${
                                        user.orders.find(
                                          (o) => o.status === "Active"
                                        )?.outServiceDate
                                      }`
                                    : ""}
                                </span>
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Active
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                            <p className="text-gray-500">No active plan</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <TopIssuesSummary userId={selectedUser} />

                    <Tabs defaultValue="orders" className="w-full">
                      <TabsList className="grid grid-cols-2 mb-4 bg-gray-100">
                        <TabsTrigger
                          value="orders"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                          <Package size={16} className="mr-2" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger
                          value="incidents"
                          className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                        >
                          <History size={16} className="mr-2" />
                          Support History
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="orders" className="space-y-3 mt-0">
                        {ordersWithProducts.length > 0 ? (
                          <Accordion type="single" collapsible className="w-full">
                            {ordersWithProducts.map((order) => (
                              <AccordionItem key={order.orderId} value={order.orderId}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex flex-col items-start">
                                      <span className="font-semibold text-gray-800">
                                        {/* Order ID: {order.orderId} */}
                                        {order.orderId}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Created: {order.createDate}
                                      </span>
                                    </div>
                                    <Badge className={`${getStatusColor(order.status)} border`}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    {order.products.map((product) => (
                                      <div
                                        key={product.orderProductId}
                                        className="bg-gray-50 p-3 rounded-lg border border-gray-100"
                                      >
                                        <div className="flex justify-between items-center">
                                          <span className="font-medium text-gray-700">
                                            {product.productName}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            ID: {product.orderProductId}
                                          </span>
                                        </div>
                                        <div className="flex items-center mt-1 text-xs text-gray-600">
                                          <Calendar size={14} className="mr-1 text-blue-600" />
                                          <span>
                                            {product.inServiceDate}
                                            {product.outServiceDate
                                              ? ` to ${product.outServiceDate}`
                                              : ""}
                                          </span>
                                          <span className="mx-2 text-gray-400">•</span>
                                          <span className="text-gray-600">Plan: {product.plan}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>
                        ) : (
                          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
                            <Package
                              size={24}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-gray-500">No orders found</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="incidents" className="space-y-3 mt-0">
                        {user.incidents.length > 0 ? (
                          user.incidents.map((incident) => (
                            <div
                              key={incident.incidentId}
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <span
                                  className="font-semibold text-gray-800 truncate"
                                  title={incident.description}
                                >
                                  {incident.description.length > 40
                                    ? incident.description.substring(0, 40) +
                                      "..."
                                    : incident.description}
                                </span>
                                <Badge
                                  className={`${getStatusColor(
                                    incident.status
                                  )} border whitespace-nowrap ml-2`}
                                >
                                  {incident.status}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-2 text-xs text-gray-600">
                                <History
                                  size={14}
                                  className="mr-2 text-blue-600"
                                />
                                <span className="mr-2">
                                  {incident.incidentId}
                                </span>
                                <span className="text-gray-400">•</span>
                                <Calendar
                                  size={14}
                                  className="mx-2 text-blue-600"
                                />
                                <span>{incident.date}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white p-6 rounded-xl border border-gray-100 text-center">
                            <History
                              size={24}
                              className="mx-auto mb-2 text-gray-400"
                            />
                            <p className="text-gray-500">
                              No support incidents found
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    <OrderAnalysis 
                      userId={selectedUser} 
                      onUpsellClick={handleUpsellClick}
                    />
                  </div>
                ) : selectedUser ? (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-center">
                    <p className="text-red-600">Failed to load user details</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                    <UserCircle2
                      size={32}
                      className="mx-auto mb-2 text-blue-600"
                    />
                    <p className="text-blue-700">
                      Select a user to view details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="w-full md:w-2/3 pl-2">
            {selectedUser ? (
              <ChatWindow 
                userId={selectedUser} 
                input={input}
                onInputChange={setInput}
              />
            ) : (
              <Card className="h-full flex items-center justify-center p-8 shadow-lg rounded-xl border-gray-200">
                <div className="text-center p-6">
                  <div className="bg-blue-100 p-6 rounded-full inline-flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-3">
                    Customer Care Bot
                  </h2>
                  <p className="text-gray-500 max-w-md">
                    Select a customer from the sidebar to start a conversation
                    and provide assistance.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
