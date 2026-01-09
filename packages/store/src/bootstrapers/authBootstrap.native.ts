import { getCurrentUser } from 'aws-amplify/auth'
import {
  authAuthenticated,
  authUnauthenticated,
  authLoading,
} from '../auth'
import type { AppDispatch } from '../createStore'

export async function bootstrapAuthNative(dispatch: AppDispatch) {
  dispatch(authLoading())

  try {
    const user = await getCurrentUser()

    dispatch(
      authAuthenticated({
        id: user.userId,
        email: user.signInDetails?.loginId,
      })
    )
  } catch {
    dispatch(authUnauthenticated())
  }
}
