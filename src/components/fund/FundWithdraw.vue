<template>
  <div class="mt-3">
    <h3>
      Withdraw funds
      <i 
        class="fas fa-info-circle" 
        data-bs-toggle="tooltip" 
        data-bs-placement="bottom" 
        title="Withdrawing funds from the fund means burning your fund tokens for your share of the overall value of the fund in base token currency"
      ></i>
    </h3>

    <div class="section-small">

      <p class="text-white">
        Withdraw funds to your account balance:
      </p>

      <div class="d-flex flex-wrap">
        <div>
          <input type="text" v-model="withdrawAmount" class="form-control deposit-input" placeholder="0.0" aria-describedby="depositText">
        </div>

        <div class="withdraw-button form-button-mobile">
          <button 
            @click="requestWithdraw" 
            class="btn btn-success btn-user btn-block text-uppercase form-control"
            :disabled="isWithdrawAmountNotValid.status || Number(this.withdrawAmount) === 0">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Request Withdraw
          </button>
          <div></div>
        </div>

        <div class="withdraw-button form-button-mobile">
          <button 
            class="btn btn-success btn-user btn-block text-uppercase form-control" 
            @click="cancelWithdraw">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Cancel Withdraw
          </button>
          <div></div>
        </div>

        <div class="withdraw-button form-button-mobile">
          <button 
            @click="withdraw" 
            class="btn btn-success btn-user btn-block text-uppercase form-control"
            :disabled="isWithdrawAmountNotValid.status || Number(this.withdrawAmount) === 0"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Withdraw
          </button>
          <div></div>
        </div>
      </div>

      <!-- Help text -->
      <div class="help-text" v-if="isWithdrawAmountNotValid.status">
        {{ isWithdrawAmountNotValid.message }} 
        <span>
          Try <a href="#" @click="withdrawAmount = String(maxWithdrawalAmount)">
            {{Number(maxWithdrawalAmount).toFixed(6)}}.
          </a>
        </span>
        An early withdrawal fee of {{getFundWithdrawalFee}}% will be taken.
      </div>

      <div class="help-text" v-if="!isWithdrawAmountNotValid.status">
        Your Fund balance:
        <a href="#" @click="withdrawAmount = String(maxWithdrawalAmount)">
          {{Number(maxWithdrawalAmount).toFixed(6)}}
        </a> tokens 
        (worth ${{Number(userTokenAmountInBase).toFixed(6)}}). 
        An early withdrawal fee of {{getFundWithdrawalFee}}% will be taken.
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "FundWithdraw",

  props: ["fund"],


  data() {
    return {
      loading: false,
      withdrawAmount: null
    }
  },

  created() {
    this.$store.dispatch("fund/fetchFundNAV");
    this.$store.dispatch("fund/fetchUserBalance");
    this.$store.dispatch("dai/fetchUserBalance");
    this.$store.dispatch("usdc/fetchUserBalance");
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getWeb3"]),
    ...mapGetters("fund", ["getFundContract", "getFundUserBalance", 
                                    "getUserFundUsdValue",
                                    "getFundWithdrawalFee"]),

    userTokenAmountInBase(){
      return this.getUserFundUsdValue  / (10**18);
    },

    isWithdrawAmountNotValid() { // validation for withdrawal amount
      // negative number
      if (Number(this.withdrawAmount) < 0) {
        return {status: true, message: "Amount must not be negative!"};
      }

      // cannot be bigger than LP balance
      if (Number(this.withdrawAmount) > Number(this.getFundUserBalance)) {
        return {status: true, message: "Amount must not be bigger than balance!"};
      }

      // not a number
      if (isNaN(this.withdrawAmount)) {
        return {status: true, message: "Please enter a number."};
      }

      return {status: false, message: "Valid withdrawal amount"};
    },
    maxWithdrawalAmount() {
      return this.getFundUserBalance / (10**18);
    }
  },

  methods: {
    async withdraw(){
      let component = this;
      component.loading = true;

      let signature = component.getWeb3.eth.abi.encodeFunctionSignature('withdraw()');
      // make a withdrawal
      await component.getFundContract.methods.fundFlowsCall(signature).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your withdrawal was successfull. It may take 10 seconds or more for values to update.");

          // refresh values
          component.$store.dispatch("fund/fetchFundBalance");
          component.$store.dispatch("fund/fetchUserBalance");
          component.$store.dispatch("fund/fetchUserFundUsdValue");
          component.$store.dispatch("dai/fetchUserBalance");
          component.$store.dispatch("usdc/fetchUserBalance");
          component.$store.dispatch("fund/fetchFundBalance");

          component.withdrawAmount = null;
          
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
    async requestWithdraw() {
      let component = this;
      component.loading = true;

      const amountWei = component.getWeb3.utils.toWei(component.withdrawAmount, "ether");

      let signature = component.getWeb3.eth.abi.encodeFunctionSignature('requestWithdraw(uint256)');
      let encodedFunctionCall = signature + component.getWeb3.eth.abi.encodeParameter("uint256", amountWei).replace("0x", "");
      // make a withdrawal request
      await component.getFundContract.methods.fundFlowsCall(encodedFunctionCall).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your withdrawal request was successfull. It may take 10 seconds or more for values to update.");
          component.withdrawAmount = null;
          
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

    async cancelWithdraw() {
      let component = this;
      component.loading = true;
      // cancel a deposit request

      let signature = component.getWeb3.eth.abi.encodeFunctionSignature('revokeDepositWithrawal(bool)');
      let encodedFunctionCall = signature + component.getWeb3.eth.abi.encodeParameter("bool", false).replace("0x", "");
      // make a withdrawal
      await component.getFundContract.methods.fundFlowsCall(
        encodedFunctionCall
      ).send({
        from: component.getActiveAccount,
        maxPriorityFeePerGas: null,
        maxFeePerGas: null
      }).on('transactionHash', function(hash){
        console.log("tx hash: " + hash);
        component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");

      }).on('receipt', function(receipt){
        console.log(receipt);

        if (receipt.status) {
          component.$toast.success("Your deposit request was successfull.");
          component.depositValue = null;
        } else {
          component.$toast.error("Your deposit request has failed. Please contact the Rethink Finance support.");
        }
        
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });
    }
  }
}
</script>

<style>
.withdraw-button {
  margin-left: 10px;
}

.help-text {
  margin-top: .25rem;
  font-size: .775em;
  color: #ffffff;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .withdraw-button {
    margin-left: 0px;
  }
}
</style>