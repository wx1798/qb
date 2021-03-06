import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import exchangeViewBase from "../../ExchangeViewBase";
import Button from "../../../common/component/Button";
import Input from "../../../common/component/Input";
import Pagination from "../../../common/component/Pagination";
import SearchInput from "../components/SearchInput";
import ToTrade from "../components/ToTrade";
import TwoVerifyPopup from "../../viewsPopup/TwoVerifyPopup";
import Popup from "../components/popup";
import BasePopup from "../../../common/component/Popup";
// import "../style/extract.styl";
export default class Extract extends exchangeViewBase {
  constructor(props) {
    super(props);
    // 绑定视图，初始化数据
    let { controller } = this.props;
    controller.setView(this);

    this.name = "extract";
    this.status = {
      0: this.intl.get("pending"),
      1: this.intl.get("passed"),
      2: this.intl.get("failed"),
      3: this.intl.get("cancel"),
      4: this.intl.get("dealing"),
      5: this.intl.get("dealing")
    };
    this.state = {
      currency: "BTC",
      value: "BTC",
      newAddress: [],//地址管理的待编辑地址
      showAddressPopup: false,
      address: {address: ''},
      extractAmount: "", //提现数量
      password: "",
      showTwoVerify: false,
      verifyType: 0, //两步验证确认后的操作 0 申请提币订单，1 添加提币地址
      firstVerify: 2,//增加提币地址时优先的二次验证类型 1 邮件，2谷歌，3短信
      verifyNum: this.intl.get("sendCode"),
      tradePair: null,
      page: 1,
      noSufficTip: false, // 余额不足提示
      quotaTip: false,
      tip: false,
      tipSuccess: true,
      tipContent: "",
      orderTip: false,
      orderTipContent: "",
      userTwoVerify: { withdrawVerify: -1, fundPwd: -1 },
      showSelect: false,
      recoGoogle: false
    };
    controller.initHistory(true);
    let {
      walletExtract,
      walletList,
      walletHandle,
      currencyAmount,
      assetHistory
    } = controller.initState;
    this.state = Object.assign(this.state, {
      walletExtract,
      walletHandle,
      walletList,
      assetHistory,
      currencyAmount
    });
    this.deal = controller.dealCoin.bind(controller);

    //绑定方法
    //获取市场下交易对
    this.getTradePair = controller.getTradePair.bind(controller);
    // 处理出币种对应的交易对数组
    this.getCoinPair = controller.getCoinPair.bind(controller);
    //获取当前币种资产信息
    this.getCurrencyAmount = controller.getCurrencyAmount.bind(controller);
    // 获取提笔最小数量和地址
    this.getExtract = controller.getExtract.bind(controller);
    // 获取矿工费
    this.getMinerFee = controller.getMinerFee.bind(controller);
    // 获取币种列表
    this.getWalletList = controller.getWalletList.bind(controller);
    // 获取提币信息
    this.getHistory = controller.getHistory.bind(controller);
    // 添加提币地址
    // this.appendAddress = controller.appendAddress.bind(controller);
    // 删除提币地址
    this.deletAddress = controller.deletAddress.bind(controller);
    // 提交提币订单前的验证
    this.beforeExtract = controller.beforeExtract.bind(controller);
    // 提交提币订单
    this.extractOrder = controller.extractOrder.bind(controller);
    // 请求验证码
    this.requestCode = controller.requestCode.bind(controller);
    // 二次验证倒计时
    this.getVerify = controller.getVerify.bind(controller);
    // 清除定时器
    this.destroy = controller.clearVerify.bind(controller);
    // 获取资金密码设置状态和两步验证方式
    this.getUserInfo = controller.getUserInfo.bind(controller);
    // 二次验证的确认操纵
    this.twoVerify = controller.twoVerify.bind(controller);

    this.hideSelect = () => {
      this.setState({ showSelect: false });
    };
    this.notSaved = () =>{
      this.setState({
        tip: true,
        tipSuccess: false,
        tipContent: this.intl.get('asset-address-notSaved')
      });
    }
    this.changeNewAddress = (value)=>{
      this.setState({newAddress: value})
    }
  }

