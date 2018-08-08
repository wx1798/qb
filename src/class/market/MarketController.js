import ExchangeControllerBase from '../ExchangeControllerBase'
import MarketStore from './MarketStore'

export default class MarketController extends ExchangeControllerBase {
  constructor(name) {
    super('market');
    this.store = new MarketStore(name);
    this.store.setController(this)
  }

  setView(view) {
    super.setView(view);
  }

// 获取币种资料
  async getCoinInfo(coinId) {
    await this.store.getCoinInfo(coinId);
    this.view.setState({coinInfo: this.store.state.coinInfo});
  }
  async getQb(){
    await this.store.getQb();
    return this.store.state.qb;
  }
  async getMarket() {
    await this.store.getMarket();
  }

  //获取getRecommendCoins
  async getRecommendCoins() {
    let recommendData = await this.store.getRecommendCoins()
    recommendData.length = 5
    this.view.setState({
      recommendData
    })
  }

  // 切换市场
  async changeMarket(v) {
    // console.log('changeMarket', v)
    this.store.setSelecedMarket(v);
    this.store.setSort(['turnover'], 0);
    let homeMarketPairData = await this.store.selectMarketData();
    homeMarketPairData = this.sort(homeMarketPairData, this.store.sortValue, this.store.ascending)
    this.view.setState({
      // searchValue: '',
      sortIndex: 0,
      sortImg: this.view.$imagesMap.$rank_normal,
      searchRealt: [],
      collectActive: false,
      market: v,
      // unitsType: '',
      homeMarketPairData
    });
    // if(this.view.state.query) {
    //   console.log('this.view.state.query', this.view.state.query)
    //   let queryValue = homeMarketPairData.find(v => v.tradePairName === this.view.state.query)
    //   let priceLimitValue = queryValue.priceAccuracy;
    //   let volumeLimitValue = queryValue.volumeAccuracy;
    //   this.querySelectPair(this.view.state.query,priceLimitValue,volumeLimitValue)
    //   this.tradePairChange(homeMarketPairData[0]);
    //   return
    // }
    // console.log('homeMarketPairData',homeMarketPairData)
   
    // console.log('市场2', this.view.state, v, this.store.state.tradePair, this.store.state.PriceUnit, this.view.state.PriceUnit,)
  }

  // 点击收藏区

  collectMarket() {
    let homeMarketPairData = this.getCollectArr()
    // homeMarketPairData = this.sort(homeMarketPairData, this.store.sortValue, this.store.ascending)
    this.store.setSelecedMarket('收藏区');
    this.store.setHomeMarketPairData(homeMarketPairData);
    this.store.setSort([], 0)
    this.view.setState({
      // searchValue: '',
      sortIndex: 0,
      sortImg: this.view.$imagesMap.$rank_normal,
      searchRealt: [],
      collectActive: true,
      market: '',
      homeMarketPairData
    });
    // if(!homeMarketPairData.length){
    //   return
    // }
    
    // this.tradePairChange(homeMarketPairData[0]);
  }

  // 添加/取消收藏
  async addCollect(v, index, e) {
    e.preventDefault();
    e.stopPropagation();
    await this.store.changeFavorite(v.tradePairId, this.userController.userId, v.isFavorite, this.userController.userToken)
  }

  get language() {
    // console.log('this.configController', this.configController)
    return this.configController && this.configController.language
  }

  get token() {
    // console.log('this.userController', this.userController)
    return this.userController.userToken
  }

  clearHistory(){
    this.store.clearHistory()
  }

  // 市场下交易对
  async marketDataHandle() {
    //更新全部交易对信息
    await this.getTradePairHandle()
    //生成市场列表
    let homeMarket = [...new Set(this.store.pairInfo.map(v => v.marketName))].sort()
    //默认设置为第一市场
    this.store.setSelecedMarket(homeMarket[0])
    this.store.setMarketDataHandle(homeMarket)
    //生成交易对池
    this.store.setAllPair(this.store.pairInfo.map(v => Object.assign(v, {
      rise: 0,
      price: 0,
      priceCN: 0,
      priceEN: 0,
      volume: 0,
      isFavorite: 0,
      turnover: 0,
      points: [],
      coinName: v.tradePairName.split('/')[0]
    })))
    //更新交易对池，只在第一次打开时，发送http请求更新
    let marketAll = await this.store.getMarketAll()
    this.store.updateAllPairListFromData(marketAll, 0)
    //请求收藏列表
    let collectIdArr = []
    if (this.userController.userToken) {
      collectIdArr = await this.store.getFavoriteList(this.userController.userToken)
    }
    this.store.updateAllPairListFromCollect(collectIdArr)
    //请求汇率接口
    let bankArray = await this.store.getBank();
    this.store.updateAllPairListFromBank(bankArray)
    //更新视图层
    this.updateMarketAll([], 3)
    
  
  }

