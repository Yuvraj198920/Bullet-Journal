import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

export const supabase = createClient(supabaseUrl, publicAnonKey);

export interface User {
  id: string;
  email: string;
  name?: string;
}

// Sign up new user
export async function signUp(email: string, password: string, name: string): Promise<void> {
  const response = await fetch(
    `${supabaseUrl}/functions/v1/make-server-f53d7c3b/signup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email, password, name }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create account');
  }
}

// Sign in user
export async function signIn(email: string, password: string): Promise<{ user: User; accessToken: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Failed to sign in');
  }

  if (!data.session) {
    throw new Error('No session created');
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name,
    },
    accessToken: data.session.access_token,
  };
}

// Sign out user
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message || 'Failed to sign out');
  }
}

// Get current session
export async function getSession(): Promise<{ user: User; accessToken: string } | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name,
    },
    accessToken: session.access_token,
  };
}

// Request password reset
export async function requestPasswordReset(email: string): Promise<void> {
  const supabaseUrl = `https://${projectId}.supabase.co`;
  
  const response = await fetch(
    `${supabaseUrl}/functions/v1/make-server-f53d7c3b/reset-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to request password reset');
  }
}

// Set up auth state change listener
export function onAuthStateChange(callback: (user: User | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
        });
      } else {
        callback(null);
      }
    }
  );

  return () => subscription.unsubscribe();
}
