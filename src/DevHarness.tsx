import { useTranslation } from "react-i18next";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, Globe, KeyRound } from "lucide-react";
import Dashboard from "@/features/dashboard/Dashboard";
import Accounts from "@/features/accounts/Accounts";
import { Button } from "@/components/ui/button";
import { writeAccessToken } from "@/lib/auth";

/**
 * STANDALONE dev harness. This mimics the bits the SHELL would normally provide (a top bar,
 * navigation between the two exposed screens, a language switcher, and a way to paste a dev
 * JWT) so the remote is fully usable on its own at :5171. None of this ships to the shell —
 * the shell only ever loads the exposed Dashboard/Accounts modules.
 */
export function DevHarness() {
  const { i18n, t } = useTranslation();
  const location = useLocation();

  function promptForToken() {
    // Dev convenience: paste a JWT obtained from the gateway login. It is stored under the
    // SAME localStorage key the shell uses, so the RTK Query Bearer header works immediately.
    const token = window.prompt("Paste a dev JWT (stored under securebank.token):");
    if (token) {
      writeAccessToken(token.trim());
      window.location.reload();
    }
  }

  const navItem = (to: string, label: string, Icon: typeof Wallet) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
          (active ? "bg-secondary text-secondary-foreground" : "hover:bg-accent")
        }
      >
        <Icon className="h-4 w-4" /> {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
              SecureBank
            </span>
            <span className="text-xs text-muted-foreground">mfe-accounts · :5171 (standalone)</span>
          </div>
          <nav className="flex items-center gap-1">
            {navItem("/dashboard", t("dashboard.title"), LayoutDashboard)}
            {navItem("/accounts", t("accounts.title"), Wallet)}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={promptForToken}>
              <KeyRound className="h-4 w-4" /> JWT
            </Button>
            <select
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              value={i18n.language}
              onChange={(e) => void i18n.changeLanguage(e.target.value)}
              aria-label="Language"
            >
              <option value="en">EN</option>
              <option value="hi">हि</option>
              <option value="mr">मरा</option>
            </select>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}
