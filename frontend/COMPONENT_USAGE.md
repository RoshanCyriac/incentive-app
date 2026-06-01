# Quick Reference Guide - Component Usage

## Button Component
```jsx
import { Button } from '../components';

// Primary action
<Button variant="primary">Save</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Ghost/transparent
<Button variant="ghost">Delete</Button>

// Icon-only
<Button variant="icon">✕</Button>

// Small size
<Button variant="primary" size="sm">Add</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With loading
<Button disabled>
  <svg className="animate-spin h-5 w-5" />
  Loading...
</Button>
```

## Input Component
```jsx
import { Input } from '../components';

// Basic input
<Input 
  label="Email" 
  name="email" 
  type="email"
  placeholder="user@example.com"
/>

// With error
<Input 
  label="Name" 
  error="Name is required"
  value={formData.name}
  onChange={handleChange}
/>

// Required field
<Input 
  label="Password" 
  name="password"
  required
/>

// Number input
<Input 
  label="Units Sold" 
  name="units"
  type="number"
  min="0"
/>
```

## Badge Component
```jsx
import { Badge } from '../components';

// Active status
<Badge status="active" label="Active" />

// Inactive status
<Badge status="inactive" label="Inactive" />

// Pending status
<Badge status="pending" label="Pending" />
```

## Modal Component
```jsx
import { Modal, Button } from '../components';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen}
  title="Confirm Delete"
  onClose={() => setIsOpen(false)}
  actions={[
    <Button 
      key="cancel" 
      variant="ghost" 
      onClick={() => setIsOpen(false)}
    >
      Cancel
    </Button>,
    <Button 
      key="confirm" 
      variant="primary" 
      onClick={handleDelete}
    >
      Delete
    </Button>,
  ]}
>
  <p>Are you sure? This action cannot be undone.</p>
</Modal>
```

## Alert Component
```jsx
import { Alert } from '../components';

// Error alert
<Alert 
  type="error" 
  title="Error" 
  message="Failed to save changes"
/>

// Warning alert
<Alert 
  type="warning" 
  title="Warning"
>
  <p>This action will affect all officers</p>
</Alert>

// Success alert
<Alert 
  type="success" 
  message="Changes saved successfully"
  onClose={handleDismiss}
/>

// Info alert
<Alert 
  type="info"
  title="Information"
  message="New month data available"
/>
```

## Toast Component
```jsx
import { Toast } from '../components';

const [toast, setToast] = useState(null);

{toast && (
  <Toast
    message={toast.message}
    type="success"
    autoClose={4000}
    onClose={() => setToast(null)}
  />
)}

// Trigger:
setToast({ message: 'Saved!' });
```

## Sidebar Component
```jsx
import { Sidebar } from '../components';

const navItems = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

const userSection = (
  <div>
    <p className="text-white font-label">{user.name}</p>
    <Button onClick={logout}>Logout</Button>
  </div>
);

<Sidebar
  isOpen={sidebarOpen}
  items={navItems}
  activeItem={activeTab}
  onItemClick={setActiveTab}
  userSection={userSection}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
/>
```

## Header Component
```jsx
import { Header } from '../components';

<Header
  title="Sales Dashboard"
  rightContent={
    <div className="flex items-center gap-4">
      <select className="input-field">
        <option>January</option>
      </select>
      <div className="w-10 h-10 bg-toyota-red rounded-full" />
    </div>
  }
/>
```

## StatCard Component
```jsx
import { StatCard } from '../components';

<StatCard
  icon="📊"
  label="Total Sales"
  value="₹1,45,000"
  trend="up"
  trendLabel="↑ 12% from last month"
/>
```

## SkeletonLoader Component
```jsx
import { SkeletonLoader } from '../components';

{loading ? (
  <SkeletonLoader rows={5} columns={4} />
) : (
  // Your actual table
)}
```

## EmptyState Component
```jsx
import { EmptyState, Button } from '../components';

{cars.length === 0 ? (
  <EmptyState
    icon="🚗"
    title="No Car Models"
    message="Create your first car model to get started."
    action={
      <Button 
        variant="primary" 
        onClick={() => setShowModal(true)}
      >
        ➕ Add Car Model
      </Button>
    }
  />
) : (
  // Your actual content
)}
```

---

## Common Patterns

