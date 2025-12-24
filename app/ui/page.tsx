"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/frontend/reusable-elements/buttons/Button";
import { ButtonPrimary } from "@/frontend/reusable-elements/buttons/ButtonPrimary";
import { ButtonSecondary } from "@/frontend/reusable-elements/buttons/ButtonSecondary";
// UI primitives
import { Input } from "@/frontend/reusable-elements/inputs/Input";
import { Badge } from "@/frontend/reusable-elements/badges/Badge";
import { Alert, AlertDescription, AlertTitle } from "@/frontend/reusable-elements/alerts/Alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/frontend/reusable-elements/avatars/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/reusable-elements/cards/Card";
import { Checkbox } from "@/frontend/reusable-elements/checkboxes/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/frontend/reusable-elements/dialogs/Dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/frontend/reusable-elements/dropdowns/DropdownMenu";
import { Label } from "@/frontend/reusable-elements/labels/Label";
import { RadioGroup, RadioGroupItem } from "@/frontend/reusable-elements/radios/RadioGroup";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel as UiSelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/frontend/reusable-elements/selects/Select";
import { Separator } from "@/frontend/reusable-elements/separators/Separator";
import { Switch } from "@/frontend/reusable-elements/switches/Switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/reusable-elements/tables/BaseTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/frontend/reusable-elements/tabs/Tabs";
import { Textarea } from "@/frontend/reusable-elements/textareas/Textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/frontend/reusable-elements/tooltips/Tooltip";
import { GlassPanel } from "@/frontend/reusable-components/layout/GlassPanel";
import { PageHeader } from "@/frontend/reusable-components/layout/PageHeader";
import { StatCard } from "@/frontend/reusable-components/cards/StatCard";
import { StatusBadge } from "@/frontend/reusable-components/badges/StatusBadge";
import { PriorityBadge } from "@/frontend/reusable-components/badges/PriorityBadge";
import { ProgressBar } from "@/frontend/reusable-components/badges/ProgressBar";
import { FilterBar } from "@/frontend/reusable-components/inputs/FilterBar";
import { Assignee } from "@/frontend/reusable-elements/avatars/Assignee";
import { EmptyState } from "@/frontend/reusable-components/empty-states/EmptyState";
import { ConfirmDialog } from "@/frontend/reusable-components/dialogs/ConfirmDialog";
import { Section } from "@/frontend/reusable-components/layout/Section";
import { DetailCard } from "@/frontend/reusable-components/cards/DetailCard";
import { GlassFooter } from "@/frontend/reusable-components/layout/GlassFooter";

