import { auth, currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  return (
    <div className="relative isolate overflow-hidden min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 md:p-24 text-center">
      {/* Background radial glow */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-transparent opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="max-w-2xl animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
          {user ? `Welcome back, ${user.firstName || "Developer"}` : "Design. Build. Innovate."}
        </h1>
        <p className="mt-6 text-lg leading-8 text-foreground/70">
          This is a premium developer portfolio integrated with Clerk Authentication. Build modern web applications with beautiful layouts, glassmorphism designs, and smooth user interactions.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="#projects"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background shadow-md hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            View Projects
          </Link>
          <Link
            href="#contact"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors duration-200"
          >
            Learn more <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Decorative blurred background orb on right */}
      <div
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 bg-gradient-to-tr from-primary/30 to-transparent opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}