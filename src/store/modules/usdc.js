import ContractJson from "../../contracts/ERC20Mock.json";
import addresses from "../../contracts/addresses.json";

const ContractName = "USDC";

const state = {
  abi: null,
  address: null,
  contract: null,
  decimals: 6,
  fundAllowance: 0, // liquidity pool contract USDC allowance for current user
  permit: true, // does this token have the permit() method?
  userBalance: null
};

const getters = {
  getFundUsdcAllowance(state) {
    return state.fundAllowance;
  },
  getUsdcDecimals(state) {
    return state.decimals;
  },
  getUsdcAbi(state) {
    return state.abi;
  },
  getUsdcAddress(state) {
    return state.address;
  },
  getUsdcContract(state) {
    return state.contract;
  },
  getUserUsdcBalance(state) {
    return state.userBalance;
  },
  usesPermitUsdc(state) {
    return state.permit;
  }
};

const actions = {
  async fetchContract({ commit, rootState }) {
    let web3 = rootState.accounts.web3;
    let chainIdDec = parseInt(rootState.accounts.chainId);
    let address = addresses[ContractName][chainIdDec];
    let contract = new web3.eth.Contract(ContractJson.abi, address);
    commit("setContract", contract);
  },
  async fetchFundAllowance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let userAddress = rootState.accounts.activeAccount;
    let fundAddress = rootState.fund.selectedFundAddress;

    let allowanceWei = await state.contract.methods.allowance(userAddress, fundAddress).call();

    let web3 = rootState.accounts.web3;
    let allowance = web3.utils.fromWei(allowanceWei, "mwei");

    commit("setFundAllowance", allowance);
  },
  async fetchUserBalance({ commit, dispatch, state, rootState }) {
    if (!state.contract) {
      dispatch("fetchContract");
    }

    let address = rootState.accounts.activeAccount;
    let balanceWei = await state.contract.methods.balanceOf(address).call();

    let web3 = rootState.accounts.web3;
    let balance = web3.utils.fromWei(balanceWei, "mwei"); // mwei because USDC has 6 decimals

    commit("setUserBalance", balance);
  },
  storeAbi({commit}) {
    commit("setAbi", ContractJson.abi);
  },
  storeAddress({ commit, rootState }) {
    let chainIdDec = parseInt(rootState.accounts.chainId);
    commit("setAddress", addresses[ContractName][chainIdDec]);
  }
};

const mutations = {
  setAbi(state, abi) {
    state.abi = abi;
  },
  setAddress(state, address) {
    state.address = address;
  },
  setContract(state, _contract) {
    state.contract = _contract;
  },
  setFundAllowance(state, allowance) {
    state.fundAllowance = allowance;
  },
  setUserBalance(state, balance) {
    state.userBalance = balance;
  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
};
