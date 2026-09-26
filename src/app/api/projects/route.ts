import { getProjectsPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getProjectsPayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
