import { PageProps } from "$fresh/server.ts";

export default function Home(props: PageProps) {
  console.log('index page\n');
  return (
    <div class="mt-10 px-5 mx-auto flex max-w-screen-md flex-col justify-center">
      {props.state.session ?
        (
          <div class="mx-auto text-center">
            <h1 class="text-2xl font-bold mb-5">Nice! you're signed in</h1>
            <a href="/auth/profile" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Profile</a>
          </div>
        ) :
        (
          <div class="mx-auto text-center">
            <h1 class="text-2xl font-bold mb-5">Login to access all pages</h1>
            <a href="/signin" type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Sign In</a>
          </div>
        )
      }
    </div>
  );
}
