import { defineChain } from 'viem'
 
export const viction = defineChain({
  id: 88,
  name: 'Viction',
  network: 'viction',
  nativeCurrency: {
    decimals: 18,
    name: 'Viction',
    symbol: 'VIC',
  },
  rpcUrls: {
    default: {
        http: ['https://rpc.viction.xyz'],
        webSocket: ['wss://rpc.viction.xyz'],
    },
    public: {
      http: ['https://rpc.viction.xyz'],
      webSocket: ['wss://rpc.viction.xyz'],
    }
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://www.vicscan.xyz' },
  },
})
