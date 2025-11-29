import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import { webTokens } from "./tokens/web"
const config = defineConfig({
  theme: {
    ...webTokens,
  }
})

export const system = createSystem(defaultConfig, config)
