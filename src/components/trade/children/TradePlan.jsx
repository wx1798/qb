import ExchangeViewBase from '../../ExchangeViewBase'
import React, {Component} from "react";
import SelectButton from "../../../common/component/SelectButton";
import TradeDealExchange from './TradeDealExchange.jsx';
import TradePopup from '../../../common/component/TradePopup/index.jsx'
import '../stylus/tradePlan.styl'


export default class TradePlan extends ExchangeViewBase {
  constructor(props) {
    super(props);
    this.state = {
      coinChargeFlag: false,
      marketChargeFlag: false,
      priceLimit : 6,
      numLimit: 2,
      marketChangePrice:0,
      changeBankPriceB:0, //买入价格输入框实时汇率
      changeBankPriceS:0,//卖入价格输入框实时汇率
      dbPrePass:false, // 免输资金密码二次点击
      dbPreOrder:true, // 下单二次点击
      dealPopMsg:'',// 弹窗信息
      dealPassType:'positi',// 弹窗类型倾向
      dealPass:false,// 下单弹窗
      fundPwdIntervalClick:0,
      fundPwdIntervalShow: 0,
      fundPwdInterval: '',
      funpass: '',
      funpassBuy:'',
      funpassSell:'',
      buyMax: 0, // 买入最大数量
      sellMax: 0,
      buyWallet: 0, //买入可用余额
      sellWallet: 0, //卖出可用余额
      DealEntrustType: 0,// 委托类型
      PassType: '',
      Market: '',
      Coin: '',
      inputValue: 0,
      inputSellValue: 0,
      inputBuyValue: 0,
      inputBuyFlag: false,
      inputSellFlag: false,
      dealType: 0,
      inputSellNum: 0,
      inputBuyNum: 0,
      sellNumFlag: false,
      userVerify:false,
      buyNumFlag: false,
      DealEntrust: [{name: `${this.intl.get('deal-limit')}`, type: 0}, {name: `${this.intl.get('deal-market')}`, type: 1}],
      ControllerProps: [{name: `${this.intl.get('buy')}`, tradeType: 'buy', dealType: 0}, {name: `${this.intl.get('sell')}`, tradeType: 'sell', dealType: 1},],
      UnitSelected: this.intl.get('deal-digital'),
      fundPwdIntervalWindow: [{id: 'pwd_e', value: 0, label:this.intl.get('deal-every')}, {id: 'pwd_2', value: 1, label:this.intl.get('deal-2h')}, {id: 'pwd_n', value: 2, label:this.intl.get('deal-never')}],
      fundPwdIntervalWindowFlag: false,
      fundPwdIntervalSetFlag: false,
      setPass: ''
    };
    const {controller} = this.props;
    //绑定view
    controller.setView(this);
    //初始化数据，数据来源即store里面的state
    this.state = Object.assign(this.state, controller.initState);
    this.setPriceInit = controller.setPriceInit.bind(controller);
    this.dealTrade = controller.dealTrade.bind(controller)
    this.changeUnit = controller.changeUnit.bind(controller);
    this.changeMaxNum = controller.changeMaxNum.bind(controller);
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.props.controller.getFundPwdInterval();
    this.props.controller.getCoinMinTrade();
    this.props.controller.getCharge();
  }
//切换市价委托/限价委托
  changeEntrustType(v) {
    this.setState({
      DealEntrustType: v.type
    })
  }

