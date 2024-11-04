import { PageProps } from "$fresh/server.ts";
import { LayoutConfig } from "$fresh/server.ts";

import AdminLeftNav from "../../components/admin/AdminLeftNav.tsx";

export const config: LayoutConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

export default function Layout(props: PageProps) {
  return (
    <div class="flex w-screen h-screen text-gray-700">
      <AdminLeftNav></AdminLeftNav>
      <props.Component />
    </div>   
  );
}