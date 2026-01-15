import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <main className="bg-white dark:bg-black sm:items-start">
        <ul>
          <li>
            <Link
              href="/users"
              className="text-xl font-bold text-blue-700 hover:text-blue-700"
            >
              Dynamic User List Filter
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
