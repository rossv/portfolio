import os

# Base template
SVG_TEMPLATE = """<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Inner Drop Shadow -->
    <filter id="{id}_shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.4"/>
    </filter>
    <!-- Glow -->
    <filter id="{id}_glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="{id}_inner_shadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="black" flood-opacity="0.3" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
    <!-- Background Gradient -->
    <linearGradient id="{id}_bg" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="{c1}"/>
      <stop offset="1" stop-color="{c2}"/>
    </linearGradient>
    <!-- Outer Ring Gradient -->
    <linearGradient id="{id}_ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{rc1}"/>
      <stop offset="50%" stop-color="{rc2}"/>
      <stop offset="100%" stop-color="{rc3}"/>
    </linearGradient>
  </defs>
  
  <!-- Outer Ring  -->
  <circle cx="32" cy="32" r="30" fill="url(#{id}_ring)" filter="url(#{id}_shadow)"/>
  
  <!-- Outer Ring Bevel -->
  <circle cx="32" cy="32" r="28" fill="none" stroke="#FFFFFF" stroke-opacity="0.3" stroke-width="1"/>
  <circle cx="32" cy="32" r="29" fill="none" stroke="#000000" stroke-opacity="0.4" stroke-width="1"/>
  
  <!-- Inner Background -->
  <circle cx="32" cy="32" r="26" fill="url(#{id}_bg)" filter="url(#{id}_inner_shadow)"/>

  <!-- Inner Highlight/Glass Curve -->
  <path d="M 10,32 A 22,22 0 0,1 54,32 A 22,12 0 0,0 10,32 Z" fill="#ffffff" opacity="0.15"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1"/>

  <!-- Extra custom background shapes if any -->
  {extra_shapes}

  <!-- Icon Group -->
  <g transform="translate(18, 18) scale(1.16)">
    {icon_path}
  </g>
</svg>
"""

# Ring Colors
RINGS = {
    "bronze": ("#A56A49", "#D28D69", "#774229"),
    "silver": ("#B0B5B9", "#E1E5E8", "#6E7A81"),
    "gold": ("#D4AF37", "#F0E68C", "#AA7814"),
    "diamond": ("#A1EBEB", "#FFFFFF", "#4DB6AC")
}

