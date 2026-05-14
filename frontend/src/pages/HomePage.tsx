import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Check, ChevronDown, Image as ImageIcon, Plus, Trash2, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import type { HeaderContext } from "@/layouts/AppLayout";
import { request, type ApiResponse, getApiBaseUrl } from "@/lib/api";

type ProductImage = {
  url: string;
  publicId?: string;
  provider?: "cloudinary" | "local";
};

type ProductRecord = {
  _id: string;
  name: string;
  productType?: string;
  brand?: string;
  stock?: number;
  mrp?: number;
  price?: number;
  exchangeEligibility?: boolean;
  published?: boolean;
  images?: ProductImage[];
};

type ProductForm = {
  name: string;
  productType: string;
  stock: string;
  mrp: string;
  price: string;
  brand: string;
  exchangeEligibility: "Yes" | "No";
};

type ProductCard = ProductRecord & {
  emoji: string;
  bg: string;
};

type ImagePreview = {
  id: string;
  url: string;
  kind: "existing" | "new";
  file?: File;
};

const productTypeOptions = ["Foods", "Electronics", "Clothes", "Beauty Products", "Others"];

const emptyForm: ProductForm = {
  name: "",
  productType: "Foods",
  stock: "",
  mrp: "",
  price: "",
  brand: "",
  exchangeEligibility: "Yes",
};

const gradients = [
  { bg: "from-amber-100 to-amber-200", emoji: "🍫" },
  { bg: "from-pink-100 to-rose-200", emoji: "🍰" },
  { bg: "from-cyan-100 to-teal-200", emoji: "🎂" },
  { bg: "from-purple-100 to-indigo-200", emoji: "📦" },
  { bg: "from-emerald-100 to-lime-200", emoji: "🛍️" },
];

function normalizeProduct(product: ProductRecord, index: number): ProductCard {
  const visual = gradients[index % gradients.length];
  const apiBaseUrl = getApiBaseUrl();

  const normalizedImages = product.images?.map((img) => ({
    ...img,
    url: img.url.startsWith("/") ? `${apiBaseUrl}${img.url}` : img.url,
  }));

  return {
    ...product,
    images: normalizedImages,
    emoji: visual.emoji,
    bg: visual.bg,
  };
}

