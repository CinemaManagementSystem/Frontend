import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Edit2,
  Globe,
  Info,
  Languages,
  Laptop,
  Loader2,
  LogOut,
  Mail,
  Monitor,
  Moon,
  RefreshCw,
  Save,
  Settings2,
  Shield,
  Smartphone,
  Sun,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore, type AppLanguage } from "@/store/settingsStore";
import { settingsService } from "@/services/settingsService";
import { getApiErrorMessage } from "@/services/apiClient";
import { useToast } from "@/components/ui/Toast/Toast";
import { Input } from "@/components/ui/Input/Input";
import { PasswordField } from "@/components/ui/PasswordField/PasswordField";
import { Switch } from "@/components/ui/Switch/Switch";
import { Spinner } from "@/components/ui/Spinner/Spinner";
import { Modal } from "@/components/ui/Modal/Modal";
import { Badge } from "@/components/ui/Badge/Badge";
import { cn } from "@/lib/utils";
import {
  DEFAULT_AVATAR_URL,
  getAvatarSrc,
  normalizeAvatar,
} from "@/lib/avatar";

type SettingsTab = "profile" | "preferences" | "danger";
type DangerStep = "confirm" | "type";
type ThemeMode = "dark" | "light" | "system";

interface PasswordErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
  iconType: "desktop" | "mobile" | "laptop";
}

const INITIAL_SESSIONS: SessionItem[] = [
  {
    id: "sess-1",
    device: "Windows 11 PC",
    browser: "Chrome 124",
    location: "Phnom Penh, Cambodia",
    ip: "203.144.144.12",
    lastActive: "Active now",
    isCurrent: true,
    iconType: "desktop",
  },
  {
    id: "sess-2",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile",
    location: "Phnom Penh, Cambodia",
    ip: "119.82.251.4",
    lastActive: "2 hours ago",
    isCurrent: false,
    iconType: "mobile",
  },
  {
    id: "sess-3",
    device: 'MacBook Pro 14"',
    browser: "Edge 123",
    location: "Siem Reap, Cambodia",
    ip: "175.100.12.88",
    lastActive: "3 days ago",
    isCurrent: false,
    iconType: "laptop",
  },
];

const LANGUAGE_OPTIONS: { value: AppLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "km", label: "Khmer" },
  { value: "fr", label: "Français" },
];

const TIMEZONE_OPTIONS = [
  { value: "Asia/Phnom_Penh", label: "Asia/Phnom Penh (GMT+7)" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (GMT+7)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
  { value: "UTC", label: "UTC (GMT+0)" },
  { value: "America/New_York", label: "America/New York (GMT-5)" },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 22/09/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 09/22/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2026-09-22)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (e.g. 22 Sep 2026)" },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  if (!pwd) return { score: 0, label: "", color: "", barColor: "" };
  if (pwd.length < 6) {
    return {
      score: 1,
      label: "Weak — minimum 6 characters required",
      color: "text-rose-400",
      barColor: "bg-rose-500",
    };
  }
  const hasNumbers = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);

  let variety = 0;
  if (hasNumbers) variety++;
  if (hasSpecial) variety++;
  if (hasUpper && hasLower) variety++;

  if (pwd.length >= 8 && variety >= 2) {
    return {
      score: 3,
      label: "Strong password",
      color: "text-emerald-400",
      barColor: "bg-emerald-500",
    };
  }
  return {
    score: 2,
    label: "Medium — add symbols and uppercase letters",
    color: "text-amber-400",
    barColor: "bg-amber-500",
  };
}

