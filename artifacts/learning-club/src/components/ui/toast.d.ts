import type * as React from 'react';
import type * as ToastPrimitives from '@radix-ui/react-toast';

export type ToastProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>;
export type ToastActionElement = React.ReactElement<
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>;
