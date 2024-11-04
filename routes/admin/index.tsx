import { defineRoute } from "$fresh/server.ts";
import AdminTopBar from "../../components/admin/AdminTopBar.tsx";

export default defineRoute((_req, _ctx) => {
  return (
    <>
      <div class="flex flex-col flex-grow">
        <AdminTopBar title="Dashboard"></AdminTopBar>
        <div class='m-8'>
          Dashboard
        </div>
      </div>
    </>
  );
});