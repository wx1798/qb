import React from 'react';
import ExchangeViewBase from '../../../components/ExchangeViewBase.jsx';
import {NavLink} from 'react-router-dom'
import RemindPopup from '../../../common/component/Popup/index.jsx'

export default class UserCenterIndex extends ExchangeViewBase {
  constructor(props) {
    super(props);
    this.verifyState={
        0: this.intl.get("user-verify-state0"),
        1: this.intl.get("user-verify-state1"),
        2: this.intl.get("user-verify-state2"),
        3: this.intl.get("user-verify-state3"),
        4: this.intl.get("user-verify-state4"),
        5: this.intl.get("user-verify-state5"),
    };
    this.state={
      userAuth:{},
      remindPopup: false,
      popType: "tip1",
      popMsg: "",
      language: props.controller.configData.language === 'en-US' ? 0 : 1
    };
    let controller=this.props.controller;
    controller.setView(this);
    this.getUserAuthData = controller.getUserAuthData.bind(controller) // 获取用户认证信息
  }

  async componentWillMount() {
    this.props.addContent({con: this.intl.get('header-user')})
    await this.getUserAuthData();
  }


  render() {
    const {url,controller} = this.props;
    const userAuth=this.state.userAuth;
    return <div className="user-center-index">
        <div className="user-center-header">
          <div>
            <img src="/static/mobile/header/icon_wode_head@2x.png" />
            <span>{controller.userName}</span>
          </div>
        </div>
        <div className="user-center-main">
          <ul className="list-section clearfix">
            <li>
              <a className="list-item clearfix" onClick={()=>{
                if([1,2].includes(userAuth.state)) return;
                this.props.history.push({pathname: `${url}/identity`})
              }}>
                <div className="fl">
                  <div className="img">
                    <img src={this.$imagesMap.$h5_user_identity} />
                  </div>
                  <span className={!this.state.language ? 'en' : ''}>{this.intl.get("header-idVerify")}</span>
                  <div className={`fr ${!this.state.language ? 'en' : ''}`}>
                    <span>{this.verifyState[userAuth.state]}</span>
                  </div>
                </div>
              </a>
            </li>
            <li>
              <NavLink className="list-item clearfix" to={`${url}/safe`}>
                <div className="fl">
                  <img src={this.$imagesMap.$h5_user_safe} />
                  <span>{this.intl.get("header-security")}</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink className="list-item clearfix" to={`/order`}>
                <div className="fl">
                  <img src={this.$imagesMap.$h5_user_order} />
                  <span>{this.intl.get("header-order")}</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink className="list-item clearfix" to={`/help/assist`}>
                <div className="fl">
                  <img src={this.$imagesMap.$h5_user_help} />
                  <span>{this.intl.get("help-center")}</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to={"/help/terms"} className="list-item clearfix">
                <div className="fl">
                  <img src={this.$imagesMap.$h5_user_terms} />
                  <span>{this.intl.get("login-readUser2")}</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to={`${url}/aboutUs`} className="list-item clearfix">
                <div className="fl">
                  <img src={this.$imagesMap.$h5_user_about} />
                  <span>{this.intl.get("notice-about")}</span>
                </div>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>;
  }
}