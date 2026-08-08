import Image from "next/image";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo-navy.png"
            alt="NaughtHill Group"
            width={500}
            height={113}
            className="h-auto w-48"
            priority
          />
          <p className="mt-2 text-sm text-grey">Client Portal</p>
        </div>

        {error === "invite_expired" && (
          <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-center text-sm text-amber-800">
            That invite link has expired or already been used. Ask for a new
            one.
          </p>
        )}

        <LoginForm next={next ?? "/dashboard"} />

        <p className="mt-6 text-center text-xs text-grey">
          Don&apos;t have an account? Access is by invitation — contact your
          NaughtHill representative.
        </p>
      </div>
    </div>
  );
}
