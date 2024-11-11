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
    </br>
    </br>
    </br>
    </br>
    </br>
    <h1> Submit Permissions  </h1>

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



    </div>


    <!----- Submit NAV Permissions ------>
    </br>
    </br>
    </br>
    </br>
    </br>
    </br>

    <h1> Submit NAV Permissions </h1>

    <div class="pool-management-body-text-color" style="border: 2em;">

      <input v-model="navFund.selectedFundAddress" class="form-control deposit-input" placeholder="OIV ADDR"></input>
      <input v-model="navFund.safe" class="form-control deposit-input" placeholder="OIV CUSTORY ADDR"></input>

      <h3> Process Redemptions: {{ processWithdraw }} </h3>
      <div class="data-item">
        <button @click="toggleProcessWithdraw" class="btn btn-success">
          Toggle Process Redemptions
        </button>
      </div>

      <div class="pool-submit-buttons">
        <button @click="addNavUpdateEntry" class="btn btn-success">
          Add NAV Update Entry
        </button>
      </div>

      <button v-if="detectedNavUpdateEntries" @click="loadNavUpdateEntries" class="btn btn-success">
        Load Saved NAV Update Draft
      </button>

      <NavEntryList :entries="navUpdateEntries" :fund="navFund" />

      <h2>NAV Update Entries</h2>

      <pre style="color:#fff">
        navUpdateEntries: {{ navUpdateEntries }}
      </pre>


      <h2>Suggested NAV Permission</h2>

      <pre style="color:#fff">
        defaultNavEntryPermission: [{{ defaultNavEntryPermission }}]
      </pre>


      <div class="mt-3">
        <h2>Load External NAV Updates Entries Below </h2>

        <textarea v-model="navUpdateEntriesRaw" class="form-control deposit-input" placeholder="navUpdateEntries"></textarea>
      </div>

      <div class="pool-submit-buttons">
        
        <button @click="generateNAVPermission" class="btn btn-success">
          Generate NAV Permission
        </button>
        <button @click="cacheNavUpdateEntries" class="btn btn-success">
          Save NAV Draft (To Browser Storage)
        </button>
        <button @click="forceLoadNavUpdateEntries" class="btn btn-success">
          Force Load NAV Draft
        </button>
        <button @click="storeNav" class="btn btn-success">
          <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Store & Submit NAV Permissions (2 txs)
        </button>
      </div>
    </div>

    </br>
    </br>
    </br>
    </br>
    </br>
    </br>

    <div>
      <button @click="finalizeCreateFund" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Finalize Fund Creation
      </button>
    </div>
  </div>

  

  
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import addresses from "../contracts/addresses.json";
import FundInput from '../components/fund/FundInput.vue';
import NavEntryList from '../components/nav/NavEntryList.vue';
import ZodiacRoles from '../contracts/zodiac/RolesFull.json';
import ProposalEntry from '../components/gov/ProposalEntry.vue';

