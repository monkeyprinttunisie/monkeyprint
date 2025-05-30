"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SaveButton from "@/components/sharedAdminSuperAdmin/SaveButton";
import FileUploader from "@/components/FileUploader";
import { Eye, EyeOff, Mail, Loader2 } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { updateUser } from "@/actions/userActions";
import { getCurrentUser } from "@/actions/authActions";
import { toast } from "react-hot-toast";
import { hashPassword } from "@monkeyprint/utils/hash";
import { comparePassword } from "@monkeyprint/utils/hash";

export default function Component() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [userId, setUserId] = useState<string>("");
  const [userFirstName, setUserFirstName] = useState<string | null>("");
  const [userLastName, setUserLastName] = useState<string | null>("");
  const [userName, setUserName] = useState<string | null>("");
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [userImage, setUserImage] = useState<string | null>("");
  const [userPhone, setUserPhone] = useState<string | null>("");
  const [userRole, setUserRole] = useState<string | null>("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userCurrentHashedPassword, setUserCurrentHashedPassword] = useState<
    string | null
  >("");

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Get user details
        const userData = await getCurrentUser();

        if (userData) {
          setUserId(userData.id);
          setUserFirstName(userData.firstName);
          setUserLastName(userData.lastName);
          setUserImage(userData.image);
          setUserPhone(userData.phoneNumber);
          setUserEmail(userData.email);
          setUserName(userData.name);
          setUserCurrentHashedPassword(userData.password);
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Handle profile save
  const handleProfileSave = async () => {
    try {
      setIsSavingProfile(true);

      // Get values from form inputs
      const firstName = document.getElementById(
        "firstName"
      ) as HTMLInputElement;
      const lastName = document.getElementById("lastName") as HTMLInputElement;
      const email = document.getElementById("username") as HTMLInputElement;
      const phone = document.getElementById("phone") as HTMLInputElement;

      // Create an object with only non-null values
      const updatedUser: Partial<{
        name: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        image: string;
      }> = {};

      if (firstName.value) updatedUser.firstName = firstName.value;
      if (lastName.value) updatedUser.lastName = lastName.value;
      if (email.value) updatedUser.email = email.value;
      if (phone.value) updatedUser.phoneNumber = phone.value;
      if (userImage) updatedUser.image = userImage;

      // Add name if both first and last name exist
      if (firstName.value && lastName.value) {
        updatedUser.name = `${firstName.value} ${lastName.value}`;
      }

      // Call the updateUser action
      await updateUser(userId, updatedUser);
      toast.success("Profile updated successfully!");

      // Update state with new values
      setUserFirstName(firstName.value);
      setUserLastName(lastName.value);
      setUserEmail(email.value);
      setUserPhone(phone.value);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle password save
  const handlePasswordSave = async () => {
    try {
      setIsSavingPassword(true);

      // Validate passwords
      if (newPassword !== confirmPassword) {
        toast.error("New password and confirmation don't match");
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      // Only proceed if current password is provided
      if (!currentPassword) {
        toast.error("Current password is required");
        return;
      }

      if (!userCurrentHashedPassword) {
        toast.error("Cannot verify current password");
        return;
      }

      const isCurrentPasswordValid = await comparePassword(
        currentPassword,
        userCurrentHashedPassword
      );

      if (!isCurrentPasswordValid) {
        toast.error("Current password is incorrect");
        return;
      }

      // Hash the new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Call the updateUser action with just the password
      await updateUser(userId, {
        password: hashedNewPassword,
      });

      toast.success("Password updated successfully!");

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Reset password fields in the form
      (document.getElementById("currentPassword") as HTMLInputElement).value =
        "";
      (document.getElementById("newPassword") as HTMLInputElement).value = "";
      (document.getElementById("confirmPassword") as HTMLInputElement).value =
        "";
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle input changes
  const handlePasswordChange = (
    e: ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mr-2 h-8 w-8 animate-spin text-blue-600"></Loader2>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Details Section */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Profile Details
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Mail
                </Button>
                <SaveButton
                  onSave={handleProfileSave}
                  isSaving={isSavingProfile}
                ></SaveButton>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Profile Picture */}
              <div className="lg:col-span-2 flex flex-col items-center lg:items-start">
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 mb-2">
                  <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                    <img
                      src={userImage || "/default-profile.png"}
                      alt="Profile"
                      sizes="(max-width: 768px) 96px, 96px"
                      className="object-cover"
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
                <FileUploader
                  handleUploadComplete={(res) => {
                    if (res.length > 0) {
                      const uploadedImageUrl =
                        res[0].url || res[0].ufsUrl || "";
                      setUserImage(uploadedImageUrl);
                      toast.success("Profile image updated");
                    }
                  }}
                  buttonText="Change Logo"
                />
              </div>

              {/* Form Fields */}
              <div className="lg:col-span-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First name
                    </label>
                    <Input
                      id="firstName"
                      defaultValue={userFirstName || ""}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="username"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      id="username"
                      defaultValue={userEmail || ""}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last name
                    </label>
                    <Input
                      id="lastName"
                      defaultValue={userLastName || ""}
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <Input
                      id="phone"
                      defaultValue={userPhone || ""}
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Reset Section */}
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Password Settings
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <SaveButton
                  onSave={handlePasswordSave}
                  isSaving={isSavingPassword}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="currentPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    defaultValue=""
                    type={showCurrentPassword ? "text" : "password"}
                    onChange={(e) =>
                      handlePasswordChange(e, setCurrentPassword)
                    }
                    placeholder="Current Password"
                    className="bg-white border-gray-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => handlePasswordChange(e, setNewPassword)}
                    placeholder="New Password"
                    className="bg-white border-gray-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) =>
                      handlePasswordChange(e, setConfirmPassword)
                    }
                    placeholder="Confirm Password"
                    className="bg-white border-gray-300 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
