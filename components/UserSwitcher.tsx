"use client";

import { useCurrentUser } from "@/lib/current-user-context";
import { useTranslations } from "@/lib/i18n/context";
import { Dropdown } from "./Dropdown";

export function UserSwitcher() {
  const { users, currentUser, setCurrentUserId } = useCurrentUser();
  const { t } = useTranslations();

  if (!currentUser) return null;

  return (
    <Dropdown
      prefix={t("userSwitcher.label")}
      value={currentUser.id}
      onChange={setCurrentUserId}
      options={users.map((u) => ({ value: u.id, label: `${u.name} (${u.role})` }))}
    />
  );
}
