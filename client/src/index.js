import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import 'antd/dist/antd.css';
import { applyMiddleware, createStore } from 'redux';
import pormiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import reducer from './_reducers';

// 원래는 createStore만 하는데 promise, function을 받기 위해 미들웨어와 함께.
const createStoreWithMiddleware = applyMiddleware(pormiseMiddleware, ReduxThunk)(createStore)

// Provider로 감싸주면 redux와 연결.
ReactDOM.render(
  <Provider store={createStoreWithMiddleware(reducer,
    window.__REDUX_DEVTOOLS_EXTENSION__ &&
    window.__REDUX_DEVTOOLS_EXTENSION__()
  )}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
  , document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
