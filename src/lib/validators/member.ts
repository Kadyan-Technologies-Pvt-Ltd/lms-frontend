import { z } from 'zod'

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const
const ID_PROOF_TYPES = ['AADHAAR', 'PAN', 'VOTER_ID', 'DRIVING_LICENSE', 'PASSPORT', 'OTHER'] as const

export const memberFormSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .refine((val) => val === '' || val.length >= 8, 'Password must be at least 8 characters, or left blank to auto-generate one.')
    .optional(),
  first_name: z.string().min(1, 'First name is required.'),
  last_name: z.string().optional(),
  father_name: z.string().optional(),
  mother_name: z.string().optional(),
  mobile: z.string().min(10, 'Enter a valid mobile number.').max(15),
  alternate_mobile: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(GENDERS).optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  id_proof_type: z.enum(ID_PROOF_TYPES).optional().or(z.literal('')),
  id_proof_number: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_mobile: z.string().optional(),
  joining_date: z.string().min(1, 'Joining date is required.'),
  notes: z.string().optional(),
})

export type MemberFormValues = z.infer<typeof memberFormSchema>

export const memberEditFormSchema = memberFormSchema.omit({ email: true, password: true })

export type MemberEditFormValues = z.infer<typeof memberEditFormSchema>
