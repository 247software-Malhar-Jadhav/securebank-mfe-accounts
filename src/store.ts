import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { accountsApi } from "@/api/accountsApi";

/**
 * The remote's OWN Redux store, used only in STANDALONE mode (the dev harness wraps the app
 * in <Provider store={store}>). When embedded, the shell provides the store; ideally the
 * shell injects `accountsApi.reducer` + `accountsApi.middleware` into its own store so our
 * RTK Query cache is shared. Because our endpoints read auth from the shared channel rather
 * than store state, our components work regardless of which store backs them.
 */
export const store = configureStore({
  reducer: {
    [accountsApi.reducerPath]: accountsApi.reducer,
  },
  middleware: (getDefault) => getDefault().concat(accountsApi.middleware),
});

// Enables refetchOnFocus / refetchOnReconnect behaviour.
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
