import ExchangeViewBase from '../../../components/ExchangeViewBase'
import React, { Component } from "react";

export default class HomeMarket extends ExchangeViewBase{
  constructor(props){
    super(props);
    this.state = {};
    const {controller} = this.props;
    //绑定view
    controller.setView(this);
    //初始化数据，数据来源即store里面的state
    this.state = Object.assign(this.state, controller.initState);
    //绑定方法
    this.marketDataHandle = controller.marketDataHandle.bind(controller);
    this.changeMarket = controller.changeMarket.bind(controller); // 点击其他市场
    this.collectMarket = controller.collectMarket.bind(controller);// 点击收藏
    this.addCollect = controller.addCollect.bind(controller); // 添加收藏
    this.joinHome = controller.joinHome.bind(controller);
  }
  componentDidMount(){
    //注册http数据
    this.marketDataHandle();
    //进入home
    this.joinHome();
  }

  render(){
    const {controller} = this.props;
    let marketData = this.state.marketDataHandle;     //市场列表
    let marketPair = this.state.homeMarketPairData;  //交易对
    return(
      <div className="market">
        <ul>
            {controller.token && <li onClick={this.collectMarket}
                                     className={this.state.collectActive ? "active" : ""}>
              <span>{this.intl.get('market-favorites')}</span>
            </li>}
            {marketData && marketData.map((v, index) => {
              return(<li key={index}
                         onClick={this.changeMarket.bind(this,v)}
                         className={this.state.market.toUpperCase() === v.toUpperCase() ? "active" : ""}>
                    <span>{v.toUpperCase()}</span>
                </li>
            )})}
          </ul>
        <div className="market-list">
            <table>
                <thead align="left">
                <tr>
                    <th style={{width:"40%"}}>{this.intl.get("market-market")}</th>
                    <th>{this.intl.get("market-lastPrice")}</th>
                    <th style={{width:"20%"}}>{this.intl.get("market-change")}</th>
                </tr>
                </thead>
                <tbody>
                {marketPair && marketPair.map((v, index) => {
                    return(
                        <tr key={index}>
                            <td onClick={e => this.addCollect(v, index, e)} className="td1">
                                {controller.token && <img src={v.isFavorite ? "/static/mobile/home/icon_sc_pre@2x.png" : "/static/mobile/home/icon_sc@2x.png"}/>}
                                <h3>
                                    {v.coinName.toUpperCase()}
                                    <small>/{v.marketName.toUpperCase()}</small>
                                </h3>
                                <span>{this.intl.get("market-volume")} {Number(v.volume) && Number(v.volume).formatFixNumberForAmount(v.price_to_cny) || 0}</span>
                            </td>
                            <td className="td2">
                                <b>{Number(v.price).format({number:'digital'}) || 0}</b>
                                <span>{controller.language === 'zh-CN' ?
                                    Number(v.priceCN || 0).format({number:'legal',style:{name:'cny'}}) :
                                    Number(v.priceEN || 0).format({number:'legal',style:{name:'usd'}})}</span>
                            </td>
                            <td className="td3">
                                <a className={v.rise < 0 ? "down" : "up"}>{Number(v.rise).toPercent()}</a>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
      </div>
    )
  }
}