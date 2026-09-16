"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export function AccessForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      setError("Não foi possível validar suas credenciais. Verifique os dados e tente novamente.");
      setIsSubmitting(false);
      return;
    }

    router.replace("/painel");
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="email">
        E-mail institucional
        <input autoComplete="email" id="email" name="email" placeholder="voce@orgao.gov.br" required type="email" />
      </label>
      <label htmlFor="password">
        Senha
        <input autoComplete="current-password" id="password" name="password" placeholder="Digite sua senha" required type="password" />
      </label>

      <div className={styles.formOptions}>
        <label className={styles.checkbox} htmlFor="remember">
          <input id="remember" name="remember" type="checkbox" />
          <span>Lembrar acesso</span>
        </label>
        <span className={styles.comingSoon}>Recuperação em breve</span>
      </div>

      {error ? <p className={styles.formError} role="alert">{error}</p> : null}

      <button className={styles.primaryButton} disabled={isSubmitting} type="submit">
        {isSubmitting ? "Validando acesso..." : "Entrar"}
        <ArrowIcon />
      </button>
    </form>
  );
}
