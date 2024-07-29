/* eslint-disable */
<template>
  <div>

    <div>
      <h1>FundDAO: {{formattedFundSymbol}}({{formattedFundAddress.substring(0, 6)}}...{{formattedFundAddress.substring(38, 42)}})</h1>
    </div>



    <div class="section-big row mt-4 mx-3">

      <div class="col-md-9">
        <!------ Delegate Gov Tokens ------>
        <div class="section-big row mt-4 mx-3">
          <div class="col-md-12">
            <SetAddress :data="DelegateTo" />
            <span></span>
            <button @click="delegate" class="btn btn-success">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Delegate {{formattedFundSymbol}}
            </button>
          </div>
        </div>

        <div class="section-big row mt-4 mx-3">
          <div class="col-md-12">
            <SetAddressWithUint :data="DepositFor" />
            <span></span>
            <button @click="approveWrappedAllowance" class="btn btn-success">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Max Approve Wrapping {{formattedFundSymbol}}
            </button>
            <button @click="wrap" class="btn btn-success">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Wrap {{formattedFundSymbol}}
            </button>
          </div>
        </div>

        <div class="section-big row mt-4 mx-3">
          <div class="col-md-12">
            <SetAddressWithUint :data="WithdrawTo" />
            <span></span>
            <button @click="unwrap" class="btn btn-success">
              <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Unrap {{formattedFundSymbol}}
            </button>
          </div>
        </div>
        <span></span>
        <span></span>

        <FundDeposit :fund="getFundData" />

        <FundWithdraw :fund="getFundData" />
        
        <FundTransfer :fund="getFundData" />
      </div>
    </div>

    <PrepRoleMod :fund="getFundData" />

    <div class="section-big row mt-4 mx-3">
      <h3> Fund Flows Info </h3>
      <div class="section-small">
        <h3>Enter Estimate Of Future Fund NAV</h3>
        <div class="d-flex flex-wrap">
          <div>
            <input type="text" v-model="estimatedFutureNAV" class="form-control deposit-input" placeholder="100.0" aria-describedby="depositText">
          </div>
        </div>    
      </div>
      <button @click="getFundFlowsData" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Update Flows Info
      </button>
      <div class="col-md-9">
        <div class="div-flex justify-content-center flex-wrap">
          <FundDataItem class="data-item" title="Total Base Asset Balance Avalible For Withdrawal" :data="formatTotalWithrawalBalance" :divider="true" :info="formatInfo" />
          <FundDataItem class="data-item" title="Pending Fund Tokens Withdrwals" :data="formatGetCurrentPendingWithdrawalBal" :divider="true" :info="formatInfo" />
          <FundDataItem class="data-item" title="Pending Fund Tokens Withdrwals Value In Base Asset" :data="getProspectiveRedemptionValueInBaseAsset" :divider="true" :info="formatInfo" />
          <FundDataItem class="data-item" title="Pending Base Asset Deposit Request Amount" :data="formatGetCurrentPendingDepositBal" :divider="true" :info="formatInfo"/>
        </div>
      </div>
    </div>

    <div class="section-big row mt-4 mx-3">
      <h3> Execute Latest Permissioned NAV update </h3>
      <button @click="recalcNAV" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Recalculate OIV NAV
      </button>
    </div>

    <div class="section-big row mt-4 mx-3">
      <h3> Sweep Tokens from OIV -> Custody Address </h3>
      <button @click="sweepTokens" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Sweep Tokens
      </button>
    </div>



    <div class="section-big row mt-4 mx-3">
      <h3> Assign Role Mod Events </h3>
      <button @click="getRoleModEvents" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Get Assign Role Mod Events
      </button>
      <div class="col-md-9">
        <div v-for="event in assignRoleEvents" v-bind:key="event.blockNumber">
          <FundDataItem class="data-item" title="Authorized Address" :data="event.args.module" :divider="true" :info="module" />
          <FundDataItem class="data-item" title="Role Mod Id" :data="event.args.roles" :divider="true" :info="roles" />
          <FundDataItem class="data-item" title="Is Member" :data="event.args.memberOf" :divider="true" :info="memberOf" />
        </div>
      </div>
    </div>

    <MintFakeTokens v-if="getChainName === 'Kovan'" class="mb-5" />
    <MintFakeTokens v-if="getChainName === 'Mumbai'" class="mb-5" />
    <MintFakeTokens v-if="getChainName === 'Localhost'" class="mb-5" />
    <MintFakeTokens v-if="getChainName === 'Fuji'" class="mb-5" />
    <MintFakeTokens v-if="getChainName === 'Canto Testnet'" class="mb-5" />
    <MintFakeTokens v-if="getChainName === 'Goerli'" class="mb-5" />
  </div>
