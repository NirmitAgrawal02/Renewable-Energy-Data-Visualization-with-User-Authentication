"use client" 
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { RiMoonFill, RiSunLine } from "react-icons/ri";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation"; 

interface NavItem {
  label: string;
  page: string;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const pathname = usePathname();
  const [navbar, setNavbar] = useState(false);
  const router = useRouter(); 

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const NAV_ITEMS: Array<NavItem> = [
    { label: user ? "Logout" : "Login", page: user ? "/" : "/login" }, 
    { label: "Dashboard", page: "/dashboard" },
    { label: "About", page: "/about" },
  ];
  const handleLogout = () => {
    logout(); 
    setNavbar(false); 
    router.push("/"); 
  };

  return (
    <header className="w-full mx-auto px-4 sm:px-20 fixed top-0 z-50 shadow bg-white dark:bg-stone-900 dark:border-b dark:border-stone-600">
      <div className="justify-between md:items-center md:flex">
        <div>
          <div className="flex items-center justify-between py-3 md:py-5 md:block">
            <Link href="home">
              <div className="container flex items-center space-x-2">
                <h2 className="text-2xl font-bold">Renewable Energy Dashboard</h2>
              </div>
            </Link>
            <div className="md:hidden">
              <button
                className="p-2 text-gray-700 rounded-md outline-none focus:border-gray-400 focus:border"
                onClick={() => setNavbar(!navbar)}
              >
                {navbar ? <IoMdClose size={30} /> : <IoMdMenu size={30} />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <div
            className={`flex-1 justify-self-center pb-3 mt-8 md:block md:pb-0 md:mt-0 transition-all ease-in-out duration-300 ${
              navbar ? "block" : "hidden"
            }`}
          >
            <div className="items-center justify-center space-y-8 md:flex md:space-x-6 md:space-y-0">
              {NAV_ITEMS.map((item, idx) => {
                return (
                  <Link
                    key={idx}
                    href={item.page}
                    className="block lg:inline-block text-neutral-900 hover:text-neutral-500 dark:text-neutral-100 cursor-pointer"
                    onClick={() => {
                      if (item.label === "Logout") {
                        handleLogout();
                      } else {
                        setNavbar(false);
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {currentTheme === "dark" ? (
                <button
                  onClick={toggleTheme}
                  className="bg-slate-100 p-2 rounded-xl"
                >
                  <RiSunLine size={25} color="black" />
                </button>
              ) : (
                <button
                  onClick={toggleTheme}
                  className="bg-slate-100 p-2 rounded-xl"
                >
                  <RiMoonFill size={25} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
