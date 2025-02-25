import { signIn } from "@/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    await signIn("credentials", { email, password, redirect: false });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    if ((error as { type: string }).type === "CredentialsSignin") {
      return new Response(JSON.stringify({ error: "Invalid credentials." }), {
        status: 401,
      });
    } else {
      return new Response(JSON.stringify({ error: "Something went wrong." }), {
        status: 500,
      });
    }
  }
}
