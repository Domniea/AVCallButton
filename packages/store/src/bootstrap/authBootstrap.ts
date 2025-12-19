import {
  authAuthenticated,
  authLoading,
  authUnauthenticated,
  AuthUser,
} from '../slices/authSlice'
import type { AppDispatch } from '../store'

export async function bootstrapAuth(dispatch: AppDispatch) {
  dispatch(authLoading())

  try {
    // Placeholder: later this becomes Cognito/session lookup
    const user: AuthUser | null = null

    if (user) {
      dispatch(authAuthenticated(user))
    } else {
      dispatch(authUnauthenticated())
    }
  } catch {
    dispatch(authUnauthenticated())
  }
}
