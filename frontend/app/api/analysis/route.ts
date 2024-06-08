import { connectDB } from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Analysis from "@/models/analysisModel";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const newAnalysis = await req.json();

    await Analysis.create({ ...newAnalysis, user: session?.user?.id });
    return NextResponse.json({ message: "Analysis created." }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Error occured while registering the user",
      },
      { status: 500 }
    );
  }
}