export default function UIShowcasePage() {
  useEffect(() => {
    document.title = 'UI Components | EZTest';
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
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
                <ButtonSecondary>Open modal</ButtonSecondary>
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
          actions={<ButtonSecondary>New test run</ButtonSecondary>}
          className="mb-4"
        />
        <FilterBar className="mb-6">
          <Input variant="glass" placeholder="Search…" className="w-[220px]" />
          <div className="ml-auto flex items-center gap-2">
            <ButtonSecondary>Filters</ButtonSecondary>
            <ButtonPrimary>Create</ButtonPrimary>
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
              <ButtonPrimary>Primary action</ButtonPrimary>
              <ButtonSecondary>Accent action</ButtonSecondary>
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
            <div className="mt-6 flex gap-3">
              <ButtonPrimary className="flex-1">Message</ButtonPrimary>
              <ButtonSecondary className="flex-1">Follow</ButtonSecondary>
            </div>
          </GlassPanel>
        </div>

  {/* Lower cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Card — Info (GlassPanel) */}
          <GlassPanel heading="Card — Info" contentClassName="space-y-4">
            <p className="text-sm text-white/70">Use translucent surfaces for hierarchy. Accent elements with blue for primary actions and orange for highlights.</p>
            <div className="flex gap-2">
              <ButtonPrimary size="sm">Action</ButtonPrimary>
              <ButtonSecondary size="sm">Secondary</ButtonSecondary>
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
                <ButtonPrimary size="sm">Snooze</ButtonPrimary>
                <ButtonSecondary size="sm">Dismiss</ButtonSecondary>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Catalogue: list and demo of design components */}
        <Section heading="Component catalogue" description="All reusable glass components available." className="mt-10">
          <div className="grid gap-6 md:grid-cols-2">
            <GlassPanel heading="ButtonPrimary - Blue Gradient" contentClassName="space-y-4">
              <p className="text-sm text-white/70">Primary button with blue gradient theme</p>
              <div className="flex flex-wrap items-center gap-2">
                <ButtonPrimary variant="default">Default</ButtonPrimary>
                <ButtonPrimary variant="light">Light</ButtonPrimary>
                <ButtonPrimary variant="outline">Outline</ButtonPrimary>
                <ButtonPrimary variant="ghost">Ghost</ButtonPrimary>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ButtonPrimary variant="default" size="sm">Small</ButtonPrimary>
                <ButtonPrimary variant="default">Default</ButtonPrimary>
                <ButtonPrimary variant="default" size="lg">Large</ButtonPrimary>
              </div>
            </GlassPanel>

            <GlassPanel heading="ButtonSecondary - Orange Gradient" contentClassName="space-y-4">
              <p className="text-sm text-white/70">Secondary button with orange gradient theme</p>
              <div className="flex flex-wrap items-center gap-2">
                <ButtonSecondary variant="default">Default</ButtonSecondary>
                <ButtonSecondary variant="light">Light</ButtonSecondary>
                <ButtonSecondary variant="outline">Outline</ButtonSecondary>
                <ButtonSecondary variant="ghost">Ghost</ButtonSecondary>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ButtonSecondary variant="default" size="sm">Small</ButtonSecondary>
                <ButtonSecondary variant="default">Default</ButtonSecondary>
                <ButtonSecondary variant="default" size="lg">Large</ButtonSecondary>
              </div>
            </GlassPanel>

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
              <StatCard label="Total tests" value="1,248" delta="+24" trend="up" helpText="this month" />
              <StatCard label="Failed tests" value="12" delta="-3" trend="down" helpText="vs last week" />
            </GlassPanel>

            <GlassPanel heading="DetailCard" contentClassName="space-y-4">
              <p className="text-sm text-white/70">Specialized card for detail pages with title, description, and optional header action</p>
              <DetailCard 
                title="Project Information" 
                description="View key details about this project"
              >
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Project Key</span>
                    <span className="text-sm text-white font-medium">PROJ-001</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-sm text-white/60">Created By</span>
                    <span className="text-sm text-white font-medium">Jane Doe</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-white/60">Status</span>
                    <span className="text-sm text-white font-medium">Active</span>
                  </div>
                </div>
              </DetailCard>
            </GlassPanel>

            <GlassPanel heading="Empty state & dialog" contentClassName="space-y-4">
              <EmptyState heading="No test runs" description="Create your first run to start tracking results." />
              <ConfirmDialog description="This will start a new test run.">
                <ButtonPrimary>Open confirm</ButtonPrimary>
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
                  <ButtonPrimary>Open dialog</ButtonPrimary>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Glass dialog</DialogTitle>
                    <DialogDescription>Use for confirmations and forms.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-3">
                    <Label htmlFor="dlg-email">Email</Label>
                    <Input id="dlg-email" variant="glass" placeholder="you@example.com" />
                  </div>
                  <DialogFooter>
                    <Button variant="glass" className="cursor-pointer">Cancel</Button>
                    <ButtonPrimary>Save</ButtonPrimary>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </GlassPanel>

            {/* Dropdown menu */}
            <GlassPanel heading="Dropdown menu" contentClassName="space-y-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ButtonPrimary>Open menu</ButtonPrimary>
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

            {/* Table - Full Width */}
            <div className="md:col-span-2">
              <GlassPanel heading="Table - Reusable Component" contentClassName="space-y-3">
                <p className="text-sm text-white/70 mb-4">Responsive table with glass styling for data display</p>
                <TableContainer variant="glass">
                  <Table>
                    <TableHeader>
                      <TableRow variant="glass">
                        <TableHead>Test Case</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Last Run</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow variant="glass">
                        <TableCell className="font-medium">User Authentication</TableCell>
                        <TableCell><StatusBadge status="passed">Passed</StatusBadge></TableCell>
                        <TableCell><PriorityBadge priority="high" /></TableCell>
                        <TableCell>Jane Doe</TableCell>
                        <TableCell>2 hours ago</TableCell>
                        <TableCell className="text-right">
                          <ButtonPrimary variant="ghost" size="sm">View</ButtonPrimary>
                        </TableCell>
                      </TableRow>
                      <TableRow variant="glass">
                        <TableCell className="font-medium">Payment Gateway</TableCell>
                        <TableCell><StatusBadge status="running" pulse>Running</StatusBadge></TableCell>
                        <TableCell><PriorityBadge priority="critical" /></TableCell>
                        <TableCell>John Smith</TableCell>
                        <TableCell>5 mins ago</TableCell>
                        <TableCell className="text-right">
                          <ButtonPrimary variant="ghost" size="sm">View</ButtonPrimary>
                        </TableCell>
                      </TableRow>
                      <TableRow variant="glass">
                        <TableCell className="font-medium">API Integration</TableCell>
                        <TableCell><StatusBadge status="failed">Failed</StatusBadge></TableCell>
                        <TableCell><PriorityBadge priority="medium" /></TableCell>
                        <TableCell>Alex Lee</TableCell>
                        <TableCell>1 day ago</TableCell>
                        <TableCell className="text-right">
                          <ButtonPrimary variant="ghost" size="sm">View</ButtonPrimary>
                        </TableCell>
                      </TableRow>
                      <TableRow variant="glass">
                        <TableCell className="font-medium">Email Notifications</TableCell>
                        <TableCell><StatusBadge status="queued">Queued</StatusBadge></TableCell>
                        <TableCell><PriorityBadge priority="low" /></TableCell>
                        <TableCell>Sarah Connor</TableCell>
                        <TableCell>Not run yet</TableCell>
                        <TableCell className="text-right">
                          <ButtonPrimary variant="ghost" size="sm">View</ButtonPrimary>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                    <TableCaption>Test case execution overview</TableCaption>
                  </Table>
                </TableContainer>
              </GlassPanel>
            </div>

            {/* Tooltip & Separator */}
            <GlassPanel heading="Tooltip & Separator" contentClassName="space-y-4">
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ButtonSecondary>Hover me</ButtonSecondary>
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

