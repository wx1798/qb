import React from 'react';
import exchangeViewBase from '../../../components/ExchangeViewBase';
import {NavLink} from 'react-router-dom';

import OrderItem from './OrderItem.jsx';
import SelectButton from "../../../common/component/SelectButton"

export default class OrderCurrent extends exchangeViewBase{
  constructor(props){
    super(props);
    this.state = {
      idArray: [],  // 交易对
      orderType: 2, // 订单状态
      filterShow: false,
      viewIndex: 0,
      orderId: undefined,
      pairIdMsg : {},
      coinSelect: this.intl.get('all'),     // SelectButton选中币种
      marketSelect: this.intl.get('all'),   // SelectButton选中市场
      coinArray: [],    // SelectButton币种数组
      marketArray: [],  // SelectButton市场数组
      hideOther: 0,     // SelectButton隐藏
      hideZero: false,
    };
    const {controller} = props;
    console.log('订单', controller)
    controller.setView(this);
    this.state = Object.assign(this.state, controller.initState);
    this.getOrderList = this.getOrderList.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.choiceReset = this.choiceReset.bind(this);
    this.choiceEnsure = this.choiceEnsure.bind(this);
    this.addContent = controller.headerController.addContent.bind(controller.headerController) // 获取头部内容
  }
  componentWillMount(){
    this.getOrderList();
  }
  componentDidMount(){
    this.addContent({con: this.intl.get("header-order"), filter: true, selectFn: this.changeFilter})
    const {pairIdMsg} = this.props;
    let coinArray = pairIdMsg.pairIdCoin && Object.keys(pairIdMsg.pairIdCoin);
    let marketArray = pairIdMsg.pairIdMarket && Object.keys(pairIdMsg.pairIdMarket);
    marketArray && marketArray.unshift(this.intl.get('all'));
    coinArray && coinArray.unshift(this.intl.get('all'));
    this.setState({
      coinArray,
      marketArray
    })
  }

  // 获取当前订单数据
  getOrderList() {
    const {controller} = this.props;
    const params = {
      idArray: this.state.idArray,
      orderType: this.state.orderType,
    }
    controller.getCurrentOrder(true, params)
  }
  // 撤销订单
  cancelOrder(index) {
    let v = this.state.orderListArray[index];
    // orderId = JSON.parse(JSON.stringify(v.orderId));
    let orderId, opType, dealType,tradePairId;
    orderId = v.orderId;
    opType = 0;
    dealType =v.orderType;
    tradePairId = v.tradePairId;
    this.props.controller.cancelOrder(orderId, opType, dealType, tradePairId)
  }

  // 筛选项的显示与关闭
  changeFilter() {
    if (this.state.filterShow) {
      this.setState({filterShow: false});
    } else {
      this.setState({filterShow: true});
    }
  }
  // 筛选项重置
  choiceReset() {
    this.setState({
      idArray: [],
      orderType: 2,
      coinSelect: this.intl.get('all'),
      marketSelect: this.intl.get('all'),
    });
  }
  // 根据筛选项筛选列表
  choiceEnsure() {
    this.setState({filterShow: false});
    this.getOrderList();
  }
  // 选择币种
  changeCoin(e) {
    const {pairIdMsg} = this.props;
    let marketArray = [];
    if(e === this.state.coinSelect){
      return
    }
    let coinValue = (e === this.intl.get('all')) ? '' : e;
    let marketValue = (this.state.marketSelect === this.intl.get('all')) ? '' : this.state.marketSelect;
    let idArray = [];
    let hideOther = 1;
    if (coinValue) {
      marketArray = pairIdMsg.pairNameCoin[coinValue.toLowerCase()];
      // marketArray.unshift(this.intl.get('all'));
      marketValue && (idArray.push(pairIdMsg.pairIdCoin[coinValue.toLowerCase()][marketValue.toLowerCase()])) || (idArray = Object.values(pairIdMsg.pairIdCoin[coinValue.toLowerCase()]));
    }
    else {
      marketValue && (idArray = Object.values(pairIdMsg.pairIdMarket[marketValue.toLowerCase()])) || (idArray = []);
    // && (marketArray = pairIdMsg.pairNameMarket[marketValue])
      marketArray = Object.keys(pairIdMsg.pairIdMarket)
      coinValue = this.intl.get('all');
    }
    marketArray.indexOf(this.intl.get('all')) === -1 && marketArray.unshift(this.intl.get('all'));
    this.setState(
        {
          marketArray,
          idArray,
          coinSelect: coinValue,
          hideOther
        }
    )
  }

