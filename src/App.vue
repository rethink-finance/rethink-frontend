<template>
  <div class="container">
    <Navbar />

    <div v-if="isUserConnected && !getChainName" class="alert alert-danger" role="alert">
      You are on an unsupported network. Click here to connect to either 
      <span @click="switchToFraxtal" class="network-switch-link">Fraxtal</span>.
      <span @click="switchToGoerli" class="network-switch-link">Goerli testnet</span>.
      <span @click="switchToPolygon" class="network-switch-link">Polygon</span> or 
      <span @click="switchToKovan" class="network-switch-link">Kovan testnet</span> or 
      <span @click="switchToMumbai" class="network-switch-link">Mumbai testnet</span> or 
      <span @click="switchToFuji" class="network-switch-link">Fuji testnet</span> or
      <span @click="switchToCantoTestnet" class="network-switch-link">Canto testnet</span> or
      <span @click="switchToArbitrum" class="network-switch-link">Arbitrum One</span>.
      <span @click="switchToArbitrumGoerli" class="network-switch-link">Arbitrum Goerli testnet</span>.
      <span @click="switchToEthereum" class="network-switch-link">Ethereum</span>.
      <span @click="switchToArbitrumSepolia" class="network-switch-link">Arbitrum Sepolia testnet</span>.
      <span @click="switchToBase" class="network-switch-link">Base</span>.
    </div>

    <router-view />

    <Footer />

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Footer from './components/Footer.vue';
import Navbar from './components/Navbar.vue';

export default {
  name: 'App',

  components: {
    Navbar,
    Footer
  },

  computed: {
    ...mapGetters("accounts", ["getChainName", "getSupportedChains", "isUserConnected"]),
  },

  methods: {
    switchToEthereum() {
      window.ethereum.request({ 
        method: 'wallet_addEthereumChain', 
        params: [{ 
          chainId: '0x1', 
          chainName: 'Ethereum', 
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, 
          rpcUrls: ['https://eth.drpc.com/'], 
          blockExplorerUrls: ['https://etherscan.com/']
        }] 
      });
    },
    switchToPolygon() {
      window.ethereum.request({ 
        method: 'wallet_addEthereumChain', 
        params: [{ 
          chainId: '0x89', 
          chainName: 'Polygon PoS Chain', 
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, 
          rpcUrls: ['https://polygon-rpc.com/'], 
          blockExplorerUrls: ['https://polygonscan.com/']
        }] 
      });
    },
    switchToKovan() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x2a'
        }] 
      });
    },
    switchToMumbai() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x13881'
        }] 
      });
    },
    switchToFuji() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0xa869'
        }] 
      });
    },
    switchToCantoTestnet() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x1e15'
        }] 
      });
    },
    switchToArbitrum() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0xa4b1'
        }] 
      });
    },
    switchToArbitrumGoerli() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x66eed'
        }] 
      });
    },
    switchToGoerli() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x5'
        }] 
      });
    },
    switchToFraxtal() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0xfc'
        }] 
      });
    },
    switchToArbitrumSepolia() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x66eee'
        }] 
      });
    },
    switchToBase() {
      window.ethereum.request({ 
        method: 'wallet_switchEthereumChain', 
        params: [{ 
          chainId: '0x2105'
        }] 
      });
    }
  },
  watch: {
    getChainName: function () {
      // update everything whenever the network is changed
      this.$store.dispatch("fundFactory/fetchContract");
      this.$store.dispatch("fundFactory/storeAddress");


      this.$store.dispatch("dai/fetchContract");
      this.$store.dispatch("dai/storeAddress");
      this.$store.dispatch("usdc/fetchContract");
      this.$store.dispatch("usdc/storeAddress");


      this.$store.dispatch("dai/fetchUserBalance");
      this.$store.dispatch("usdc/fetchUserBalance");
    }
  }
}
</script>

<style scoped>
 .modal {
   display: block;
 }

.network-switch-link {
  text-decoration: underline;
  cursor: pointer;
}
</style>
