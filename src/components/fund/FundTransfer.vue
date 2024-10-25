<template>
  <div class="mt-3">
    <h3>Transfer Base Asset Token Into FundDAO contract (NEED TO BE CONNECTED THRU ZODIAC PILOT)</h3>

    <div class="section-small">
      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="depositValue" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>

        <div class="token-dropdown form-button-mobile">
          <div class="btn-group" aria-describedby="button-text">
            <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
              {{selectedToken}}
            </button>
            <ul class="dropdown-menu">
              <li>
                <span class="dropdown-item text-uppercase" @click="changeStablecoin('DAI')">DAI</span>
                <span class="dropdown-item text-uppercase" @click="changeStablecoin('USDC')">USDC</span>
              </li>
            </ul>
          </div>
        </div>


        <div class="deposit-button form-button-mobile">
          <button 
            class="btn btn-success btn-user btn-block text-uppercase form-control" 
            :disabled="isDepositValueNotValid.status || Number(this.depositValue) === 0" 
            @click="transferFromSafe">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Transfer
          </button>
          <div></div>
        </div>
        
      </div>

      <!-- Help text -->
      <div class="help-text" v-if="isDepositValueNotValid.status">
        {{ isDepositValueNotValid.message }} 
        <span v-if="(Math.floor(Number(this.getUserStablecoinBalance*1000))/1000) > 0">
          Try <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
            {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
          </a> {{selectedToken}}.
        </span>
      </div>

      <div class="help-text" v-if="!isDepositValueNotValid.status">
        Your {{selectedToken}} balance: 
        <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
          {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
        </a> {{selectedToken}}.
      </div>
    
      <!-- Deposit Confirmation Modal -->
      <div class="modal fade" id="depositModal" tabindex="-1" aria-labelledby="depositModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="depositModalLabel">Deposit Confirmation</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              By making a deposit you confirm being aware that:

              <ul>
                <li>Deposits are held by the governable fund</li>
                <li>The Deposit Fee of {{getFundWithdrawalFee}}% is charged.</li>
                <li>Depositors receive Fund DAO tokens proportionally to the amount of funds deposited minus any deposit fee</li>
                <li>Upon depositor request, each depositor is able to redeem their share of the Fund DAO's base asset balance free of any charge.</li>
                <li> Withdrawal of funds is possible, and the Withdrawal Fee of {{getFundWithdrawalFee}}% is charged in that case.</li>
                <li>The Withdrawal Fee can be changed at any time by the Governable FUnd</li>
                <li>The Deposit Fee can be changed at any time by the Governable FUnd</li>
              </ul>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal">Cancel</button>
              <button @click="depositIntoFund" type="button" class="btn btn-success" data-bs-dismiss="modal">Deposit</button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <h3>Transfer Base Asset</h3>

    <div class="section-small">
      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="depositValue" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>
        <div>
          <input type="text" v-model="transferAddress" class="form-control deposit-input" placeholder="0x0000000000000000000000000000000000000000" aria-describedby="depositText">
        </div>


        <div class="token-dropdown form-button-mobile">
          <div class="btn-group" aria-describedby="button-text">
            <button type="button" class="btn btn-outline-success dropdown-toggle text-uppercase" data-bs-toggle="dropdown" aria-expanded="false">
              {{selectedToken}}
            </button>
            <ul class="dropdown-menu">
              <li>
                <span class="dropdown-item text-uppercase" @click="changeStablecoin('DAI')">DAI</span>
                <span class="dropdown-item text-uppercase" @click="changeStablecoin('USDC')">USDC</span>
              </li>
            </ul>
          </div>
        </div>


        <div class="deposit-button form-button-mobile">
          <button 
            class="btn btn-success btn-user btn-block text-uppercase form-control" 
            @click="transferStables">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Transfer
          </button>
          <div></div>
        </div>
        
      </div>

      <!-- Help text -->
      <div class="help-text" v-if="isDepositValueNotValid.status">
        {{ isDepositValueNotValid.message }} 
        <span v-if="(Math.floor(Number(this.getUserStablecoinBalance*1000))/1000) > 0">
          Try <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
            {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
          </a> {{selectedToken}}.
        </span>
      </div>

      <div class="help-text" v-if="!isDepositValueNotValid.status">
        Your {{selectedToken}} balance: 
        <a href="#" @click="depositValue = String(Math.floor(Number(getUserStablecoinBalance*1000))/1000)">
          {{ Math.floor(Number(this.getUserStablecoinBalance*1000))/1000 }}
        </a> {{selectedToken}}.
      </div>
    

    </div>

    <h3>Submit Raw Tx</h3>

    <div class="section-small">
      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="contractAddress" class="form-control deposit-input" placeholder="0x0000000000000000000000000000000000000000" aria-describedby="depositText">
        </div>
        <div>
          <input type="text" v-model="txData" class="form-control deposit-input" placeholder="0x0000000000000000000000000000000000000000" aria-describedby="depositText">
        </div>
        <div>
          <input type="text" v-model="value" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>

        <div class="deposit-button form-button-mobile">
          <button 
            class="btn btn-success btn-user btn-block text-uppercase form-control" 
            @click="postTx">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Submit
          </button>
          <div></div>
        </div>
        
      </div>
    
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: 'FundDeposit',

  props: ["fund"],
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("fund", ["getFundContract", "getFundAddress", 
                                    "getFundWithdrawalFee", "getFundDepositFee"]),
    ...mapGetters("dai", ["getUserDaiBalance", "getDaiContract", "getFundDaiAllowance"]),
    ...mapGetters("usdc", ["getUserUsdcBalance", "getUsdcContract", "getFundUsdcAllowance"]),
    ...mapGetters("btc", ["getUserBtcBalance", "getBtcContract", "getFundBtcAllowance"]),
    ...mapGetters("eth", ["getUserEthBalance", "getEthContract", "getFundEthAllowance"]),
    ...mapGetters("matic", ["getUserMaticBalance", "getMaticContract", "getFundMaticAllowance"]),
    ...mapGetters("avax", ["getUserAvaxBalance", "getAvaxContract", "getFundAvaxAllowance"]),
    
    isDepositValueNotValid() { // validation for deposit value
      // too many digits
      if (String(this.depositValue).length > 14) {
        return {status: true, message: "Please reduce the number of digits."};
      }

      // negative number
      if (Number(this.depositValue) < 0) {
        return {status: true, message: "Deposit value must not be negative!"};
      }

      // not a number
      if (isNaN(this.depositValue)) {
        return {status: true, message: "Please enter a number."};
      }

      // deposit value bigger than balance
      if (Number(this.depositValue) > Number(this.getUserStablecoinBalance)) {
        return {status: true, message: "Your " + this.selectedToken + " balance is too low."};
      }

      return {status: false, message: "Valid deposit value"};
    },
    isEnoughAllowance() {
      if (this.selectedToken === "DAI") {
        return Number(this.depositValue) <= Number(this.getFundDaiAllowance);
      } else if (this.selectedToken === "USDC") {
        return Number(this.depositValue) <= Number(this.getFundUsdcAllowance);
      }

      return false;
    },
    getStablecoinContract() {
      if (this.selectedToken === "DAI") {
        return this.getDaiContract;
      } else if (this.selectedToken === "USDC") {
        return this.getUsdcContract;
      }

      return null;
    },
    getUserStablecoinBalance() {
      if (this.selectedToken === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.selectedToken === "USDC") {
        return this.getUserUsdcBalance;
      }

      return null;
    },
  },
  created() {
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("dai/fetchFundAllowance");
    this.$store.dispatch("usdc/fetchUserBalance");
    this.$store.dispatch("usdc/fetchFundAllowance");
  },
  data() {
    return {
      depositValue: null,
      contractAddress: null,
      transferAddress: null,
      value: null,
      txData: null,
      loading: false,

      selectedToken: "DAI"
    }
  },
  methods: {
    async postTx() {
      let component = this;

      // call the transfer method
      await component.getWeb3.eth.sendTransaction({
        to: component.contractAddress,
        data: component.txData,
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        value: parseInt(component.value)
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The transfer was successfull.");          
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the Rethink Finance support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });
    },
    async transferStables() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // DAI - 18 decimals
      
      if (component.selectedToken === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
      }

      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
      }

      // convert deposit value to wei
      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);
      const allowanceValue = component.depositValue;

      // call the transfer method
      await component.getStablecoinContract.methods.transfer(component.transferAddress, tokensWei).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null,
        gas: 200000
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The transfer was successfull.");          
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the Rethink Finance support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });

    },
    async transferFromSafe() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // DAI - 18 decimals
      
      if (component.selectedToken === "USDT") {
        unit = "kwei"; // USDT (Tether) - 4 decimals
      }

      if (component.selectedToken === "USDC") {
        unit = "mwei"; // USDC - 6 decimals
      }

      // convert deposit value to wei
      let tokensWei = component.getWeb3.utils.toWei(component.depositValue, unit);
      const allowanceValue = tokensWei;//component.depositValue;

      // call the approve method
      await component.getStablecoinContract.methods.transfer(component.fund.fundAddress, allowanceValue).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null

      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("The approval was successfull. You can make the deposit now.");

          // refresh values
          if (component.selectedToken === "DAI") {
            // needs to be updated this way because Polygon RPC nodes are slow with updating state
            component.$store.state.dai.fundAllowance = allowanceValue;
          } else if (component.selectedToken === "USDC") {
            // needs to be updated this way because Polygon RPC nodes are slow with updating state
            component.$store.state.usdc.fundAllowance = allowanceValue;
          }
          
          
        } else {
          component.$toast.error("The transaction has failed. Please contact the Rethink Finance support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });

    },
    changeStablecoin(token) {
      this.selectedToken = token;
    },

  }
}
</script>

<style>
.deposit-button, .token-dropdown {
  margin-left: 10px;
}

.help-text {
  margin-top: .25rem;
  font-size: .775em;
  color: #ffffff;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .deposit-button, .token-dropdown {
    margin-left: 0px;
  }
}
</style>
