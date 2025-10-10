# 🚀 Quick Reference Guide - UI Components

## Import All Components

```tsx
import {
  Button,
  Card, CardHeader, CardBody, CardFooter,
  Input, Textarea, Select,
  Badge,
  Modal,
  ToastProvider, useToast,
  Navigation
} from '@/components/ui';
```

---

## 🔘 Button

```tsx
// Primary action
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Outline style
<Button variant="outline">Learn More</Button>

// Ghost (minimal)
<Button variant="ghost">Skip</Button>

// Danger/destructive
<Button variant="danger">Delete</Button>

// Loading state
<Button variant="primary" isLoading>Processing...</Button>

// Full width
<Button variant="primary" fullWidth>Sign In</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## 🎴 Card

```tsx
// Basic card
<Card>
  <CardBody>
    <p>Simple card content</p>
  </CardBody>
</Card>

// Full card with header and footer
<Card hoverable padding="lg">
  <CardHeader>
    <h3 className="text-lg font-semibold">Card Title</h3>
  </CardHeader>
  <CardBody>
    <p>Main content here...</p>
  </CardBody>
  <CardFooter>
    <Button variant="primary">Action</Button>
  </CardFooter>
</Card>

// Padding options
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="md">Medium padding</Card>
<Card padding="lg">Large padding</Card>

// Hoverable
<Card hoverable>Hover to see shadow</Card>
```

---

## 📝 Input, Textarea, Select

```tsx
// Text input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helperText="We'll never share your email"
  fullWidth
/>

// Textarea
<Textarea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  fullWidth
/>

// Select dropdown
<Select
  label="Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  error={errors.category}
  fullWidth
>
  <option value="">Choose...</option>
  <option value="1">Option 1</option>
  <option value="2">Option 2</option>
</Select>
```

---

## 🏷️ Badge

```tsx
// Default gray
<Badge>Default</Badge>

// Primary (indigo)
<Badge variant="primary">Primary</Badge>

// Success (green)
<Badge variant="success">Active</Badge>

// Warning (amber)
<Badge variant="warning">Pending</Badge>

// Danger (red)
<Badge variant="danger">Urgent</Badge>

// Info (blue)
<Badge variant="info">New</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

---

## 🪟 Modal

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Delete"
  size="md"
  showCloseButton
>
  <p className="mb-4">Are you sure you want to delete this item?</p>
  <div className="flex gap-2 justify-end">
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </div>
</Modal>

// Sizes: sm, md, lg, xl
<Modal size="sm">Small modal</Modal>
<Modal size="xl">Extra large modal</Modal>
```

---

## 🔔 Toast Notifications

### Step 1: Wrap your app with ToastProvider

```tsx
// In app/layout.tsx
import { ToastProvider } from '@/components/ui';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

### Step 2: Use the useToast hook

```tsx
import { useToast } from '@/components/ui';

function MyComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('Operation completed successfully!', 'success');
  };

  const handleError = () => {
    addToast('Something went wrong', 'error', 5000); // 5 second duration
  };

  const handleWarning = () => {
    addToast('Please review your changes', 'warning');
  };

  const handleInfo = () => {
    addToast('New updates available', 'info');
  };

  return (
    <>
      <Button onClick={handleSuccess}>Show Success</Button>
      <Button onClick={handleError}>Show Error</Button>
      <Button onClick={handleWarning}>Show Warning</Button>
      <Button onClick={handleInfo}>Show Info</Button>
    </>
  );
}
```

---

## 🧭 Navigation

```tsx
import { Navigation } from '@/components/ui';

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Tools', href: '/tools' },
  { label: 'Profile', href: '/profile' },
  { label: 'Admin', href: '/admin', roles: ['owner'] }, // Role-restricted
];

<Navigation
  items={navItems}
  logoText="AI Tools Platform"
  logoHref="/dashboard"
/>
```

---

## 🎨 Color Classes (Tailwind)

### Backgrounds
```tsx
bg-indigo-600    // Primary
bg-purple-600    // Secondary
bg-emerald-600   // Success
bg-amber-600     // Warning
bg-rose-600      // Error
bg-sky-600       // Info
bg-slate-50      // Light background
bg-slate-900     // Dark background
```

