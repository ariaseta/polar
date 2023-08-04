import { CONFIG } from 'polarkit/config'

export const runtime = 'edge'

export async function GET() {
  return new Response(CONFIG.APPLE_DOMAIN_ASSOCIATION, {
    status: 200,
  })
}
