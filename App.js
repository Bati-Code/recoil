import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { RecoilRoot } from "recoil";

import Search from "./views/MainPage";
import Counter from './views/Counter'

const App = () => {

	return (
		<RecoilRoot>
			<BrowserRouter>
				<Switch>
					<Route path="/" render={() => <Search />} />
				</Switch>
			</BrowserRouter>
		</RecoilRoot>
	)
}

export default App;