  numInput(dealType,type, e) {
    let diffArr = [{
      inputValue: 'inputBuyValue',
      wallet: 'buyWallet',
      setValue: 'inputBuyNum',
      max: 'buyMax',
      changeBank: 'changBankPriceB'
    }, {inputValue: 'inputSellValue', wallet: 'sellWallet', setValue: 'inputSellNum', max: 'sellMax',changeBank: 'changBankPriceS'}];
    let maxNum = this.state[diffArr[dealType].max];
    // let priceValue = this.state.DealEntrustType ? this.state.marketChangePrice : (this.state[diffArr[dealType].inputValue] || this.state.priceInit);
    // if(this.state.DealEntrustType === 0 && (this.state.PriceUnit === 'CNY' || this.state.PriceUnit === 'USD')){
    //   priceValue = this.state[diffArr[dealType].changeBank] || this.state.priceInit
    // }
    // console.log(this.state[diffArr[dealType].inputValue],789456,this.state.priceInit)
    // console.log(this.state.marketChangePrice,'aaaa',priceValue)
    let value = e.target.value;
    let limitNum = value.split('.');
    if(limitNum.length > 2)
      return
    limitNum[1] = limitNum[1] || '';
    // console.log('limitNum[1]1',limitNum[1])
    if(maxNum < this.state.coinMin){
      this.setState(
          {
            dealPopMsg: this.intl.get('deal-num-limited'),
            dealPassType: 'passive',// 弹窗类型倾向
            dealPass: true,// 下单弹窗
          }
      )
      return
    }
    if (!((/^[0-9]*$/).test(limitNum[0]) && (/^[0-9]*$/).test(limitNum[1])))
      return
    // if(limitNum[1].length > 8 - (limitPrice[1] && limitPrice[1].length || 0))
    //   return
   
    // let flag =  type ? ((priceValue > 100 && (/^[0-9]{0,6}$/).test(limitNum[1]))
    //     || (priceValue > 0.1 && priceValue <= 100 && (/^[0-9]{0,4}$/).test(limitNum[1]))
    //         || (priceValue >= 0.01 && priceValue <= 0.1 && (/^[0-9]{0,2}$/).test(limitNum[1]))
    //         || (priceValue < 0.01 && (/^[0-9]{0,0}$/).test(limitNum[1]))) : true;
    let numLimit = this.state.numLimit;
    let reg = new RegExp(`^[0-9]{0,${numLimit}}$`);
    let flag =  type ? reg.test(limitNum[1]) : true;
    if(!flag)
      return
  
    // let limitPrice = 0;
    // priceValue >= 100 && (limitPrice = 6);
    // priceValue >= 0.1 && priceValue < 100 && (limitPrice = 4);
    // priceValue >= 0.01 && priceValue < 0.1 && (limitPrice = 2);
    let numValue = e.target.value > maxNum ? maxNum.toFixedWithoutUp(numLimit) : value;
    if(type){
      dealType ? (this.setState({inputSellNum: numValue})) : (this.setState({inputBuyNum: numValue}))
      dealType ? (e.target.value >= maxNum && this.setState({sellNumFlag: true})) : (e.target.value >= maxNum && this.setState({buyNumFlag: true}))
    }
   else{
      // let a = Number(numValue).formatFixNumberForAmount(Number(priceValue));
      // let b = a.split(',');
      // let c;
      // b.length > 1 && (c = b.join(''));
      // dealType ? (this.setState({inputSellNum: c && Number(c) || Number(numValue).formatFixNumberForAmount(Number(priceValue))})) : (this.setState({inputBuyNum: c && Number(c) || Number(numValue).formatFixNumberForAmount(Number(priceValue))}))
      // dealType ? (e.target.value >= maxNum && this.setState({sellNumFlag: true})) : (e.target.value >= maxNum && this.setState({buyNumFlag: true}))
      dealType ? (this.setState({inputSellNum: Number(numValue).toFixedWithoutUp(numLimit)})) : (this.setState({inputBuyNum: Number(numValue).toFixedWithoutUp(numLimit)}));
      dealType ? (e.target.value >= maxNum && this.setState({sellNumFlag: true})) : (e.target.value >= maxNum && this.setState({buyNumFlag: true}))
    }
  }

