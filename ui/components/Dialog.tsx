"use client";

import React from "react";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

/* ---------------------------- CONTENT ---------------------------- */

interface ContentProps
  extends React.ComponentProps<typeof SubframeCore.Dialog.Content> {
  children?: React.ReactNode;
  className?: string;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content(
  { children, className, ...otherProps }: ContentProps,
  ref
) {
  return children ? (
    <SubframeCore.Dialog.Content asChild={true} {...otherProps}>
      <div
        className={SubframeUtils.twClassNames(
          "flex min-w-[320px] flex-col items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background p-4 shadow-lg max-h-[90vh] overflow-auto",
          className
        )}
        ref={ref}
      >
        {children}
      </div>
    </SubframeCore.Dialog.Content>
  ) : null;
});

/* ---------------------------- ROOT ---------------------------- */

interface DialogRootProps
  extends React.ComponentProps<typeof SubframeCore.Dialog.Root> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const DialogRoot = React.forwardRef<HTMLDivElement, DialogRootProps>(
  function DialogRoot(
    { children, className, ...otherProps }: DialogRootProps,
    ref
  ) {
    return
      (
      <SubframeCore.Dialog.Root {...otherProps}>
        {children}
      </SubframeCore.Dialog.Root>
    );
  }
);

/ ---------------------------- HEADER ---------------------------- /

interface HeaderProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ icon, title, description, className }) => (
  <div
    className={SubframeUtils.twClassNames(
      "flex w-full flex-col items-start gap-2 border-b border-neutral-border pb-3",
      className
    )}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-body-bold font-body-bold text-default-font">{title}</span>
    </div>
    {description && (
      <span className="text-caption font-caption text-subtext-color">{description}</span>
    )}
  </div>
);

/ ---------------------------- ACTIONS ---------------------------- /

interface ActionsProps {
  primaryButton?: React.ReactNode;
  secondaryButton?: React.ReactNode;
  className?: string;
}

const Actions: React.FC<ActionsProps> = ({
  primaryButton,
  secondaryButton,
  className,
}) => (
  <div
    className={SubframeUtils.twClassNames(
      "flex w-full justify-end gap-2 pt-3 border-t border-neutral-border",
      className
    )}
  >
    {secondaryButton}
    {primaryButton}
  </div>
);

// / ---------------------------- EXPORT ---------------------------- /

// 1. Asigna el componente principal (DialogRoot) a un nuevo nombre de exportación (Dialog)
const Dialog = DialogRoot as React.FC<DialogRootProps> & {
  Content: typeof Content;
  Header: typeof Header;
  Actions: typeof Actions;
};

// 2. Adjunta estáticamente los subcomponentes definidos
Dialog.Content = Content;
Dialog.Header = Header;
Dialog.Actions = Actions;

// 3. Exporta el componente compuesto
export { Dialog };

// Nota: Elimina cualquier exportación previa como 'BaseDialog' si ya no la necesitas.
