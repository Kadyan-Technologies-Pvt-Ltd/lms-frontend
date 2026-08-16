export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'LEFT' | 'BLACKLISTED'
export type Gender = 'MALE' | 'FEMALE' | 'OTHER'
export type IdProofType = 'AADHAAR' | 'PAN' | 'VOTER_ID' | 'DRIVING_LICENSE' | 'PASSPORT' | 'OTHER'

export interface MemberProfile {
  id: string
  user: string
  member_id: string
  full_name: string
  email: string
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  mobile: string
  alternate_mobile: string
  dob: string | null
  gender: Gender | ''
  address: string
  city: string
  state: string
  pincode: string
  photo: string | null
  id_proof_type: IdProofType | ''
  id_proof_number: string
  id_proof_file: string | null
  emergency_contact_name: string
  emergency_contact_mobile: string
  joining_date: string
  points: number
  status: MemberStatus
  blacklist_reason: string
  blacklisted_at: string | null
  blacklisted_by: string | null
  biometric_uid: string | null
  notes: string
  created_at: string
  updated_at: string
}

export interface MemberCreatePayload {
  email: string
  password?: string
  first_name: string
  last_name?: string
  father_name?: string
  mother_name?: string
  mobile: string
  alternate_mobile?: string
  dob?: string
  gender?: Gender
  address?: string
  city?: string
  state?: string
  pincode?: string
  id_proof_type?: IdProofType
  id_proof_number?: string
  emergency_contact_name?: string
  emergency_contact_mobile?: string
  joining_date: string
  notes?: string
}

export interface MemberCreateResponse extends MemberProfile {
  generated_password?: string
}

export type MemberUpdatePayload = Partial<
  Omit<MemberCreatePayload, 'email' | 'password'> & { alternate_mobile: string }
>
