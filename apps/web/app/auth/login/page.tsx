"use client";

import "../amplifyClient";
import { BaseButton } from "@/components/reusable/BaseButton";
import { login, logout } from "../actions";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AV Call Button</h1>

      <BaseButton onClick={login}>Login</BaseButton>
      <BaseButton onClick={logout}>
        Logout
      </BaseButton>
    </main>
  );
}
