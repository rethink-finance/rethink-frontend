<template>
  <div>

    <!-- Hero -->
    <section class="text-center hero">

      <div class="row">
        <div class="col-md-6 offset-md-3">
          <h1 class="hero-title">Rethink Finance</h1>
        </div>
      </div>

      <div class="d-flex flex-row justify-content-center text-white" v-if="isCantoTestnet">
        <div class="canto-hero-line-left"></div>
        <div>on</div>
        <img src="@/assets/img/canto-logo-green-on-transparent.png" class="polygon-logo" />
        <div class="canto-hero-line-right"></div>
      </div>

      <div class="d-flex flex-row justify-content-center text-white" v-if="isMumbai">
        <div class="polygon-hero-line-left"></div>
        <div>on</div>
        <img src="@/assets/img/polygon-logo-inverted.svg" class="polygon-logo" />
        <div class="polygon-hero-line-right"></div>
      </div>

      <div class="d-flex flex-row justify-content-center text-white" v-if="isPolygon">
        <div class="polygon-hero-line-left"></div>
        <div>on</div>
        <img src="@/assets/img/polygon-logo-inverted.svg" class="polygon-logo" />
        <div class="polygon-hero-line-right"></div>
      </div>
      
      <div class="d-flex flex-wrap flex-row justify-content-center text-uppercase hero-buttons" v-if="isUserConnected">
        <router-link to="/create" style="text-decoration: none">
          <a class="btn btn-success m-1" href="/create">Create Fund</a>
        </router-link>

        <router-link to="/display" style="text-decoration: none">
          <a class="btn btn-success m-1" href="/invest">Discover Funds</a>
        </router-link>
      </div> 

      <div class="d-flex flex-wrap flex-row justify-content-center text-uppercase hero-buttons" v-if="!isUserConnected">
        <a class="btn btn-outline-success m-1" target="_blank" href="https://discord.gg/dB9yaEf5YQ">Join Discord</a>

        <button class="btn btn-success m-1" v-if="!isUserConnected && isCompliant" @click="connectWeb3Modal">Connect wallet</button>
        <button class="btn btn-success m-1" v-if="!isUserConnected && !isCompliant" data-bs-toggle="modal" data-bs-target="#complianceModal">Connect wallet</button>
      </div> 


    </section>
    <!-- END Hero -->

    <div class="d-flex flex-row justify-content-center mb-5">
      <hr class="section-divider" />
    </div>

    <!-- Why On Change Decentralized Fund Management -->
    <section id="why-on-chan-fund-management" class="text-center">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">Why On-Chain Decentralized Asset Management?</h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/arrow-down.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/leverage.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/strategies.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/yield.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>
      </div>
    </section>
    <!-- EMD Why On Change Decentralized Fund Management -->

    <!-- PeckShield -->
    <div class="d-flex flex-wrap flex-row justify-content-center mx-3">
      <div class="peckshield-banner d-flex flex-wrap flex-row justify-content-around align-items-center">
        <img src="@/assets/img/security-icon.svg" class="img-fluid peckshield-image" />

        <div class="peckshield-text">
          <h2 class="peckshield-title">Security is our top priority.</h2>

          <p class="text-white peckshield-description">
            Rethink Finance
            <a class="audit-link" target="_blank" href="/">
              has been audited by AuditOne.
            </a>
          </p>
        </div>
        
      </div>
    </div>
    <!-- END PeckShield -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Why Rethink Finance -->
    <section id="why-rethink-finance" class="text-center">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">Why Rethink Finance?</h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/arrow-down.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/leverage.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/strategies.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>

        <div class="col-md-3 why-options-col">
          <img src="@/assets/img/yield.svg" class="feature-image" />
          
          <h3 class="feature-title">Blah Blah</h3>

          <p class="feature-text">
            Blah Blah Blah Blah Blah Blah
          </p>
        </div>
      </div>
    </section>
    <!-- Why Rethink Finance -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Community -->
    <section id="why-defi-options" class="text-center mt-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">
            We are a community<br>
            - not a company.
          </h3>
        </div>
      </div>

      <div class="row text-white text-center why-options-row mx-5">

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/noncustodial.svg" class="feature-image" />
          
          <h3 class="feature-title">Non-custodial</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              Users of Rethink Finance have full ownership of their funds at all times
            </p>
          </div>
        </div>

        <div class="col-md-6 why-options-col">
          <img src="@/assets/img/decentralized.svg" class="feature-image" />
          
          <h3 class="feature-title">Decentralised</h3>

          <div class="d-flex flex-row justify-content-center">
            <p class="feature-text-short">
              All users play a part in shaping the future of the platform.
            </p>
          </div>
        </div>

      </div>
    </section>
    <!-- END Community -->

    <div class="d-flex flex-row justify-content-center mb-5 mt-5">
      <hr class="section-divider" />
    </div>

    <!-- Join us -->
    <div class="text-center mt-5">

      <div class="row mb-5">
        <div class="col-md-6 offset-md-3">
          <h3 class="section-title">
            Join us
          </h3>
        </div>
      </div>

      <ul class="nav pb-3 mb-3 row">

        <li class="nav-item col mt-4">
          <a href="https://discord.gg/dB9yaEf5YQ" target="_blank" class="btn btn-social">
            <i class="fab fa-discord"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://twitter.com/RethinkProtocol" target="_blank" class="btn btn-social">
            <i class="fab fa-twitter"></i>
          </a>
        </li>

        <li class="nav-item col mt-4">
          <a href="https://github.com/rethink-finance" target="_blank" class="btn btn-social">
            <i class="fab fa-github"></i>
          </a>
        </li>

      </ul>

    </div>
    <!-- END Join us -->

    <div class="row mt-5">
      <div class="col-md-10 offset-md-1 text-center text-white">
        <small class="disclaimer-text">
          DISCLAIMER: Rethink Finance DAO (RTNK) tokens are utility tokens targeted solely at creating a 
          community of supporters of the protocol. They don't hold any monetary value, nor can they be 
          characterized as investment, shares or securities of any type. Owning RTNK tokens doesn't entitle 
          you any rights or guarantees of any kind. This project doesn't provide any assurance of being 
          finished or launched in any network other than goerli testnet. If you've swapped any other token 
          or crypto to acquire RTNK tokens be advised that you WON'T be refunded under any circumstances. 
          Acquire RTNK tokens at your own discretion. You are waiving your rights and agreeing to these terms 
          and conditions if you decide to go further and become a holder of RTNK tokens. If you are uncertain 
          as to anything in this informative website or you are not prepared to lose all tokens or crypto that 
          you swap for acquiring RTNK tokens, we strongly urge you not to acquire any RTNK tokens, not to engage 
          with RTNK and to leave this website immediately.
        </small>
      </div>
    </div>


  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Home",

  computed: {
    ...mapGetters("accounts", ["getWeb3", "getChainName", "isUserConnected"]),

    isGoerli() {
      return this.getChainName == "Goerli";
    },

    isMumbai() {
      return this.getChainName == "Mumbai";
    },

    isCantoTestnet() {
      return this.getChainName == "Canto Testnet";
    },

    isPolygon() {
      return this.getChainName == "Polygon";
    }
  },

  created() {
    this.$store.dispatch("accounts/initWeb3Modal");
    this.$store.dispatch("accounts/ethereumListener");
    // check if user has already confirmed the compliance modal (this modal is in Navbar)
    this.isCompliant = localStorage.getItem('isCompliant');
    this.$store.dispatch("fundFactory/fetchContract");
    this.$store.dispatch("fundFactory/fetchFunds");
  },

  data() {
    return {
      isCompliant: null
    }
  },

  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),
  }
}
</script>

