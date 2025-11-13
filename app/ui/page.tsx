"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
// UI primitives
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel as UiSelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GlassPanel, PageHeader, StatCard, StatusBadge, PriorityBadge, ProgressBar, FilterBar, Assignee, EmptyState, ConfirmDialog, Section } from "@/components/design";
import { GlassFooter } from "@/components/design/GlassFooter";

export default function UIShowcase() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Header */}
      <header className="sticky top-4 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Logo pill */}
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-3 py-2 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/50 via-primary/30 to-accent/50 ring-1 ring-inset ring-white/15 backdrop-blur-sm flex items-center justify-center text-[13px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">G</div>
              <div className="leading-tight">
                <div className="text-white font-semibold">Glass UI</div>
                <div className="text-[12px] text-white/60">Blue · Orange</div>
              </div>
            </div>
            {/* Right: Nav */}
            <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-2xl px-2 py-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]">
              <Link href="#" className="px-3 py-2 text-sm text-white/80 hover:text-white transition">Overview</Link>
              <Link href="#" className="px-3 py-2 text-sm text-white/80 hover:text-white transition">Components</Link>
              <Link href="#" className="px-3 py-2 text-sm text-white/80 hover:text-white transition">Docs</Link>
              <div className="pl-1">
                <Button variant="glass-accent" className="rounded-full px-4 py-2">Open modal</Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header and quick filters */}
        <PageHeader
          heading="Reusable glass components"
          description="Compose these building blocks to build your test management workflows quickly."
          breadcrumbs={[{ label: 'UI' }, { label: 'Library' }, { label: 'Glass' }]}
          actions={<Button variant="glass-accent" className="rounded-full">New test run</Button>}
          className="mb-4"
        />
        <FilterBar className="mb-6">
          <Input variant="glass" placeholder="Search…" className="w-[220px]" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="glass-accent" className="rounded-full">Filters</Button>
            <Button variant="glass-primary" className="rounded-full">Create</Button>
          </div>
        </FilterBar>

        {/* Hero grid */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Left hero */}
          <GlassPanel
            heading={<span className="text-2xl md:text-3xl font-bold text-white">Glassmorphism UI — Blue & Orange</span>}
            subheading={<span className="text-base md:text-lg">Clean frosted panels, soft depth and two-tone accents. Use backdrop blur with subtle tints, maintain contrast for legibility, and keep shadows soft for performance-friendly depth.</span>}
            action={<Badge variant="glass" className="rounded-full px-3 py-1">Beta</Badge>}
            contentClassName="space-y-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="glass-primary" className="rounded-full">Primary action</Button>
              <Button variant="glass-accent" className="rounded-full">Accent action</Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input variant="glass" placeholder="Search components..." />
              <Input variant="glass" placeholder="Email address" />
            </div>
          </GlassPanel>

          {/* Right profile card */}
          <GlassPanel contentClassName="pt-6">
            <div className="flex items-start gap-4">
              {/* Glass avatar (square variant) updated to transparent gradient */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/50 via-primary/30 to-accent/50 ring-1 ring-inset ring-white/15 backdrop-blur-sm flex items-center justify-center text-2xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">PH</div>
              <div>
                <div className="text-white font-semibold">Philip</div>
                <div className="text-white/60 text-sm">Technology entrepreneur · UI tinkerer</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-white/60 text-xs">Projects</div>
                <div className="text-white text-xl font-bold">12</div>
              </div>
              <div>
                <div className="text-white/60 text-xs">Followers</div>
                <div className="text-white text-xl font-bold">3.1k</div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="glass-primary" className="rounded-full">Message</Button>
              <Button variant="glass-accent" className="rounded-full">Follow</Button>
            </div>
          </GlassPanel>
        </div>

  {/* Lower cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card — Info (GlassPanel) */}
          <GlassPanel heading="Card — Info" contentClassName="space-y-4">
            <p className="text-sm text-white/70">Use translucent surfaces for hierarchy. Accent elements with blue for primary actions and orange for highlights.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="glass-primary" className="rounded-full px-4">Action</Button>
              <Button size="sm" variant="glass-accent" className="rounded-full px-4">Secondary</Button>
            </div>
          </GlassPanel>

          {/* Card — Stats (StatCard) */}
          <StatCard label="Active users" value="8.4K" delta="+2.1%" trend="up" helpText="last 24h" />

          {/* Form controls (GlassPanel + ProgressBar, PriorityBadge) */}
          <GlassPanel heading="Form controls" contentClassName="space-y-3">
            <p className="text-sm text-white/70">Inputs remain readable — pair low-opacity glass with stronger text color and subtle shadows.</p>
            <Input variant="glass" placeholder="Full name" />
            <div className="flex items-center justify-between gap-3 pt-1">
              <ProgressBar value={62} />
              <PriorityBadge priority="high" />
            </div>
          </GlassPanel>

          {/* Notifications (GlassPanel + StatusBadge) */}
          <GlassPanel heading="Notifications" contentClassName="space-y-4">
            <p className="text-sm text-white/70">Use layered cards for toasts and notifications — motion and short lifetime provide non-intrusive feedback.</p>
            <div className="flex items-center gap-3">
              <StatusBadge status="running" pulse>Running</StatusBadge>
              <div className="flex gap-2">
                <Button size="sm" variant="glass-primary" className="rounded-full px-4">Snooze</Button>
                <Button size="sm" variant="glass-accent" className="rounded-full px-4">Dismiss</Button>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Catalogue: list and demo of design components */}
        <Section heading="Component catalogue" description="All reusable glass components available." className="mt-10">
          <div className="grid gap-6 md:grid-cols-2">
            <GlassPanel heading="Core wrappers" contentClassName="space-y-3">
              <ul className="list-disc list-inside text-white/80 text-sm">
                <li>GlassPanel — frosted card wrapper</li>
                <li>PageHeader — title, breadcrumbs, actions (see top)</li>
                <li>Section — titled content wrapper</li>
                <li>FilterBar — glass filters/actions strip (see top)</li>
              </ul>
            </GlassPanel>

            <GlassPanel heading="Domain components" contentClassName="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="passed">passed</StatusBadge>
                <StatusBadge status="failed">failed</StatusBadge>
                <StatusBadge status="running" pulse>running</StatusBadge>
                <StatusBadge status="queued">queued</StatusBadge>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PriorityBadge priority="low" />
                <PriorityBadge priority="medium" />
                <PriorityBadge priority="high" />
                <PriorityBadge priority="critical" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <Assignee name="Jane Doe" email="jane@example.com" />
                <ProgressBar value={78} showLabel />
              </div>
            </GlassPanel>

            <GlassPanel heading="Stat cards" contentClassName="grid gap-4">
              <StatCard label="Pass rate" value="96%" delta="+1.2%" trend="up" helpText="week over week" />
            </GlassPanel>

            <GlassPanel heading="Empty state & dialog" contentClassName="space-y-4">
              <EmptyState heading="No test runs" description="Create your first run to start tracking results." />
              <ConfirmDialog description="This will start a new test run.">
                <Button variant="glass-primary" className="rounded-full">Open confirm</Button>
              </ConfirmDialog>
            </GlassPanel>
          </div>
        </Section>

        {/* UI primitives — glass variants showcase */}
        <Section heading="UI primitives" description="All reusable primitives from components/ui with glass styles." className="mt-10">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Alerts */}
            <GlassPanel heading="Alert" contentClassName="space-y-3">
              <Alert variant="glass">
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Glass alert for subtle notifications.</AlertDescription>
              </Alert>
              <Alert variant="glass-destructive">
                <AlertTitle>Action required</AlertTitle>
                <AlertDescription>Something went wrong. Please retry.</AlertDescription>
              </Alert>
            </GlassPanel>

            {/* Avatar */}
            <GlassPanel heading="Avatar" contentClassName="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage alt="Jane Doe" src="https://i.pravatar.cc/100?img=1" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <Avatar className="size-10">
                <AvatarImage alt="John Doe" src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </GlassPanel>

            {/* Card (glass) */}
            <GlassPanel heading="Card" contentClassName="space-y-3">
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Glass card</CardTitle>
                  <CardDescription>Use directly or via GlassPanel.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/80">Body content inside a translucent surface.</p>
                </CardContent>
              </Card>
            </GlassPanel>

            {/* Checkbox, Switch */}
            <GlassPanel heading="Checkbox & Switch" contentClassName="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox id="chk1" variant="glass" defaultChecked />
                <Label htmlFor="chk1">Enable glass effect</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="sw1" variant="glass" defaultChecked />
                <Label htmlFor="sw1">Allow notifications</Label>
              </div>
            </GlassPanel>

            {/* Dialog */}
            <GlassPanel heading="Dialog" contentClassName="space-y-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="glass-primary" className="rounded-full">Open dialog</Button>
                </DialogTrigger>
                <DialogContent variant="glass">
                  <DialogHeader>
                    <DialogTitle>Glass dialog</DialogTitle>
                    <DialogDescription>Use for confirmations and forms.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <Label htmlFor="dlg-email">Email</Label>
                    <Input id="dlg-email" variant="glass" placeholder="you@example.com" />
                  </div>
                  <DialogFooter>
                    <Button variant="glass" className="rounded-full">Cancel</Button>
                    <Button variant="glass-primary" className="rounded-full">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </GlassPanel>

            {/* Dropdown menu */}
            <GlassPanel heading="Dropdown menu" contentClassName="space-y-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass-primary" className="rounded-full">Open menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent variant="glass" className="min-w-48">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem>New file <DropdownMenuShortcut>Ctrl+N</DropdownMenuShortcut></DropdownMenuItem>
                  <DropdownMenuItem>Open…</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>Auto-save</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </GlassPanel>

            {/* Inputs */}
            <GlassPanel heading="Inputs" contentClassName="grid gap-3">
              <Label htmlFor="in-1">Search</Label>
              <Input id="in-1" variant="glass" placeholder="Search…" />
              <Label htmlFor="ta-1">Description</Label>
              <Textarea id="ta-1" variant="glass" placeholder="Write something…" />
            </GlassPanel>

            {/* Radio group & Select */}
            <GlassPanel heading="Radio & Select" contentClassName="grid gap-4">
              <RadioGroup defaultValue="opt2" className="grid grid-cols-3 items-center gap-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rg1" value="opt1" variant="glass" />
                  <Label htmlFor="rg1">Option 1</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rg2" value="opt2" variant="glass" />
                  <Label htmlFor="rg2">Option 2</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem id="rg3" value="opt3" variant="glass" />
                  <Label htmlFor="rg3">Option 3</Label>
                </div>
              </RadioGroup>
              <div className="grid gap-2">
                <Label htmlFor="sel-1">Assignee</Label>
                <Select defaultValue="1">
                  <SelectTrigger id="sel-1" variant="glass" className="rounded-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectGroup>
                      <UiSelectLabel>People</UiSelectLabel>
                      <SelectItem value="1">Jane Doe</SelectItem>
                      <SelectItem value="2">John Smith</SelectItem>
                      <SelectItem value="3">Alex Lee</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </GlassPanel>

            {/* Tabs */}
            <GlassPanel heading="Tabs" contentClassName="space-y-3">
              <Tabs defaultValue="one" className="w-full">
                <TabsList variant="glass">
                  <TabsTrigger value="one">One</TabsTrigger>
                  <TabsTrigger value="two">Two</TabsTrigger>
                  <TabsTrigger value="three">Three</TabsTrigger>
                </TabsList>
                <TabsContent value="one" className="pt-2">
                  <p className="text-sm text-white/80">Tab one content.</p>
                </TabsContent>
                <TabsContent value="two" className="pt-2">
                  <p className="text-sm text-white/80">Tab two content.</p>
                </TabsContent>
                <TabsContent value="three" className="pt-2">
                  <p className="text-sm text-white/80">Tab three content.</p>
                </TabsContent>
              </Tabs>
            </GlassPanel>

            {/* Table */}
            <GlassPanel heading="Table" contentClassName="space-y-3">
              <TableContainer variant="glass">
                <Table>
                  <TableHeader>
                    <TableRow variant="glass">
                      <TableHead>Test</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow variant="glass">
                      <TableCell>Login flow</TableCell>
                      <TableCell>Passed</TableCell>
                      <TableCell>Jane</TableCell>
                    </TableRow>
                    <TableRow variant="glass">
                      <TableCell>Payments</TableCell>
                      <TableCell>Running</TableCell>
                      <TableCell>John</TableCell>
                    </TableRow>
                  </TableBody>
                  <TableCaption>Example glass table</TableCaption>
                </Table>
              </TableContainer>
            </GlassPanel>

            {/* Tooltip & Separator */}
            <GlassPanel heading="Tooltip & Separator" contentClassName="space-y-4">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="glass-accent" className="rounded-full">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6} variant="glass">Helpful hint</TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="h-8" />
                <span className="text-sm text-white/80">With a separator</span>
              </div>
            </GlassPanel>
          </div>
        </Section>

        {/* Footer notes */}
        <div className="mt-10 flex items-center justify-between text-sm text-white/60">
          <div>Made with ♥ using glassmorphism</div>
          <div>
            Theme: <span className="text-primary">Blue</span> · <span className="text-accent">Orange</span>
          </div>
        </div>
      </div>

      <GlassFooter variant="simple" description="UI Component Library - All components ready for use" />
    </div>
  );
}

