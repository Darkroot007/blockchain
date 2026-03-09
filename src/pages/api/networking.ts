import { networkingPageData } from '../../data/networking';

export function GET() {
  return Response.json(networkingPageData);
}
