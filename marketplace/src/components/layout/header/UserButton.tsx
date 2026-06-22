"use client";

import Link from "next/link";
import { IconUser } from "@tabler/icons-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { IconButton } from "@component/ui/buttons";

export default function UserButton() {
  const { isAuthenticated, isLoading } = useAuth();

  const href = isAuthenticated ? "/profile" : "/signin";

  return (
    <Link href={href}>
      <IconButton
        borderRadius={8}
        ml="1rem"
        bg="gray.200"
        p="12px"
        disabled={isLoading}
      >
        <IconUser size={16} stroke={1.5} />
      </IconButton>
    </Link>
  );
}
