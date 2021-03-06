import React, { Component } from "react";
import exchangeViewBase from "../../ExchangeViewBase";
import Input from "../../../common/component/Input";

export default class Charge extends exchangeViewBase {
  constructor(props) {
    super(props);
    this.state = {
      showSearch: false
    };
    this.show = () => {
      this.setState({ showSearch: true });
    };
    this.hide = () => {
      this.setState({ showSearch: false });
    };
    this.setValue = value => {
      this.props.setValue(value);
    };
    this.setCurrency = currency => {
      this.props.setCurrency(currency);
    };
  }
  render() {
    let searchArr = this.props.filte(
      this.props.walletList,
      this.props.value.toUpperCase()
    );
    let { totalCount, frozenCount, availableCount, currency, type, history} = this.props;
    return (
      <div className="input">
        <Input
          type="search1"
          value={this.props.value}
          onInput={value => {
            this.setValue(value);
          }}
          onFocus={this.show}
          onEnter={() => {
            let value = searchArr[0] || "BTC";
            history.push({pathname:history.location.pathname, query:{currency:value}})
            {/* this.setValue(value);
            this.setCurrency(value);
            this.hide(); */}
          }}
          clickOutSide={() => {
            if(!this.state.showSearch) return;
            let value = searchArr[0] || "BTC";
            history.push({pathname:history.location.pathname, query:{currency:value}})
            {/* this.setValue(value);
            this.setCurrency(value); */}
            {/* this.hide(); */}
          }}
        >
          {
            <ul
              className={`search-list ${
                this.state.showSearch && searchArr.length ? "" : "hide"
              }`}
            >
              {searchArr.map((item, index) => (
                <li
                  key={index}
                  onClick={e => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                    history.push({pathname:history.location.pathname, query:{currency:item}})
                    {/* this.setValue(item);
                    this.setCurrency(item);
                    this.hide(); */}
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          }
        </Input>
        <ul>
          <li>
            <span>{this.intl.get("asset-amount")}</span>
            <i>
              {Number(totalCount).format({ number: "property" , style:{ decimalLength: 8}})}{" "}
              {currency}
            </i>
          </li>
          <li>
            <span>{this.intl.get("asset-orderLock")}</span>
            <i>
              {Number(frozenCount).format({ number: "property" , style:{ decimalLength: 8}})}{" "}
              {currency}
            </i>
          </li>
          <li>
            <span>{this.intl.get("asset-avail")}</span>
            <i>
              {Number(availableCount).format({ number: "property" , style:{ decimalLength: 8}})}{" "}
              {currency}
            </i>
          </li>
        </ul>
      </div>
    );
  }
}
