<template>
  <div class="pool-management-body-text-color">

    <h1> Current Fund: ({{getSelectedFundAddress.substring(0, 6)}}...{{getSelectedFundAddress.substring(38, 42)}})</h1>

    <h2>
      Remember To Set Default Permissions Before Accepting Deposits:
    </h2>

    <h3>
        - Emergency Permissions for OIV assets
    </h3>
    <h3>
        - Sending Base Assets Back To OIV contract
    </h3>

    <div class="pool-submit-buttons">

      <button @click="createDelegatedPermissionsProposal" class="btn btn-success">
        Delegated Permissions Proposal
      </button>

      <button @click="createDirectExecutionProposal" class="btn btn-success">
        Direct Execution Proposal
      </button>
    </div>


    <div v-if="isDelgatedPermsProposal">
      <button @click="addProposalEntry" class="btn btn-success">
        Add Proposal Entry
      </button>
      <div v-for="tx in proposalEntries" v-bind:key="tx.idx" class="flex flex-col gap-2">
        <h3>Add Delegated Permission</h3>

        <ProposalEntry :methods="proposalRoleModMethods"/>

      </div>
    </div>

    <div v-if="!isDelgatedPermsProposal">
      <button @click="addSafeDirectTransaction" class="btn btn-success">
        Add Direct Execution Transaction
      </button>
      <div v-for="tx in safeDirectTransactions" v-bind:key="tx.idx" class="flex flex-col gap-2">
        <h3>Add Transaction </h3>
        <textarea v-model="tx.data" class="form-control deposit-input" placeholder="(Raw Tx Bytes), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52"></textarea>
        <input v-model="tx.gasValue" class="form-control deposit-input" placeholder="(gas to send with transaction), Ex: 0">
        <input v-model="tx.target" class="form-control deposit-input" placeholder="(address of contract interaction allowed by governance), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52">
        <input v-model="tx.op" class="form-control deposit-input" placeholder="(operation), Ex: 1">
      </div>
    </div>

    <div class="pool-submit-buttons">
      <button @click="createProposal" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Submit Proposal
      </button>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";

import addresses from "../contracts/addresses.json";
import RethinkFundGovernorJSON from "../contracts/RethinkFundGovernor.json";
import GnosisSafeL2JSON from '../contracts/safe/GnosisSafeL2_v1_3_0.json';
import ZodiacRoles from '../contracts/zodiac/RolesFull.json';
import ProposalEntry from '../components/gov/ProposalEntry.vue';

