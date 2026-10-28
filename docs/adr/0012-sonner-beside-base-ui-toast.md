# Sonner beside the Base UI toast

Kosmos ships Sonner, Emil Kowalski's toast library, as the `sonner` registry item, wrapped in the Kosmos look. It sits beside the Base UI `toast` item; it does not replace it. This is the one interactive component that is not built on Base UI, an exception to ADR 0001.

shadcn/ui ships Sonner as its toast, so developers who install Kosmos expect `toast()` from `sonner` and its API (`toast.success`, `toast.promise`, an `action`). The maintainer also wants Sonner's motion and behavior as Emil built them. Its stack spreads on hover, a fast flick closes a toast as well as a long drag, and timers pause while the tab is in the background. A toast behind the front one fades where it sits when it closes. The Base UI toast lacks the last three.

## Considered options

- **Close the gaps in the Base UI toast and ship no Sonner.** Rejected: it keeps one toast, but Kosmos would be rebuilding Sonner by hand, and developers coming from shadcn would still look for `sonner`.
- **Replace the Base UI toast with Sonner.** Rejected: it would break every app that already installed `toast`. The Base UI toast also has things Sonner lacks: an alert for `priority: 'high'`, and a stack that stays spread out under reduced motion.
- **Port Sonner's source into the registry (ADR 0010).** Rejected: we would own about 1,500 lines that Sonner keeps up to date for us. The wrapper keeps Sonner as an npm dependency and changes only its look.

## Consequences

- The wrapper renders Sonner `unstyled` and dresses every part in Kosmos tokens. Toasts take the popover surface and shadow, a status tint on the icon only (no `richColors`), Kosmos buttons, and a close button. Sonner's own CSS still runs the stack, the swipe and the motion.
- Sonner injects its CSS without a layer, so it beats Tailwind's layered utilities on the properties it sets: transitions, outline and the focus shadow. The wrapper wins those back with `!` utilities. Under reduced motion Sonner turns every transition off, and the wrapper brings the fade back.
- The docs page says to render one of the two Toasters, not both. The Kosmos `Toaster` from `sonner` shows toasts only in the first one mounted without an `id`. A layout and a page that both mount it never double a toast.
- The `sonner` item ships a third-party notice with Sonner's and shadcn's copyright lines (ADR 0010).
