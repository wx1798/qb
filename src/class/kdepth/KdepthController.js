import ExchangeControllerBase from "../ExchangeControllerBase";
import KdepthStore from "./KdepthStore";

export default class KdepthController extends ExchangeControllerBase {
  constructor() {
    super();
    this.store = new KdepthStore();
  }
  setView(view) {
    super.setView(view);
  }
  // set深度数据
  setData(data) {
    if (!data) {
      return;
    }
    console.log(data)
    let result = {};
    result.bids = data.buy
      ? data.buy.map(v => {
          let arr = [];
          arr.push(v.price);
          arr.push(v.amount);
          return arr;
        })
      : [];
    result.asks = data.sell
      ? data.sell.map(v => {
          let arr = [];
          arr.push(v.price);
          arr.push(v.amount);
          return arr;
        })
      : [];
    console.log("深度数据.........................deal", result);
    this.view.setData(result);
  }
}