"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/../i18n/navigation";
import { useCurrentStore } from "@/store/useUserStore";
import { getStoreUserRelationByStore, deleteStoreUserRelation } from "@/actions/storeUserRelationAction";
import { StoreType } from "@monkeyprint/db";
import { toast } from "sonner";

// Define the collaborator type based on your schema
type Collaborator = {
  storeId: string;
  userId: string;
  role: StoreType;
  user?: {
    id: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
    image: string | null;
    phoneNumber: string | null;
  };
};

export default function TeamPage() {
  const t = useTranslations("Team");
  const store = useCurrentStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchCollaborators = async () => {
    if (!store?.id) {
      setLoading(false);
      setError("No store selected");
      return;
    }

    try {
            const collaboratorRelations = await getStoreUserRelationByStore(
store.id
);
      
      // Fetch user details for each collaborator
      const detailedCollaborators = await Promise.all(
        collaboratorRelations.map(async (relation) => {
          // Fetch user details from your database
          const userResponse = await fetch(`/api/users/${relation.userId}`);
          const userData = await userResponse.json();
          
          return {
            ...relation,
            user: userData
          };
        })
      );
      
      setCollaborators(detailedCollaborators);
    } catch (err) {
      console.error("Error fetching collaborators:", err);
      setError("Failed to load team members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, [store?.id]);

  const handleRemoveCollaborator = async (collaborator: Collaborator) => {
    if (!store?.id) return;

    try {
      setIsDeleting(collaborator.userId);
      
      // Call the server action to delete the collaborator
      await deleteStoreUserRelation({
        storeId: store.id,
        userId: collaborator.userId,
      });

      // Update the UI
      setCollaborators((prevCollaborators) =>
        prevCollaborators.filter((c) => c.userId !== collaborator.userId)
      );
      
      toast.success(`${collaborator.user?.firstName || collaborator.user?.name || "Collaborator"} removed successfully`);
    } catch (error) {
      console.error("Failed to remove collaborator:", error);
      toast.error("Failed to remove team member");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("team")}</h1>
        <Link
          href="/team/addCollaborator"
          className="bg-[#004CFF] text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t("addCollaborator")}
        </Link>
      </div>

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004CFF]"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && !error && collaborators.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">{t("noCollaboratorsYet")}</p>
          <p className="mt-2 text-gray-400">{t("addYourFirstTeamMember")}</p>
        </div>
      )}

      {!loading && !error && collaborators.length > 0 && (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("role")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collaborators.map((collaborator) => (
                <tr key={collaborator.userId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {collaborator.user?.image ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={collaborator.user.image}
                          alt={collaborator.user.name || ""}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {(collaborator.user?.firstName?.[0] ||
                            collaborator.user?.name?.[0] ||
                            "U").toUpperCase()}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {collaborator.user?.firstName
                            ? `${collaborator.user.firstName} ${collaborator.user.lastName || ""}`
                            : collaborator.user?.name || collaborator.user?.email || "Unknown User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {collaborator.user?.phoneNumber || ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {collaborator.user?.email || "No email"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        collaborator.role === "OWNER"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {collaborator.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      {t("edit")}
                    </button>
                    {collaborator.role !== "OWNER" && (
                      <button
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        disabled={isDeleting === collaborator.userId}
                        onClick={() => handleRemoveCollaborator(collaborator)}
                      >
                        {isDeleting === collaborator.userId ? t("removing") : t("remove")}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
