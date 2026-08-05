import styles from "./site-footer.module.css";

type SocialIconName = "facebook" | "instagram" | "tiktok" | "youtube";

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.3 3.3 5.3 3.3 9S14.2 18.7 12 21M12 3C9.8 5.3 8.7 8.3 8.7 12s1.1 6.7 3.3 9" />
    </svg>
  );
}

function SocialIcon({ name }: { name: SocialIconName }) {
  if (name === "instagram") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle className={styles.iconDot} cx="17.4" cy="6.7" r="1" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14.2 21v-8h2.7l.4-3.2h-3.1v-2c0-.9.3-1.6 1.6-1.6h1.7V3.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H8V13h2.8v8h3.4Z" />
      </svg>
    );
  }

  if (name === "youtube") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M21 8.1a2.8 2.8 0 0 0-2-2C17.3 5.6 12 5.6 12 5.6s-5.3 0-7 .5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.5 12 29 29 0 0 0 3 15.9a2.8 2.8 0 0 0 2 2c1.7.5 7 .5 7 .5s5.3 0 7-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-3.9 29 29 0 0 0-.5-3.9Z" />
        <path className={styles.iconCutout} d="m10 15.3 5-3.3-5-3.3v6.6Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M15.8 3c.3 2.6 1.7 4.2 4.2 4.4v3a8.5 8.5 0 0 1-4.2-1.2v6.1a5.8 5.8 0 1 1-5-5.8v3.1a2.8 2.8 0 1 0 2 2.7V3h3Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 18">
      <path d="M1 9h34M29 2l8 7-8 7" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 0 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
    </svg>
  );
}

const socialIcons: SocialIconName[] = [
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
];

export function SiteFooter() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.footerInner}>
        <div className={styles.promise}>
          <span>
            We listen.
            <strong>We improve. We design better.</strong>
          </span>
          <ArrowIcon />
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.domain}>
          <GlobeIcon />
          <span>sofistikextra.com</span>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div
          className={styles.social}
          aria-label="Sofistike sosyal medya hesabı"
        >
          <div className={styles.socialIcons}>
            {socialIcons.map((icon) => (
              <span key={icon} aria-label={icon} role="img">
                <SocialIcon name={icon} />
              </span>
            ))}
          </div>
          <span>@sofistikextra</span>
        </div>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.betterLiving}>
          <span>#BetterLiving</span>
          <HeartIcon />
        </div>
      </div>
    </footer>
  );
}