</template>

<script>

import { mapGetters, mapActions } from "vuex";
import SetAddress from '../components/gov/SetAddress.vue';
import SetAddressWithUint from '../components/gov/SetAddressWithUint.vue';
import MintFakeTokens from '../components/tokens/MintFakeTokens.vue';
import PrepRoleMod from '../components/gov/PrepRoleMod.vue';
import FundDeposit from '../components/fund/FundDeposit.vue';
import FundWithdraw from '../components/fund/FundWithdraw.vue';
import FundTransfer from '../components/fund/FundTransfer.vue';
import FundDataItem from '../components/fund/FundDataItem.vue';
import GnosisSafeL2JSON from '../contracts/safe/GnosisSafeL2_v1_3_0.json';
import ZodiacRoles from '../contracts/zodiac/RolesFull.json';
import ERC20Votes from '../contracts/ERC20Votes.json';
import ERC20WrappedToken from '../contracts/ERC20WrappedToken.json';
import addresses from "../contracts/addresses.json";

export default {
  name: "ViewFund",

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fundFactory", ["getFundFactoryContract", "getFunds"]),
    ...mapGetters("fund", ["getSelectedFundAddress", "getFundContract"]),

    getProspectiveRedemptionValueInBaseAsset() {
      /*
      function valueOf(address ownr) public view returns (uint256) {
          return (totalNAV() * balanceOf(ownr)) / totalSupply();
      }
      */

      return (this.estimatedFutureNAV * this.getCurrentPendingWithdrawalBal) / this.totalSupply;
    },

    formatTotalWithrawalBalance(){
	   return this.totalWithrawalBalance / (10**this.baseTokenDecimals);
    },

    formatGetCurrentPendingWithdrawalBal(){
    	return this.getCurrentPendingWithdrawalBal / (10**18); 
    },

    formatGetCurrentPendingDepositBal() {
    	return this.getCurrentPendingDepositBal / (10**this.baseTokenDecimals);
    },

    formatInfo () {
      return ""
    },

    getFundData(){
      console.log(this.getSelectedFundAddress);
      console.log(this.getFunds[fidx]);
      for (var fidx in this.getFunds){
        if (this.getFunds[fidx].fundAddress == this.getSelectedFundAddress) {
          this.fund = this.getFunds[fidx];
          return this.getFunds[fidx];
        }
      }
    },

    formattedFundSymbol() {
      if (this.fund.fundSymbol) {
        return this.fund.fundSymbol
      } else {
        return "N/A"
      }
    },

    formattedFundAddress() {
      if (this.fund.fundAddress) {
        return this.fund.fundAddress
      } else {
        return ""
      }
    },

    allowanceNeeded() {
      if (this.buyWith === "DAI") {
        return this.getFundDaiAllowance < this.getTotal;
      } else if (this.buyWith === "USDC") {
        return this.getFundUsdcAllowance < this.getTotal;
      } else if (this.buyWith === "BTC") {
        return this.getFundBtcAllowance < this.getTotal;
      } else if (this.buyWith === "ETH") {
        return this.getFundEthAllowance < this.getTotal;
      } else if (this.buyWith === "MATIC") {
        return this.getFundMaticAllowance < this.getTotal;
      } else if (this.buyWith === "AVAX") {
        return this.getFundAvaxAllowance < this.getTotal;
      }
      
      return false;
    },

    getTokenAddress() {
      if (this.buyWith === "DAI") {
        return this.getDaiAddress;
      } else if (this.buyWith === "USDC") {
        return this.getUsdcAddress;
      }
      return null;
    },

    getTotal() {
      return Number(this.selectedDepositAmount);
    },

    getUserTokenBalance() {
      if (this.buyWith === "DAI") {
        return this.getUserDaiBalance;
      } else if (this.buyWith === "USDC") {
        return this.getUserUsdcBalance;
      }
      return null;
    },

  },

  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.$store.dispatch("fund/fetchContract");
    this.getDecimalsForBaseAssetToken();
    this.getFundFlowsData();
  },

  components: {
    MintFakeTokens,
    PrepRoleMod,
    FundWithdraw,
    FundDeposit,
    FundDataItem,
    SetAddress,
    SetAddressWithUint,
    FundTransfer
  },

  data() {
    return {
      loading: false,
      fund: {},
      baseTokenDecimals: null,
      totalSupply: null,
      estimatedFutureNAV: 0,
      totalWithrawalBalance: null,
      getCurrentPendingWithdrawalBal: null,
      getCurrentPendingDepositBal: null,
      assignRoleEvents: [],
      DelegateTo: {
        addr: null,
        desc: "Delegate Governance Token To Address"
      },
      DepositFor: {
        to: null,
        amount: null,
        desc1: "Reciving Address",
        desc2: "Amount (ex: 50000000000000000000000, for 50000 if token has 18 decimals)"
      },
      WithdrawTo: {
        to: null,
        amount: null,
        desc1: "Reciving Address",
        desc2: "Amount (ex: 50000000000000000000000, for 50000 if token has 18 decimals)"
      },
    }
  },

  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),

    async sweepTokens() {
      let component = this;
      component.loading = true;
      
      let signature = component.getWeb3.eth.abi.encodeFunctionSignature('sweepTokens()');
     
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
          component.$toast.success("Sweeping tokens back into custody address was successfull.");          
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

    async recalcNAV(){
      let component = this;
      component.loading = true;
      
      let navExecutorAddr = addresses["NAVExecutorBeaconProxy"][parseInt(component.getChainId)];

      await component.getFundContract.methods.executeNAVUpdate(
        navExecutorAddr
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
          component.$toast.success("The recalculation of OIV NAV has Succeeded");
        } else {
          component.$toast.error("The recalculation of OIV NAV has failed. Please contact the Rethink Finance support.");
        }
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });

    },

    async getDecimalsForBaseAssetToken(){
      let component = this;

      const baseTokenContract = new component.getWeb3.eth.Contract(
        ERC20WrappedToken.abi,
        component.fund.baseToken
      );

      let decimals = await baseTokenContract.methods.decimals().call();
      component.baseTokenDecimals = decimals;
      console.log(decimals);
    },

    async getFundFlowsData(){
    	let component = this;
    	component.loading = true;
      if (component.baseTokenDecimals === null) {
        component.getDecimalsForBaseAssetToken();
      }
    	//totalWithrawalBalance, getCurrentPendingWithdrawalBal and getCurrentPendingDepositBal visible from ui
      component.totalWithrawalBalance = await component.getFundContract.methods.totalWithrawalBalance().call();
      try {
    		component.getCurrentPendingWithdrawalBal = await component.getFundContract.methods.getCurrentPendingWithdrawalBal().call();
    	} catch (e) {}
      try {
        component.getCurrentPendingDepositBal = await component.getFundContract.methods.getCurrentPendingDepositBal().call();
      } catch (e) {}
      try {
        component.totalSupply = await component.getFundContract.methods.totalSupply().call();
      } catch (e) {}
    	console.log(component.totalWithrawalBalance);
    	console.log(component.getCurrentPendingWithdrawalBal);
      console.log(component.getCurrentPendingDepositBal);
      console.log(component.totalSupply);
    	component.loading = false;

    },

    async getRoleModEvents() {
      let component = this;
      component.loading = true;

      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
      let addr1 = "0x0000000000000000000000000000000000000001";
      let safeModules = await safeContract.methods.getModulesPaginated(addr1, 10).call();

      const rolsModContract = new component.getWeb3.eth.Contract(
        ZodiacRoles.abi,
        safeModules[0][1]
      );

      let networkIdBlockOffsetMap = {
        "0x5": 9807545
      };
      const latestBlockNum = await component.getWeb3.eth.getBlockNumber();

      console.log("block event range: " + (latestBlockNum-networkIdBlockOffsetMap[component.getChainId]));

      for(var i=latestBlockNum; i>networkIdBlockOffsetMap[component.getChainId]; i-=1000) {
        await rolsModContract.getPastEvents('AssignRoles', {
            //filter: {myIndexedParam: [20,23], myOtherIndexedParam: '0x123456789...'}, // Using an array means OR: e.g. 20 or 23
            fromBlock: i-1000,
            toBlock: latestBlockNum
        }, function(error, events){
          component.loading = false;
          console.log(events); 
        })
        .then(function(events){
            component.assignRoleEvents = component.assignRoleEvents.concat(events);
            console.log(events) // same results as the optional callback above
        });
      }
      component.loading = false;
    },

    async approveWrappedAllowance() {
      let component = this;
      component.loading = true;

      // define unit and token contract
      let unit = "ether"; // DAI - 18 decimals

      const externalWrappedGovToken = new component.getWeb3.eth.Contract(
        ERC20WrappedToken.abi,
        component.getFundData.governanceToken
      );

      let udlAddr = await externalWrappedGovToken.methods.underlying().call();

      const externalGovToken = new component.getWeb3.eth.Contract(
        ERC20WrappedToken.abi,
        udlAddr
      );

      // call the approve method
      await externalGovToken.methods.approve(component.getFundData.governanceToken, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({
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

    async wrap() {
      let component = this;
      let nullAddr = "0x0000000000000000000000000000000000000000";

      component.getFundData.governanceToken
      if (component.fund.fundAddress != null) {
        component.loading = true;

        //external gov token
        if ((component.getFundData.governanceToken != component.fund.fundAddress) && (component.getFundData.governanceToken != nullAddr)) {
          const externalGovToken = new component.getWeb3.eth.Contract(
            ERC20WrappedToken.abi,
            component.getFundData.governanceToken
          );

          await externalGovToken.methods.depositFor(
            component.DepositFor.to,
            component.DepositFor.amount
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
              component.$toast.success("Wrapping of Governance Tokens Succeeded");
            } else {
              component.$toast.error("The depositFor tx has failed. Please contact the Rethink Finance support.");
            }
            component.loading = false;

          }).on('error', function(error){
            console.log(error);
            component.loading = false;
            component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
          });

        }
      }
    },

    async unwrap() {
      let component = this;
      let nullAddr = "0x0000000000000000000000000000000000000000";

      component.getFundData.governanceToken
      if (component.fund.fundAddress != null) {
        component.loading = true;

        //external gov token
        if ((component.getFundData.governanceToken != component.fund.fundAddress) && (component.getFundData.governanceToken != nullAddr)) {
          const externalGovToken = new component.getWeb3.eth.Contract(
            ERC20WrappedToken.abi,
            component.getFundData.governanceToken
          );

          await externalGovToken.methods.withdrawTo(
            component.WithdrawTo.to,
            component.WithdrawTo.amount
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
              component.$toast.success("Unwrapping of Governance Tokens Succeeded");
            } else {
              component.$toast.error("The withdrawTo tx has failed. Please contact the Rethink Finance support.");
            }
            component.loading = false;

          }).on('error', function(error){
            console.log(error);
            component.loading = false;
            component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
          });

        }
      }
    },

    async delegate() {
      let component = this;
      let nullAddr = "0x0000000000000000000000000000000000000000";

      component.getFundData.governanceToken
      if (component.fund.fundAddress != null) {
        component.loading = true;

        //external gov token
        if ((component.getFundData.governanceToken != component.fund.fundAddress) && (component.getFundData.governanceToken != nullAddr)) {
          const externalGovToken = new component.getWeb3.eth.Contract(
            ERC20Votes.abi,
            component.getFundData.governanceToken
          );

          await externalGovToken.methods.delegate(
            component.DelegateTo.addr
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
              component.$toast.success("Delegation of Governance Tokens Succeeded");
            } else {
              component.$toast.error("The delegateTo tx has failed. Please contact the Rethink Finance support.");
            }
            component.loading = false;

          }).on('error', function(error){
            console.log(error);
            component.loading = false;
            component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
          });

        } else {

          //  gov contract

          await component.getFundContract.methods.delegate(
            component.DelegateTo.addr
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
              component.$toast.success("Delegation of Governance Tokens Succeeded");
            } else {
              component.$toast.error("The delegateTo tx has failed. Please contact the Rethink Finance support.");
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

  }
}
</script>
