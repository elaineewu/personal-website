import { getResumePayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getResumePayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
