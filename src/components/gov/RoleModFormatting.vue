<template>
  <div>
    <div class="flex flex-col gap-2">
      <h3>Execute Governance Proposal</h3>
      <input v-model="govProposal.targets" class="form-control deposit-input" placeholder="(External Target Addrs), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52,0xd81F810fc394e96c5D67af8395607C71B0a42d52,0xd81F810fc394e96c5D67af8395607C71B0a42d52">
      <input v-model="govProposal.values" class="form-control deposit-input" placeholder="(gas to send with transaction), Ex: 0,0,0">
      <input v-model="govProposal.calldatas" class="form-control deposit-input" placeholder="(call data of tx's), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52,0xd81F810fc394e96c5D67af8395607C71B0a42d52,0xd81F810fc394e96c5D67af8395607C71B0a42d52">
      <input v-model="govProposal.description" class="form-control deposit-input" placeholder="(Desc of Gov Proposal), Ex: Blah Blah Blah">

    </div>

    <div class="pool-submit-buttons">
      <button @click="formatExecuteGovProposal" class="btn btn-success">
        Format Exec Gov Proposal
      </button>
      <button @click="executeGovProposal" class="btn btn-success">
        Exec Gov Proposal
      </button>
    </div>

    <pre>{{ formattedGovProposal }}</pre>

    <div v-for="tx in transactions" v-bind:key="tx.idx" class="flex flex-col gap-2">
      <h3>Add or Modify Existing Symbol </h3>
      <textarea v-model="tx.data" class="form-control deposit-input" placeholder="(Raw Tx Bytes), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52"></textarea>
      <input v-model="tx.role" class="form-control deposit-input" placeholder="(Rold Mod ID), Ex: 1">
      <input v-model="tx.gasValue" class="form-control deposit-input" placeholder="(gas to send with transaction), Ex: 0">
      <input v-model="tx.target" class="form-control deposit-input" placeholder="(address of contract interaction allowed by role mod), Ex: 0xd81F810fc394e96c5D67af8395607C71B0a42d52">
      <input v-model="tx.op" class="form-control deposit-input" placeholder="(operation), Ex: 1">

    </div>

    <div class="pool-submit-buttons">
      <button @click="submitSafeTransaction" class="btn btn-success">
        Submit Safe Transaction
      </button>
      <button @click="executeRoleMod" class="btn btn-success">
        Exec Role Mod
      </button>
    </div>

    <pre>{{ processedTxs }}</pre>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import SafeMultiSendCallOnlyJSON from "../../contracts/safe/SafeMultiSendCallOnly.json";
import GnosisSafeL2JSON from '../../contracts/safe/GnosisSafeL2_v1_3_0.json';
import ZodiacRoles from '../../contracts/zodiac/Roles.json';
import RethinkFundGovernorJSON from "../../contracts/RethinkFundGovernor.json";
import { ethers } from "ethers";

export default {
  name: "RoleModFormatting",
  props: ["transactions", "fund"],

  data() {
    return {
      processedTxs: [],
      formattedGovProposal: [],
      govProposal: {
        "targets": null,
        "values": null,
        "calldatas": null,
        "description": ""
      }
    }
  },

  components: { 
  },

  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }
  },

  computed: {
        ...mapGetters("accounts", ["getActiveAccount", "getChainName", "getWeb3", "isUserConnected", "getChainId"]),
        ...mapGetters("fund", ["getSelectedFundAddress", "getFundContract"]),

        getSelectedFundGovenerAddress(){
          console.log(this.fund);
          return this.fund.governor;
        }
  },

  methods: {
    formatExecuteGovProposal() {
        let sampleTx = [
          this.govProposal.targets.split(",").filter((val) => (val != "") ? true :  false),//targets
          this.govProposal.values.split(",").filter((val) => (val != "") ? true :  false).map(val => (parseInt(val))),//values
          this.govProposal.calldatas.split(",").filter((val) => (val != "") ? true :  false),//calldatas
          ethers.utils.keccak256(ethers.utils.toUtf8Bytes(this.govProposal.description))// data
        ];
        this.formattedGovProposal = sampleTx;
    },
    async executeGovProposal() {
      let component = this;
      component.loading = true;
     /*
        function execute(
          address[] memory targets,
          uint256[] memory values,
          bytes[] memory calldatas,
          bytes32 descriptionHash
      ) 
      */

      const rethinkFundGovernorContract = new component.getWeb3.eth.Contract(
        RethinkFundGovernorJSON.abi,
        component.fund.governor
      );

      //execute rolemods transaction
      await rethinkFundGovernorContract.methods.execute(
        component.formattedGovProposal[0],
        component.formattedGovProposal[1],
        component.formattedGovProposal[2],
        component.formattedGovProposal[3]
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
          component.$toast.success("Executing gov proposal tx was successfull.");
          
        } else {
          component.$toast.error("The Executing gov proposal tx has failed. Please contact the Rethink Finance support.");
        }
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });
    },
    async executeRoleMod() {
      let component = this;
      component.loading = true;
      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
      let addr1 = "0x0000000000000000000000000000000000000001";
      let safeModules = await safeContract.methods.getModulesPaginated(addr1, 10).call();


      console.log(safeModules[0][1]);

      const rolsModContract = new component.getWeb3.eth.Contract(
        ZodiacRoles.abi,
        safeModules[0][1]
      );

      //execute rolemods transaction
      /*await component.getFundContract.methods.execTransactionWithRole(
        safeModules[0][1], //rolesMod addr
        component.transactions[0].target,//to
        component.transactions[0].gasValue,//value
        component.transactions[0].data,//data
        component.transactions[0].op,//op
        component.transactions[0].role,//role
      )*/
      await rolsModContract.methods.execTransactionWithRole(
        component.transactions[0].target,//to
        parseInt(component.transactions[0].gasValue),//value
        component.transactions[0].data,//data
        parseInt(component.transactions[0].op),//op
        parseInt(component.transactions[0].role),//role
        true
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
          component.$toast.success("Register the proposal (role mod) tx was successfull. You can now vote on the proposal in the pool governance page.");
          
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

      const rethinkFundGovernorContract = new component.getWeb3.eth.Contract(
        RethinkFundGovernorJSON.abi,
        component.fund.governor
      );

      /*

        function propose(
          address[] memory targets,
          uint256[] memory values,
          bytes[] memory calldatas,
          string memory description
      ) 
        */

      //propose rolemods or generic tx's for safe (target: safe, payloadL bytes)
      await rethinkFundGovernorContract.methods.propose(
        targets,
        gasVals,
        component.processedTxs,
        "SUBMIT SAFE (ROLE MOD) TRANSACTIONS"
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
          component.$toast.success("Register the proposal (role mod) tx was successfull. You can now vote on the proposal in the pool governance page.");
          
        } else {
          component.$toast.error("The register proposal tx has failed. Please contact the Rethink Finance support.");
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

</style>