import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from "react-router-dom";

import "./common/css/base.styl";
import "./common/css/reset.styl";
import "./common/component/style/index.styl";

import {AsyncComponent} from './core'

import ConfigController from "./class/config/ConfigController";
import AssetController from "./class/asset/AssetController";
import UserController from "./class/user/UserController";
import LoginController from "./class/login/LoginController";
import NoticeController from "./class/notice/NoticeController";
import ActivityController from "./class/activity/ActivityController";
import UserOrderListController from "./class/orderList/userOrderList/UserOrderListController";
import MarketController from "./class/market/MarketController";
import HeaderController from "./class/header/HeaderController";

import Header from "./componentsMb/header/Header.jsx";

// import Home from "./componentsMb/home/Home.jsx";
// import Login from "./componentsMb/login/Login.jsx";
// import Help from "./componentsMb/help/Help.jsx";
// import ForgetPass from "./componentsMb/login/ForgetPass.jsx";
// import AssetManange from "./componentsMb/asset/AssetManage";
// import Genrealize from "./componentsMb/genrealize/Genrealize.jsx";
// import OrderManage from "./componentsMb/order/OrderManage.jsx";
// import UserCenter from "./componentsMb/user/UserCenter.jsx";

let configController,
  assetController,
  userController,
  loginController,
  noticeController,
  activityController,
  marketController,
  userOrderController,
  headerController;

const header = ({ match, history }) => {
  return (
    <Header
      userController={userController}
      loginController={loginController}
      headerController={headerController}
      configController={configController}
      history={history}
      match={match}
    />
  );
};

// const LoginComponent = ({ match, history, location }) => {
//   return (
//     <Login
//       controller={loginController}
//       match={match}
//       history={history}
//       location={location}
//     />
//   );
// };

// const HomeCompoment = () => {
//   return (
//     <Home
//       activityController={activityController}
//       marketController={marketController}
//     />
//   );
// };

// const HelpComponent = ({ match }) => {
//   return <Help assetController={assetController} activityController={activityController} match={match} />;
// };

// const ForgetPassComponent = ({ match, history }) => {
//   return (
//     <ForgetPass controller={loginController} match={match} history={history} />
//   );
// };

// const AssetComponent = ({ match }) => {
//   return <AssetManange controller={assetController} match={match} />;
// };
// const OrderManageCompoment = ({ match }) => {
//   return <OrderManage controller={userOrderController} match={match} />;
// };

// const UserCenterComponent = ({ match, history, location }) => {
//   return (
//     <UserCenter
//       match={match}
//       controller={userController}
//       history={history}
//       location={location}
//     />
//   );
// };

// const Gener = ({ match }) => {
//   return <Genrealize match={match} controller={activityController} />;
// };

let Routers

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { initDone: false };

    configController = new ConfigController();
    assetController = new AssetController();
    userController = new UserController();
    loginController = new LoginController();
    noticeController = new NoticeController();
    activityController = new ActivityController();
    marketController = new MarketController("market");
    userOrderController = new UserOrderListController();
    headerController = new HeaderController()

    loginController.userController = userController;
    loginController.headerController = headerController;

    noticeController.configController = configController;
    noticeController.userController = userController;
    noticeController.headerController = headerController;

    activityController.configController = configController;
    activityController.userController = userController;
    activityController.headerController = headerController

    userController.configController = configController;
    userController.headerController = headerController

    assetController.configController = configController;
    assetController.userController = userController;
    assetController.marketController = marketController;
    assetController.headerController = headerController;
    assetController.activityController = activityController;

    marketController.userController = userController;
    marketController.configController = configController;
    marketController.assetController = assetController;
    marketController.headerController = headerController;

    userOrderController.userController = userController;
    userOrderController.marketController = marketController;
    userOrderController.headerController = headerController;

    configController.setAppView(this);

    let Gener = AsyncComponent(()=>import("./componentsMb/genrealize/Genrealize.jsx"), {controller:activityController});
    let HomeCompoment = AsyncComponent(()=>import("./componentsMb/home/Home.jsx"), {activityController, marketController,noticeController,headerController});
    let LoginComponent = AsyncComponent(()=>import("./componentsMb/login/Login.jsx"), {controller:loginController});
    let ForgetPassComponent = AsyncComponent(()=>import("./componentsMb/login/ForgetPass.jsx"), {controller:loginController});
    let HelpComponent = AsyncComponent(()=>import("./componentsMb/help/Help.jsx"), {activityController, assetController, headerController,configController});
    let AssetComponent = AsyncComponent(()=>import("./componentsMb/asset/AssetManage"), {controller:assetController});
    let OrderManageCompoment = AsyncComponent(()=>import("./componentsMb/order/OrderManage.jsx"), {controller:userOrderController});
    let UserCenterComponent = AsyncComponent(()=>import("./componentsMb/user/UserCenter.jsx"), {controller:userController});
    let ActivityComponent = AsyncComponent(()=>import("./componentsMb/activity/Activity.jsx"), {controller:activityController, headerController});

    Routers = [
      { path: "/home", component: HomeCompoment },
      { path: "/login", component: LoginComponent },
      { path: "/login/:uid", component: LoginComponent },
      { path: "/findPass", component: ForgetPassComponent },
      { path: "/genrealize", component: Gener },
      { path: "/help", component: HelpComponent },
      { path: "/wallet", component: AssetComponent, auth: true },
      { path: "/order", component: OrderManageCompoment, auth: true },
      { path: "/user", component: UserCenterComponent, auth: true },
      { path: "/activity", component: ActivityComponent, auth: true }
    ];



  }

  componentWillMount() {}

  async componentDidMount() {
    await configController.getActivityState();
    await configController.checkVersion();
    configController.loadLocales();
  }

  componentWillUpdate(...parmas) {}

  render() {
    return (
      <Router>
        {this.state.initDone && (
          <div className="route-mb">
            {/*<Header/>*/}
            <Switch>
              <Route component={header} />
            </Switch>
            <div>
              <Switch>
                {Routers.map((item, i) => (
                  <Route
                    path={item.path}
                    key={i}
                    render={props => {
                      document.getElementById("app").scrollIntoView(true);
                      configController.sendChannel();
                      return !item.auth ? (
                        ["/login", "/login/:uid", '/findPass'].includes(item.path) && userController.Storage.userToken.get() ? (
                          <Redirect to={{ pathname: "/home" }} />
                        ) : (
                            <item.component {...props} />
                          )
                      ) : userController.Storage.userToken.get() ? (
                        <item.component {...props} />
                      ) : (
                            <Redirect
                              to={{
                                pathname: "/login",
                                state: { from: props.location }
                              }}
                            />
                          )
                    }
                    }
                  />
                ))}
                <Redirect to="/home" />
              </Switch>
            </div>
          </div>
        )}
      </Router>
    );
  }
}
