import { auth } from "@/auth";
import SignOut from "@/components/signOutButton";
import { Link } from "@/../i18n/navigation";

export default async function ProfilePage() {
  const session = await auth();

  // If the user is not signed in, show a message
  if (!session?.user) {
    return <div>You are not signed in</div>;
  }

  // If the user is signed in, display the success message with their username
  return (
    <div>
      <Link href="/admin/team" className="text-blue-500">
        Go to Team Page
      </Link>
      <SignOut />
    </div>
  );
}