  priceInput(dealType, e) {
    let value = e.target.value;
    let arr = value.split('.');
    // console.log('ChangePrice 0.3', arr, arr.length)
    if (arr.length > 2)
      return
    arr[1] = arr[1] || ''
    // console.log('ChangePrice 0.6', !((/^[0-9]*$/).test(arr[0]) && (/^[0-9]*$/).test(arr[1] || '')))
    if (!((/^[0-9]*$/).test(arr[0]) && (/^[0-9]*$/).test(arr[1])))
      return
    // console.log('ChangePrice', Number(value), arr[0], arr[1], (/^[0-9]{0,4}$/).test(arr[1]), (/^[0-9]{0,6}$/).test(arr[1]), (/^[0-9]{0,8}$/).test(arr[1]))
    let priceLimit = this.state.priceLimit;
    let reg = new RegExp(`^[0-9]{0,${priceLimit}}$`);
    // let flag = (Number(value) >= 100 && (/^[0-9]{0,2}$/).test(arr[1]))
    //     || ((Number(value) < 100 && (/^[0-9]{0,4}$/).test(arr[1]))
    //         || (Number(value) < 0.1 && (/^[0-9]{0,6}$/).test(arr[1]))
    //         || (Number(value) < 0.01 && (/^[0-9]{0,8}$/).test(arr[1])));
    let flag = reg.test(arr[1]);
    // console.log('ChangePrice 0.5',flag,this.state.PriceUnit)
    if(this.state.PriceUnit === 'CNY' || this.state.PriceUnit === 'USD'){
      flag = (/^[0-9]{0,2}$/).test(arr[1])
    }
    if(flag){
      dealType ? (this.setState({
        inputSellValue: value,
        inputSellFlag: true,
        dealType
      })) : (this.setState({inputBuyValue: value, inputBuyFlag: true, dealType}));
      value && this.changeMaxNum(dealType, value)
    }
    
  }

  passInput(v,e) {
    if(!v){
      this.setState({funpassBuy: e.target.value})
      return
    }
    this.setState({funpassSell: e.target.value})
  }
  