# Icon library (24x24 scale, 2px stroke usually, but we will mostly use flat fill or unified paths)
ICONS = {
    # 24x24 icons
    "clock": '<circle cx="12" cy="12" r="10" fill="none" stroke="#FFF" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "clock_glow": '<circle cx="12" cy="12" r="10" fill="none" stroke="#FFF" stroke-width="2" filter="url(#{id}_glow)"/><path d="M12 6v6l4 2" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#{id}_glow)"/>',
    "award": '<circle cx="12" cy="8" r="7" fill="none" stroke="#FFF" stroke-width="2"/><path d="M8 13.91 5.3 22l6.7-3.9 6.7 3.9-2.7-8.09" fill="none" stroke="#FFF" stroke-width="2" stroke-linejoin="round"/>',
    "folder": '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" fill="none" stroke="#FFF" stroke-width="2"/>',
    "folders": '<path d="M18 18h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h2"/><path d="m22 20-3.5 3.5"/><path d="M18.5 23.5 22 20"/>', # using generic multi folder looks complex, let's use box
    "box": '<path d="M21 8a2 2 0 0 0-1-1.72l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.72l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" fill="none" stroke="#FFF" stroke-width="2"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    "boxes": '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="#FFF" stroke-width="2"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="#FFF" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" fill="none" stroke="#FFF" stroke-width="2"/>',
    "treasure": '<path d="M2 13h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M2 13V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" fill="none" stroke="#FFF" stroke-width="2"/><path d="M10 13a2 2 0 1 0 4 0" fill="none" stroke="#FFF" stroke-width="2"/>',
    "treasure_glow": '<path d="M2 13h20v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z" fill="none" stroke="#FFF" stroke-width="2" filter="url(#{id}_glow)"/><path d="M2 13V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6" fill="none" stroke="#FFF" stroke-width="2" filter="url(#{id}_glow)"/><path d="M10 13a2 2 0 1 0 4 0" fill="#FFF" filter="url(#{id}_glow)"/>',
    "rocket": '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="none" stroke="#FFF" stroke-width="2"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" fill="none" stroke="#FFF" stroke-width="2"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" fill="none" stroke="#FFF" stroke-width="2"/>',
    "map": '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6" fill="none" stroke="#FFF" stroke-width="2"/><line x1="9" y1="3" x2="9" y2="18" stroke="#FFF" stroke-width="2"/><line x1="15" y1="6" x2="15" y2="21" stroke="#FFF" stroke-width="2"/>',
    "compass": '<circle cx="12" cy="12" r="10" fill="none" stroke="#FFF" stroke-width="2"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="none" stroke="#FFF" stroke-width="2"/>',
    "lamp": '<path d="M14 18h8M2 18h4" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><path d="M9 13C9 13 8 13 8 18" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><path d="M15 13H5c0-4 4-5 4-5h4s4 1 4 5Z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M20 8s-3-2-5-2-5 2-5 2" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><path d="M18 10s1 0 1 3-2 3-2 3" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>',
    "lamp_glow": '<path d="M14 18h8M2 18h4M9 13v5" stroke="#FFF" stroke-width="2" stroke-linecap="round" filter="url(#{id}_glow)"/><path d="M15 13H5c0-4 4-5 4-5h4s4 1 4 5Z" fill="none" stroke="#FFF" stroke-width="2" filter="url(#{id}_glow)"/><path d="M22 10s-3-1-5-1-5 1-5 1M18 10s1 0 1 3-2 3-2 3" stroke="#FFF" stroke-width="2" stroke-linecap="round" filter="url(#{id}_glow)"/>',
    "footprints": '<path d="M10.8 19.3c.6 1.3 3.3.4 3.7-1.1.2-.8-.1-1.6-.5-2.2-1.3-1.6-4.5.3-4.5.3-1.7 1-1.1 3.5 1.3 3z" fill="#FFF"/><path d="M11 12.3c.6 0 1.2-.5 1.4-1.2.2-.7 0-1.4-.4-1.8" fill="none" stroke="#FFF" stroke-width="1.5" stroke-linecap="round"/><path d="M12.6 13.9c.7-1 .3-3.1-1.2-3.8-1.5-.6-3.7.1-4.2 1.9-.3 1 .1 2 1.2 2.6.9.5 2.5 1 4.2-.7z" fill="#FFF"/><path d="M18.8 8.8c.7 1-.3 3.1-1.8 3.8-1.4.6-3.7-.1-4.2-1.9-.3-1 .1-2 1.2-2.6.9-.5 2.5-1 4.8.7z" fill="#FFF"/>',
    "hiking": '<path d="m8 3 4 8 5-5 5 15H2L8 3z" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "journal": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="none" stroke="#FFF" stroke-width="2" stroke-linejoin="round"/>',
    "anchor": '<circle cx="12" cy="5" r="3" fill="none" stroke="#FFF" stroke-width="2"/><line x1="12" y1="22" x2="12" y2="8" stroke="#FFF" stroke-width="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="#FFF" stroke-width="2"/><path d="M2.2 12A10 10 0 0 0 22 12" fill="none" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "lotus": '<path d="M12 21.5C9 18.5 7 14 7 10.5 7 6 12 3 12 3s5 3 5 7.5c0 3.5-2 8-5 11z" fill="none" stroke="#FFF" stroke-width="2"/><path d="M7 10.5C5 12 2 14.5 2 17c0 2.5 5 4.5 10 4.5" fill="none" stroke="#FFF" stroke-width="2"/><path d="M17 10.5c2 1.5 5 4 5 6.5 0 2.5-5 4.5-10 4.5" fill="none" stroke="#FFF" stroke-width="2"/>',
    "bubbles": '<circle cx="6" cy="18" r="2" fill="none" stroke="#FFF" stroke-width="1.5"/><circle cx="18" cy="16" r="3" fill="none" stroke="#FFF" stroke-width="1.5"/><circle cx="12" cy="7" r="4" fill="none" stroke="#FFF" stroke-width="1.5"/><path d="M10 5a2 2 0 0 1 2 2" stroke="#FFF" stroke-linecap="round"/>',
}

