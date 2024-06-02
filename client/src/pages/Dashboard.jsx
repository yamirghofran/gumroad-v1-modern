import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  CreditCard,
  File,
  Home,
  LineChart,
  ListFilter,
  MoreVertical,
  Package,
  Package2,
  PanelLeft,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {
    ConnectBalances,
    ConnectAccountOnboarding,
    ConnectComponentsProvider,
    ConnectPayments,
    ConnectPayouts
  } from "@stripe/react-connect-js";
import useStripeConnect from "@/components/useStripeConnect"
import { fetchUser } from "@/components/queries/fetchers";
// Include this React component

function Dashboard() {

  const { data: user, isLoading } = fetchUser();

  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  }


  
  useEffect(() => {
    if (user && user.stripeAccountId && user.stripeOnboardingExited) {
      console.log("User:", user);
      setConnectedAccountId(user.stripeAccountId);
      setOnboardingExited(user.stripeOnboardingExited);
    } else {
      console.log("User:", user);
      console.log("No connected account ID");
    }

    if (error) {
      console.error("Failed to fetch user:", error);
    }
  }, [user]);

  console.log("Onboarding exited:", onboardingExited);
  const stripeConnectInstance = useStripeConnect(connectedAccountId);

  return (
    <TooltipProvider>
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Avatar
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                >
                    <AvatarFallback>OG</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="">
            <div className="container">
      <div className="my-2">
        <h1 className="text-2xl font-semibold">InnovaTech Ventures</h1>
        <p>Set up your payment information.</p>
      </div>
      <div className="content">
        {connectedAccountId && !stripeConnectInstance && <h2>Add information to start accepting money</h2>}
        {!accountCreatePending && !connectedAccountId && (
          <div>
            <Button
              onClick={async () => {
                setAccountCreatePending(true);
                setError(false);
                fetch("http://localhost:3000/account", {
                  method: "POST",
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                })
                  .then((response) => response.json())
                  .then((json) => {
                    setAccountCreatePending(false);
                    const { account, error } = json;

                    if (account) {
                      setConnectedAccountId(account);
                    }

                    if (error) {
                      setError(true);
                    }
                  });
              }}
            >
              Start Making Money
            </Button>
          </div>
        )}
        {stripeConnectInstance && (
          <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
            {(!connectedAccountId || !onboardingExited) && (
              <ConnectAccountOnboarding
                onExit={async () => {
                  setOnboardingExited(true);
                  console.log("Onboarding exited");
                  try {
                    const response = await fetch('http://localhost:3000/stripe_onboarding_exit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({
                        accountId: connectedAccountId
                      })
                    });

                    if (response.ok) {
                      console.log('Stripe onboarding exited');
                    } else {
                      console.error('Failed to set stripeOnboardingExited');
                    }
                  } catch (error) {
                    console.error('Error during fetch call:', error);
                  }
                }}
              />
            )}
            {connectedAccountId && onboardingExited && <div className="my-2"><ConnectPayments /></div>}
            {connectedAccountId && onboardingExited && <div className="my-2"><ConnectPayouts /></div>}
          </ConnectComponentsProvider>
        )}
        {error && <p className="error">Something went wrong!</p>}
        {(connectedAccountId || accountCreatePending || onboardingExited) && (
          <div className="dev-callout">
            {connectedAccountId && <p>Your connected account ID is: <code className="bold">{connectedAccountId}</code></p>}
            {accountCreatePending && <p>Creating a connected account...</p>}
            {onboardingExited && <p>The Account Onboarding component has exited</p>}
          </div>
        )}
      </div>
    </div>
          </div>
          </div>
        </main>
      </div>
    </div>
   
    </TooltipProvider>
  )
}

export default Dashboard;