export default function HomePage() {
  const { setHeaderSearchVisible, headerSearchValue } = useOutletContext<HeaderContext>();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [tab, setTab] = useState<"published" | "unpublished">("published");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ProductCard | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductCard | null>(null);

  useEffect(() => {
    setHeaderSearchVisible(!loading && products.length > 0);

    return () => {
      setHeaderSearchVisible(false);
    };
  }, [loading, products.length, setHeaderSearchVisible]);

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const needle = headerSearchValue.trim().toLowerCase();

    return products.filter((product) => {
      const matchesTab = tab === "published" ? product.published : !product.published;
      const searchable = [product.name, product.brand, product.productType].join(" ").toLowerCase();
      const matchesSearch = !needle || searchable.includes(needle);
      return matchesTab && matchesSearch;
    });
  }, [products, tab, headerSearchValue]);

  async function loadProducts() {
    setLoading(true);
    setError("");

    try {
      const response = await request<ApiResponse<ProductRecord[]>>("/api/products", {
        method: "GET",
      });
      setProducts(response.data.map((product, index) => normalizeProduct(product, index)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function submitProduct(
    form: ProductForm,
    files: File[],
    retainedImages: ProductImage[],
    existingId?: string,
  ) {
    const body = new FormData();
    body.append("name", form.name);
    body.append("productType", form.productType);
    body.append("stock", form.stock || "0");
    body.append("mrp", form.mrp || "0");
    body.append("price", form.price || "0");
    body.append("brand", form.brand);
    body.append("exchangeEligibility", form.exchangeEligibility);
    body.append("published", existingId ? String(editingProduct?.published ?? false) : "false");
    body.append("images", JSON.stringify(retainedImages));

    files.forEach((file) => body.append("images", file));

    const path = existingId ? `/api/products/${existingId}` : "/api/products";
    const method = existingId ? "PUT" : "POST";

    const response = await request<ApiResponse<ProductRecord>>(path, {
      method,
      body,
    });

    setProducts((current) => {
      const next = existingId
        ? current.map((product, index) =>
            product._id === existingId ? normalizeProduct(response.data, index) : product,
          )
        : [...current, normalizeProduct(response.data, current.length)];

      return next;
    });
  }

  async function togglePublish(product: ProductCard) {
    try {
      const response = await request<ApiResponse<ProductRecord>>(`/api/products/${product._id}`, {
        method: "PUT",
        body: { published: !product.published },
      });

      setProducts((current) =>
        current.map((item, index) =>
          item._id === product._id ? normalizeProduct(response.data, index) : item,
        ),
      );
      setToast(product.published ? "Product unpublished" : "Product published");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    }
  }

  async function removeProduct(product: ProductCard) {
    try {
      await request<ApiResponse<null>>(`/api/products/${product._id}`, {
        method: "DELETE",
      });
      setProducts((current) => current.filter((item) => item._id !== product._id));
      setToast("Product deleted successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  const isEmpty = !loading && filteredProducts.length === 0;

  return (
    <div className="px-8 py-4">
      {products.length > 0 && (
        <div className="flex items-center gap-8 border-b border-border mb-6">
          {(["published", "unpublished"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`relative pb-3 text-sm capitalize transition ${
                tab === value ? "text-primary font-semibold" : "text-[#98A2B3]"
              }`}
            >
              {value}
              {tab === value && (
                <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#0B99FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <EmptyState title="Loading products" description="Fetching the latest product catalog." />
      ) : error ? (
        <EmptyState
          title="Unable to load products"
          description={error}
          actionLabel="Try again"
          onAction={() => void loadProducts()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Feels a little empty over here..."
          description="Create your first product to start managing the catalog."
          actionLabel="Add your Products"
          onAction={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
        />
      ) : isEmpty ? (
        <EmptyState
          title="No Products Found"
          description="Try adjusting your search or create a new product."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-card rounded-xl border border-border p-3 shadow-sm">
              <div className="h-44 rounded-lg bg-white flex items-center justify-center overflow-hidden px-6">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-contain"
                    onLoad={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (img.naturalHeight > img.naturalWidth) {
                        img.classList.remove("object-contain");
                        img.classList.add("object-cover");
                      } else {
                        img.classList.remove("object-cover");
                        img.classList.add("object-contain");
                      }
                    }}
                  />
                ) : (
                  <div className="text-7xl">{product.emoji}</div>
                )}
              </div>
              <div className="flex justify-center gap-1 my-2">
                {Array.from({ length: Math.max(1, Math.min(product.images?.length || 0, 5)) }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${index === 0 ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <div className="px-1 pb-1">
                <div className="font-semibold text-sm mb-2 flex items-start justify-between gap-3">
                  <span>{product.name}</span>
                </div>
                <Row label="Product type" value={product.productType || "-"} />
                <Row label="Quantity Stock" value={String(product.stock ?? 0)} />
                <Row label="MRP" value={`₹ ${product.mrp ?? 0}`} />
                <Row label="Selling Price" value={`₹ ${product.price ?? 0}`} />
                <Row label="Brand Name" value={product.brand || "-"} />
                <Row label="Total Number of images" value={String(product.images?.length ?? 0)} />
                <Row label="Exchange Eligibility" value={product.exchangeEligibility ? "YES" : "NO"} />

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => void togglePublish(product)}
                    className={`flex-1 h-9 rounded-md text-xs font-semibold text-white ${
                      product.published
                        ? "bg-gradient-to-b from-[#52D407] to-[#37C100] hover:opacity-90"
                        : "bg-gradient-to-b from-[#000FB4] to-[#4050FF] hover:opacity-90"
                    }`}
                  >
                    {product.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowModal(true);
                    }}
                    className="flex-1 h-9 rounded-md text-xs font-semibold border border-border bg-background hover:bg-muted"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setPendingDelete(product)}
                    className="h-9 w-9 rounded-md border border-border bg-white flex items-center justify-center hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#98A2B3]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          mode={editingProduct ? "edit" : "add"}
          initialProduct={editingProduct}
          onSubmit={async (form, files, retainedImages) => {
            await submitProduct(form, files, retainedImages, editingProduct?._id);
            setShowModal(false);
            setEditingProduct(null);
            setToast(editingProduct ? "Product updated successfully" : "Product added successfully");
            setTimeout(() => setToast(""), 2500);
          }}
        />
      )}

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-border rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 z-50">
          <div className="h-6 w-6 rounded-full bg-success flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-medium">{toast}</span>
          <button onClick={() => setToast("")} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          productName={pendingDelete.name}
          onClose={() => setPendingDelete(null)}
          onConfirm={async () => {
            await removeProduct(pendingDelete);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="text-muted-foreground">{label} -</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="text-[#071074] mb-6">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <rect x="4" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="3.25" />
          <rect x="32" y="4" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="3.25" />
          <rect x="4" y="32" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="3.25" />
          <path d="M42 32v20M32 42h20" stroke="currentColor" strokeWidth="3.25" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <p className="text-xs text-[#98A2B3] mt-2 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 flex items-center gap-1.5 text-sm text-black font-semibold px-3 py-2 rounded-md bg-transparent hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> {actionLabel}
        </button>
      )}
    </div>
  );
}

function ProductModal({
  onClose,
  onSubmit,
  mode,
  initialProduct,
}: {
  onClose: () => void;
  onSubmit: (form: ProductForm, files: File[], retainedImages: ProductImage[]) => Promise<void>;
  mode: "add" | "edit";
  initialProduct: ProductCard | null;
}) {
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [showNameError, setShowNameError] = useState(false);
  const [showProductTypeMenu, setShowProductTypeMenu] = useState(false);
  const [showExchangeMenu, setShowExchangeMenu] = useState(false);
  const [imageItems, setImageItems] = useState<ImagePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productTypeRef = useRef<HTMLDivElement>(null);
  const exchangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!initialProduct) {
      setForm(emptyForm);
      setImageItems([]);
      return;
    }

    setForm({
      name: initialProduct.name,
      productType: initialProduct.productType || "Foods",
      stock: String(initialProduct.stock ?? ""),
      mrp: String(initialProduct.mrp ?? ""),
      price: String(initialProduct.price ?? ""),
      brand: initialProduct.brand || "",
      exchangeEligibility: initialProduct.exchangeEligibility ? "Yes" : "No",
    });
    setImageItems(
      (initialProduct.images || []).map((image, index) => ({
        id: `existing-${index}-${image.publicId || image.url}`,
        url: image.url,
        kind: "existing",
      })),
    );
    setShowNameError(false);
  }, [initialProduct]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productTypeRef.current && !productTypeRef.current.contains(event.target as Node)) {
        setShowProductTypeMenu(false);
      }
      if (exchangeRef.current && !exchangeRef.current.contains(event.target as Node)) {
        setShowExchangeMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.kind === "new") URL.revokeObjectURL(item.url);
      });
    };
  }, [imageItems]);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) return;

    const next = selectedFiles.map((file) => ({
      id: `${file.name}-${file.size}-${window.crypto.randomUUID()}`,
      url: URL.createObjectURL(file),
      kind: "new" as const,
      file,
    }));

    setImageItems((current) => [...current, ...next]);
    event.target.value = "";
  };

  const removeImagePreview = (id: string) => {
    setImageItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.kind === "new") URL.revokeObjectURL(target.url);
      return current.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setShowNameError(true);
      return;
    }

    setShowNameError(false);
    setSubmitting(true);

    try {
      const retainedImages = imageItems
        .filter((item) => item.kind === "existing")
        .map((item) => ({ url: item.url }));
      const files = imageItems.filter((item) => item.kind === "new" && item.file).map((item) => item.file as File);

      await onSubmit(form, files, retainedImages);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-700/45 z-40 flex items-start justify-center pt-16 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold">{mode === "edit" ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <Field label="Product Name">
            <input
              value={form.name}
              onChange={(event) => {
                setForm((current) => ({ ...current, name: event.target.value }));
                if (showNameError && event.target.value.trim()) setShowNameError(false);
              }}
              placeholder="Enter product name"
              className={`w-full h-9 px-3 rounded-md border text-sm focus:outline-none ${showNameError ? "border-[#EF4444]" : "border-input"}`}
            />
            {showNameError && <p className="mt-1 text-xs text-[#EF4444]">Please enter product name</p>}
          </Field>

          <Field label="Product Type">
            <div className="relative" ref={productTypeRef}>
              <button
                type="button"
                onClick={() => setShowProductTypeMenu((current) => !current)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground transition hover:border-[#B4B8D9]"
              >
                <span className={form.productType ? "text-foreground" : "text-muted-foreground"}>
                  {form.productType || "Select product type"}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#344054] transition-transform ${showProductTypeMenu ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-200 origin-top ${showProductTypeMenu ? "pointer-events-auto scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"}`}
              >
                {productTypeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, productType: option }));
                      setShowProductTypeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-muted ${form.productType === option ? "bg-[#F3F4F6] font-semibold text-[#344054]" : "text-[#344054]"}`}
                  >
                    {option}
                    {form.productType === option && <Check className="h-4 w-4 text-[#071074]" />}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="Quantity Stock">
            <input
              type="number"
              value={form.stock}
              onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
              placeholder="Enter quantity stock"
              className="no-spinner w-full h-9 px-3 rounded-md border border-input text-sm focus:outline-none"
            />
          </Field>

          <Field label="MRP">
            <input
              type="number"
              value={form.mrp}
              onChange={(event) => setForm((current) => ({ ...current, mrp: event.target.value }))}
              placeholder="Enter MRP"
              className="no-spinner w-full h-9 px-3 rounded-md border border-input text-sm focus:outline-none"
            />
          </Field>

          <Field label="Selling Price">
            <input
              type="number"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="Enter selling price"
              className="no-spinner w-full h-9 px-3 rounded-md border border-input text-sm focus:outline-none"
            />
          </Field>

          <Field label="Brand Name">
            <input
              type="text"
              value={form.brand}
              onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
              placeholder="Enter brand name"
              className="w-full h-9 px-3 rounded-md border border-input text-sm focus:outline-none"
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Upload Product Images</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Add More Photos
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <div className="min-h-16 rounded-md border border-dashed border-border p-2 flex flex-wrap items-center justify-center gap-2">
              {imageItems.length > 0 ? (
                imageItems.map((image, index) => (
                  <div key={image.id} className="relative h-12 w-12 rounded-md border border-border overflow-hidden">
                    <img src={image.url} alt={`Uploaded product ${index + 1}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImagePreview(image.id)}
                      className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white border border-border flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5 text-muted-foreground" />
                    </button>
                  </div>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-1 text-sm font-bold text-foreground hover:text-[#071074]"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span>Browse</span>
                </button>
              )}
            </div>
          </div>

          <Field label="Exchange or return eligibility">
            <div className="relative" ref={exchangeRef}>
              <button
                type="button"
                onClick={() => setShowExchangeMenu((current) => !current)}
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground transition hover:border-[#B4B8D9]"
              >
                <span className={form.exchangeEligibility ? "text-foreground" : "text-muted-foreground"}>
                  {form.exchangeEligibility || "Select exchange eligibility"}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#344054] transition-transform ${showExchangeMenu ? "rotate-180" : ""}`} />
              </button>

              <div
                className={`absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all duration-200 origin-top ${showExchangeMenu ? "pointer-events-auto scale-y-100 opacity-100" : "pointer-events-none scale-y-95 opacity-0"}`}
              >
                {(["Yes", "No"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setForm((current) => ({ ...current, exchangeEligibility: option }));
                      setShowExchangeMenu(false);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-muted ${form.exchangeEligibility === option ? "bg-[#F3F4F6] font-semibold text-[#344054]" : "text-[#344054]"}`}
                  >
                    {option}
                    {form.exchangeEligibility === option && <Check className="h-4 w-4 text-[#071074]" />}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <div className="px-0 py-3 border-t border-border flex justify-end bg-[#F8F9FB]">
            <button
              type="submit"
              disabled={submitting}
              className="h-8 px-5 bg-gradient-to-b from-[#000FB4] to-[#4050FF] text-white rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Saving..." : mode === "edit" ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmModal({
  productName,
  onClose,
  onConfirm,
}: {
  productName: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  return (
    <div className="fixed inset-0 bg-slate-700/45 z-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-border p-5">
        <h3 className="font-semibold text-lg">Delete Product</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Are you sure you want to delete {productName}?
        </p>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 h-10 rounded-md border border-border text-sm font-semibold">
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="flex-1 h-10 rounded-md bg-red-600 text-white text-sm font-semibold disabled:opacity-70"
          >
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