# (ring_type, c1, c2, icon_key)
BADGES = {
    "badge-time-1": ("bronze", "#3B82F6", "#10B981", "clock"),  # Blue to Emerald
    "badge-time-5": ("silver", "#8B5CF6", "#3B82F6", "clock"),  # Purple to Blue
    "badge-time-15": ("gold", "#F59E0B", "#EF4444", "clock"),   # Amber to Red
    "badge-time-60": ("diamond", "#312E81", "#E11D48", "clock_glow"), # Deep indigo to rose
    "badge-project-1": ("bronze", "#14B8A6", "#06B6D4", "box"), # Teal to Cyan
    "badge-project-10": ("silver", "#6366F1", "#A855F7", "boxes"), # Indigo to Purple
    "badge-project-all": ("diamond", "#F43F5E", "#F59E0B", "treasure_glow"), # Rose to Amber
    "badge-space-nerd": ("diamond", "#0F172A", "#3B0764", "rocket"), # Slate to Deep Purple
    "badge-sections": ("silver", "#64748B", "#0EA5E9", "compass"), # Slate to Light Blue
    "badge-magic-lamp": ("gold", "#D946EF", "#8B5CF6", "lamp"), # Fuchsia to Purple (no glow for simplicity or let's use lamp)
    "badge-journeyman": ("bronze", "#84CC16", "#22C55E", "hiking"), # Lime to Green
    "badge-journal": ("bronze", "#D4D4D8", "#71717A", "journal"), # Silver/Zinc colors
    "badge-footer": ("silver", "#F97316", "#EAB308", "anchor"), # Orange to Yellow
    "badge-budda": ("gold", "#10B981", "#06B6D4", "lotus"), # Emerald to Cyan
    "badge-bubbles": ("diamond", "#EC4899", "#8B5CF6", "bubbles"), # Pink to Purple
}

# Special backgrounds like stars for space nerd
EXTRA_SHAPES = {
    "badge-space-nerd": '''
  <!-- Stars -->
  <circle cx="21" cy="22" r="1.5" fill="#FFF" opacity="0.8"/>
  <circle cx="43" cy="20" r="1" fill="#FFF" opacity="0.6"/>
  <circle cx="47" cy="38" r="1.5" fill="#FFF" opacity="0.9"/>
  <circle cx="20" cy="45" r="1" fill="#FFF" opacity="0.7"/>
  <circle cx="38" cy="50" r="1" fill="#FFF" opacity="0.5"/>
    '''
}

BASE_DIR = r"c:\GitRepos\portfolio\src\assets\badges"
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

for badge_id, (ring_name, c1, c2, icon_key) in BADGES.items():
    rc1, rc2, rc3 = RINGS[ring_name]
    icon_path = ICONS.get(icon_key, ICONS["clock"]) # fallback
    
    # Inject glow class into icon paths if they have {id}
    icon_path_rendered = icon_path.replace("{id}", badge_id)
    extra_shapes = EXTRA_SHAPES.get(badge_id, "")
    
    svg_content = SVG_TEMPLATE.format(
        id=badge_id,
        c1=c1,
        c2=c2,
        rc1=rc1,
        rc2=rc2,
        rc3=rc3,
        icon_path=icon_path_rendered,
        extra_shapes=extra_shapes
    )
    
    out_path = os.path.join(BASE_DIR, f"{badge_id}.svg")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(svg_content)
    
print("All 15 premium SVGs generated successfully.")
