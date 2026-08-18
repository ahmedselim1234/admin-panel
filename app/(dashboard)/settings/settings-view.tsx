"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Bell,
  CreditCard,
  MoreHorizontal,
  Store,
  Trash2,
  Truck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useApiQuery } from "@/lib/hooks/use-api";
import {
  getSettings,
  getTeam,
  inviteMember,
  removeMember,
  toggleProvider,
  toggleZone,
  updateMemberRole,
  updateNotifications,
  updateProfile,
  type NotificationPrefs,
  type StoreProfile,
} from "@/lib/api/settings";
import { formatCurrency, formatRelative } from "@/lib/utils";
import type { TeamRole } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  legalName: z.string().min(2, "Legal name is required"),
  supportEmail: z.email("Enter a valid email address"),
  phone: z.string().min(6, "Enter a contact number"),
  currency: z.string().min(3),
  timezone: z.string().min(3),
  address: z.string().min(6, "Enter the registered address"),
  description: z.string().max(280, "Keep it under 280 characters"),
});

const NOTIFICATION_LABELS: Record<keyof NotificationPrefs, { title: string; body: string }> = {
  newOrder: { title: "New order", body: "Email me whenever an order is placed." },
  lowStock: { title: "Low stock", body: "Alert me when a SKU drops below its threshold." },
  refundRequest: { title: "Refund requests", body: "Notify me when a customer requests a refund." },
  weeklyDigest: { title: "Weekly digest", body: "A Monday summary of last week's performance." },
  productReview: { title: "Product reviews", body: "Ping me when a new review is published." },
};

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error ? <p className="mt-1.5 text-[12px] font-medium text-danger">{error}</p> : null}
    </div>
  );
}

