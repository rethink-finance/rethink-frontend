<template>

<div class="section-small">

  <div class="d-flex justify-content-between flex-wrap">
    <h3>Nav Update Entry: {{ entry.description.positionName}}, {{ entry.description.valuationSource}}</h3>    

    <!-- Action button -->
    <div>
      <button @click="toggleForm" class="btn btn-success" v-if="!showForm">
        View
        <i class="fas fa-chevron-down"></i>
        <i class="fas fa-chevron-up" v-if="showForm"></i>
      </button>
      <button @click="toggleForm" class="btn btn-outline-success" v-if="showForm">
        Close
        <i class="fas fa-chevron-up"></i>
      </button>

      <span></span>
    </div>
  </div>


  <div v-if="showForm">
    <div class="section-big row mt-4 mx-3">
      <div class="col-md-12">
        <AddPastNavEntryRef :entry="entry" />
        <span></span>
        <div class="section-big row mt-4 mx-3" v-if="showLiq">
          <button @click="simulateLiq" class="btn btn-success">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Simulate Liquid NAV Entry
          </button>
          <pre> >> {{ simulatedLiqVal }}</pre>
        </div>
        <div class="section-big row mt-4 mx-3" v-if="showIliq">
          <button @click="simulateIliq" class="btn btn-success">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Simulate Illiquid NAV Entry
          </button>
          <pre> >> {{ simulatedIliqVal }}</pre>
        </div>
        <div class="section-big row mt-4 mx-3" v-if="showNft">
          <button @click="simulateNft" class="btn btn-success">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Simulate NFT NAV Entry
          </button>
          <pre> >> {{ simulatedNftVal }}</pre>
        </div>
        <div class="section-big row mt-4 mx-3" v-if="showComp">
          <button @click="simulateComp" class="btn btn-success">
            <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Simulate Composable NAV Entry
          </button>
          <pre> >> {{ simulatedCompVal }}</pre>
        </div>
      </div>
    </div>

    <span></span>
    <span></span>
  </div>


  <div v-if="showForm">
    <!------ Adding/reference LiquidUpdate ------>

    <div class="section-big row mt-4 mx-3" v-if="showLiq">
      <div class="col-md-12">
        <AddLiquidUpdate :positions="entry.liquidUpdates" />
        <span></span>
      </div>
      <button @click="addLiquidUpdate" class="btn btn-success">
        Add/Reference Liquid Update (GOV REQUIRED)
      </button>
    </div>

    <span></span>
    <span></span>

    <!------ Adding/ref iliquidUpdates ------>

    <div class="section-big row mt-4 mx-3" v-if="showIliq">
      <div class="col-md-12">
        <AddIlliquidUpdate :positions="entry.illiquidUpdates" />
        <span></span>
      </div>
      <button @click="addIlliquidUpdate" class="btn btn-success">
        Add/Reference Illiquid Update (GOV REQUIRED)
      </button>
    </div>

    <span></span>
    <span></span>

        <!------ Adding/Reference NftUpdate ------>

    <div class="section-big row mt-4 mx-3" v-if="showNft">
      <div class="col-md-12">
        <AddNftUpdate :positions="entry.nftUpdates" />
        <span></span>
      </div>
      <button @click="addNftUpdate" class="btn btn-success">
        Add/Reference Nft Update (GOV REQUIRED)
      </button>
    </div>

    <span></span>
    <span></span>

        <!------ Adding/Reference symbols ------>

    <div class="section-big row mt-4 mx-3" v-if="showComp">
      <div class="col-md-12">
        <AddComposableUpdate :positions="entry.composableUpdates" />
        <span></span>
      </div>
      <button @click="addComposableUpdate" class="btn btn-success">
        Add/Reference Composable Update (GOV REQUIRED)
      </button>
    </div>

    <span></span>
    <span></span>    
  </div>
  
</div>
  
</template>

<script>
import { mapGetters } from "vuex";

import AddLiquidUpdate from './AddLiquidUpdate.vue';
import AddIlliquidUpdate from './AddIlliquidUpdate.vue';
import AddNftUpdate from './AddNftUpdate.vue';
import AddComposableUpdate from './AddComposableUpdate.vue';
import AddPastNavEntryRef from './AddPastNavEntryRef.vue';

