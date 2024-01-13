import { ChakraProvider } from '@chakra-ui/react'
import type { AppProps } from 'next/app'
import WalletContextProvider from '../components/WalletContextProvider'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WalletContextProvider>
        <Component {...pageProps} />
      </WalletContextProvider>
    </ChakraProvider>
  )
}

export default MyApp
