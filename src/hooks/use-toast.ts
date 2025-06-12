
"use client"

// Inspired by react-hot-toast library
import * as React from "react"
import { useCallback } from "react"; // Import useCallback

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 3
export const TOAST_MANUAL_DISMISS_DURATION = 1000000 // Effectively infinite for manual dismiss

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number // Duration for on-screen visibility. If undefined, uses TOAST_MANUAL_DISMISS_DURATION.
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        return {
            ...state,
            toasts: state.toasts.filter((t) => t.id !== toastId)
        }
      } else { // Dismiss all
        return { ...state, toasts: [] };
      }
    }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({
      type: actionTypes.UPDATE_TOAST,
      toast: { ...updateProps, id },
    })
  
  const dismissToast = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
    },
  })

  return {
    id: id,
    dismiss: dismissToast,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    const currentSetState = setState; 
    listeners.push(currentSetState)
    return () => {
      const index = listeners.indexOf(currentSetState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, []) 

  const dismiss = useCallback((toastId?: ToasterToast["id"]) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  }, []); // dispatch is stable, so empty dependency array is fine

  return {
    ...state,
    toast, // The module-level toast function
    dismiss, // The memoized dismiss function
  }
}

export { useToast, toast }
