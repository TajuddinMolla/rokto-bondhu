"use client";

import * as React from "react";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";

/**
 * Custom hook to consume the central authentication state and actions.
 * Throws a helpful error if called outside an AuthProvider hierarchy.
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
