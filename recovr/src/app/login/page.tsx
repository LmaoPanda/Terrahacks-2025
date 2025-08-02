import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link";

export default function login() {
  return (
    <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Login to your account.</h1>

        <label className="block font-semibold mb-1">Email.</label>
        <Input className="mb-4 border-2 rounded-md" type="email" placeholder="Enter your email" />

        <label className="block font-semibold mb-1">Password.</label>
        <Input className="mb-2 border-2 rounded-md" type="password" placeholder="Enter your password" />

        <div className="flex justify-between text-sm font-semibold mb-4">
          <Link href="/forgot-password" className="hover:underline">Forgot Password?</Link>
          <Link href="/register" className="hover:underline">Create Account</Link>
        </div>
        <Link href="/browse">
            <Button className="w-full rounded-xl bg-black text-white hover:bg-gray-800">
            Login
            </Button>
        </Link>
      </div>
    </div>
  );
}
