import { useEffect } from "react";
import { router, useNavigation } from "expo-router";

const routerParams = new Map();

function navigate({ pathname, params = {} }) {
  // remove slash at the beginning of the pathname
  if (pathname.match(/^\//)) {
    pathname = pathname.replace(/^\//, "");
  }

  routerParams.set(pathname, params);
  router.navigate({ pathname: pathname, params });
}

export default {
  navigate,
};

export function useRouterParams() {
  const navigator = useNavigation();
  const state = navigator.getState();
  const route = state.routes[state.index];

  useEffect(() => {
    return () => {
      routerParams.delete(route.name);
    };
  }, []);

  return routerParams.get(route.name);
}
