import ExchangeStoreBase from "../ExchangeStoreBase";

export default class AssetStore extends ExchangeStoreBase {
  constructor() {
    super("asset", "general");
    this.state = {
      // 交易对手续费
      pairFees: [
        // {
        //   id: 0,
        //   name: "ETH/BTC",
        //   maker: 0.12,
        //   taker: 0.11
        // },
      ],
      // 总资产
      totalAsset: {
        valuationBTC: 0, //总资产
        valuationEN: 0, //换算美元
        valuationCN: 0, //换算人民币
        totalQuota: 0, //24小时提现额度
        availableQuota: 0, //可用额度
        usedQuota: 0 //已用额度
      },
      wallet: [],
      //币种列表
      walletList: {},
      // 获取单个币种资产及提现额度
      currencyAmount: {
        coinName: "BTC",
        availableCount: 0, //可用额度
        totalCount: 0, //总额度
        frozenCount: 0, //冻结额度
        totalQuota: 0, //24H提现额度
        availableQuota: 0, //可用提现额度
        usedQuota: 0 //已用额度
      },
      //提币信息
      walletExtract: {
        minerFee: 0, //矿工费
        extractAddr: [] //提现地址
      },
      //充币地址
      coinAddress: {
        // coinId: 0, //币种ID
        // verifyNumer: 5, //最大确认数
        // coinAddress: "asdfdeagds0gfhgdfjhgfjkgfhkjgsgdsfg" //地址
      },
      //充币记录
      // chargeHistory: {},
      //提币记录
      // extractHistory: {},
      //资产记录
      assetHistory: {
        total: 0,
        orderList: []
      }
    };
    // websocket监听用户资产更新推送
    this.WebSocket.general.on("userAssetUpdate", data => {
      let { valuationBTC, valuationEN, valuationCN, coinList } = data;
      this.state.totalAsset.valuationBTC = valuationBTC; //总资产
      this.state.totalAsset.valuationEN = valuationEN; //换算美元
      this.state.totalAsset.valuationCN = valuationCN; //换算人民币
      this.state.wallet = coinList;
      this.controller.userAssetUpdate(data);
      // this.recommendData = data.data
    });
  }
  setController(ctrl) {
    this.controller = ctrl;
  }
  // 获取交易对手续费
  async getFee() {
    let result = await this.Proxy.getFee({
      token: this.controller.token
    })
    result && result.length ? (result = result.map(v=>{
     return {
       id: v.id,
       na: v.name,
       t: v.taker,
       m: v.maker
     }
    })) : (result = [])
    // console.log('getFee')
    // console.log(result)
    this.state.pairFees = result;
    return result;
  }
  // 获取我的QBT
  async getMyQbt() {
    // console.log(this.controller.token);
    let result = await this.Proxy.getMyQbt({
      token: this.controller.token
    });
    if (result && result.id) {
      return {
        availableCount: result.aw,
        price: result.p,
        coinIcon: "",
        coinId: '',
        coinName: "QBT",
        fullName: "QBT",
        valuationCN: result.vl,
      };
    }
    return false;
  }

  // 获取总资产
  async getTotalAsset() {
    let {
      va,
      vae,
      vac,
      cl
    } = await this.Proxy.totalAsset({
      // userId: this.controller.userId,
      token: this.controller.token
    });
    this.state.wallet = cl && cl.map(({cn,fn,cic,cid,avc,frc,va,tc})=>{
      return {
        "coinName": cn,
        "fullname": fn,
        "coinIcon": cic,//币种icon
        "coinId": cid,
        "availableCount": avc,//可用余额
        "frozenCount": frc,//冻结余额
        "valuationBTC": va,//btc估值
        "totalCount": tc//总量
      }
    }) || [];
    let { toq, avq, usq } = await this.Proxy.balance({
      // userId: this.controller.userId,
      // coinId: this.state.walletList["BTC"],
      // coinName: "btc",
      id: 0,
      token: this.controller.token
    });
    this.state.totalAsset = {
      valuationBTC: va, //总资产
      valuationEN: vae, //换算美元
      valuationCN: vac, //换算人民币
      totalQuota: toq, //24小时提现额度
      availableQuota: avq, //可用额度
      usedQuota: usq //已用额度
    };
  }
  // 获取walletList
  async getWalletList() {
    let result = await this.Proxy.getAllCoinList();
    if (result && result.list && result.list.length) {
      let obj = {};
      this.controller.sort(result.list, ["n"], 1).forEach(v => {
        obj[v.n.toUpperCase()] = v.id;
      });
      this.state.walletList = obj;
    }
  }

