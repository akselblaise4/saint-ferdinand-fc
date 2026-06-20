import { NextResponse } from "next/server";
import { getCopaData } from "@/lib/loadData";

export async function GET() {
  const data = getCopaData();
  return NextResponse.json(data);
}