import addresses from "../../contracts/addresses.json";
import NAVCalculatorJSON from "../../contracts/NAVCalculator.json";


export default {
  name: "NavEntry",
  props: ["entry", "fund"],
  data() {
    return {
      loading: false,
      showForm: false,
      showLiq: true,
      showIliq: true,
      showNft: true,
      showComp: true,
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
      simulatedLiqVal: null,
      simulatedIliqVal: null,
      simulatedCompVal: null,
      simulatedNftVal: null,
    }
  },

  components: { 
    AddLiquidUpdate,
    AddIlliquidUpdate,
    AddNftUpdate,
    AddComposableUpdate,
    AddPastNavEntryRef,
  },

  created() {
  },

  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "getChainId", "getChainName", "getWeb3", "isUserConnected"]),
    ...mapGetters("fund", ["getSelectedFundAddress", "getFundAbi", "getFundContract"]),
  },

  /*

    NavUpdateType: {
        "NAVLiquidUpdateType": 0,
        "NAVIlliquidUpdateType": 1,
        "NAVNFTUpdateType": 2,
        "NAVComposableUpdateType": 3
      },

  */

  methods: {
    toggleHidden() {
      if (this.entry.liquidUpdates.length > 0) {
          this.showIliq = false;
          this.showNft = false;
          this.showComp = false;

          this.entry.entryType = "NAVLiquidUpdateType";
        } else if (this.entry.illiquidUpdates.length > 0) {
          this.showLiq = false;
          this.showNft = false;
          this.showComp = false;

          this.entry.entryType = "NAVIlliquidUpdateType";
        } else if (this.entry.nftUpdates.length > 0) {
          this.showLiq = false;
          this.showIliq = false;
          this.showComp = false;

          this.entry.entryType = "NAVNFTUpdateType";
        } else if (this.entry.composableUpdates.length > 0) {
          this.showLiq = false;
          this.showIliq = false;
          this.showNft = false;

          this.entry.entryType = "NAVComposableUpdateType";
        }
    },
    toggleForm() {
      if (this.showForm) {
        this.showForm = false;
      } else {
        this.showForm = true;
      }
    },

    /*
      struct NAVLiquidUpdate {
        address tokenPair;
        address aggregatorAddress;
        bytes functionSignatureWithEncodedInputs;
        address assetTokenAddress;
        address nonAssetTokenAddress;
        bool isReturnArray;
        uint256 returnLength;
        uint256 returnIndex;
        uint256 pastNAVUpdateIndex;
      }
    */

    addLiquidUpdate: function () {
      this.entry.liquidUpdates.push({
        tokenPair: null,
        aggregatorAddress: null,
        functionSignatureWithEncodedInputs: null, 
        assetTokenAddress: null,
        nonAssetTokenAddress: null,
        isReturnArray: null,
        returnLength: null,
        returnIndex: null,
        pastNAVUpdateIndex: null
      });
      this.toggleHidden();
    },

    /*
        struct NAVIlliquidUpdate {
          uint256 baseCurrencySpent;
          uint256 amountAquiredTokens;
          address tokenAddress;
          bool isNFT;
          string[] otcTxHashes;
          NAVNFTType nftType;
          uint256 nftIndex;
          uint256 pastNAVUpdateIndex;
        }
    */

    addIlliquidUpdate: function () {
      this.entry.illiquidUpdates.push({
        baseCurrencySpent: null,
        amountAquiredTokens: null,
        tokenAddress: null, 
        isNFT: null,
        otcTxHashes: null,
        nftType: null,
        nftIndex: null,
        pastNAVUpdateIndex: null,
      });
      this.toggleHidden();
    },

    /*
        struct NAVNFTUpdate {
          address oracleAddress;
          address nftAddress;
          NAVNFTType nftType;
          uint256 nftIndex;
          uint256 pastNAVUpdateIndex;
        
    */

    addNftUpdate: function () {
      this.entry.nftUpdates.push({
        oracleAddress: null,
        nftAddress: null,
        nftType: null, 
        nftIndex: null,
        pastNAVUpdateIndex: null,
      });
      this.toggleHidden();
    },

    /*
        struct NAVComposableUpdate {
          address remoteContractAddress;
          string functionSignatures;
          bytes encodedFunctionSignatureWithInputs;
          uint256 normalizationDecimals;
          bool isReturnArray;
          uint256 returnValIndex;
          uint256 returnArraySize;
          NAVComposableUpdateReturnType returnValType;
          uint256 pastNAVUpdateIndex;
        }
    */

    addComposableUpdate: function () {
      this.entry.composableUpdates.push({
        remoteContractAddress: null,
        functionSignatures: null,
        encodedFunctionSignatureWithInputs: null, 
        normalizationDecimals: null,
        isReturnArray: null,
        returnValIndex: null,
        returnArraySize: null,
        returnValType: null,
        pastNAVUpdateIndex: null,
        isNegative: null
      });
      this.toggleHidden();
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

    /*

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

    */

    async simulateLiq(){
      let component = this;
      component.loading = true;
      let NAVaddress = addresses["NAVCalculatorBeaconProxy"][parseInt(component.getChainId)];
      const NAVCalculatorContract = new component.getWeb3.eth.Contract(
        NAVCalculatorJSON.abi,
        NAVaddress
      );

      //function liquidCalculationReadOnly(IGovernableFundStorage.NAVLiquidUpdate[] calldata liquid, address safe, address fund, uint256 navEntryIndex, bool isPastNAVUpdate, uint256 pastNAVUpdateIndex, uint256 pastNAVUpdateEntryIndex, address pastNAVUpdateEntryFundAddress)

      component.simulatedLiqVal = await NAVCalculatorContract.methods.liquidCalculationReadOnly(
        component.prepNAVLiquidUpdate(
          component.entry.liquidUpdates
        ),//NAVLiquidUpdate[] liquid;
        component.fund.safe,
        (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,//fund
        0,//navEntryIndex
        component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],//isPastNAVUpdate
        parseInt(component.entry.pastNAVUpdateIndex),//pastNAVUpdateIndex
        parseInt(component.entry.pastNAVUpdateEntryIndex),//pastNAVUpdateEntryIndex
        component.entry.pastNAVUpdateEntryFundAddress//pastNAVUpdateEntryFundAddress
      ).call();
      component.loading = false;
      let encodedDataliquidCalculationReadOnly = component.getWeb3.eth.abi.encodeFunctionCall(NAVCalculatorJSON.abi[5],
      [
        component.prepNAVLiquidUpdate(
          component.entry.liquidUpdates
        ),
        component.fund.safe,
        (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,
        0,
        component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],
        parseInt(component.entry.pastNAVUpdateIndex),
        parseInt(component.entry.pastNAVUpdateEntryIndex),
        component.entry.pastNAVUpdateEntryFundAddress
      ]);
      console.log("encodedDataliquidCalculationReadOnly:" + encodedDataliquidCalculationReadOnly)
    },
    async simulateIliq() {
      let component = this;
      component.loading = true;
      let NAVaddress = addresses["NAVCalculatorBeaconProxy"][parseInt(component.getChainId)];
      const NAVCalculatorContract = new component.getWeb3.eth.Contract(
        NAVCalculatorJSON.abi,
        NAVaddress
      );

      //function illiquidCalculationReadOnly(IGovernableFundStorage.NAVIlliquidUpdate[] calldata illiquid, address safe, address fund, uint256 navEntryIndex, bool isPastNAVUpdate, uint256 pastNAVUpdateIndex, uint256 pastNAVUpdateEntryIndex, address pastNAVUpdateEntryFundAddress)

      component.simulatedIliqVal = await NAVCalculatorContract.methods.illiquidCalculationReadOnly(
        component.prepNAVIlliquidUpdate(
          component.entry.illiquidUpdates
        ),//NAVLiquidUpdate[] liquid;
        component.fund.safe,
        (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,//fund
        0,//navEntryIndex
        component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],//isPastNAVUpdate
        parseInt(component.entry.pastNAVUpdateIndex),//pastNAVUpdateIndex
        parseInt(component.entry.pastNAVUpdateEntryIndex),//pastNAVUpdateEntryIndex
        component.entry.pastNAVUpdateEntryFundAddress//pastNAVUpdateEntryFundAddress
      ).call();
      component.loading = false;
      let encodedDataIlliquidCalculationReadOnly = component.getWeb3.eth.abi.encodeFunctionCall(NAVCalculatorJSON.abi[3], 
      [
        component.prepNAVIlliquidUpdate(
          component.entry.illiquidUpdates
        ),
	      component.fund.safe,
        (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,
        0,
        component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],
        parseInt(component.entry.pastNAVUpdateIndex),
        parseInt(component.entry.pastNAVUpdateEntryIndex),
        component.entry.pastNAVUpdateEntryFundAddress
      ]);
      console.log("encodedDataIlliquidCalculationReadOnly:" + encodedDataIlliquidCalculationReadOnly)

    },
    async simulateNft() {
      //TODO
      //let encodedDataNftCalculationReadOnly = component.getWeb3.eth.abi.encodeFunctionCall(NAVCalculatorJSON.abi[7], []);
    },
    async simulateComp() {
      let component = this;
      component.loading = true;
      let NAVaddress = addresses["NAVCalculatorBeaconProxy"][parseInt(component.getChainId)];
      const NAVCalculatorContract = new component.getWeb3.eth.Contract(
        NAVCalculatorJSON.abi,
        NAVaddress
      );

      //  function composableCalculationReadOnly(IGovernableFundStorage.NAVComposableUpdate[] calldata composable, address fund, uint256 navEntryIndex, bool isPastNAVUpdate, uint256 pastNAVUpdateIndex, uint256 pastNAVUpdateEntryIndex, address pastNAVUpdateEntryFundAddress) external view returns (int256) {

      console.log("addr");
      console.log((component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress);

      
      let encodedDataComposableCalculationReadOnly = component.getWeb3.eth.abi.encodeFunctionCall(NAVCalculatorJSON.abi[0], 
      [
        component.prepNAVComposableUpdate(
          component.entry.composableUpdates
        ),
        (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,
        0,
        component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],
        parseInt(component.entry.pastNAVUpdateIndex),
        parseInt(component.entry.pastNAVUpdateEntryIndex),
        component.entry.pastNAVUpdateEntryFundAddress
      ]);

      console.log(NAVCalculatorJSON.abi[1]);

      console.log("encodedDataComposableCalculationReadOnly");

      console.log(encodedDataComposableCalculationReadOnly);

      if (component.getSelectedFundAddress === 'N/A') {
        component.simulatedCompVal = await NAVCalculatorContract.methods.composableCalculationNonInitReadOnly(
          component.prepNAVComposableUpdate(
            component.entry.composableUpdates
          ),//NAVLiquidUpdate[] liquid;
          (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,//fund
          0,//navEntryIndex
          component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],//isPastNAVUpdate
          parseInt(component.entry.pastNAVUpdateIndex),//pastNAVUpdateIndex
          parseInt(component.entry.pastNAVUpdateEntryIndex),//pastNAVUpdateEntryIndex
          component.entry.pastNAVUpdateEntryFundAddress,//pastNAVUpdateEntryFundAddress
          addresses["GovernableFundFactoryBeaconProxy"][parseInt(component.getChainId)],//gff
          component.getActiveAccount//deployer, NOTE: assumess connected account is deployer
        ).call();
      } else {
        component.simulatedCompVal = await NAVCalculatorContract.methods.composableCalculationReadOnly(
          component.prepNAVComposableUpdate(
            component.entry.composableUpdates
          ),//NAVLiquidUpdate[] liquid;
          (component.getSelectedFundAddress === 'N/A') ? component.fund.selectedFundAddress : component.getSelectedFundAddress,//fund
          0,//navEntryIndex
          component.PastNAVUpdateMap[component.entry.isPastNAVUpdate],//isPastNAVUpdate
          parseInt(component.entry.pastNAVUpdateIndex),//pastNAVUpdateIndex
          parseInt(component.entry.pastNAVUpdateEntryIndex),//pastNAVUpdateEntryIndex
          component.entry.pastNAVUpdateEntryFundAddress//pastNAVUpdateEntryFundAddress
        ).call();
      }
      component.loading = false;
    },

  }
}
</script>

<style>
.data-item {
  margin-right: 5px;
}

.div-flex {
  display: flex;
}

.fa-chevron-down, .fa-chevron-up {
  margin-left: 10px;
}

.show-form {
  margin-top: 24px;
}

.section-small {
  margin-top: 16px;
}

/* Mobile screens */
@media screen and (max-width: 600px) {
  .data-item {
    margin-right: 0px;
  }

  .div-flex {
    display: block;
  }
}
</style>
