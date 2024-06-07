import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Header from "@/components/ui/header";
import { User } from "@/types/User";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <Header user={session?.user as User} />
      {children}
    </>
  );
}
