import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import exchangeViewBase from "../../../components/ExchangeViewBase";
import QRCode from "qrcode.react";
import Popup from '../../../common/component/Popup'
import DownLoadImg from  "../../../class/lib/DownloadCanvasImage";

export default class Charge extends exchangeViewBase {
    constructor(props) {
        super(props);
        let { controller } = props;
        this.state = {
            currency: "",
            coinAddress: {},
            showPopup: false,
            popMsg: "",
            popType: "",
        };
        //绑定view
        controller.setView(this);
        //初始化数据，数据来源即store里面的state
        let {coinAddress} = controller.initState;
        this.state = Object.assign(this.state, {coinAddress});

        // 绑定方法
        this.getCoinAddress = controller.getCoinAddress.bind(controller);
        //头部
        this.addContent = controller.headerController.addContent.bind(controller.headerController);
        this.deal = controller.dealCoin.bind(controller);

        this.copy = el => {
            if(controller.copy(el)){
                this.setState({showPopup:true,popMsg:this.intl.get("asset-copySuccess"),popType:"tip1"})
            }else{
                this.setState({showPopup:true,popMsg:this.intl.get("asset-copyFail"),popType:"tip3"})
            }
        };
  
      this.deal = controller.dealCoin.bind(controller);
      this.getWalletList = controller.getWalletList.bind(controller);
      this.getCoinAddress = controller.getCoinAddress.bind(controller);
      // this.getWalletList = controller.getWalletList.bind(controller);
    }

    async componentWillMount() {
      let {controller,history} = this.props;
      this.addContent({con: this.intl.get("asset-charge")});

      let {walletList, walletHandle} = await this.getWalletList();
        let arr = this.deal(walletList, 'c');
        // 获取路由参数
        let query = controller.getQuery("currency").toUpperCase();
        let currency = query && (arr.includes(query) && query || 'btc') || (this.props.location.query && this.props.location.query.currency) || "btc";

        currency = currency.toUpperCase();
        this.setState({currency: currency.toUpperCase()});
        // 更改url
        controller.changeUrl("currency", currency.toLowerCase());

        this.getCoinAddress(currency);
        this.setState({currency: currency});
    }

    render() {
        let {history} = this.props;
        let {showPopup,popType,popMsg,currency} = this.state;
        let {coinAddress,verifyNumber} = this.state.coinAddress;

        return (
            <div className="charge">
                {/*选择币种*/}
                <div className="filter" onClick={()=>history.push(`/wallet/select?to=/wallet/charge&currency=${currency}`)}>
                    <label>{this.intl.get("asset-selectCoin")}</label>
                    <b className={currency ? "":"gray"}>{currency || this.intl.get("h5-asset-selectCoin")}</b>
                    <img src="/static/mobile/asset/icon_next@2x.png"/>
                </div>
                {/*充币信息*/}
                {currency ?
                    <div className="info">
                        <QRCode value={coinAddress || "-"} level="M" size={160} className="qrcode"/>
                        <a className="save-qrcode" onClick={()=> DownLoadImg(document.querySelector(".info canvas"), "png", "img")}>{this.intl.get("asset-save-qrcode")}</a>
                        <input type="text" ref="addr" value={coinAddress || "-"} readOnly="readOnly"/>
                        <a className="copy-addr" onClick={()=> this.copy(this.refs.addr)}>{this.intl.get("asset-copy")}</a>
                        <p>{this.intl.get("asset-depositTip",{currency:currency})}</p>
                        <p>{this.intl.getHTML("asset-depositReminder1",{currency:currency,number:verifyNumber})}</p>
                        <p>{this.intl.get("asset-charge-h5-tip3")}</p>
                    </div>
                        :
                    <div className="empty">
                        <b>{this.intl.get("h5-asset-empty3")}</b>
                        <i>{this.intl.get("h5-asset-empty4")}</i>
                    </div>}
                {/*提示框*/}
                {showPopup &&
                    <Popup
                        type={popType}
                        msg={popMsg}
                        h5={true}
                        onClose={() => this.setState({showPopup: false})}
                        autoClose = {true}/>}
            </div>
        );
    }
}