export default {
  name: 'OIVProposal',
  data() {
    return {
      loading: false,
      fund: {},
      description: null,
      proposalEntries: [],
      proposalRoleModMethods: [],
      safeDirectTransactions: [],
      txIdx: 0,
      isDelgatedPermsProposal: true,
    }
  },
  components: {
    ProposalEntry,
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fundFactory", ["getFundFactoryContract", "getFunds"]),
    ...mapGetters("fund", ["getSelectedFundAddress", "getFundAbi", "getFundContract"]),

    

  },
  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }
    this.$store.dispatch("fund/fetchContract");
    this.getFundData()
    

    this.proposalRoleModMethods = ZodiacRoles.abi.filter((val) => (val["type"] == "function") ? true :  false);

  },

  methods: {
    selectProposalMethod: function () {

    },

    addProposalEntry: function() {
      this.proposalEntries.push({
        idx: this.txIdx++,
      });
    },

    addSafeDirectTransaction: function () {
      this.safeDirectTransactions.push({
        idx: this.txIdx++,
        data: null,
        to: null,
        op: null,
      });
    },

    getFundData(){
      console.log(this.getSelectedFundAddress);
      for (var fidx in this.getFunds){
        if (this.getFunds[fidx].fundAddress == this.getSelectedFundAddress) {
          this.fund = this.getFunds[fidx];
          console.log(this.getFunds[fidx]);
          return this.getFunds[fidx];
        }
      }
    },

    async createDelegatedPermissionsProposal() {
      let component = this;
      component.isDelgatedPermsProposal = true;

      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
      let addr1 = "0x0000000000000000000000000000000000000001";
      let safeModules = await safeContract.methods.getModulesPaginated(addr1, 10).call();
      let roleModAddr = safeModules[0][1];


      console.log(roleModAddr);

      const rolesModContract = new component.getWeb3.eth.Contract(
        ZodiacRoles.abi,
        roleModAddr
      );

      //console.log(rolesModContract.methods);
      //59 {"type":"function","name":"getCurrentPendingWithdrawalBal","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view","constant":true,"signature":"0x91d3756a"}
    },

    async createDirectExecutionProposal() {
      let component = this;

      component.isDelgatedPermsProposal = false;
      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
    },

    async createProposal () {
      let component = this;
      component.loading = true;

      let dataNavUpdateEntries = [];


      console.log(JSON.stringify(dataNavUpdateEntries));
      console.log(addNavUpdateEntryAbiJSON);
      let encodedDataNavUpdateEntries = component.getWeb3.eth.abi.encodeFunctionCall(addNavUpdateEntryAbiJSON, [dataNavUpdateEntries]);

      console.log(component.fund.governor);
      console.log(component.getSelectedFundAddress);
      console.log(component.getActiveAccount);

      const rethinkFundGovernorContract = new component.getWeb3.eth.Contract(
        RethinkFundGovernorJSON.abi,
        component.fund.governor
      );

      let navUpdateIndex = await component.getFundContract.methods._navUpdateLatestIndex().call();

      /*

        function propose(
          address[] memory targets,
          uint256[] memory values,
          bytes[] memory calldatas,
          string memory description
      ) 
        */

      //proposae nav update for fund (target: fund addr, payloadL bytes)
      await rethinkFundGovernorContract.methods.propose(
        [component.getSelectedFundAddress, component.getSelectedFundAddress, component.getSelectedFundAddress, component.getSelectedFundAddress],
        [0,0,0,0],
        [encodedDataNavUpdateEntries, encodedCollectFlowFeesAbiJSON, encodedCollectManagerFeesAbiJSON, encodedCollectPerformanceFeesAbiJSON],
        "NAV UPDATE: #" + String(navUpdateIndex)
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
          component.$toast.success("Register the proposal transactions was successfull. You can now vote on the proposal in the pool governance page.");
          
        } else {
          component.$toast.error("The register proposal tx has failed. Please contact the Rethink Finance support.");
        }
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });

    },

    //TODO: only use this to help prep direct exec  for direct exec
    async submitSafeTransaction() {
      let component = this;
      let to = SafeMultiSendCallOnlyJSON.networkAddresses[parseInt(component.getChainId).toString()];
      console.log(to);
      let multisendAbiJSON = SafeMultiSendCallOnlyJSON.abi[0];
      component.processedTxs = [];
      let targets = [];
      let gasVals = [];
      
      //execTransaction function
      let execTransactionAbiJSON = GnosisSafeL2JSON.abi[29];

      const signature = '0x000000000000000000000000' + component.getSelectedFundGovenerAddress.slice(2) + '0000000000000000000000000000000000000000000000000000000000000000' + '01';
      for (var tx in component.transactions){
        let filteredTxData = component.getWeb3.eth.abi.encodeFunctionCall(multisendAbiJSON, [component.transactions[tx].data]);

        let formatSafeTxInput = [
          component.transactions[tx].target,//MultiSendCallOnly
          0,//value
          filteredTxData,//data
          1,//operation
          0,//safeTxGas
          0,//baseGas
          0,//gasPrice
          "0x0000000000000000000000000000000000000000",//gasToken
          "0x0000000000000000000000000000000000000000",//refundReceiver
          signature
        ];

        let filteredFinalTxData = component.getWeb3.eth.abi.encodeFunctionCall(execTransactionAbiJSON, formatSafeTxInput);

        component.processedTxs.push(filteredFinalTxData);
        targets.push(component.fund.safe);
        gasVals.push(0);
      }
    },
  }
}
</script>

<style scoped>
.pool-submit-buttons {
  padding: 20px 20px !important;
}
.pool-management-body-text-color {
  color: #48cc8c;
}
</style>
