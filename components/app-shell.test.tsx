import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

const mocks = vi.hoisted(() => ({
  pathname: "/exchange",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/components/providers/app-provider", () => ({
  useApp: () => ({
    authChecked: true,
    hydrated: true,
    state: {
      session: { name: "Vincent" },
    },
  }),
}));

describe("AppShell", () => {
  it("renders five destinations in desktop and mobile navigation", () => {
    render(
      <AppShell>
        <p>頁面內容</p>
      </AppShell>,
    );

    const desktopNavigation = screen.getByRole("navigation", {
      name: "桌面主要導航",
    });
    const mobileNavigation = screen.getByRole("navigation", {
      name: "手機主要導航",
    });

    expect(within(desktopNavigation).getAllByRole("link")).toHaveLength(5);
    expect(within(mobileNavigation).getAllByRole("link")).toHaveLength(5);
    expect(
      within(desktopNavigation).getByRole("link", { name: "最新匯率" }),
    ).toHaveClass("bg-primary-soft", "text-primary-strong");
    expect(
      within(mobileNavigation).getByRole("link", { name: "最新匯率" }),
    ).toHaveClass("text-primary-strong");
  });

  it("uses an equal five-column mobile layout", () => {
    render(
      <AppShell>
        <p>頁面內容</p>
      </AppShell>,
    );

    expect(
      screen.getByRole("navigation", { name: "手機主要導航" }),
    ).toHaveClass("grid-cols-5", "gap-0", "px-1");
  });
});