interface SectionCardProps {
  title: string;
  description?: string;
  subtitleExtra?: React.ReactNode;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  subtitleExtra,
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
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
        {subtitleExtra}
      </div>
    </div>
    {children}
  </div>
);

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const toast = useToast();
  const user = useAuthStore((state) => state.user);
  const updateProfileStore = useAuthStore((state) => state.updateProfile);
  const logoutAsync = useAuthStore((state) => state.logoutAsync);
  const settingsStore = useSettingsStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile Tab States
  const [profileLoading, setProfileLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() => {
    return localStorage.getItem("cinematique_profile_last_updated") || "Today at 14:32";
  });
  const [avatar, setAvatar] = useState<string | undefined>(
    normalizeAvatar(user?.avatar),
  );
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [avatarValidationError, setAvatarValidationError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>(INITIAL_SESSIONS);
  const [showDemoBanner, setShowDemoBanner] = useState(true);

  // Preferences States
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [timezone, setTimezone] = useState("Asia/Phnom_Penh");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [notificationPrefs, setNotificationPrefs] = useState({
    bookingAlerts: true,
    occupancyWarnings: true,
    paymentFailures: true,
    dailySummary: false,
  });

  // Danger Zone States
  const [resetOpen, setResetOpen] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [dangerStep, setDangerStep] = useState<DangerStep>("confirm");
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  const userEmail = user?.email || "admin@cinematique.com";

  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

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
  }, [user]);

  // Unsaved changes detection
  const hasUnsavedChanges = useMemo(() => {
    if (!user) return false;
    const nameChanged = name.trim() !== (user.name ?? user.username ?? "").trim();
    const emailChanged = email.trim() !== (user.email ?? "").trim();
    const avatarChanged = avatar !== normalizeAvatar(user.avatar);
    const passwordDirty = currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
    return nameChanged || emailChanged || avatarChanged || passwordDirty;
  }, [avatar, confirmPassword.length, currentPassword.length, email, name, newPassword.length, user]);

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAvatarValidationError(null);

    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      const err = "Invalid file format. Please choose an image (PNG, JPG, or WEBP).";
      setAvatarValidationError(err);
      toast.error(err);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      const err = "File size exceeds 2 MB. Please select a smaller photo.";
      setAvatarValidationError(err);
      toast.error(err);
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
      setAvatarValidationError(null);
      toast.success("Profile picture updated");
    };

    reader.onerror = () => {
      setAvatarBusy(false);
      const err = "Could not read the selected image file";
      setAvatarValidationError(err);
      toast.error(err);
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (!user) return;
    setAvatar(undefined);
    setAvatarError(false);
    setAvatarValidationError(null);
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

      const nowFormatted = new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      setLastUpdated(nowFormatted);
      localStorage.setItem("cinematique_profile_last_updated", nowFormatted);

      setIsEmailEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    const errors: PasswordErrors = {};

    if (!currentPassword) {
      errors.current = "Current password is required";
    } else if (
      currentPassword !== "admin123" &&
      currentPassword !== "password" &&
      currentPassword !== "admin"
    ) {
      // Mock validation rule: check against demo password
      errors.current = "Incorrect current password. (Demo: try 'admin123')";
    }

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
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
    setSavingPassword(false);
    toast.success("Password updated successfully");
  };

  const handleToggle2FA = (checked: boolean) => {
    setTwoFactorEnabled(checked);
    if (checked) {
      toast.success("Two-Factor Authentication enabled");
    } else {
      toast.info("Two-Factor Authentication disabled");
    }
  };

  const handleLogoutSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast.success("Session logged out");
  };

  const handleLogoutAllOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success("All other sessions have been logged out");
  };

  const handleDiscardAllChanges = () => {
    if (user) {
      setName(user.name ?? user.username);
      setEmail(user.email);
      setAvatar(normalizeAvatar(user.avatar));
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
    setIsEmailEditing(false);
    setIsVerifyingEmail(false);
    setAvatarValidationError(null);
    toast.info("Unsaved changes discarded");
  };

  const handleResetData = async () => {
    setResetBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    settingsStore.resetPreferences();
    if (user) updateProfileStore(user.name ?? user.username, user.email, null);
    setAvatar(undefined);
    setResetBusy(false);
    setResetOpen(false);
    toast.success("Account data has been reset to defaults");
  };

  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    await logoutAsync();
    setDeleteBusy(false);
    setDeleteOpen(false);
    setDangerStep("confirm");
    setDeleteConfirmEmail("");
    toast.success("Your account has been deleted");
    navigate("/");
  };

  const passwordStrength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const passwordsMatch = Boolean(
    newPassword && confirmPassword && newPassword === confirmPassword,
  );

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
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-wide">
          Settings
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage your profile, security credentials, preferences, and account.
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
              {/* Profile Information */}
              <SectionCard
                title="Profile Information"
                description="Update your display name, email address and profile picture."
                subtitleExtra={
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
                    <Clock className="w-3 h-3 text-muted-foreground/80" />
                    Last updated:{" "}
                    <span className="font-medium text-foreground">
                      {lastUpdated}
                    </span>
                  </p>
                }
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
                    {/* Avatar Upload */}
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
                          {user?.name ?? user?.username ?? "Administrator"}
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

                        {/* Stored on this device with Tooltip */}
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span>PNG or JPG, up to 2 MB.</span>
                          <span className="relative group inline-flex items-center gap-1 cursor-help underline decoration-dotted underline-offset-2">
                            <span>Stored on this device</span>
                            <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            {/* Hover tooltip */}
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-60 p-2.5 rounded-lg bg-popover border border-border shadow-2xl text-[11px] leading-relaxed text-foreground font-normal z-30 pointer-events-none">
                              Profile avatar images are cached in your local
                              browser storage and won&apos;t automatically sync
                              across other browsers or devices.
                            </span>
                          </span>
                        </div>

                        {/* Avatar validation error message */}
                        {avatarValidationError && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {avatarValidationError}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inputs: Display Name & Email */}
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

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">
                            Email Address
                          </label>
                          {!isEmailEditing ? (
                            <button
                              type="button"
                              onClick={() => setIsEmailEditing(true)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-[#E50914] hover:underline"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setIsEmailEditing(false);
                                setEmail(user?.email || "");
                                setEmailError("");
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          readOnly={!isEmailEditing}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setEmailError("");
                          }}
                          error={emailError}
                          autoComplete="email"
                          className={cn(
                            !isEmailEditing &&
                              "bg-muted/40 cursor-not-allowed opacity-85 text-muted-foreground",
                          )}
                        />
                        {isEmailEditing && (
                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[11px] text-muted-foreground">
                              Changing email will require verification.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsVerifyingEmail(true)}
                              className="text-xs font-semibold text-[#E50914] hover:underline"
                            >
                              Verify New Email
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Verification Flow Stub */}
                    {isVerifyingEmail && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200">
                        <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-foreground">
                            Verification link sent to{" "}
                            <span className="underline">{email}</span>
                          </p>
                          <p className="text-muted-foreground text-[11px] leading-relaxed">
                            Please check your inbox to confirm your new email.
                            Your primary contact address will update once
                            verified.
                          </p>
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsVerifyingEmail(false);
                                setIsEmailEditing(false);
                                toast.success(
                                  `Email verified and updated to ${email}`,
                                );
                              }}
                              className="text-xs font-bold text-[#E50914] hover:underline"
                            >
                              Simulate email verification
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsVerifyingEmail(false)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
                      <p className="text-[11px] text-muted-foreground">
                        Profile modifications sync with your active account
                        credentials.
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
                          "Save Profile"
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Security Card */}
              <SectionCard
                title="Security"
                description="Manage your password, authentication methods, and active sessions."
                icon={<Shield className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="space-y-8">
                  {/* Password Change Form */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Change Password
                    </h3>

                    {/* Current Password with Mock Check */}
                    <div>
                      <PasswordField
                        label="Current Password"
                        placeholder="Enter current password (try 'admin123')"
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
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* New Password with Strength Meter */}
                      <div className="space-y-1.5">
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
                        {/* Live password strength meter */}
                        {newPassword.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <div className="flex gap-1.5">
                              <div
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-colors",
                                  passwordStrength.score >= 1
                                    ? passwordStrength.barColor
                                    : "bg-muted",
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-colors",
                                  passwordStrength.score >= 2
                                    ? passwordStrength.barColor
                                    : "bg-muted",
                                )}
                              />
                              <div
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-colors",
                                  passwordStrength.score >= 3
                                    ? passwordStrength.barColor
                                    : "bg-muted",
                                )}
                              />
                            </div>
                            <p
                              className={cn(
                                "text-[11px] font-medium",
                                passwordStrength.color,
                              )}
                            >
                              {passwordStrength.label}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password with Match Indicator */}
                      <div className="space-y-1.5">
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
                        {/* Inline match checkmark */}
                        {confirmPassword.length > 0 && (
                          <div className="pt-1">
                            {passwordsMatch ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Passwords match</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Passwords do not match</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dismissible Demo Banner */}
                    {showDemoBanner && (
                      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-sky-500/25 bg-sky-500/10 text-xs text-sky-200">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-sky-400 shrink-0" />
                          <span>
                            Demo build: passwords are validated and applied on
                            this device only.
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowDemoBanner(false)}
                          className="text-sky-400 hover:text-sky-200 p-1 rounded-md transition-colors"
                          aria-label="Dismiss banner"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
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

                  {/* 8. Two-Factor Authentication Subsection */}
                  <div className="pt-6 border-t border-border space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-foreground">
                            Two-Factor Authentication (2FA)
                          </h3>
                          <Badge
                            variant={twoFactorEnabled ? "success" : "secondary"}
                            size="sm"
                          >
                            {twoFactorEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorEnabled}
                        onChange={handleToggle2FA}
                        label="Toggle Two-Factor Authentication"
                      />
                    </div>
                  </div>

                  {/* 9. Active Sessions Subsection */}
                  <div className="pt-6 border-t border-border space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">
                          Active Sessions
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Devices and browsers currently authenticated to your
                          cinema console.
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {sessions.length} active
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {sessions.map((sess) => (
                        <div
                          key={sess.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-muted/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                              {sess.iconType === "desktop" ? (
                                <Monitor className="w-4 h-4 text-muted-foreground" />
                              ) : sess.iconType === "laptop" ? (
                                <Laptop className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-bold text-foreground">
                                  {sess.device} · {sess.browser}
                                </p>
                                {sess.isCurrent && (
                                  <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    This device
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {sess.location} · IP: {sess.ip} · {sess.lastActive}
                              </p>
                            </div>
                          </div>

                          {!sess.isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleLogoutSession(sess.id)}
                              className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors self-end sm:self-center"
                            >
                              Log out
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {sessions.length > 1 && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleLogoutAllOtherSessions}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Log out all other sessions
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "preferences" && (
            <>
              {/* 10. Preferences Tab Sections */}
              <SectionCard
                title="Appearance & Theme"
                description="Customize how the administration interface looks on your screen."
                icon={<Sun className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground block mb-2">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3 max-w-md">
                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode("dark");
                          toast.success("Theme set to Dark");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-semibold gap-2",
                          themeMode === "dark"
                            ? "bg-[#E50914]/15 border-[#E50914] text-foreground"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Moon className="w-5 h-5 text-[#E50914]" />
                        <span>Dark (Default)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode("light");
                          toast.info("Light mode preview (system adheres to dark cinema console)");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-semibold gap-2",
                          themeMode === "light"
                            ? "bg-[#E50914]/15 border-[#E50914] text-foreground"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Sun className="w-5 h-5" />
                        <span>Light</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setThemeMode("system");
                          toast.info("Theme follows system preference");
                        }}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-semibold gap-2",
                          themeMode === "system"
                            ? "bg-[#E50914]/15 border-[#E50914] text-foreground"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Laptop className="w-5 h-5" />
                        <span>System</span>
                      </button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Regional & Localization"
                description="Timezone, date formats, and language settings for dashboard reporting."
                icon={<Globe className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="grid gap-5 sm:grid-cols-3">
                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => {
                        setTimezone(e.target.value);
                        toast.success(`Timezone set to ${e.target.value}`);
                      }}
                      className="w-full bg-muted text-foreground text-xs font-medium rounded-lg border border-border px-3 py-2.5 outline-none focus:border-[#E50914]"
                    >
                      {TIMEZONE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Format */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      Date Format
                    </label>
                    <select
                      value={dateFormat}
                      onChange={(e) => {
                        setDateFormat(e.target.value);
                        toast.success(`Date format set to ${e.target.value}`);
                      }}
                      className="w-full bg-muted text-foreground text-xs font-medium rounded-lg border border-border px-3 py-2.5 outline-none focus:border-[#E50914]"
                    >
                      {DATE_FORMAT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Languages className="w-3.5 h-3.5 text-muted-foreground" />
                      Display Language
                    </label>
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
                      className="w-full bg-muted text-foreground text-xs font-medium rounded-lg border border-border px-3 py-2.5 outline-none focus:border-[#E50914]"
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

              {/* Notification Preferences */}
              <SectionCard
                title="Notification Preferences"
                description="Configure which automatic alerts and operational notifications you receive."
                icon={<Bell className="h-5 w-5 text-[#E50914]" />}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Master Notification Toggle
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Enable or pause all system alerts across cinema operations.
                      </p>
                    </div>
                    <Switch
                      checked={settingsStore.notifications}
                      onChange={(val) => {
                        settingsStore.setNotifications(val);
                        toast.success(
                          val
                            ? "All notifications enabled"
                            : "All notifications silenced",
                        );
                      }}
                      label="Master Notification Toggle"
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.bookingAlerts}
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            bookingAlerts: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-border text-[#E50914] focus:ring-[#E50914]/20"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Email alerts for new bookings
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Receive instant confirmations whenever tickets are booked by customers.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.occupancyWarnings}
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            occupancyWarnings: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-border text-[#E50914] focus:ring-[#E50914]/20"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Low occupancy warnings
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Get notified when screenings starting within 2 hours have under 20% capacity sold.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.paymentFailures}
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            paymentFailures: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-border text-[#E50914] focus:ring-[#E50914]/20"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Payment failures &amp; expired KHQR
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Flag failed transactions and payments exceeding 24 hours awaiting verification.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationPrefs.dailySummary}
                        onChange={(e) =>
                          setNotificationPrefs((prev) => ({
                            ...prev,
                            dailySummary: e.target.checked,
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-border text-[#E50914] focus:ring-[#E50914]/20"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          Daily revenue &amp; admissions digest
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Receive an automated summary report every morning at 08:00 AM.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {activeTab === "danger" && (
            /* 11. Danger Zone Styled as Red-Bordered Warning Card */
            <div className="bg-card border-2 border-rose-500/40 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/10">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground tracking-wide">
                    Danger Zone
                  </h2>
                  <p className="text-xs text-rose-400 font-medium mt-0.5">
                    Irreversible account and system actions. Please proceed with extreme caution.
                  </p>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  This action cannot be undone.
                </p>
                <p className="text-[11px] text-rose-300/80 leading-relaxed">
                  Deleting your account will permanently terminate your administrator privileges, invalidate active sessions, and wipe your preferences.
                </p>
              </div>

              {/* Reset Data Option */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/60">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Reset Account Preferences
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restore preferences, notifications, and profile picture to default settings.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Delete Account Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/15">
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Delete Account
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently sign out and purge this administrator profile.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDangerStep("confirm");
                    setDeleteConfirmEmail("");
                    setDeleteOpen(true);
                  }}
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-sm shadow-rose-500/30"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 13. Sticky Save Changes Bar (Appears when hasUnsavedChanges is true) */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky bottom-4 z-40 flex items-center justify-between gap-4 p-4 rounded-xl bg-card/95 backdrop-blur-md border border-[#E50914]/40 shadow-2xl shadow-black/80 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <p className="text-xs font-bold text-foreground">
                  You have unsaved changes
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Save your modifications or discard to reset.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDiscardAllChanges}
                disabled={savingProfile || savingPassword}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (name !== (user?.name ?? user?.username) || email !== user?.email) {
                    await handleSaveProfile();
                  }
                  if (currentPassword || newPassword || confirmPassword) {
                    await handleChangePassword();
                  }
                }}
                disabled={savingProfile || savingPassword}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#E50914] hover:bg-[#ff1f2d] text-white transition-colors shadow-sm shadow-[#E50914]/30 disabled:opacity-50"
              >
                {savingProfile || savingPassword ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset account data confirmation modal */}
      <Modal
        isOpen={resetOpen}
        onClose={resetBusy ? () => undefined : () => setResetOpen(false)}
        title="Reset account data?"
        maxWidth="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-foreground">
            This will restore your preferences, notification options, and profile picture to their default states.
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

      {/* Delete account confirmation modal (requires typing email) */}
      <Modal
        isOpen={deleteOpen}
        onClose={deleteBusy ? () => undefined : () => setDeleteOpen(false)}
        title="Delete Account"
        maxWidth="sm"
      >
        {dangerStep === "confirm" ? (
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                Deleting your account will sign you out immediately and this action{" "}
                <span className="font-bold text-rose-400">
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
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                To confirm permanent deletion, please type your account email address below:
              </p>
              <p className="font-mono text-xs font-bold text-rose-400 select-all p-2 rounded bg-muted/60 border border-border">
                {userEmail}
              </p>
            </div>

            <Input
              placeholder={userEmail}
              value={deleteConfirmEmail}
              onChange={(event) => setDeleteConfirmEmail(event.target.value)}
              autoComplete="off"
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
                disabled={
                  deleteBusy ||
                  deleteConfirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
