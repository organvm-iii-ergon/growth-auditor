import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserData } from "@/lib/db";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteUserData(session.user.email);
    
    // Attempt to sign out the user after deletion
    return NextResponse.json({ success: true, message: "Your cosmic footprint has been erased." });
  } catch (error: unknown) {
    console.error("Data Deletion Error:", error);
    return NextResponse.json({ error: "Failed to delete data" }, { status: 500 });
  }
}
