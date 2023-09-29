import { getProviders, signOut, useSession } from "next-auth/react";
import * as React from "react";
import { BiLogOut } from "react-icons/bi";
import { BsArrowRightShort } from "react-icons/bs";

import { CreateAccount } from "@/components/ui/create-account";
import Layout from "@/layouts/layout";
import { Link, Loader } from "lucide-react";

export default function Home() {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <Layout>
      <HomeContent />
    </Layout>
  );
}

const HomeContent = () => {
  const { data: sessionData, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center">
        <CreateAccount />
      </div>
    );
  }

  return (
    <>
      <div className="ml-auto">
        <a
          href="#"
          className="flex items-center space-x-2 text-red-500"
          onClick={() => void signOut()}
        >
          <BiLogOut size={14} />
          <p>Sign out</p>
        </a>
      </div>

      <div className="flex flex-col gap-5">
        <h1 className="text-xl">Hello {sessionData.user?.name}</h1>

        <Link
          href="/dashboards"
          className="flex items-center space-x-2 text-blue-500"
        >
          <p>Go to Dashboard</p>
          <BsArrowRightShort size={24} />
        </Link>
      </div>
    </>
  );
};

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
