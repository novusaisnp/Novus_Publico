import Image from "next/image";
import styles from "./page.module.css";

const modules = [
  ["Cadastro mestre", "Pessoas, empresas e endereços em uma base única."],
  ["Processos digitais", "Fluxos rastreáveis, documentos e prazos organizados."],
  ["Transparência", "Informações confiáveis para decisões e prestação de contas."],
];

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m5 12 4.2 4.2L19.5 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className={styles.screen}>
      <section className={styles.intro} aria-labelledby="intro-title">
        <Image alt="Novus Público" className={styles.logo} height={2304} priority src="/novus-publico-logo.png" width={4096} />

        <div className={styles.introCopy}>
          <p className={styles.eyebrow}>Núcleo Público</p>
          <h1 id="intro-title">Gestão pública conectada, simples e segura.</h1>
          <p className={styles.summary}>
            Uma base modular para organizar processos, dados e serviços com mais clareza para quem trabalha e para quem utiliza o serviço público.
          </p>
        </div>

        <ul className={styles.moduleList}>
          {modules.map(([title, description]) => (
            <li key={title}>
              <span className={styles.moduleIcon}><CheckIcon /></span>
              <span><strong>{title}</strong><small>{description}</small></span>
            </li>
          ))}
        </ul>

        <p className={styles.footnote}>Tecnologia a serviço de uma administração pública mais próxima.</p>
      </section>

      <section className={styles.access} aria-labelledby="access-title">
        <div className={styles.accessCard}>
          <div className={styles.accessHeading}>
            <span className={styles.lock} aria-hidden="true">⌁</span>
            <p className={styles.eyebrow}>Ambiente administrativo</p>
            <h2 id="access-title">Acesse sua conta</h2>
            <p>Use as credenciais institucionais para continuar.</p>
          </div>

          <form className={styles.form}>
            <label htmlFor="email">E-mail institucional<input autoComplete="email" id="email" name="email" placeholder="voce@orgao.gov.br" type="email" /></label>
            <label htmlFor="password">Senha<input autoComplete="current-password" id="password" name="password" placeholder="Digite sua senha" type="password" /></label>

            <div className={styles.formOptions}>
              <label className={styles.checkbox} htmlFor="remember"><input id="remember" name="remember" type="checkbox" /><span>Lembrar acesso</span></label>
              <span className={styles.comingSoon}>Recuperação em breve</span>
            </div>

            <button className={styles.primaryButton} disabled type="button">Autenticação em preparação <ArrowIcon /></button>
          </form>

          <div className={styles.notice}>
            <span className={styles.noticeIcon} aria-hidden="true">✓</span>
            <p><strong>Acesso restrito</strong>Esta área será destinada exclusivamente a servidores e colaboradores autorizados.</p>
          </div>
        </div>

        <p className={styles.support}>Precisa de ajuda? A central de suporte será disponibilizada junto com a autenticação.</p>
      </section>
    </main>
  );
}
