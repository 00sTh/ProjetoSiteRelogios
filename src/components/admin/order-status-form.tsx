"use client";

import { useTransition, useState } from "react";
import { updateOrderStatus } from "@/actions/admin";
import { ORDER_STATUS_LABEL } from "@/lib/constants";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSave() {
    setMsg(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      setMsg(
        result.success
          ? { ok: true, text: "Status atualizado!" }
          : { ok: false, text: result.error ?? "Erro" }
      );
    });
  }

  const selectStyle = {
    backgroundColor: "#0F2E1E",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "0.75rem",
    color: "#F5F5F5",
    padding: "0.5rem 0.75rem",
    width: "100%",
    fontSize: "0.875rem",
    cursor: "pointer",
  };

  return (
    <div className="flex flex-col gap-3">
      <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABEL[s as keyof typeof ORDER_STATUS_LABEL] ?? s}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={isPending || status === currentStatus}
        className="py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
        style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
      >
        {isPending ? "Salvando..." : "Salvar status"}
      </button>
      {msg && (
        <p
          className="text-xs text-center"
          style={{ color: msg.ok ? "#4ADE80" : "#F87171" }}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
