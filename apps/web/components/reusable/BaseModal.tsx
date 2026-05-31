"use client";

import React from "react";
import {
  Dialog,
  Portal,
  type DialogContentProps,
  type DialogRootProps,
} from "@chakra-ui/react";

type BaseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: DialogRootProps["size"];
  scrollBehavior?: DialogRootProps["scrollBehavior"];
  contentProps?: DialogContentProps;
};

function BaseModalBody({ children }: { children: React.ReactNode }) {
  return <Dialog.Body>{children}</Dialog.Body>;
}

function BaseModalFooter({ children }: { children: React.ReactNode }) {
  return <Dialog.Footer gap={3}>{children}</Dialog.Footer>;
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  size,
  scrollBehavior,
  contentProps,
}: BaseModalProps) {
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose();
      }}
      size={size}
      scrollBehavior={scrollBehavior}
    >
      <Portal>
        <Dialog.Backdrop bg="bg" opacity={1} />
        <Dialog.Positioner>
          <Dialog.Content
            bg="surfaceElevated"
            borderWidth="1px"
            borderColor="cardBorder"
            borderRadius="xl"
            shadow="outer"
            {...contentProps}
          >
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>
            {children}
            <Dialog.CloseTrigger />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}

BaseModal.Body = BaseModalBody;
BaseModal.Footer = BaseModalFooter;
