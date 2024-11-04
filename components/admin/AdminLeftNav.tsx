import { JSX } from "preact";

export default function AdminLeftNav(_props: JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class="group flex flex-col items-center w-16 hover:w-48 transition-all duration-300 pb-4 overflow-hidden border-r border-gray-300">
      <a class="flex items-center w-full h-16 bg-gray-300 px-4" href="/">
        <img src="/images/admin/cubic.svg" class="w-8 h-8" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Dashboard</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/">
        <img src="/images/admin/home.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Home</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/stories">
        <img src="/images/admin/paper.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Stories</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/characters">
        <img src="/images/admin/character.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Characters</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/messages">
        <img src="/images/admin/inbox.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Messages</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/statistics">
        <img src="/images/admin/statistics.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Statistics</span>
      </a>
      <a class="flex items-center w-full h-10 mt-4 rounded hover:bg-gray-300 px-5" href="/admin/configurations">
        <img src="/images/admin/config.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Configurations</span>
      </a>
      <a class="flex items-center w-full h-10 mt-auto rounded hover:bg-gray-300 px-5" href="/admin/accounts">
        <img src="/images/admin/account.svg" class="w-5 h-5" />
        <span class="ml-4 text-gray-800 hidden group-hover:inline-block">Accounts</span>
      </a>
    </div>
  );
}