  // 获取单个币种资产信息
  async getCurrencyAmount(coin) {
    let obj = {
      // userId: this.controller.userId,
      id: this.state.walletList[coin],
      // coinName: coin.toLowerCase(),
      token: this.controller.token
    };
    let result = await this.Proxy.balance(obj);
    if (result && result.errCode) {
      return result;
    }
    result = {
      "availableCount": result.avc,//当前币种可用余额
      "totalCount": result.toc,//当前币种总余额
      "frozenCount": result.frc,//当前币种冻结额度
      "totalQuota": result.toq,//24H提现额度
      "availableQuota": result.avq,//可用提现额度
      "usedQuota": result.usq
    }
    this.state.currencyAmount = result;
    return result;
  }

  // 获取充币地址
  async getChargeAddress(coin) {
    let result = await this.Proxy.chargeAddress({
      // userId: this.controller.userId,
      id: this.state.walletList[coin],
      token: this.controller.token
    });
    result.coinAddress
      ? (this.state.coinAddress = {
        coinId: result.id, //币种ID
        verifyNumer: result.ven, //最大确认数
        coinAddress: result.cad //地址
      })
      : (this.state.coinAddress = {
          coinId: this.state.walletList[coin], //币种ID
          verifyNumer: "", //最大确认数
          coinAddress: "" //地址
        });
  }
  // 清空充提记录
  initHistory(){
    this.state.assetHistory.orderList = [];
    this.state.assetHistory.total = 0;
  }

  // 获取资产记录
  async getHistory({coinId, coinName, orderType, startTime, endTime, orderStatus, page, pageSize}) {
    let result = await this.Proxy.history(
      Object.assign(
        {
          // userId: this.controller.userId,
          token: this.controller.token,
          "id": coinId,//如果不设定 传-1 coin id
          "na": coinName,//coin name
          "ot": orderType,//充1提2转4  注意:交易所内提币收方显示为转账  所有状态传-1，如果需要两种状态则将需要的状态相与（|） //order type
          "st": startTime,//不设定传-1 都传Unix秒 start time
          "et": endTime,//不设定传-1 都传Unix秒 end time
          "ost": orderStatus, //所有状态传-1 //order status
          "p": page, //page
          "s": pageSize //page size
        }
      )
    );
    if (result && result.errCode) {
      this.state.assetHistory.orderList = [];
      this.state.assetHistory.total = 0;
      return this.state.assetHistory;
    }
    this.state.assetHistory.orderList =
      result &&
      result.ol.map(v => {
        return {
          "orderType": v.ot === 15000 ? 2 : (v.ot === 5 ? 4 : v.ot),
          "orderStatus": v.ost,
          "fullname": v.fna,
          "coinIcon": v.cic,
          "coinName": v.cna,
          "coinId": v.cid,
          "count": v.cou,
          "balance": b.bal,//余额
          "postAddress": v.psa,//发送地址
          "receiveAddress": v.rea,//接收地址
          "fee": v.fee,//手续费
          "verifyCount": v.vc,//确认数
          "doneCount": v.dc,//已确认数
          "hashAddress": v.ha,//hash地址
          "blockSite": v.bs,//点击查看交易信息的地址
          "orderTime":v.t,
          "orderId": v.oid
        }
      });
    obj.page === 0 && !result.tc && (this.state.assetHistory.total = 0);
    obj.page === 0 &&
      result.tc &&
      (this.state.assetHistory.total = result.tc);
    return this.state.assetHistory;
  }
  // 导出资产记录
  async exportHistory() {
    let result = await this.Proxy.history({
      userId: this.controller.userId,
      token: this.controller.token,
      coinId: -1, //如果不设定 传-1
      coinName: -1,
      orderType: -1, //充1提2转4  注意:交易所内提币收方显示为转账  所有状态传-1，如果需要两种状态则将需要的状态相与（|）
      startTime: -1, //不设定传-1 都传Unix秒
      endTime: -1, //不设定传-1 都传Unix秒
      orderStatus: -1, //所有状态传-1
      page: 0,
      pageSize: 0
    });
    if (result && result.errCode) {
      return [];
    }
    return result.orderList;
  }
  // 获取矿工费
  async getMinerFee(coin, address) {
    let result = await this.Proxy.minerFee({
      coinId: this.state.walletList[coin],
      coinAddr: address,
      token: this.controller.token
    });
    this.state.walletExtract.minerFee = result.minerFee;
  }
  // 获取提币地址信息
  async getwalletExtract() {
    if (this.state.walletExtract.extractAddr.length) return;
    let result = await this.Proxy.extractAddress({
      userId: this.controller.userId,
      token: this.controller.token
    });
    if (result && result.errCode) {
      // console.log(result);
      return result;
    }
    this.state.walletExtract.extractAddr = result.addresses;
  }