  //更新MarketAll数据
  async updateMarketAll(List, type) {
    let arr = ['updateAllPairListFromCollect', 'updateAllPairListFromData', 'updateAllPairListFromBank'], selectPair = null, market = null;
    //根据数据更新allPair
    type < 3 && this.store[arr[type]](List)
    if(this.view.state.query && type === 3) {
      let queryValue = this.view.state.query;
      if(queryValue.split('/').length === 1){
        if(this.store.marketDataHandle.indexOf(queryValue) !== -1) {
          market = queryValue
        } else {
          let pairMsg = await this.store.getPairMsg()
          market = pairMsg.pairNameCoin[queryValue].sort((a,b)=>a>b)[0]
          selectPair = `${queryValue}/${market}`
        }
      } else {
        selectPair = queryValue
        market = queryValue.split('/')[1]
      }
    }
    console.log(market,this.view.state.query)
    market && this.store.setSelecedMarket(market);
    //根据市场从交易对池中选择该市场中的交易对
    let homeMarketPairData = await this.store.selectMarketData();
    homeMarketPairData = this.sort(homeMarketPairData, this.store.sortValue, this.store.ascending)
    console.log('homeMarketPairData', homeMarketPairData, this.store.state.tradePair, selectPair);
    type > 2 && (this.store.state.tradePair = selectPair || homeMarketPairData[0].tradePairName);
    this.view.setState({
      homeMarketPairData, market : this.store.selecedMarket, marketDataHandle: this.store.marketDataHandle
    }, () => this.view.name === 'tradeMarket' && type > 0 && this.setDealMsg(type));
    // console.log('type', type);
    (type === 3 )  && this.view.name === 'tradeMarket' && this.tradePairChange(homeMarketPairData.find(v=>v.tradePairName===this.store.state.tradePair));
  }

  //更新recommend数据
  updateRecommend(data) {
    this.store.updateRecListFromData(data)
    this.getRecommendCoins()
  }

  //交易对的选中
  tradePairChange(value) {
    console.log('tradePairChange', value)
    if(!value){
      return
    }
    this.view.setState({
      tradePair: value.tradePairName,
      tradePairId: value.tradePairId
    });
    this.store.state.tradePair = value.tradePairName;
    this.store.state.tradePairId = value.tradePairId;
    this.store.state.volumeAccuracy = value.volumeAccuracy;
    this.store.state.priceAccuracy = value.priceAccuracy;
    this.TradeRecentController && this.TradeRecentController.setTradePairId(value.tradePairId, value.tradePairName) ;
    this.TradeRecentController && this.TradeRecentController.setAccuracy(value.priceAccuracy, value.volumeAccuracy);
    this.TradeOrderListController && this.TradeOrderListController.setAccuracy(value.priceAccuracy, value.volumeAccuracy);
    this.userOrderController && this.userOrderController.setAccuracy(value.priceAccuracy, value.volumeAccuracy);
    this.TradePlanController && this.TradePlanController.setAccuracy(value.priceAccuracy, value.volumeAccuracy);
    this.TradeOrderListController && this.TradeOrderListController.joinRoom(value.tradePairName);
    this.TradeOrderListController && this.TradeOrderListController.setChangeFlag();
    this.userOrderController && this.userOrderController.changeTradePairId(value.tradePairId);
    this.assetController && this.assetController.setSimpleAsset({tradePairId: value.tradePairId});
    this.klineController && this.klineController.setPair(value.tradePairName.split("/")[0], value.tradePairName);
    this.TradePlanController && this.TradePlanController.setPriceFlag();
    this.setDealMsg(true);
  }

