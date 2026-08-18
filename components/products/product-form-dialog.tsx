"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiMutation } from "@/lib/hooks/use-api";
import { createProduct, updateProduct, type ProductInput } from "@/lib/api/products";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductCategory, ProductStatus } from "@/types";

const CATEGORIES: ProductCategory[] = [
  "Electronics",
  "Apparel",
  "Home & Living",
  "Beauty",
  "Sports",
  "Accessories",
];

const STATUSES: ProductStatus[] = ["active", "draft", "archived"];

const schema = z.object({
  name: z.string().min(3, "Give the product a name of at least 3 characters"),
  sku: z
    .string()
    .min(3, "SKU is required")
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers and dashes only"),
  category: z.enum(["Electronics", "Apparel", "Home & Living", "Beauty", "Sports", "Accessories"]),
  status: z.enum(["active", "draft", "archived"]),
  price: z.coerce.number<number>().positive("Price must be greater than 0"),
  cost: z.coerce.number<number>().min(0, "Cost cannot be negative"),
  stock: z.coerce.number<number>().int("Whole units only").min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number<number>().int().min(0),
  description: z.string().min(10, "Add a short description (10+ characters)"),
});

type FormValues = z.input<typeof schema>;

const EMPTY: FormValues = {
  name: "",
  sku: "",
  category: "Electronics",
  status: "draft",
  price: 0,
  cost: 0,
  stock: 0,
  lowStockThreshold: 15,
  description: "",
};

function Field({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSaved?: () => void;
}) {
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      product
        ? {
            name: product.name,
            sku: product.sku,
            category: product.category,
            status: product.status,
            price: product.price,
            cost: product.cost,
            stock: product.stock,
            lowStockThreshold: product.lowStockThreshold,
            description: product.description,
          }
        : EMPTY,
    );
  }, [open, product, reset]);

  const save = useApiMutation(async (values: ProductInput) =>
    product ? updateProduct(product.id, values) : createProduct(values),
  );

  const price = Number(watch("price")) || 0;
  const cost = Number(watch("cost")) || 0;
  const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

  const onSubmit = handleSubmit(async (values) => {
    const result = await save.mutate(schema.parse(values) as ProductInput);
    if (!result) {
      toast.error("Could not save the product. Please try again.");
      return;
    }
    toast.success(isEdit ? "Product updated" : "Product created", {
      description: `${result.name} · ${result.sku}`,
    });
    onOpenChange(false);
    onSaved?.();
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "New product"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the catalogue entry. Changes apply immediately in this demo."
              : "Add a product to the catalogue. Validation runs with Zod before anything is saved."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <DialogBody className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Product name"
              error={errors.name?.message}
              className="sm:col-span-2"
            >
              <Input
                {...register("name")}
                aria-invalid={Boolean(errors.name)}
                placeholder="Aurora Wireless Earbuds"
                autoFocus
              />
            </Field>

            <Field label="SKU" error={errors.sku?.message}>
              <Input
                {...register("sku")}
                aria-invalid={Boolean(errors.sku)}
                placeholder="EL-1042"
                className="font-mono"
              />
            </Field>

            <Field label="Category" error={errors.category?.message}>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value as ProductCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Price (€)"
              error={errors.price?.message}
              hint={price > 0 ? `Margin ${margin.toFixed(0)}% · ${formatCurrency(price - cost)}` : undefined}
            >
              <Input
                type="number"
                step="0.01"
                min="0"
                {...register("price")}
                aria-invalid={Boolean(errors.price)}
              />
            </Field>

            <Field label="Unit cost (€)" error={errors.cost?.message}>
              <Input type="number" step="0.01" min="0" {...register("cost")} />
            </Field>

            <Field label="Stock on hand" error={errors.stock?.message}>
              <Input type="number" min="0" {...register("stock")} />
            </Field>

            <Field
              label="Low stock threshold"
              error={errors.lowStockThreshold?.message}
              hint="Triggers the low-stock badge in Inventory"
            >
              <Input type="number" min="0" {...register("lowStockThreshold")} />
            </Field>

            <Field label="Status" error={errors.status?.message} className="sm:col-span-2">
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as ProductStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="capitalize">
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field
              label="Description"
              error={errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                {...register("description")}
                aria-invalid={Boolean(errors.description)}
                placeholder="What makes this product worth buying?"
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting || save.isPending}>
              {isEdit ? "Save changes" : "Create product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
