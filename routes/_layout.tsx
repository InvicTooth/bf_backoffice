import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import TopNav from "../components/TopNav.tsx";

export default function Layout(props: PageProps) {
  return (
    <>
      <Head><title>BerryFlex BackOffice</title></Head>
      <TopNav isLoggedIn={props.state.token !== null} />
      <div class="p-4 mx-auto max-w-screen">
        <props.Component />
      </div>
    </>
  );
}