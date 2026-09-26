import { NextResponse } from "next/server";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
} as const;

export function jsonApiResponse(payload: unknown, status = 200) {
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status,
    headers: JSON_HEADERS,
  });
}

export function optionsApiResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
