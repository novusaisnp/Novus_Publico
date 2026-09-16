import { redirect } from "next/navigation";
import { LogoutButton } from "./logout-button";
import styles from "./page.module.css";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className={styles.panel}>
      <section className={styles.card} aria-labelledby="panel-title">
        <p className={styles.eyebrow}>Sessão protegida</p>
        <h1 id="panel-title">Acesso confirmado.</h1>
        <p>Você está conectado como <strong>{user.email}</strong>.</p>
        <dl>
          <div><dt>Perfil</dt><dd>Administrador</dd></div>
          <div><dt>Ambiente</dt><dd>{user.tenantId}</dd></div>
        </dl>
        <p className={styles.note}>O painel operacional será construído na próxima etapa. Esta página confirma a proteção da rota e da sessão.</p>
        <LogoutButton />
      </section>
    </main>
  );
}
