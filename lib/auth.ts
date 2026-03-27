import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool, { connectToDatabase } from './pg';

export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponse {
    success: boolean;
    user?: Omit<User, 'password'>;
    token?: string;
    message?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

export async function createUser(name: string, email: string, password: string): Promise<AuthResponse> {
    const client = await connectToDatabase();
    try {
        // Check if user already exists
        const checkResult = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (checkResult.rows.length > 0) {
            return { success: false, message: 'User already exists with this email' };
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        
        const insertResult = await client.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at, updated_at',
            [name, email.toLowerCase(), hashedPassword]
        );

        const row = insertResult.rows[0];
        const user = {
            _id: row.id.toString(),
            name: row.name,
            email: row.email,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        const token = generateToken(user._id);

        return {
            success: true,
            user,
            token,
        };
    } catch (error) {
        console.error('Create user error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        client.release();
    }
}

export async function authenticateUser(email: string, password: string): Promise<AuthResponse> {
    const client = await pool.connect();
    try {
        // Find user by email
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return { success: false, message: 'Invalid email or password' };
        }

        const row = result.rows[0];

        // Verify password
        const isValidPassword = await verifyPassword(password, row.password);
        if (!isValidPassword) {
            return { success: false, message: 'Invalid email or password' };
        }

        const user = {
            _id: row.id.toString(),
            name: row.name,
            email: row.email,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };

        const token = generateToken(user._id);

        return {
            success: true,
            user,
            token,
        };
    } catch (error) {
        console.error('Authenticate user error:', error);
        return { success: false, message: 'Internal server error' };
    } finally {
        client.release();
    }
}