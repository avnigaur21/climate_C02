import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import Database from '../database/connection';
import { User } from '../types';

export class AuthService {
  private db = Database.getInstance();

  private signToken(user: Pick<User, 'id' | 'email'>): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const options: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn']
    };

    return jwt.sign({ userId: user.id, email: user.email }, secret as Secret, options);
  }

  async signup(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Check if user already exists
    const existingUser = await this.db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await this.db.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at, updated_at',
      [email, passwordHash, 'user']
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = this.signToken(user);

    return { user, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string }> {
    // Find user
    const result = await this.db.query(
      'SELECT id, email, password_hash, role, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.signToken(user);

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const result = await this.db.query(
      'SELECT id, email, role, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }
}