  changeMarket(e) {
    const {pairIdMsg} = this.props;
    let coinArray = [];
    if(e === this.state.marketSelect){
      return
    }
    let marketValue = (e === this.intl.get('all')) ? '' : e;
    let coinValue = (this.state.coinSelect === this.intl.get('all')) ? '' : this.state.coinSelect;
    let idArray = [];
    let hideOther = 1;
    if (marketValue) {
      coinArray = pairIdMsg.pairNameMarket[marketValue.toLowerCase()];
      coinValue && (idArray.push(pairIdMsg.pairIdMarket[marketValue.toLowerCase()][coinValue.toLowerCase()])) || (idArray = Object.values(pairIdMsg.pairIdMarket && pairIdMsg.pairIdMarket[marketValue.toLowerCase()]));
    }
    else {
    // && (idArray = Object.values(pairIdMsg.pairIdCoin[coinValue]))
      coinValue  && (coinArray = pairIdMsg.pairNameCoin[coinValue.toLowerCase()]) || (idArray = []);
      coinArray = pairIdMsg.pairIdCoin && Object.keys(pairIdMsg.pairIdCoin)
      marketValue = this.intl.get('all')
    }
    coinArray.indexOf(this.intl.get('all')) === -1 && coinArray.unshift(this.intl.get('all'));
    this.setState(
        {
          coinArray,
          idArray,
          marketSelect: marketValue,
          hideOther
        }
    )
  }
  render(){
    return (
      <div className='order-current'>
        <div className='order-switch'>
        <NavLink to='/order/current'>{this.intl.get('order-current')}</NavLink>
          <NavLink to='/order/history'>{this.intl.get('order-history')}</NavLink>
        </div>
        {/* <div className="order-current-hide">
          <span className={this.state.hideZero ? "toggle-btn active" : "toggle-btn"}
            onClick={()=>{
              this.setState({hideZero:!this.state.hideZero});
            }}><i/></span>
          <span className="hide-pair">隐藏其他交易对</span>
        </div> */}
        {this.state.filterShow && 
        <div className='order-current-filter'>
          <div className="filter-container">
            <h1>{this.intl.get("pair")}</h1>
            <div className="choose-section">
              <SelectButton
                title={this.state.coinSelect.toUpperCase()}
                type="main"
                className="select"
                onSelect={(e) => this.changeCoin(e)}
                valueArr={this.state.coinArray && this.state.coinArray.map(v=>v.toUpperCase())}
              />
              <em>——</em>
              <SelectButton
                title={this.state.marketSelect.toUpperCase()}
                type="main"
                className="select"
                onSelect={(e) => this.changeMarket(e)}
                valueArr={this.state.marketArray && this.state.marketArray.map(v=>v.toUpperCase())}
              />
            </div>
            <h1>{this.intl.get("type")}</h1>
            <div className="choose-section">
              <button className={`${this.state.orderType === 0 && "chosen"} choose-button`} onClick={() => {this.setState({orderType : 0})}}>{this.intl.get("buy")}</button>
              <button className={`${this.state.orderType === 1 && "chosen"} choose-button`} onClick={() => {this.setState({orderType : 1})}}>{this.intl.get("sell")}</button>
            </div>
          </div>
          <div className="filter-operate">
            <button onClick={this.choiceReset}>{this.intl.get("reset")}</button>
            <button onClick={this.choiceEnsure}>{this.intl.get("ok")}</button>
          </div>
        </div>
        }
        <div className="order-current-list">
          {this.state.orderListArray.map((order, index) => {
            return (
              <OrderItem type="current" index={index} key={index} orderInfo={order} cancelOrder={this.cancelOrder} controller={this.props.controller}/>
            )
          })}
        </div>
      </div>
    );
  }
}