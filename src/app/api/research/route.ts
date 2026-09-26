import { getResearchPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getResearchPayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