  clearRoom(){
    this.store.clearRoom()
  }

  get tradePair() {
    return {
      tradePairId: this.store.state.tradePairId,
      tradePairName: this.store.state.tradePair
    }
  }


  //排序功能
  pairSort(v, index) { // type 1 升序 0 降序
    let imgArr = [this.view.$imagesMap.$rank_down, this.view.$imagesMap.$rank_up],
      tradeSortImg = ["/static/img/trade_rank_shang.svg", "/static/img/trade_rank_xia.svg"],
      sortArray = this.store.state.homeMarketPairData;
    let sortValue = v.sortValue;
    if((this.store.state.unitsType === 'CNY' || this.store.state.unitsType === 'USD') && sortValue[0] === 'price'){
      sortValue = [`price${this.store.state.unitsType}`]
    }
    this.store.setSort(sortValue, v.type)
    v.type = v.type === false ? 0 : 1
    v.sortValue && this.view.setState({
      homeMarketPairData: this.sort(sortArray, this.store.state.sortValue, v.type),
      sortImg: imgArr[v.type],
      sortIndex: index,
      tradeSortImg: tradeSortImg[v.type]
    });
    v.type = !v.type
  }

  // 筛选功能
  filte(arr, value) {
    let result = this.filter(arr, item => item.coinName.toUpperCase().includes(value.toUpperCase()));
    return result;
  }

  // 点击收藏筛选数组
  getCollectArr() {
    return this.store.collectData
  }

  joinHome() {
    this.store.joinHome()
  }


  //为交易模块提供价格以及交易对的信息
  setDealMsg(flag = false) {
    if(!this.store.state.tradePair)
      return
    //改变deal模块中的信息
    let tradePairMsg = this.store.state.allPairData.filter(v => v.tradePairName === this.store.state.tradePair);
    let dealMsg = {
        tradePair: this.store.state.tradePair,
        coinIcon: tradePairMsg[0].coinIcon,
        prices: {
          price: tradePairMsg[0].price,
          priceCN: tradePairMsg[0].priceCN,
          priceEN: tradePairMsg[0].priceEN,
        },
        priceAccuracy: tradePairMsg[0].priceAccuracy,
        volumeAccuracy: tradePairMsg[0].volumeAccuracy,
        updown: tradePairMsg[0].updown
      };
    this.TradeDealController && this.TradeDealController.setPairMsg(dealMsg);
    this.TradePlanController && this.TradeOrderListController  && flag !== 1 &&  this.TradePlanController.tradePairHandle(this.store.state.tradePair, dealMsg.prices,flag) && this.TradePlanController.coinMinTradeHandle();
    this.TradePlanController && this.TradeOrderListController  && this.TradePlanController.setMarketPriceMaxNum(dealMsg.prices)
    this.TradeOrderListController && this.TradeOrderListController.getNewPrice(dealMsg,flag)
    this.TradeRecentController && flag !== 1 && this.TradeRecentController.setBank(dealMsg.prices)
  }

  setUnitsType(v) {
    this.view.setState({
      unitsType: v
    });
    this.store.state.unitsType = v
  }

  pairDataHandle() {

  }

  // 交易对名称以及id的处理
  async getTradePairHandle() {
    return await this.store.getPairMsg();
  }
  // 跳转选取交易对,location.query
  async querySelectPair(data, priceAccuracy, volumeAccuracy){
    let pairMsg = await this.getTradePairHandle();
    let pairItems = data.split('/'),id;
    if(pairItems.length > 1){
      id = pairMsg.pairIdCoin[pairItems[0]][pairItems[1]];
      this.tradePairChange({tradePairId:id,tradePairName:data,priceAccuracy,volumeAccuracy});
    }

  }
  async getBank(){
    await this.store.getBank()
  }
  // async bankHandle(market){
  //   let bankValue = await this.store.getBank();
  //   let bankValueItems = bankValue.find(v => v.na === market);
  //   let initBank = {
  //     bankCN : bankValueItems.cr,
  //     bankEN : bankValueItems.ur
  //   };
  //   this.store.state.initBank = initBank;
  //   console.log('bankkkkkkkkk', this.store.state.initBank)
  // }
  // setBank(){
  //   let bank = this.store.state.initBank
  // }
}