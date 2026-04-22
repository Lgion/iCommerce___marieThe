'use client';

import type { MouseEvent } from 'react';

type ProductActionsVariant = 'overlay' | 'footer' | 'detail';

type ProductActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  isDisabled?: boolean;
  variant?: ProductActionsVariant;
};

export default function ProductActions({ onEdit, onDelete, isDisabled = false, variant = 'overlay' }: ProductActionsProps) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div
      className={`productActions productActions--${variant}`}
      role="group"
      aria-label="Actions administrateur produit"
      onClick={handleClick}
    >
      <button
        type="button"
        className="productActions__button productActions__button--edit"
        onClick={onEdit}
        disabled={isDisabled}
        aria-label="Modifier le produit"
      >
        Modifier
      </button>
      <button
        type="button"
        className="productActions__button productActions__button--delete"
        onClick={onDelete}
        disabled={isDisabled}
        aria-label="Supprimer le produit"
      >
        Supprimer
      </button>
    </div>
  );
}
