import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiErrorMessage } from '@/lib/api/errors'
import { libraryProfileApi } from '@/lib/api/settings'
import { cn } from '@/lib/utils'

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
      // Prefix match, deliberately: the branding is read through TWO keys —
      // ['settings','library-profile'] by the sidebar and receipts, and
      // ['settings','library-branding-public'] by the login page, which has no
      // session and so uses the public endpoint. Invalidating only the first
      // left the login page showing the old logo until its cache expired.
      queryClient.invalidateQueries({ queryKey: ['settings'] })
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
            {/* A plain heading, not a <label>: the "Choose image" label below
                is the one bound to the input. Two labels pointing at the same
                control makes screen readers announce it twice. */}
            <p className="text-sm font-medium leading-none">Logo</p>
            {/* The native file input renders as an unstyleable "Choose File"
                control that ignores the design system. Standard fix: keep the
                real input for behaviour and accessibility but visually hide
                it, and drive it from a <label>, which browsers already treat
                as a click target for its input — no onClick/ref needed, and it
                stays keyboard- and screen-reader-friendly. */}
            <div className="flex items-center gap-3">
              <input
                id="library-logo"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <Label
                htmlFor="library-logo"
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'sm' }),
                  'cursor-pointer font-normal',
                  // sr-only strips the input from the layout, so it can't show
                  // a focus ring of its own — mirror it onto the label instead.
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                )}
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose image
              </Label>
              <span className="truncate text-sm text-muted-foreground" title={logo?.name}>
                {logo ? logo.name : 'No file chosen'}
              </span>
            </div>
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
