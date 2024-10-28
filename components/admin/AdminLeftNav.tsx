import { JSX } from "preact";

export default function AdminLeftNav(_props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="flex flex-col items-center w-16 pb-4 overflow-auto border-r border-gray-300">
      <a class="flex items-center justify-center flex-shrink-0 w-full h-16 bg-gray-300" href="#">
        <img src='/admin/cubic.svg' class="w-8 h-8" />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300" href="#">
        <img src='/admin/home.svg' class="w-5 h-5" />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300" href="#">
        <img src='/admin/paper.svg' class='w-5 h-5' />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300" href="#">
        <img src='/admin/inbox.svg' class='w-5 h-5' />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300" href="#">
        <img src='/admin/statistics.svg' class='w-5 h-5' />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-4 rounded hover:bg-gray-300" href="#">
        <img src='/admin/config.svg' class='w-5 h-5' />
      </a>
      <a class="flex items-center justify-center flex-shrink-0 w-10 h-10 mt-auto rounded hover:bg-gray-300" href="#">
        <img src='/admin/account.svg' class='w-5 h-5' />
      </a>
    </div>
  );
}