import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  Languages,
  Loader2,
  Moon,
  Palette,
  RefreshCw,
  Settings2,
  Shield,
  Sun,
  Trash2,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore, type AppLanguage } from "@/store/settingsStore";
import { useTheme, type Theme } from "@/context/ThemeContext";
import { settingsService } from "@/services/settingsService";
import { getApiErrorMessage } from "@/services/apiClient";
import { useToast } from "@/components/ui/Toast/Toast";
import { Input } from "@/components/ui/Input/Input";
import { PasswordField } from "@/components/ui/PasswordField/PasswordField";
import { Switch } from "@/components/ui/Switch/Switch";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Modal } from "@/components/ui/Modal/Modal";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AVATAR_URL,
  getAvatarSrc,
  normalizeAvatar,
} from "@/lib/avatar";

type SettingsTab = "profile" | "preferences" | "danger";
type DangerStep = "confirm" | "type";

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "km", label: "Khmer" },
  { value: "fr", label: "Français" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  icon,
  children,
}) => (
  <div className="bg-card border border-border rounded-2xl shadow-sm p-6 sm:p-8">
    <div className="flex items-start gap-3 mb-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/10">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-foreground tracking-wide">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

interface ThemeOptionProps {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  label,
  icon,
  active,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "flex flex-col items-center gap-2 w-28 py-4 rounded-2xl border text-xs font-semibold transition-all",
      active
        ? "border-[#E50914] bg-accent/10 text-[#E50914] shadow-sm"
        : "border-border bg-muted/50 text-muted-foreground hover:border-accent/40 hover:text-foreground",
    )}
  >
    <span className="text-muted-foreground">{icon}</span>
    <span className="uppercase tracking-wider text-[10px]">{label}</span>
    {active && (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E50914] text-white">
        <Check className="h-3 w-3" />
      </span>
    )}
  </button>
);

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const updateProfileStore = useAuthStore((state) => state.updateProfile);
  const logoutAsync = useAuthStore((state) => state.logoutAsync);
  const { theme, setTheme } = useTheme();
  const settingsStore = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const [profileLoading, setProfileLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | undefined>(
    normalizeAvatar(user?.avatar),
  );
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [dangerStep, setDangerStep] = useState<DangerStep>("confirm");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    setProfileLoading(true);

    if (!user) {
      setProfileLoading(false);
      return;
    }

    setName(user.name ?? user.username);
    setEmail(user.email);
    setAvatar(normalizeAvatar(user.avatar));

    setProfileLoading(false);
  }, [user, toast]);

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile picture must be 2 MB or smaller");
      return;
    }

    setAvatarBusy(true);
    setAvatarError(false);
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setAvatar(dataUrl);
      updateProfileStore(user.name ?? user.username, user.email, dataUrl);
      setAvatarBusy(false);
      toast.success("Profile picture updated");
    };

    reader.onerror = () => {
      setAvatarBusy(false);
      toast.error("Could not read the selected image");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!user) return;
    setAvatar(undefined);
    setAvatarError(false);
    updateProfileStore(user.name ?? user.username, user.email, null);
    toast.info("Profile picture removed");
  };

  const handleSaveProfile = async () => {
    let valid = true;

    if (!name.trim()) {
      setNameError("Display name is required");
      valid = false;
    } else if (name.trim().length < 2) {
      setNameError("Display name must be at least 2 characters");
      valid = false;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Enter a valid email address");
      valid = false;
    }
    if (!valid || !user) return;

    setSavingProfile(true);
    try {
      const updated = await settingsService.updateProfile(user.id, {
        username: user.username,
        email: email.trim(),
        name: name.trim(),
        role: user.role,
        status: "ACTIVE",
      });
      updateProfileStore(updated.name ?? name.trim(), updated.email);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const errors: PasswordErrors = {};

    if (!currentPassword) errors.current = "Current password is required";
    if (!newPassword) {
      errors.next = "New password is required";
    } else if (newPassword.length < 6) {
      errors.next = "Password must be at least 6 characters";
    }
    if (!confirmPassword) {
      errors.confirm = "Please confirm your new password";
    } else if (confirmPassword !== newPassword) {
      errors.confirm = "Passwords do not match";
    }

    setPasswordErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSavingPassword(true);
    // Demo build: validation + visual feedback only (no backend endpoint yet).
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setSavingPassword(false);
    toast.success("Password updated successfully");
  };

  const handleResetData = async () => {
    setResetBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    settingsStore.resetPreferences();
    if (user) updateProfileStore(user.name ?? user.username, user.email, null);
    setAvatar(undefined);
    setResetBusy(false);
    setResetOpen(false);
    toast.success("Account data has been reset");
  };

  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    await logoutAsync();
    setDeleteBusy(false);
    setDeleteOpen(false);
    setDangerStep("confirm");
    setDeleteConfirmText("");
    toast.success("Your account has been deleted");
    navigate("/");
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Settings2 className="h-4 w-4" />,
    },
    {
      id: "danger",
      label: "Danger Zone",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-wide">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your profile, security, preferences, and account.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors",
                active
                  ? "text-[#E50914] border-[#E50914]"
                  : "text-muted-foreground border-transparent hover:text-foreground",
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -6 }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
          className="space-y-6"
        >
          {activeTab === "profile" && (
            <>
              <SectionCard
                title="Profile Information"
                description="Update your display name, email address and profile picture."
                icon={<User className="h-5 w-5 text-[#E50914]" />}
              >
                {profileLoading ? (
                  <div className="flex items-center justify-center py-14">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Spinner size="md" />
                      <span className="text-sm font-medium">
                        Loading profile...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="relative shrink-0 group">
                        <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-[#E50914]/30 bg-muted shadow-sm">
                          <img
                            src={
                              avatarError
                                ? DEFAULT_AVATAR_URL
                                : getAvatarSrc(avatar)
                            }
                            onError={() => setAvatarError(true)}
                            alt="Profile preview"
                            className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          {avatarBusy && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                              <Loader2
                                className="h-7 w-7 animate-spin text-white"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                          {!avatarBusy && (
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              title="Change profile picture"
                              className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            >
                              <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-900 shadow">
                                <Camera
                                  className="h-3 w-3"
                                  aria-hidden="true"
                                />
                                Change
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2.5">
                        <p className="text-sm font-bold text-foreground">
                          {user?.name ?? user?.username ?? "Your Name"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarBusy}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E50914] text-white hover:bg-[#ff1f2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Camera
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Upload New
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            disabled={avatarBusy || !avatar}
                            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border border-rose-500/25 text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFile}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          PNG or JPG, up to 2 MB. Stored on this device.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Input
                        label="Display Name"
                        placeholder="Your name"
                        value={name}
                        onChange={(event) => {
                          setName(event.target.value);
                          setNameError("");
                        }}
                        error={nameError}
                        autoComplete="name"
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          setEmailError("");
                        }}
                        error={emailError}
                        autoComplete="email"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                      <p className="text-[11px] text-muted-foreground">
                        Your changes are saved to your Cinematique account.
                      </p>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={savingProfile || !user}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingProfile ? (
                          <>
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard
                title="Security"
                description="Change your password. Use at least 6 characters."
                icon={<Shield className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="space-y-4">
                  <PasswordField
                    label="Current Password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        current: undefined,
                      }));
                    }}
                    error={passwordErrors.current}
                    autoComplete="current-password"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField
                      label="New Password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(event) => {
                        setNewPassword(event.target.value);
                        setPasswordErrors((prev) => ({
                          ...prev,
                          next: undefined,
                        }));
                      }}
                      error={passwordErrors.next}
                      autoComplete="new-password"
                    />
                    <PasswordField
                      label="Confirm New Password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(event.target.value);
                        setPasswordErrors((prev) => ({
                          ...prev,
                          confirm: undefined,
                        }));
                      }}
                      error={passwordErrors.confirm}
                      autoComplete="new-password"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Demo build: passwords are validated and applied on this
                    device only.
                  </p>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={savingPassword}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingPassword ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          Updating...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "preferences" && (
            <>
              <SectionCard
                title="Appearance"
                description="Choose whether the admin portal uses a light or dark appearance."
                icon={<Palette className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="flex items-center gap-3">
                  <ThemeOption
                    value="dark"
                    label="Dark"
                    icon={<Moon className="h-5 w-5" />}
                    active={theme === "dark"}
                    onClick={() => {
                      setTheme("dark");
                      toast.success("Dark mode enabled");
                    }}
                  />
                  <ThemeOption
                    value="light"
                    label="Light"
                    icon={<Sun className="h-5 w-5" />}
                    active={theme === "light"}
                    onClick={() => {
                      setTheme("light");
                      toast.success("Light mode enabled");
                    }}
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="General"
                description="System notifications and language preferences."
                icon={<Settings2 className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="divide-y divide-border">
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          System Notifications
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Receive alerts about bookings, payments and cinema
                          activity.
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settingsStore.notifications}
                      onChange={(value) => {
                        settingsStore.setNotifications(value);
                        toast.success(
                          value
                            ? "System notifications enabled"
                            : "System notifications disabled",
                        );
                      }}
                      label="Toggle system notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Language
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Choose your preferred display language.
                        </p>
                      </div>
                    </div>
                    <select
                      value={settingsStore.language}
                      onChange={(event) => {
                        const language = event.target.value as AppLanguage;
                        settingsStore.setLanguage(language);
                        const label =
                          LANGUAGE_OPTIONS.find(
                            (option) => option.value === language,
                          )?.label ?? language;
                        toast.success(`Language set to ${label}`);
                      }}
                      className="bg-muted text-foreground text-xs font-medium rounded-lg border border-border px-3 py-2 outline-none focus:border-[#E50914] focus:ring-2 focus:ring-[#E50914]/20"
                    >
                      {LANGUAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "danger" && (
            <div className="bg-card border border-rose-500/25 rounded-2xl shadow-sm p-6 sm:p-8 space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground tracking-wide">
                    Danger Zone
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Irreversible account actions. Please proceed with caution.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Reset Account Data
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restore preferences, theme and profile picture to
                      defaults.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-rose-500/25 bg-rose-500/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/25 bg-rose-500/10">
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently sign out and mark this account for deletion.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDangerStep("confirm");
                    setDeleteConfirmText("");
                    setDeleteOpen(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Reset account data confirmation */}
      <Modal
        isOpen={resetOpen}
        onClose={resetBusy ? () => undefined : () => setResetOpen(false)}
        title="Reset account data?"
        maxWidth="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-foreground">
            This will restore your preferences, theme and profile picture to
            their defaults.
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setResetOpen(false)}
              disabled={resetBusy}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetData}
              disabled={resetBusy}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white transition-colors disabled:opacity-50"
            >
              {resetBusy ? (
                <>
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                  Resetting...
                </>
              ) : (
                "Reset Data"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete account (strict double confirmation) */}
      <Modal
        isOpen={deleteOpen}
        onClose={deleteBusy ? () => undefined : () => setDeleteOpen(false)}
        title="Delete account?"
        maxWidth="sm"
      >
        {dangerStep === "confirm" ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <p className="text-sm text-foreground">
                Deleting your account will sign you out immediately and this
                action
                <span className="font-semibold text-rose-400">
                  {" "}
                  cannot be undone
                </span>
                .
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setDangerStep("type")}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-foreground">
              Type{" "}
              <span className="font-mono font-bold text-rose-400">DELETE</span>{" "}
              below to confirm permanent account deletion.
            </p>
            <Input
              placeholder="Type DELETE to confirm"
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDangerStep("confirm")}
                disabled={deleteBusy}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteBusy || deleteConfirmText !== "DELETE"}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteBusy ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting...
                  </>
                ) : (
                  "Permanently Delete"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
