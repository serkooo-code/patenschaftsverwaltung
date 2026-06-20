export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn, user } = useUserSession()
  if (!loggedIn.value) return navigateTo('/login')
  if ((user.value as any)?.role !== 'admin') return navigateTo('/')
})