function ProfileForm({ profile, onSaved }: { profile: StoreProfile; onSaved: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<StoreProfile>({ resolver: zodResolver(profileSchema), defaultValues: profile });

  useEffect(() => reset(profile), [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile(values);
      toast.success("Store profile saved");
      onSaved();
    } catch {
      toast.error("Could not save the store profile");
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Store name" error={errors.name?.message}>
          <Input {...register("name")} aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Legal entity" error={errors.legalName?.message}>
          <Input {...register("legalName")} aria-invalid={Boolean(errors.legalName)} />
        </Field>
        <Field label="Support email" error={errors.supportEmail?.message}>
          <Input type="email" {...register("supportEmail")} aria-invalid={Boolean(errors.supportEmail)} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <Input {...register("phone")} aria-invalid={Boolean(errors.phone)} />
        </Field>
        <Field label="Currency" error={errors.currency?.message}>
          <Input {...register("currency")} />
        </Field>
        <Field label="Timezone" error={errors.timezone?.message}>
          <Input {...register("timezone")} />
        </Field>
        <Field label="Registered address" error={errors.address?.message} className="sm:col-span-2">
          <Input {...register("address")} aria-invalid={Boolean(errors.address)} />
        </Field>
        <Field label="Store description" error={errors.description?.message} className="sm:col-span-2">
          <Textarea {...register("description")} />
        </Field>
      </CardContent>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5">
        <Button type="button" variant="ghost" onClick={() => reset(profile)} disabled={!isDirty}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function InviteDialogInline({ onInvited }: { onInvited: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("viewer");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (name.trim().length < 2 || !email.includes("@")) {
      toast.error("Enter a name and a valid email address");
      return;
    }
    setSaving(true);
    try {
      await inviteMember({ name: name.trim(), email: email.trim(), role });
      toast.success(`Invitation sent to ${email}`);
      setName("");
      setEmail("");
      onInvited();
    } catch {
      toast.error("Could not send the invitation");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border-t border-border px-5 py-4 sm:flex-row">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Full name"
        aria-label="Team member name"
        className="sm:max-w-48"
      />
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@northwind.store"
        aria-label="Team member email"
        className="sm:flex-1"
      />
      <Select value={role} onValueChange={(value) => setRole(value as TeamRole)}>
        <SelectTrigger className="sm:w-36" aria-label="Role">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={submit} loading={saving}>
        <UserPlus />
        Invite
      </Button>
    </div>
  );
}

export function SettingsView() {
  const settings = useApiQuery(() => getSettings(), []);
  const team = useApiQuery(() => getTeam(), []);
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);

  useEffect(() => {
    if (settings.data) setPrefs(settings.data.notifications);
  }, [settings.data]);

  const savePrefs = async (key: keyof NotificationPrefs, value: boolean) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      await updateNotifications(next);
      toast.success("Notification preferences updated");
    } catch {
      setPrefs(prefs);
      toast.error("Could not save preferences");
    }
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Store profile, payment methods, shipping zones, notifications and team access."
      />

      <Tabs defaultValue="store">
        <TabsList className="w-full overflow-x-auto no-scrollbar sm:w-auto">
          <TabsTrigger value="store">
            <Store className="size-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="size-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping">
            <Truck className="size-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="size-4" />
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Store profile</CardTitle>
                <CardDescription>
                  Appears on invoices, transactional emails and the storefront footer.
                </CardDescription>
              </div>
            </CardHeader>
            {settings.isLoading || !settings.data ? (
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </CardContent>
            ) : (
              <ProfileForm profile={settings.data.profile} onSaved={settings.refetch} />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Payment methods</CardTitle>
                <CardDescription>Enable the providers your customers can check out with.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {settings.isLoading || !settings.data ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border border-t border-border">
                  {settings.data.providers.map((provider) => (
                    <li key={provider.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium text-foreground">{provider.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">{provider.description}</p>
                      </div>
                      <Badge tone="outline" className="hidden sm:inline-flex">
                        {provider.fee}
                      </Badge>
                      <Switch
                        defaultChecked={provider.enabled}
                        onCheckedChange={async (checked) => {
                          await toggleProvider(provider.id, checked);
                          toast.success(`${provider.name} ${checked ? "enabled" : "disabled"}`);
                        }}
                        aria-label={`Toggle ${provider.name}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Shipping zones</CardTitle>
                <CardDescription>Flat rates per region, with free-shipping thresholds.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {settings.isLoading || !settings.data ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border border-t border-border">
                  {settings.data.zones.map((zone) => (
                    <li key={zone.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium text-foreground">{zone.name}</p>
                        <p className="text-[12.5px] text-muted-foreground">{zone.countries}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-medium tabular-nums text-foreground">
                          {formatCurrency(zone.rate)}
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          {zone.freeOver ? `Free over ${formatCurrency(zone.freeOver)}` : "No free tier"}
                        </p>
                      </div>
                      <Switch
                        defaultChecked={zone.enabled}
                        onCheckedChange={async (checked) => {
                          await toggleZone(zone.id, checked);
                          toast.success(`${zone.name} ${checked ? "enabled" : "disabled"}`);
                        }}
                        aria-label={`Toggle ${zone.name}`}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose what lands in your inbox.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {!prefs ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border border-t border-border">
                  {(Object.keys(NOTIFICATION_LABELS) as (keyof NotificationPrefs)[]).map((key) => (
                    <li key={key} className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-medium text-foreground">
                          {NOTIFICATION_LABELS[key].title}
                        </p>
                        <p className="text-[12.5px] text-muted-foreground">
                          {NOTIFICATION_LABELS[key].body}
                        </p>
                      </div>
                      <Switch
                        checked={prefs[key]}
                        onCheckedChange={(checked) => savePrefs(key, checked)}
                        aria-label={NOTIFICATION_LABELS[key].title}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Team members</CardTitle>
                <CardDescription>Admins manage everything; editors can't change billing.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {team.isLoading || !team.data ? (
                <div className="space-y-3 px-5 pb-5">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-14 w-full" />
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border border-t border-border">
                  {team.data.map((member) => (
                    <li key={member.id} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar name={member.name} color={member.avatarColor} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-foreground">
                          {member.name}
                        </p>
                        <p className="truncate text-[12.5px] text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                      {member.status === "invited" ? (
                        <Badge tone="warning">Invited</Badge>
                      ) : (
                        <span className="hidden text-[12px] text-muted-foreground sm:block">
                          Active {formatRelative(member.lastActive)}
                        </span>
                      )}
                      <RoleBadge role={member.role} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Manage ${member.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuLabel>Change role</DropdownMenuLabel>
                          {(["admin", "editor", "viewer"] as TeamRole[]).map((role) => (
                            <DropdownMenuItem
                              key={role}
                              disabled={member.role === role}
                              onSelect={async () => {
                                await updateMemberRole(member.id, role);
                                toast.success(`${member.name} is now ${role}`);
                                team.refetch();
                              }}
                            >
                              <RoleBadge role={role} />
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onSelect={async () => {
                              await removeMember(member.id);
                              toast.success(`${member.name} removed from the workspace`);
                              team.refetch();
                            }}
                          >
                            <Trash2 />
                            Remove access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
              )}
              <InviteDialogInline onInvited={team.refetch} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
