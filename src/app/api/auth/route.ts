import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authUsers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

// Helper function to generate JWT token
const generateToken = (userId: number, email: string) => {
  return sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};
export async function POST(req: NextRequest) {
  try {
    const { email, password, action } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (action === 'register') {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email));

      if (existingUser.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const [newUser] = await db
        .insert(authUsers)
        .values({
          email,
          password: hashedPassword,
        })
        .returning();

      // Generate token
      const token = generateToken(newUser.id, newUser.email);

      return NextResponse.json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      });
    } else if (action === 'login') {
      // Find user
      const [user] = await db
        .select()
        .from(authUsers)
        .where(eq(authUsers.email, email));

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate token
      const token = generateToken(user.id, user.email);

      return NextResponse.json({
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 