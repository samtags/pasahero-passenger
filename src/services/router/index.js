import { useEffect } from "react";
import { router, useNavigation } from "expo-router";

const routerParams = new Map();

function navigate({ pathname, params = {} }) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  routerParams.set(key, params);
  router.navigate({ pathname: key, params });
}

function replace({ pathname, params = {} }) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  routerParams.set(key, params);
  router.replace({ pathname: key, params });
}

export default {
  navigate,
  replace,
};

export function useRouterParams() {
  const navigator = useNavigation();
  const state = navigator.getState();
  const route = state.routes[state.index];

  let routeName = route?.name;

  // check if routeName starts with '/'
  // remove trailing '/'
  if (routeName[0] === "/") routeName = routeName.slice(1);

  useEffect(() => {
    return () => {
      routerParams.delete(routeName);
    };
  }, []);

  return routerParams.get(routeName);
}
