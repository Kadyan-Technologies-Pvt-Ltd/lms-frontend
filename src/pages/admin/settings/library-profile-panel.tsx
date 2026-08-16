import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiErrorMessage } from '@/lib/api/errors'
import { libraryProfileApi } from '@/lib/api/settings'

interface FormState {
  name: string
  address: string
  phone: string
  email: string
}

const EMPTY_FORM: FormState = { name: '', address: '', phone: '', email: '' }

export function LibraryProfilePanel() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [logo, setLogo] = useState<File | null>(null)

  const profileQuery = useQuery({ queryKey: ['settings', 'library-profile'], queryFn: libraryProfileApi.get })

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        name: profileQuery.data.name,
        address: profileQuery.data.address,
        phone: profileQuery.data.phone,
        email: profileQuery.data.email,
      })
    }
  }, [profileQuery.data])

  const mutation = useMutation({
    mutationFn: () => libraryProfileApi.update(form, logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'library-profile'] })
      toast.success('Library profile updated.')
      setLogo(null)
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not update library profile.')),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Library profile</CardTitle>
        <CardDescription>Shown on receipts and used as the library's contact details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={logo ? URL.createObjectURL(logo) : (profileQuery.data?.logo ?? undefined)} />
            <AvatarFallback>
              <Building2 className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="library-logo">Logo</Label>
            <Input
              id="library-logo"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP, up to 5MB.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="library-name">Name</Label>
            <Input
              id="library-name"
              placeholder="e.g. RR Group of Library"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="library-email">Email</Label>
            <Input
              id="library-email"
              type="email"
              placeholder="library@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="library-phone">Phone</Label>
            <Input
              id="library-phone"
              placeholder="10-digit phone number"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="library-address">Address</Label>
            <Input
              id="library-address"
              placeholder="Full postal address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </CardFooter>
    </Card>
  )
}
