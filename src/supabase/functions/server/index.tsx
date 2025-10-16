import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client with service role for admin operations
const getServiceClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Initialize Supabase client for regular operations
const getAnonClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Helper to verify user authentication
const verifyAuth = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization token provided');
  }
  
  const token = authHeader.split(' ')[1];
  const supabase = getServiceClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
};

// Health check endpoint
app.get("/make-server-f53d7c3b/health", (c) => {
  return c.json({ status: "ok" });
});

// Register new user
app.post('/make-server-f53d7c3b/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Validate password
    if (password.length < 8) {
      return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return c.json({ error: 'Password must contain a special character' }, 400);
    }
    if (!/[A-Z]/.test(password)) {
      return c.json({ error: 'Password must contain an uppercase letter' }, 400);
    }
    if (!/[a-z]/.test(password)) {
      return c.json({ error: 'Password must contain a lowercase letter' }, 400);
    }
    if (!/[0-9]/.test(password)) {
      return c.json({ error: 'Password must contain a number' }, 400);
    }

    const supabase = getServiceClient();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message || 'Failed to create account' }, 400);
    }

    return c.json({ 
      success: true, 
      message: 'Account created successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Request password reset
app.post('/make-server-f53d7c3b/reset-password', async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const supabase = getAnonClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify`,
    });

    if (error) {
      console.error('Password reset error:', error);
    }

    // Don't reveal if email exists for security
    return c.json({ 
      success: true, 
      message: 'If an account exists, a reset email has been sent' 
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return c.json({ error: 'Failed to process password reset' }, 500);
  }
});

// Get current user session
app.get('/make-server-f53d7c3b/me', async (c) => {
  try {
    const user = await verifyAuth(c.req.header('Authorization'));
    
    return c.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name,
      created_at: user.created_at
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, 401);
  }
});

Deno.serve(app.fetch);