  async componentDidMount() {
    window.addEventListener("click", this.hideSelect);
    let {walletList} = await this.getWalletList();
    let arr = this.deal(walletList, 'w');

    let query = this.props.controller.getQuery("currency").toUpperCase();
    let currency = query && (arr.includes(query) && query || 'BTC') || (this.props.location.query && this.props.location.query.currency.toUpperCase()) || "BTC";
    currency && this.setState({ currency: currency, value: currency });
    currency && this.props.controller.changeUrl(
      "currency",
      currency.toLowerCase()
    );

    let address = await this.getExtract(currency && currency);
    !address.address && this.getMinerFee(currency || this.state.currency, address);
    this.getTradePair(currency || this.state.currency);
    this.getCurrencyAmount(currency || this.state.currency);
    this.getUserInfo();
    let coin = currency || "BTC";
    this.getHistory({
      page: 0,
      pageSize: 10,
      coinId: walletList[coin.toUpperCase()],
      coinName: coin.toUpperCase(),
      orderType: 2,
      orderStatus: -1,
      startTime: -1,
      endTime: -1
    });
  }

  // componentDidMount() {
  //   window.addEventListener("click", this.hideSelect);
  // }
  componentWillUnmount() {
    window.removeEventListener("click", this.hideSelect);
  }
  componentWillUpdate(nextProps, nextState) {
    // 更换提币地址时请求矿工费(币种不变)
    if(nextState.address.address!==this.state.address.address){
      this.getMinerFee(nextState.currency, nextState.address);
      this.setState({
        extractAmount: ""
      })
    }
    // 币种未变化，地址列表发生变化时设置提币地址为列表第一项
    if (
      JSON.stringify(nextState.walletExtract) !==
      JSON.stringify(this.state.walletExtract) && nextState.currency === this.state.currency
    ) {
      let curExtract = nextState.walletExtract.extractAddr.filter(
        v => v.coinName === nextState.currency.toLowerCase()
      )[0];
      let preExtract = this.state.walletExtract.extractAddr.filter(
        v => v.coinName === this.state.currency.toLowerCase()
      )[0];
      if((curExtract && curExtract.addressList.length) === (preExtract && preExtract.addressList.length)) return;
      this.setState(
        {
          address:
            (curExtract &&
              curExtract.addressList[0] && this.props.controller.sort(curExtract.addressList, ["addressName"], 1)[0] || {address: ''}),
        }
      );
    }

    // 切换币种时的操作
    // if (nextState.currency !== this.state.currency) {
      // this.props.controller.changeUrl(
      //   "currency",
      //   nextState.currency.toLowerCase()
      // );
      // // 切换币种后，重新set address，之后根据address和currency请求矿工费
      // let curExtract = this.state.walletExtract.extractAddr.filter(
      //   v => v.coinName === nextState.currency.toLowerCase()
      // )[0];
      // this.setState(
      //   {
      //     address:
      //       (curExtract &&
      //         curExtract.addressList[0] && this.props.controller.sort(curExtract.addressList, ["addressName"], 1)[0]||{address: ''}),
      //     extractAmount: "",
      //     password: "",
      //     noSufficTip: false, // 余额不足提示
      //     quotaTip: false
      //   }
      // );
      // if(nextState.address.address===this.state.address.address) {
      //   this.getMinerFee(nextState.currency, nextState.address);
      // }
      // this.getCurrencyAmount(nextState.currency);
      // this.props.controller.initHistory();
      // this.getHistory({
      //   page: this.state.page - 1,
      //   pageSize: 10,
      //   coinId: this.state.walletList[nextState.currency],
      //   coinName: nextState.currency,
      //   orderType: 2,
      //   orderStatus: -1,
      //   startTime: -1,
      //   endTime: -1
      // });
    // }
    // if (nextState.address !== this.state.address) this.getMinerFee(nextState.currency, this.state.address);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(nextState) !== JSON.stringify(this.state)) return true;
    return false;
  }

