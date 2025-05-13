// app/api/users/route.ts
import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/repositories/userRepository";

const userRepository = new UserRepository();

export async function GET() {
  try {
    const users = await userRepository.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}