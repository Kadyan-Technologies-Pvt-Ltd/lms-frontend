import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiErrorMessage } from '@/lib/api/errors'
import { librarySettingsApi } from '@/lib/api/settings'

const DEFAULT_MEMBER_POINTS_KEY = 'default_member_points'
const LOW_POINT_THRESHOLD_KEY = 'low_point_threshold'

export function SystemSettingsPanel() {
  const queryClient = useQueryClient()
  const [defaultPoints, setDefaultPoints] = useState('5')
  const [lowPointThreshold, setLowPointThreshold] = useState('3')

  const settingsQuery = useQuery({ queryKey: ['settings', 'library-settings'], queryFn: librarySettingsApi.list })

  useEffect(() => {
    if (!settingsQuery.data) return
    const points = settingsQuery.data.find((s) => s.key === DEFAULT_MEMBER_POINTS_KEY)
    const threshold = settingsQuery.data.find((s) => s.key === LOW_POINT_THRESHOLD_KEY)
    if (points) setDefaultPoints(points.value)
    if (threshold) setLowPointThreshold(threshold.value)
  }, [settingsQuery.data])

  const mutation = useMutation({
    mutationFn: async () => {
      await librarySettingsApi.save(DEFAULT_MEMBER_POINTS_KEY, defaultPoints)
      await librarySettingsApi.save(LOW_POINT_THRESHOLD_KEY, lowPointThreshold)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings saved.')
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not save settings.')),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points & blacklist</CardTitle>
        <CardDescription>Controls used across member point adjustments and low-point warnings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="default-points">Default points for new members</Label>
          <Input
            id="default-points"
            type="number"
            min={0}
            max={10}
            value={defaultPoints}
            onChange={(e) => setDefaultPoints(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="low-point-threshold">Low-point warning threshold</Label>
          <Input
            id="low-point-threshold"
            type="number"
            min={0}
            max={10}
            value={lowPointThreshold}
            onChange={(e) => setLowPointThreshold(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          {mutation.isPending ? 'Saving…' : 'Save settings'}
        </Button>
      </CardFooter>
    </Card>
  )
}