  setFunPwdIntervalShow(v){
    
      this.setState(
          {fundPwdIntervalSetFlag: true,
           fundPwdIntervalClick: v.value
          }
      )
    
  }
  changeSetPass(e){
    this.setState(
        {
          setPass: e.target.value
        }
    )
  }
  freePwd(){
    this.setState({
      fundPwdIntervalWindowFlag: true
    })
  }
  async setPassSubmit(e){
    e.preventDefault();
    e.stopPropagation();
    let type, pwd;
    type = this.state.fundPwdIntervalClick;
    pwd = this.state.setPass;
    if(pwd === ''){
      this.setState(
          {
            dealPopMsg: this.intl.get('deal-pass-empty'),
            dealPassType: 'passive',// 弹窗类型倾向
            dealPass: true,// 下单弹窗
          }
      );
      return
    }
    this.setState(
        {
          dbPrePass: true
        }
    )
    let result = await this.props.controller.userController.setFundPwdInterval(type, pwd);
    result === null && this.setState(
        {
          fundPwdInterval: type,
          fundPwdIntervalShow: type,
          fundPwdIntervalWindowFlag: false,
          fundPwdIntervalSetFlag: false,
          setPass: '',
          dealPopMsg: this.intl.get('user-setSucc'),
          dealPassType: 'positi',// 弹窗类型倾向
          dealPass: true,// 下单弹窗
          dbPrePass: false
        }
    );
    result && result.errCode === 'PWD_ERROR' && this.setState(
        {
          dealPopMsg:this.intl.get('passError'),
          dealPassType:'passive',// 弹窗类型倾向
          dealPass:true,// 下单弹窗
          dbPrePass: false
        }
    )
  }
  render() {
    return (
      <div className='trade-plan-deal'>
        <div className='deal-entrust'>
          {this.state.DealEntrust.map((v, index) => {
            return (
              <span key={index} className={this.state.DealEntrustType === v.type ? 'entrust-active' : ''}
                    onClick={this.changeEntrustType.bind(this, v)}>{v.name}</span>
            )
          })}
          <div style={{float: 'right', marginRight: '.1rem'}} className="pop-parent">
            <SelectButton
              title={this.state.UnitSelected}
              type="trade"
              className="select"
              valueArr={[`${this.intl.get('deal-digital')}`, "CNY", "USD"]}
              onSelect={(e) => {
                this.changeUnit(e,this.intl.get('deal-digital'))
              }}
            />
            <em className="pop-children rightpop-children">{this.intl.get("deal-price-tip")}</em>
          </div>

        </div>
        <div className='trade-deal-exchanged'>
          {this.state.ControllerProps.map((v, index) => {
            return (
              <TradeDealExchange PriceUnit={this.state.PriceUnit} NumUnit={this.state.NumUnit} key={index}
                                 ControllerProps={v} steadUnitP={this.state.Market} steadUnitN={this.state.Coin}
                                 prices={this.state.prices} Market={this.state.Market}
                                 avalue={this.state.inputSellFlag ? (this.state.inputSellValue) : (this.state.priceBank[this.state.PriceUnit] || this.state.priceInit)}
                                 bvalue={this.state.inputBuyFlag ? (this.state.inputBuyValue) : (this.state.priceBank[this.state.PriceUnit] || this.state.priceInit)}
                                 sellNum={this.state.inputSellNum}
                                 buyNum={this.state.inputBuyNum}
                                 buyMax={this.state.buyMax}
                                 sellMax={this.state.sellMax}
                                 // funpass={this.state.funpass}
                                 funpassBuy={this.state.funpassBuy}
                                 funpassSell={this.state.funpassSell}
                                 wallet={index ? this.state.sellWallet : this.state.buyWallet}
                                 priceInput={this.priceInput.bind(this)}
                                 numInput={this.numInput.bind(this)}
                                 dealTrade={this.dealTrade.bind(this)}
                                 passInput={this.passInput.bind(this)}
                                 fundPwdInterval={this.state.fundPwdInterval}
                                 fundPassVerify={this.state.fundPwdInterval<0}
                                 DealEntrustType={this.state.DealEntrustType}
                                 freePwd={this.freePwd.bind(this)}
                                 coinChargeFlag={this.state.coinChargeFlag}
                                 marketChargeFlag={this.state.marketChargeFlag}
              />

            )
          })}
          {/*<TradeDealExchange PriceUnit ={this.state.PriceUnit} NumUnit ={this.state.NumUnit}/>*/}
        </div>
        <div className='deal-set-pwd' style={{display: this.state.fundPwdIntervalWindowFlag ? 'block' : 'none'}}>
          <div className='deal-pwd-detail'>
            <div className='deal-pwd-title'>
              {this.state.fundPwdIntervalSetFlag && this.intl.get('deal-identify')||this.intl.get('deal-timeSetting')}
              <em onClick={() => this.setState({fundPwdIntervalWindowFlag: false, fundPwdIntervalSetFlag: false, setPass: ''})} style={{cursor: 'pointer'}}></em>
            </div>
            <div className='deal-pwd-content'>
                {this.state.fundPwdIntervalSetFlag && (
                    <div>
                      <div className='set-pwd-msg'>
                        {this.intl.get('deal-inputpwdplease')}
                      </div>
                      <p className='set-pwd-input'>
                        <span>{this.intl.get('fundPass')}:</span>
                        <input type="password" className='set-pwd' onChange={this.changeSetPass.bind(this)} value={this.state.setPass} autoFocus/>
                        <input type="button" value={this.intl.get('user-submit')} className='set-pwd-sub' onClick={this.setPassSubmit.bind(this)} style={{cursor: 'pointer'}} disabled={this.state.dbPrePass}/>
                      </p>
                    </div>
                ) || this.state.fundPwdIntervalWindow.map((v, index) => {
                  return(
                      <div className="choice" key={index}>
                        <input type="radio" className='pwd-radio' name='pwd-Radio' value={v.value} id={v.id} checked={this.state.fundPwdInterval === v.value ? true : false} onChange={this.setFunPwdIntervalShow.bind(this,v)}/><label htmlFor={v.id}>{v.label}</label>
                      </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className='deal-pop'>
          {this.state.dealPass && <TradePopup theme={this.state.dealPassType} msg={this.state.dealPopMsg} onClose={() => {this.setState({ dealPass: false });}} className='deal-pop-location'/>}
        </div>
        <div className='deal-login-shadow' style={{display:this.props.controller.userController.userId ? 'none' : 'block'}}>
          <p>
            <a href="/login/">{this.intl.get('deal-login')}</a>
            <span>{this.intl.get('deal-after')}</span>
          </p>
        </div>
      </div>)
  }
}