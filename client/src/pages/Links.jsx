
import { useState } from "react"
import {Link} from "react-router-dom"
import {
  File,
  Home,
  LineChart,
  ListFilter,
  MoreHorizontal,
  Package,
  Package2,
  PanelLeft,
  PlusCircle,
  Search,
  Settings,
  ShoppingCart,
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
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import axios from "axios";
import { createLink, deleteLink } from "@/components/functions";
import { fetchUserLinks, fetchUser } from "@/components/queries/fetchers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function handleFileUpload(files) {
  // Assuming you want to handle multiple files
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    // Process each file here
    console.log(`Uploading file: ${file.name}`);
    // You can add more logic to upload the file to a server or process it as needed
  }
}

function AddProductDialog() {
  const [name, setName] = useState("Pencil Icon")
  const [price, setPrice] = useState(0);
  const [files, setFiles] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [permalink, setPermalink] = useState("http://localhost:5173/l/");
  const [url, setUrl] = useState("");

function generateSlug(name) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric characters with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens

  const randomNumber = Math.floor(Math.random() * 10000); // Generate a random number between 0 and 9999

  return `${slug}-${randomNumber}`;
}

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  }

  const handleNameChange = (e) => {
    setName(e.target.value);
    const slug = generateSlug(e.target.value);
    setPermalink(`http://localhost:5173/l/${slug}`);
    setUrl(slug);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Product
                  </span>
                </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Link</DialogTitle>
          <DialogDescription>
            Add a new link to sell a digital product.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price ($)
            </Label>
            <Input
              type="number"
              id="price"
              className="col-span-3"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              Upload Files
            </Label>
            <Input
              type="file"
              id="file"
              className="col-span-3"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => createLink({name, permalink, price, url, files})}>Create Link</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


function LinksTableRow({id, name="Lemonade Machine", price=4.99, number_of_views=4, number_of_downloads=4}) {
  return (
      <TableRow>
            <TableCell className="font-medium">
              {name}
            </TableCell>
            <TableCell className="hidden md:table-cell">${price}</TableCell>
            <TableCell className="hidden md:table-cell">{number_of_views}</TableCell>
            <TableCell className="hidden md:table-cell">{number_of_downloads}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <Link to={`/links/${id}`}><DropdownMenuItem>Edit</DropdownMenuItem></Link>
                  <DropdownMenuItem onClick={() => deleteLink(id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
  )
}

function Links() {
  const { data: links, isLoading, error } = fetchUserLinks();
  console.log(links)
 return (
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
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="#">Products</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Products</BreadcrumbPage>
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <div className="flex items-center">
              <div className="ml-auto flex items-center gap-2">
                <AddProductDialog />
              </div>
            </div>
              <Card x-chunk="dashboard-06-chunk-0">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                  <CardDescription>
                    Manage your products and view their sales performance.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Price
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Views
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Downloads
                        </TableHead>
                        <TableHead>
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="4" className="text-center">Loading...</td>
                        </tr>
                      ) : (
                        links.map(link => (
                          <LinksTableRow key={link._id} id={link._id} name={link.name} price={link.price} number_of_views={link.number_of_views} number_of_downloads={link.number_of_downloads} />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
        </main>
      </div>
    </div>
  )
}

export default Links;