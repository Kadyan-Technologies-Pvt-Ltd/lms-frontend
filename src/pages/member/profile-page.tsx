import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ChangePasswordCard } from '@/components/common/change-password-card'
import { PageHeader } from '@/components/common/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import { membersApi } from '@/lib/api/members'
import type { MemberStatus, MemberUpdatePayload } from '@/types/member'

const STATUS_VARIANT: Record<MemberStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  SUSPENDED: 'outline',
  EXPIRED: 'secondary',
  LEFT: 'secondary',
  BLACKLISTED: 'destructive',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '—'}</p>
    </div>
  )
}

export function MemberProfilePage() {
  const queryClient = useQueryClient()
  const profileQuery = useQuery({ queryKey: ['members', 'me'], queryFn: membersApi.me })
  const profile = profileQuery.data

  const [form, setForm] = useState<MemberUpdatePayload>({})

  useEffect(() => {
    if (!profile) return
    setForm({
      mobile: profile.mobile,
      alternate_mobile: profile.alternate_mobile,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      emergency_contact_name: profile.emergency_contact_name,
      emergency_contact_mobile: profile.emergency_contact_mobile,
    })
  }, [profile])

  const mutation = useMutation({
    mutationFn: () => membersApi.update(profile!.id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', 'me'] })
      toast.success('Profile updated.')
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update profile.')),
  })

  const set = <K extends keyof MemberUpdatePayload>(key: K, value: MemberUpdatePayload[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  if (profileQuery.isLoading || !profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Profile" description="Your personal and contact details." />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Your personal and contact details." />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 pt-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.photo ?? undefined} alt={profile.full_name} />
            <AvatarFallback className="text-lg">{initials(profile.full_name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{profile.full_name}</h2>
              <Badge variant={STATUS_VARIANT[profile.status]}>{profile.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.member_id} · {profile.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membership details</CardTitle>
          <CardDescription>Set by the library — contact the front desk to correct any of this.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ReadOnlyField label="Date of birth" value={profile.dob ?? ''} />
          <ReadOnlyField label="Gender" value={profile.gender} />
          <ReadOnlyField label="Joined" value={profile.joining_date} />
          <ReadOnlyField label="Father's name" value={profile.father_name} />
          <ReadOnlyField label="Mother's name" value={profile.mother_name} />
          <ReadOnlyField label="Points" value={`${profile.points}/10`} />
          <ReadOnlyField label="ID proof type" value={profile.id_proof_type} />
          <ReadOnlyField label="ID proof number" value={profile.id_proof_number} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact details</CardTitle>
          <CardDescription>Keep this up to date so the library can reach you.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile</Label>
            <Input id="mobile" placeholder="10-digit mobile number" value={form.mobile ?? ''} onChange={(e) => set('mobile', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="alt-mobile">Alternate mobile</Label>
            <Input
              id="alt-mobile"
              placeholder="Optional second contact number"
              value={form.alternate_mobile ?? ''}
              onChange={(e) => set('alternate_mobile', e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" placeholder="House no., street, area" value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="e.g. Chandigarh" value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" placeholder="e.g. Punjab" value={form.state ?? ''} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode</Label>
            <Input id="pincode" placeholder="6-digit PIN code" value={form.pincode ?? ''} onChange={(e) => set('pincode', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency-name">Emergency contact name</Label>
            <Input
              id="emergency-name"
              placeholder="Who should we call in an emergency?"
              value={form.emergency_contact_name ?? ''}
              onChange={(e) => set('emergency_contact_name', e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="emergency-mobile">Emergency contact mobile</Label>
            <Input
              id="emergency-mobile"
              placeholder="Their mobile number"
              value={form.emergency_contact_mobile ?? ''}
              onChange={(e) => set('emergency_contact_mobile', e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </CardFooter>
      </Card>

      <div className="max-w-md">
        <ChangePasswordCard />
      </div>
    </div>
  )
}
