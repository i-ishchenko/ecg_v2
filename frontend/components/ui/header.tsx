"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { signOut } from "next-auth/react";
import { User } from "@/types/User";

export default async function Header({ user }: { user: User }) {
  return (
    <header className="py-6 px-16 shadow-md flex justify-between items-center">
      <h3 className="text-xl font-bold">ECG Analysis</h3>
      <nav>
        <ul className="flex gap-5">
          <li>
            <Link href="/">Create New</Link>
          </li>
          <li>
            <Link href="/archive">Archive</Link>
          </li>
        </ul>
      </nav>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>{user?.email}</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
