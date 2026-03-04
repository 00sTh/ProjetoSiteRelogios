"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldOff, Trash2, Loader2 } from "lucide-react";
import { setUserAdminRole, deleteAdminUser } from "@/actions/users";

interface UserActionsProps {
  userId: string;
  clerkId: string;
  isCurrentAdmin?: boolean;
}

export function UserRoleButton({ userId: _userId, clerkId, isCurrentAdmin }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleToggle() {
    setMsg(null);
    startTransition(async () => {
      const res = await setUserAdminRole(clerkId, !isCurrentAdmin);
      if (res.success) {
        router.refresh();
      } else {
        setMsg(res.error ?? "Erro desconhecido.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleToggle}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isCurrentAdmin
            ? "rgba(224,82,82,0.15)"
            : "rgba(212,175,55,0.12)",
          border: isCurrentAdmin
            ? "1px solid rgba(224,82,82,0.3)"
            : "1px solid rgba(212,175,55,0.3)",
          color: isCurrentAdmin ? "#e05252" : "#D4AF37",
        }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentAdmin ? (
          <ShieldOff className="h-4 w-4" />
        ) : (
          <Shield className="h-4 w-4" />
        )}
        {isCurrentAdmin ? "Remover Admin" : "Tornar Admin"}
      </button>
      {msg && (
        <p className="text-xs" style={{ color: "#e05252" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

export function UserDeleteButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Excluir este usuário? Esta ação não pode ser desfeita.")) return;
    setMsg(null);
    startTransition(async () => {
      const res = await deleteAdminUser(userId);
      if (res.success) {
        router.push("/admin");
      } else {
        setMsg(res.error ?? "Erro desconhecido.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
        style={{
          backgroundColor: "rgba(224,82,82,0.1)",
          border: "1px solid rgba(224,82,82,0.25)",
          color: "#e05252",
        }}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Excluir usuário
      </button>
      {msg && (
        <p className="text-xs" style={{ color: "#e05252" }}>
          {msg}
        </p>
      )}
    </div>
  );
}
