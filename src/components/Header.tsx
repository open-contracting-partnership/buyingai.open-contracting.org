import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/images/logo.svg";

export default function Header() {
  return (
    <header className="py-7 border-b border-white/10 sticky top-0 z-50 bg-[#3D393D]">
      <div className="w-11/12 mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="shrink-0">
            <Link href="/">
              <Image src={logo} alt="OCP Logo" width={183.19} height={63} />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white/10 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <Link
              href="/chapter/01-introduction"
              className="px-6 py-2.5 bg-[#C8D419] text-black font-semibold rounded hover:bg-[#B5C115] transition-colors font-ibm-plex-sans"
            >
              Get the playbook
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