<style scoped>
.audit-link {
  color: white;
  text-decoration: underline;
}

.audit-link:hover {
  text-decoration: none;
}

.btn-social:hover {
  background-color: #00072D;
  border-color: #5AFFB0;
  color: #5AFFB0;
}

.btn-social {
  width: 80px;
  height: 80px;
  line-height: 80px;
  text-align: center;
  padding: 0;
  border-radius: 50%;
  font-size: 1.3rem;
  background-color: #5AFFB0;
  border-color: #5AFFB0;
  color: #00072D;
}

.feature-image {
  margin-bottom: 24px;
}

.feature-text {
  font-size: 14px;
  font-weight: 300;
}

.feature-text-short {
  font-size: 14px;
  font-weight: 300;
  width: 460px;
}

.feature-title {
  margin-bottom: 8px;
  font-size: 20px;
  font-weight: 400;
  text-transform: none;
}

.hero {
  margin-top: 120px;
  margin-bottom: 60px;
}

.hero-buttons {
  margin-top: 70px;
}

.polygon-hero-line-left {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #7951DD 0%, rgba(32, 164, 221, 0) 100%);
  margin-top: 11px;
  margin-right: 16px;
}

.polygon-hero-line-right {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #7951DD 0%, rgba(32, 164, 221, 0) 100%);
  margin-top: 11px;
  transform: rotate(180deg);
  margin-left: 16px;
}

.canto-hero-line-left {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #48cc8c 0%, rgba(90, 255, 176, 0) 100%);
  margin-top: 11px;
  margin-right: 16px;
}

.canto-hero-line-right {
  width: 190px;
  height: 1px;
  background: linear-gradient(270deg, #48cc8c 0%, rgba(90, 255, 176, 0) 100%);
  margin-top: 11px;
  transform: rotate(180deg);
  margin-left: 16px;
}

.hero-title {
  font-weight: 400;
  font-size: 60px;
  color: #FFFFFF;
}

.ml-40-px {
  margin-left: 40px;
}

.nav-item {
  color: #5AFFB0;
  font-weight: 500;
}

.polygon-logo {
  height: 26px;
  margin-left: 16px;
}

.section-divider {
  background: linear-gradient(270deg, rgba(32, 164, 221, 0) 0%, #5AFFB0 48.96%, rgba(32, 164, 221, 0) 100%);
  width: 220px;
  height: 1px;
}

.section-title {
  font-weight: 400;
  font-size: 32px;
  color: #FFFFFF;
  text-transform: none;
}

.why-options-col {
  padding-right: 20px;
  padding-left: 20px;
  margin-bottom: 40px;
}

/* iPhone 8 */
@media screen and (max-width: 375px) {
  .hero-title {
    font-size: 50px;
  }
}

/* iPhone SE */
@media screen and (max-width: 320px) {
  .hero-title {
    font-size: 45px;
  }

  .ml-40-px {
    margin-left: 30px;
  }
}
</style>