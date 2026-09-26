import { getApiIndexPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getApiIndexPayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
