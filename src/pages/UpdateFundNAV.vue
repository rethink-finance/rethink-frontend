<template>
  <div class="pool-management-body-text-color">

    <h1> Current Fund: ({{getSelectedFundAddress.substring(0, 6)}}...{{getSelectedFundAddress.substring(38, 42)}})</h1>


    <textarea v-model="navUpdate" class="form-control deposit-input" placeholder="Decode Nav Update"></textarea>
    <div class="pool-submit-buttons">

      <pre style="color:#fff">{{ navUpdateDecoded }}</pre>


      <button @click="decodeNavUpdate" class="btn btn-success">
        Decode Nav Update
      </button>
    </div>

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

    <NavEntryList :entries="navUpdateEntries" :fund="fund" />

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
        Save Draft (To Browser Storage)
      </button>
      <button @click="forceLoadNavUpdateEntries" class="btn btn-success">
        Force Load Draft
      </button>
      <button @click="createProposal" class="btn btn-success">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Create and Register Proposal
      </button>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import NavEntryList from '../components/nav/NavEntryList.vue';

import addresses from "../contracts/addresses.json";
import RethinkFundGovernorJSON from "../contracts/RethinkFundGovernor.json";
import NAVCalculatorJSON from "../contracts/NAVCalculator.json";
import NAVExecutorJSON from "../contracts/NAVExecutor.json";
import GnosisSafeL2JSON from '../contracts/safe/GnosisSafeL2_v1_3_0.json';
import ZodiacRoles from '../contracts/zodiac/RolesFull.json';

const abiDecoder = require('abi-decoder'); // NodeJS

export default {
  name: 'UpdateFundNAV',
  data() {
    return {
      loading: false,
      fund: {},
      navUpdate: null,
      navUpdateDecoded: {},
      entryIdx: 0,
      processWithdraw: false,
      proposalRoleModMethods: [],
      BOOL_TYPE: {
        "true": true,
        "false": false
      },
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
        "valueMethodIdx": 25
      }],
      navUpdateEntries: [],
      navUpdateEntriesRaw: null,
    }
  },
  components: {
    NavEntryList
  },
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fundFactory", ["getFundFactoryContract", "getFunds"]),
    ...mapGetters("fund", ["getSelectedFundAddress", "getFundAbi", "getFundContract"]),

    detectedNavUpdateEntries() {
      let n = localStorage.getItem("navUpdateEntries");

      if (n !== null) {
        if (n.length > 0) {
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
    
    for (var i in this.getFundAbi) {
      console.log(i + " " + JSON.stringify(this.getFundAbi[i]));
    }

    for (var i in NAVCalculatorJSON.abi) {
    	console.log(i + " " + JSON.stringify(NAVCalculatorJSON.abi[i]));
    }

    for (var i in NAVExecutorJSON.abi) {
      console.log(i + " " + JSON.stringify(NAVExecutorJSON.abi[i]));
    }

    abiDecoder.addABI(this.getFundAbi);

    this.proposalRoleModMethods = ZodiacRoles.abi.filter((val) => (val["type"] == "function") ? true :  false);

  },

  methods: {
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
          pastNAVUpdateEntryFundAddress: this.getSelectedFundAddress
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
      component.defaultNavEntryPermission[0].value[1].data = component.getSelectedFundAddress;
      //again, need to set target addr for scope target
      component.defaultNavEntryPermission[1].value[1].data = component.getSelectedFundAddress;
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

    async createProposal () {
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

      let encodedCollectFlowFeesAbiJSON = component.getWeb3.eth.abi.encodeFunctionCall(collectFeesAbiJSON, [0]);
      let encodedCollectManagerFeesAbiJSON = component.getWeb3.eth.abi.encodeFunctionCall(collectFeesAbiJSON, [2]);
      let encodedCollectPerformanceFeesAbiJSON = component.getWeb3.eth.abi.encodeFunctionCall(collectFeesAbiJSON, [3]);

      // store nav update in nav executor to giv permission to manager to call it: target -> navexuctor
      let storeNAVDataABI = NAVExecutorJSON.abi[0];
      let encodedDataStoreNAVDataNavUpdateEntries = component.getWeb3.eth.abi.encodeFunctionCall(storeNAVDataABI, [component.getSelectedFundAddress, encodedDataNavUpdateEntries]);

      let navExecutorAddr = addresses["NAVExecutorBeaconProxy"][parseInt(component.getChainId)];


      //get role mod contract addr
      const safeContract = new component.getWeb3.eth.Contract(
        GnosisSafeL2JSON.abi,
        component.fund.safe
      );
      console.log(component.fund.safe);
      let addr1 = "0x0000000000000000000000000000000000000001";
      let safeModules = await safeContract.methods.getModulesPaginated(addr1, 10).call();
      let roleModAddr = safeModules[0][1];


      //encode permisions for nav update

      let encodedRoleModEntries = [];
      let roleModTargets = [];
      let roleModGas = [];

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
        roleModTargets.push(roleModAddr);
        roleModGas.push(0);
      }

      console.log("roleModAddr");
      console.log(roleModAddr);

      console.log("encodedRoleModEntries");
      console.log(encodedRoleModEntries);

      console.log("navExecutorAddr");
      console.log(navExecutorAddr);

      console.log("encodedDataStoreNAVDataNavUpdateEntries");
      console.log(encodedDataStoreNAVDataNavUpdateEntries);


      //proposae nav update for fund (target: fund addr, payloadL bytes)
      //GOV NAV
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

      //proposae nav update for fund (target: fund addr, payloadL bytes)
      //GOV NAV PERMISSIONS
      await rethinkFundGovernorContract.methods.propose(
        [navExecutorAddr].concat(roleModTargets),
        [0].concat(roleModGas),
        [encodedDataStoreNAVDataNavUpdateEntries].concat(encodedRoleModEntries),
        "NAV UPDATE PERMISSIONS: #" + String(navUpdateIndex)
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
