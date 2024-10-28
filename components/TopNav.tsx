interface NavProps {
  isLoggedIn: boolean;
}

export default function TopNav({isLoggedIn}: NavProps) {
  const menus = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];
  const loggedInMenus = [
    { name: 'Profile', path: '/profile' },
    { name: 'Sign Out', path: '/signout' },
  ];
  const nonLoggedInMenus = [
    { name: 'Sign In', path: '/signin' },
    { name: 'Sign Up', path: '/signup' },
  ];

  return (
    <div class="bg-white max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <div class="text-2xl ml-1 font-bold">
        BerryFlex BackOffice
      </div>
      <ul class="flex gap-6">
        {menus.map((menu) => (
          <li>
            <a
              href={menu.path}
              class="text-black hover:text-blue-400 py-1 border-gray-500">
              {menu.name}
            </a>
          </li>
        ))}

        {
          isLoggedIn ?
            (
              loggedInMenus.map((menu) => (
                <li>
                  <a
                    href={menu.path}
                    class="text-black hover:text-blue-400 py-1 border-gray-500">
                    {menu.name}
                  </a>
                </li>
              ))
            ) : (
              nonLoggedInMenus.map((menu) => (
                <li>
                  <a
                    href={menu.path}
                    class="text-black hover:text-blue-400 py-1 border-gray-500">
                    {menu.name}
                  </a>
                </li>
              ))
            )
        } 
      </ul>
    </div>
  );
}