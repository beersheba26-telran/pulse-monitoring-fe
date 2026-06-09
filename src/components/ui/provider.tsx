"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})

export function Provider(props: ColorModeProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </QueryClientProvider>
  )
}
