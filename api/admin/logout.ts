import type { ApiRequest, ApiResponse } from '../_lib/http'
import { clearSessionCookie, methodNotAllowed } from '../_lib/auth'

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])
  clearSessionCookie(res)
  return res.status(200).json({ ok: true })
}
