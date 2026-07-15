import { detectFakeCertificate } from "@/utils/engine";
import { NextRequest, NextResponse } from "next/server";
// import { detectFakeCertificate } from "@/lib/detection/engine";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("certificate") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await detectFakeCertificate(buffer);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Detection failed", message: error.message },
      { status: 500 }
    );
  }
}