  // 提交提币订单
  async extractOrder(obj) {
    obj.fundPass = this.controller.RSAencrypt(obj.fundPass);
    let result = await this.Proxy.extractOrder(
      Object.assign(obj, {
        userId: this.controller.userId,
        token: this.controller.token,
        coinId: this.state.walletList[obj.coinName],
        coinName: obj.coinName.toLowerCase(),
        os: 3
      })
    );
    return result;
  }
  // 撤销提币申请
  async cancelOrder(id) {
    let result = await this.Proxy.cancelWithdraw({
      userId: this.controller.userId,
      token: this.controller.token,
      applyId: id
    });
    if (result === null) {
      this.state.assetHistory.orderList.forEach(v => {
        if (v.orderId === id) v.orderStatus = 3;
      });
      return this.state.assetHistory;
    }
    return result;
  }
  // 增加提现地址
  async appendAddress({ coinName, addressName, address }) {
    let result = await this.Proxy.addAddress({
      userId: this.controller.userId,
      coinId: this.state.walletList[coinName],
      coinName: coinName.toLowerCase(),
      addressName: addressName,
      address: address,
      token: this.controller.token
    });
    if (result && result.errCode) {
      return result;
    }

    this.state.walletExtract.extractAddr.forEach(v => {
      v.coinId === this.state.walletList[coinName] &&
        v.addressList.push({
          addressName: addressName,
          address: address,
          addressId: result.addressId
        });
    });
    return this.state.walletExtract;
  }

  // 删除提现地址
  async deletAddress({ coinName, addressId, addressName, address }) {
    // console.log(coinName, addressId, addressName, address);
    let result = await this.Proxy.delAddress({
      userId: this.controller.userId,
      coinId: this.state.walletList[coinName],
      coinName: coinName.toLowerCase(),
      addressId: addressId,
      addressName: addressName,
      address: address,
      token: this.controller.token
    });
    if (result && result.errCode) {
      return result;
    }
    this.state.walletExtract.extractAddr.forEach(v => {
      v.coinId === this.state.walletList[coinName] &&
        (v.addressList = v.addressList.filter(
          item => item.address !== address
        ));
    });
    return this.state.walletExtract;
    // this.state.walletExtract.extractAddr = this.state.walletExtract.extractAddr.filter(
    //   item => item.address !== address
    // );
  }
  // 验证资金密码
  async verifyPass(fundPass) {
    // console.log(this.controller.RSAencrypt(fundPass));
    let result = await this.Proxy.verifyFundPass({
      userId: this.controller.userId,
      token: this.controller.token,
      fundPass: this.controller.RSAencrypt(fundPass)
    });
    return result;
  }
}
