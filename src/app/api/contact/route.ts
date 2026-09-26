import { getContactPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getContactPayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