  render() {
    let {
      totalCount,
      frozenCount,
      availableCount,
      totalQuota,
      availableQuota,
      usedQuota
    } = this.state.currencyAmount;
    let currency = this.state.currency,
      { fee, minerFee, extractAddr } = this.state.walletExtract,
      { total, orderList } = this.state.assetHistory;
    let curExtract = extractAddr.filter(
      v => v.coinName === this.state.currency.toLowerCase()
    )[0];
    return (
      <div className="extract">
        <h3>
          {this.intl.get("asset-withdraw")}-{currency}
        </h3>
        <div className="select">
          <div className="search clearfix">
            <span className="title">{this.intl.get("asset-selectCoin")}</span>
            <div className="currency-asset">
              <SearchInput
                history={this.props.history}
                filte={this.props.controller.filter}
                walletList={this.deal(this.state.walletList, 'w')}
                value={this.state.value}
                setValue={value => {
                  this.setState({ value });
                }}
                setCurrency={currency => {
                  this.setState({ currency });
                }}
                totalCount={totalCount}
                frozenCount={frozenCount}
                availableCount={availableCount}
                currency={this.state.currency}
              />
            </div>
          </div>
        </div>
        <div className="address">
          <p className="tips">
            {this.intl.getHTML("asset-minWithdraw", {
              number: curExtract && curExtract.minCount,
              currency: currency
            })}
          </p>
          <div className="currency-address clearfix">
            <span className="title">
              {currency}
              {this.intl.get("asset-withdrawAddress")}
            </span>
            <div className="content">
              <div className="select-address">
                <div
                  className="select-input"
                  onClick={e => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    this.setState({ showSelect: true });
                  }}
                >
                  <p>
                    <span>{this.state.address.addressName}</span>
                    <span />
                    <span>{this.state.address.address}</span>
                  </p>
                  {this.state.showSelect && (
                    <ul className="search-list">
                      {curExtract &&
                        this.props.controller
                          .sort(curExtract.addressList, ["addressName"], 1)
                          .map((v, i) => (
                            <li
                              key={i}
                              onClick={e => {
                                e.stopPropagation();
                                e.nativeEvent.stopImmediatePropagation();
                                this.setState({
                                  showSelect: false,
                                  address: {
                                    address: v.address,
                                    addressName: v.addressName
                                  }
                                });
                                {/* this.getMinerFee(this.state.currency, v); */}
                              }}
                            >
                              <span>{v.addressName}</span>
                              <span />
                              <span>{v.address}</span>
                            </li>
                          ))}
                    </ul>
                  )}
                </div>
              </div>
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  this.setState({ showAddressPopup: true });
                }}
              >
                {this.intl.get("asset-addAddress")}
              </a>
            </div>
          </div>
          <div className="extract-amount clearfix">
            <span className="title">
              {this.intl.get("asset-withdrawAmount")}
            </span>
            <div className="content">
              <p className="limit clearfix">
                <span className="asset-24hQuota">
                  {this.intl.get("asset-24hQuota")}：{Number(usedQuota)}/{
                    totalQuota
                  }{" "}
                  BTC
                </span>
                {totalQuota > 2 ? (
                  <span className="apply">
                    {this.intl.get("asset-limitApply")}
                  </span>
                ) : (
                  <NavLink to="/user/identity">
                    {this.intl.get("asset-limitApply")}
                  </NavLink>
                )}
                {this.state.quotaTip && (
                  <span className="min">
                    {this.intl.get("asset-minWithdraw-tip", {
                      number: curExtract && curExtract.minCount,
                      currency: currency
                    })}
                  </span>
                )}
                {this.state.noSufficTip && (
                  <span>{this.intl.get("asset-not-enough")}</span>
                )}
              </p>
              <div className="input">
                <Input
                  placeholder={this.intl.get("asset-withdrawAmount")}
                  value={this.state.extractAmount}
                  onInput={value => {
                    value = value.replace(/[^\d.]/g, "");
                    if (!/^[0-9]+\.?[0-9]{0,8}$/.test(value) && value !== "")
                      return;
                    this.setState({ extractAmount: value });
                  }}
                  onFocus={() => {
                    this.setState({
                      quotaTip: false,
                      noSufficTip: false
                    });
                  }}
                  onBlur={() => {
                    if (this.state.extractAmount === "") return;
                    if (
                      Number(this.state.extractAmount) < curExtract.minCount
                    ) {
                      this.setState({
                        quotaTip: true
                      });
                      return;
                    }
                    availableCount < Number(this.state.extractAmount) &&
                      !this.state.noSufficTip &&
                      this.setState({ noSufficTip: true });
                  }}
                />
                <a
                  onClick={() => {
                    this.setState({ extractAmount: availableCount },()=>{
                      document.querySelector('.extract .extract-amount .input input').focus()
                    });
                  }}
                >
                  {this.intl.get("asset-withdrawAvailable")}: {availableCount}
                </a>
                <span>{currency}</span>
              </div>
              <div className="fee">
                <p>
                  {this.intl.get("asset-gasFee")}：{minerFee}
                  {` ${currency}`}
                  <span>
                    {this.intl.get("asset-withdrawActual")}{" "}
                    {Number(Number(this.state.extractAmount).minus(minerFee)) >
                      0 &&
                    Number(this.state.extractAmount) <= availableCount &&
                    Number(this.state.extractAmount) >= curExtract.minCount
                      ? Number(Number(this.state.extractAmount).minus(minerFee))
                      : 0}{" "}
                    {currency}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="password clearfix">
            <span className="title">{this.intl.get("fundPass")}</span>
            <div className="content">
              <Input
                oriType="password"
                value={this.state.password}
                placeholder={this.intl.get("asset-inputFundPassword")}
                onInput={value => {
                  this.setState({ password: value });
                }}
              />
              <div className="set">
                {this.state.userTwoVerify.fundPwd === 1 ? (
                  <NavLink to="/user/safe" target="_blank">
                    {this.intl.get("asset-setFundPassword")}
                  </NavLink>
                ) : this.state.userTwoVerify.fundPwd === 0 ? (
                  <NavLink to="/user/safe" target="_blank">
                    {this.intl.get("login-forget")}
                  </NavLink>
                ) : (
                  ""
                )}
              </div>
            </div>
          </div>
          <div className="handel">
            <Button
              title={this.intl.get("asset-submit")}
              type="base"
              onClick={() => {
                if (this.state.quotaTip || this.state.noSufficTip) return;
                let { currency, address, password, extractAmount } = this.state;
                this.beforeExtract(
                  curExtract && curExtract.minCount,
                  this.state.password
                );
              }}
            />
          </div>
        </div>
        <div className="tip clearfix">
          <span className="title">{this.intl.get("asset-reminder")}</span>
          <ol>
            <li>{this.intl.get('asset-safe-tip')}</li>
            <li>
              {this.intl.get("asset-depositReminder2-1")}{" "}
              <NavLink to={`/wallet/dashboard`}>
                {this.intl.get("asset-records")}
              </NavLink>{" "}
              {this.intl.get("asset-depositReminder2-2")}
            </li>
          </ol>
        </div>
        <ToTrade
          pairArr={this.getCoinPair(this.state.tradePair, this.state.currency)}
        />
        <div className="history clearfix">
          <span className="title">
            {this.intl.get("asset-withdrawalsHistory")}
          </span>

          {this.state.assetHistory.total ? (
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th className="time">
                      {this.intl.get("asset-withdrawalsTime")}
                    </th>
                    <th className="currency">
                      {this.intl.get("asset-currency")}
                    </th>
                    <th className="amount">
                      {this.intl.get("asset-withdrawalsAmount")}
                    </th>
                    <th className="send">
                      {this.intl.get("asset-sendAddress")}
                    </th>
                    <th className="receive">
                      {this.intl.get("asset-receiveAddress")}
                    </th>
                    <th className="state">{this.intl.get("state")}</th>
                    <th className="remark">{this.intl.get("remark")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orderList &&
                    orderList.map(
                      (
                        {
                          orderTime,
                          coinName,
                          count,
                          postAddress,
                          receiveAddress,
                          orderStatus,
                          fee
                        },
                        index
                      ) => (
                        <tr key={index}>
                          <td className="time">{orderTime.toDate()}</td>
                          <td className="currency">{coinName.toUpperCase()}</td>
                          <td className="amount">
                            <i>-{count}</i>
                          </td>
                          <td className="send">
                            <i>{"—"}</i>
                          </td>
                          <td className="receive">
                            <i>{receiveAddress}</i>
                          </td>
                          <td className="state">
                            <span>{this.status[orderStatus]}</span>
                          </td>
                          <td className="remark">{fee}</td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
              <div className="pagina">
                <Pagination
                  total={this.state.assetHistory.total}
                  pageSize={10}
                  showTotal={true}
                  onChange={page => {
                    this.setState({ page });
                    this.getHistory({
                      page: page - 1,
                      pageSize: 10,
                      coinId: this.state.walletList[this.state.currency],
                      coinName: this.state.currency,
                      orderType: 2,
                      orderStatus: -1,
                      startTime: -1,
                      endTime: -1
                    });
                  }}
                  showQuickJumper={true}
                  currentPage={this.state.page}
                />
              </div>
              <p className="more">
                <NavLink to={`/wallet/dashboard`}>
                  {this.intl.get("asset-viewAll")}→
                </NavLink>
              </p>
            </div>
          ) : (
            <div className="kong">{this.intl.get("noRecords")}</div>
          )}
        </div>
        {this.state.showAddressPopup && (
          <Popup
            type="popup3"
            addressArr={curExtract && curExtract.addressList}
            newAddress={this.state.newAddress}
            addTip={this.notSaved}
            changeNewAddress={this.changeNewAddress}
            onSave={async ()=>{
              let obj = Object.assign({ coinName: this.state.currency }, this.state.newAddress[0]);
              if (obj.addressName === "" || obj.address === "") {
                this.setState({
                  tip: true,
                  tipSuccess: false,
                  tipContent: this.intl.get("asset-incomplete")
                });
                return false;
              }
              this.setState({
                showTwoVerify: true,
                verifyType: 1,
                verifyNum: this.intl.get("sendCode")
              })
            }}
            onDelete={async (del) => {
              let result = this.deletAddress(
                Object.assign({ coinName: this.state.currency }, del)
              );
              return result
            }}
            onClose={() => {
              this.setState({ showAddressPopup: false });
            }}
          />
        )}
        {this.state.showTwoVerify && (
          <TwoVerifyPopup
            verifyNum={this.state.verifyNum}
            type={!this.state.verifyType ? this.state.userTwoVerify.withdrawVerify : this.state.firstVerify} //两步验证码类型
            getVerify={this.getVerify}
            onClose={() => {
              this.setState({ showTwoVerify: false });
            }}
            destroy={this.destroy}
            onConfirm={async (code) => {
              this.twoVerify(code, curExtract)
            }}
          />
        )}
        {this.state.tip && (
          <BasePopup
            type={this.state.tipSuccess ? "tip1" : "tip3"}
            msg={this.state.tipContent}
            onClose={() => {
              this.setState({ tip: false });
            }}
            autoClose={true}
          />
        )}
        {this.state.orderTip && (
          <BasePopup
            type="confirm"
            msg={this.state.orderTipContent}
            onClose={() => {
              this.setState({ orderTip: false });
            }}
            onConfirm={() => {
              if (
                this.state.orderTipContent === this.intl.get("asset-auth-tip")
              ) {
                this.props.history.push({
                  pathname: `/user/identity/`
                });
              }
              this.setState({ orderTip: false });
            }}
          />
        )}
        <div className="recoGoogle" style={{display: this.state.recoGoogle ? 'block' : 'none'}}>
          <div className="recoGoogle-popup">
            <h3>{this.intl.get('asset-recoGoogle')}</h3>
            <div className="button">
              <Button title={this.intl.get('home-setPwdGo')} className="tosafe" onClick={()=>{
                  this.props.history.push({pathname: '/user/safe/'})
                }}></Button>
              <Button title={this.intl.get('asset-nextTime')} className="cancel" onClick={()=>{
                this.setState({
                  showTwoVerify: true,
                  verifyType: 0,
                  recoGoogle: false,
                  verifyNum: this.intl.get("sendCode")
                })
              }}></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
