import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

export const PhoneIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  </Base>
)

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="1" />
    <path d="m3.6 6.6 8.4 6 8.4-6" />
  </Base>
)

export const InstagramIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.9" fill="currentColor" stroke="none" />
  </Base>
)

export const WhatsAppIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.4-4.5a8.4 8.4 0 1 1 15.6-4.3Z" />
    <path d="M9.2 8.6c.3-.1.6 0 .8.3l.7 1.2c.1.3.1.6-.1.8l-.5.5c.4.8 1 1.4 1.8 1.8l.5-.5c.2-.2.5-.2.8-.1l1.2.7c.3.2.4.5.3.8-.2.7-.9 1.1-1.6 1-2.4-.4-4.5-2.5-4.9-4.9-.1-.7.3-1.4 1-1.6Z" />
  </Base>
)

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </Base>
)

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </Base>
)

export const SparkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5c.6 4.4 1.6 5.4 6 6-4.4.6-5.4 1.6-6 6-.6-4.4-1.6-5.4-6-6 4.4-.6 5.4-1.6 6-6Z" />
    <path d="M18 16.5c.3 2 .8 2.5 2.8 2.8-2 .3-2.5.8-2.8 2.8-.3-2-.8-2.5-2.8-2.8 2-.3 2.5-.8 2.8-2.8Z" />
  </Base>
)

export const ArrowIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 12h16M14.5 6.5 20 12l-5.5 5.5" />
  </Base>
)

export const ChevronIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m8 5 7 7-7 7" />
  </Base>
)

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)

export const PlusIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)

export const UploadIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" />
    <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
  </Base>
)

export const LinkIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.4 1.4" />
    <path d="M14 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.4-1.4" />
  </Base>
)

export const TrashIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4.5 7h15M9.5 7V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5V7" />
    <path d="M6.5 7l.8 12.1A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
  </Base>
)

export const GripIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" />
  </Base>
)

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Base>
)

export const AlertIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4.2M12 17.2v.2" />
  </Base>
)

export const LogoutIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
    <path d="M17 8.5 20.5 12 17 15.5M20 12h-9" />
  </Base>
)

export const LoomIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="4" width="17" height="16" rx="1" />
    <path d="M8 4v16M12 4v16M16 4v16M3.5 9h17M3.5 15h17" />
  </Base>
)

export const ScissorsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="17.5" r="2.6" />
    <circle cx="6" cy="6.5" r="2.6" />
    <path d="M8.3 8 20 18.5M8.3 16 20 5.5" />
  </Base>
)

export const NeedleIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 4 9.5 14.5" />
    <path d="M9.5 14.5 7 20l5.5-2.5" />
    <ellipse cx="5.5" cy="18.5" rx="1.6" ry="2.4" transform="rotate(-40 5.5 18.5)" />
  </Base>
)

export const philosophyIcons = {
  loom: LoomIcon,
  scissors: ScissorsIcon,
  needle: NeedleIcon,
} as const
