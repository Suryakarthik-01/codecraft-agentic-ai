import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed w-full top-0 left-0 right-0 bg-white/7 z-50 h-16 border-b border-white/6 backdrop-blur-md ">
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/">
          <Image src={"/logo.png"} alt="dot dev" height={100} width={100} />
        </Link>
        <div className="flex items-center gap-5">
          <Show when="signed-in">
            <Link
              href="/projects"
              className="text-[13px] font-medium text-white/40 transition-colors hover:text-white/80"
            >
              projects
            </Link>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-white/70">
              <Zap className="h-3 w-3 fill-white/70" /> 3 / 70 credits
            </span>
            <UserButton />
          </Show>

          <Show when="signed-out">
            <SignInButton mode="modal" />
            <SignUpButton mode="modal">
              <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
        </div>
      </nav>
    </header>
  );
}
