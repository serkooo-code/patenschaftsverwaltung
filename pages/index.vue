<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { user } = useUserSession()
const role = (user.value as any)?.role
await navigateTo(role === 'admin' ? '/admin/reports' : '/teacher')
</script>
