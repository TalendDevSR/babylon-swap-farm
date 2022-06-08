import React from 'react'
import ReactDOM from 'react-dom'
import { NotificationContainer } from 'react-notifications';
import App from './App'
import Providers from './Providers'

import 'react-notifications/lib/notifications.css';

ReactDOM.render(
    <React.StrictMode>
        <Providers>
            <App />
            <NotificationContainer />
        </Providers>
    </React.StrictMode>,
    document.getElementById('root'),
)
