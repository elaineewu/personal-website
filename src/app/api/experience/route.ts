import { getExperiencePayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getExperiencePayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
