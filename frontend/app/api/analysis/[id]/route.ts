import { connectDB } from "@/lib/connectDB";
import Analysis from "@/models/analysisModel";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const analysis = await Analysis.findOne({
      _id: params.id,
      user: session?.user?.id,
    }).select("patient note ecg.sampling_frequency date updatedAt");

    if (!analysis)
      return NextResponse.json(
        { message: "You don't have analysis with such id" },
        { status: 404 }
      );

    return NextResponse.json({ analysis }, { status: 200 });
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
