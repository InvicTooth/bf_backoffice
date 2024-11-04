import { JSX } from "preact";

export default function AdminTopBar(props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="flex items-center flex-shrink-0 h-16 px-8 border-b border-gray-300">
      <h1 class="text-lg font-medium">{props.title}</h1>
      <button class="flex items-center justify-center h-10 px-4 ml-auto text-sm font-medium rounded hover:bg-gray-300">
        Action 1
      </button>
      <button class="flex items-center justify-center h-10 px-4 ml-2 text-sm font-medium bg-gray-200 rounded hover:bg-gray-300">
        Action 2
      </button>
      <button class="relative ml-2 text-sm focus:outline-none group">
        <div class="flex items-center justify-between w-10 h-10 rounded hover:bg-gray-300">
          <img src='/images/admin/menu.svg' class='w-5 h-5 mx-auto' />
        </div>
        <div class="absolute right-0 flex-col items-start hidden w-40 pb-1 bg-white border border-gray-300 shadow-lg group-focus:flex">
          <a class="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">Menu Item 1</a>
          <a class="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">Menu Item 1</a>
          <a class="w-full px-4 py-2 text-left hover:bg-gray-300" href="#">Menu Item 1</a>
        </div>
      </button>
    </div>
  );
}