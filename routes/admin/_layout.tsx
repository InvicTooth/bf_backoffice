import { PageProps } from "$fresh/server.ts";
import { LayoutConfig } from "$fresh/server.ts";

import AdminBody from "../../components/admin/AdminBody.tsx";
import ItemList from "../../components/admin/ItemList.tsx";
import AdminLeftNav from "../../components/admin/AdminLeftNav.tsx";
import AdminTopBar from "../../components/admin/AdminTopBar.tsx";

export const config: LayoutConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

export default function Layout(props: PageProps) {
  return (
    <div class="flex w-screen h-screen text-gray-700">
      <AdminLeftNav></AdminLeftNav>
      <ItemList></ItemList>
      <div class="flex flex-col flex-grow">
        <AdminTopBar></AdminTopBar>
        <AdminBody></AdminBody>
        <props.Component />
      </div>
    </div>
    
  );
}