export default {
  name: "CreateFund",

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fundFactory", ["getFundFactoryContract"]),
    ...mapGetters("fund", ["getFundAbi"]),

    detectedNavUpdateEntries() {
      let n = localStorage.getItem("navUpdateEntries");

      if (n !== null) {
        if (n.length > 0) {
          return true;
        } 
      }

      return false;
    },

    detectedProposalEntries() {
      let p = localStorage.getItem("proposalEntries");

      if (p === null){
        return false;
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
    this.$store.dispatch("fund/storeAbi");
    this.proposalRoleModMethods = ZodiacRoles.abi.filter((val) => (val["type"] == "function") ? true :  false);
  },

  data() {
    return {
      loading: false,
      navFund:{
        safe: "0x0000000000000000000000000000000000000000",
        selectedFundAddress: "0x0000000000000000000000000000000000000000"
      },
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
      txIdx: 0,
      navUpdate: null,
      navUpdateDecoded: {},
      entryIdx: 0,
      processWithdraw: false,
      PastNAVUpdateMap: {
        "true": true,
        "false": false
      },
      NAVNFTType: {
        "ERC1155": 0,
        "ERC721": 1,
        "NONE": 2
      },
      NAVComposableUpdateReturnType: {
        "UINT256": 0,
        "INT256": 1,
      },
      NavUpdateType: {
        "NAVLiquidUpdateType": 0,
        "NAVIlliquidUpdateType": 1,
        "NAVNFTUpdateType": 2,
        "NAVComposableUpdateType": 3
      },
      defaultNavEntryPermission: [{
        "idx": 0,
        "value": [
          {
            "idx": 0,
            "isArray": false,
            "data": "1",
            "internalType": "uint16",
            "name": "role"
          },
          {
            "idx": 1,
            "isArray": false,
            "data": null,
            "internalType": "address",
            "name": "targetAddress"
          },
          {
            "idx": 2,
            "isArray": false,
            "data": null,
            "internalType": "bytes4",
            "name": "functionSig"
          },
          {
            "idx": 3,
            "isArray": true,
            "data": [],
            "internalType": "bool[]",
            "name": "isParamScoped"
          },
          {
            "idx": 4,
            "isArray": true,
            "data": [],
            "internalType": "enum ParameterType[]",
            "name": "paramType"
          },
          {
            "idx": 5,
            "isArray": true,
            "data": [],
            "internalType": "enum Comparison[]",
            "name": "paramComp"
          },
          {
            "idx": 6,
            "isArray": true,
            "data": [],
            "internalType": "bytes[]",
            "name": "compValue"
          },
          {
            "idx": 7,
            "isArray": false,
            "data": "1",
            "internalType": "enum ExecutionOptions",
            "name": "options"
          }
        ],
        "valueMethodIdx": 19
        }, {
        "idx": 1,
        "value": [
          {
            "idx": 0,
            "isArray": false,
            "data": "1", //TODO: ASSUMES ROLE ID OF 1, BUT COULD BE ANY OTHER ID, NEED A WAY TO POPULATE IT SMARTLY
            "internalType": "uint16",
            "name": "role"
          },
          {
            "idx": 1,
            "isArray": false,
            "data": null,
            "internalType": "address",
            "name": "targetAddress"
          }
        ],
        "valueMethodIdx": 24
      }],
      navUpdateEntries: [],
      navUpdateEntriesRaw: null,
    }
  },

  components: {
    FundInput,
    ProposalEntry,
    NavEntryList
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
      let component = this;
      component.loading = true;
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
    },

    toggleProcessWithdraw() {
      if (this.processWithdraw == false) {
        this.processWithdraw = true;
      } else {
        this.processWithdraw = false;
      }
    },

    cacheNavUpdateEntries: function() {
      localStorage.setItem("navUpdateEntries", JSON.stringify(this.navUpdateEntries));
    },

    loadNavUpdateEntries: function() {
      this.navUpdateEntries = JSON.parse(localStorage.getItem("navUpdateEntries"));
    },

    forceLoadNavUpdateEntries: function() {
      if (this.navUpdateEntriesRaw !== null) {
        this.navUpdateEntries = JSON.parse(this.navUpdateEntriesRaw);

      }    
    },

  /*
    struct NavUpdateEntry {
      NavUpdateType entryType;
      NAVLiquidUpdate[] liquid;
      NAVIlliquidUpdate[] illiquid;
      NAVNFTUpdate[] nft;
      NAVComposableUpdate[] composable;
      bool isPastNAVUpdate;
      uint256 pastNAVUpdateIndex;
      uint256 pastNAVUpdateEntryIndex;
      string description;
    }

  */

    addNavUpdateEntry: function (){
        this.navUpdateEntries.push({
          index: this.entryIdx++,
          liquidUpdates: [],
          illiquidUpdates: [],
          nftUpdates: [],
          composableUpdates: [],
          entryType: null, //auto set based on what is clicked
          isPastNAVUpdate: null,
          pastNAVUpdateIndex: null,
          pastNAVUpdateEntryIndex: null,
          description: {
            positionName: "",
            valuationSource: ""
          },
          pastNAVUpdateEntryFundAddress: this.navFund.selectedFundAddress
        })
    },

    

    validateObj(obj) {
      if (obj.length == 0)
        return false;

      for (let i =0; i < obj.length; i++) {
        for (const key in obj[i]) {
          if (obj[i][key] === null) {
            return false;
          }
        }
      }

      return true;
    },

    prepNAVLiquidUpdate(liquidUpdates) {
      let data = [];
      for(let i=0; i<liquidUpdates.length; i++) {
        let parameters = [
          liquidUpdates[i].tokenPair,
          liquidUpdates[i].aggregatorAddress,
          liquidUpdates[i].functionSignatureWithEncodedInputs, 
          liquidUpdates[i].assetTokenAddress,
          liquidUpdates[i].nonAssetTokenAddress,
          this.BOOL_TYPE[liquidUpdates[i].isReturnArray],
          parseInt(liquidUpdates[i].returnLength),
          parseInt(liquidUpdates[i].returnIndex),
          parseInt(liquidUpdates[i].pastNAVUpdateIndex)
        ];
        data.push(parameters);
      }
      return data;
    },

    prepNAVIlliquidUpdate(illiquidUpdates) {
      let data = [];

      for(let i=0; i<illiquidUpdates.length; i++) {
        let hashes = illiquidUpdates[i].otcTxHashes.split(",");
        console.log(this.NAVNFTType);
        console.log(illiquidUpdates[i].nftType);
        console.log(this.NAVNFTType[illiquidUpdates[i].nftType]);
        let parameters = [
          String((Number(illiquidUpdates[i].baseCurrencySpent) * (10 ** 18)).toLocaleString('fullwide', {useGrouping:false})), //price * 10 ** 18 TODO: need to use base currency decimals
          parseInt(illiquidUpdates[i].amountAquiredTokens),
          illiquidUpdates[i].tokenAddress,
          this.BOOL_TYPE[illiquidUpdates[i].isNFT], 
          hashes.filter((val) => (val != "") ? true :  false),
          this.NAVNFTType[illiquidUpdates[i].nftType],
          parseInt(illiquidUpdates[i].nftIndex),
          parseInt(illiquidUpdates[i].pastNAVUpdateIndex)
        ];
        data.push(parameters);
      }
      return data;
    },

    decodeNavUpdate() {
      if (this.navUpdate != null) {
        this.navUpdateDecoded = abiDecoder.decodeMethod(this.navUpdate);
      }
    },

    prepNAVNFTUpdate(nftUpdates) {
      let data = [];
      for(let i=0; i<nftUpdates.length; i++) {
        let parameters = [
          nftUpdates[i].oracleAddress,
          nftUpdates[i].nftAddress,
          this.NAVNFTType[nftUpdates[i].nftType],
          parseInt(nftUpdates[i].nftIndex),
          parseInt(nftUpdates[i].pastNAVUpdateIndex)
        ];
        data.push(parameters);
      }
      return data;
    },

    prepNAVComposableUpdate(composableUpdates) {
      let data = [];
      for(let i=0; i<composableUpdates.length; i++) {
        let parameters = [
          composableUpdates[i].remoteContractAddress,
          composableUpdates[i].functionSignatures,
          composableUpdates[i].encodedFunctionSignatureWithInputs, 
          parseInt(composableUpdates[i].normalizationDecimals),
          this.BOOL_TYPE[composableUpdates[i].isReturnArray],
          parseInt(composableUpdates[i].returnValIndex),
          parseInt(composableUpdates[i].returnArraySize),
          this.NAVComposableUpdateReturnType[composableUpdates[i].returnValType],
          parseInt(composableUpdates[i].pastNAVUpdateIndex),
          this.BOOL_TYPE[composableUpdates[i].isNegative],
        ];
        data.push(parameters);
      }
      return data;
    },

    generateNAVPermission() {
      let component = this;

      let addNavUpdateEntryAbiJSON = component.getFundAbi[49];
      let collectFeesAbiJSON = component.getFundAbi[54];

      let dataNavUpdateEntries = [];
      let dataPastNavUpdateEntriesAddrs = [];

      //encode all liquid, push back onto NavUpdateEntry
      if (component.validateObj(component.navUpdateEntries)) {
        for(let i=0; i<component.navUpdateEntries.length; i++) {
          let parameters = [
            component.NavUpdateType[component.navUpdateEntries[i].entryType],
            component.prepNAVLiquidUpdate(
              component.navUpdateEntries[i].liquidUpdates
            ),//NAVLiquidUpdate[] liquid;
            component.prepNAVIlliquidUpdate(
              component.navUpdateEntries[i].illiquidUpdates
            ),//NAVIlliquidUpdate[] illiquid;
            component.prepNAVNFTUpdate(
              component.navUpdateEntries[i].nftUpdates
            ),//NAVNFTUpdate[] nft;
            component.prepNAVComposableUpdate(
              component.navUpdateEntries[i].composableUpdates
            ),//NAVComposableUpdate[] composable;
            component.PastNAVUpdateMap[component.navUpdateEntries[i].isPastNAVUpdate],
            parseInt(component.navUpdateEntries[i].pastNAVUpdateIndex),
            parseInt(component.navUpdateEntries[i].pastNAVUpdateEntryIndex),
            JSON.stringify(component.navUpdateEntries[i].description),//fundMetadata
          ];

          dataNavUpdateEntries.push(
            parameters
          );

          dataPastNavUpdateEntriesAddrs.push(
            component.navUpdateEntries[i].pastNAVUpdateEntryFundAddress
          );
        }
      }

      console.log(JSON.stringify(dataNavUpdateEntries));
      console.log(addNavUpdateEntryAbiJSON);
      let encodedDataNavUpdateEntries = component.getWeb3.eth.abi.encodeFunctionCall(addNavUpdateEntryAbiJSON, [dataNavUpdateEntries, dataPastNavUpdateEntriesAddrs, component.processWithdraw]);


      //target address is fund contract
      //TODO: need input field to replace component.getSelectedFundAddres and .fund.safe
      component.defaultNavEntryPermission[0].value[1].data = component.navFund.selectedFundAddress;
      //again, need to set target addr for scope target
      component.defaultNavEntryPermission[1].value[1].data = component.navFund.selectedFundAddress;
      //functionSig
      component.defaultNavEntryPermission[0].value[2].data = "0xa61f5814";
      
      //raw data to permission
      let navExecutorAddr = addresses["NAVExecutorBeaconProxy"][parseInt(component.getChainId)];
      console.log(navExecutorAddr);
      let navWords = ["0x000000000000000000000000" + navExecutorAddr.slice(2)];
      let navIsScoped = [true];
      let navTypeNComp = ["0"];

      //isParamScoped
      component.defaultNavEntryPermission[0].value[3].data = navIsScoped;
      //paramType
      component.defaultNavEntryPermission[0].value[4].data = navTypeNComp;
      //paramComp
      component.defaultNavEntryPermission[0].value[5].data = navTypeNComp;
      //compValue
      component.defaultNavEntryPermission[0].value[6].data = navWords;
    },

    async storeNav () {
      let component = this;
      component.loading = true;

      let addNavUpdateEntryAbiJSON = component.getFundAbi[49];
      let collectFeesAbiJSON = component.getFundAbi[54];

      let dataNavUpdateEntries = [];
      let dataPastNavUpdateEntriesAddrs = [];

      //encode all liquid, push back onto NavUpdateEntry
      if (component.validateObj(component.navUpdateEntries)) {
        for(let i=0; i<component.navUpdateEntries.length; i++) {
          let parameters = [
            component.NavUpdateType[component.navUpdateEntries[i].entryType],
            component.prepNAVLiquidUpdate(
              component.navUpdateEntries[i].liquidUpdates
            ),//NAVLiquidUpdate[] liquid;
            component.prepNAVIlliquidUpdate(
              component.navUpdateEntries[i].illiquidUpdates
            ),//NAVIlliquidUpdate[] illiquid;
            component.prepNAVNFTUpdate(
              component.navUpdateEntries[i].nftUpdates
            ),//NAVNFTUpdate[] nft;
            component.prepNAVComposableUpdate(
              component.navUpdateEntries[i].composableUpdates
            ),//NAVComposableUpdate[] composable;
            component.PastNAVUpdateMap[component.navUpdateEntries[i].isPastNAVUpdate],
            parseInt(component.navUpdateEntries[i].pastNAVUpdateIndex),
            parseInt(component.navUpdateEntries[i].pastNAVUpdateEntryIndex),
            JSON.stringify(component.navUpdateEntries[i].description),//fundMetadata
          ];

          dataNavUpdateEntries.push(
            parameters
          );

          dataPastNavUpdateEntriesAddrs.push(
            component.navUpdateEntries[i].pastNAVUpdateEntryFundAddress
          );
        }
      }

      console.log(JSON.stringify(dataNavUpdateEntries));
      console.log(addNavUpdateEntryAbiJSON);
      let encodedDataNavUpdateEntries = component.getWeb3.eth.abi.encodeFunctionCall(addNavUpdateEntryAbiJSON, [dataNavUpdateEntries, dataPastNavUpdateEntriesAddrs, component.processWithdraw]);



      let navExecutorAddr = addresses["NAVExecutorBeaconProxy"][parseInt(component.getChainId)];

      //encode permisions for nav update

      let encodedRoleModEntries = [];

      //TODO: assumes validation already happens when inputing data
      for(let i=0; i<component.defaultNavEntryPermission.length; i++) {
        let roleModFunctionABI = component.proposalRoleModMethods[component.defaultNavEntryPermission[i].valueMethodIdx];
        let roleModFunctionData = [];
        for (let j=0; j<component.defaultNavEntryPermission[i].value.length; j++) {
          roleModFunctionData.push(component.prepRoleModEntryInput(component.defaultNavEntryPermission[i].value[j]));
        }
        let encodedRoleModFunction = component.getWeb3.eth.abi.encodeFunctionCall(
          roleModFunctionABI, roleModFunctionData
        );
        encodedRoleModEntries.push(encodedRoleModFunction);
      }

      console.log("encodedRoleModEntries");
      console.log(encodedRoleModEntries);

      console.log("navExecutorAddr");
      console.log(navExecutorAddr);

      console.log("encodedDataNavUpdateEntries");
      console.log(encodedDataNavUpdateEntries);


      //STORE NAV
      await component.getFundFactoryContract.methods.storeNAV(
        navExecutorAddr,
        encodedDataNavUpdateEntries
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



      //SUBMIT NAV PERMISSIONS
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
  }
}
</script>
