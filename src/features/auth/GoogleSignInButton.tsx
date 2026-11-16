import type { ButtonHTMLAttributes } from 'react';

import googleG from './assets/google-g.svg';

// The only labels Google's branding guidelines permit (localized variants are also allowed).
// https://developers.google.com/identity/branding-guidelines
type GoogleSignInLabel =
  | 'Sign in with Google'
  | 'Sign up with Google'
  | 'Continue with Google';

export type GoogleSignInButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  label?: GoogleSignInLabel;
};

/**
 * Light-theme, rectangular "Sign in with Google" button per Google's branding guidelines.
 * The logo is the official asset from Google's signin-assets bundle, cropped to the glyph.
 * Keep the label fixed while pending (it must stay an approved string); use `disabled`.
 */
export function GoogleSignInButton({
  label = 'Continue with Google',
  className,
  type = 'button',
  ...props
}: GoogleSignInButtonProps) {
  const classes = [
    'group relative inline-flex h-10 max-w-[400px] items-center overflow-hidden whitespace-nowrap rounded-[4px] border border-[#747775] bg-white px-3 font-google text-sm/5 font-medium text-[#1F1F1F] transition-shadow duration-200',
    'enabled:cursor-pointer enabled:hover:shadow-[0_1px_2px_0_rgba(60,64,67,0.30),0_1px_3px_1px_rgba(60,64,67,0.15)]',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B57D0]',
    'disabled:cursor-default disabled:border-[#1F1F1F]/12',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...props}>
      {/* Material state layer: tints the surface on hover/focus/press without recoloring the logo. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#303030] opacity-0 transition-opacity duration-200 group-enabled:group-hover:opacity-8 group-enabled:group-focus-visible:opacity-12 group-enabled:group-active:opacity-12"
      />
      <img
        src={googleG}
        alt=""
        aria-hidden="true"
        width={20}
        height={20}
        className="mr-2.5 size-5 shrink-0 group-disabled:opacity-38"
      />
      <span className="flex-1 truncate text-center group-disabled:opacity-38">
        {label}
      </span>
    </button>
  );
}
