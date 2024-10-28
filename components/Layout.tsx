import { Head } from "$fresh/runtime.ts";
import type { ComponentChildren } from "preact";
import TopNav from "./TopNav.tsx";

interface LayoutProps{
  isLoggedIn: boolean;
  children?: ComponentChildren;
}

export default function Layout(props: LayoutProps) {
  return (
    <>
      <Head><title>BerryFlex BackOffice</title></Head>
      <TopNav isLoggedIn={props.isLoggedIn} />
      <div class="p-4 mx-auto max-w-screen-md">
        {props.children}
      </div>
    </>
  )
}