# Validation Rules Documentation

This document provides a comprehensive overview of all validation rules implemented in the AI Tools Platform.

## Table of Contents
- [Tools Validation](#tools-validation)
- [Categories Validation](#categories-validation)
- [Form Request Classes](#form-request-classes)
- [Custom Validation Rules](#custom-validation-rules)
- [Error Messages](#error-messages)

---

## Tools Validation

### StoreToolRequest (Creating New Tools)

**Authorization:** All authenticated users can create tools.

**Validation Rules:**

| Field | Rules | Description |
|-------|-------|-------------|
| `title` | required, string, min:3, max:255, unique | Tool title must be unique and 3-255 characters |
| `description` | required, string, min:20, max:2000 | Description must be 20-2000 characters |
| `category_id` | required, integer, exists:categories (active only) | Must reference an active category |
| `url` | nullable, url, max:500, active_url | Main tool URL (must be reachable) |
| `github_url` | nullable, url, max:500, regex (GitHub only) | Must be a valid GitHub repository URL |
| `documentation_url` | nullable, url, max:500 | Documentation/help URL |
| `thumbnail_url` | nullable, url, max:500 | Image thumbnail URL |
| `tool_type` | required, enum | One of: library, framework, api, service, application |
| `pricing_model` | required, enum | One of: free, freemium, paid, open_source |
| `status` | sometimes, enum | One of: draft, published (default: draft) |
| `tags` | required, array, min:1, max:10 | Array of tag IDs, 1-10 tags required |
| `tags.*` | integer, exists:tags | Each tag must be a valid tag ID |

**Auto-Generated Fields:**
- `slug`: Auto-generated from title using Str::slug()
- `user_id`: Set to authenticated user's ID
- `published_at`: Set to current timestamp if status is 'published'

**Custom Error Messages:**
```php
- title.required => "Please provide a title for the tool."
- title.unique => "A tool with this title already exists."
- description.min => "The description must be at least 20 characters."
- url.active_url => "The URL must be a valid, reachable website."
- github_url.regex => "Please provide a valid GitHub repository URL."
- tags.min => "Please add at least one tag."
- tags.max => "You can add a maximum of 10 tags."
```

---

### UpdateToolRequest (Updating Existing Tools)

**Authorization:** Users can update their own tools, OR owners can update any tool.

**Validation Rules:**

| Field | Rules | Description |
|-------|-------|-------------|
| `title` | sometimes, string, min:3, max:255, unique (except current) | Optional, but must be unique if provided |
| `description` | sometimes, string, min:20, max:2000 | Optional, but must meet length requirements |
| `category_id` | sometimes, integer, exists:categories (active only) | Optional category change |
| `url` | nullable, url, max:500, active_url | Optional URL update |
| `github_url` | nullable, url, max:500, regex (GitHub only) | Optional GitHub URL |
| `documentation_url` | nullable, url, max:500 | Optional documentation URL |
| `thumbnail_url` | nullable, url, max:500 | Optional thumbnail URL |
| `tool_type` | sometimes, enum | Optional: library, framework, api, service, application |
| `pricing_model` | sometimes, enum | Optional: free, freemium, paid, open_source |
| `status` | sometimes, enum | Optional: draft, published, archived |
| `tags` | sometimes, array, min:1, max:10 | Optional tags update (1-10 tags) |
| `tags.*` | integer, exists:tags | Each tag must be valid |
| `is_featured` | sometimes, boolean, prohibited (non-owners) | Only owners can feature tools |

**Auto-Updated Fields:**
- `slug`: Regenerated if title changes
- `published_at`: Set when status changes from non-published to published

**Special Rules:**
- Non-owners cannot set `is_featured` flag
- `published_at` is only set when transitioning to published status

---

## Categories Validation

### StoreCategoryRequest (Creating Categories)

**Authorization:** Only users with 'owner' role can create categories.

**Validation Rules:**

| Field | Rules | Description |
|-------|-------|-------------|
| `name` | required, string, min:2, max:100, unique | Category name (unique) |
| `description` | nullable, string, max:500 | Optional category description |
| `icon` | nullable, string, max:10, regex (emoji) | Must be a valid emoji character |
| `color` | nullable, string, regex (hex color) | Hex color code (#RRGGBB or #RGB) |
| `order` | nullable, integer, min:0 | Display order (default: 0) |
| `is_active` | sometimes, boolean | Active status (default: true) |

**Auto-Generated Fields:**
- `slug`: Auto-generated from name
- `color`: Defaults to '#3B82F6' (blue) if not provided

**Validation Patterns:**
```php
// Emoji validation
regex:/^[\x{1F300}-\x{1F9FF}]$/u

// Hex color validation
regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
```

**Examples:**
```json
{
  "name": "Frontend Development",
  "description": "Tools for frontend web development",
  "icon": "🎨",
  "color": "#3B82F6",
  "order": 1,
  "is_active": true
}
```

---

## Form Request Classes

### Overview

All Form Request classes extend `Illuminate\Foundation\Http\FormRequest` and include:

1. **Authorization Logic** (`authorize()` method)
2. **Validation Rules** (`rules()` method)
3. **Custom Error Messages** (`messages()` method)
4. **Custom Attribute Names** (`attributes()` method)
5. **Data Preparation** (`prepareForValidation()` method)

### File Locations

```
backend/app/Http/Requests/
├── StoreToolRequest.php
├── UpdateToolRequest.php
└── StoreCategoryRequest.php
```

### Usage in Controllers

```php
public function store(StoreToolRequest $request)
{
    // $request->validated() contains only validated data
    $tool = Tool::create($request->validated());

    // Attach tags
    $tool->tags()->attach($request->tags);

    return response()->json($tool, 201);
}
```

---

## Custom Validation Rules

### Built-in Laravel Rules Used

| Rule | Purpose | Example |
|------|---------|---------|
| `required` | Field must be present | `'title' => 'required'` |
| `sometimes` | Only validate if present | `'title' => 'sometimes'` |
| `nullable` | Allow null values | `'url' => 'nullable'` |
| `string` | Must be string | `'name' => 'string'` |
| `integer` | Must be integer | `'category_id' => 'integer'` |
| `boolean` | Must be boolean | `'is_active' => 'boolean'` |
| `array` | Must be array | `'tags' => 'array'` |
| `min:x` | Minimum length/value | `'title' => 'min:3'` |
| `max:x` | Maximum length/value | `'title' => 'max:255'` |
| `url` | Valid URL format | `'url' => 'url:http,https'` |
| `active_url` | URL is reachable | `'url' => 'active_url'` |
| `regex` | Regex pattern match | `'color' => 'regex:/^#.../'` |
| `unique` | Unique in database | `Rule::unique('tools', 'title')` |
| `exists` | Exists in database | `Rule::exists('categories', 'id')` |
| `in` | Value in array | `Rule::in(['draft', 'published'])` |

### Complex Validation Examples

**1. Unique with Conditions:**
```php
Rule::unique('tools', 'title')->ignore($toolId)
```

**2. Exists with Where Clause:**
```php
Rule::exists('categories', 'id')->where('is_active', true)
```

**3. Conditional Validation:**
```php
Rule::when(auth()->user()->role !== 'owner', ['prohibited'])
```

**4. GitHub URL Validation:**
```php
'regex:/^https?:\/\/(www\.)?github\.com\/.*$/'
```

**5. Hex Color Validation:**
```php
'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'
```

**6. Emoji Validation:**
```php
'regex:/^[\x{1F300}-\x{1F9FF}]$/u'
```

---

## Error Messages

### Standard Error Response Format

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "title": [
      "Please provide a title for the tool."
    ],
    "description": [
      "The description must be at least 20 characters."
    ],
    "tags": [
      "Please add at least one tag."
    ]
  }
}
```

### HTTP Status Codes

| Status | Meaning | When Used |
|--------|---------|-----------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | General validation error |
| 401 | Unauthorized | Not authenticated |
| 403 | Forbidden | Not authorized (failed `authorize()`) |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Unexpected server error |

---

## Best Practices

### 1. Always Use Form Requests
✅ **Good:**
```php
public function store(StoreToolRequest $request)
{
    $tool = Tool::create($request->validated());
}
```

❌ **Bad:**
```php
public function store(Request $request)
{
    $request->validate([...]);  // Inline validation
}
```

### 2. Use prepareForValidation()
Automatically format data before validation:
```php
protected function prepareForValidation(): void
{
    $this->merge([
        'slug' => Str::slug($this->title),
        'user_id' => auth()->id(),
    ]);
}
```

### 3. Provide Clear Error Messages
```php
public function messages(): array
{
    return [
        'title.required' => 'Please provide a title for the tool.',
        'title.unique' => 'A tool with this title already exists.',
    ];
}
```

### 4. Use Rule Objects for Complex Validation
```php
use Illuminate\Validation\Rule;

'category_id' => [
    'required',
    Rule::exists('categories', 'id')->where('is_active', true),
]
```

### 5. Implement Authorization in Form Requests
```php
public function authorize(): bool
{
    return auth()->check() && auth()->user()->role === 'owner';
}
```

---

## Testing Validation Rules

### Example Test Cases

**Test Valid Tool Creation:**
```php
$response = $this->postJson('/api/tools', [
    'title' => 'ChatGPT',
    'description' => 'AI-powered chatbot for various tasks...',
    'category_id' => 1,
    'url' => 'https://chat.openai.com',
    'tool_type' => 'service',
    'pricing_model' => 'freemium',
    'tags' => [1, 2, 3],
]);

$response->assertStatus(201);
```

**Test Validation Failure:**
```php
$response = $this->postJson('/api/tools', [
    'title' => 'AB', // Too short
    'description' => 'Short', // Too short
]);

$response->assertStatus(422)
         ->assertJsonValidationErrors(['title', 'description']);
```

---

## Summary

**Total Validation Rules Implemented:**
- **StoreToolRequest:** 13 fields, 30+ validation rules
- **UpdateToolRequest:** 14 fields, 30+ validation rules
- **StoreCategoryRequest:** 6 fields, 15+ validation rules

**Key Features:**
✅ Comprehensive field validation
✅ Custom error messages
✅ Auto-generated fields (slugs, timestamps)
✅ Role-based authorization
✅ URL validation (including GitHub-specific)
✅ Complex regex patterns (hex colors, emojis)
✅ Array validation (tags)
✅ Conditional rules (owner-only features)
✅ Unique constraints with exceptions
✅ Exists checks with conditions

This validation structure ensures data integrity, security, and excellent user experience with clear error messages.