### Text Colors
```tsx
text-indigo-600  // Primary text
text-slate-900   // Dark text
text-slate-600   // Muted text
text-slate-400   // Subtle text
```

### Borders
```tsx
border-slate-200  // Light border
border-slate-300  // Medium border
border-indigo-600 // Primary border
```

---

## 📏 Spacing Classes

```tsx
p-2    // 8px padding
p-4    // 16px padding
p-6    // 24px padding
p-8    // 32px padding

m-2    // 8px margin
m-4    // 16px margin
m-6    // 24px margin
m-8    // 32px margin

gap-2  // 8px gap (flex/grid)
gap-4  // 16px gap
gap-6  // 24px gap
```

---

## 📱 Responsive Classes

```tsx
// Mobile-first (default, then add breakpoints)
className="text-sm md:text-base lg:text-lg"

// Grid columns
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Flex direction
className="flex-col md:flex-row"

// Padding
className="px-4 sm:px-6 lg:px-8"

// Display
className="hidden md:block"
className="md:hidden" // Hide on desktop
```

---

## 🎭 Common Patterns

### Loading Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
  <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
</div>
```

### Empty State
```tsx
<Card padding="lg" className="text-center">
  <CardBody>
    <div className="text-6xl mb-4">📭</div>
    <h3 className="text-xl font-semibold text-slate-900 mb-2">
      No items found
    </h3>
    <p className="text-slate-600 mb-6">
      Get started by adding your first item
    </p>
    <Button variant="primary" onClick={handleAdd}>
      + Add Item
    </Button>
  </CardBody>
</Card>
```

### Loading Spinner
```tsx
<div className="flex items-center justify-center py-12">
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
</div>
```

### Form with Validation
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <Input
    label="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    error={errors.name}
    fullWidth
    required
  />

  <Textarea
    label="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    error={errors.description}
    fullWidth
    required
  />

  <Select
    label="Category"
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    error={errors.category}
    fullWidth
    required
  >
    <option value="">Select category...</option>
    <option value="1">Category 1</option>
  </Select>

  <div className="flex gap-3">
    <Button type="submit" variant="primary" fullWidth>
      Submit
    </Button>
    <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
      Cancel
    </Button>
  </div>
</form>
```

### Stat Card
```tsx
<Card padding="md">
  <CardBody>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-600 mb-1">Total Users</p>
        <p className="text-3xl font-bold text-indigo-600">1,234</p>
        <p className="text-xs text-emerald-600 mt-1">↑ 12% this month</p>
      </div>
      <div className="text-4xl">👥</div>
    </div>
  </CardBody>
</Card>
```

### Filter Sidebar
```tsx
<Card padding="md">
  <CardBody>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Filters</h2>
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear All
      </Button>
    </div>

    <div className="space-y-4">
      <Input
        label="Search"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
      />

      <Select label="Category" value={category} onChange={handleCategory} fullWidth>
        <option value="">All Categories</option>
        <option value="1">Category 1</option>
      </Select>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Tags
        </label>
        <div className="space-y-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
                className="mr-2"
              />
              <span className="text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  </CardBody>
</Card>
```

---

## ✅ Accessibility Checklist

- [ ] All images have `alt` text
- [ ] All form inputs have `label` or `aria-label`
- [ ] Interactive elements are keyboard accessible
- [ ] Focus states are visible (ring-2 classes)
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Error messages use `role="alert"`
- [ ] Modals trap focus properly
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Headings are in logical order (h1 → h2 → h3)
- [ ] Touch targets are at least 44x44px

---

## 🚀 Performance Tips

1. **Use Next.js Image component** for images
2. **Implement code splitting** with React.lazy()
3. **Debounce search inputs** to reduce API calls
4. **Add loading states** for better perceived performance
5. **Use CSS transitions** instead of JS animations when possible
6. **Optimize bundle size** - avoid importing entire libraries
7. **Lazy load components** that are below the fold
8. **Cache API responses** when appropriate
9. **Use production build** for testing performance
10. **Minimize re-renders** with React.memo() and useMemo()

---

**Need Help?** Check `DESIGN_SYSTEM.md` for full design guidelines or `UI_IMPLEMENTATION_SUMMARY.md` for detailed component documentation.
