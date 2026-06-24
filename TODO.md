# Implementations needing touch ups

- [ ] Custom cursor
  - Should track on scroll and resize
  - Cursor should not be visible on mobile
  - Tooltip should not be visible on mobile
- [ ] Page titles
  - Stability fix!
- [ ] Page transitions
  - Stability fix!
- [ ] Contact modal
  - Fix shadows
  - Disable scroll
  - Fix inconsitent positioning of model when opening/closing multiple times
  - If mobile, redirect to another contact page
  - If page isn't visible (tabbed in), mute SFX
  - [ ] Implement UI
    - Allow send me a message/contact me forms (two different types to be called)
    - Send me a message should print a message using a thermal printer and raspberry pi
- [ ] 404 page
  - Actually style it!
- [ ] Discord status
  - Add API call
- [ ] Weather service
  - Add snow based on calendar month

# To implement components

- [ ] Splash loading screen
- [ ] "Glitchy" text on hover links
- [ ] Custom buttons
  - [ ] Magnetic to cursor for a small distance
  - [ ] Marquee when hovered
    - Diagonal pattern animation
  - [ ] Secondary and primary style
    - Secordary: Border, transparent bg, black text
    - Primary: White bg, black text

# To implement, generic ideas

- [ ] Three.JS
- [ ] Mobile friendly UI
- [ ] If low FPS or mobile, disable snow/rain, music & transitions

# Pages to create

- [ ] Contact me
- [ ] Timeline CV Page & projects
- [ ] Blog
- [ ] Useful links

# Cleanup

- [ ] CSS
- [ ] TS
- [ ] HTML

# Home page

- [ ] Three.JS room
- [x] Introduction (first section)
- [x] LastFM
- [ ] Featured projects section
- [ ] Current position/job
- [ ] Blog section
- [ ] All systems status section

# Status page

- [ ] Discord status + current lastfm status
- [ ] LastFM history
- [ ] Bsky
- [ ] All (LastFM + Bsky)
- [ ] Visitor status (visits, unique visits, current visiting)

```html
<span class="menu">
  <span class="track">
    <svg
      class="icon"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="2"
        d="M5 7h14M5 12h14M5 17h14"
      />
    </svg>
    <span class="label">Menu</span>
  </span>
</span>
```

```css
.menu {
  display: inline-block;
  height: 24px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

/* this is the moving "stack" */
.track {
  display: flex;
  flex-direction: column;
  transform: translateY(0);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  text-align: center;
  align-items: center;
}

/* each item takes same height */
.icon,
.label {
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* hover moves the whole stack up by one item height */
.menu:hover .track {
  transform: translateY(-24px);
}
```
