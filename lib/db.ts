import bcrypt from 'bcryptjs';

// Mock user database (for demonstration purposes)
// In a real app, use a real database like Supabase, Firebase, or PostgreSQL.
const users: any[] = [];

export async function createUser(email: string, password: string, name: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Math.random().toString(36).substring(2, 15),
    email,
    password: hashedPassword,
    name,
    createdAt: new Date(),
  };
  users.push(user);
  return user;
}

export async function findUserByEmail(email: string) {
  return users.find((u) => u.email === email);
}

export async function verifyPassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash);
}
