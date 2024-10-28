import { PageProps } from "$fresh/server.ts";
import { LayoutConfig } from "$fresh/server.ts";

export const config: LayoutConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

export default function Layout(props: PageProps) {
  return (
    <div class="layout">
      <props.Component />
    </div>
  );
}