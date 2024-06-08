import { connectDB } from "@/lib/connectDB";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import Analysis from "@/models/analysisModel";
import getAnalyses from "@/lib/api/getAnalyses";

export async function GET() {
  try {
    await connectDB();
    const analyses = await getAnalyses()

    return NextResponse.json({ analyses }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Error occured while fetching analyses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const newAnalysis = await req.json();

    await Analysis.create({ ...newAnalysis, user: session?.user?.id });
    return NextResponse.json({ message: "Analysis created." }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error occured while creating analysis",
      },
      { status: 500 }
    );
  }
}
