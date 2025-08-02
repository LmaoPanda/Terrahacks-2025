import Image from "next/image";
import { Button } from "@/components/ui/button"
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div>
        <Image
          src = "/heartLogo.png"
          alt = "ReCovr Logo"
          width = {400}
          height = {400}
        />
        <div className = "text-center mb-4">
          <p className = "text-4xl">Welcome to ReCovr.</p>
        </div>
        <div className = "flex justify-center items-center">
          <Link href="/login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div> 
    </div>
  );
}
