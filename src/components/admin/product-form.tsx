"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/admin";
import { MediaPickerButton } from "./media-picker-button";

interface ProductFormData {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  featured: boolean;
  active: boolean;
  ingredients: string | null;
  usage: string | null;
  categoryId: string;
  brand: string | null;
  model_name: string | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: ProductFormData;
  categories: CategoryOption[];
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product ? product.images : []
  );
  const [newUrl, setNewUrl] = useState("");

  function addUrl() {
    if (newUrl.trim()) {
      setImageUrls((prev) => [...prev, newUrl.trim()]);
      setNewUrl("");
    }
  }

  function removeUrl(idx: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("imageUrls", JSON.stringify(imageUrls));

    startTransition(async () => {
      let result;
      if (product) {
        result = await updateProduct(product.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (!result.success) {
        setError(result.error ?? "Erro desconhecido");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/admin/products"), 1000);
      }
    });
  }

  const labelStyle = {
    color: "rgba(200,187,168,0.7)",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  };

  const inputStyle = {
    backgroundColor: "rgba(20,20,20,0.8)",
    border: "1px solid rgba(201,201,201,0.2)",
    borderRadius: "0.75rem",
    color: "#F5F5F5",
    padding: "0.625rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: "rgba(34,197,94,0.1)", color: "#4ADE80", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          Produto salvo com sucesso! Redirecionando...
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Name */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label style={labelStyle}>Nome do produto *</label>
          <input
            name="name"
            defaultValue={product?.name}
            required
            style={inputStyle}
            placeholder="Ex: Sérum Facial Vitamina C"
          />
        </div>

        {/* Slug */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Slug (URL) *</label>
          <input
            name="slug"
            defaultValue={product?.slug}
            required
            pattern="[a-z0-9-]+"
            style={inputStyle}
            placeholder="serum-facial-vitamina-c"
          />
        </div>

        {/* Brand */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Marca</label>
          <input
            name="brand"
            defaultValue={product?.brand ?? ""}
            style={inputStyle}
            placeholder="Ex: Rolex, Cartier, Louis Vuitton"
            autoComplete="off"
          />
        </div>

        {/* Model */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Modelo</label>
          <input
            name="model_name"
            defaultValue={product?.model_name ?? ""}
            style={inputStyle}
            placeholder="Ex: Submariner, Neverfull, Speedmaster"
            autoComplete="off"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Categoria *</label>
          <select
            name="categoryId"
            defaultValue={product?.categoryId}
            required
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Selecionar...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Preço (R$) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={product ? product.price : ""}
            required
            style={inputStyle}
            placeholder="99.90"
          />
        </div>

        {/* Stock */}
        <div className="flex flex-col gap-1.5">
          <label style={labelStyle}>Estoque *</label>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            required
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label style={labelStyle}>Descrição *</label>
          <textarea
            name="description"
            defaultValue={product?.description}
            required
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder="Descreva o produto, seus benefícios e ingredientes principais..."
          />
        </div>

        {/* Ingredients */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label style={labelStyle}>Ingredientes (um por linha)</label>
          <textarea
            name="ingredients"
            defaultValue={product?.ingredients ?? ""}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder={"Aqua\nNiacinamide 10%\nZinc PCA\nHyaluronic Acid"}
          />
          <p className="text-xs" style={{ color: "rgba(200,187,168,0.45)" }}>
            Cada linha será exibida como um item no accordion da página do produto.
          </p>
        </div>

        {/* Usage */}
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label style={labelStyle}>Modo de Uso (um passo por linha)</label>
          <textarea
            name="usage"
            defaultValue={product?.usage ?? ""}
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
            placeholder={"Aplique sobre a pele limpa e seca.\nMassageie suavemente por 30 segundos.\nUse pela manhã e à noite."}
          />
          <p className="text-xs" style={{ color: "rgba(200,187,168,0.45)" }}>
            Cada linha será exibida como um passo numerado no accordion.
          </p>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              value="on"
              defaultChecked={product?.featured}
              className="rounded"
            />
            <span style={{ color: "#9A9A9A", fontSize: "0.875rem" }}>Produto em destaque</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="active"
              value="on"
              defaultChecked={product?.active ?? true}
              className="rounded"
            />
            <span style={{ color: "#9A9A9A", fontSize: "0.875rem" }}>Produto ativo</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="flex flex-col gap-3">
        <label style={labelStyle}>Imagens</label>

        {/* File upload */}
        <div
          className="rounded-xl p-4"
          style={{ border: "1px dashed rgba(201,201,201,0.3)", backgroundColor: "rgba(20,20,20,0.8)" }}
        >
          <p className="text-xs mb-2" style={{ color: "rgba(200,187,168,0.6)" }}>
            Upload de arquivo (principal)
          </p>
          <input
            name="imageFile"
            type="file"
            accept="image/*"
            style={{ color: "#9A9A9A", fontSize: "0.8rem" }}
          />
        </div>

        {/* URL input */}
        <div className="flex gap-2">
          <input
            type="url"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            style={{ ...inputStyle }}
            placeholder="https://... (URL da imagem)"
          />
          <MediaPickerButton
            onSelect={(url) => {
              setImageUrls((prev) => [...prev, url]);
              setNewUrl("");
            }}
          />
          <button
            type="button"
            onClick={addUrl}
            className="px-4 py-2 rounded-xl text-sm font-semibold shrink-0"
            style={{ backgroundColor: "rgba(201,201,201,0.15)", color: "#C9C9C9", border: "1px solid rgba(201,201,201,0.3)" }}
          >
            + URL
          </button>
        </div>

        {imageUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`img ${idx + 1}`}
                  className="h-16 w-16 object-cover rounded-lg"
                  style={{ border: "1px solid rgba(201,201,201,0.3)" }}
                />
                <button
                  type="button"
                  onClick={() => removeUrl(idx)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "#e05252", color: "white" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold tracking-wider transition-all duration-200 disabled:opacity-50"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          {isPending ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl text-sm transition-colors"
          style={{ color: "rgba(200,187,168,0.6)" }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
