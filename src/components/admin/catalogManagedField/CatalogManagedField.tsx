"use client";

import { useId, useState } from "react";
import { CatalogManagerModal } from "@/components/admin/productForm/CatalogManagerModal";
import "./_catalogManagedField.scss";

type CatalogType = "brand" | "category";

type CatalogManagedFieldProps = {
  label: string;
  type: CatalogType;
  value: string;
  inputName: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  onValueChange: (value: string) => void;
  onOptionsChange: (names: string[]) => void;
};

export function CatalogManagedField({
  label,
  type,
  value,
  inputName,
  options,
  placeholder,
  required = false,
  onValueChange,
  onOptionsChange,
}: CatalogManagedFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const datalistId = useId();

  return (
    <label className="catalogManagedFieldLabel">
      <span className="catalogManagedFieldHead">
        <span>{label}</span>
        <button
          type="button"
          className="catalogManagedFieldManageButton"
          aria-label={`Gestionar ${label.toLowerCase()}`}
          onClick={() => setIsModalOpen(true)}
        >
          ⚙
        </button>
      </span>

      <div>
        <input
          className="productFormInput"
          name={inputName}
          list={datalistId}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={placeholder}
          required={required}
        />
        <datalist id={datalistId}>
          {options.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      </div>

      <CatalogManagerModal
        isOpen={isModalOpen}
        type={type}
        initialItems={options}
        onClose={() => setIsModalOpen(false)}
        onItemsChange={onOptionsChange}
        onPick={(name) => {
          onValueChange(name);
          setIsModalOpen(false);
        }}
      />
    </label>
  );
}
