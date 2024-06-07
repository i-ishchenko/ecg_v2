"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/navigation";
import { userValidation } from "@/validation/authValidation";
import { Credentials } from "@/types/Credentials";
import FormField from "@/components/auth/FormField";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import banner from "@/assets/authBanner.png";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function signUpPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitHandler = async (values: Credentials) => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      if (res.ok) {
        router.push("/auth/signin");
      } else {
        const errorData = await res.json();
        toast({
          variant: "destructive",
          title: "Couldn't create the account",
          description: errorData.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ooops... Something went wrong",
        description:
          "One of our services is unavailable. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[80vw] md:w-[60vw] lg:w-[50vw] 2xl:w-[40vw] absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-70%] shadow-[15px_15px_41px_#9e9e9e,-15px_-15px_41px_#ffffff] rounded-md flex  overflow-hidden">
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validationSchema={userValidation}
        onSubmit={submitHandler}>
        {({ errors, touched }) => {
          return (
            <Form className="w-2/3 pt-8 pb-10 px-10">
              <h1 className="text-xl font-semibold text-center mb-3">
                Registration
              </h1>
              <FormField
                label="Email"
                name="email"
                errors={errors.email}
                touched={touched.email}
              />
              <FormField
                className="mt-5"
                label="Password"
                name="password"
                errors={errors.password}
                touched={touched.password}
                fieldProps={{
                  type: "password",
                }}
              />
              <div className="flex items-center gap-5 mt-5">
                <Button type="submit" isLoading={isLoading}>
                  Submit
                </Button>
                <Link
                  href="/auth/signin"
                  className="text-sm underline text-zinc-700">
                  Already have an account?
                </Link>
              </div>
            </Form>
          );
        }}
      </Formik>
      <div className="w-1/3 relative overflow-hidden">
        <Image
          className="w-1/3 h-full"
          src={banner}
          alt="banner"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
