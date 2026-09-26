import { getApiNotFoundPayload } from "@/lib/api-payloads";
import { jsonApiResponse, optionsApiResponse } from "@/lib/api-http";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const path = `/api/${slug.join("/")}`;
  return jsonApiResponse(getApiNotFoundPayload(path), 404);
}

export function OPTIONS() {
  return optionsApiResponse();
}
