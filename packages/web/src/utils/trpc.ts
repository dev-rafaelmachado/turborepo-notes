import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@monorepo/api'
import { inferRouterOutputs } from '@trpc/server'

export const trpc = createTRPCReact<AppRouter>()
export type RouterOutput = inferRouterOutputs<AppRouter>
