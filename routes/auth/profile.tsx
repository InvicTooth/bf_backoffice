import { defineRoute, type RouteContext } from "$fresh/server.ts";
import type { AuthState } from "../../providers/AuthState.ts";


export default defineRoute((_req, ctx:RouteContext<void, AuthState>) => {
  const user = ctx.state.session?.user;
  return (
    <div class="mt-10 px-5 mx-auto flex max-w-screen-md flex-col justify-center">
      <h1 class="text-2xl font-bold mb-5 text-center">This route is protected</h1>
      <img class="mx-auto mt-10 mb-5" src="/images/walking.svg"></img>
      <div class="mx-auto text-center mb-5">
        <h1 class="text-2xl font-bold mb-10">Welcome to your profile!</h1>
        <a href="/admin" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Go to Admin</a>
        <pre className="text-xs font-mono p-3 rounded border text-left mb-10 overflow-auto">
          {user && JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
});