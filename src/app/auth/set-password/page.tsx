import Image from "next/image";
import SetPasswordForm from "./SetPasswordForm";

export default function SetPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/logo-navy.png"
            alt="NaughtHill Group"
            width={500}
            height={113}
            className="mb-3 h-auto w-48"
            priority
          />
          <h1 className="font-heading text-xl font-bold text-navy">
            Welcome to NaughtHill
          </h1>
          <p className="mt-1 text-sm text-grey">
            Set a password to finish creating your account.
          </p>
        </div>

        <SetPasswordForm />
      </div>
    </div>
  );
}
