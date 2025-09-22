import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the requesting user
    const { data: user, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is a business owner
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, business_id')
      .eq('id', user.user.id)
      .single()

    if (profile?.role !== 'owner') {
      throw new Error('Only business owners can create employees')
    }

    const { name, email, phone, position, salary, hire_date, is_active, shift } = await req.json()

    // Validate required fields
    if (!name || !email || !position) {
      throw new Error('Name, email, and position are required fields')
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(user => user.email === email)
    
    let authUser
    if (existingUser) {
      // If user exists, check if they're already an employee for this business
      const { data: existingEmployee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('profile_id', existingUser.id)
        .eq('business_id', profile.business_id)
        .maybeSingle()
      
      if (existingEmployee) {
        throw new Error('This person is already an employee at your business')
      }
      
      // Use existing user
      authUser = { user: existingUser }
    } else {
      // Create new auth user
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8), // Temporary password
        user_metadata: {
          name,
          role: 'employee'
        }
      })

      if (authError || !newAuthUser.user) {
        throw new Error(authError?.message || 'Failed to create user account')
      }
      
      authUser = newAuthUser
    }

    // Create or update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: authUser.user.id,
        name,
        email,
        phone,
        role: 'employee',
        business_id: profile.business_id
      })
      .select()

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    // Create employee record
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        profile_id: authUser.user.id,
        position,
        salary,
        hire_date,
        is_active,
        shift_schedule: { shift },
        business_id: profile.business_id
      })

    if (employeeError) {
      throw new Error(`Failed to create employee: ${employeeError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, user_id: authUser.user.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})