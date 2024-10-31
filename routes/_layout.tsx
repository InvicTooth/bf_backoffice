import { PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import TopNav from "../components/TopNav.tsx";

export default function Layout(props: PageProps) {
  console.log('layout root');
  return (
    <>
      <Head><title>BerryFlex BackOffice</title></Head>
      <TopNav isLoggedIn={props.state.session != null} />
      <div class="p-4 mx-auto max-w-screen">
        <props.Component />
      </div>
    </>
  );
}