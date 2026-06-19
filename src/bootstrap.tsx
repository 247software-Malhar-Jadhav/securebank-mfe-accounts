import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "./store";
import { initAccountsI18n } from "./i18n";
import { DevHarness } from "./DevHarness";
import "./index.css";

/**
 * STANDALONE bootstrap. Wires up everything the shell would otherwise provide:
 *   - our own Redux store (with the accountsApi slice),
 *   - i18n (init only if not already initialized),
 *   - a router,
 * then mounts the DevHarness which navigates between the two exposed screens.
 *
 * When EMBEDDED, none of this runs — the shell supplies store/i18n/router and imports the
 * exposed modules directly. This file is the standalone-only counterpart of that.
 */
initAccountsI18n();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DevHarness />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
