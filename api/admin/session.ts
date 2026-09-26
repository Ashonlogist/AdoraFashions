import type { ApiRequest, ApiResponse } from '../_lib/http'
import {
  authConfigurationError,
  configurationError,
  hasValidSession,
  methodNotAllowed,
} from '../_lib/auth'

/**
 * Cheap probe the login screen uses to decide whether to render a password field
 * or bounce straight to the dashboard.
 *
 * `configured` covers signing in; `writable` covers GitHub. Reporting them
 * separately is what lets the dashboard say "the password is fine, the GitHub
 * token is not" instead of showing an empty screen.
 */
export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({
    authenticated: hasValidSession(req),
    configured: !authConfigurationError(),
    writable: !configurationError(),
    message: authConfigurationError() ?? configurationError(),
  })
}
