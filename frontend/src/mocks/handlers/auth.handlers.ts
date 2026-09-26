import { http, HttpResponse, delay } from 'msw'
import { mockTestUser, mockUsers, mockCredentials } from '../fixtures/users'

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    await delay(500)
    const body = await request.json() as { email: string; password: string }

    const account = mockCredentials[body.email]
    if (account && body.password === account.password) {
      return HttpResponse.json({
        success: true,
        data: {
          user: account.user,
          accessToken: 'mock-access-token-xyz',
        },
      })
    }

    return HttpResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    )
  }),

  http.post('/api/v1/auth/signup', async ({ request }) => {
    await delay(800)
    const body = await request.json() as Record<string, unknown>
    
    const newUser = {
      ...mockUsers[0],
      id: 'new-user-' + Date.now(),
      name: body.name as string,
      email: body.email as string,
      role: body.role as string,
    }
    
    return HttpResponse.json({
      success: true,
      data: {
        user: newUser,
        accessToken: 'mock-access-token-new',
      },
    })
  }),

  http.post('/api/v1/auth/logout', async () => {
    await delay(200)
    return HttpResponse.json({ success: true, message: 'Logged out successfully' })
  }),

  http.post('/api/v1/auth/refresh', async () => {
    await delay(300)
    return HttpResponse.json({
      success: true,
      data: { accessToken: 'mock-refreshed-token' },
    })
  }),

  http.get('/api/v1/auth/me', async ({ request }) => {
    await delay(300)
    const auth = request.headers.get('Authorization')
    if (!auth) {
      return HttpResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json({ success: true, data: mockUsers[0] })
  }),
]
