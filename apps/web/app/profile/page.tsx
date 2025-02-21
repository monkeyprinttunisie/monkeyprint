import { auth } from "@/auth"

export default async function ProfilePage() {
  const session = await auth()

  // If the user is not signed in, show a message
  if (!session?.user) {
    return <div>You are not signed in</div>;
  }

  // If the user is signed in, display the success message with their username
  return (
    <div>
      <h1>User signed in successfully!</h1>
      <p>Welcome, {session.user.email}!</p>
    </div>
  );
};
