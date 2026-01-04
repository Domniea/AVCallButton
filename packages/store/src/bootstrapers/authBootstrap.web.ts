import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth'
import {
  authAuthenticated,
  authUnauthenticated,
  authLoading,
} from '../auth'
import type { AppDispatch } from '../createStore'

export async function bootstrapAuthWeb(dispatch: AppDispatch) {
  dispatch(authLoading())

  try {
    const session = await fetchAuthSession()

    if (!session.tokens?.idToken) {
      dispatch(authUnauthenticated())
      return
    }

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
