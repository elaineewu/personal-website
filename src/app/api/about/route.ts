import { getAboutPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

export function GET() {
  return jsonApiResponse(getAboutPayload());
}

export function OPTIONS() {
  return optionsApiResponse();
}