### Form with Validation
```jsx
const [formData, setFormData] = useState({ name: '', email: '' });
const [errors, setErrors] = useState({});

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validate
  const newErrors = {};
  if (!formData.name) newErrors.name = 'Name required';
  if (!formData.email) newErrors.email = 'Email required';
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  // Submit
  await saveData(formData);
};

return (
  <form onSubmit={handleSubmit} className="space-y-4">
    <Input
      label="Name"
      name="name"
      value={formData.name}
      onChange={handleChange}
      error={errors.name}
      required
    />
    <Input
      label="Email"
      name="email"
      type="email"
      value={formData.email}
      onChange={handleChange}
      error={errors.email}
      required
    />
    <Button type="submit" variant="primary">Save</Button>
  </form>
);
```

### Data Table with Status
```jsx
<div className="table-container">
  <table className="w-full">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell">Name</th>
        <th className="table-header-cell">Status</th>
        <th className="table-header-cell">Actions</th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, idx) => (
        <tr 
          key={item.id}
          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-off-white'} table-row`}
        >
          <td className="table-cell">{item.name}</td>
          <td className="table-cell">
            <Badge status={item.active ? 'active' : 'inactive'} />
          </td>
          <td className="table-cell text-right">
            <Button variant="ghost" size="sm">Edit</Button>
            <Button variant="ghost" size="sm" className="text-status-error">
              Delete
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Loading State with Skeleton
```jsx
{loading ? (
  <div className="card">
    <SkeletonLoader rows={5} columns={3} />
  </div>
) : (
  <div className="card">
    {/* Your content */}
  </div>
)}
```

### Error Handling
```jsx
const [error, setError] = useState(null);

const handleFetch = async () => {
  try {
    setError(null);
    const data = await fetchData();
    // Process data
  } catch (err) {
    setError(err.message || 'An error occurred');
  }
};

return (
  <div>
    {error && (
      <Alert 
        type="error" 
        message={error}
        onClose={() => setError(null)}
      />
    )}
    {/* Rest of component */}
  </div>
);
```

---

## CSS Utility Classes

### Text
- `.font-header` - 600 weight
- `.font-label` - 500 weight
- `.font-body` - 400 weight (default)

### Colors
- `.text-toyota-red` - Toyota Red
- `.text-charcoal` - Dark text
- `.bg-toyota-red` - Toyota Red background
- `.bg-off-white` - Light gray background
- `.border-silver-gray` - Gray border

### Layout
- `.card` - White card with shadow
- `.card-lg` - Large card with more padding
- `.table-container` - Card with table styling
- `.modal-overlay` - Overlay backdrop

### States
- `.badge-active` - Green active badge
- `.badge-inactive` - Gray inactive badge
- `.badge-pending` - Amber pending badge
- `.input-error` - Red error border

### Animations
- `.fade-in` - 150ms fade-in
- `.pulse-subtle` - Subtle pulse effect
- `.shimmer` - Loading shimmer animation
- `.spinner` - Rotating spinner

---

## Tailwind Class Combinations

### Buttons
```jsx
// Primary large
className="px-4 py-2 bg-toyota-red text-white font-label rounded-md hover:bg-red-700 transition-all duration-150"

// Ghost small
className="px-3 py-1 text-charcoal hover:bg-off-white rounded-md text-sm transition-all"

// Icon
className="w-10 h-10 flex items-center justify-center hover:bg-off-white rounded-md"
```

### Cards
```jsx
// Base card
className="bg-white rounded-md p-5 shadow-card"

// Large card
className="bg-white rounded-md p-6 shadow-card"

// Hover effect
className="bg-white rounded-md p-5 shadow-card hover:shadow-lg transition-shadow"
```

### Typography
```jsx
// Header
className="text-xl font-header text-charcoal"

// Body
className="text-sm text-gray-600"

// Label
className="text-xs font-label text-gray-600"

// Small
className="text-xs text-gray-500"
```

---

## Color Reference

| Name | Value | Usage |
|------|-------|-------|
| Toyota Red | #EB0A1E | Buttons, actives, highlights |
| Charcoal | #1A1A1A | Text, sidebars |
| Off-White | #F8F8F8 | Page bg, zebra striping |
| White | #FFFFFF | Cards, surfaces |
| Silver-Gray | #C8C8C8 | Borders, dividers |
| Green (Active) | #10B981 | Active badges |
| Gray (Inactive) | #6B7280 | Inactive badges |
| Amber (Pending) | #F59E0B | Pending badges |
| Red (Error) | #EF4444 | Error states |

---

## Import All Components
```jsx
import {
  Button,
  Input,
  Badge,
  Modal,
  Alert,
  Toast,
  Sidebar,
  Header,
  StatCard,
  SkeletonLoader,
  EmptyState,
} from '../components';
```
