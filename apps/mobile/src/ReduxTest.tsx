import { View, Text, Pressable } from 'react-native'
import {
  useAppDispatch,
  useAppSelector,
  authAuthenticated,
  authUnauthenticated,
} from '@av/store'

export function ReduxTest() {
  const dispatch = useAppDispatch()
  const { user, status } = useAppSelector((s) => s.auth)

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ marginBottom: 12, fontSize: 16 }}>
        Status: {status}
      </Text>

      <Text style={{ marginBottom: 24 }}>
        User: {user ? user.email : 'none'}
      </Text>

      <Pressable
        style={{
          backgroundColor: '#2563eb',
          padding: 12,
          borderRadius: 6,
          marginBottom: 12,
        }}
        onPress={() =>
          dispatch(
            authAuthenticated({
              id: 'mobile-test',
              email: 'mobile@test.com',
            })
          )
        }
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Login (Test)
        </Text>
      </Pressable>

      <Pressable
        style={{
          backgroundColor: '#dc2626',
          padding: 12,
          borderRadius: 6,
        }}
        onPress={() => dispatch(authUnauthenticated())}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          Logout
        </Text>
      </Pressable>
    </View>
  )
}
