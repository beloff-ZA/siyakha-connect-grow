

## Plan: Remove All Public Projects Content

Your client's concern is understood. Here is a complete removal of all public-facing project pages, the projects section on the homepage, project navigation links, portfolio cubes, and gallery images.

### Files to Delete (14 files)
- `src/pages/ProjectsIndex.tsx`
- `src/pages/projects/MaristBrothers.tsx`
- `src/pages/projects/KFCExmile.tsx`
- `src/pages/projects/VillageBakery.tsx`
- `src/pages/projects/Greestone.tsx`
- `src/pages/projects/MaristCapeTown.tsx`
- `src/pages/projects/PelicanClubBahrain.tsx`
- `src/pages/projects/CampusKey.tsx`
- `src/components/Projects.tsx`
- `src/components/PortfolioCubes.tsx`
- All 10 images in `src/assets/gallery/`

### Files to Edit

1. **`src/App.tsx`** — Remove all project page imports and routes (`/projects`, `/projects/marist-brothers-linmeyer`, etc.). Keep helpdesk/admin project routes untouched.

2. **`src/components/Header.tsx`** — Remove "Projects" from both desktop nav and mobile menu.

3. **`src/pages/Index.tsx`** — Remove the `<Projects />` component and its import from the homepage.

4. **`src/pages/WebsiteOrder.tsx`** — Remove the `<PortfolioCubes />` component and its import.

### What stays untouched
- Internal helpdesk pages (`/helpdesk/projects`, `/helpdesk/future-projects`)
- All other pages, services, blog posts, and products

