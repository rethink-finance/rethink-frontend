/* eslint-disable */
<template>

  <div class="section-big row mt-4 mx-3">
    <!------ Create Fund ------>

    <div class="col-md-12">
      <FundInput :fund="fund" :governor="governor" :fundMetadata="fundMetadata" :fee="fee"/>
      <span></span>
    </div>
    <div class="fund-submit-buttons">
      <button @click="createFund" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Create Fund
      </button>
      <button @click="initCreateFund" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Initalize Create Fund
      </button>
    </div>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>

    <!----- Submmit Permissions ------>

    <div class="pool-management-body-text-color" style="border: 2em;">

      <h2>
        Remember To Also Set Default Permissions Before Finanlizing Create Fund (if you do not, you will have to go thru the governance cycle in order to update the permissions):
      </h2>

      <h3>
          - Emergency Permissions for OIV assets
      </h3>
      <h3>
          - Sending Base Assets Back To OIV contract
      </h3>

      <div class="pool-submit-buttons">
        <button v-if="detectedProposalEntries" @click="loadProposalEntries" class="btn btn-success">
          Load Saved Permissions Draft
        </button>
      </div>

      <div>
        <button @click="addProposalEntry" class="btn btn-success">
          Add Proposal Entry
        </button>
        <div v-for="tx in proposalEntries" v-bind:key="tx.idx" class="flex flex-col gap-2">
          <h3>Add Delegated Permission</h3>

          <ProposalEntry :methods="proposalRoleModMethods" :entry="tx"/>

        </div>
      </div>

      <pre style="color:#fff">
        permissions: {{ proposalEntries  }}
      </pre style="color:#fff">


      <div class="mt-3">
        <h2>Load External Permissions Below </h2>
        <textarea v-model="proposalEntriesRaw" class="form-control deposit-input" placeholder="proposalEntries"></textarea>
      </div>


      <div class="pool-submit-buttons">
        <button @click="cacheProposalEntries" class="btn btn-success">
          Save Draft (To Browser Storage)
        </button>
        <button @click="forceLoadProposalEntries" class="btn btn-success">
          Force Load Draft
        </button>  
        <button @click="submitPermissions" class="btn btn-success">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Submit Permissions
        </button>
      </div>

      <div>
        <button @click="finalizeCreateFund" class="btn btn-success">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Finalize Fund Creation
        </button>
      </div>

    </div>
  </div>

  
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import FundInput from '../components/fund/FundInput.vue';
import ZodiacRoles from '../contracts/zodiac/RolesFull.json';
import ProposalEntry from '../components/gov/ProposalEntry.vue';

