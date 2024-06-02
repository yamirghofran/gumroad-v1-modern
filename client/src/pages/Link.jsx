
import { useState, useEffect } from "react"
import {Link, useNavigate} from "react-router-dom"
import {
  ChevronLeft,
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
  Upload,
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {fetchUserLink, fetchUserLinks} from "@/components/queries/fetchers";
import { updateLink, deleteLink } from "@/components/functions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function LinkComponent() {
    
    const linkId = window.location.pathname.split('/').pop();
    const linksQuery = fetchUserLinks();
    const { data: link, isLoading, error } = fetchUserLink(linkId);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const navigate = useNavigate();
    const [url, setUrl] = useState("");

    useEffect(() => {
      if (link) {
        setName(link.name);
        setPrice(link.price);
        setUrl(link.url);
      }
    }, [link]);
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Product</BreadcrumbPage>
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
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="w-full  flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="mx-auto grid max-w-full flex-1 auto-rows-max gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                {link?.name}
              </h1>
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Link to='/links'><Button variant="outline" size="sm">
                  Discard
                </Button></Link>
                <Button onClick={() => updateLink(linkId, name, price)} size="sm">Save Link</Button>
              </div>
            </div>
            <div className="grid gap-4 min-w-[59rem] lg:gap-8">
              <div className="grid auto-rows-max items-start gap-4  lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-0">
                  <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          type="text"
                          className="w-full"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                        </div>
                        <div>
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          className="w-full"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                <Card x-chunk="dashboard-07-chunk-1">
                  <CardHeader>
                    <CardTitle>Product Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="status">Url</Label>
                        <Input
                          disabled
                          id="url"
                          type="text"
                          className="w-full"
                          value={link?.url}
                          onChange={(e) => setUrl(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="status">Shareable for purchase</Label>
                        <Input
                          disabled
                          id="url"
                          type="text"
                          className="w-full"
                          value={link?.unique_permalink}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="overflow-hidden" x-chunk="dashboard-07-chunk-4"
                >
                  <CardHeader>
                    <CardTitle>Product Files</CardTitle>
                    <CardDescription>
                      Lipsum dolor sit amet, consectetur adipiscing elit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                    <ul>
            {link?.files.map(file => (
              <li key={file._id}>
                {file.file_type.startsWith('image/') ? (
                <div>
                    <img className="max-w-72 rounded-lg border border-black" src={`https://d22i4ig9f71y3u.cloudfront.net/${link.user}/${url}/${file.file_name}`} rel="noopener noreferrer" alt={file.file_name}/>
                </div>
                ) : (
                  <a href={`https://d22i4ig9f71y3u.cloudfront.net/${link.user}/${link.url}/${file.file_name}`} rel="noopener noreferrer" download>
                    {file.file_name}
                  </a>
                )}
              </li>
              ))}
            </ul>
                    </div>
                    
                  </CardContent>
                </Card>
                <Card x-chunk="dashboard-07-chunk-5">
                  <CardHeader>
                    <CardTitle>Delete Link</CardTitle>
                    <CardDescription>
                      This will delete the link and all associated files.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div></div>
                    <Button onClick={() => {deleteLink(linkId); linksQuery.refetch(); navigate('/links'); }} size="sm" variant="secondary">
                      Delete Link
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default LinkComponent;