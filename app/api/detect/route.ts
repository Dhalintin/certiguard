// app/api/detect/route.ts
import { detectFakeCertificate } from "@/utils/engine";
import { NextRequest, NextResponse } from "next/server";

// Tell Vercel this route needs the Node.js runtime (not Edge)
// and allow up to 60 seconds for processing
export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/tiff"];
const MAX_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("certificate") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported format: ${file.type}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 10MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await detectFakeCertificate(buffer);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("[detect]", error);
    return NextResponse.json(
      { error: "Detection failed", message: error.message },
      { status: 500 }
    );
  }
}

// import { detectFakeCertificate } from "@/utils/engine";
// import { NextRequest, NextResponse } from "next/server";
// // import { detectFakeCertificate } from "@/lib/detection/engine";

// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get("certificate") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
//     }

//     const buffer = Buffer.from(await file.arrayBuffer());

//     const result = await detectFakeCertificate(buffer);

//     return NextResponse.json({
//       success: true,
//       result,
//     });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Detection failed", message: error.message },
//       { status: 500 }
//     );
//   }
// }