export default {
  name: "CreateFund",

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fundFactory", ["getFundFactoryContract"]),
  },

  created() {
    if (!this.getWeb3 || !this.isUserConnected) {
      this.$router.push({ name: 'home'});
    }

    this.proposalRoleModMethods = ZodiacRoles.abi.filter((val) => (val["type"] == "function") ? true :  false);
  },

  data() {
    return {
      loading: false,
      fund: {
        depositFee: null,
        withdrawFee: null,
        //performanceFee: null,//TODO: not imp 
        managementFee: null,
        //performaceHurdleRateBps: null,//TODO: not imp 
        baseToken: "",
        allowedDepositAddrs: "",
        allowedManagers: "",
        feeCollectors: "",
        governanceToken: "0x0000000000000000000000000000000000000000",
        fundName: "",
        fundSymbol: ""
      },
      fundMetadata : {
        description: null,
        photoUrl: null,
        plannedSettlementPeriod: null,
        minLiquidAssetShare: null
      },
      governor: {
        quorumFraction: null,
        lateQuorum: null,
        votingDelay: null,
        votingPeriod: null,
        proposalThreshold: null
      },
      fee: {
        _feePerformancePeriod: null,
        _feeManagePeriod: null
      },
      BOOL_TYPE: {
        "true": true,
        "false": false
      },
      proposalEntriesRaw: null,
      proposalEntries: [],
      proposalRoleModMethods: [],
      txIdx: 0
    }
  },

  components: {
    FundInput,
    ProposalEntry
  },

  methods: {
    ...mapActions("accounts", ["connectWeb3Modal"]),
    validateFund(obj) {
      if(obj.depositFee == null) return false;
      if(obj.withdrawFee == null) return false;
      if(obj.performanceFee == null) return false;
      if(obj.managementFee == null) return false;
      if(obj.performaceHurdleRateBps == null) return false;
      if(obj.baseToken.length == 0) return false;
      if(obj.allowedManagers.length == 0) return false;
      if(obj.feeCollectors.length == 0) return false;
      if(obj.fundName.length == 0) return false;
      if(obj.fundSymbol.length == 0) return false;
      return true;
    },
    validateGovernor(obj) {
      if(obj.quorumFraction == null) return false;
      if(obj.lateQuorum == null) return false;
      if(obj.votingDelay == null) return false;
      if(obj.votingPeriod == null) return false;
      if(obj.proposalThreshold == null) return false;
      return true;
    },
    validateFundMetadata(obj) {
      if(obj.description == null) return false;
      if(obj.photoUrl == null) return false;
      return true;
    },
    validateFeePeriod(obj) {
      if(obj._feePerformancePeriod == null) return false;
      if(obj._feeManagePeriod == null) return false;
      return true;
    },

    async createFund () {
      let component = this;
      component.loading = true;
      /*
        struct Settings {
            uint256 depositFee;
            uint256 withdrawFee;
            uint256 performanceFee;//TODO: not imp 
            uint256 managementFee;
            uint256 performaceHurdleRateBps;//TODO: not imp 
            address baseToken;
            address safe; 
            bool isExternalGovTokenInUse;
            bool isWhitelistedDeposits;
            address[] allowedDepositAddrs;
            address[] allowedManagers;
            address governanceToken;
            address governor;
            address fundAddress;//TODO: this may not be needed if delegatecall has balance refs to callee addr
            string fundName;
            string fundSymbol;
            address[4] feeCollectors;
          }
      */
      if (component.validateFund(component.fund) && component.validateGovernor(component.governor) && component.validateFundMetadata(component.fundMetadata) && component.validateFeePeriod(component.fee)) {
        await component.getFundFactoryContract.methods.createFund(
          [
            parseInt(component.fund.depositFee),
            parseInt(component.fund.withdrawFee),
            parseInt(component.fund.performanceFee),//performanceFee bps
            parseInt(component.fund.managementFee),
            parseInt(component.fund.performaceHurdleRateBps),//performaceHurdleRateBps bps
            component.fund.baseToken,
            "0x0000000000000000000000000000000000000000",
            false,//false
            false,//false
            component.fund.allowedDepositAddrs.split(",").filter((val) => (val != "") ? true :  false),
            component.fund.allowedManagers.split(",").filter((val) => (val != "") ? true :  false),
            component.fund.governanceToken,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            component.fund.fundName,
            component.fund.fundSymbol,
            component.fund.feeCollectors.split(",").filter((val) => (val != "") ? true :  false),
          ],
          [
            parseInt(component.governor.quorumFraction),
            parseInt(component.governor.lateQuorum),
            parseInt(component.governor.votingDelay),
            parseInt(component.governor.votingPeriod),
            parseInt(component.governor.proposalThreshold),
          ],
          JSON.stringify(component.fundMetadata),//fundMetadata
          parseInt(component.fee._feePerformancePeriod),
          parseInt(component.fee._feeManagePeriod)
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
            component.$toast.success("Create Fund transaction was successfull.");
            
          } else {
            component.$toast.error("The Create Fund tx has failed. Please contact the Rethink Finance community for support.");
          }
          component.loading = false;

        }).on('error', function(error){
          console.log(error);
          component.loading = false;
          component.$toast.error("There has been an error. Please contact the Rethink Finance community for support.");
        });
      }
    },

    cacheProposalEntries: function() {
      localStorage.setItem("proposalEntries", JSON.stringify(this.proposalEntries));

    },

    loadProposalEntries: function() {
      this.proposalEntries = JSON.parse(localStorage.getItem("proposalEntries"));
    },

    forceLoadProposalEntries: function() {
      if (this.proposalEntriesRaw !== null) {
        this.proposalEntries = JSON.parse(this.proposalEntriesRaw);

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

    async initCreateFund () {
      let component = this;
      component.loading = true;
      /*
        struct Settings {
            uint256 depositFee;
            uint256 withdrawFee;
            uint256 performanceFee;//TODO: not imp 
            uint256 managementFee;
            uint256 performaceHurdleRateBps;//TODO: not imp 
            address baseToken;
            address safe; 
            bool isExternalGovTokenInUse;
            bool isWhitelistedDeposits;
            address[] allowedDepositAddrs;
            address[] allowedManagers;
            address governanceToken;
            address governor;
            address fundAddress;//TODO: this may not be needed if delegatecall has balance refs to callee addr
            string fundName;
            string fundSymbol;
            address[4] feeCollectors;
          }
      */
      if (component.validateFund(component.fund) && component.validateGovernor(component.governor) && component.validateFundMetadata(component.fundMetadata) && component.validateFeePeriod(component.fee)) {
        await component.getFundFactoryContract.methods.initCreateFund(
          [
            parseInt(component.fund.depositFee),
            parseInt(component.fund.withdrawFee),
            parseInt(component.fund.performanceFee),//performanceFee bps
            parseInt(component.fund.managementFee),
            parseInt(component.fund.performaceHurdleRateBps),//performaceHurdleRateBps bps
            component.fund.baseToken,
            "0x0000000000000000000000000000000000000000",
            false,//false
            false,//false
            component.fund.allowedDepositAddrs.split(",").filter((val) => (val != "") ? true :  false),
            component.fund.allowedManagers.split(",").filter((val) => (val != "") ? true :  false),
            component.fund.governanceToken,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
            component.fund.fundName,
            component.fund.fundSymbol,
            component.fund.feeCollectors.split(",").filter((val) => (val != "") ? true :  false),
          ],
          [
            parseInt(component.governor.quorumFraction),
            parseInt(component.governor.lateQuorum),
            parseInt(component.governor.votingDelay),
            parseInt(component.governor.votingPeriod),
            parseInt(component.governor.proposalThreshold),
          ],
          JSON.stringify(component.fundMetadata),//fundMetadata
          parseInt(component.fee._feePerformancePeriod),
          parseInt(component.fee._feeManagePeriod)
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
            component.$toast.success("Init Create Fund transaction was successfull. You can not submit permissions");
            
          } else {
            component.$toast.error("The Init Create Fund tx has failed. Please contact the Rethink Finance community for support.");
          }
          component.loading = false;

        }).on('error', function(error){
          console.log(error);
          component.loading = false;
          component.$toast.error("There has been an error. Please contact the Rethink Finance community for support.");
        });
      }
    },

    async submitPermissions () {
      let component = this;
      component.loading = true;

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
      }


      console.log("encodedRoleModEntries");
      console.log(encodedRoleModEntries);

      await component.getFundFactoryContract.methods.submitPermissions(
        encodedRoleModEntries
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
          component.$toast.success("Delegated permissions transactions were successfull. You can now test them in the OIV");
          
        } else {
          component.$toast.error("Delegated permissions tx has failed. Please contact the Rethink Finance support.");
        }
        component.loading = false;

      }).on('error', function(error){
        console.log(error);
        component.loading = false;
        component.$toast.error("There has been an error. Please contact the Rethink Finance support.");
      });

    },

    async finalizeCreateFund() {
      await component.getFundFactoryContract.methods.finalizeCreateFund().send({
          from: component.getActiveAccount,
          maxPriorityFeePerGas: null,
          maxFeePerGas: null
        }).on('transactionHash', function(hash){
          console.log("tx hash: " + hash);
          component.$toast.info("The transaction has been submitted. Please wait for it to be confirmed.");
        }).on('receipt', function(receipt){
          console.log(receipt);
          if (receipt.status) {
            component.$toast.success("Finalized Fund transaction was successfull.");
            
          } else {
            component.$toast.error("The Finalized Fund tx has failed. Please contact the Rethink Finance community for support.");
          }
          component.loading = false;

        }).on('error', function(error){
          console.log(error);
          component.loading = false;
          component.$toast.error("There has been an error. Please contact the Rethink Finance community for support.");
        });
    }
  }
}
</script>
