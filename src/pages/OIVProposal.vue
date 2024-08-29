<template>
  <div class="pool-management-body-text-color">

    <h1> Current Fund: ({{getSelectedFundAddress.substring(0, 6)}}...{{getSelectedFundAddress.substring(38, 42)}})</h1>


    <h2>
      Make Sure Before Submitting Proposal:
    </h2>
    <h3>
        - Wrap governance token (if needed)
    </h3>

    <h3>
        - Delegate to yourself first (even if you want to delegate to another) if using external governance token
    </h3>

    <h2>
      Remember To Set Default Permissions Before Accepting Deposits:
    </h2>

    <h3>
        - Emergency Permissions for OIV assets
    </h3>
    <h3>
        - Sending Base Assets Back To OIV contract
    </h3>
    <h3>
        - Byte Encoded OIV Address: {{ byteEncodedFundAddr }}
    </h3>
    <h3>
        - Byte Encoded OIV's Safe Address: {{ byteEncodedSafeAddr }}
    </h3>


    <div class="pool-submit-buttons">

      <button @click="createDelegatedPermissionsProposal" class="btn btn-success">
        Delegated Permissions Proposal
      </button>

      <button @click="createDirectExecutionProposal" class="btn btn-success">
        Direct Execution Proposal
      </button>

      <button v-if="detectedProposalEntries" @click="loadProposalEntries" class="btn btn-success">
        Load Saved Proposal Draft
      </button>
    </div>

    <h2>Proposal Title & Desc</h2>

    <div v-for="(value, key1, keyIdx) in descriptionMetadata" class="flex flex-col gap-2">
      <textarea v-model="descriptionMetadata[key1]" class="form-control deposit-input" :placeholder="key1"></textarea>
    </div>


    <div v-if="isDelgatedPermsProposal">
      <button @click="addProposalEntry" class="btn btn-success">
        Add Proposal Entry
      </button>
      <div v-for="tx in proposalEntries" v-bind:key="tx.idx" class="flex flex-col gap-2">
        <h3>Add Delegated Permission</h3>

        <ProposalEntry :methods="proposalRoleModMethods" :entry="tx"/>

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

    <pre style="color:#fff">
      description: {{ descriptionMetadata }} 
      proposalEntries: {{ proposalEntries  }}
    </pre style="color:#fff">


    <div class="mt-3">
      <h2>Load External Proposal Below </h2>

      <textarea v-model="descriptionMetadataRaw" class="form-control deposit-input" placeholder="descriptionMetadata"></textarea>
      <textarea v-model="proposalEntriesRaw" class="form-control deposit-input" placeholder="proposalEntries"></textarea>
    </div>


    <div class="pool-submit-buttons">
      <button @click="cacheProposalEntries" class="btn btn-success">
        Save Draft (To Browser Storage)
      </button>
      <button @click="forceLoadProposalEntries" class="btn btn-success">
        Force Load Draft
      </button>  
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
      BOOL_TYPE: {
        "true": true,
        "false": false
      },
      loading: false,
      fund: {},
      descriptionMetadataRaw: null,
      proposalEntriesRaw: null,
      descriptionMetadata : {
        description: null,
        title: null
      },
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

    byteEncodedSafeAddr() {
      return '0x000000000000000000000000' + this.fund.safe.slice(2) 
    },

    byteEncodedFundAddr() {
      return '0x000000000000000000000000' + this.getSelectedFundAddress.slice(2) 
    },

    detectedProposalEntries() {
      let p = localStorage.getItem("proposalEntries");
      let d = localStorage.getItem("descriptionMetadata");

      if ((d === null) && (p === null)) {
        return false;
      }

      if (d !== null) {
        if (d.description !== null && d.title !== null) {
          return true;
        }
      }

      if (p !== null) {
        if (p.length > 0) {
          return true;
        } 
      }

      return false;
    },

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
    cacheProposalEntries: function() {
      localStorage.setItem("proposalEntries", JSON.stringify(this.proposalEntries));
      localStorage.setItem("descriptionMetadata", JSON.stringify(this.descriptionMetadata));

    },

    loadProposalEntries: function() {
      this.proposalEntries = JSON.parse(localStorage.getItem("proposalEntries"));
      this.descriptionMetadata = JSON.parse(localStorage.getItem("descriptionMetadata"));
    },

    forceLoadProposalEntries: function() {
      if (this.proposalEntriesRaw !== null) {
        this.proposalEntries = JSON.parse(this.proposalEntriesRaw);

      }

      if (this.descriptionMetadataRaw !== null) {
        this.descriptionMetadata = JSON.parse(this.descriptionMetadataRaw);

      }      
    },

    selectProposalMethod: function () {

    },

    addProposalEntry: function() {
      this.proposalEntries.push({
        idx: this.txIdx++,
        value:  [],
        valueMethodIdx: null,
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

    prepRoleModEntryInput(value) {
      /*
        - address validation
        - bytes validation
        - int validation
        - enum valudation (int)
      */
      
      let dtype = value.internalType;

      if (value.isArray) {
        let retDat = []
        for (let i=0; i<value.data.length;i++) {
          if (dtype.startsWith("address")) {
            retDat.push(value.data[i]);
          } else if (dtype.startsWith("bytes")) {
            retDat.push(value.data[i]);
          } else if (dtype.startsWith("int")) {
            retDat.push(value.data[i]);
          } else if (dtype.startsWith("uint")) {
            retDat.push(value.data[i]);
          } else if (dtype.startsWith("enum")) {
            retDat.push(value.data[i]);
          } else if (dtype.startsWith("bool")) {
            retDat.push(this.BOOL_TYPE[value.data[i]]);
          }
        }

        return retDat;
        
      } else {
        if (dtype.startsWith("address")) {
          return value.data;
        } else if (dtype.startsWith("bytes")) {
          return value.data;
        } else if (dtype.startsWith("int")) {
          return value.data;
        } else if (dtype.startsWith("uint")) {
          return value.data;
        } else if (dtype.startsWith("enum")) {
          return value.data;
        } else if (dtype.startsWith("bool")) {
          return this.BOOL_TYPE[value.data];
        }
      }
    },

    async createProposal () {
      let component = this;
      component.loading = true;

      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
      let addr1 = "0x0000000000000000000000000000000000000001";
      let safeModules = await safeContract.methods.getModulesPaginated(addr1, 10).call();
      let roleModAddr = safeModules[0][1];


      console.log(roleModAddr);

      let encodedRoleModEntries = [];

      let targets = [];
      let gasValues = [];

      //TODO: assumes validation already happens when inputing data
      for(let i=0; i<component.proposalEntries.length; i++) {
        let roleModFunctionABI = component.proposalRoleModMethods[component.proposalEntries[i].valueMethodIdx];
        let roleModFunctionData = [];
        for (let j=0; j<component.proposalEntries[i].value.length; j++) {
          /*
            {
              "idx": 0,
              "isArray": false,
              "data": "0xe977757dA5fd73Ca3D2bA6b7B544bdF42bb2CBf6",
              "internalType": "address",
              "name": "module"
            },

          */
          roleModFunctionData.push(component.prepRoleModEntryInput(component.proposalEntries[i].value[j]));
        }
        let encodedRoleModFunction = component.getWeb3.eth.abi.encodeFunctionCall(
          roleModFunctionABI, roleModFunctionData
        );
        encodedRoleModEntries.push(encodedRoleModFunction);
        targets.push(roleModAddr);
        gasValues.push(0)
      }


      console.log(component.fund.governor);
      console.log(component.getSelectedFundAddress);
      console.log(component.getActiveAccount);

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

      console.log("targets");
      console.log(targets);
      console.log("encodedRoleModEntries");
      console.log(encodedRoleModEntries);

      //proposae nav update for fund (target: fund addr, payloadL bytes)
      await rethinkFundGovernorContract.methods.propose(
        targets,
        gasValues,
        encodedRoleModEntries,
        JSON.stringify(component.descriptionMetadata)
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
          component.$toast.success("Delegated permissions proposal transactions was successfull. You can now vote on the proposal in the pool governance page.");
          
        } else {
          component.$toast.error("Delegated permissions proposal tx has failed. Please contact the Rethink Finance support.");
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
          0,//operation (0 for call, 1 for delegatecall)
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
