import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="p-10">
      <div className="flex justify-between">
        <h1>Welcome</h1>

        {userId ? (
          <UserButton />
        ) : (
          <SignInButton />
        )}
      </div>

      <p>User ID: {userId ?? "Not signed in"}</p>
    </main>
  );
}